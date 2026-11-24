package com.psicologia.agenda.config;

import com.psicologia.agenda.model.Agendamento;
import com.psicologia.agenda.model.Disponibilidade;
import com.psicologia.agenda.model.StatusAgendamento;
import com.psicologia.agenda.repository.AgendamentoRepository;
import com.psicologia.agenda.repository.DisponibilidadeRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final DisponibilidadeRepository disponibilidadeRepository;
    private final AgendamentoRepository agendamentoRepository;

    private static final List<String> HORARIOS = List.of(
        "08:30", "09:30", "10:30", "11:30",
        "13:30", "14:30", "15:30", "16:30", "17:30",
        "18:30", "19:30", "20:30"
    );

    public DataInitializer(DisponibilidadeRepository disponibilidadeRepository,
                           AgendamentoRepository agendamentoRepository) {
        this.disponibilidadeRepository = disponibilidadeRepository;
        this.agendamentoRepository = agendamentoRepository;
    }

    @Override
    public void run(String... args) {
        log.info("Inicializando grade clínica no banco de dados H2...");

        LocalDate hoje = LocalDate.now();
        LocalDate limite = hoje.plusMonths(2);

        List<Disponibilidade> slotsParaSalvar = new ArrayList<>();
        LocalDate cur = hoje;

        while (!cur.isAfter(limite)) {
            if (cur.getDayOfWeek() != DayOfWeek.SUNDAY) {
                boolean ehSabado = cur.getDayOfWeek() == DayOfWeek.SATURDAY;
                for (String h : HORARIOS) {
                    int hora = Integer.parseInt(h.split(":")[0]);
                    String turno = (hora < 12) ? "manha" : (hora < 18) ? "tarde" : "noite";
                    if (ehSabado && "noite".equals(turno)) {
                        continue;
                    }
                    if (disponibilidadeRepository.findByDataAndHorario(cur, h).isEmpty()) {
                        slotsParaSalvar.add(new Disponibilidade(cur, h, turno, true));
                    }
                }
            }
            cur = cur.plusDays(1);
        }

        if (!slotsParaSalvar.isEmpty()) {
            disponibilidadeRepository.saveAll(slotsParaSalvar);
            log.info("Grade clínica gerada: {} slots de atendimento persistidos.", slotsParaSalvar.size());
        }

        // Se a base de agendamentos estiver vazia, cria 2 exemplos realistas para validação
        if (agendamentoRepository.count() == 0) {
            LocalDate dataExemplo1 = hoje.plusDays(2);
            if (dataExemplo1.getDayOfWeek() == DayOfWeek.SUNDAY) {
                dataExemplo1 = dataExemplo1.plusDays(1);
            }

            Agendamento ex1 = new Agendamento();
            ex1.setProtocolo("PSI-DEMO-0001");
            ex1.setNome("Mariana Souza Costa");
            ex1.setTelefone("(11) 98765-4321");
            ex1.setEmail("mariana.costa@email.com");
            ex1.setModalidade("online");
            ex1.setFoco("Ansiedade & Burnout");
            ex1.setDataConsulta(dataExemplo1);
            ex1.setHorario("14:30");
            ex1.setNotas("Relata crises de pânico leves ao final do expediente de trabalho.");
            ex1.setStatus(StatusAgendamento.PENDENTE_48H);
            ex1.setLembrete48hEnviado(false);
            ex1.setCriadoEm(LocalDateTime.now().minusHours(4));
            agendamentoRepository.save(ex1);

            // Marca o slot como ocupado
            disponibilidadeRepository.findByDataAndHorario(dataExemplo1, "14:30").ifPresent(slot -> {
                slot.setDisponivel(false);
                slot.setReservadoPorProtocolo("PSI-DEMO-0001");
                disponibilidadeRepository.save(slot);
            });

            LocalDate dataExemplo2 = hoje.plusDays(3);
            if (dataExemplo2.getDayOfWeek() == DayOfWeek.SUNDAY) {
                dataExemplo2 = dataExemplo2.plusDays(1);
            }

            Agendamento ex2 = new Agendamento();
            ex2.setProtocolo("PSI-DEMO-0002");
            ex2.setNome("Carlos Eduardo Martins");
            ex2.setTelefone("(11) 97123-8899");
            ex2.setEmail("carlos.martins@email.com");
            ex2.setModalidade("presencial");
            ex2.setFoco("Transição de Carreira & Autoestima");
            ex2.setDataConsulta(dataExemplo2);
            ex2.setHorario("10:30");
            ex2.setNotas("Primeira sessão presencial em consultório.");
            ex2.setStatus(StatusAgendamento.CONFIRMADO);
            ex2.setLembrete48hEnviado(true);
            ex2.setCriadoEm(LocalDateTime.now().minusDays(1));
            ex2.setLembreteDisparadoEm(LocalDateTime.now().minusHours(12));
            agendamentoRepository.save(ex2);

            log.info("Agendamentos de demonstração inicializados com sucesso.");
        }
    }
}
