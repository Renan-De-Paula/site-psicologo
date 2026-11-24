package com.psicologia.agenda.dto;

import com.psicologia.agenda.model.Agendamento;
import com.psicologia.agenda.model.StatusAgendamento;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Resposta de agendamento serializada para os clientes web e administrativo.
 */
public record AgendamentoResponse(
    Long id,
    String protocolo,
    String nome,
    String telefone,
    String email,
    String modalidade,
    String foco,
    LocalDate dataConsulta,
    String horario,
    String notas,
    StatusAgendamento status,
    String statusDescricao,
    boolean lembrete48hEnviado,
    LocalDateTime criadoEm,
    LocalDateTime lembreteDisparadoEm
) {
    public static AgendamentoResponse fromEntity(Agendamento a) {
        return new AgendamentoResponse(
            a.getId(),
            a.getProtocolo(),
            a.getNome(),
            a.getTelefone(),
            a.getEmail(),
            a.getModalidade(),
            a.getFoco(),
            a.getDataConsulta(),
            a.getHorario(),
            a.getNotas(),
            a.getStatus(),
            a.getStatus().getDescricao(),
            a.isLembrete48hEnviado(),
            a.getCriadoEm(),
            a.getLembreteDisparadoEm()
        );
    }
}
