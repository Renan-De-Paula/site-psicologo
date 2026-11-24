package com.psicologia.agenda.repository;

import com.psicologia.agenda.model.Agendamento;
import com.psicologia.agenda.model.StatusAgendamento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AgendamentoRepository extends JpaRepository<Agendamento, Long> {

    Optional<Agendamento> findByProtocolo(String protocolo);

    List<Agendamento> findAllByOrderByDataConsultaAscHorarioAsc();

    List<Agendamento> findByDataConsulta(LocalDate dataConsulta);

    List<Agendamento> findByStatusOrderByDataConsultaAscHorarioAsc(StatusAgendamento status);

    boolean existsByDataConsultaAndHorarioAndStatusNot(LocalDate dataConsulta, String horario, StatusAgendamento status);

    @Query("SELECT COUNT(a) FROM Agendamento a WHERE a.status = :status")
    long countByStatus(@Param("status") StatusAgendamento status);
}
