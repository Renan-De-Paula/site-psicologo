package com.psicologia.agenda.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Entidade que armazena a grade de horários do psicólogo.
 * Representa cada slot de consulta (ex: 2026-11-23 09:00).
 */
@Entity
@Table(
    name = "disponibilidades",
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_data_horario", columnNames = {"data", "horario"})
    },
    indexes = {
        @Index(name = "idx_disp_data", columnList = "data"),
        @Index(name = "idx_disp_disponivel", columnList = "disponivel")
    }
)
public class Disponibilidade {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDate data;

    @Column(nullable = false, length = 10)
    private String horario; // formato HH:mm, ex: "09:00"

    @Column(nullable = false, length = 20)
    private String turno; // manha, tarde, noite

    @Column(nullable = false)
    private boolean disponivel = true;

    @Column(length = 50)
    private String reservadoPorProtocolo;

    @Column(nullable = false)
    private LocalDateTime atualizadoEm;

    public Disponibilidade() {
        this.atualizadoEm = LocalDateTime.now();
    }

    public Disponibilidade(LocalDate data, String horario, String turno, boolean disponivel) {
        this.data = data;
        this.horario = horario;
        this.turno = turno;
        this.disponivel = disponivel;
        this.atualizadoEm = LocalDateTime.now();
    }

    @PrePersist
    @PreUpdate
    public void onUpdate() {
        this.atualizadoEm = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LocalDate getData() {
        return data;
    }

    public void setData(LocalDate data) {
        this.data = data;
    }

    public String getHorario() {
        return horario;
    }

    public void setHorario(String horario) {
        this.horario = horario;
    }

    public String getTurno() {
        return turno;
    }

    public void setTurno(String turno) {
        this.turno = turno;
    }

    public boolean isDisponivel() {
        return disponivel;
    }

    public void setDisponivel(boolean disponivel) {
        this.disponivel = disponivel;
    }

    public String getReservadoPorProtocolo() {
        return reservadoPorProtocolo;
    }

    public void setReservadoPorProtocolo(String reservadoPorProtocolo) {
        this.reservadoPorProtocolo = reservadoPorProtocolo;
    }

    public LocalDateTime getAtualizadoEm() {
        return atualizadoEm;
    }

    public void setAtualizadoEm(LocalDateTime atualizadoEm) {
        this.atualizadoEm = atualizadoEm;
    }
}
