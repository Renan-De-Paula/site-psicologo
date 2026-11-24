package com.psicologia.agenda;

import com.psicologia.agenda.dto.AgendamentoResponse;
import com.psicologia.agenda.dto.CriarAgendamentoRequest;
import com.psicologia.agenda.dto.DiaDisponibilidadeResponse;
import com.psicologia.agenda.exception.HorarioIndisponivelException;
import com.psicologia.agenda.model.Disponibilidade;
import com.psicologia.agenda.model.StatusAgendamento;
import com.psicologia.agenda.repository.DisponibilidadeRepository;
import com.psicologia.agenda.service.AgendamentoService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
class AgendamentoServiceTest {

    @Autowired
    private AgendamentoService agendamentoService;

    @Autowired
    private DisponibilidadeRepository disponibilidadeRepository;

    @Test
    @DisplayName("Deve agendar com sucesso e marcar o horário no banco como indisponível")
    void deveAgendarComSucesso() {
        LocalDate dataTeste = LocalDate.now().plusDays(5);
        if (dataTeste.getDayOfWeek() == DayOfWeek.SUNDAY) {
            dataTeste = dataTeste.plusDays(1);
        }

        CriarAgendamentoRequest req = new CriarAgendamentoRequest(
            "Juliana Paes",
            "(11) 99887-7665",
            "juliana@teste.com",
            "online",
            "Ansiedade & Autocuidado",
            dataTeste,
            "14:30",
            "Primeira consulta terapêutica"
        );

        AgendamentoResponse resp = agendamentoService.criarAgendamento(req);

        assertNotNull(resp);
        assertNotNull(resp.id());
        assertTrue(resp.protocolo().startsWith("PSI-"));
        assertEquals("Juliana Paes", resp.nome());
        assertEquals(StatusAgendamento.PENDENTE_48H, resp.status());

        // Verifica no banco se a vaga foi preenchida
        Disponibilidade slot = disponibilidadeRepository.findByDataAndHorario(dataTeste, "14:30").orElseThrow();
        assertFalse(slot.isDisponivel(), "O slot no banco deve estar marcado como indisponivel");
        assertEquals(resp.protocolo(), slot.getReservadoPorProtocolo());
    }

    @Test
    @DisplayName("Deve lançar HorarioIndisponivelException ao tentar agendar slot já reservado")
    void deveBloquearDuplicidadeDeHorario() {
        LocalDate dataTeste = LocalDate.now().plusDays(7);
        if (dataTeste.getDayOfWeek() == DayOfWeek.SUNDAY) {
            dataTeste = dataTeste.plusDays(1);
        }

        CriarAgendamentoRequest req1 = new CriarAgendamentoRequest(
            "Paciente Um",
            "(11) 91111-2222",
            "paciente1@teste.com",
            "online",
            "Foco Um",
            dataTeste,
            "09:30",
            null
        );

        agendamentoService.criarAgendamento(req1);

        CriarAgendamentoRequest req2 = new CriarAgendamentoRequest(
            "Paciente Dois",
            "(11) 93333-4444",
            "paciente2@teste.com",
            "presencial",
            "Foco Dois",
            dataTeste,
            "09:30",
            null
        );

        assertThrows(HorarioIndisponivelException.class, () -> {
            agendamentoService.criarAgendamento(req2);
        });
    }

    @Test
    @DisplayName("Ao cancelar agendamento, o horário deve voltar a ficar disponível no banco")
    void deveLiberarHorarioAoCancelar() {
        LocalDate dataTeste = LocalDate.now().plusDays(10);
        if (dataTeste.getDayOfWeek() == DayOfWeek.SUNDAY) {
            dataTeste = dataTeste.plusDays(1);
        }

        CriarAgendamentoRequest req = new CriarAgendamentoRequest(
            "Paciente Para Cancelar",
            "(11) 95555-6666",
            "cancela@teste.com",
            "online",
            "Burnout",
            dataTeste,
            "17:30",
            null
        );

        AgendamentoResponse agendado = agendamentoService.criarAgendamento(req);
        
        // Slot agora está ocupado
        Disponibilidade slotOcupado = disponibilidadeRepository.findByDataAndHorario(dataTeste, "17:30").orElseThrow();
        assertFalse(slotOcupado.isDisponivel());

        // Cancela o agendamento
        agendamentoService.atualizarStatus(agendado.id(), StatusAgendamento.CANCELADO);

        // Slot deve estar livre novamente no banco
        Disponibilidade slotLiberado = disponibilidadeRepository.findByDataAndHorario(dataTeste, "17:30").orElseThrow();
        assertTrue(slotLiberado.isDisponivel(), "O slot deve voltar a ficar disponível após cancelamento");
    }

    @Test
    @DisplayName("Deve consultar disponibilidade do dia com grade de horários")
    void deveConsultarDisponibilidadeDia() {
        LocalDate dataTeste = LocalDate.now().plusDays(4);
        if (dataTeste.getDayOfWeek() == DayOfWeek.SUNDAY) {
            dataTeste = dataTeste.plusDays(1);
        }

        DiaDisponibilidadeResponse dia = agendamentoService.obterDisponibilidadeDia(dataTeste);

        assertNotNull(dia);
        assertEquals(dataTeste, dia.data());
        assertTrue(dia.totalVagas() > 0);
        assertFalse(dia.horarios().isEmpty());
    }
}
