package com.psicologia.agenda.controller;

import com.psicologia.agenda.dto.DiaDisponibilidadeResponse;
import com.psicologia.agenda.service.AgendamentoService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/disponibilidade")
@CrossOrigin(origins = "*", allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.OPTIONS})
public class DisponibilidadeController {

    private final AgendamentoService agendamentoService;

    public DisponibilidadeController(AgendamentoService agendamentoService) {
        this.agendamentoService = agendamentoService;
    }

    /**
     * Consulta a disponibilidade de horários para um dia específico.
     * Exemplo: GET /api/disponibilidade/dia?data=2026-11-23
     */
    @GetMapping("/dia")
    public ResponseEntity<DiaDisponibilidadeResponse> obterDia(
        @RequestParam(name = "data", required = false)
        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate data
    ) {
        if (data == null) {
            data = LocalDate.now();
        }
        return ResponseEntity.ok(agendamentoService.obterDisponibilidadeDia(data));
    }

    /**
     * Consulta a disponibilidade do mês inteiro para alimentar o calendário da landing page.
     * Exemplo: GET /api/disponibilidade/mes?ano=2026&mes=11
     */
    @GetMapping("/mes")
    public ResponseEntity<List<DiaDisponibilidadeResponse>> obterMes(
        @RequestParam(name = "ano", required = false) Integer ano,
        @RequestParam(name = "mes", required = false) Integer mes
    ) {
        LocalDate hoje = LocalDate.now();
        int a = (ano != null && ano > 2000) ? ano : hoje.getYear();
        int m = (mes != null && mes >= 1 && mes <= 12) ? mes : hoje.getMonthValue();

        return ResponseEntity.ok(agendamentoService.obterDisponibilidadeMes(a, m));
    }
}
