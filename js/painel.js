/**
 * PAINEL DE GESTÃO DA AGENDA CLÍNICA & MOTOR DE CONFIRMAÇÃO 48H
 * Dra. Thalita de Paula · Psicologia Clínica
 */

(function () {
  'use strict';

  var STORAGE_KEY = 'psico_agendamentos';
  var BACKEND_API_URL = (window.location && window.location.origin && window.location.origin.startsWith('http')) ?
    (window.location.origin + '/api') : 'http://localhost:8080/api';
  var isBackendOnline = false;
  var agendamentos = [];
  var filtroAtual = 'todos';
  var termoBusca = '';

  // Elementos do DOM
  var elTotal = document.getElementById('metric-total');
  var elPendente48h = document.getElementById('metric-48h');
  var elConfirmados = document.getElementById('metric-confirmados');
  var elFuturos = document.getElementById('metric-futuros');
  var elConcluidos = document.getElementById('metric-concluidos');
  var elBanner48h = document.getElementById('banner-alerta-48h');
  var elBannerCount = document.getElementById('banner-count-48h');
  var elContainer = document.getElementById('appointments-list');
  var elEmpty = document.getElementById('empty-state');
  var elSearch = document.getElementById('input-search');
  var elFilterTabs = document.querySelectorAll('.filter-tab');
  var elClock = document.getElementById('live-clock');
  var elBackendBadge = document.getElementById('backend-status-badge');

  function atualizarBadgeBackend(online) {
    if (!elBackendBadge) return;
    if (online) {
      elBackendBadge.className = 'backend-badge online';
      elBackendBadge.innerHTML = '<span class="badge-dot"></span> <span class="badge-text">Spring Boot Ativo (H2 DB)</span>';
      elBackendBadge.title = 'Conectado à API Spring Boot com persistência em banco H2';
    } else {
      elBackendBadge.className = 'backend-badge offline';
      elBackendBadge.innerHTML = '<span class="badge-dot"></span> <span class="badge-text">Modo Local (Offline)</span>';
      elBackendBadge.title = 'Operando localmente via LocalStorage do navegador';
    }
  }

  // Relógio do cabeçalho
  function iniciarRelogio() {
    if (!elClock) return;
    function atualizar() {
      var agora = new Date();
      var opt = { weekday: 'long', day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' };
      elClock.textContent = agora.toLocaleDateString('pt-BR', opt);
    }
    atualizar();
    setInterval(atualizar, 30000);
  }

  // Carrega agendamentos do LocalStorage com sincronização da API Spring Boot
  function carregarDoStorage() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      agendamentos = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(agendamentos)) {
        agendamentos = [];
      }
    } catch (e) {
      console.error('Erro ao ler localStorage:', e);
      agendamentos = [];
    }

    // Tenta sincronizar com o backend Spring Boot em segundo plano
    sincronizarComBackend();
  }

  function converterBackendParaLocal(b) {
    var partesD = (b.dataConsulta || '').split('-');
    var partesH = (b.horario || '').split(':');
    var dtTimestamp = null;
    var dtLembrete = null;
    var dataFmt = b.dataConsulta;

    if (partesD.length === 3 && partesH.length >= 2) {
      var d = new Date(
        parseInt(partesD[0], 10),
        parseInt(partesD[1], 10) - 1,
        parseInt(partesD[2], 10),
        parseInt(partesH[0], 10),
        parseInt(partesH[1], 10)
      );
      dtTimestamp = d.getTime();
      dtLembrete = dtTimestamp - (48 * 60 * 60 * 1000);

      var mesesPt = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
      var diasSemanaPt = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
      dataFmt = diasSemanaPt[d.getDay()] + ', ' + d.getDate() + ' de ' + mesesPt[d.getMonth()] + ' de ' + d.getFullYear();
    }

    var statusNormalizado = 'pendente_48h';
    if (b.status === 'CONFIRMADO') statusNormalizado = 'confirmado';
    else if (b.status === 'CONCLUIDO') statusNormalizado = 'concluido';
    else if (b.status === 'CANCELADO') statusNormalizado = 'cancelado';
    else if (b.lembrete48hEnviado) statusNormalizado = 'lembrete_enviado';

    return {
      id: b.id,
      protocolo: b.protocolo,
      nome: b.nome,
      telefone: b.telefone,
      email: b.email,
      modalidade: b.modalidade === 'presencial' ? 'Presencial no consultório (Vila Ema)' : 'Online por videochamada',
      foco: b.foco,
      dataConsulta: b.dataConsulta,
      dataConsultaFormatada: dataFmt,
      horario: b.horario,
      notas: b.notas || '',
      dtConsultaTimestamp: dtTimestamp,
      dtLembrete48hTimestamp: dtLembrete,
      status: statusNormalizado,
      lembrete48hDisparado: b.lembrete48hEnviado,
      criadoEm: b.criadoEm,
      lembreteDisparadoEm: b.lembreteDisparadoEm
    };
  }

  function sincronizarComBackend() {
    if (!window.fetch) {
      atualizarBadgeBackend(false);
      return;
    }

    var ctrl = window.AbortController ? new AbortController() : null;
    var tId = ctrl ? setTimeout(function(){ ctrl.abort(); }, 2000) : null;

    fetch(BACKEND_API_URL + '/agendamentos', { method: 'GET', signal: ctrl ? ctrl.signal : undefined })
      .then(function(res) {
        if (tId) clearTimeout(tId);
        if (res.ok) {
          return res.json().then(function(lista) {
            isBackendOnline = true;
            atualizarBadgeBackend(true);
            if (Array.isArray(lista) && lista.length > 0) {
              agendamentos = lista.map(converterBackendParaLocal);
              salvarNoStorage();
              atualizarInterface();
            }
          });
        } else {
          isBackendOnline = false;
          atualizarBadgeBackend(false);
        }
      })
      .catch(function(err) {
        if (tId) clearTimeout(tId);
        isBackendOnline = false;
        atualizarBadgeBackend(false);
      });
  }

  // Salva no LocalStorage
  function salvarNoStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(agendamentos));
    } catch (e) {
      console.error('Erro ao salvar no localStorage:', e);
    }
  }

  // Processa dados e adiciona flags temporais
  function enriquecerAgendamento(item) {
    var agora = Date.now();
    var dtTimestamp = item.dtConsultaTimestamp;

    if (!dtTimestamp && item.dataConsulta && item.horario) {
      var partesD = item.dataConsulta.split('-');
      var partesH = item.horario.split(':');
      var d = new Date(
        parseInt(partesD[0], 10),
        parseInt(partesD[1], 10) - 1,
        parseInt(partesD[2], 10),
        parseInt(partesH[0], 10),
        parseInt(partesH[1], 10)
      );
      dtTimestamp = d.getTime();
      item.dtConsultaTimestamp = dtTimestamp;
      item.dtLembrete48hTimestamp = dtTimestamp - (48 * 60 * 60 * 1000);
    }

    var msRestantes = dtTimestamp ? (dtTimestamp - agora) : null;
    var horasRestantes = msRestantes !== null ? Math.round(msRestantes / (1000 * 60 * 60)) : null;

    // Janela de 48 horas: entre agora e agora + 48h (e ainda não passou)
    var naJanela48h = false;
    var passada = false;

    if (msRestantes !== null) {
      if (msRestantes <= 0) {
        passada = true;
      } else if (msRestantes <= 48 * 60 * 60 * 1000) {
        naJanela48h = true;
      }
    }

    // Flag de ação necessária (na janela de 48h, ainda não disparou lembrete e não está cancelado nem concluído)
    var precisaAcao48h = naJanela48h && !item.lembrete48hDisparado && item.status !== 'cancelado' && item.status !== 'concluido';

    return {
      ...item,
      msRestantes: msRestantes,
      horasRestantes: horasRestantes,
      naJanela48h: naJanela48h,
      passada: passada,
      precisaAcao48h: precisaAcao48h
    };
  }

  // Atualiza métricas e contadores
  function atualizarMetricas() {
    var enriquecidos = agendamentos.map(enriquecerAgendamento);

    var total = enriquecidos.length;
    var count48h = 0;
    var countConfirmados = 0;
    var countFuturos = 0;
    var countConcluidos = 0;

    enriquecidos.forEach(function (it) {
      if (it.precisaAcao48h) count48h++;
      if (it.status === 'confirmado') countConfirmados++;
      if (!it.naJanela48h && !it.passada && it.status !== 'cancelado') countFuturos++;
      if (it.status === 'concluido') countConcluidos++;
    });

    if (elTotal) elTotal.textContent = total;
    if (elPendente48h) elPendente48h.textContent = count48h;
    if (elConfirmados) elConfirmados.textContent = countConfirmados;
    if (elFuturos) elFuturos.textContent = countFuturos;
    if (elConcluidos) elConcluidos.textContent = countConcluidos;

    // Badge no tab 48h
    var tab48hCount = document.getElementById('tab-count-48h');
    if (tab48hCount) {
      tab48hCount.textContent = count48h;
      tab48hCount.style.display = count48h > 0 ? 'inline-block' : 'none';
    }

    // Banner de alerta superior
    if (elBanner48h) {
      if (count48h > 0) {
        elBanner48h.style.display = 'flex';
        if (elBannerCount) elBannerCount.textContent = count48h;
      } else {
        elBanner48h.style.display = 'none';
      }
    }
  }

  // Renderiza a lista de agendamentos
  function renderizarLista() {
    var enriquecidos = agendamentos.map(enriquecerAgendamento);

    // Ordenação: primeiro os mais urgentes (menor msRestantes ou mais próximos)
    enriquecidos.sort(function (a, b) {
      var tA = a.dtConsultaTimestamp || 0;
      var tB = b.dtConsultaTimestamp || 0;
      return tA - tB;
    });

    // Filtros
    var filtrados = enriquecidos.filter(function (it) {
      // Filtro de status / aba
      if (filtroAtual === '48h' && !it.precisaAcao48h) return false;
      if (filtroAtual === 'confirmados' && it.status !== 'confirmado') return false;
      if (filtroAtual === 'futuros' && (it.naJanela48h || it.passada || it.status === 'cancelado')) return false;
      if (filtroAtual === 'concluidos' && it.status !== 'concluido') return false;
      if (filtroAtual === 'cancelados' && it.status !== 'cancelado') return false;

      // Filtro de texto de busca
      if (termoBusca) {
        var termo = termoBusca.toLowerCase();
        var matchNome = (it.nome || '').toLowerCase().includes(termo);
        var matchTel = (it.telefone || '').toLowerCase().includes(termo);
        var matchProto = (it.protocolo || '').toLowerCase().includes(termo);
        var matchFoco = (it.foco || '').toLowerCase().includes(termo);
        if (!matchNome && !matchTel && !matchProto && !matchFoco) return false;
      }

      return true;
    });

    if (!elContainer) return;
    elContainer.innerHTML = '';

    if (filtrados.length === 0) {
      if (elEmpty) elEmpty.style.display = 'block';
      return;
    }

    if (elEmpty) elEmpty.style.display = 'none';

    filtrados.forEach(function (item) {
      var card = criarCardAgendamento(item);
      elContainer.appendChild(card);
    });
  }

  // Cria o elemento visual de um card de agendamento
  function criarCardAgendamento(item) {
    var card = document.createElement('article');
    card.className = 'app-card';

    if (item.precisaAcao48h) {
      card.classList.add('in-48h-window');
    }
    if (item.status === 'confirmado') card.classList.add('status-confirmado');
    if (item.status === 'cancelado') card.classList.add('status-cancelado');
    if (item.status === 'concluido') card.classList.add('status-concluido');

    // Inicial do nome para avatar
    var inicial = (item.nome || 'P').charAt(0).toUpperCase();

    // Badge de status
    var statusBadgeHtml = '';
    if (item.status === 'cancelado') {
      statusBadgeHtml = '<span class="status-badge badge-danger">✕ Cancelado</span>';
    } else if (item.status === 'concluido') {
      statusBadgeHtml = '<span class="status-badge badge-info">✓ Concluído</span>';
    } else if (item.status === 'confirmado') {
      statusBadgeHtml = '<span class="status-badge badge-success">✓ Presença Confirmada</span>';
    } else if (item.precisaAcao48h) {
      statusBadgeHtml = '<span class="status-badge badge-warn">🔔 Janela 48h (Aguardando Lembrete)</span>';
    } else if (item.lembrete48hDisparado) {
      statusBadgeHtml = '<span class="status-badge badge-info">📩 Lembrete 48h Enviado</span>';
    } else if (item.passada) {
      statusBadgeHtml = '<span class="status-badge badge-soft">⏳ Consulta Passada</span>';
    } else {
      statusBadgeHtml = '<span class="status-badge badge-soft">Agendado (&gt;48h)</span>';
    }

    // Telefone limpo para o link wa.me
    var numLimpo = (item.telefone || '').replace(/\D/g, '');
    if (numLimpo.length === 11 || numLimpo.length === 10) {
      numLimpo = '55' + numLimpo;
    }

    var horasTexto = '';
    if (item.horasRestantes !== null) {
      if (item.horasRestantes > 48) {
        var dias = Math.ceil(item.horasRestantes / 24);
        horasTexto = 'Em ' + dias + ' dias';
      } else if (item.horasRestantes > 0) {
        horasTexto = 'Em ' + item.horasRestantes + 'h (Janela 48h)';
      } else {
        horasTexto = 'Horário ultrapassado';
      }
    }

    card.innerHTML = `
      <div class="app-card-header">
        <div class="app-patient-info">
          <div class="app-patient-avatar">${inicial}</div>
          <div class="app-patient-details">
            <h2>
              ${escapeHtml(item.nome || 'Paciente')}
              <span class="app-proto-tag">${escapeHtml(item.protocolo || '#PSI')}</span>
            </h2>
            <div class="app-patient-contact">
              <a href="https://wa.me/${numLimpo}" target="_blank" rel="noopener" title="Abrir conversa no WhatsApp">
                💬 ${escapeHtml(item.telefone || '-')}
              </a>
              ${item.email ? `<a href="mailto:${escapeHtml(item.email)}">✉️ ${escapeHtml(item.email)}</a>` : ''}
            </div>
          </div>
        </div>
        <div class="app-status-wrap">
          ${statusBadgeHtml}
        </div>
      </div>

      <div class="app-card-body">
        <div class="app-data-box">
          <div class="app-data-label">Data & Horário</div>
          <div class="app-data-value highlight">
            📅 ${escapeHtml(item.dataConsultaFormatada || item.dataConsulta || '-')}
            <br>⏰ às ${escapeHtml(item.horario || '-')} (${horasTexto})
          </div>
        </div>

        <div class="app-data-box">
          <div class="app-data-label">Modalidade</div>
          <div class="app-data-value">
            📍 ${escapeHtml(item.modalidade || 'Consultório / Online')}
          </div>
        </div>

        <div class="app-data-box">
          <div class="app-data-label">Foco Clínico & Triagem</div>
          <div class="app-data-value">
            🎯 ${escapeHtml(item.foco || 'Atendimento Geral')}
          </div>
        </div>

        ${item.notas ? `
        <div class="app-data-box" style="grid-column: 1 / -1;">
          <div class="app-data-label">Observações do Paciente</div>
          <div class="app-data-value" style="font-weight:400;font-size:13.5px;color:var(--p-muted);">
            "${escapeHtml(item.notas)}"
          </div>
        </div>
        ` : ''}
      </div>

      <div class="app-card-actions">
        <div class="actions-left">
          <!-- Botão Disparar Lembrete WhatsApp -->
          <button type="button" class="p-btn p-btn-wa" data-action="disparar-48h" data-id="${item.id}">
            💬 Disparar Lembrete 48h WhatsApp
          </button>

          <!-- Botão Confirmar Presença -->
          ${item.status !== 'confirmado' && item.status !== 'cancelado' && item.status !== 'concluido' ? `
          <button type="button" class="p-btn p-btn-outline" data-action="confirmar" data-id="${item.id}" style="color:var(--p-success);border-color:var(--p-success-border)">
            ✓ Confirmar Presença
          </button>
          ` : ''}
        </div>

        <div class="actions-right">
          <!-- Reagendar -->
          <button type="button" class="p-btn p-btn-outline p-btn-sm" data-action="reagendar" data-id="${item.id}">
            📅 Reagendar
          </button>

          <!-- Concluir -->
          ${item.status !== 'concluido' && item.status !== 'cancelado' ? `
          <button type="button" class="p-btn p-btn-outline p-btn-sm" data-action="concluir" data-id="${item.id}">
            🏁 Concluir
          </button>
          ` : ''}

          <!-- Cancelar / Excluir -->
          ${item.status !== 'cancelado' ? `
          <button type="button" class="p-btn p-btn-danger-outline p-btn-sm" data-action="cancelar" data-id="${item.id}">
            ✕ Cancelar
          </button>
          ` : `
          <button type="button" class="p-btn p-btn-danger-outline p-btn-sm" data-action="excluir" data-id="${item.id}">
            🗑️ Excluir
          </button>
          `}
        </div>
      </div>
    `;

    return card;
  }

  // Dispara lembrete 48h via WhatsApp
  function dispararLembreteWhatsApp(id) {
    var item = agendamentos.find(function (a) { return a.id === id; });
    if (!item) return;

    var numLimpo = (item.telefone || '').replace(/\D/g, '');
    if (!numLimpo) {
      alert('Telefone do paciente não informado.');
      return;
    }
    if (numLimpo.length === 11 || numLimpo.length === 10) {
      numLimpo = '55' + numLimpo;
    }

    var mensagem =
      'Olá, *' + item.nome + '*! Tudo bem?\n' +
      'Aqui é do consultório da psicóloga *Thalita de Paula* (CRP 00/[00000]).\n\n' +
      'Gostaríamos de lembrar do seu atendimento agendado:\n' +
      '📅 *Data:* ' + (item.dataConsultaFormatada || item.dataConsulta) + '\n' +
      '⏰ *Horário:* às ' + item.horario + '\n' +
      '📍 *Modalidade:* ' + item.modalidade + '\n' +
      '📋 *Protocolo:* ' + item.protocolo + '\n\n' +
      'Conforme nossa política clínica, solicitamos a gentileza de confirmar seu comparecimento com 48h de antecedência.\n\n' +
      'Por favor, responda escolhendo uma das opções:\n' +
      '👉 *[ 1 ] SIM, confirmo minha presença*\n' +
      '👉 *[ 2 ] Preciso reagendar para outro dia*\n\n' +
      'Qualquer dúvida, estamos à disposição por aqui. Um abraço acolhedor!';

    var waUrl = 'https://wa.me/' + numLimpo + '?text=' + encodeURIComponent(mensagem);

    // Atualiza status do registro
    item.lembrete48hDisparado = true;
    item.lembreteDisparadoEm = new Date().toISOString();
    if (item.status === 'pendente_48h') {
      item.status = 'lembrete_enviado';
    }

    if (isBackendOnline && typeof id === 'number') {
      fetch(BACKEND_API_URL + '/agendamentos/' + id + '/lembrete', { method: 'POST' }).catch(console.warn);
    }

    salvarNoStorage();
    atualizarInterface();
    exibirToast('Lembrete de 48h aberto no WhatsApp e registrado com sucesso!', 'success');

    // Abre WhatsApp Web / App
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  }

  // Disparar todos os pendentes de 48h
  function dispararTodosPendentes48h() {
    var enriquecidos = agendamentos.map(enriquecerAgendamento);
    var pendentes = enriquecidos.filter(function (it) { return it.precisaAcao48h; });

    if (pendentes.length === 0) {
      alert('Não há lembretes de 48h pendentes no momento.');
      return;
    }

    var confirma = confirm('Deseja iniciar o envio de lembrete para ' + pendentes.length + ' paciente(s) na janela de 48h?');
    if (!confirma) return;

    // Dispara o primeiro da fila
    dispararLembreteWhatsApp(pendentes[0].id);
  }

  // Ações de alteração de status
  function alterarStatus(id, novoStatus) {
    var item = agendamentos.find(function (a) { return a.id === id; });
    if (!item) return;

    item.status = novoStatus;
    if (novoStatus === 'confirmado') {
      item.confirmadoEm = new Date().toISOString();
      exibirToast('Presença de ' + item.nome + ' confirmada!', 'success');
    } else if (novoStatus === 'concluido') {
      item.concluidoEm = new Date().toISOString();
      exibirToast('Atendimento de ' + item.nome + ' marcado como concluído!', 'success');
    } else if (novoStatus === 'cancelado') {
      item.canceladoEm = new Date().toISOString();
      exibirToast('Agendamento de ' + item.nome + ' cancelado.', 'warn');
    }

    if (isBackendOnline && typeof id === 'number') {
      var statusMap = {
        'confirmado': 'CONFIRMADO',
        'concluido': 'CONCLUIDO',
        'cancelado': 'CANCELADO',
        'pendente_48h': 'PENDENTE_48H'
      };
      if (statusMap[novoStatus]) {
        fetch(BACKEND_API_URL + '/agendamentos/' + id + '/status', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: statusMap[novoStatus] })
        }).catch(console.warn);
      }
    }

    salvarNoStorage();
    atualizarInterface();
  }

  // Excluir agendamento
  function excluirAgendamento(id) {
    var item = agendamentos.find(function (a) { return a.id === id; });
    if (!item) return;

    var ok = confirm('Tem certeza que deseja excluir o registro de ' + item.nome + ' (' + item.protocolo + ')?');
    if (!ok) return;

    if (isBackendOnline && typeof id === 'number') {
      fetch(BACKEND_API_URL + '/agendamentos/' + id, { method: 'DELETE' }).catch(console.warn);
    }

    agendamentos = agendamentos.filter(function (a) { return a.id !== id; });
    salvarNoStorage();
    atualizarInterface();
    exibirToast('Registro excluído com sucesso.', 'warn');
  }

  // Modal de Reagendamento
  var modalReagendar = document.getElementById('modal-reagendar');
  var formReagendar = document.getElementById('form-reagendar');
  var reagendarId = null;

  function abrirModalReagendar(id) {
    var item = agendamentos.find(function (a) { return a.id === id; });
    if (!item) return;

    reagendarId = id;
    document.getElementById('reagendar-nome').textContent = item.nome + ' (' + item.protocolo + ')';
    document.getElementById('reagendar-data').value = item.dataConsulta || '';
    document.getElementById('reagendar-hora').value = item.horario || '14:30';

    if (modalReagendar) {
      modalReagendar.classList.add('active');
    }
  }

  function fecharModalReagendar() {
    if (modalReagendar) {
      modalReagendar.classList.remove('active');
      reagendarId = null;
    }
  }

  if (formReagendar) {
    formReagendar.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!reagendarId) return;

      var item = agendamentos.find(function (a) { return a.id === reagendarId; });
      if (!item) return;

      var novaData = document.getElementById('reagendar-data').value;
      var novaHora = document.getElementById('reagendar-hora').value;

      if (!novaData || !novaHora) {
        alert('Por favor, selecione data e horário.');
        return;
      }

      var partesD = novaData.split('-');
      var partesH = novaHora.split(':');
      var d = new Date(
        parseInt(partesD[0], 10),
        parseInt(partesD[1], 10) - 1,
        parseInt(partesD[2], 10),
        parseInt(partesH[0], 10),
        parseInt(partesH[1], 10)
      );

      var mesesPt = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
      var diasSemanaPt = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];

      item.dataConsulta = novaData;
      item.horario = novaHora;
      item.dataConsultaFormatada = diasSemanaPt[d.getDay()] + ', ' + d.getDate() + ' de ' + mesesPt[d.getMonth()] + ' de ' + d.getFullYear();
      item.dtConsultaTimestamp = d.getTime();
      item.dtLembrete48hTimestamp = d.getTime() - (48 * 60 * 60 * 1000);
      item.status = 'pendente_48h';
      item.lembrete48hDisparado = false;
      item.reagendadoEm = new Date().toISOString();

      salvarNoStorage();
      fecharModalReagendar();
      atualizarInterface();
      exibirToast('Sessão reagendada com sucesso para ' + item.dataConsultaFormatada + '!', 'success');
    });
  }

  // Modal de Novo Agendamento Manual
  var modalNovo = document.getElementById('modal-novo-agendamento');
  var formNovo = document.getElementById('form-novo-agendamento');
  var btnAbrirNovo = document.getElementById('btn-novo-agendamento');

  function abrirModalNovo() {
    if (modalNovo) modalNovo.classList.add('active');
  }

  function fecharModalNovo() {
    if (modalNovo) modalNovo.classList.remove('active');
    if (formNovo) formNovo.reset();
  }

  if (btnAbrirNovo) {
    btnAbrirNovo.addEventListener('click', abrirModalNovo);
  }

  if (formNovo) {
    formNovo.addEventListener('submit', function (e) {
      e.preventDefault();

      var nome = document.getElementById('novo-nome').value.trim();
      var tel = document.getElementById('novo-tel').value.trim();
      var email = document.getElementById('novo-email').value.trim();
      var mod = document.getElementById('novo-mod').value;
      var foco = document.getElementById('novo-foco').value;
      var data = document.getElementById('novo-data').value;
      var hora = document.getElementById('novo-hora').value;
      var notas = document.getElementById('novo-notas').value.trim();

      if (!nome || !tel || !data || !hora) {
        alert('Por favor, preencha nome, WhatsApp, data e horário.');
        return;
      }

      var partesD = data.split('-');
      var partesH = hora.split(':');
      var d = new Date(
        parseInt(partesD[0], 10),
        parseInt(partesD[1], 10) - 1,
        parseInt(partesD[2], 10),
        parseInt(partesH[0], 10),
        parseInt(partesH[1], 10)
      );

      var mesesPt = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
      var diasSemanaPt = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
      var randomCode = Math.floor(1000 + Math.random() * 9000);

      function persistirLocal(proto, backendId) {
        var novo = {
          id: backendId || ('psi_' + Date.now() + '_' + randomCode),
          protocolo: proto || ('#PSI-' + randomCode),
          nome: nome,
          telefone: tel,
          email: email,
          notas: notas,
          modalidade: mod,
          foco: foco,
          dataConsulta: data,
          dataConsultaFormatada: diasSemanaPt[d.getDay()] + ', ' + d.getDate() + ' de ' + mesesPt[d.getMonth()] + ' de ' + d.getFullYear(),
          horario: hora,
          dtConsultaTimestamp: d.getTime(),
          dtLembrete48hTimestamp: d.getTime() - (48 * 60 * 60 * 1000),
          status: 'pendente_48h',
          lembrete48hDisparado: false,
          criadoEm: new Date().toISOString()
        };

        agendamentos.unshift(novo);
        salvarNoStorage();
        fecharModalNovo();
        atualizarInterface();
        exibirToast('Novo agendamento criado com sucesso (' + novo.protocolo + ')!', 'success');
      }

      if (isBackendOnline && window.fetch) {
        var payload = {
          nome: nome,
          telefone: tel,
          email: email || 'paciente@consultorio.com',
          modalidade: mod.indexOf('Presencial') !== -1 ? 'presencial' : 'online',
          foco: foco,
          dataConsulta: data,
          horario: hora,
          notas: notas
        };

        fetch(BACKEND_API_URL + '/agendamentos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
        .then(function(res) {
          if (res.status === 201) {
            return res.json().then(function(item) {
              persistirLocal(item.protocolo, item.id);
            });
          } else if (res.status === 409) {
            return res.json().then(function(prob) {
              alert(prob.detail || 'Horário já reservado no banco de dados. Escolha outro horário.');
            });
          } else {
            return res.json().then(function(prob) {
              alert(prob.detail || 'Erro ao salvar agendamento no servidor.');
            });
          }
        })
        .catch(function(err) {
          console.warn('Erro na requisição ao backend Spring Boot:', err);
          persistirLocal(null, null);
        });
      } else {
        persistirLocal(null, null);
      }
    });
  }

  // Exportar Relatório em CSV (Compatível com Excel e Google Sheets)
  function exportarCSV() {
    if (agendamentos.length === 0) {
      alert('Nenhum agendamento para exportar.');
      return;
    }

    var headers = ['Protocolo', 'Nome', 'WhatsApp', 'Email', 'Modalidade', 'Foco Clínico', 'Data Consulta', 'Horario', 'Status', 'Lembrete 48h Enviado', 'Criado Em', 'Observacoes'];
    var linhas = [headers.join(';')];

    agendamentos.forEach(function (a) {
      var linha = [
        '"' + (a.protocolo || '') + '"',
        '"' + (a.nome || '').replace(/"/g, '""') + '"',
        '"' + (a.telefone || '') + '"',
        '"' + (a.email || '') + '"',
        '"' + (a.modalidade || '') + '"',
        '"' + (a.foco || '') + '"',
        '"' + (a.dataConsulta || '') + '"',
        '"' + (a.horario || '') + '"',
        '"' + (a.status || '') + '"',
        '"' + (a.lembrete48hDisparado ? 'SIM' : 'NÃO') + '"',
        '"' + (a.criadoEm || '') + '"',
        '"' + (a.notas || '').replace(/"/g, '""') + '"'
      ];
      linhas.push(linha.join(';'));
    });

    var csvContent = '\uFEFF' + linhas.join('\r\n');
    var blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    var link = document.createElement('a');
    var url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'agendamentos_psicologia_' + new Date().toISOString().slice(0, 10) + '.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    exibirToast('Relatório CSV exportado com sucesso!', 'success');
  }

  // Carregar Agendamentos de Demonstração
  function carregarExemplosDemo() {
    var agora = new Date();
    
    // Consulta 1: Amanhã às 15:00 (dentro da janela de 48h)
    var d1 = new Date(agora.getTime() + (26 * 60 * 60 * 1000));
    // Consulta 2: Daqui a 4 dias às 10:00 (futura, fora da janela de 48h)
    var d2 = new Date(agora.getTime() + (4 * 24 * 60 * 60 * 1000));
    // Consulta 3: Daqui a 2 dias às 16:30 (já confirmada)
    var d3 = new Date(agora.getTime() + (36 * 60 * 60 * 1000));

    function fmtISO(d) {
      var ano = d.getFullYear();
      var mes = String(d.getMonth() + 1).padStart(2, '0');
      var dia = String(d.getDate()).padStart(2, '0');
      return ano + '-' + mes + '-' + dia;
    }

    var mesesPt = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    var diasSemanaPt = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];

    function fmtExt(d) {
      return diasSemanaPt[d.getDay()] + ', ' + d.getDate() + ' de ' + mesesPt[d.getMonth()] + ' de ' + d.getFullYear();
    }

    var exemplos = [
      {
        id: 'psi_demo_1',
        protocolo: '#PSI-4821',
        nome: 'Camila Fernandes',
        telefone: '(11) 98452-1133',
        email: 'camila.fernandes@exemplo.com',
        notas: 'Primeira vez em terapia; queixa de insônia e ansiedade no trabalho.',
        modalidade: 'Presencial no consultório (Vila Ema)',
        foco: 'Ansiedade & Estresse',
        dataConsulta: fmtISO(d1),
        dataConsultaFormatada: fmtExt(d1),
        horario: '15:00',
        dtConsultaTimestamp: d1.getTime(),
        dtLembrete48hTimestamp: d1.getTime() - (48 * 60 * 60 * 1000),
        status: 'pendente_48h',
        lembrete48hDisparado: false,
        criadoEm: new Date().toISOString()
      },
      {
        id: 'psi_demo_2',
        protocolo: '#PSI-8390',
        nome: 'Rodrigo Medeiros',
        telefone: '(11) 97123-9988',
        email: 'rodrigo.m@exemplo.com',
        notas: 'Preferência por videochamada Google Meet.',
        modalidade: 'Online por videochamada (e-Psi)',
        foco: 'Esgotamento & Burnout',
        dataConsulta: fmtISO(d2),
        dataConsultaFormatada: fmtExt(d2),
        horario: '10:00',
        dtConsultaTimestamp: d2.getTime(),
        dtLembrete48hTimestamp: d2.getTime() - (48 * 60 * 60 * 1000),
        status: 'pendente_48h',
        lembrete48hDisparado: false,
        criadoEm: new Date().toISOString()
      },
      {
        id: 'psi_demo_3',
        protocolo: '#PSI-1922',
        nome: 'Beatriz Vasconcelos',
        telefone: '(11) 99554-4411',
        email: 'beatriz.v@exemplo.com',
        notas: 'Retorno quinzenal.',
        modalidade: 'Presencial no consultório (Vila Ema)',
        foco: 'Autoconhecimento & Autoestima',
        dataConsulta: fmtISO(d3),
        dataConsultaFormatada: fmtExt(d3),
        horario: '16:30',
        dtConsultaTimestamp: d3.getTime(),
        dtLembrete48hTimestamp: d3.getTime() - (48 * 60 * 60 * 1000),
        status: 'confirmado',
        lembrete48hDisparado: true,
        confirmadoEm: new Date().toISOString(),
        criadoEm: new Date().toISOString()
      }
    ];

    agendamentos = exemplos;
    salvarNoStorage();
    atualizarInterface();
    exibirToast('3 agendamentos de exemplo carregados (com caso na janela de 48h)!', 'success');
  }

  // Toast notification
  function exibirToast(msg, tipo) {
    var toast = document.getElementById('painel-toast');
    if (!toast) return;
    toast.textContent = msg;
    toast.className = 'p-toast show ' + (tipo === 'warn' ? 'toast-warn' : 'toast-success');
    setTimeout(function () {
      toast.classList.remove('show');
    }, 4000);
  }

  // Atualização geral da interface
  function atualizarInterface() {
    atualizarMetricas();
    renderizarLista();
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // Event Listeners Globais
  function inicializarEventos() {
    iniciarRelogio();

    // Filtros de busca
    if (elSearch) {
      elSearch.addEventListener('input', function (e) {
        termoBusca = e.target.value.trim();
        renderizarLista();
      });
    }

    // Abas de filtro
    elFilterTabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        elFilterTabs.forEach(function (t) { t.classList.remove('active'); });
        this.classList.add('active');
        filtroAtual = this.getAttribute('data-filter') || 'todos';
        renderizarLista();
      });
    });

    // Ações nos cards via delegação de eventos
    if (elContainer) {
      elContainer.addEventListener('click', function (e) {
        var btn = e.target.closest('[data-action]');
        if (!btn) return;

        var action = btn.getAttribute('data-action');
        var id = btn.getAttribute('data-id');
        if (!id) return;

        if (action === 'disparar-48h') {
          dispararLembreteWhatsApp(id);
        } else if (action === 'confirmar') {
          alterarStatus(id, 'confirmado');
        } else if (action === 'concluir') {
          alterarStatus(id, 'concluido');
        } else if (action === 'cancelar') {
          alterarStatus(id, 'cancelado');
        } else if (action === 'excluir') {
          excluirAgendamento(id);
        } else if (action === 'reagendar') {
          abrirModalReagendar(id);
        }
      });
    }

    // Botão de disparar todos do banner 48h
    var btnBanner48h = document.getElementById('btn-disparar-todos-48h');
    if (btnBanner48h) {
      btnBanner48h.addEventListener('click', dispararTodosPendentes48h);
    }

    // Botão Exportar CSV
    var btnExportar = document.getElementById('btn-exportar-csv');
    if (btnExportar) {
      btnExportar.addEventListener('click', exportarCSV);
    }

    // Botões de carregar exemplos (no estado vazio ou header)
    var btnDemo = document.getElementById('btn-carregar-demo');
    if (btnDemo) {
      btnDemo.addEventListener('click', carregarExemplosDemo);
    }
    var btnDemoEmpty = document.getElementById('btn-carregar-demo-empty');
    if (btnDemoEmpty) {
      btnDemoEmpty.addEventListener('click', carregarExemplosDemo);
    }

    // Fechar modais
    document.querySelectorAll('.p-modal-close').forEach(function (btn) {
      btn.addEventListener('click', function () {
        fecharModalNovo();
        fecharModalReagendar();
      });
    });

    // Fechar ao clicar fora do card modal
    document.querySelectorAll('.p-modal-overlay').forEach(function (overlay) {
      overlay.addEventListener('click', function (e) {
        if (e.target === overlay) {
          fecharModalNovo();
          fecharModalReagendar();
        }
      });
    });
  }

  // Inicialização
  carregarDoStorage();
  inicializarEventos();
  atualizarInterface();

})();
