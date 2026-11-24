package com.psicologia.agenda.controller;

import com.psicologia.agenda.dto.*;
import com.psicologia.agenda.service.AgendamentoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/agendamentos")
@CrossOrigin(
    origins = "*",
    allowedHeaders = "*",
    methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PATCH, RequestMethod.DELETE, RequestMethod.OPTIONS}
)
public class AgendamentoController {

    private final AgendamentoService agendamentoService;

    public AgendamentoController(AgendamentoService agendamentoService) {
        this.agendamentoService = agendamentoService;
    }

    /**
     * Health check simples para verificar se a API Spring Boot está ativa.
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        return ResponseEntity.ok(Map.of(
            "status", "UP",
            "servico", "Agenda Psicologia API",
            "versao", "2.0.0",
            "timestamp", System.currentTimeMillis()
        ));
    }

    /**
     * Realiza o agendamento de uma nova consulta com trava atômica no banco.
     */
    @PostMapping
    public ResponseEntity<AgendamentoResponse> criar(@Valid @RequestBody CriarAgendamentoRequest request) {
        AgendamentoResponse criado = agendamentoService.criarAgendamento(request);
        URI location = URI.create("/api/agendamentos/" + criado.protocolo());
        return ResponseEntity.created(location).body(criado);
    }

    /**
     * Lista todos os agendamentos cadastrados (usado no painel do psicólogo).
     */
    @GetMapping
    public ResponseEntity<List<AgendamentoResponse>> listar() {
        return ResponseEntity.ok(agendamentoService.listarTodos());
    }

    /**
     * Busca dados detalhados de um agendamento pelo número do protocolo.
     */
    @GetMapping("/{protocolo}")
    public ResponseEntity<AgendamentoResponse> buscarPorProtocolo(@PathVariable String protocolo) {
        return ResponseEntity.ok(agendamentoService.buscarPorProtocolo(protocolo));
    }

    /**
     * Atualiza o status de um agendamento (ex: CONFIRMADO, CANCELADO).
     */
    @PatchMapping("/{id}/status")
    public ResponseEntity<AgendamentoResponse> atualizarStatus(
        @PathVariable Long id,
        @Valid @RequestBody AtualizarStatusRequest request
    ) {
        return ResponseEntity.ok(agendamentoService.atualizarStatus(id, request.status()));
    }

    /**
     * Registra o envio da mensagem de lembrete 48h / confirmação via WhatsApp.
     */
    @PostMapping("/{id}/lembrete")
    public ResponseEntity<AgendamentoResponse> registrarLembrete(@PathVariable Long id) {
        return ResponseEntity.ok(agendamentoService.registrarDisparoLembrete(id));
    }

    /**
     * Remove um agendamento e libera a vaga no banco de dados.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        agendamentoService.excluirAgendamento(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Métricas consolidadas da agenda clínica.
     */
    @GetMapping("/estatisticas")
    public ResponseEntity<EstatisticasResponse> obterEstatisticas() {
        return ResponseEntity.ok(agendamentoService.obterEstatisticas());
    }
}
