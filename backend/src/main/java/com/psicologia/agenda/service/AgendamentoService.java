package com.psicologia.agenda.service;

import com.psicologia.agenda.dto.*;
import com.psicologia.agenda.exception.HorarioIndisponivelException;
import com.psicologia.agenda.exception.RecursoNaoEncontradoException;
import com.psicologia.agenda.model.Agendamento;
import com.psicologia.agenda.model.Disponibilidade;
import com.psicologia.agenda.model.StatusAgendamento;
import com.psicologia.agenda.repository.AgendamentoRepository;
import com.psicologia.agenda.repository.DisponibilidadeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AgendamentoService {

    private final AgendamentoRepository agendamentoRepository;
    private final DisponibilidadeRepository disponibilidadeRepository;
    private final Random random = new Random();

    // Grade padrão de horários da clínica alinhada rigorosamente com a landing page (index.html)
    public static final List<String> HORARIOS_PADRAO = List.of(
        "08:30", "09:30", "10:30", "11:30",
        "13:30", "14:30", "15:30", "16:30", "17:30",
        "18:30", "19:30", "20:30"
    );

    public AgendamentoService(AgendamentoRepository agendamentoRepository,
                              DisponibilidadeRepository disponibilidadeRepository) {
        this.agendamentoRepository = agendamentoRepository;
        this.disponibilidadeRepository = disponibilidadeRepository;
    }

    /**
     * Retorna a disponibilidade de um dia específico.
     * Se os slots daquele dia ainda não estiverem na base e for dia útil/sábado, inicializa automaticamente.
     */
    @Transactional
    public DiaDisponibilidadeResponse obterDisponibilidadeDia(LocalDate data) {
        garantirSlotsParaData(data);

        List<Disponibilidade> slots = disponibilidadeRepository.findByDataOrderByHorarioAsc(data);
        List<HorarioSlotResponse> horariosDto = slots.stream()
            .map(HorarioSlotResponse::fromEntity)
            .toList();

        int total = slots.size();
        int livres = (int) slots.stream().filter(Disponibilidade::isDisponivel).count();

        return new DiaDisponibilidadeResponse(data, total, livres, livres > 0, horariosDto);
    }

    /**
     * Retorna a disponibilidade de todos os dias de um determinado mês.
     */
    @Transactional
    public List<DiaDisponibilidadeResponse> obterDisponibilidadeMes(int ano, int mes) {
        YearMonth ym = YearMonth.of(ano, mes);
        LocalDate inicio = ym.atDay(1);
        LocalDate fim = ym.atEndOfMonth();

        // Garante slots para cada dia do mês (segunda a sábado)
        LocalDate cur = inicio;
        while (!cur.isAfter(fim)) {
            if (cur.getDayOfWeek() != DayOfWeek.SUNDAY) {
                garantirSlotsParaData(cur);
            }
            cur = cur.plusDays(1);
        }

        List<Disponibilidade> todosSlots = disponibilidadeRepository.findByDataBetweenOrderByDataAscHorarioAsc(inicio, fim);
        Map<LocalDate, List<Disponibilidade>> agrupado = todosSlots.stream()
            .collect(Collectors.groupingBy(Disponibilidade::getData, TreeMap::new, Collectors.toList()));

        List<DiaDisponibilidadeResponse> resultado = new ArrayList<>();
        agrupado.forEach((dia, slots) -> {
            int total = slots.size();
            int livres = (int) slots.stream().filter(Disponibilidade::isDisponivel).count();
            List<HorarioSlotResponse> horariosDto = slots.stream()
                .map(HorarioSlotResponse::fromEntity)
                .toList();
            resultado.add(new DiaDisponibilidadeResponse(dia, total, livres, livres > 0, horariosDto));
        });

        return resultado;
    }

    /**
     * Cria um novo agendamento com reserva atômica de vaga no banco de dados.
     */
    @Transactional
    public AgendamentoResponse criarAgendamento(CriarAgendamentoRequest request) {
        LocalDate hoje = LocalDate.now();
        if (request.dataConsulta().isBefore(hoje)) {
            throw new HorarioIndisponivelException("Não é permitido agendar em datas passadas.");
        }

        // Verifica se a clínica atende aos domingos
        if (request.dataConsulta().getDayOfWeek() == DayOfWeek.SUNDAY) {
            throw new HorarioIndisponivelException("A clínica não possui atendimento aos domingos.");
        }

        // Verifica turno noturno aos sábados
        if (request.dataConsulta().getDayOfWeek() == DayOfWeek.SATURDAY && "noite".equals(determinarTurno(request.horario()))) {
            throw new HorarioIndisponivelException("Aos sábados a clínica encerra os atendimentos às 18:00.");
        }

        garantirSlotsParaData(request.dataConsulta());

        // Busca o slot no banco
        Disponibilidade slot = disponibilidadeRepository.findByDataAndHorario(request.dataConsulta(), request.horario())
            .orElseThrow(() -> new HorarioIndisponivelException("Horário selecionado (" + request.horario() + ") não existe na grade clínica."));

        if (!slot.isDisponivel()) {
            throw new HorarioIndisponivelException("O horário das " + request.horario() + " em " + 
                request.dataConsulta().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")) + 
                " já foi preenchido por outro paciente. Por favor selecione outro horário.");
        }

        // Verifica duplicidade no repositório de agendamentos
        boolean jaExiste = agendamentoRepository.existsByDataConsultaAndHorarioAndStatusNot(
            request.dataConsulta(), request.horario(), StatusAgendamento.CANCELADO
        );
        if (jaExiste) {
            slot.setDisponivel(false);
            disponibilidadeRepository.save(slot);
            throw new HorarioIndisponivelException("Conflito de agenda: Este horário já possui agendamento confirmado.");
        }

        // Gera protocolo único: PSI-YYYYMMDD-XXXX
        String sufixo = String.format("%04d", random.nextInt(10000));
        String protocolo = "PSI-" + request.dataConsulta().format(DateTimeFormatter.BASIC_ISO_DATE) + "-" + sufixo;

        // Atualiza a vaga no banco como preenchida
        slot.setDisponivel(false);
        slot.setReservadoPorProtocolo(protocolo);
        disponibilidadeRepository.save(slot);

        // Cria o registro de agendamento
        Agendamento agendamento = new Agendamento();
        agendamento.setProtocolo(protocolo);
        agendamento.setNome(request.nome().trim());
        agendamento.setTelefone(request.telefone().trim());
        agendamento.setEmail(request.email().trim().toLowerCase());
        agendamento.setModalidade(request.modalidade().trim().toLowerCase());
        agendamento.setFoco(request.foco().trim());
        agendamento.setDataConsulta(request.dataConsulta());
        agendamento.setHorario(request.horario());
        agendamento.setNotas(request.notas());
        agendamento.setStatus(StatusAgendamento.PENDENTE_48H);
        agendamento.setLembrete48hEnviado(false);

        Agendamento salvo = agendamentoRepository.save(agendamento);
        return AgendamentoResponse.fromEntity(salvo);
    }

    /**
     * Lista todos os agendamentos cadastrados.
     */
    @Transactional(readOnly = true)
    public List<AgendamentoResponse> listarTodos() {
        return agendamentoRepository.findAllByOrderByDataConsultaAscHorarioAsc().stream()
            .map(AgendamentoResponse::fromEntity)
            .toList();
    }

    /**
     * Busca agendamento por protocolo.
     */
    @Transactional(readOnly = true)
    public AgendamentoResponse buscarPorProtocolo(String protocolo) {
        Agendamento a = agendamentoRepository.findByProtocolo(protocolo)
            .orElseThrow(() -> new RecursoNaoEncontradoException("Agendamento não encontrado para o protocolo: " + protocolo));
        return AgendamentoResponse.fromEntity(a);
    }

    /**
     * Atualiza o status do agendamento e sincroniza a disponibilidade da vaga.
     */
    @Transactional
    public AgendamentoResponse atualizarStatus(Long id, StatusAgendamento novoStatus) {
        Agendamento a = agendamentoRepository.findById(id)
            .orElseThrow(() -> new RecursoNaoEncontradoException("Agendamento #" + id + " não localizado."));

        StatusAgendamento statusAnterior = a.getStatus();
        a.setStatus(novoStatus);

        // Se foi cancelado, libera a vaga na tabela de disponibilidades
        if (novoStatus == StatusAgendamento.CANCELADO && statusAnterior != StatusAgendamento.CANCELADO) {
            disponibilidadeRepository.findByDataAndHorario(a.getDataConsulta(), a.getHorario())
                .ifPresent(slot -> {
                    slot.setDisponivel(true);
                    slot.setReservadoPorProtocolo(null);
                    disponibilidadeRepository.save(slot);
                });
        }
        // Se estava cancelado e foi reativado, tenta reocupar a vaga
        else if (statusAnterior == StatusAgendamento.CANCELADO && novoStatus != StatusAgendamento.CANCELADO) {
            disponibilidadeRepository.findByDataAndHorario(a.getDataConsulta(), a.getHorario())
                .ifPresent(slot -> {
                    slot.setDisponivel(false);
                    slot.setReservadoPorProtocolo(a.getProtocolo());
                    disponibilidadeRepository.save(slot);
                });
        }

        Agendamento salvo = agendamentoRepository.save(a);
        return AgendamentoResponse.fromEntity(salvo);
    }

    /**
     * Marca o lembrete de confirmação de 48h/24h como disparado.
     */
    @Transactional
    public AgendamentoResponse registrarDisparoLembrete(Long id) {
        Agendamento a = agendamentoRepository.findById(id)
            .orElseThrow(() -> new RecursoNaoEncontradoException("Agendamento #" + id + " não localizado."));

        a.setLembrete48hEnviado(true);
        a.setLembreteDisparadoEm(LocalDateTime.now());
        Agendamento salvo = agendamentoRepository.save(a);
        return AgendamentoResponse.fromEntity(salvo);
    }

    /**
     * Exclui o agendamento e libera a vaga associada no banco de dados.
     */
    @Transactional
    public void excluirAgendamento(Long id) {
        Agendamento a = agendamentoRepository.findById(id)
            .orElseThrow(() -> new RecursoNaoEncontradoException("Agendamento #" + id + " não localizado."));

        disponibilidadeRepository.findByDataAndHorario(a.getDataConsulta(), a.getHorario())
            .ifPresent(slot -> {
                slot.setDisponivel(true);
                slot.setReservadoPorProtocolo(null);
                disponibilidadeRepository.save(slot);
            });

        agendamentoRepository.delete(a);
    }

    /**
     * Estatísticas gerais para o painel administrativo.
     */
    @Transactional(readOnly = true)
    public EstatisticasResponse obterEstatisticas() {
        long total = agendamentoRepository.count();
        long pendentes = agendamentoRepository.countByStatus(StatusAgendamento.PENDENTE_48H);
        long confirmados = agendamentoRepository.countByStatus(StatusAgendamento.CONFIRMADO);
        long concluidos = agendamentoRepository.countByStatus(StatusAgendamento.CONCLUIDO);
        long cancelados = agendamentoRepository.countByStatus(StatusAgendamento.CANCELADO);
        long vagasLivres = disponibilidadeRepository.findProximasDisponiveis(LocalDate.now()).size();

        return new EstatisticasResponse(total, pendentes, confirmados, concluidos, cancelados, vagasLivres);
    }

    /**
     * Garante que os slots padrão existam para uma determinada data (segunda a sábado).
     */
    private void garantirSlotsParaData(LocalDate data) {
        if (data.getDayOfWeek() == DayOfWeek.SUNDAY) {
            return;
        }

        List<Disponibilidade> existentes = disponibilidadeRepository.findByDataOrderByHorarioAsc(data);
        if (!existentes.isEmpty()) {
            return;
        }

        LocalDate hoje = LocalDate.now();
        boolean ehSabado = data.getDayOfWeek() == DayOfWeek.SATURDAY;
        List<Disponibilidade> novosSlots = new ArrayList<>();

        for (String h : HORARIOS_PADRAO) {
            String turno = determinarTurno(h);
            // Sábados não possuem atendimento noturno
            if (ehSabado && "noite".equals(turno)) {
                continue;
            }
            // Se a data já passou, marca como não disponível
            boolean disponivel = !data.isBefore(hoje);
            novosSlots.add(new Disponibilidade(data, h, turno, disponivel));
        }

        disponibilidadeRepository.saveAll(novosSlots);
    }

    private String determinarTurno(String horario) {
        int hora = Integer.parseInt(horario.split(":")[0]);
        if (hora < 12) return "manha";
        if (hora < 18) return "tarde";
        return "noite";
    }
}
