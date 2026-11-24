/* ==============================================================================
   Firestore Service — Versão 3 Serverless (Cloud Firestore)
   Camada de persistência em tempo real para Pacientes e Painel da Psicóloga
   ============================================================================== */

var FirestoreService = (function() {
  var unsubscribeDiaAtual = null;

  function obterDb() {
    if (typeof db !== 'undefined' && db) return db;
    if (typeof inicializarFirestore === 'function') return inicializarFirestore();
    return null;
  }

  return {
    // Verifica se o Firestore está configurado e disponível
    isDisponivel: function() {
      return obterDb() !== null;
    },

    // Escuta em tempo real a ocupação de horários para a data selecionada
    escutarOcupacaoDia: function(dataIso, callback) {
      var firestore = obterDb();
      if (!firestore) return;

      if (unsubscribeDiaAtual) {
        unsubscribeDiaAtual();
        unsubscribeDiaAtual = null;
      }

      try {
        unsubscribeDiaAtual = firestore.collection('agendamentos')
          .where('dataConsulta', '==', dataIso)
          .onSnapshot(function(snapshot) {
            var ocupados = {};
            snapshot.forEach(function(doc) {
              var dados = doc.data();
              if (dados.status !== 'cancelado') {
                ocupados[dados.horario] = true;
              }
            });
            if (callback) callback(ocupados);
          }, function(error) {
            console.warn('Erro ao escutar horários no Firestore:', error);
          });
      } catch (err) {
        console.warn('Falha ao iniciar listener Firestore:', err);
      }
    },

    // Criação atômica de novo agendamento no Firestore
    criarAgendamento: function(agendamentoObj, onSuccess, onError) {
      var firestore = obterDb();
      if (!firestore) {
        if (onError) onError('Firestore não inicializado');
        return;
      }

      // 1. Verificação prévia contra concorrência para garantir que o horário continua livre
      firestore.collection('agendamentos')
        .where('dataConsulta', '==', agendamentoObj.dataConsulta)
        .where('horario', '==', agendamentoObj.horario)
        .get()
        .then(function(snapshot) {
          var jaOcupado = false;
          snapshot.forEach(function(doc) {
            var d = doc.data();
            if (d.status !== 'cancelado') {
              jaOcupado = true;
            }
          });

          if (jaOcupado) {
            if (onError) onError('Este horário acabou de ser reservado por outro paciente. Por favor, selecione outro horário.');
            return;
          }

          // 2. Grava o agendamento oficial
          var dadosParaGravar = {
            protocolo: agendamentoObj.protocolo,
            nome: agendamentoObj.nome,
            telefone: agendamentoObj.telefone,
            email: agendamentoObj.email,
            modalidade: agendamentoObj.modalidade,
            foco: agendamentoObj.foco,
            dataConsulta: agendamentoObj.dataConsulta,
            dataConsultaFormatada: agendamentoObj.dataConsultaFormatada || agendamentoObj.dataConsulta,
            horario: agendamentoObj.horario,
            notas: agendamentoObj.notas || '',
            status: 'pendente_48h',
            lembrete48hDisparado: false,
            criadoEm: new Date().toISOString()
          };

          if (agendamentoObj.dtConsultaTimestamp) {
            dadosParaGravar.dtConsultaTimestamp = agendamentoObj.dtConsultaTimestamp;
          }
          if (agendamentoObj.dtLembrete48hTimestamp) {
            dadosParaGravar.dtLembrete48hTimestamp = agendamentoObj.dtLembrete48hTimestamp;
          }

          return firestore.collection('agendamentos').add(dadosParaGravar)
            .then(function(docRef) {
              if (onSuccess) onSuccess(docRef.id);
            });
        })
        .catch(function(err) {
          console.error('Erro na gravação do Firestore:', err);
          if (onError) onError(err.message || 'Erro ao comunicar com o banco de dados Firestore.');
        });
    },

    // Escuta todos os agendamentos em tempo real para o Painel da Psicóloga
    escutarTodosAgendamentos: function(callback) {
      var firestore = obterDb();
      if (!firestore) return null;

      try {
        return firestore.collection('agendamentos')
          .onSnapshot(function(snapshot) {
            var lista = [];
            snapshot.forEach(function(doc) {
              var d = doc.data();
              d.id = doc.id;
              lista.push(d);
            });

            // Ordena localmente por data e horário
            lista.sort(function(a, b) {
              var strA = (a.dataConsulta || '') + ' ' + (a.horario || '');
              var strB = (b.dataConsulta || '') + ' ' + (b.horario || '');
              return strA.localeCompare(strB);
            });

            if (callback) callback(lista);
          }, function(err) {
            console.warn('Erro ao escutar agendamentos no painel:', err);
          });
      } catch (err) {
        console.warn('Falha no listener do painel:', err);
        return null;
      }
    },

    // Atualiza status do agendamento (confirmado, concluido, cancelado)
    atualizarStatus: function(id, novoStatus, callback) {
      var firestore = obterDb();
      if (!firestore || !id) return;

      var updateObj = {
        status: novoStatus,
        atualizadoEm: new Date().toISOString()
      };
      if (novoStatus === 'confirmado') updateObj.confirmadoEm = updateObj.atualizadoEm;
      else if (novoStatus === 'concluido') updateObj.concluidoEm = updateObj.atualizadoEm;
      else if (novoStatus === 'cancelado') updateObj.canceladoEm = updateObj.atualizadoEm;

      firestore.collection('agendamentos').doc(id)
        .update(updateObj)
        .then(function() {
          if (callback) callback(true);
        })
        .catch(function(err) {
          console.error('Erro ao atualizar status:', err);
          if (callback) callback(false, err);
        });
    },

    // Registra disparo do lembrete de 48h
    registrarLembrete48h: function(id, callback) {
      var firestore = obterDb();
      if (!firestore || !id) return;

      firestore.collection('agendamentos').doc(id)
        .update({
          lembrete48hDisparado: true,
          lembreteDisparadoEm: new Date().toISOString()
        })
        .then(function() {
          if (callback) callback(true);
        })
        .catch(function(err) {
          console.error('Erro ao registrar disparo 48h:', err);
          if (callback) callback(false, err);
        });
    },

    // Reagendamento de consulta
    reagendar: function(id, novaData, novoHorario, callback) {
      var firestore = obterDb();
      if (!firestore || !id) return;

      firestore.collection('agendamentos').doc(id)
        .update({
          dataConsulta: novaData,
          horario: novoHorario,
          status: 'pendente_48h',
          lembrete48hDisparado: false,
          reagendadoEm: new Date().toISOString()
        })
        .then(function() {
          if (callback) callback(true);
        })
        .catch(function(err) {
          console.error('Erro ao reagendar:', err);
          if (callback) callback(false, err);
        });
    },

    // Exclusão definitiva de agendamento
    excluir: function(id, callback) {
      var firestore = obterDb();
      if (!firestore || !id) return;

      firestore.collection('agendamentos').doc(id)
        .delete()
        .then(function() {
          if (callback) callback(true);
        })
        .catch(function(err) {
          console.error('Erro ao excluir:', err);
          if (callback) callback(false, err);
        });
    }
  };
})();
