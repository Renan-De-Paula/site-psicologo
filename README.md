<div align="center">

# 🌿 Thalita de Paula | Plataforma Clínica & Sistema de Agendamento v2

**Landing Page de Alta Conversão, Motor de Agendamento com Lembrete 48h e Painel de Gestão da Agenda**

[![Versão](https://img.shields.io/badge/Versão-2.0.0-D0AF76?style=for-the-badge&logoColor=13171B)]()
[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/pt-BR/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://developer.mozilla.org/pt-BR/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript)
[![Dark Luxe](https://img.shields.io/badge/Tema-Noturno_Elegante-D0AF76?style=for-the-badge&logoColor=13171B)]()
[![Mobile First](https://img.shields.io/badge/Mobile--First-320px_a_4K-brightgreen?style=for-the-badge&logo=googlechrome&logoColor=white)]()
[![Vanilla](https://img.shields.io/badge/Zero_Frameworks-Vanilla_Puro-blueviolet?style=for-the-badge)]()

<br />

</div>

---

## 📌 Sobre a Versão 2.0 (v2-moderno)

Esta versão eleva o site de psicologia a uma **plataforma clínica completa**, integrando landing page de alta conversão, motor interativo de pré-agendamento e um **Painel de Gestão da Agenda para a Psicóloga** com monitoramento automático da **janela de 48 horas** para confirmação ética de presença via WhatsApp.

Construído 100% em **HTML5, CSS3 e JavaScript puro (Vanilla)** com persistência local estruturada (`localStorage`), garantindo carregamento instantâneo, privacidade de dados (LGPD), zero mensalidades de servidor e total independência de plataformas pagas.

---

## ⚡ Principais Funcionalidades da v2

### 1. 📅 Motor de Agendamento Clínico Inteligente (`#agendamento`)
- **Triagem de Modalidade & Foco:** Seleção de atendimento Presencial (Vila Ema) ou Online (e-Psi) e chips de motivos clínicos (*Ansiedade*, *Burnout*, *Relacionamentos*, *Luto*, *Autoconhecimento*).
- **Calendário Dinâmico em Tempo Real:** Bloqueio automático de datas passadas e domingos; seleção mensal intuitiva.
- **Divisão em Turnos:** Horários divididos em *Manhã*, *Tarde* e *Noite* com regras clínicas automáticas.
- **Card de Resumo Flutuante:** Feedback visual instantâneo da data e horário selecionados.
- **Modal de Confirmação Multicanal:**
  - Código de protocolo exclusivo (`#PSI-XXXX`).
  - Botão 1-clique para envio imediato no **WhatsApp** com mensagem padronizada.
  - Download de arquivo de calendário universal **`.ics` (RFC 5545)** com 2 alarmes nativos programados no celular do paciente (48 horas e 2 horas antes da sessão).
  - Link direto para abertura no **Google Calendar Web**.

### 2. 🗂️ Painel de Gestão da Agenda da Psicóloga (`painel-agenda.html`)
- **Métricas em Tempo Real (KPIs):** Contabiliza agendamentos totais, pendentes na janela de 48h, confirmados, futuros e concluídos.
- **Detector Automático da Janela de 48h:** Destaca visualmente em âmbar/dourado as consultas que acontecem nas próximas 48h e ainda não receberam lembrete.
- **Disparo de Confirmação 1-Clique WhatsApp:** Envia template de confirmação ética pré-formatado diretamente para o número do paciente e atualiza o status instantaneamente.
- **Gestão de Status:** Botões para confirmar presença, reagendar data/horário, marcar como concluído ou cancelar.
- **Cadastro Manual & Exportação:** Modal para registrar pacientes presenciais/telefone e botão para exportar relatório completo em **CSV (compatível com Excel e Google Sheets)**.

### 3. 🌿 Ferramentas Clínicas de Acolhimento & Ética
- **Triagem Acolhedora Interativa (`#triagem-acolhedora`):** Questionário não-diagnóstico de 2 etapas que ajuda o paciente indeciso a identificar o que está sentindo e já preenche o formulário de agendamento com 1 clique.
- **Player Voice Bio (`#voice-bio`):** Miniplayer na seção *Sobre Mim* com áudio harmônico calmante nativo (Web Audio API) e transcrição textual acessível (WCAG AAA).
- **Guia Transparente de Reembolso do Convênio (`#reembolso`):** Passo a passo ético de livre escolha (ANS) para o paciente consultar a prévia no app do seu plano e receber o reembolso via Nota Fiscal.
- **Política Ética de Confirmação 48h (`#politica-agendamento`):** Diretrizes claras sobre o respeito ao horário reservado e acolhimento à lista de espera.

---

## 📁 Estrutura de Diretórios da v2

```text
Psicologo-Moderno/
├── css/
│   ├── style.css                 # Estilos da landing page, agendamento, triagem e voice bio
│   └── painel.css                # Estilos do painel de controle administrativo da agenda
├── js/
│   ├── script.js                 # Lógica da landing page, calendário, .ics e triagem
│   └── painel.js                 # Lógica do painel da psicóloga, janela 48h e exportação CSV
├── img/
│   ├── screenshot-desktop.png    # Captura Desktop
│   ├── screenshot-mobile.png     # Captura Mobile
│   ├── screenshot-full.png       # Captura da página completa
│   ├── psicologa-exemplo.jpg     # Foto da psicóloga
│   ├── consultorio-1.jpg         # Foto do consultório
│   └── favicon.svg               # Favicon SVG
├── index.html                    # Landing page pública com motor de agendamento integrado
├── painel-agenda.html            # Painel administrativo da profissional
├── privacidade.html              # Política de Privacidade & LGPD
├── .gitignore                    # Regras de exclusão do Git
├── LICENSE                       # Licença do projeto
└── README.md                     # Documentação completa
```

---

## 💻 Como Usar

1. **Página Pública:** Abra `index.html` em qualquer navegador.
2. **Painel Administrativo:** Abra `painel-agenda.html` (ou acesse pelo link discreto no rodapé da página pública).
3. **Sem Servidores ou Dependências:** 100% estático, pronto para GitHub Pages, Vercel ou Netlify.
