package com.psicologia.agenda.repository;

import com.psicologia.agenda.model.Disponibilidade;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface DisponibilidadeRepository extends JpaRepository<Disponibilidade, Long> {

    List<Disponibilidade> findByDataOrderByHorarioAsc(LocalDate data);

    Optional<Disponibilidade> findByDataAndHorario(LocalDate data, String horario);

    List<Disponibilidade> findByDataBetweenOrderByDataAscHorarioAsc(LocalDate dataInicio, LocalDate dataFim);

    @Query("SELECT d FROM Disponibilidade d WHERE d.data >= :hoje AND d.disponivel = true ORDER BY d.data ASC, d.horario ASC")
    List<Disponibilidade> findProximasDisponiveis(@Param("hoje") LocalDate hoje);

    Optional<Disponibilidade> findByReservadoPorProtocolo(String protocolo);
}
