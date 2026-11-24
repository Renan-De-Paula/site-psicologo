package com.psicologia.agenda.dto;

import com.psicologia.agenda.model.Disponibilidade;

/**
 * Resposta de slot de horário individual.
 */
public record HorarioSlotResponse(
    Long id,
    String horario,
    String turno,
    boolean disponivel,
    String reservadoPorProtocolo
) {
    public static HorarioSlotResponse fromEntity(Disponibilidade d) {
        return new HorarioSlotResponse(
            d.getId(),
            d.getHorario(),
            d.getTurno(),
            d.isDisponivel(),
            d.getReservadoPorProtocolo()
        );
    }
}
