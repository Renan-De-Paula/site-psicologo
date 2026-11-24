package com.psicologia.agenda.dto;

import java.time.LocalDate;
import java.util.List;

/**
 * Resposta de disponibilidade por dia com resumo de vagas.
 */
public record DiaDisponibilidadeResponse(
    LocalDate data,
    int totalVagas,
    int vagasLivres,
    boolean temVagas,
    List<HorarioSlotResponse> horarios
) {}
