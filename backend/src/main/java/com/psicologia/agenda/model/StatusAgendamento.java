package com.psicologia.agenda.model;

/**
 * Status do ciclo de vida de um agendamento clínico.
 */
public enum StatusAgendamento {
    PENDENTE_48H("Pendente Confirmação 48h"),
    CONFIRMADO("Confirmado"),
    CONCLUIDO("Consulta Realizada"),
    CANCELADO("Cancelado");

    private final String descricao;

    StatusAgendamento(String descricao) {
        this.descricao = descricao;
    }

    public String getDescricao() {
        return descricao;
    }
}
