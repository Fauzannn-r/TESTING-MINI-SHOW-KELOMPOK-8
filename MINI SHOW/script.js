/* ==========================================================================
   NetFix — Game Engine, Visualisasi Topologi Canvas & Siklus Keputusan ADDIE
   Siklus: 1. Amati -> 2. Duga -> 3. Uji -> 4. Simpulkan -> 5. Evaluasi
   File: script.js
   ========================================================================== */

(function () {
  const state = {
    currentView: "view-home",
    activeCaseIndex: 0,
    step: 1, // 1:Amati, 2:Duga, 3:Uji, 4:Simpulkan, 5:Evaluasi
    score: 0,
    caseScores: {},
    completedCases: {},
    selectedHypothesis: null,
    executedTests: {},
    selectedSolution: null,
    isFixed: false,
    activeCodeTab: "index.html"
  };

  let animFrameId = null;
  let packets = [];

  function initPackets() {
    packets = [
      { progress: 0.1, speed: 0.006, link: "router-switch" },
      { progress: 0.55, speed: 0.006, link: "switch-pc" },
      { progress: 0.3, speed: 0.005, link: "router-server" }
    ];
  }

  function switchView(viewId) {
    state.currentView = viewId;
    document.querySelectorAll(".view-section").forEach(function (sec) {
      sec.classList.toggle("active", sec.id === viewId);
    });
    document.querySelectorAll("[data-nav]").forEach(function (btn) {
      btn.classList.toggle("btn-active-tab", btn.getAttribute("data-nav") === viewId);
    });
    if (viewId === "view-cases") {
      renderCaseCards();
    } else if (viewId === "view-sim") {
      resizeCanvas();
      renderSimulationStep();
    } else if (viewId === "view-summary") {
      renderSummaryView();
    } else if (viewId === "view-code") {
      renderCodeViewer();
    }
  }

  function renderCaseCards() {
    const container = document.getElementById("casesContainer");
    if (!container) return;
    container.innerHTML = "";
    window.NETFIX_CASES.forEach(function (c, idx) {
      const done = Boolean(state.completedCases[c.id]);
      const best = state.caseScores[c.id] || 0;
      const card = document.createElement("div");
      card.className = "case-card";
      card.innerHTML =
        '<div>' +
          '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.6rem;">' +
            '<span style="font-size:0.75rem;color:var(--accent-cyan);font-weight:700;">' + c.code + '</span>' +
            '<span class="difficulty-badge ' + c.diffClass + '">' + c.difficulty + '</span>' +
          '</div>' +
          '<h3 style="font-size:1.05rem;margin-bottom:0.45rem;">' + c.title + '</h3>' +
          '<p style="font-size:0.8rem;color:var(--text-muted);margin-bottom:0.75rem;">' + c.kompetensi + '</p>' +
          '<p style="font-size:0.83rem;color:var(--text-main);background:rgba(7,17,38,0.65);padding:0.6rem;border-radius:8px;border:1px solid var(--border-color);">' +
            c.symptomReport +
          '</p>' +
        '</div>' +
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-top:1rem;padding-top:0.75rem;border-top:1px solid var(--border-color);">' +
          '<span style="font-size:0.8rem;color:' + (done ? 'var(--accent-lime)' : 'var(--text-muted)') + ';font-weight:600;">' +
            (done ? '✓ Selesai (' + best + ' Poin)' : 'Belum Diselesaikan') +
          '</span>' +
          '<button type="button" class="btn btn-primary btn-start-case" data-case-idx="' + idx + '">' +
            (done ? 'Mainkan Ulang' : 'Mulai Diagnosis →') +
          '</button>' +
        '</div>';
      container.appendChild(card);
    });

    container.querySelectorAll(".btn-start-case").forEach(function (btn) {
      btn.addEventListener("click", function () {
        const idx = parseInt(btn.getAttribute("data-case-idx"), 10);
        startCase(idx);
      });
    });
  }

  function startCase(idx) {
    window.NetFixAudio.click();
    state.activeCaseIndex = idx;
    state.step = 1;
    state.selectedHypothesis = null;
    state.executedTests = {};
    state.selectedSolution = null;
    state.isFixed = false;
    const c = window.NETFIX_CASES[idx];
    const term = document.getElementById("terminalOutput");
    if (term) {
      term.innerHTML =
        '<div class="term-line">[SYSTEM] Memuat simulasi ' + c.code + ' — ' + c.title + '...</div>' +
        '<div class="term-line term-warn">[ALERT] Anomali terdeteksi: ' + c.brokenNodeLabel + '</div>';
    }
    switchView("view-sim");
  }

  function appendTerminal(cmd, output, isWarn) {
    const term = document.getElementById("terminalOutput");
    if (!term) return;
    const div = document.createElement("div");
    div.className = "term-line";
    div.innerHTML =
      '<div class="term-cmd">root@smk-tkj:~# ' + cmd + '</div>' +
      '<div class="' + (isWarn ? 'term-warn' : '') + '" style="white-space:pre-line;">' + output + '</div>';
    term.appendChild(div);
    term.scrollTop = term.scrollHeight;
  }

  function renderSimulationStep() {
    const c = window.NETFIX_CASES[state.activeCaseIndex];
    if (!c) return;

    document.getElementById("simCaseTitle").textContent = c.code + " — " + c.title;
    document.getElementById("simCaseSub").textContent = c.kompetensi;
    document.getElementById("simStatusBadge").textContent = state.isFixed ? "STATUS: JARINGAN NORMAL" : "STATUS: GANGGUAN TERDETEKSI";
    document.getElementById("simStatusBadge").className = "difficulty-badge " + (state.isFixed ? "diff-easy" : "diff-hard");

    // Update step pills
    const stepNames = [
      { id: 1, label: "1. Amati" },
      { id: 2, label: "2. Duga" },
      { id: 3, label: "3. Uji" },
      { id: 4, label: "4. Simpulkan" },
      { id: 5, label: "5. Evaluasi" }
    ];
    const tracker = document.getElementById("stepTracker");
    tracker.innerHTML = "";
    stepNames.forEach(function (s) {
      const sp = document.createElement("div");
      sp.className = "step-pill" + (state.step === s.id ? " current" : (state.step > s.id ? " done" : ""));
      sp.textContent = s.label;
      tracker.appendChild(sp);
    });

    const panel = document.getElementById("decisionPanelContent");
    panel.innerHTML = "";

    if (state.step === 1) {
      // Tahap 1: AMATI
      let cluesHtml = "";
      c.observeClues.forEach(function (cl) {
        cluesHtml += '<li style="margin-bottom:0.4rem;">' + cl + '</li>';
      });
      panel.innerHTML =
        '<h4 style="color:var(--accent-cyan);margin-bottom:0.4rem;">Tahap 1: Amati Gejala Gangguan (Observe)</h4>' +
        '<p style="font-size:0.85rem;color:var(--text-muted);margin-bottom:0.75rem;">Perhatikan laporan keluhan dan indikator merah berkedip (Signaling Principle) pada diagram topologi di sebelah kiri:</p>' +
        '<div style="background:rgba(7,17,38,0.7);border:1px solid var(--border-color);padding:0.8rem;border-radius:10px;font-size:0.85rem;margin-bottom:0.85rem;">' +
          '<strong>Laporan Kasus:</strong> ' + c.symptomReport +
          '<ul style="margin-top:0.6rem;padding-left:1.2rem;color:var(--text-muted);">' + cluesHtml + '</ul>' +
        '</div>' +
        '<button type="button" class="btn btn-primary" id="btnNextToDuga">Lanjut ke Tahap 2: Rumuskan Dugaan (Duga) →</button>';

      document.getElementById("btnNextToDuga").addEventListener("click", function () {
        window.NetFixAudio.click();
        state.step = 2;
        renderSimulationStep();
      });
    } else if (state.step === 2) {
      // Tahap 2: DUGA (Embedded Assessment)
      panel.innerHTML =
        '<h4 style="color:var(--accent-cyan);margin-bottom:0.4rem;">Tahap 2: Duga Penyebab Masalah (Hypothesize)</h4>' +
        '<p style="font-size:0.85rem;color:var(--text-muted);">Berdasarkan gejala yang diamati, pilih hipotesis penyebab gangguan yang paling logis:</p>' +
        '<div class="choice-list" id="hypoChoices"></div>' +
        '<div id="hypoFeedback"></div>';

      const list = document.getElementById("hypoChoices");
      c.hypotheses.forEach(function (h) {
        const b = document.createElement("button");
        b.type = "button";
        const isSel = state.selectedHypothesis && state.selectedHypothesis.id === h.id;
        b.className = "choice-btn" + (isSel ? (h.correct ? " selected-correct" : " selected-wrong") : "");
        b.textContent = h.text;
        b.addEventListener("click", function () {
          state.selectedHypothesis = h;
          if (h.correct) {
            window.NetFixAudio.success();
          } else {
            window.NetFixAudio.error();
          }
          renderSimulationStep();
        });
        list.appendChild(b);
      });

      if (state.selectedHypothesis) {
        const fb = document.getElementById("hypoFeedback");
        fb.innerHTML =
          '<div class="feedback-banner" style="border-color:' + (state.selectedHypothesis.correct ? 'var(--accent-lime)' : 'var(--accent-amber)') + ';">' +
            '<strong>Umpan Balik Hipotesis:</strong> ' + state.selectedHypothesis.feedback +
          '</div>' +
          '<div style="margin-top:0.75rem;display:flex;justify-content:flex-end;">' +
            '<button type="button" class="btn btn-primary" id="btnNextToUji">Lanjut ke Tahap 3: Uji Jaringan (Test) →</button>' +
          '</div>';
        document.getElementById("btnNextToUji").addEventListener("click", function () {
          window.NetFixAudio.click();
          state.step = 3;
          renderSimulationStep();
        });
      }
    } else if (state.step === 3) {
      // Tahap 3: UJI (Branching Scenario Tools)
      panel.innerHTML =
        '<h4 style="color:var(--accent-cyan);margin-bottom:0.4rem;">Tahap 3: Uji & Periksa Jaringan (Branching Scenario)</h4>' +
        '<p style="font-size:0.85rem;color:var(--text-muted);">Pilih instrumen pengujian diagnostik untuk membuktikan hipotesis Anda (hasil uji tampil di Terminal Log bawah):</p>' +
        '<div class="choice-list" id="testChoices"></div>' +
        '<div id="testNextWrap" style="margin-top:0.85rem;"></div>';

      const tList = document.getElementById("testChoices");
      c.tests.forEach(function (t) {
        const ran = Boolean(state.executedTests[t.id]);
        const b = document.createElement("button");
        b.type = "button";
        b.className = "choice-btn" + (ran ? " selected-correct" : "");
        b.innerHTML =
          '<div style="display:flex;justify-content:space-between;align-items:center;">' +
            '<span><strong>' + t.label + '</strong> <code style="color:var(--accent-cyan);">(' + t.cmd + ')</code></span>' +
            '<span style="font-size:0.75rem;color:' + (ran ? 'var(--accent-lime)' : 'var(--text-muted)') + ';">' + (ran ? '✓ Sudah Diuji' : 'Jalankan Uji') + '</span>' +
          '</div>';
        b.addEventListener("click", function () {
          window.NetFixAudio.scan();
          state.executedTests[t.id] = true;
          appendTerminal(t.cmd, t.output, t.essential);
          renderSimulationStep();
        });
        tList.appendChild(b);
      });

      const ranCount = Object.keys(state.executedTests).length;
      if (ranCount > 0) {
        const wrap = document.getElementById("testNextWrap");
        wrap.innerHTML =
          '<div class="feedback-banner">' +
            'Anda telah menjalankan <strong>' + ranCount + '</strong> pengujian diagnostik. Periksa hasil output pada Terminal Log sebelum menyimpulkan perbaikan.' +
          '</div>' +
          '<div style="margin-top:0.75rem;display:flex;justify-content:flex-end;">' +
            '<button type="button" class="btn btn-primary" id="btnNextToSimpulkan">Lanjut ke Tahap 4: Simpulkan Solusi →</button>' +
          '</div>';
        document.getElementById("btnNextToSimpulkan").addEventListener("click", function () {
          window.NetFixAudio.click();
          state.step = 4;
          renderSimulationStep();
        });
      }
    } else if (state.step === 4) {
      // Tahap 4: SIMPULKAN
      panel.innerHTML =
        '<h4 style="color:var(--accent-cyan);margin-bottom:0.4rem;">Tahap 4: Simpulkan & Terapkan Perbaikan (Conclude)</h4>' +
        '<p style="font-size:0.85rem;color:var(--text-muted);">Berdasarkan bukti pengujian di terminal, pilih tindakan perbaikan yang tepat:</p>' +
        '<div class="choice-list" id="solChoices"></div>' +
        '<div id="solFeedback"></div>';

      const sList = document.getElementById("solChoices");
      c.solutions.forEach(function (s) {
        const isSel = state.selectedSolution && state.selectedSolution.id === s.id;
        const b = document.createElement("button");
        b.type = "button";
        b.className = "choice-btn" + (isSel ? (s.correct ? " selected-correct" : " selected-wrong") : "");
        b.textContent = s.text;
        b.addEventListener("click", function () {
          state.selectedSolution = s;
          if (s.correct) {
            state.isFixed = true;
            window.NetFixAudio.success();
            appendTerminal("netfix --apply-fix", "[SUCCESS] Perbaikan diterapkan. Aliran paket data kembali normal!", false);
          } else {
            state.isFixed = false;
            window.NetFixAudio.error();
            appendTerminal("netfix --apply-fix", "[FAILED] Tindakan belum mengatasi akar gangguan jaringan.", true);
          }
          renderSimulationStep();
        });
        sList.appendChild(b);
      });

      if (state.selectedSolution) {
        const sfb = document.getElementById("solFeedback");
        sfb.innerHTML =
          '<div class="feedback-banner" style="border-color:' + (state.selectedSolution.correct ? 'var(--accent-lime)' : 'var(--accent-red)') + ';">' +
            '<strong>Hasil Tindakan:</strong> ' + state.selectedSolution.explanation +
          '</div>' +
          (state.selectedSolution.correct
            ? '<div style="margin-top:0.75rem;display:flex;justify-content:flex-end;">' +
                '<button type="button" class="btn btn-lime" id="btnFinishCase">Lihat Evaluasi & Skor Kasus (Tahap 5) →</button>' +
              '</div>'
            : '<p style="font-size:0.8rem;color:var(--accent-amber);margin-top:0.5rem;">Silakan pilih solusi perbaikan yang tepat hingga status jaringan pulih.</p>');
        const finBtn = document.getElementById("btnFinishCase");
        if (finBtn) {
          finBtn.addEventListener("click", function () {
            finalizeCaseScore(c);
          });
        }
      }
    } else if (state.step === 5) {
      // Tahap 5: EVALUASI
      const earned = state.caseScores[c.id] || 0;
      panel.innerHTML =
        '<h4 style="color:var(--accent-lime);margin-bottom:0.4rem;">Tahap 5: Evaluasi Diagnosis (Feedback & Scoring)</h4>' +
        '<div class="feedback-banner" style="border-color:var(--accent-lime);">' +
          '<div style="font-size:1.4rem;font-weight:800;color:var(--accent-lime);margin-bottom:0.35rem;">Skor Kasus: ' + earned + ' / 100</div>' +
          '<p style="font-size:0.85rem;">Selamat! Anda telah menyelesaikan siklus diagnosis <strong>Amati → Duga → Uji → Simpulkan → Evaluasi</strong> pada <strong>' + c.title + '</strong>.</p>' +
        '</div>' +
        '<div style="display:flex;gap:0.6rem;margin-top:1rem;flex-wrap:wrap;">' +
          '<button type="button" class="btn btn-primary" id="btnBackToCases">Pilih Kasus Lainnya</button>' +
          '<button type="button" class="btn btn-outline" id="btnGoSummary">Lihat Summary Report Keseluruhan</button>' +
        '</div>';

      document.getElementById("btnBackToCases").addEventListener("click", function () {
        window.NetFixAudio.click();
        switchView("view-cases");
      });
      document.getElementById("btnGoSummary").addEventListener("click", function () {
        window.NetFixAudio.click();
        switchView("view-summary");
      });
    }
  }

  function finalizeCaseScore(c) {
    window.NetFixAudio.success();
    let pts = 40; // Base completion
    if (state.selectedHypothesis && state.selectedHypothesis.correct) pts += 30;
    const essentialRan = c.tests.some(function (t) { return t.essential && state.executedTests[t.id]; });
    if (essentialRan) pts += 30;
    state.caseScores[c.id] = pts;
    state.completedCases[c.id] = true;
    // Recalculate total score
    let total = 0;
    Object.keys(state.caseScores).forEach(function (k) { total += state.caseScores[k]; });
    state.score = total;
    document.getElementById("topScoreDisplay").textContent = "Skor: " + state.score;
    state.step = 5;
    renderSimulationStep();
  }

  function renderSummaryView() {
    const tbody = document.getElementById("summaryTableBody");
    if (!tbody) return;
    tbody.innerHTML = "";
    let totalScore = 0;
    let doneCount = 0;

    window.NETFIX_CASES.forEach(function (c) {
      const done = Boolean(state.completedCases[c.id]);
      const sc = state.caseScores[c.id] || 0;
      if (done) doneCount += 1;
      totalScore += sc;
      const tr = document.createElement("tr");
      tr.innerHTML =
        '<td style="padding:0.65rem;border-bottom:1px solid var(--border-color);font-weight:600;">' + c.code + '</td>' +
        '<td style="padding:0.65rem;border-bottom:1px solid var(--border-color);">' + c.title + '</td>' +
        '<td style="padding:0.65rem;border-bottom:1px solid var(--border-color);"><span class="difficulty-badge ' + c.diffClass + '">' + c.difficulty + '</span></td>' +
        '<td style="padding:0.65rem;border-bottom:1px solid var(--border-color);color:' + (done ? 'var(--accent-lime)' : 'var(--text-muted)') + ';font-weight:700;">' +
          (done ? 'Tuntas' : 'Belum') +
        '</td>' +
        '<td style="padding:0.65rem;border-bottom:1px solid var(--border-color);text-align:right;font-weight:700;">' + sc + ' / 100</td>';
      tbody.appendChild(tr);
    });

    document.getElementById("summaryTotalCases").textContent = doneCount + " / " + window.NETFIX_CASES.length + " Kasus";
    document.getElementById("summaryTotalScore").textContent = totalScore + " / 300 Poin";
    const badgeEl = document.getElementById("summaryRankBadge");
    if (doneCount === 3 && totalScore >= 270) {
      badgeEl.textContent = "Senior Network Troubleshooter (Sangat Kompeten)";
      badgeEl.style.color = "var(--accent-lime)";
    } else if (doneCount >= 1) {
      badgeEl.textContent = "Junior Network Technician (Sedang Berlatih)";
      badgeEl.style.color = "var(--accent-cyan)";
    } else {
      badgeEl.textContent = "Pemula — Silakan Selesaikan Simulasi Kasus";
      badgeEl.style.color = "var(--text-muted)";
    }
  }

  function renderCodeViewer() {
    const codeView = document.getElementById("codeBlockContent");
    if (!codeView || !window.NETFIX_SOURCE_FILES) return;
    codeView.textContent = window.NETFIX_SOURCE_FILES[state.activeCodeTab] || "";
    document.querySelectorAll("[data-code-file]").forEach(function (btn) {
      btn.classList.toggle("btn-active-tab", btn.getAttribute("data-code-file") === state.activeCodeTab);
    });
  }

  // ============================================================================
  // Canvas Network Topology Animation (Dual Coding & Signaling Principle)
  // ============================================================================
  function resizeCanvas() {
    const canvas = document.getElementById("topologyCanvas");
    if (!canvas) return;
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = Math.max(320, Math.floor(rect.width));
    canvas.height = Math.max(240, Math.floor(rect.height));
  }

  function drawTopology() {
    const canvas = document.getElementById("topologyCanvas");
    if (canvas && state.currentView === "view-sim") {
      const ctx = canvas.getContext("2d");
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      const c = window.NETFIX_CASES[state.activeCaseIndex] || window.NETFIX_CASES[0];
      const broken = state.isFixed ? null : c.brokenLink;

      const nodes = {
        router: { x: w * 0.22, y: h * 0.50, label: "Router-GW", ip: "192.168.10.1" },
        switchNode: { x: w * 0.52, y: h * 0.50, label: "Switch-Lab", ip: "Layer 2" },
        pc: { x: w * 0.82, y: h * 0.30, label: "PC-Client-01", ip: "192.168.10.25" },
        server: { x: w * 0.82, y: h * 0.74, label: "Server-DNS/Web", ip: "10.10.10.2" }
      };

      const links = [
        { id: "router-switch", from: nodes.router, to: nodes.switchNode },
        { id: "switch-pc", from: nodes.switchNode, to: nodes.pc },
        { id: "router-server", from: nodes.switchNode, to: nodes.server }
      ];

      // Draw links
      links.forEach(function (lnk) {
        const isBrk = broken === lnk.id;
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(lnk.from.x, lnk.from.y);
        ctx.lineTo(lnk.to.x, lnk.to.y);
        ctx.lineWidth = 3;
        ctx.strokeStyle = isBrk ? "#ff4d6d" : "#24589c";
        if (isBrk) ctx.setLineDash([7, 5]);
        ctx.stroke();
        ctx.restore();

        // Signaling Principle: Pulsing Warning Indicator on Broken Link
        if (isBrk) {
          const mx = (lnk.from.x + lnk.to.x) / 2;
          const my = (lnk.from.y + lnk.to.y) / 2;
          const pulse = 10 + Math.sin(Date.now() * 0.008) * 4;
          ctx.save();
          ctx.beginPath();
          ctx.arc(mx, my, pulse, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(255, 77, 109, 0.28)";
          ctx.fill();
          ctx.beginPath();
          ctx.arc(mx, my, 6, 0, Math.PI * 2);
          ctx.fillStyle = "#ff4d6d";
          ctx.fill();
          ctx.fillStyle = "#ffd6de";
          ctx.font = "bold 11px Inter, sans-serif";
          ctx.textAlign = "center";
          ctx.fillText("⚠ " + c.brokenNodeLabel, mx, my - 14);
          ctx.restore();
        }
      });

      // Animate packets along healthy links
      packets.forEach(function (pkt) {
        const lnk = links.find(function (l) { return l.id === pkt.link; });
        if (!lnk) return;
        const isBrk = broken === lnk.id;
        pkt.progress += pkt.speed;
        if (pkt.progress > 1) pkt.progress = 0;
        const limit = isBrk ? 0.48 : 1.0;
        const p = Math.min(pkt.progress, limit);
        const px = lnk.from.x + (lnk.to.x - lnk.from.x) * p;
        const py = lnk.from.y + (lnk.to.y - lnk.from.y) * p;
        ctx.save();
        ctx.beginPath();
        ctx.arc(px, py, 4.5, 0, Math.PI * 2);
        ctx.fillStyle = isBrk ? "#ffb800" : "#a8ff35";
        ctx.fill();
        ctx.restore();
      });

      // Draw nodes
      Object.keys(nodes).forEach(function (key) {
        const nd = nodes[key];
        ctx.save();
        ctx.beginPath();
        ctx.arc(nd.x, nd.y, 22, 0, Math.PI * 2);
        ctx.fillStyle = "#132747";
        ctx.fill();
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = state.isFixed ? "#a8ff35" : "#00d2ff";
        ctx.stroke();

        ctx.fillStyle = "#f0f6ff";
        ctx.font = "bold 11px Inter, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(nd.label, nd.x, nd.y + 36);
        ctx.fillStyle = "#9ab0d1";
        ctx.font = "10px Inter, sans-serif";
        ctx.fillText(nd.ip, nd.x, nd.y + 50);
        ctx.restore();
      });
    }
    animFrameId = window.requestAnimationFrame(drawTopology);
  }

  window.addEventListener("load", function () {
    initPackets();
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Navigation buttons
    document.querySelectorAll("[data-nav]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        window.NetFixAudio.click();
        switchView(btn.getAttribute("data-nav"));
      });
    });

    // Hero buttons
    const btnHeroStart = document.getElementById("btnHeroStart");
    if (btnHeroStart) {
      btnHeroStart.addEventListener("click", function () {
        window.NetFixAudio.click();
        switchView("view-cases");
      });
    }
    const btnHeroCode = document.getElementById("btnHeroCode");
    if (btnHeroCode) {
      btnHeroCode.addEventListener("click", function () {
        window.NetFixAudio.click();
        switchView("view-code");
      });
    }

    // Audio Mute button
    const btnMute = document.getElementById("btnToggleAudio");
    if (btnMute) {
      btnMute.addEventListener("click", function () {
        const m = window.NetFixAudio.toggleMute();
        btnMute.textContent = m ? "🔇 Audio: Off" : "🔊 Audio: On";
      });
    }

    // Code viewer file buttons
    document.querySelectorAll("[data-code-file]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        window.NetFixAudio.click();
        state.activeCodeTab = btn.getAttribute("data-code-file");
        renderCodeViewer();
      });
    });

    // Copy code button
    const btnCopyCode = document.getElementById("btnCopyCode");
    if (btnCopyCode) {
      btnCopyCode.addEventListener("click", function () {
        const text = (window.NETFIX_SOURCE_FILES && window.NETFIX_SOURCE_FILES[state.activeCodeTab]) || "";
        const ta = document.createElement("textarea");
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand("copy"); } catch (e) {}
        document.body.removeChild(ta);
        btnCopyCode.textContent = "✓ Kode Tersalin!";
        setTimeout(function () { btnCopyCode.textContent = "Salin Kode File Ini"; }, 1500);
      });
    }

    renderCaseCards();
    renderSimulationStep();
    if (animFrameId) window.cancelAnimationFrame(animFrameId);
    animFrameId = window.requestAnimationFrame(drawTopology);
  });
})();
