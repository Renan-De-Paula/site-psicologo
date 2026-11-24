package com.psicologia.agenda.dto;

public record EstatisticasResponse(
    long totalAgendamentos,
    long pendentes48h,
    long confirmados,
    long concluidos,
    long cancelados,
    long vagasDisponiveisProximosDias
) {}
