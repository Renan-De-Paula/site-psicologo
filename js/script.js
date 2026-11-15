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
     6. ALTERNADOR DE MODALIDADES (Presencial vs Online)
     ========================================================= */
  var modalityTabs = document.querySelectorAll('.modality-tab');
  modalityTabs.forEach(function(tab){
    tab.addEventListener('click', function(){
      var targetId = 'tab-' + this.getAttribute('data-tab');
      modalityTabs.forEach(function(t){
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      this.classList.add('active');
      this.setAttribute('aria-selected', 'true');

      document.querySelectorAll('.modality-content').forEach(function(content){
        if (content.id === targetId) {
          content.classList.add('active');
          content.removeAttribute('hidden');
        } else {
          content.classList.remove('active');
          content.setAttribute('hidden', '');
        }
      });
    });
  });

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
     10. SISTEMA DE AGENDAMENTO COM WHATSAPP & MODAL DE CONFIRMAÇÃO
     ========================================================= */
  var bookingForm = document.getElementById('site-booking-form');
  var bookingModal = document.getElementById('booking-modal-overlay');
  var bookingModalClose = document.getElementById('booking-modal-close');
  var bookingModalOk = document.getElementById('booking-modal-ok');
  var bookingModalWa = document.getElementById('booking-modal-wa');

  var bookingState = {
    modalidade: 'Presencial no consultório (Vila Ema)',
    periodo: 'Tarde (13h às 18h)'
  };

  if (bookingForm) {
    // Alternadores de botões (modalidade e período)
    bookingForm.querySelectorAll('.booking-opt-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var type = this.getAttribute('data-type');
        var val = this.getAttribute('data-val');
        if (!type || !val) return;

        bookingState[type] = val;
        var parentGroup = this.closest('.booking-options-row');
        if (parentGroup) {
          parentGroup.querySelectorAll('.booking-opt-btn').forEach(function(b) {
            b.classList.remove('active');
            b.setAttribute('aria-checked', 'false');
          });
        }
        this.classList.add('active');
        this.setAttribute('aria-checked', 'true');
      });
    });

    /* Máscara automática de telefone celular (XX) XXXXX-XXXX */
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

    bookingForm.addEventListener('submit', function(e) {
      e.preventDefault();

      var nome = (document.getElementById('book-name').value || '').trim();
      var tel = (document.getElementById('book-phone').value || '').trim();
      var email = (document.getElementById('book-email').value || '').trim();
      var motivo = (document.getElementById('book-notes') ? document.getElementById('book-notes').value : '').trim();

      if (!nome) {
        alert('Por favor, informe seu nome completo.');
        document.getElementById('book-name').focus();
        return;
      }
      if (!tel) {
        alert('Por favor, informe seu WhatsApp para contato.');
        document.getElementById('book-phone').focus();
        return;
      }

      // Gera código de protocolo único e elegante
      var randomCode = Math.floor(1000 + Math.random() * 9000);
      var protocolo = '#PSI-' + randomCode;

      // Monta a mensagem para WhatsApp
      var modSimples = bookingState.modalidade.indexOf('Presencial') !== -1 ? 'Presencial (Vila Ema)' : 'Online (e-Psi)';
      var perSimples = bookingState.periodo.split(' ')[0];

      var waMsg = 'Olá, Dra. Thalita! Gostaria de solicitar agendamento pelo site.\n' +
                  '• Paciente: ' + nome + '\n' +
                  '• Modalidade: ' + modSimples + '\n' +
                  '• Período: ' + perSimples + '\n' +
                  '• Protocolo: ' + protocolo +
                  (email ? '\n• E-mail: ' + email : '') +
                  (motivo ? '\n• Observação: ' + motivo : '');

      var waUrl = 'https://wa.me/' + NUMERO + '?text=' + encodeURIComponent(waMsg);

      // Preenche dados no modal de confirmação
      document.getElementById('modal-proto-code').textContent = protocolo;
      document.getElementById('modal-summary-name').textContent = nome;
      document.getElementById('modal-summary-mod').textContent = modSimples;
      document.getElementById('modal-summary-per').textContent = perSimples;
      if (email) {
        document.getElementById('modal-summary-email').textContent = email;
        document.getElementById('modal-summary-email-row').style.display = 'block';
      } else {
        document.getElementById('modal-summary-email-row').style.display = 'none';
      }

      // Link do botão WhatsApp no modal
      if (bookingModalWa) {
        bookingModalWa.href = waUrl;
      }

      // Abre WhatsApp em nova aba
      window.open(waUrl, '_blank', 'noopener,noreferrer');

      // Exibe modal na tela
      if (bookingModal) {
        bookingModal.classList.add('active');
        document.body.style.overflow = 'hidden';
      }

      console.log('Agendamento registrado:', {
        protocolo: protocolo,
        nome: nome,
        telefone: tel,
        email: email,
        modalidade: modSimples,
        periodo: perSimples,
        data: new Date().toISOString()
      });
    });
  }

  function fecharModalBooking() {
    if (bookingModal) {
      bookingModal.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  if (bookingModalClose) bookingModalClose.addEventListener('click', fecharModalBooking);
  if (bookingModalOk) bookingModalOk.addEventListener('click', fecharModalBooking);
  if (bookingModal) {
    bookingModal.addEventListener('click', function(e) {
      if (e.target === bookingModal) fecharModalBooking();
    });
  }

})();
