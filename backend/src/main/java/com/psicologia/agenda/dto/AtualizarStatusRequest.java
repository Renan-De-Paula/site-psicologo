package com.psicologia.agenda.dto;

import com.psicologia.agenda.model.StatusAgendamento;
import jakarta.validation.constraints.NotNull;

public record AtualizarStatusRequest(
    @NotNull(message = "O novo status é obrigatório")
    StatusAgendamento status
) {}
