package com.psicologia.agenda.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.net.URI;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

/**
 * Tratador Global de Exceções aderente ao padrão RFC 7807 (Problem Details).
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(HorarioIndisponivelException.class)
    public ProblemDetail handleHorarioIndisponivel(HorarioIndisponivelException ex) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.CONFLICT, ex.getMessage());
        problem.setTitle("Horário Conflitante ou Indisponível");
        problem.setType(URI.create("https://psicologia.com.br/erros/horario-indisponivel"));
        problem.setProperty("timestamp", Instant.now());
        return problem;
    }

    @ExceptionHandler(RecursoNaoEncontradoException.class)
    public ProblemDetail handleRecursoNaoEncontrado(RecursoNaoEncontradoException ex) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, ex.getMessage());
        problem.setTitle("Recurso Não Encontrado");
        problem.setType(URI.create("https://psicologia.com.br/erros/nao-encontrado"));
        problem.setProperty("timestamp", Instant.now());
        return problem;
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ProblemDetail handleValidacao(MethodArgumentNotValidException ex) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, "Erro de validação dos campos da requisição");
        problem.setTitle("Dados Inválidos");
        problem.setType(URI.create("https://psicologia.com.br/erros/validacao"));
        problem.setProperty("timestamp", Instant.now());

        Map<String, String> erros = new HashMap<>();
        for (FieldError fieldError : ex.getBindingResult().getFieldErrors()) {
            erros.put(fieldError.getField(), fieldError.getDefaultMessage());
        }
        problem.setProperty("erros", erros);
        return problem;
    }

    @ExceptionHandler(Exception.class)
    public ProblemDetail handleGenerico(Exception ex) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.INTERNAL_SERVER_ERROR, "Ocorreu um erro interno ao processar a operação.");
        problem.setTitle("Erro Interno do Servidor");
        problem.setType(URI.create("https://psicologia.com.br/erros/interno"));
        problem.setProperty("timestamp", Instant.now());
        problem.setProperty("detalheTecnico", ex.getMessage());
        return problem;
    }
}
