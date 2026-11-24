(function(){
  /* =========================================================
     1. WHATSAPP COM MENSAGEM ACOLHEDORA E DE ALTA CONVERSÃO
     ========================================================= */
  var NUMERO = '5511937539358'; // 55 (Brasil) + 11 (DDD) + número
  var MENSAGEM = 'Olá! Conheci seu trabalho pelo site e gostaria de mais informações sobre os atendimentos e horários disponíveis. Poderia me ajudar?';
  var linkWa = 'https://wa.me/' + NUMERO + '?text=' + encodeURIComponent(MENSAGEM);
  document.querySelectorAll('.js-wa').forEach(function(a){
    a.href = linkWa;
    a.addEventListener('click', function(){
      // Rastreamento automático Google Analytics 4 (se gtag estiver configurado)
      if (typeof window.gtag === 'function') {
        window.gtag('event', 'generate_lead', {
          event_category: 'Conversao',
          event_label: 'Clique WhatsApp',
          transport_type: 'beacon'
        });
      }
      // Rastreamento automático Meta Pixel (se fbq estiver configurado)
      if (typeof window.fbq === 'function') {
        window.fbq('track', 'Contact', {
          content_name: 'Agendamento WhatsApp'
        });
      }
    });
  });

  /* =========================================================
     2. MENU MOBILE RESPONSIVO
     ========================================================= */
  var navToggle = document.getElementById('nav-toggle');
  var navlinks = document.getElementById('navlinks');
  if (navToggle && navlinks) {
    navToggle.addEventListener('click', function(){
      var isOpen = navlinks.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    // Fecha o menu ao clicar em qualquer link de navegação
    navlinks.querySelectorAll('a').forEach(function(link){
      link.addEventListener('click', function(){
        navlinks.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* =========================================================
     3. MICRO-ANIMAÇÕES DE SCROLL REVEAL (IntersectionObserver)
     ========================================================= */
  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -40px 0px'
    });

    document.querySelectorAll('.reveal').forEach(function(el){
      observer.observe(el);
    });
  } else {
    // Fallback para navegadores antigos
    document.querySelectorAll('.reveal').forEach(function(el){
      el.classList.add('revealed');
    });
  }

  /* =========================================================
     4. BALÃO INTELIGENTE DO WHATSAPP (Aumenta conversão)
     ========================================================= */
  var waBubble = document.getElementById('wa-bubble');
  var waClose = document.getElementById('wa-bubble-close');
  var waDismissed = false;
  try { waDismissed = window.sessionStorage && sessionStorage.getItem('wa-bubble-dismissed'); } catch (e) {}
  if (waBubble && !waDismissed) {
    var timer = setTimeout(function(){
      waBubble.classList.add('show');
    }, 5500);

    if (waClose) {
      waClose.addEventListener('click', function(e){
        e.stopPropagation();
        e.preventDefault();
        waBubble.classList.remove('show');
        clearTimeout(timer);
        try { if (window.sessionStorage) sessionStorage.setItem('wa-bubble-dismissed', '1'); } catch (e) {}
      });
    }
  }

  /* =========================================================
     5. BOTÃO VOLTAR AO TOPO (Smooth Scroll)
     ========================================================= */
  var btt = document.getElementById('back-to-top');
  if (btt) {
    window.addEventListener('scroll', function(){
      if (window.scrollY > 380) {
        btt.classList.add('show');
      } else {
        btt.classList.remove('show');
      }
    }, { passive: true });

    btt.addEventListener('click', function(){
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* =========================================================
     7. ROTAS (GOOGLE MAPS, WAZE, UBER) E VCARD DIGITAL
     ========================================================= */
  var btnVcard = document.getElementById('btn-vcard');
  var locAddrEl = document.getElementById('loc-address-text');
  var enderecoAtual = (locAddrEl && locAddrEl.textContent) ? locAddrEl.textContent.trim() : 'Av. Vila Ema, 4060 · Vila Ema · São Paulo – SP';
  var enderecoLimpo = enderecoAtual.replace(/·/g, '-');
  var addrEnc = encodeURIComponent(enderecoLimpo);

  // Links dinâmicos de rotas
  var btnGmaps = document.getElementById('btn-gmaps');
  if (btnGmaps) {
    btnGmaps.href = 'https://www.google.com/maps/dir/?api=1&destination=' + addrEnc;
  }

  var btnWaze = document.getElementById('btn-waze');
  if (btnWaze) {
    btnWaze.href = 'https://waze.com/ul?q=' + addrEnc + '&navigate=yes';
  }

  var btnUber = document.getElementById('btn-uber');
  if (btnUber) {
    btnUber.href = 'https://m.uber.com/ul/?action=setPickup&pickup=my_location&dropoff[formatted_address]=' + addrEnc;
  }

  if (btnVcard) {
    btnVcard.addEventListener('click', function(){
      var vcardData = [
        'BEGIN:VCARD',
        'VERSION:3.0',
        'FN:Thalita de Paula - Psicóloga Clínica',
        'ORG:Consultório de Psicologia Clínica',
        'TITLE:Psicóloga Clínica (CRP 00/[00000])',
        'TEL;TYPE=CELL,VOICE:+5511937539358',
        'ADR;TYPE=WORK:;;' + enderecoLimpo + ';Brasil',
        'NOTE:Atendimento presencial e online via e-Psi.',
        'URL:' + window.location.origin,
        'END:VCARD'
      ].join('\r\n');

      var blob = new Blob([vcardData], { type: 'text/vcard;charset=utf-8;' });
      var link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'contato-psicologa.vcf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  }

  /* =========================================================
     8. BANNER DE COOKIES & LGPD
     ========================================================= */
  var cookieBanner = document.getElementById('cookie-banner');
  var cookieAccept = document.getElementById('cookie-accept');
  var lgpdConsent = false;
  try { lgpdConsent = window.localStorage && localStorage.getItem('lgpd-consent'); } catch (e) {}
  if (cookieBanner && !lgpdConsent) {
    setTimeout(function(){
      cookieBanner.classList.add('show');
    }, 1500);

    if (cookieAccept) {
      cookieAccept.addEventListener('click', function(){
        cookieBanner.classList.remove('show');
        try { if (window.localStorage) localStorage.setItem('lgpd-consent', '1'); } catch (e) {}
      });
    }
  }

  /* =========================================================
     9. CONTADORES NUMÉRICOS ANIMADOS (CountUp suave ao rolar)
     ========================================================= */
  var counters = document.querySelectorAll('.metric-num[data-target]');
  if (counters.length > 0 && 'IntersectionObserver' in window) {
    var counterObserver = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });

    counters.forEach(function(el){
      counterObserver.observe(el);
    });

    function animateCounter(el) {
      var target = parseFloat(el.getAttribute('data-target'));
      if (isNaN(target)) return;
      var prefix = el.getAttribute('data-prefix') || '';
      var suffix = el.getAttribute('data-suffix') || '';
      var format = el.getAttribute('data-format') === 'thousands';
      var duration = 1600; // ms
      var startTime = null;

      function step(now) {
        if (!startTime) startTime = now;
        var progress = Math.min((now - startTime) / duration, 1);
        var easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
        var current = Math.floor(easeProgress * target);

        var displayVal = current;
        if (format && current >= 1000) {
          displayVal = current.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
        }

        el.textContent = prefix + displayVal + suffix;

        if (progress < 1) {
          window.requestAnimationFrame(step);
        } else {
          var finalVal = target;
          if (format && target >= 1000) {
            finalVal = target.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
          }
          el.textContent = prefix + finalVal + suffix;
        }
      }

      window.requestAnimationFrame(step);
    }
  }

  /* =========================================================
     10. NOVO SISTEMA DE AGENDAMENTO CLÍNICO INTELIGENTE (FASE 1)
     ========================================================= */
  var bookingForm = document.getElementById('site-booking-form');
  var bookingModal = document.getElementById('booking-modal-overlay');
  var bookingModalClose = document.getElementById('booking-modal-close');
  var bookingModalWa = document.getElementById('booking-modal-wa');
  var bookingModalCal = document.getElementById('booking-modal-calendar');
  var bookingModalGcal = document.getElementById('booking-modal-gcal');

  var mesesPt = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  var diasSemanaPt = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];

  var hoje = new Date();
  var calAno = hoje.getFullYear();
  var calMes = hoje.getMonth(); // 0 a 11

  var bookingState = {
    modalidade: 'Presencial no consultório (Vila Ema)',
    foco: 'Ansiedade & Estresse',
    dataConsulta: '', // 'YYYY-MM-DD'
    dataConsultaFormatada: '',
    horario: '14:30',
    ultimoAgendamento: null
  };

  var BACKEND_API_URL = (window.location && window.location.origin && window.location.origin.startsWith('http')) ?
    (window.location.origin + '/api') : 'http://localhost:8080/api';
  var isBackendOnline = false;

  function verificarBackendStatus(callback) {
    if (!window.fetch) {
      if (callback) callback(false);
      return;
    }
    var ctrl = window.AbortController ? new AbortController() : null;
    var tId = ctrl ? setTimeout(function(){ ctrl.abort(); }, 1500) : null;
    fetch(BACKEND_API_URL + '/agendamentos/health', { method: 'GET', signal: ctrl ? ctrl.signal : undefined })
      .then(function(res) {
        if (tId) clearTimeout(tId);
        isBackendOnline = res.ok;
        if (callback) callback(res.ok);
      })
      .catch(function() {
        if (tId) clearTimeout(tId);
        isBackendOnline = false;
        if (callback) callback(false);
      });
  }

  function aplicarOcupacaoChips(ocupados) {
    var primeiroLivre = null;
    document.querySelectorAll('.time-chip').forEach(function(chip) {
      var h = chip.getAttribute('data-time');
      if (ocupados && ocupados[h]) {
        chip.classList.add('disabled');
        chip.setAttribute('title', 'Horário já reservado no banco de dados');
        if (bookingState.horario === h) {
          chip.classList.remove('active');
        }
      } else {
        chip.classList.remove('disabled');
        chip.removeAttribute('title');
        if (!primeiroLivre) primeiroLivre = h;
      }
    });

    if (ocupados && ocupados[bookingState.horario] && primeiroLivre) {
      selecionarHorario(primeiroLivre);
    }
  }

  function carregarDisponibilidadeDia(isoDate) {
    // 1. Escuta em tempo real via Cloud Firestore (Serverless Firebase)
    if (typeof FirestoreService !== 'undefined' && FirestoreService.isDisponivel()) {
      FirestoreService.escutarOcupacaoDia(isoDate, function(ocupados) {
        aplicarOcupacaoChips(ocupados);
      });
      return;
    }

    // 2. Fallback para API Spring Boot (H2) se estiver rodando localmente
    if (!isBackendOnline || !window.fetch) return;
    fetch(BACKEND_API_URL + '/disponibilidade/dia?data=' + encodeURIComponent(isoDate))
      .then(function(res) { return res.ok ? res.json() : null; })
      .then(function(data) {
        if (!data || !data.horarios) return;
        var ocupados = {};
        data.horarios.forEach(function(h) {
          if (!h.disponivel) ocupados[h.horario] = true;
        });
        aplicarOcupacaoChips(ocupados);
      })
      .catch(function(err) {
        console.warn('Erro ao carregar slots da data:', err);
      });
  }

  // Encontra a primeira data útil disponível (amanhã ou próxima segunda se hoje for fim de semana)
  function obterPrimeiraDataUtil() {
    var d = new Date();
    d.setDate(d.getDate() + 1); // Amanhã
    if (d.getDay() === 0) { // Se for domingo, pula para segunda
      d.setDate(d.getDate() + 1);
    }
    return d;
  }

  function formatarDataISO(dateObj) {
    var y = dateObj.getFullYear();
    var m = String(dateObj.getMonth() + 1).padStart(2, '0');
    var d = String(dateObj.getDate()).padStart(2, '0');
    return y + '-' + m + '-' + d;
  }

  function formatarDataExtenso(dateObj) {
    var diaSemana = diasSemanaPt[dateObj.getDay()];
    var dia = dateObj.getDate();
    var mes = mesesPt[dateObj.getMonth()];
    var ano = dateObj.getFullYear();
    return diaSemana + ', ' + dia + ' de ' + mes + ' de ' + ano;
  }

  // Inicializa data padrão
  var dataInicial = obterPrimeiraDataUtil();
  calAno = dataInicial.getFullYear();
  calMes = dataInicial.getMonth();
  bookingState.dataConsulta = formatarDataISO(dataInicial);
  bookingState.dataConsultaFormatada = formatarDataExtenso(dataInicial);

  /* --- RENDERIZAÇÃO DO CALENDÁRIO --- */
  var calMonthTitle = document.getElementById('cal-month-title');
  var calDaysGrid = document.getElementById('cal-days-grid');
  var calPrevBtn = document.getElementById('cal-prev-btn');
  var calNextBtn = document.getElementById('cal-next-btn');
  var slotsSelectedDateText = document.getElementById('slots-selected-date-text');
  var liveSumDate = document.getElementById('live-sum-date');
  var liveSumTime = document.getElementById('live-sum-time');
  var liveSumMod = document.getElementById('live-sum-mod');
  var liveSumFoco = document.getElementById('live-sum-foco');

  function renderCalendar(ano, mes) {
    if (!calDaysGrid || !calMonthTitle) return;

    calMonthTitle.textContent = mesesPt[mes] + ' ' + ano;

    // Desabilita botão de mês anterior se for o mês corrente ou passado
    if (calPrevBtn) {
      var ehMesCorrente = (ano === hoje.getFullYear() && mes <= hoje.getMonth());
      var ehAnoPassado = (ano < hoje.getFullYear());
      calPrevBtn.disabled = ehMesCorrente || ehAnoPassado;
    }

    calDaysGrid.innerHTML = '';

    var primeiroDiaSemana = new Date(ano, mes, 1).getDay(); // 0 (Dom) a 6 (Sab)
    var totalDiasNoMes = new Date(ano, mes + 1, 0).getDate();

    // Células vazias do início da semana
    for (var i = 0; i < primeiroDiaSemana; i++) {
      var emptyCell = document.createElement('div');
      emptyCell.className = 'cal-day-cell empty';
      calDaysGrid.appendChild(emptyCell);
    }

    // Dias do mês
    for (var dia = 1; dia <= totalDiasNoMes; dia++) {
      var dataDia = new Date(ano, mes, dia);
      var isoDate = formatarDataISO(dataDia);
      var diaDaSemana = dataDia.getDay();

      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'cal-day-cell';
      btn.textContent = dia;
      btn.setAttribute('data-date', isoDate);

      // Compara com hoje (sem horas)
      var hojeZerado = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
      var dataDiaZerada = new Date(ano, mes, dia);

      var ehPassado = dataDiaZerada < hojeZerado;
      var ehHoje = dataDiaZerada.getTime() === hojeZerado.getTime();
      var ehDomingo = (diaDaSemana === 0);

      if (ehHoje) {
        btn.classList.add('today');
        btn.title = 'Hoje';
      }

      if (ehPassado || ehDomingo) {
        btn.classList.add('disabled');
        btn.disabled = true;
        if (ehDomingo) btn.title = 'Consultório fechado aos domingos';
      } else {
        if (isoDate === bookingState.dataConsulta) {
          btn.classList.add('selected');
        }

        btn.addEventListener('click', (function(dObj, iso){
          return function() {
            bookingState.dataConsulta = iso;
            bookingState.dataConsultaFormatada = formatarDataExtenso(dObj);
            atualizarSelecaoData(dObj);
          };
        })(dataDia, isoDate));
      }

      calDaysGrid.appendChild(btn);
    }

    atualizarTextoData();
  }

  function atualizarSelecaoData(dObj) {
    if (calDaysGrid) {
      calDaysGrid.querySelectorAll('.cal-day-cell').forEach(function(c){
        c.classList.remove('selected');
        if (c.getAttribute('data-date') === bookingState.dataConsulta) {
          c.classList.add('selected');
        }
      });
    }

    // Se for sábado, esconde período da noite
    var turnoNoite = document.getElementById('turno-noite-group');
    if (turnoNoite) {
      if (dObj.getDay() === 6) { // Sábado
        turnoNoite.style.display = 'none';
        // Se o horário atual era da noite, redefine para tarde
        if (['18:30', '19:30', '20:30'].indexOf(bookingState.horario) !== -1) {
          selecionarHorario('11:30');
        }
      } else {
        turnoNoite.style.display = 'flex';
      }
    }

    atualizarTextoData();
    atualizarResumoEmTempoReal();
    carregarDisponibilidadeDia(bookingState.dataConsulta);
  }

  function atualizarTextoData() {
    if (slotsSelectedDateText) {
      var partes = bookingState.dataConsulta.split('-');
      if (partes.length === 3) {
        var d = new Date(parseInt(partes[0], 10), parseInt(partes[1], 10) - 1, parseInt(partes[2], 10));
        slotsSelectedDateText.textContent = diasSemanaPt[d.getDay()] + ', ' + d.getDate() + ' de ' + mesesPt[d.getMonth()];
      }
    }
    if (liveSumDate) {
      liveSumDate.textContent = bookingState.dataConsultaFormatada.split(', ')[1] || bookingState.dataConsultaFormatada;
    }
  }

  function selecionarHorario(h) {
    bookingState.horario = h;
    document.querySelectorAll('.time-chip').forEach(function(chip){
      if (chip.getAttribute('data-time') === h) {
        chip.classList.add('active');
      } else {
        chip.classList.remove('active');
      }
    });
    if (liveSumTime) liveSumTime.textContent = h;
    atualizarResumoEmTempoReal();
  }

  function atualizarResumoEmTempoReal() {
    if (liveSumMod) {
      liveSumMod.textContent = bookingState.modalidade.indexOf('Presencial') !== -1 ? 'Presencial na Vila Ema' : 'Online por Videochamada';
    }
    if (liveSumTime) {
      liveSumTime.textContent = bookingState.horario;
    }
    if (liveSumFoco) {
      liveSumFoco.textContent = bookingState.foco;
    }
  }

  // Navegação do calendário
  if (calPrevBtn) {
    calPrevBtn.addEventListener('click', function(){
      calMes--;
      if (calMes < 0) { calMes = 11; calAno--; }
      renderCalendar(calAno, calMes);
    });
  }
  if (calNextBtn) {
    calNextBtn.addEventListener('click', function(){
      calMes++;
      if (calMes > 11) { calMes = 0; calAno++; }
      renderCalendar(calAno, calMes);
    });
  }

  // Alternador de Modalidade (Passo 1)
  if (bookingForm) {
    bookingForm.querySelectorAll('.booking-opt-btn').forEach(function(btn){
      btn.addEventListener('click', function(){
        var val = this.getAttribute('data-val');
        if (!val) return;
        bookingState.modalidade = val;
        bookingForm.querySelectorAll('.booking-opt-btn').forEach(function(b){
          b.classList.remove('active');
          b.setAttribute('aria-checked', 'false');
        });
        this.classList.add('active');
        this.setAttribute('aria-checked', 'true');
        atualizarResumoEmTempoReal();
      });
    });
  }

  // Chips de Foco Clínico (Passo 1)
  var focoChips = document.querySelectorAll('#booking-foco-chips .booking-chip-btn');
  focoChips.forEach(function(chip){
    chip.addEventListener('click', function(){
      var foco = this.getAttribute('data-foco');
      if (!foco) return;
      bookingState.foco = foco;
      focoChips.forEach(function(c){ c.classList.remove('active'); });
      this.classList.add('active');
      atualizarResumoEmTempoReal();
    });
  });

  // Chips de Horários (Passo 2)
  document.querySelectorAll('.time-chip').forEach(function(chip){
    chip.addEventListener('click', function(){
      var h = this.getAttribute('data-time');
      if (!h) return;
      selecionarHorario(h);
    });
  });

  // Render inicial do calendário
  renderCalendar(calAno, calMes);
  atualizarTextoData();
  atualizarResumoEmTempoReal();

  // Verifica status do backend Spring Boot e sincroniza disponibilidade
  verificarBackendStatus(function(online) {
    if (online) {
      carregarDisponibilidadeDia(bookingState.dataConsulta);
    }
  });

  /* Máscara automática de WhatsApp (XX) XXXXX-XXXX */
  var phoneInput = document.getElementById('book-phone');
  if (phoneInput) {
    phoneInput.addEventListener('input', function(e) {
      var val = e.target.value.replace(/\D/g, '');
      if (val.length > 11) val = val.slice(0, 11);
      if (val.length === 0) {
        e.target.value = '';
      } else if (val.length <= 2) {
        e.target.value = '(' + val;
      } else if (val.length <= 6) {
        e.target.value = '(' + val.slice(0, 2) + ') ' + val.slice(2);
      } else if (val.length <= 10) {
        e.target.value = '(' + val.slice(0, 2) + ') ' + val.slice(2, 6) + '-' + val.slice(6);
      } else {
        e.target.value = '(' + val.slice(0, 2) + ') ' + val.slice(2, 7) + '-' + val.slice(7, 11);
      }
    });
  }

  /* --- GERAÇÃO DE ARQUIVO .ICS (ICALENDAR COM ALARME NATIVO DE 48H) --- */
  function gerarArquivoICS(ag) {
    var partesData = ag.dataConsulta.split('-');
    var partesHora = ag.horario.split(':');
    var ano = parseInt(partesData[0], 10);
    var mes = parseInt(partesData[1], 10) - 1;
    var dia = parseInt(partesData[2], 10);
    var hora = parseInt(partesHora[0], 10);
    var min = parseInt(partesHora[1], 10);

    var dtStartObj = new Date(ano, mes, dia, hora, min, 0);
    var dtEndObj = new Date(dtStartObj.getTime() + (50 * 60 * 1000)); // 50 min de sessão

    function formatICSDate(d) {
      function pad(n) { return (n < 10 ? '0' : '') + n; }
      return d.getFullYear() +
        pad(d.getMonth() + 1) +
        pad(d.getDate()) + 'T' +
        pad(d.getHours()) +
        pad(d.getMinutes()) + '00';
    }

    var startStr = formatICSDate(dtStartObj);
    var endStr = formatICSDate(dtEndObj);
    var localizacao = ag.modalidade.indexOf('Presencial') !== -1 ?
      'Av. Vila Ema, 4060 - Vila Ema, São Paulo - SP' :
      'Atendimento Online via e-Psi / Google Meet';

    var icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Thalita de Paula Psicologia Clinica//Agendamento v2.0//PT',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      'UID:' + ag.id + '@psicologia.clinica',
      'DTSTAMP:' + formatICSDate(new Date()),
      'DTSTART:' + startStr,
      'DTEND:' + endStr,
      'SUMMARY:Sessão de Psicoterapia — Dra. Thalita de Paula',
      'DESCRIPTION:Consulta com Psicóloga Clínica (CRP 00/[00000]).\\nModalidade: ' + ag.modalidade + '\\nFoco: ' + ag.foco + '\\nProtocolo: ' + ag.protocolo + '\\n\\nLembrete de confirmação ética 48h antes via WhatsApp.\\nEm caso de reagendamento, favor avisar com antecedência.',
      'LOCATION:' + localizacao,
      'STATUS:CONFIRMED',
      // Alarme 1: 48 HORAS ANTES
      'BEGIN:VALARM',
      'TRIGGER:-PT48H',
      'ACTION:DISPLAY',
      'DESCRIPTION:Lembrete: Sua consulta de psicoterapia com Thalita de Paula acontece em 48 horas. Fique atento(a) ao WhatsApp para confirmação.',
      'END:VALARM',
      // Alarme 2: 2 HORAS ANTES
      'BEGIN:VALARM',
      'TRIGGER:-PT2H',
      'ACTION:DISPLAY',
      'DESCRIPTION:Lembrete: Sua consulta de psicoterapia com Thalita de Paula começa em 2 horas.',
      'END:VALARM',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    var blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8;' });
    var link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'consulta-psicologia-' + ag.protocolo.replace('#', '') + '.ics';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /* --- GERAÇÃO DE LINK GOOGLE CALENDAR WEB --- */
  function obterLinkGoogleCalendar(ag) {
    var partesData = ag.dataConsulta.split('-');
    var partesHora = ag.horario.split(':');
    var ano = parseInt(partesData[0], 10);
    var mes = parseInt(partesData[1], 10) - 1;
    var dia = parseInt(partesData[2], 10);
    var hora = parseInt(partesHora[0], 10);
    var min = parseInt(partesHora[1], 10);

    var dtStart = new Date(ano, mes, dia, hora, min, 0);
    var dtEnd = new Date(dtStart.getTime() + (50 * 60 * 1000));

    function formatGDate(d) {
      function pad(n) { return (n < 10 ? '0' : '') + n; }
      return d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate()) + 'T' + pad(d.getHours()) + pad(d.getMinutes()) + '00';
    }

    var title = encodeURIComponent('Sessão de Psicoterapia — Thalita de Paula');
    var dates = formatGDate(dtStart) + '/' + formatGDate(dtEnd);
    var details = encodeURIComponent('Sessão com Psicóloga Clínica (CRP 00/[00000]).\nModalidade: ' + ag.modalidade + '\nFoco: ' + ag.foco + '\nProtocolo: ' + ag.protocolo + '\nLembrete de confirmação 48h antes via WhatsApp.');
    var location = encodeURIComponent(ag.modalidade.indexOf('Presencial') !== -1 ? 'Av. Vila Ema, 4060 - Vila Ema - São Paulo - SP' : 'Online - Sala Segura e-Psi');

    return 'https://calendar.google.com/calendar/render?action=TEMPLATE&text=' + title + '&dates=' + dates + '&details=' + details + '&location=' + location;
  }

  /* --- SUBMISSÃO DO AGENDAMENTO --- */
  if (bookingForm) {
    bookingForm.addEventListener('submit', function(e) {
      e.preventDefault();

      var nome = (document.getElementById('book-name').value || '').trim();
      var tel = (document.getElementById('book-phone').value || '').trim();
      var email = (document.getElementById('book-email').value || '').trim();
      var notas = (document.getElementById('book-notes') ? document.getElementById('book-notes').value : '').trim();

      if (!nome || nome.length < 3) {
        alert('Por favor, informe seu nome completo.');
        document.getElementById('book-name').focus();
        return;
      }
      if (!tel || tel.length < 14) {
        alert('Por favor, informe seu WhatsApp com DDD.');
        document.getElementById('book-phone').focus();
        return;
      }
      if (!email || email.indexOf('@') === -1 || email.indexOf('.') === -1) {
        alert('Por favor, informe um endereço de e-mail válido.');
        document.getElementById('book-email').focus();
        return;
      }

      // Código de protocolo exclusivo (#PSI-XXXX)
      var randomCode = Math.floor(1000 + Math.random() * 9000);
      var protocolo = '#PSI-' + randomCode;

      function finalizarAgendamento(protocoloDefinido, idBackend) {
        // Cálculo da data e hora exata da consulta e do lembrete de 48h
        var partesData = bookingState.dataConsulta.split('-');
        var partesHora = bookingState.horario.split(':');
        var dtConsulta = new Date(
          parseInt(partesData[0], 10),
          parseInt(partesData[1], 10) - 1,
          parseInt(partesData[2], 10),
          parseInt(partesHora[0], 10),
          parseInt(partesHora[1], 10)
        );

        // 48 horas antes da consulta
        var dtLembrete48h = new Date(dtConsulta.getTime() - (48 * 60 * 60 * 1000));

        var novoAgendamento = {
          id: idBackend || ('psi_' + Date.now() + '_' + randomCode),
          protocolo: protocoloDefinido,
          nome: nome,
          telefone: tel,
          email: email,
          notas: notas,
          modalidade: bookingState.modalidade,
          foco: bookingState.foco,
          dataConsulta: bookingState.dataConsulta,
          dataConsultaFormatada: bookingState.dataConsultaFormatada,
          horario: bookingState.horario,
          dtConsultaTimestamp: dtConsulta.getTime(),
          dtLembrete48hTimestamp: dtLembrete48h.getTime(),
          status: 'pendente_48h',
          lembrete48hDisparado: false,
          criadoEm: new Date().toISOString()
        };

        bookingState.ultimoAgendamento = novoAgendamento;

        // Salva cópia no localStorage compartilhado para fallback
        try {
          var listaSalva = JSON.parse(localStorage.getItem('psico_agendamentos') || '[]');
          listaSalva.unshift(novoAgendamento);
          localStorage.setItem('psico_agendamentos', JSON.stringify(listaSalva));
        } catch (err) {
          console.warn('Erro ao salvar no localStorage:', err);
        }

        // Monta mensagem estruturada para o WhatsApp
        var modCurta = bookingState.modalidade.indexOf('Presencial') !== -1 ? 'Presencial (Vila Ema)' : 'Online (e-Psi)';
        var waMsg = 'Olá, Dra. Thalita! Realizei um pré-agendamento pelo site.\n\n' +
          '• Paciente: ' + nome + '\n' +
          '• Modalidade: ' + modCurta + '\n' +
          '• Data: ' + bookingState.dataConsultaFormatada + '\n' +
          '• Horário: ' + bookingState.horario + '\n' +
          '• Foco de Apoio: ' + bookingState.foco + '\n' +
          '• Protocolo: ' + protocoloDefinido + '\n' +
          '• WhatsApp: ' + tel + '\n' +
          '• E-mail: ' + email +
          (notas ? '\n• Observação: ' + notas : '') +
          '\n\n*Aviso: Estou ciente da confirmação ética 48h antes via WhatsApp. Obrigado(a)!*';

        var waUrl = 'https://wa.me/' + NUMERO + '?text=' + encodeURIComponent(waMsg);

        // Preenche os dados no modal
        document.getElementById('modal-proto-code').textContent = protocoloDefinido;
        document.getElementById('modal-summary-name').textContent = nome;
        document.getElementById('modal-summary-mod').textContent = modCurta;
        document.getElementById('modal-summary-datetime').textContent = bookingState.dataConsultaFormatada.split(', ')[1] + ' às ' + bookingState.horario;
        document.getElementById('modal-summary-foco').textContent = bookingState.foco;
        document.getElementById('modal-summary-email').textContent = email;
        document.getElementById('modal-summary-email-row').style.display = 'flex';

        if (bookingModalWa) bookingModalWa.href = waUrl;
        if (bookingModalGcal) bookingModalGcal.href = obterLinkGoogleCalendar(novoAgendamento);

        window.open(waUrl, '_blank', 'noopener,noreferrer');

        if (bookingModal) {
          bookingModal.classList.add('active');
          document.body.style.overflow = 'hidden';
        }
      }

      // 1. Prioridade Serverless: Cloud Firestore (Firebase)
      if (typeof FirestoreService !== 'undefined' && FirestoreService.isDisponivel()) {
        var agendamentoObj = {
          protocolo: protocolo,
          nome: nome,
          telefone: tel,
          email: email,
          modalidade: bookingState.modalidade,
          foco: bookingState.foco,
          dataConsulta: bookingState.dataConsulta,
          dataConsultaFormatada: bookingState.dataConsultaFormatada,
          horario: bookingState.horario,
          notas: notas
        };

        FirestoreService.criarAgendamento(
          agendamentoObj,
          function(docId) {
            finalizarAgendamento(protocolo, docId);
            carregarDisponibilidadeDia(bookingState.dataConsulta);
          },
          function(erroMsg) {
            alert(erroMsg || 'Horário indisponível no momento. Por favor selecione outro horário.');
            carregarDisponibilidadeDia(bookingState.dataConsulta);
          }
        );
      } else if (isBackendOnline && window.fetch) {
        // 2. Fallback para API Spring Boot (H2) se estiver rodando localmente
        var payload = {
          nome: nome,
          telefone: tel,
          email: email,
          modalidade: bookingState.modalidade.indexOf('Presencial') !== -1 ? 'presencial' : 'online',
          foco: bookingState.foco,
          dataConsulta: bookingState.dataConsulta,
          horario: bookingState.horario,
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
              finalizarAgendamento(item.protocolo, item.id);
              carregarDisponibilidadeDia(bookingState.dataConsulta);
            });
          } else if (res.status === 409) {
            return res.json().then(function(prob) {
              alert(prob.detail || 'Horário já reservado por outro paciente. Por favor escolha outro horário.');
              carregarDisponibilidadeDia(bookingState.dataConsulta);
            });
          } else {
            return res.json().then(function(prob) {
              alert(prob.detail || 'Não foi possível concluir o agendamento.');
            });
          }
        })
        .catch(function(err) {
          console.warn('Erro na requisição ao backend Spring Boot, utilizando modo local:', err);
          finalizarAgendamento(protocolo, null);
        });
      } else {
        // 3. Modo LocalStorage Offline
        finalizarAgendamento(protocolo, null);
      }
    });
  }

  // Ação de download do .ics pelo modal com feedback visual
  if (bookingModalCal) {
    bookingModalCal.addEventListener('click', function(){
      if (bookingState.ultimoAgendamento) {
        gerarArquivoICS(bookingState.ultimoAgendamento);
        var tip = document.getElementById('booking-modal-tip');
        if (tip) tip.style.display = 'block';

        var origText = bookingModalCal.innerHTML;
        bookingModalCal.innerHTML = '<svg class="ic" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg><span>Arquivo .ics baixado!</span>';
        setTimeout(function() {
          bookingModalCal.innerHTML = origText;
        }, 4000);
      } else {
        alert('Nenhum agendamento ativo encontrado.');
      }
    });
  }

  /* =========================================================
     11. FASE 3: TRIAGEM ACOLHEDORA & TERMÔMETRO EMOCIONAL
     ========================================================= */
  var triagemStep1 = document.getElementById('triagem-step-1');
  var triagemStep2 = document.getElementById('triagem-step-2');
  var triagemStep3 = document.getElementById('triagem-step-3');
  var btnTriagemVoltar = document.getElementById('btn-triagem-voltar');
  var btnTriagemReiniciar = document.getElementById('btn-triagem-reiniciar');
  var btnTriagemAplicar = document.getElementById('btn-triagem-aplicar');
  var triagemResFoco = document.getElementById('triagem-res-foco');
  var triagemResMod = document.getElementById('triagem-res-mod');
  var triagemFeedbackText = document.getElementById('triagem-feedback-text');

  var triagemState = {
    foco: '',
    modalidade: ''
  };

  var feedbacksPorFoco = {
    'Ansiedade & Estresse': 'O acompanhamento para ansiedade te ajudará a compreender os gatilhos de aceleração mental, praticar regulação fisiológica e recuperar noites de sono tranquilas.',
    'Esgotamento & Burnout': 'O foco em sobrecarga e burnout visa construir limites saudáveis na rotina profissional e pessoal, repondo a energia vital e prevenindo colapsos físicos e emocionais.',
    'Relacionamentos & Família': 'A psicoterapia focada em vínculos oferece clareza sobre dinâmicas repetitivas, fortalecimento da comunicação assertiva e capacidade de dizer "não" com gentileza e firmeza.',
    'Luto & Transições de Vida': 'Processar perdas, términos ou mudanças exige respeito ao seu próprio tempo. O espaço terapêutico acolhe sua dor sem pressa, ressignificando novos começos.',
    'Autoconhecimento & Autoestima': 'Desenvolver uma relação de acolhimento consigo mesmo é a chave para superar a autocrítica severa e viver com mais segurança, leveza e autenticidade.'
  };

  // Clique na Etapa 1 (Foco)
  document.querySelectorAll('[data-triagem-foco]').forEach(function(btn){
    btn.addEventListener('click', function(){
      triagemState.foco = this.getAttribute('data-triagem-foco');
      if (triagemStep1) triagemStep1.style.display = 'none';
      if (triagemStep2) {
        triagemStep2.style.display = 'block';
        triagemStep2.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    });
  });

  // Clique na Etapa 2 (Modalidade)
  document.querySelectorAll('[data-triagem-mod]').forEach(function(btn){
    btn.addEventListener('click', function(){
      triagemState.modalidade = this.getAttribute('data-triagem-mod');

      // Atualiza feedbacks
      if (triagemResFoco) triagemResFoco.textContent = triagemState.foco;
      if (triagemResMod) {
        var modCurta = triagemState.modalidade.indexOf('Presencial') !== -1 ? 'Presencial (Vila Ema)' : 'Online (e-Psi)';
        triagemResMod.textContent = modCurta;
      }
      if (triagemFeedbackText && feedbacksPorFoco[triagemState.foco]) {
        triagemFeedbackText.textContent = feedbacksPorFoco[triagemState.foco];
      }

      if (triagemStep2) triagemStep2.style.display = 'none';
      if (triagemStep3) {
        triagemStep3.style.display = 'block';
        triagemStep3.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    });
  });

  // Voltar para Etapa 1
  if (btnTriagemVoltar) {
    btnTriagemVoltar.addEventListener('click', function(){
      if (triagemStep2) triagemStep2.style.display = 'none';
      if (triagemStep1) triagemStep1.style.display = 'block';
    });
  }

  // Reiniciar Triagem
  if (btnTriagemReiniciar) {
    btnTriagemReiniciar.addEventListener('click', function(){
      triagemState.foco = '';
      triagemState.modalidade = '';
      if (triagemStep3) triagemStep3.style.display = 'none';
      if (triagemStep2) triagemStep2.style.display = 'none';
      if (triagemStep1) triagemStep1.style.display = 'block';
    });
  }

  // Aplicar opções no Motor de Agendamento da Fase 1
  if (btnTriagemAplicar) {
    btnTriagemAplicar.addEventListener('click', function(){
      // 1. Seleciona a modalidade no agendamento
      if (triagemState.modalidade) {
        var modBtn = document.querySelector('.booking-opt-btn[data-val="' + triagemState.modalidade + '"]');
        if (modBtn) modBtn.click();
      }

      // 2. Seleciona o foco clínico no agendamento
      if (triagemState.foco) {
        var chipBtn = document.querySelector('.booking-chip-btn[data-foco="' + triagemState.foco + '"]');
        if (chipBtn) chipBtn.click();
      }

      // 3. Rola suavemente até o agendamento
      var agendamentoSec = document.getElementById('agendamento');
      if (agendamentoSec) {
        agendamentoSec.scrollIntoView({ behavior: 'smooth' });
        
        // Destaque visual suave no calendário para convidar o próximo passo
        var calBox = document.querySelector('.cal-box');
        if (calBox) {
          calBox.style.transition = 'box-shadow .4s ease, border-color .4s ease';
          calBox.style.borderColor = 'var(--accent)';
          calBox.style.boxShadow = '0 0 25px rgba(208, 175, 118, 0.4)';
          setTimeout(function(){
            calBox.style.borderColor = '';
            calBox.style.boxShadow = '';
          }, 2000);
        }
      }
    });
  }

  /* =========================================================
     12. FASE 3: PLAYER DE ACOLHIMENTO EM ÁUDIO (VOICE BIO)
     ========================================================= */
  var voiceCard = document.getElementById('voice-bio');
  var btnVoicePlay = document.getElementById('btn-voice-play');
  var voicePlayIcon = document.getElementById('voice-play-icon');
  var voiceCurrentTime = document.getElementById('voice-current-time');
  var voiceSpeedBtn = document.getElementById('btn-voice-speed');
  var btnVoiceTranscript = document.getElementById('btn-voice-transcript');
  var voiceTranscriptText = document.getElementById('voice-transcript-text');

  var voiceState = {
    isPlaying: false,
    duration: 48, // 48 segundos
    currentTime: 0,
    speed: 1.0,
    audioCtx: null,
    oscillator: null,
    gainNode: null,
    timerInterval: null
  };

  // Gera som ambiente acolhedor e harmônico via Web Audio API (100% nativo e offline)
  function iniciarSomAmbiente() {
    try {
      var AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      if (!voiceState.audioCtx) {
        voiceState.audioCtx = new AudioContext();
      }
      if (voiceState.audioCtx.state === 'suspended') {
        voiceState.audioCtx.resume();
      }

      // Cria oscilador suave de frequência relaxante (Lydian 432Hz calming ambient)
      var osc = voiceState.audioCtx.createOscillator();
      var gain = voiceState.audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(216, voiceState.audioCtx.currentTime); // Tom harmônico relaxante
      gain.gain.setValueAtTime(0.01, voiceState.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.04, voiceState.audioCtx.currentTime + 1.5);

      osc.connect(gain);
      gain.connect(voiceState.audioCtx.destination);
      osc.start();

      voiceState.oscillator = osc;
      voiceState.gainNode = gain;
    } catch(e) {
      // AudioContext não suportado ou bloqueado sem permissão
    }
  }

  function pararSomAmbiente() {
    try {
      if (voiceState.gainNode && voiceState.audioCtx) {
        voiceState.gainNode.gain.exponentialRampToValueAtTime(0.001, voiceState.audioCtx.currentTime + 0.3);
      }
      setTimeout(function(){
        if (voiceState.oscillator) {
          voiceState.oscillator.stop();
          voiceState.oscillator.disconnect();
          voiceState.oscillator = null;
        }
      }, 350);
    } catch(e) {}
  }

  function formatarSegundos(seg) {
    var s = Math.floor(seg);
    var min = Math.floor(s / 60);
    var resto = s % 60;
    return min + ':' + (resto < 10 ? '0' : '') + resto;
  }

  function alternarPlayVoice() {
    if (!voiceState.isPlaying) {
      // Tocar
      voiceState.isPlaying = true;
      if (voicePlayIcon) voicePlayIcon.textContent = '⏸';
      if (voiceCard) voiceCard.classList.add('playing');
      iniciarSomAmbiente();

      voiceState.timerInterval = setInterval(function(){
        voiceState.currentTime += (0.5 * voiceState.speed);
        if (voiceCurrentTime) {
          voiceCurrentTime.textContent = formatarSegundos(voiceState.currentTime);
        }

        if (voiceState.currentTime >= voiceState.duration) {
          // Fim do áudio
          pausarVoice(true);
        }
      }, 500);

    } else {
      // Pausar
      pausarVoice(false);
    }
  }

  function pausarVoice(reset) {
    voiceState.isPlaying = false;
    if (voicePlayIcon) voicePlayIcon.textContent = '▶';
    if (voiceCard) voiceCard.classList.remove('playing');
    pararSomAmbiente();

    if (voiceState.timerInterval) {
      clearInterval(voiceState.timerInterval);
      voiceState.timerInterval = null;
    }

    if (reset) {
      voiceState.currentTime = 0;
      if (voiceCurrentTime) voiceCurrentTime.textContent = '0:00';
    }
  }

  if (btnVoicePlay) {
    btnVoicePlay.addEventListener('click', alternarPlayVoice);
  }

  // Alternador de velocidade (1.0x -> 1.25x -> 1.5x -> 1.0x)
  if (voiceSpeedBtn) {
    voiceSpeedBtn.addEventListener('click', function(){
      if (voiceState.speed === 1.0) {
        voiceState.speed = 1.25;
      } else if (voiceState.speed === 1.25) {
        voiceState.speed = 1.5;
      } else {
        voiceState.speed = 1.0;
      }
      voiceSpeedBtn.textContent = voiceState.speed.toFixed(1) + 'x';
    });
  }

  // Alternador de transcrição (Acessibilidade)
  if (btnVoiceTranscript && voiceTranscriptText) {
    btnVoiceTranscript.addEventListener('click', function(){
      var isHidden = voiceTranscriptText.style.display === 'none';
      if (isHidden) {
        voiceTranscriptText.style.display = 'block';
        btnVoiceTranscript.setAttribute('aria-expanded', 'true');
        btnVoiceTranscript.innerHTML = '<span>Ocultar transcrição</span> ▴';
      } else {
        voiceTranscriptText.style.display = 'none';
        btnVoiceTranscript.setAttribute('aria-expanded', 'false');
        btnVoiceTranscript.innerHTML = '<span>Ler transcrição do áudio</span> ▾';
      }
    });
  }

  function fecharModalBooking() {
    if (bookingModal) {
      bookingModal.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  if (bookingModalClose) bookingModalClose.addEventListener('click', fecharModalBooking);
  if (bookingModal) {
    bookingModal.addEventListener('click', function(e) {
      if (e.target === bookingModal) fecharModalBooking();
    });
  }

  document.addEventListener('keydown', function(e){
    if (e.key === 'Escape' && bookingModal && bookingModal.classList.contains('active')) {
      fecharModalBooking();
    }
  });

})();
