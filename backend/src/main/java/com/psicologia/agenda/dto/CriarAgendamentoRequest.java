package com.psicologia.agenda.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

/**
 * DTO Imutável para criação de agendamento (Java 21 Record).
 */
public record CriarAgendamentoRequest(
    @NotBlank(message = "O nome completo é obrigatório")
    @Size(min = 3, max = 120, message = "O nome deve ter entre 3 e 120 caracteres")
    String nome,

    @NotBlank(message = "O telefone / WhatsApp é obrigatório")
    @Size(min = 10, max = 25, message = "Telefone inválido")
    String telefone,

    @NotBlank(message = "O e-mail é obrigatório")
    @Email(message = "Formato de e-mail inválido")
    String email,

    @NotBlank(message = "A modalidade é obrigatória")
    @Pattern(regexp = "^(online|presencial)$", message = "Modalidade deve ser 'online' ou 'presencial'")
    String modalidade,

    @NotBlank(message = "O foco da consulta é obrigatório")
    String foco,

    @NotNull(message = "A data da consulta é obrigatória")
    LocalDate dataConsulta,

    @NotBlank(message = "O horário é obrigatório")
    @Pattern(regexp = "^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$", message = "Formato de horário deve ser HH:mm")
    String horario,

    String notas
) {}
