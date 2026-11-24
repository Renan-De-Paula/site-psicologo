package com.psicologia.agenda.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Entidade que armazena a reserva realizada pelo paciente.
 */
@Entity
@Table(
    name = "agendamentos",
    indexes = {
        @Index(name = "idx_agend_data", columnList = "dataConsulta"),
        @Index(name = "idx_agend_protocolo", columnList = "protocolo", unique = true),
        @Index(name = "idx_agend_status", columnList = "status")
    }
)
public class Agendamento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 60)
    private String protocolo;

    @Column(nullable = false, length = 120)
    private String nome;

    @Column(nullable = false, length = 30)
    private String telefone;

    @Column(nullable = false, length = 120)
    private String email;

    @Column(nullable = false, length = 30)
    private String modalidade; // online, presencial

    @Column(nullable = false, length = 60)
    private String foco; // ansiedade, depressao, trauma, etc.

    @Column(nullable = false)
    private LocalDate dataConsulta;

    @Column(nullable = false, length = 10)
    private String horario;

    @Column(columnDefinition = "TEXT")
    private String notas;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private StatusAgendamento status = StatusAgendamento.PENDENTE_48H;

    @Column(nullable = false)
    private boolean lembrete48hEnviado = false;

    @Column(nullable = false)
    private LocalDateTime criadoEm;

    private LocalDateTime lembreteDisparadoEm;

    public Agendamento() {
        this.criadoEm = LocalDateTime.now();
    }

    @PrePersist
    public void onCreate() {
        if (this.criadoEm == null) {
            this.criadoEm = LocalDateTime.now();
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getProtocolo() {
        return protocolo;
    }

    public void setProtocolo(String protocolo) {
        this.protocolo = protocolo;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getTelefone() {
        return telefone;
    }

    public void setTelefone(String telefone) {
        this.telefone = telefone;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getModalidade() {
        return modalidade;
    }

    public void setModalidade(String modalidade) {
        this.modalidade = modalidade;
    }

    public String getFoco() {
        return foco;
    }

    public void setFoco(String foco) {
        this.foco = foco;
    }

    public LocalDate getDataConsulta() {
        return dataConsulta;
    }

    public void setDataConsulta(LocalDate dataConsulta) {
        this.dataConsulta = dataConsulta;
    }

    public String getHorario() {
        return horario;
    }

    public void setHorario(String horario) {
        this.horario = horario;
    }

    public String getNotas() {
        return notas;
    }

    public void setNotas(String notas) {
        this.notas = notas;
    }

    public StatusAgendamento getStatus() {
        return status;
    }

    public void setStatus(StatusAgendamento status) {
        this.status = status;
    }

    public boolean isLembrete48hEnviado() {
        return lembrete48hEnviado;
    }

    public void setLembrete48hEnviado(boolean lembrete48hEnviado) {
        this.lembrete48hEnviado = lembrete48hEnviado;
    }

    public LocalDateTime getCriadoEm() {
        return criadoEm;
    }

    public void setCriadoEm(LocalDateTime criadoEm) {
        this.criadoEm = criadoEm;
    }

    public LocalDateTime getLembreteDisparadoEm() {
        return lembreteDisparadoEm;
    }

    public void setLembreteDisparadoEm(LocalDateTime lembreteDisparadoEm) {
        this.lembreteDisparadoEm = lembreteDisparadoEm;
    }
}
