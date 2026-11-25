// DentaCare Pro — Lógica Interactiva PWA (Fase 1)

const STORAGE_KEY = 'dentacare_pwa_phase1_state_v1';
const SESSION_USER_KEY = 'dentacare_pwa_logged_user_v1';

const ODONTO_TOOLS = [
  { id: 'caries', label: 'Caries / Lesión', type: 'surface', color: '#ef4444', bg: 'bg-rose-500', badge: 'bg-rose-50 text-rose-700 border-rose-200', suggestedService: 'SRV-04' },
  { id: 'restoration', label: 'Restauración / Resina', type: 'surface', color: '#0284c7', bg: 'bg-sky-600', badge: 'bg-sky-50 text-sky-700 border-sky-200', suggestedService: 'SRV-03' },
  { id: 'endo', label: 'Endodoncia (Conducto)', type: 'whole', color: '#7c3aed', bg: 'bg-violet-600', badge: 'bg-violet-50 text-violet-700 border-violet-200', suggestedService: 'SRV-06' },
  { id: 'crown', label: 'Corona / Prótesis', type: 'whole', color: '#d97706', bg: 'bg-amber-500', badge: 'bg-amber-50 text-amber-800 border-amber-200', suggestedService: 'SRV-07' },
  { id: 'implant', label: 'Implante Dental', type: 'whole', color: '#059669', bg: 'bg-emerald-600', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', suggestedService: 'SRV-11' },
  { id: 'missing', label: 'Ausente / Exodoncia', type: 'whole', color: '#475569', bg: 'bg-slate-600', badge: 'bg-slate-100 text-slate-700 border-slate-300', suggestedService: 'SRV-09' },
  { id: 'healthy', label: 'Limpiar / Sano', type: 'clear', color: '#ffffff', bg: 'bg-white border border-slate-300', badge: 'bg-slate-50 text-slate-600 border-slate-200', suggestedService: 'SRV-01' }
];

const VIEW_METADATA = {
  dashboard: {
    title: 'Dashboard Operativo & Recepción',
    subtitle: 'Martes, 24 de Noviembre 2026 • Control de sillones, citas y flujo de sala de espera en tiempo real'
  },
  agenda: {
    title: 'Agenda Clínica & Consultorios',
    subtitle: 'Programación por odontólogo, sillón dental y seguimiento de estados de atención'
  },
  patients: {
    title: 'Directorio de Pacientes e Historia Clínica (HCE)',
    subtitle: 'Filiación, alertas médicas críticas, anamnesis, evoluciones SOAP y estudios radiográficos'
  },
  odontogram: {
    title: 'Odontograma Digital Interactivo (Estándar FDI)',
    subtitle: 'Registro anatómico por superficie dental (5 caras) e integración directa con planes de tratamiento'
  },
  budgets: {
    title: 'Presupuestos, Planes de Tratamiento y Pagos',
    subtitle: 'Control financiero por paciente, avance de procedimientos y registro de abonos en caja'
  },
  catalog: {
    title: 'Catálogo de Aranceles & Staff Odontológico',
    subtitle: 'Tarifario oficial de procedimientos clínicos y disponibilidad por especialidad'
  },
  'patient-portal': {
    title: 'Portal del Paciente — Autogestión Móvil (PWA)',
    subtitle: 'Experiencia móvil del paciente: carné digital QR, reserva de citas online y estado de cuenta'
  }
};

class DentaCareApp {
  constructor() {
    this.data = this.loadState();
    this.currentView = 'dashboard';
    this.activePatientId = this.data.patients[0]?.id || 'PAC-1001';
    this.selectedTooth = '16';
    this.activeOdontoTool = 'caries';
    this.dentitionMode = 'adult';
    this.agendaMode = 'list';
    this.showAllDates = false;
    this.hceTab = 'summary';
    this.catalogCategory = 'ALL';
    this.isOffline = false;
    this.offlineQueue = [];
    this.mobileSelfServiceVisible = false;
    this.currentUser = this.loadSessionUser();
    this.portalStep = 1;
    this.portalDraft = {
      specialty: 'Rehabilitación Oral y Estética Dental',
      dentistId: 'DOC-01',
      serviceId: 'SRV-02',
      date: '2026-11-26',
      time: '10:00',
      notes: 'Solicitud desde App Móvil PWA'
    };
  }

  loadState() {
    let state = null;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        state = JSON.parse(raw);
      }
    } catch (e) {
      console.warn('No se pudo leer localStorage, usando mock data inicial', e);
    }
    if (!state) {
      state = JSON.parse(JSON.stringify(window.INITIAL_MOCK_DATA));
    }
    if (state.clinicInfo) {
      state.clinicInfo.currency = '$';
    }
    if (Array.isArray(state.budgets)) {
      state.budgets.forEach((b) => {
        if (Array.isArray(b.payments)) {
          b.payments.forEach((pay) => {
            if (pay.method && /yape|plin/i.test(pay.method)) {
              pay.method = 'Transferencia Bancaria';
              if (pay.reference && pay.reference.startsWith('YP-')) {
                pay.reference = pay.reference.replace('YP-', 'TR-');
              }
            }
          });
        }
      });
    }
    return state;
  }

  saveState(mutationLabel = null) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    } catch (e) {
      console.warn('Error guardando estado en localStorage', e);
    }
    if (this.isOffline && mutationLabel) {
      this.offlineQueue.push({
        id: Date.now(),
        label: mutationLabel,
        timestamp: new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })
      });
      this.updateOfflineUI();
    }
  }

  init() {
    this.registerServiceWorker();
    this.registerKeyboardShortcuts();
    this.setMobileSelfServiceVisibility(false, false);
    this.syncAuthUI();
    this.populateGlobalSelectors();
    this.navigate('dashboard');
  }

  loadSessionUser() {
    try {
      const raw = sessionStorage.getItem(SESSION_USER_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.warn('No se pudo leer sessionStorage', e);
    }
    return null;
  }

  computeInitials(name) {
    const clean = (name || 'Usuario').replace(/^(Dra\.|Dr\.|Lic\.|Ing\.)\s*/i, '').trim();
    const parts = clean.split(/\s+/).filter(Boolean);
    if (parts.length === 0) return 'US';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }

  fillLoginPreset(username, role) {
    const userInput = document.getElementById('login-username');
    const roleSelect = document.getElementById('login-role');
    if (userInput) userInput.value = username.trim();
    if (roleSelect) roleSelect.value = role;
  }

  handleLogin(e) {
    if (e) e.preventDefault();
    const nameInput = document.getElementById('login-username');
    const roleInput = document.getElementById('login-role');
    const name = (nameInput?.value || '').trim() || 'Dra. Valeria Mendoza';
    const role = (roleInput?.value || '').trim() || 'Directora Clínica • Rehabilitación';

    this.currentUser = {
      name,
      role,
      initials: this.computeInitials(name)
    };

    try {
      sessionStorage.setItem(SESSION_USER_KEY, JSON.stringify(this.currentUser));
    } catch (err) {
      console.warn('No se pudo guardar sesión', err);
    }

    this.syncAuthUI();
    this.showToast(`Bienvenido(a), ${this.currentUser.name}`, 'success');
  }

  logout() {
    const prevName = this.currentUser?.name || 'Usuario';
    this.currentUser = null;
    try {
      sessionStorage.removeItem(SESSION_USER_KEY);
    } catch (err) {
      console.warn('Error limpiando sesión', err);
    }
    this.syncAuthUI();
    this.showToast(`Sesión cerrada (${prevName}).`, 'info');
  }

  syncAuthUI() {
    const loginScreen = document.getElementById('login-screen');
    const nameEl = document.getElementById('header-user-name');
    const roleEl = document.getElementById('header-user-role');
    const avatarEl = document.getElementById('header-user-avatar');

    if (this.currentUser) {
      if (loginScreen) loginScreen.classList.add('hidden');
      if (nameEl) nameEl.textContent = this.currentUser.name;
      if (roleEl) roleEl.textContent = this.currentUser.role;
      if (avatarEl) avatarEl.textContent = this.currentUser.initials;
    } else {
      if (loginScreen) loginScreen.classList.remove('hidden');
    }
  }

  registerKeyboardShortcuts() {
    window.addEventListener('keydown', (e) => {
      if (!e.altKey) return;
      const key = (e.key || '').toLowerCase();
      if (key === 'm' || e.code === 'KeyM') {
        e.preventDefault();
        this.setMobileSelfServiceVisibility(true, true);
      } else if (key === 'o' || e.code === 'KeyO') {
        e.preventDefault();
        this.setMobileSelfServiceVisibility(false, true);
      }
    });
  }

  setMobileSelfServiceVisibility(visible, notify = true) {
    this.mobileSelfServiceVisible = Boolean(visible);
    const desktopSection = document.getElementById('mobile-self-service-section');
    const mobileBtn = document.getElementById('mobile-nav-patient-portal');

    if (desktopSection) {
      desktopSection.classList.toggle('hidden', !this.mobileSelfServiceVisible);
    }
    if (mobileBtn) {
      mobileBtn.classList.toggle('hidden', !this.mobileSelfServiceVisible);
      mobileBtn.classList.toggle('flex', this.mobileSelfServiceVisible);
    }

    if (!this.mobileSelfServiceVisible && this.currentView === 'patient-portal') {
      this.navigate('dashboard');
    }

    if (notify) {
      if (this.mobileSelfServiceVisible) {
        this.showToast('Sección "Autogestión Móvil" habilitada (Alt+O para ocultar).', 'info');
      } else {
        this.showToast('Sección "Autogestión Móvil" ocultada (Alt+M para mostrar).', 'info');
      }
    }
  }

  registerServiceWorker() {
    if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1')) {
      navigator.serviceWorker.register('./sw.js').then(() => {
        const label = document.getElementById('pwa-sw-label');
        if (label) label.textContent = 'PWA Service Worker Listo';
      }).catch(() => {});
    }
  }

  getActivePatient() {
    return this.data.patients.find((p) => p.id === this.activePatientId) || this.data.patients[0];
  }

  setActivePatient(patientId) {
    this.activePatientId = patientId;
    const patient = this.getActivePatient();
    if (patient) {
      this.dentitionMode = patient.dentitionType || 'adult';
      this.selectedTooth = this.dentitionMode === 'child' ? '75' : '16';
    }
    this.populateGlobalSelectors();
    this.renderCurrentView();
    this.showToast(`Paciente activo: ${patient.name}`, 'info');
  }

  populateGlobalSelectors() {
    const select = document.getElementById('global-patient-select');
    if (select) {
      select.innerHTML = this.data.patients
        .map((p) => `<option value="${p.id}" ${p.id === this.activePatientId ? 'selected' : ''}>${p.name} (${p.docNumber})</option>`)
        .join('');
    }
    const patient = this.getActivePatient();
    const alertBox = document.getElementById('sidebar-patient-alert');
    if (alertBox && patient) {
      const firstAlert = patient.alerts && patient.alerts[0] ? patient.alerts[0] : 'Sin alertas críticas';
      alertBox.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-rose-400 flex-shrink-0"></span><span class="truncate" title="${firstAlert}">${firstAlert}</span>`;
    }

    const dentistFilter = document.getElementById('agenda-filter-dentist');
    if (dentistFilter && dentistFilter.options.length <= 1) {
      dentistFilter.innerHTML = `<option value="ALL">Todos los Odontólogos</option>` +
        this.data.dentists.map((d) => `<option value="${d.id}">${d.name}</option>`).join('');
    }

    const badgePatients = document.getElementById('nav-badge-patients');
    if (badgePatients) badgePatients.textContent = this.data.patients.length;

    const todayCount = this.data.appointments.filter((a) => a.date === '2026-11-24').length;
    const badgeToday = document.getElementById('nav-badge-today');
    if (badgeToday) badgeToday.textContent = todayCount;
  }

  navigate(viewName) {
    this.currentView = viewName;
    document.querySelectorAll('.view-section').forEach((sec) => sec.classList.add('hidden'));
    const target = document.getElementById(`view-${viewName}`);
    if (target) target.classList.remove('hidden');

    const meta = VIEW_METADATA[viewName] || VIEW_METADATA.dashboard;
    document.getElementById('view-title').textContent = meta.title;
    document.getElementById('view-subtitle').textContent = meta.subtitle;

    // Desktop nav state
    document.querySelectorAll('.nav-btn').forEach((btn) => {
      const isCurrent = btn.getAttribute('data-nav') === viewName;
      btn.className = `nav-btn w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
        isCurrent
          ? 'bg-teal-600 text-white shadow-sm'
          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
      }`;
    });

    // Mobile nav state
    document.querySelectorAll('[data-nav-mobile]').forEach((btn) => {
      const targetView = btn.getAttribute('data-nav-mobile');
      const isCurrent = targetView === viewName;
      const isHiddenPortal = targetView === 'patient-portal' && !this.mobileSelfServiceVisible;
      btn.className = `${isHiddenPortal ? 'hidden' : 'flex'} flex-col items-center py-1 px-2 text-[10px] ${
        isCurrent ? 'font-bold text-teal-600' : 'font-semibold text-slate-500'
      }`;
    });

    this.renderCurrentView();
    const mainScroll = document.getElementById('main-scroll');
    if (mainScroll) mainScroll.scrollTop = 0;
  }

  renderCurrentView() {
    this.populateGlobalSelectors();
    switch (this.currentView) {
      case 'dashboard':
        this.renderDashboard();
        break;
      case 'agenda':
        this.renderAgenda();
        break;
      case 'patients':
        this.renderPatientsView();
        break;
      case 'odontogram':
        this.renderOdontogram();
        break;
      case 'budgets':
        this.renderBudgets();
        break;
      case 'catalog':
        this.renderCatalog();
        break;
      case 'patient-portal':
        this.renderPatientPortal();
        break;
    }
  }

  // =========================================================================
  // MÓDULO 1: DASHBOARD & FLUJO DE SALA DE ESPERA
  // =========================================================================
  renderDashboard() {
    const todayAppts = this.data.appointments
      .filter((a) => a.date === '2026-11-24')
      .sort((a, b) => a.time.localeCompare(b.time));

    const attended = todayAppts.filter((a) => a.status === 'Atendida').length;
    const inWaitingOrChair = todayAppts.filter((a) => a.status === 'En Sala' || a.status === 'En Sillón').length;
    const pendingConfirm = todayAppts.filter((a) => a.status === 'Pendiente').length;

    // Ingresos recaudados totales en presupuestos
    let totalCollected = 0;
    let totalPending = 0;
    this.data.budgets.forEach((b) => {
      const subtotal = b.items.reduce((acc, i) => acc + Number(i.price || 0), 0);
      const net = subtotal * (1 - (Number(b.discountPercent || 0) / 100));
      const paid = b.payments.reduce((acc, p) => acc + Number(p.amount || 0), 0);
      totalCollected += paid;
      totalPending += Math.max(0, net - paid);
    });

    const kpiContainer = document.getElementById('dashboard-kpis');
    kpiContainer.innerHTML = `
      <div class="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex items-center justify-between">
        <div>
          <p class="text-xs font-semibold text-slate-500">Citas Programadas Hoy</p>
          <p class="text-2xl font-extrabold text-slate-900 mt-1">${todayAppts.length} <span class="text-xs font-semibold text-teal-600">(${attended} atendidas)</span></p>
          <p class="text-[11px] text-slate-400 mt-1">${pendingConfirm} pendiente(s) de confirmar</p>
        </div>
        <div class="w-11 h-11 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
        </div>
      </div>

      <div class="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex items-center justify-between">
        <div>
          <p class="text-xs font-semibold text-slate-500">En Sala / En Sillón Ahora</p>
          <p class="text-2xl font-extrabold text-sky-600 mt-1">${inWaitingOrChair} <span class="text-xs font-semibold text-slate-500">pacientes</span></p>
          <p class="text-[11px] text-emerald-600 font-medium mt-1">Tiempo espera prom: 6 min</p>
        </div>
        <div class="w-11 h-11 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
        </div>
      </div>

      <div class="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex items-center justify-between">
        <div>
          <p class="text-xs font-semibold text-slate-500">Historias Clínicas Activas</p>
          <p class="text-2xl font-extrabold text-slate-900 mt-1">${this.data.patients.length} <span class="text-xs font-semibold text-indigo-600">100% digital</span></p>
          <p class="text-[11px] text-slate-400 mt-1">Con Odontograma FDI y Alertas</p>
        </div>
        <div class="w-11 h-11 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
        </div>
      </div>

      <div class="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex items-center justify-between">
        <div>
          <p class="text-xs font-semibold text-slate-500">Recaudación Presupuestos</p>
          <p class="text-2xl font-extrabold text-emerald-600 mt-1">$ ${totalCollected.toLocaleString('es-EC')}</p>
          <p class="text-[11px] text-slate-400 mt-1">Por cobrar: $ ${totalPending.toLocaleString('es-EC')}</p>
        </div>
        <div class="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
        </div>
      </div>
    `;

    // Lista de citas de hoy
    const todayList = document.getElementById('dashboard-today-list');
    todayList.innerHTML = todayAppts.map((appt) => {
      const patient = this.data.patients.find((p) => p.id === appt.patientId);
      const hasAlerts = patient && patient.alerts && patient.alerts.length > 0 && !patient.alerts[0].includes('Negativo');
      return `
        <div class="p-4 hover:bg-slate-50/80 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div class="flex items-start gap-3.5">
            <div class="text-center bg-slate-100 rounded-xl px-2.5 py-1.5 min-w-[64px]">
              <p class="text-xs font-extrabold text-slate-900">${appt.time}</p>
              <p class="text-[10px] font-semibold text-slate-500">${appt.duration} min</p>
            </div>
            <div>
              <div class="flex items-center gap-2 flex-wrap">
                <button onclick="app.openPatientDirectly('${appt.patientId}')" class="text-sm font-bold text-slate-900 hover:text-teal-600 transition text-left">
                  ${appt.patientName}
                </button>
                <span class="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">${appt.chair}</span>
                ${appt.tooth ? `<span class="text-[10px] font-bold px-2 py-0.5 rounded-md bg-teal-50 text-teal-700">Pza. ${appt.tooth}</span>` : ''}
              </div>
              <p class="text-xs font-medium text-slate-600 mt-0.5">${appt.serviceName}</p>
              <p class="text-[11px] text-slate-400 mt-0.5">${appt.dentistName} • ${appt.notes || ''}</p>
              ${hasAlerts ? `<p class="text-[11px] font-semibold text-rose-600 mt-1 flex items-center gap-1">⚠️ ${patient.alerts.join(' | ')}</p>` : ''}
            </div>
          </div>

          <div class="flex items-center gap-2 self-end sm:self-center">
            <button onclick="app.cycleAppointmentStatus('${appt.id}')" title="Clic para avanzar estado" class="px-3 py-1.5 rounded-xl text-xs font-bold border transition ${this.getStatusBadgeClass(appt.status)}">
              ${appt.status} ↻
            </button>
            <button onclick="app.openOdontogramForPatient('${appt.patientId}')" title="Abrir Odontograma" class="p-2 rounded-xl border border-slate-200 hover:bg-teal-50 hover:border-teal-200 text-slate-600 hover:text-teal-700 transition">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
            </button>
          </div>
        </div>
      `;
    }).join('');

    // Estado de Consultorios / Sillones
    const chairs = ['Consultorio 1', 'Consultorio 2', 'Consultorio 3'];
    const chairsBox = document.getElementById('dashboard-chairs-status');
    chairsBox.innerHTML = chairs.map((chairName) => {
      const activeInChair = todayAppts.find((a) => a.chair === chairName && a.status === 'En Sillón');
      const nextInChair = todayAppts.find((a) => a.chair === chairName && (a.status === 'En Sala' || a.status === 'Confirmada'));
      return `
        <div class="p-3 rounded-xl border ${activeInChair ? 'bg-sky-50/60 border-sky-200' : 'bg-slate-50 border-slate-200/80'} flex items-center justify-between">
          <div>
            <div class="flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full ${activeInChair ? 'bg-sky-500 animate-pulse' : 'bg-emerald-500'}"></span>
              <span class="text-xs font-bold text-slate-900">${chairName}</span>
            </div>
            <p class="text-[11px] text-slate-600 mt-1">
              ${activeInChair
                ? `En atención: <strong>${activeInChair.patientName}</strong> (${activeInChair.dentistName})`
                : nextInChair
                ? `Libre • Próximo: ${nextInChair.time} (${nextInChair.patientName})`
                : 'Libre y sanitizado'}
            </p>
          </div>
          <span class="text-[10px] font-bold px-2 py-0.5 rounded-lg ${activeInChair ? 'bg-sky-600 text-white' : 'bg-emerald-100 text-emerald-800'}">
            ${activeInChair ? 'Ocupado' : 'Disponible'}
          </span>
        </div>
      `;
    }).join('');

    // Alertas Médicas de Hoy
    const alertsBox = document.getElementById('dashboard-medical-alerts');
    const patientsTodayIds = [...new Set(todayAppts.map((a) => a.patientId))];
    const alertsHtml = patientsTodayIds.map((pid) => {
      const pat = this.data.patients.find((p) => p.id === pid);
      if (!pat || !pat.alerts || pat.alerts[0]?.includes('Negativo')) return '';
      return `
        <div onclick="app.openPatientDirectly('${pat.id}')" class="bg-white/90 hover:bg-white p-3 rounded-xl border border-rose-200/80 cursor-pointer transition shadow-2xs">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-slate-900">${pat.name}</span>
            <span class="text-[10px] font-bold text-rose-700 bg-rose-100 px-1.5 py-0.5 rounded">Grupo ${pat.bloodType}</span>
          </div>
          <p class="text-[11px] font-semibold text-rose-700 mt-1">• ${pat.alerts.join('<br>• ')}</p>
        </div>
      `;
    }).filter(Boolean).join('');
    alertsBox.innerHTML = alertsHtml || `<p class="text-xs text-rose-700">Sin alertas médicas críticas hoy.</p>`;
  }

  getStatusBadgeClass(status) {
    switch (status) {
      case 'Atendida':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100';
      case 'En Sillón':
        return 'bg-sky-600 text-white border-sky-600 hover:bg-sky-700 shadow-xs';
      case 'En Sala':
        return 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100';
      case 'Confirmada':
        return 'bg-teal-50 text-teal-700 border-teal-200 hover:bg-teal-100';
      case 'Pendiente':
        return 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200';
      case 'Cancelada':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  }

  cycleAppointmentStatus(apptId) {
    const order = ['Pendiente', 'Confirmada', 'En Sala', 'En Sillón', 'Atendida'];
    const appt = this.data.appointments.find((a) => a.id === apptId);
    if (!appt) return;
    const idx = order.indexOf(appt.status);
    appt.status = order[(idx + 1) % order.length];
    this.saveState(`Estado de cita ${appt.patientName} → ${appt.status}`);
    this.renderCurrentView();
    this.showToast(`Cita de ${appt.patientName}: ${appt.status}`, 'success');
  }

  // =========================================================================
  // MÓDULO 2: AGENDA & CITAS MULTICONSULTORIO
  // =========================================================================
  setAgendaMode(mode) {
    this.agendaMode = mode;
    document.getElementById('agenda-mode-list').className = mode === 'list'
      ? 'px-3 py-1 rounded-lg text-xs font-bold bg-white text-slate-900 shadow-sm'
      : 'px-3 py-1 rounded-lg text-xs font-semibold text-slate-600';
    document.getElementById('agenda-mode-chairs').className = mode === 'chairs'
      ? 'px-3 py-1 rounded-lg text-xs font-bold bg-white text-slate-900 shadow-sm'
      : 'px-3 py-1 rounded-lg text-xs font-semibold text-slate-600';
    this.renderAgenda();
  }

  showAllDatesAgenda() {
    this.showAllDates = true;
    document.getElementById('agenda-filter-date').value = '';
    this.renderAgenda();
  }

  renderAgenda() {
    const dateVal = document.getElementById('agenda-filter-date')?.value;
    const dentistVal = document.getElementById('agenda-filter-dentist')?.value || 'ALL';
    const statusVal = document.getElementById('agenda-filter-status')?.value || 'ALL';

    let filtered = [...this.data.appointments];
    if (dateVal) {
      filtered = filtered.filter((a) => a.date === dateVal);
    }
    if (dentistVal !== 'ALL') {
      filtered = filtered.filter((a) => a.dentistId === dentistVal);
    }
    if (statusVal !== 'ALL') {
      filtered = filtered.filter((a) => a.status === statusVal);
    }
    filtered.sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));

    const container = document.getElementById('agenda-container');
    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="bg-white rounded-2xl border border-slate-200 p-10 text-center space-y-3">
          <p class="text-sm font-bold text-slate-800">No hay citas registradas para los filtros seleccionados</p>
          <div class="flex justify-center gap-2">
            <button onclick="app.showAllDatesAgenda()" class="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700">
              Mostrar Todas las Fechas
            </button>
            <button onclick="app.openAppointmentModal()" class="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-teal-600 text-white">
              + Agendar Nueva Cita
            </button>
          </div>
        </div>
      `;
      return;
    }

    if (this.agendaMode === 'chairs') {
      const chairs = ['Consultorio 1', 'Consultorio 2', 'Consultorio 3'];
      container.innerHTML = `
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-5">
          ${chairs.map((chair) => {
            const chairAppts = filtered.filter((a) => a.chair === chair);
            return `
              <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                <div class="p-4 bg-slate-900 text-white flex items-center justify-between">
                  <div>
                    <h3 class="text-sm font-bold">${chair}</h3>
                    <p class="text-[11px] text-slate-400">${chairAppts.length} cita(s) programadas</p>
                  </div>
                  <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">Sillón Activo</span>
                </div>
                <div class="p-3 space-y-3 flex-1">
                  ${chairAppts.length === 0 ? `<p class="text-xs text-slate-400 text-center py-8">Sin citas en este consultorio</p>` : chairAppts.map((a) => `
                    <div class="p-3.5 rounded-xl border border-slate-200 hover:border-teal-300 transition space-y-2 bg-slate-50/50">
                      <div class="flex items-center justify-between">
                        <span class="text-xs font-extrabold text-slate-900">${a.time} (${a.duration}m) • ${a.date}</span>
                        <button onclick="app.cycleAppointmentStatus('${a.id}')" class="px-2 py-0.5 rounded-lg text-[11px] font-bold border ${this.getStatusBadgeClass(a.status)}">${a.status} ↻</button>
                      </div>
                      <p onclick="app.openPatientDirectly('${a.patientId}')" class="text-xs font-bold text-teal-700 hover:underline cursor-pointer">${a.patientName}</p>
                      <p class="text-xs text-slate-700 font-medium">${a.serviceName}</p>
                      <p class="text-[11px] text-slate-500">${a.dentistName}</p>
                    </div>
                  `).join('')}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `;
      return;
    }

    // Vista cronológica detallada
    container.innerHTML = `
      <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase text-slate-500">
                <th class="py-3 px-4">Fecha / Hora</th>
                <th class="py-3 px-4">Paciente</th>
                <th class="py-3 px-4">Procedimiento / Pieza</th>
                <th class="py-3 px-4">Odontólogo & Sillón</th>
                <th class="py-3 px-4">Estado Clínico</th>
                <th class="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 text-xs">
              ${filtered.map((a) => `
                <tr class="hover:bg-slate-50/90 transition">
                  <td class="py-3.5 px-4 whitespace-nowrap">
                    <p class="font-extrabold text-slate-900">${a.time} <span class="text-slate-400 font-medium">(${a.duration}m)</span></p>
                    <p class="text-[11px] text-slate-500">${a.date}</p>
                  </td>
                  <td class="py-3.5 px-4">
                    <button onclick="app.openPatientDirectly('${a.patientId}')" class="font-bold text-slate-900 hover:text-teal-600 text-left">
                      ${a.patientName}
                    </button>
                    <p class="text-[11px] text-slate-500 truncate max-w-xs">${a.notes || 'Sin observaciones'}</p>
                  </td>
                  <td class="py-3.5 px-4">
                    <p class="font-semibold text-slate-800">${a.serviceName}</p>
                    <span class="inline-block mt-0.5 text-[10px] font-bold px-2 py-0.5 rounded bg-teal-50 text-teal-700">Pieza: ${a.tooth || 'General'}</span>
                  </td>
                  <td class="py-3.5 px-4">
                    <p class="font-semibold text-slate-800">${a.dentistName}</p>
                    <p class="text-[11px] text-slate-500">${a.chair}</p>
                  </td>
                  <td class="py-3.5 px-4">
                    <button onclick="app.cycleAppointmentStatus('${a.id}')" class="px-2.5 py-1 rounded-xl text-xs font-bold border ${this.getStatusBadgeClass(a.status)}">
                      ${a.status} ↻
                    </button>
                  </td>
                  <td class="py-3.5 px-4 text-right whitespace-nowrap space-x-1">
                    <button onclick="app.sendWhatsAppReminder('${a.id}')" title="Enviar recordatorio WhatsApp/PWA" class="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold text-[11px]">
                      WhatsApp
                    </button>
                    <button onclick="app.openOdontogramForPatient('${a.patientId}')" class="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px]">
                      Atender
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  sendWhatsAppReminder(apptId) {
    const appt = this.data.appointments.find((a) => a.id === apptId);
    if (!appt) return;
    if (appt.status === 'Pendiente') {
      appt.status = 'Confirmada';
      this.saveState(`Confirmación de cita vía recordatorio (${appt.patientName})`);
      this.renderCurrentView();
    }
    this.showToast(`Recordatorio enviado a ${appt.patientName} (${appt.date} a las ${appt.time}). Cita Confirmada.`, 'success');
  }

  // =========================================================================
  // MÓDULO 3: PACIENTES E HISTORIA CLÍNICA ELECTRÓNICA (HCE)
  // =========================================================================
  openPatientDirectly(patientId) {
    this.activePatientId = patientId;
    this.navigate('patients');
  }

  openOdontogramForPatient(patientId) {
    this.activePatientId = patientId;
    const p = this.getActivePatient();
    if (p) this.dentitionMode = p.dentitionType || 'adult';
    this.navigate('odontogram');
  }

  renderPatientsView() {
    this.renderPatientsList();
    this.renderPatientHCEDetail();
  }

  renderPatientsList() {
    const query = (document.getElementById('patient-search-input')?.value || '').toLowerCase().trim();
    const listEl = document.getElementById('patients-directory-list');
    if (!listEl) return;

    const filtered = this.data.patients.filter((p) =>
      p.name.toLowerCase().includes(query) ||
      p.docNumber.toLowerCase().includes(query) ||
      p.phone.toLowerCase().includes(query)
    );

    listEl.innerHTML = filtered.map((p) => {
      const isSelected = p.id === this.activePatientId;
      const hasCriticalAlert = p.alerts && p.alerts.length > 0 && !p.alerts[0].includes('Negativo');
      return `
        <button onclick="app.setActivePatient('${p.id}')" class="w-full text-left p-3.5 transition flex items-start justify-between gap-2 ${
          isSelected ? 'bg-teal-50/90 border-l-4 border-teal-600' : 'hover:bg-slate-50'
        }">
          <div class="min-w-0">
            <div class="flex items-center gap-1.5">
              <p class="text-xs font-bold text-slate-900 truncate">${p.name}</p>
              ${hasCriticalAlert ? `<span class="w-2 h-2 rounded-full bg-rose-500 flex-shrink-0" title="Alerta médica"></span>` : ''}
            </div>
            <p class="text-[11px] text-slate-500 mt-0.5">${p.docType} ${p.docNumber} • ${p.age} años</p>
            <p class="text-[10px] text-slate-400 mt-0.5">${p.insurance}</p>
          </div>
          <span class="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
            p.status === 'En Tratamiento' ? 'bg-teal-100 text-teal-800' : 'bg-slate-100 text-slate-600'
          }">${p.status}</span>
        </button>
      `;
    }).join('');
  }

  setHCETab(tab) {
    this.hceTab = tab;
    this.renderPatientHCEDetail();
  }

  renderPatientHCEDetail() {
    const p = this.getActivePatient();
    const container = document.getElementById('patient-hce-detail');
    if (!container || !p) return;

    const initials = p.name.split(' ').slice(0, 2).map((n) => n[0]).join('');
    const findingsCount = Object.keys(p.odontogram || {}).length;

    container.innerHTML = `
      <!-- Cabecera de Filiación y Alertas Médicas -->
      <div class="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
        <div class="flex flex-wrap items-start justify-between gap-4">
          <div class="flex items-center gap-3.5">
            <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-600 to-sky-600 text-white font-extrabold text-lg flex items-center justify-center shadow-sm">
              ${initials}
            </div>
            <div>
              <div class="flex items-center gap-2 flex-wrap">
                <h2 class="text-base lg:text-lg font-extrabold text-slate-900">${p.name}</h2>
                <span class="text-xs font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">HC #${p.id}</span>
                <span class="text-xs font-bold px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200">Sangre: ${p.bloodType}</span>
              </div>
              <p class="text-xs text-slate-500 mt-0.5">${p.docType}: ${p.docNumber} • ${p.age} años (${p.birthDate}) • ${p.phone} • ${p.insurance}</p>
            </div>
          </div>

          <div class="flex items-center gap-2 flex-wrap">
            <button onclick="app.openOdontogramForPatient('${p.id}')" class="px-3 py-1.5 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-xs transition">
              Abrir Odontograma (${findingsCount})
            </button>
            <button onclick="app.openEvolutionModal()" class="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white transition">
              + Evolución SOAP
            </button>
          </div>
        </div>

        <!-- Banda de Alertas Médicas / Alergias -->
        <div class="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex flex-wrap items-center justify-between gap-2">
          <div class="flex items-center gap-2.5">
            <span class="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-rose-600 text-white">Alertas Médicas</span>
            <p class="text-xs font-bold text-rose-950">${(p.alerts || []).join(' • ')}</p>
          </div>
          <span class="text-[11px] font-medium text-rose-700">Medicación actual: ${p.currentMedication || 'Ninguna'}</span>
        </div>

        <!-- Sub-navegación del Expediente Clínico -->
        <div class="flex items-center gap-2 border-b border-slate-200 pt-1">
          <button onclick="app.setHCETab('summary')" class="pb-2.5 px-3 text-xs font-bold border-b-2 transition ${
            this.hceTab === 'summary' ? 'border-teal-600 text-teal-700' : 'border-transparent text-slate-500 hover:text-slate-800'
          }">
            1. Anamnesis & Resumen Clínico
          </button>
          <button onclick="app.setHCETab('evolutions')" class="pb-2.5 px-3 text-xs font-bold border-b-2 transition ${
            this.hceTab === 'evolutions' ? 'border-teal-600 text-teal-700' : 'border-transparent text-slate-500 hover:text-slate-800'
          }">
            2. Evoluciones SOAP (${(p.evolutions || []).length})
          </button>
          <button onclick="app.setHCETab('radiographs')" class="pb-2.5 px-3 text-xs font-bold border-b-2 transition ${
            this.hceTab === 'radiographs' ? 'border-teal-600 text-teal-700' : 'border-transparent text-slate-500 hover:text-slate-800'
          }">
            3. Imágenes y Radiografías (${(p.radiographs || []).length})
          </button>
        </div>

        <!-- Contenido de la Pestaña Activa -->
        <div>
          ${this.renderHCETabContent(p)}
        </div>
      </div>
    `;
  }

  renderHCETabContent(p) {
    if (this.hceTab === 'evolutions') {
      const evos = p.evolutions || [];
      return `
        <div class="space-y-3 pt-2">
          <div class="flex items-center justify-between">
            <p class="text-xs text-slate-500">Registro cronológico de atenciones firmadas digitalmente</p>
            <button onclick="app.openEvolutionModal()" class="text-xs font-bold text-teal-600 hover:underline">+ Registrar Nueva Nota SOAP</button>
          </div>
          ${evos.length === 0 ? `<p class="text-xs text-slate-400 py-6 text-center">No hay evoluciones registradas aún.</p>` : evos.map((ev) => `
            <div class="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-1.5">
              <div class="flex flex-wrap items-center justify-between gap-2">
                <div class="flex items-center gap-2">
                  <span class="text-xs font-extrabold text-slate-900">${ev.date}</span>
                  <span class="text-[11px] font-bold px-2 py-0.5 rounded bg-teal-100 text-teal-800">Pieza: ${ev.tooth}</span>
                  <span class="text-xs font-bold text-slate-800">${ev.procedure}</span>
                </div>
                <span class="text-[11px] font-semibold text-slate-500">${ev.dentist}</span>
              </div>
              <p class="text-xs text-slate-700 leading-relaxed bg-white p-3 rounded-lg border border-slate-200/80">${ev.soap}</p>
              ${ev.attachment ? `<p class="text-[11px] font-semibold text-sky-700">📎 Estudio vinculado: ${ev.attachment}</p>` : ''}
            </div>
          `).join('')}
        </div>
      `;
    }

    if (this.hceTab === 'radiographs') {
      const rxs = p.radiographs || [];
      return `
        <div class="space-y-3 pt-2">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            ${rxs.map((rx) => `
              <div class="p-4 rounded-xl border border-slate-200 bg-slate-900 text-white flex flex-col justify-between space-y-3">
                <div class="flex items-start justify-between">
                  <div>
                    <span class="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-teal-500/20 text-teal-300">${rx.type}</span>
                    <h4 class="text-sm font-bold mt-1.5">${rx.title}</h4>
                    <p class="text-[11px] text-slate-400">${rx.date} • Zona: ${rx.tooth}</p>
                  </div>
                  <button onclick="app.openRadiographViewer('${rx.id}')" class="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold">
                    Ampliar Rx
                  </button>
                </div>
                <!-- Miniatura Radiográfica Vectorial -->
                <div onclick="app.openRadiographViewer('${rx.id}')" class="h-28 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center cursor-pointer group relative overflow-hidden">
                  <svg class="w-24 h-20 text-sky-300/60 group-hover:scale-105 transition" viewBox="0 0 120 80" fill="none">
                    <rect x="4" y="4" width="112" height="72" rx="6" stroke="currentColor" stroke-dasharray="3 3"/>
                    <path d="M25 22C25 14 38 14 38 22C38 35 34 55 30 62C28 52 25 35 25 22Z" fill="currentColor"/>
                    <path d="M52 20C52 12 68 12 68 20C68 35 65 56 62 64C60 50 58 50 56 64C53 56 52 35 52 20Z" fill="currentColor"/>
                    <path d="M82 22C82 14 96 14 96 22C96 35 92 55 88 62C86 52 82 35 82 22Z" fill="currentColor"/>
                  </svg>
                  <span class="absolute bottom-1.5 right-2 text-[10px] text-slate-400">Visor RVG Digital</span>
                </div>
                <p class="text-[11px] text-slate-300"><strong class="text-teal-300">Informe:</strong> ${rx.finding}</p>
              </div>
            `).join('')}
          </div>
          ${rxs.length === 0 ? `<p class="text-xs text-slate-400 py-4">Sin imágenes radiográficas cargadas para este paciente.</p>` : ''}
        </div>
      `;
    }

    // Pestaña Resumen & Anamnesis
    return `
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        <div class="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
          <h4 class="text-xs font-bold uppercase text-slate-500">Datos de Filiación y Contacto</h4>
          <div class="text-xs space-y-1.5 text-slate-700">
            <p><strong>Dirección:</strong> ${p.address}</p>
            <p><strong>Correo Electrónico:</strong> ${p.email}</p>
            <p><strong>Contacto de Emergencia:</strong> ${p.emergencyContact}</p>
            <p><strong>Antecedentes Sistémicos:</strong> ${(p.systemicConditions || []).join(', ')}</p>
            <p><strong>Última Visita:</strong> ${p.lastVisit}</p>
          </div>
        </div>

        <div class="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2 flex flex-col justify-between">
          <div>
            <h4 class="text-xs font-bold uppercase text-slate-500 mb-1">Epicrisis / Notas Clínicas de Tratamiento</h4>
            <textarea id="hce-clinical-notes-input" rows="4" class="w-full text-xs p-2.5 rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-teal-500">${p.clinicalNotes || ''}</textarea>
          </div>
          <div class="flex justify-end">
            <button onclick="app.savePatientClinicalNotes()" class="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold">
              Guardar Observación en HCE
            </button>
          </div>
        </div>
      </div>
    `;
  }

  savePatientClinicalNotes() {
    const p = this.getActivePatient();
    const val = document.getElementById('hce-clinical-notes-input')?.value;
    if (p && val !== undefined) {
      p.clinicalNotes = val;
      this.saveState(`Actualización de notas HCE (${p.name})`);
      this.showToast('Notas clínicas actualizadas en la HCE.', 'success');
    }
  }

  // =========================================================================
  // MÓDULO 4: ODONTOGRAMA DIGITAL INTERACTIVO (5 CARAS + PIEZA COMPLETA)
  // =========================================================================
  setDentitionMode(mode) {
    this.dentitionMode = mode;
    this.selectedTooth = mode === 'child' ? '75' : '16';
    this.renderOdontogram();
  }

  setOdontoTool(toolId) {
    this.activeOdontoTool = toolId;
    this.renderOdontogram();
  }

  renderOdontogram() {
    const p = this.getActivePatient();
    if (!p) return;

    const initials = p.name.split(' ').slice(0, 2).map((n) => n[0]).join('');
    document.getElementById('odonto-patient-avatar').textContent = initials;
    document.getElementById('odonto-patient-name').textContent = p.name;
    document.getElementById('odonto-patient-doc').textContent = `${p.docType} ${p.docNumber} • ${p.age} años`;

    const alertsEl = document.getElementById('odonto-patient-alerts');
    alertsEl.innerHTML = (p.alerts || []).map((al) =>
      `<span class="text-[11px] font-bold px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200">⚠️ ${al}</span>`
    ).join('');

    // Botones Adulto / Infantil
    document.getElementById('btn-dentition-adult').className = this.dentitionMode === 'adult'
      ? 'px-3 py-1.5 rounded-lg text-xs font-bold bg-white text-slate-900 shadow-sm'
      : 'px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600';
    document.getElementById('btn-dentition-child').className = this.dentitionMode === 'child'
      ? 'px-3 py-1.5 rounded-lg text-xs font-bold bg-white text-slate-900 shadow-sm'
      : 'px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600';

    // Paleta de Herramientas
    const toolbar = document.getElementById('odontogram-toolbar');
    toolbar.innerHTML = ODONTO_TOOLS.map((t) => {
      const active = this.activeOdontoTool === t.id;
      return `
        <button onclick="app.setOdontoTool('${t.id}')" class="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold border transition ${
          active
            ? 'bg-slate-900 text-white border-slate-900 shadow-sm scale-[1.02]'
            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
        }">
          <span class="w-3.5 h-3.5 rounded-full ${t.bg}"></span>
          <span>${t.label}</span>
        </button>
      `;
    }).join('');

    // Arcadas según dentición
    const upperTeeth = this.dentitionMode === 'adult'
      ? ['18','17','16','15','14','13','12','11','21','22','23','24','25','26','27','28']
      : ['55','54','53','52','51','61','62','63','64','65'];

    const lowerTeeth = this.dentitionMode === 'adult'
      ? ['48','47','46','45','44','43','42','41','31','32','33','34','35','36','37','38']
      : ['85','84','83','82','81','71','72','73','74','75'];

    document.getElementById('odontogram-upper-arch').innerHTML = upperTeeth
      .map((num) => this.renderToothSVGCard(num, p.odontogram?.[num]))
      .join('');

    document.getElementById('odontogram-lower-arch').innerHTML = lowerTeeth
      .map((num) => this.renderToothSVGCard(num, p.odontogram?.[num]))
      .join('');

    this.renderToothInspector(p);
    this.renderOdontogramFindingsList(p);
  }

  getSurfaceColor(state) {
    if (state === 'caries') return '#ef4444';
    if (state === 'restoration') return '#0284c7';
    return '#ffffff';
  }

  renderToothSVGCard(toothNum, toothData = {}) {
    const surfaces = toothData.surfaces || {};
    const whole = toothData.whole || null;
    const isSelected = String(this.selectedTooth) === String(toothNum);

    const fillV = this.getSurfaceColor(surfaces.V);
    const fillL = this.getSurfaceColor(surfaces.L);
    const fillM = this.getSurfaceColor(surfaces.M);
    const fillD = this.getSurfaceColor(surfaces.D);
    const fillO = this.getSurfaceColor(surfaces.O);

    let wholeOverlay = '';
    if (whole === 'missing') {
      wholeOverlay = `<g pointer-events="none"><line x1="6" y1="6" x2="54" y2="54" stroke="#334155" stroke-width="5" stroke-linecap="round"/><line x1="54" y1="6" x2="6" y2="54" stroke="#334155" stroke-width="5" stroke-linecap="round"/></g>`;
    } else if (whole === 'crown') {
      wholeOverlay = `<rect x="3" y="3" width="54" height="54" rx="8" fill="none" stroke="#d97706" stroke-width="5" pointer-events="none"/>`;
    } else if (whole === 'endo') {
      wholeOverlay = `<g pointer-events="none"><polygon points="30,10 46,48 14,48" fill="rgba(124,58,237,0.22)" stroke="#7c3aed" stroke-width="3"/><text x="30" y="37" text-anchor="middle" fill="#6d28d9" font-size="11" font-weight="800">EN</text></g>`;
    } else if (whole === 'implant') {
      wholeOverlay = `<g pointer-events="none"><rect x="14" y="14" width="32" height="32" rx="6" fill="rgba(5,150,105,0.2)" stroke="#059669" stroke-width="3"/><text x="30" y="34" text-anchor="middle" fill="#047857" font-size="10" font-weight="800">IMP</text></g>`;
    }

    return `
      <div onclick="app.selectTooth('${toothNum}')" class="tooth-card rounded-xl p-1.5 border ${
        isSelected ? 'selected-tooth border-teal-600' : 'border-slate-200 bg-white'
      } flex flex-col items-center cursor-pointer min-w-[40px]">
        <span class="text-[11px] font-extrabold ${isSelected ? 'text-teal-700' : 'text-slate-700'} mb-1">${toothNum}</span>
        <svg viewBox="0 0 60 60" class="w-10 h-10">
          <!-- Cara Superior: Vestibular (V) -->
          <polygon class="tooth-svg-surface" onclick="event.stopPropagation(); app.clickToothSurface('${toothNum}', 'V')"
            points="4,4 56,4 42,18 18,18" fill="${fillV}" stroke="#64748b" stroke-width="1.5">
            <title>Pieza ${toothNum} — Cara Vestibular (V)</title>
          </polygon>
          <!-- Cara Inferior: Lingual / Palatina (L) -->
          <polygon class="tooth-svg-surface" onclick="event.stopPropagation(); app.clickToothSurface('${toothNum}', 'L')"
            points="18,42 42,42 56,56 4,56" fill="${fillL}" stroke="#64748b" stroke-width="1.5">
            <title>Pieza ${toothNum} — Cara Lingual/Palatina (L)</title>
          </polygon>
          <!-- Cara Izquierda: Mesial (M) -->
          <polygon class="tooth-svg-surface" onclick="event.stopPropagation(); app.clickToothSurface('${toothNum}', 'M')"
            points="4,4 18,18 18,42 4,56" fill="${fillM}" stroke="#64748b" stroke-width="1.5">
            <title>Pieza ${toothNum} — Cara Mesial (M)</title>
          </polygon>
          <!-- Cara Derecha: Distal (D) -->
          <polygon class="tooth-svg-surface" onclick="event.stopPropagation(); app.clickToothSurface('${toothNum}', 'D')"
            points="42,18 56,4 56,56 42,42" fill="${fillD}" stroke="#64748b" stroke-width="1.5">
            <title>Pieza ${toothNum} — Cara Distal (D)</title>
          </polygon>
          <!-- Cara Central: Oclusal / Incisal (O) -->
          <rect class="tooth-svg-surface" onclick="event.stopPropagation(); app.clickToothSurface('${toothNum}', 'O')"
            x="18" y="18" width="24" height="24" fill="${fillO}" stroke="#64748b" stroke-width="1.5">
            <title>Pieza ${toothNum} — Cara Oclusal/Incisal (O)</title>
          </rect>
          ${wholeOverlay}
        </svg>
        <span class="mt-1 h-1.5 w-1.5 rounded-full ${
          whole || Object.keys(surfaces).length > 0 ? 'bg-teal-500' : 'bg-transparent'
        }"></span>
      </div>
    `;
  }

  selectTooth(toothNum) {
    this.selectedTooth = toothNum;
    this.renderOdontogram();
  }

  clickToothSurface(toothNum, surfaceCode) {
    this.selectedTooth = toothNum;
    const p = this.getActivePatient();
    if (!p) return;
    if (!p.odontogram) p.odontogram = {};
    if (!p.odontogram[toothNum]) {
      p.odontogram[toothNum] = { surfaces: {}, whole: null, note: '' };
    }

    const entry = p.odontogram[toothNum];
    const tool = ODONTO_TOOLS.find((t) => t.id === this.activeOdontoTool) || ODONTO_TOOLS[0];

    if (tool.type === 'clear') {
      delete p.odontogram[toothNum];
      this.saveState(`Odontograma Pza. ${toothNum} marcada como Sana`);
    } else if (tool.type === 'whole') {
      entry.whole = entry.whole === tool.id ? null : tool.id;
      this.saveState(`Odontograma Pza. ${toothNum}: ${tool.label}`);
    } else {
      entry.whole = null;
      if (entry.surfaces[surfaceCode] === tool.id) {
        delete entry.surfaces[surfaceCode];
      } else {
        entry.surfaces[surfaceCode] = tool.id;
      }
      this.saveState(`Odontograma Pza. ${toothNum} (${surfaceCode}): ${tool.label}`);
    }

    // Limpiar registro si quedó vacío
    if (p.odontogram[toothNum] && !p.odontogram[toothNum].whole && Object.keys(p.odontogram[toothNum].surfaces || {}).length === 0 && !p.odontogram[toothNum].note) {
      delete p.odontogram[toothNum];
    }

    this.renderOdontogram();
  }

  renderToothInspector(p) {
    const box = document.getElementById('odontogram-tooth-inspector');
    const toothData = p.odontogram?.[this.selectedTooth] || { surfaces: {}, whole: null, note: '' };
    const surfacesText = Object.entries(toothData.surfaces || {})
      .map(([surf, val]) => `${surf}: ${val === 'caries' ? 'Caries' : 'Restauración'}`)
      .join(', ');

    box.innerHTML = `
      <div class="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
        <div>
          <span class="text-[10px] font-bold uppercase text-teal-600">Inspector Dental FDI</span>
          <h3 class="text-base font-extrabold text-slate-900">Pieza Dental #${this.selectedTooth}</h3>
        </div>
        <button onclick="app.clearSelectedTooth()" class="text-xs font-semibold text-slate-400 hover:text-rose-600">
          Limpiar Pieza
        </button>
      </div>

      <div class="space-y-3 text-xs">
        <div class="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
          <p><strong>Estado Pieza Completa:</strong> ${toothData.whole ? toothData.whole.toUpperCase() : 'Íntegra / Normal'}</p>
          <p><strong>Superficies Marcadas:</strong> ${surfacesText || 'Ninguna cara marcada'}</p>
        </div>

        <div>
          <label class="block text-[11px] font-bold text-slate-600 mb-1">Diagnóstico / Nota específica de la Pieza ${this.selectedTooth}</label>
          <input type="text" id="tooth-note-input" value="${toothData.note || ''}" placeholder="Ej. Caries dentinaria profunda, requiere Rx..." class="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-teal-500" />
        </div>

        <div class="flex flex-col gap-2 pt-1">
          <button onclick="app.saveToothNote()" class="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition">
            Guardar Nota en Pieza #${this.selectedTooth}
          </button>
          <button onclick="app.addToothFindingToBudget('${this.selectedTooth}')" class="w-full py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs transition">
            + Enviar Procedimiento al Presupuesto
          </button>
        </div>
      </div>
    `;
  }

  saveToothNote() {
    const p = this.getActivePatient();
    const noteVal = document.getElementById('tooth-note-input')?.value || '';
    if (!p.odontogram) p.odontogram = {};
    if (!p.odontogram[this.selectedTooth]) {
      p.odontogram[this.selectedTooth] = { surfaces: {}, whole: null, note: '' };
    }
    p.odontogram[this.selectedTooth].note = noteVal;
    this.saveState(`Nota en diente ${this.selectedTooth} (${p.name})`);
    this.renderOdontogram();
    this.showToast(`Diagnóstico guardado en pieza #${this.selectedTooth}`, 'success');
  }

  clearSelectedTooth() {
    const p = this.getActivePatient();
    if (p && p.odontogram && p.odontogram[this.selectedTooth]) {
      delete p.odontogram[this.selectedTooth];
      this.saveState(`Pieza #${this.selectedTooth} restablecida a sana`);
      this.renderOdontogram();
    }
  }

  renderOdontogramFindingsList(p) {
    const entries = Object.entries(p.odontogram || {});
    document.getElementById('odontogram-findings-count').textContent = `${entries.length} pieza(s)`;
    const list = document.getElementById('odontogram-findings-list');

    if (entries.length === 0) {
      list.innerHTML = `<p class="text-xs text-slate-400 py-4 text-center">Haz clic en cualquier diente de arriba para registrar un hallazgo.</p>`;
      return;
    }

    list.innerHTML = entries.map(([tooth, info]) => {
      const surfList = Object.entries(info.surfaces || {}).map(([s, v]) => `${s} (${v === 'caries' ? 'Caries' : 'Resina'})`).join(', ');
      const label = info.whole ? `Pieza completa: ${info.whole.toUpperCase()}` : surfList;
      return `
        <div onclick="app.selectTooth('${tooth}')" class="p-2.5 rounded-xl border border-slate-200 hover:border-teal-400 cursor-pointer transition flex items-start justify-between gap-2 bg-slate-50/60">
          <div>
            <div class="flex items-center gap-1.5">
              <span class="px-2 py-0.5 rounded bg-teal-600 text-white text-[10px] font-extrabold">Pza. ${tooth}</span>
              <span class="text-xs font-bold text-slate-800">${label || 'Observación'}</span>
            </div>
            ${info.note ? `<p class="text-[11px] text-slate-500 mt-1">${info.note}</p>` : ''}
          </div>
          <button onclick="event.stopPropagation(); app.addToothFindingToBudget('${tooth}')" title="Derivar a Presupuesto" class="text-[11px] font-bold text-teal-600 hover:underline flex-shrink-0">
            + Presupuestar
          </button>
        </div>
      `;
    }).join('');
  }

  addToothFindingToBudget(toothNum) {
    const p = this.getActivePatient();
    if (!p) return;
    const finding = p.odontogram?.[toothNum];

    // Determinar servicio sugerido según hallazgo
    let serviceId = 'SRV-03'; // Resina simple por defecto
    if (finding?.whole === 'endo') serviceId = 'SRV-06';
    else if (finding?.whole === 'crown') serviceId = 'SRV-07';
    else if (finding?.whole === 'implant') serviceId = 'SRV-11';
    else if (finding?.whole === 'missing') serviceId = 'SRV-09';
    else if (finding?.surfaces && Object.keys(finding.surfaces).length >= 2) serviceId = 'SRV-04';

    const service = this.data.catalog.find((s) => s.id === serviceId) || this.data.catalog[2];

    let budget = this.data.budgets.find((b) => b.patientId === p.id);
    if (!budget) {
      budget = {
        id: `PRE-${Math.floor(510 + Math.random() * 400)}`,
        patientId: p.id,
        patientName: p.name,
        createdAt: '2026-11-24',
        dentistName: 'Dra. Valeria Mendoza Salazar',
        status: 'En Curso',
        discountPercent: 0,
        items: [],
        payments: []
      };
      this.data.budgets.push(budget);
    }

    budget.items.push({
      id: `IT-${Date.now()}`,
      serviceId: service.id,
      name: service.name,
      tooth: toothNum,
      price: service.price,
      status: 'Pendiente'
    });

    this.saveState(`Agregado al presupuesto de ${p.name}: ${service.name} (Pza. ${toothNum})`);
    this.showToast(`Se agregó "${service.name}" (Pza. ${toothNum}) al presupuesto de ${p.name}`, 'success');
  }

  // =========================================================================
  // MÓDULO 5: PRESUPUESTOS, PLANES DE TRATAMIENTO Y PAGOS
  // =========================================================================
  renderBudgets() {
    const p = this.getActivePatient();
    const container = document.getElementById('budgets-container');
    if (!container || !p) return;

    let budget = this.data.budgets.find((b) => b.patientId === p.id);
    if (!budget) {
      budget = {
        id: `PRE-${p.id.split('-')[1]}`,
        patientId: p.id,
        patientName: p.name,
        createdAt: '2026-11-24',
        dentistName: 'Dra. Valeria Mendoza Salazar',
        status: 'Abierto',
        discountPercent: 0,
        items: [
          { id: 'IT-DEF', serviceId: 'SRV-01', name: 'Consulta y Evaluación Integral + Diagnóstico Digital', tooth: 'General', price: 80, status: 'Completado' }
        ],
        payments: []
      };
      this.data.budgets.push(budget);
    }

    const subtotal = budget.items.reduce((acc, i) => acc + Number(i.price || 0), 0);
    const discountAmount = subtotal * (Number(budget.discountPercent || 0) / 100);
    const totalNet = subtotal - discountAmount;
    const totalPaid = budget.payments.reduce((acc, pay) => acc + Number(pay.amount || 0), 0);
    const balance = Math.max(0, totalNet - totalPaid);
    const progressPct = totalNet > 0 ? Math.min(100, Math.round((totalPaid / totalNet) * 100)) : 0;

    container.innerHTML = `
      <!-- Cabecera Financiera del Paciente -->
      <div class="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-5">
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div class="flex items-center gap-2">
              <span class="text-xs font-extrabold px-2.5 py-0.5 rounded-md bg-teal-50 text-teal-700 border border-teal-200">${budget.id}</span>
              <h2 class="text-base lg:text-lg font-extrabold text-slate-900">Plan de Tratamiento — ${p.name}</h2>
            </div>
            <p class="text-xs text-slate-500 mt-0.5">Responsable: ${budget.dentistName} • Creado: ${budget.createdAt} • Convenio: ${p.insurance}</p>
          </div>

          <div class="flex items-center gap-2 flex-wrap">
            <button onclick="app.openAddBudgetItemModal()" class="px-3.5 py-2 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-xs">
              + Agregar Procedimiento
            </button>
            <button onclick="app.openPaymentModal()" class="px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs">
              + Registrar Abono / Pago
            </button>
            <button onclick="window.print()" class="px-3 py-2 rounded-xl text-xs font-semibold border border-slate-200 hover:bg-slate-50 text-slate-700">
              Imprimir Estado
            </button>
          </div>
        </div>

        <!-- Resumen Financiero -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <p class="text-[11px] font-semibold text-slate-500">Subtotal Arancel</p>
            <p class="text-lg font-extrabold text-slate-900">$ ${subtotal.toFixed(2)}</p>
            <p class="text-[10px] text-slate-400">Descuento: ${budget.discountPercent}% (-$ ${discountAmount.toFixed(2)})</p>
          </div>
          <div class="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <p class="text-[11px] font-semibold text-slate-500">Total Neto Aprobado</p>
            <p class="text-lg font-extrabold text-slate-900">$ ${totalNet.toFixed(2)}</p>
            <p class="text-[10px] text-teal-600 font-semibold">${budget.items.length} procedimiento(s)</p>
          </div>
          <div class="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200">
            <p class="text-[11px] font-semibold text-emerald-700">Total Abonado / Pagado</p>
            <p class="text-lg font-extrabold text-emerald-700">$ ${totalPaid.toFixed(2)}</p>
            <p class="text-[10px] text-emerald-600">${progressPct}% cubierto</p>
          </div>
          <div class="p-3.5 rounded-xl ${balance > 0 ? 'bg-amber-50/70 border-amber-200' : 'bg-teal-50 border-teal-200'} border">
            <p class="text-[11px] font-semibold ${balance > 0 ? 'text-amber-800' : 'text-teal-800'}">Saldo Pendiente</p>
            <p class="text-lg font-extrabold ${balance > 0 ? 'text-amber-800' : 'text-teal-700'}">$ ${balance.toFixed(2)}</p>
            <p class="text-[10px] text-slate-500">${balance === 0 ? 'Plan Pagado al 100%' : 'Pagos fraccionables por cita'}</p>
          </div>
        </div>

        <!-- Barra de Progreso de Pago -->
        <div class="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
          <div class="bg-gradient-to-r from-teal-500 to-emerald-500 h-full transition-all duration-300" style="width: ${progressPct}%"></div>
        </div>
      </div>

      <!-- Detalle de Procedimientos y Caja -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <!-- Tabla de Procedimientos del Tratamiento (8 cols) -->
        <div class="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div class="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 class="text-sm font-bold text-slate-900">Procedimientos del Plan Clínico</h3>
            <span class="text-xs text-slate-500">Haz clic en el estado para actualizar el avance clínico</span>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse text-xs">
              <thead>
                <tr class="bg-slate-50 border-b border-slate-200 text-[10px] font-bold uppercase text-slate-500">
                  <th class="py-2.5 px-4">Procedimiento</th>
                  <th class="py-2.5 px-4">Pieza</th>
                  <th class="py-2.5 px-4">Importe</th>
                  <th class="py-2.5 px-4">Avance Clínico</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                ${budget.items.map((item) => `
                  <tr class="hover:bg-slate-50/80">
                    <td class="py-3 px-4 font-semibold text-slate-900">${item.name}</td>
                    <td class="py-3 px-4"><span class="px-2 py-0.5 rounded bg-slate-100 font-bold text-slate-700">${item.tooth}</span></td>
                    <td class="py-3 px-4 font-bold text-slate-800">$ ${Number(item.price).toFixed(2)}</td>
                    <td class="py-3 px-4">
                      <button onclick="app.cycleBudgetItemStatus('${budget.id}', '${item.id}')" class="px-2.5 py-1 rounded-lg text-[11px] font-bold border ${
                        item.status === 'Completado'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : item.status === 'En Proceso'
                          ? 'bg-sky-50 text-sky-700 border-sky-200'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }">
                        ${item.status} ↻
                      </button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Historial de Abonos y Pagos en Caja (4 cols) -->
        <div class="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="text-sm font-bold text-slate-900">Abonos y Recibos de Caja</h3>
            <button onclick="app.openPaymentModal()" class="text-xs font-bold text-emerald-600 hover:underline">+ Nuevo Abono</button>
          </div>
          <div class="space-y-2.5">
            ${budget.payments.length === 0 ? `<p class="text-xs text-slate-400 py-6 text-center">No se registran abonos todavía.</p>` : budget.payments.map((pay) => `
              <div class="p-3 rounded-xl border border-slate-200 bg-slate-50/70 flex items-center justify-between">
                <div>
                  <p class="text-xs font-bold text-slate-900">${pay.method}</p>
                  <p class="text-[11px] text-slate-500">${pay.date} • Ref: ${pay.reference}</p>
                </div>
                <span class="text-xs font-extrabold text-emerald-700">+ $ ${Number(pay.amount).toFixed(2)}</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  cycleBudgetItemStatus(budgetId, itemId) {
    const budget = this.data.budgets.find((b) => b.id === budgetId);
    if (!budget) return;
    const item = budget.items.find((i) => i.id === itemId);
    if (!item) return;
    const order = ['Pendiente', 'En Proceso', 'Completado'];
    item.status = order[(order.indexOf(item.status) + 1) % order.length];
    this.saveState(`Avance de tratamiento (${item.name}): ${item.status}`);
    this.renderBudgets();
    this.showToast(`${item.name}: ${item.status}`, 'info');
  }

  // =========================================================================
  // MÓDULO 6: CATÁLOGO DE ARANCELES & STAFF MÉDICO
  // =========================================================================
  setCatalogCategory(cat) {
    this.catalogCategory = cat;
    this.renderCatalog();
  }

  renderCatalog() {
    const container = document.getElementById('catalog-container');
    if (!container) return;

    const categories = ['ALL', ...new Set(this.data.catalog.map((c) => c.category))];
    const filtered = this.catalogCategory === 'ALL'
      ? this.data.catalog
      : this.data.catalog.filter((c) => c.category === this.catalogCategory);

    container.innerHTML = `
      <!-- Staff de Especialistas Odontólogos -->
      <div class="space-y-3">
        <h2 class="text-sm font-bold text-slate-900">Equipo Odontológico y Asignación de Sillones</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          ${this.data.dentists.map((d) => `
            <div class="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-2.5">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-teal-600 text-white font-extrabold text-xs flex items-center justify-center">
                  ${d.avatar}
                </div>
                <div>
                  <h3 class="text-xs font-extrabold text-slate-900">${d.name}</h3>
                  <p class="text-[11px] font-semibold text-teal-700">${d.cmp}</p>
                </div>
              </div>
              <p class="text-xs text-slate-600 font-medium">${d.specialty}</p>
              <div class="pt-1 border-t border-slate-100 text-[11px] text-slate-500 space-y-0.5">
                <p>📍 ${d.chair}</p>
                <p>🕒 ${d.availability}</p>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Tarifario / Arancel de Procedimientos -->
      <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div class="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 class="text-sm font-bold text-slate-900">Arancel Oficial de Procedimientos Clínicos (Fase 1)</h2>
            <p class="text-xs text-slate-500">Haz clic en "+ Presupuestar" para añadir cualquier servicio al paciente activo</p>
          </div>
          <div class="flex flex-wrap gap-1.5">
            ${categories.map((cat) => `
              <button onclick="app.setCatalogCategory('${cat}')" class="px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                this.catalogCategory === cat ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }">
                ${cat === 'ALL' ? 'Todos' : cat}
              </button>
            `).join('')}
          </div>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse text-xs">
            <thead>
              <tr class="bg-slate-50 border-b border-slate-200 text-[10px] font-bold uppercase text-slate-500">
                <th class="py-3 px-4">Código</th>
                <th class="py-3 px-4">Procedimiento Odontológico</th>
                <th class="py-3 px-4">Especialidad</th>
                <th class="py-3 px-4">Duración Est.</th>
                <th class="py-3 px-4">Arancel ($)</th>
                <th class="py-3 px-4 text-right">Acción Rápida</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              ${filtered.map((srv) => `
                <tr class="hover:bg-slate-50/80">
                  <td class="py-3 px-4 font-mono font-bold text-slate-500">${srv.code}</td>
                  <td class="py-3 px-4 font-bold text-slate-900">${srv.name}</td>
                  <td class="py-3 px-4"><span class="px-2 py-0.5 rounded bg-teal-50 text-teal-700 font-semibold text-[11px]">${srv.category}</span></td>
                  <td class="py-3 px-4 text-slate-600">${srv.duration} min</td>
                  <td class="py-3 px-4 font-extrabold text-slate-900">$ ${srv.price.toFixed(2)}</td>
                  <td class="py-3 px-4 text-right">
                    <button onclick="app.quickAddServiceToActivePatient('${srv.id}')" class="px-2.5 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-700 font-bold text-[11px]">
                      + Presupuestar
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  quickAddServiceToActivePatient(serviceId) {
    const p = this.getActivePatient();
    const srv = this.data.catalog.find((s) => s.id === serviceId);
    if (!p || !srv) return;
    let budget = this.data.budgets.find((b) => b.patientId === p.id);
    if (!budget) {
      budget = {
        id: `PRE-${Date.now().toString().slice(-3)}`,
        patientId: p.id,
        patientName: p.name,
        createdAt: '2026-11-24',
        dentistName: 'Dra. Valeria Mendoza Salazar',
        status: 'En Curso',
        discountPercent: 0,
        items: [],
        payments: []
      };
      this.data.budgets.push(budget);
    }
    budget.items.push({
      id: `IT-${Date.now()}`,
      serviceId: srv.id,
      name: srv.name,
      tooth: 'General',
      price: srv.price,
      status: 'Pendiente'
    });
    this.saveState(`Servicio ${srv.code} añadido a ${p.name}`);
    this.showToast(`Añadido "${srv.name}" al presupuesto de ${p.name}`, 'success');
  }

  // =========================================================================
  // MÓDULO 7: PORTAL DEL PACIENTE (SIMULADOR PWA MÓVIL)
  // =========================================================================
  setPortalStep(step) {
    this.portalStep = step;
    this.renderPatientPortal();
  }

  renderPatientPortal() {
    const p = this.getActivePatient();
    const container = document.getElementById('patient-portal-container');
    if (!container || !p) return;

    const patientAppts = this.data.appointments
      .filter((a) => a.patientId === p.id)
      .sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));
    const nextAppt = patientAppts.find((a) => a.status !== 'Atendida' && a.status !== 'Cancelada') || patientAppts[0];
    const budget = this.data.budgets.find((b) => b.patientId === p.id);

    container.innerHTML = `
      <div class="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        <!-- Simulador de Dispositivo Móvil PWA (5 cols) -->
        <div class="xl:col-span-5 flex justify-center">
          <div class="w-full max-w-[390px] bg-slate-900 rounded-[40px] p-3 shadow-2xl border-4 border-slate-800">
            <div class="bg-slate-50 rounded-[30px] overflow-hidden flex flex-col min-h-[640px]">
              <!-- Status Bar Móvil -->
              <div class="bg-teal-700 text-white px-5 pt-3 pb-4">
                <div class="flex items-center justify-between text-[11px] opacity-85 mb-2">
                  <span class="font-bold">DentaCare PWA</span>
                  <span>${this.isOffline ? '⚡ Modo Offline' : '5G • 100% 🔋'}</span>
                </div>
                <p class="text-xs text-teal-100">Hola,</p>
                <h3 class="text-base font-extrabold truncate">${p.name}</h3>
                <p class="text-[11px] text-teal-200">Carné Digital #${p.id} • ${p.insurance}</p>
              </div>

              <!-- Cuerpo de la App Móvil -->
              <div class="p-4 space-y-4 flex-1 overflow-y-auto">
                <!-- Próxima Cita + Check-in QR -->
                <div class="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-2.5">
                  <div class="flex items-center justify-between">
                    <span class="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-teal-50 text-teal-700">Tu Próxima Cita</span>
                    <span class="text-[11px] font-bold text-emerald-700">${nextAppt ? nextAppt.status : 'Sin citas'}</span>
                  </div>
                  ${nextAppt ? `
                    <p class="text-xs font-extrabold text-slate-900">${nextAppt.date} a las ${nextAppt.time} hrs</p>
                    <p class="text-xs text-slate-600">${nextAppt.serviceName}</p>
                    <p class="text-[11px] text-slate-500">${nextAppt.dentistName} • ${nextAppt.chair}</p>
                    <div class="pt-1 flex gap-2">
                      <button onclick="app.openQRCheckInModal()" class="flex-1 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold">
                        Mostrar QR de Llegada
                      </button>
                    </div>
                  ` : `<p class="text-xs text-slate-400">No tienes citas pendientes.</p>`}
                </div>

                <!-- Asistente Móvil para Reservar Cita en 3 Pasos -->
                <div class="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
                  <div class="flex items-center justify-between">
                    <h4 class="text-xs font-extrabold text-slate-900">Agendar Nueva Cita Online</h4>
                    <span class="text-[11px] font-bold text-teal-600">Paso ${this.portalStep} de 3</span>
                  </div>

                  ${this.renderPortalBookingStep()}
                </div>

                <!-- Indicaciones Post-Operatorias en Caché Offline -->
                <div class="bg-teal-50/80 rounded-2xl p-3.5 border border-teal-200 space-y-1">
                  <p class="text-xs font-bold text-teal-950">📋 Cuidados Post-Atención (Disponible Offline)</p>
                  <p class="text-[11px] text-teal-800 leading-relaxed">
                    • Evitar alimentos duros o muy calientes durante las primeras 2 horas.<br>
                    • Recordatorio personalizado: <strong>${(p.alerts || [])[0] || 'Cepillado suave tras cada comida'}</strong>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Panel Derecho: Explicación de Capacidades PWA y Estado del Paciente (7 cols) -->
        <div class="xl:col-span-7 space-y-5">
          <div class="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
            <span class="text-[11px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
              Sincronización Bidireccional en Tiempo Real
            </span>
            <h3 class="text-base font-extrabold text-slate-900">Autogestión del Paciente Integrada con Recepción</h3>
            <p class="text-xs text-slate-600 leading-relaxed">
              Toda cita reservada o confirmada por el paciente desde el simulador móvil de la izquierda se inserta inmediatamente en la <strong>Agenda Clínica</strong> y en el <strong>Dashboard de Recepción</strong>. Además, al activar el <strong>Modo Offline</strong> en la barra superior, puedes comprobar cómo la PWA almacena las reservas localmente y las sincroniza cuando vuelve la conexión.
            </p>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div class="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <p class="text-xs font-bold text-slate-900">1. Reserva en 3 toques</p>
                <p class="text-[11px] text-slate-500 mt-0.5">Selección guiada de procedimiento, especialista, fecha y hora disponible.</p>
              </div>
              <div class="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <p class="text-xs font-bold text-slate-900">2. Check-in con Código QR</p>
                <p class="text-[11px] text-slate-500 mt-0.5">Al llegar a la clínica, cambia el estado de la cita a "En Sala" instantáneamente.</p>
              </div>
              <div class="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <p class="text-xs font-bold text-slate-900">3. Transparencia Clínica</p>
                <p class="text-[11px] text-slate-500 mt-0.5">El paciente visualiza su presupuesto, pagos realizados e indicaciones médicas.</p>
              </div>
            </div>
          </div>

          <!-- Resumen de Tratamiento Visible para el Paciente -->
          <div class="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
            <h4 class="text-sm font-bold text-slate-900">Historial de Citas de ${p.name}</h4>
            <div class="divide-y divide-slate-100">
              ${patientAppts.map((a) => `
                <div class="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <p class="font-bold text-slate-900">${a.date} • ${a.time} — ${a.serviceName}</p>
                    <p class="text-[11px] text-slate-500">${a.dentistName} (${a.chair})</p>
                  </div>
                  <span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${this.getStatusBadgeClass(a.status)}">${a.status}</span>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  renderPortalBookingStep() {
    if (this.portalStep === 1) {
      return `
        <div class="space-y-2.5 text-xs">
          <label class="block text-[11px] font-bold text-slate-600">1. Selecciona el Motivo / Tratamiento</label>
          <select onchange="app.portalDraft.serviceId = this.value" class="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold">
            ${this.data.catalog.map((s) => `<option value="${s.id}" ${s.id === this.portalDraft.serviceId ? 'selected' : ''}>${s.name} ($ ${s.price})</option>`).join('')}
          </select>
          <button onclick="app.setPortalStep(2)" class="w-full py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold">
            Continuar →Elegir Especialista
          </button>
        </div>
      `;
    }
    if (this.portalStep === 2) {
      return `
        <div class="space-y-2.5 text-xs">
          <label class="block text-[11px] font-bold text-slate-600">2. Especialista y Fecha Deseada</label>
          <select onchange="app.portalDraft.dentistId = this.value" class="w-full p-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold">
            ${this.data.dentists.map((d) => `<option value="${d.id}" ${d.id === this.portalDraft.dentistId ? 'selected' : ''}>${d.name}</option>`).join('')}
          </select>
          <div class="grid grid-cols-2 gap-2">
            <input type="date" value="${this.portalDraft.date}" onchange="app.portalDraft.date = this.value" class="p-2 rounded-xl border border-slate-200 text-xs font-semibold" />
            <select onchange="app.portalDraft.time = this.value" class="p-2 rounded-xl border border-slate-200 text-xs font-semibold">
              ${['09:00','10:00','11:30','15:00','16:30','18:00'].map((t) => `<option value="${t}" ${t === this.portalDraft.time ? 'selected' : ''}>${t} hrs</option>`).join('')}
            </select>
          </div>
          <div class="flex gap-2">
            <button onclick="app.setPortalStep(1)" class="w-1/3 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold">Atrás</button>
            <button onclick="app.setPortalStep(3)" class="w-2/3 py-2 rounded-xl bg-teal-600 text-white font-bold">Revisar Reserva →</button>
          </div>
        </div>
      `;
    }
    const srv = this.data.catalog.find((s) => s.id === this.portalDraft.serviceId) || this.data.catalog[0];
    const doc = this.data.dentists.find((d) => d.id === this.portalDraft.dentistId) || this.data.dentists[0];
    return `
      <div class="space-y-2.5 text-xs">
        <div class="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
          <p class="font-bold text-slate-900">${srv.name}</p>
          <p class="text-slate-600">${doc.name}</p>
          <p class="font-bold text-teal-700">📅 ${this.portalDraft.date} a las ${this.portalDraft.time} hrs</p>
        </div>
        <div class="flex gap-2">
          <button onclick="app.setPortalStep(2)" class="w-1/3 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold">Atrás</button>
          <button onclick="app.confirmPortalBooking()" class="w-2/3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold">
            Confirmar Cita Ahora
          </button>
        </div>
      </div>
    `;
  }

  confirmPortalBooking() {
    const p = this.getActivePatient();
    const srv = this.data.catalog.find((s) => s.id === this.portalDraft.serviceId) || this.data.catalog[0];
    const doc = this.data.dentists.find((d) => d.id === this.portalDraft.dentistId) || this.data.dentists[0];

    const newAppt = {
      id: `CIT-${Math.floor(300 + Math.random() * 600)}`,
      date: this.portalDraft.date,
      time: this.portalDraft.time,
      duration: srv.duration,
      patientId: p.id,
      patientName: p.name,
      dentistId: doc.id,
      dentistName: doc.name,
      chair: doc.chair.split(' (')[0],
      serviceId: srv.id,
      serviceName: srv.name,
      tooth: 'General',
      status: 'Confirmada',
      notes: 'Autogestionada desde Portal del Paciente PWA'
    };

    this.data.appointments.push(newAppt);
    this.portalStep = 1;
    this.saveState(`Reserva móvil PWA: ${p.name} (${newAppt.date} ${newAppt.time})`);
    this.renderPatientPortal();
    this.showToast(`¡Cita reservada con éxito para el ${newAppt.date} a las ${newAppt.time}!`, 'success');
  }

  // =========================================================================
  // MODALES INTERACTIVOS (NUEVA CITA, PACIENTE, EVOLUCIÓN, PAGO, RX, QR, REQ)
  // =========================================================================
  openModal(htmlContent) {
    const overlay = document.getElementById('modal-overlay');
    const content = document.getElementById('modal-content');
    content.innerHTML = htmlContent;
    overlay.classList.remove('hidden');
    overlay.classList.add('flex');
  }

  closeModal() {
    const overlay = document.getElementById('modal-overlay');
    overlay.classList.add('hidden');
    overlay.classList.remove('flex');
  }

  openAppointmentModal() {
    const p = this.getActivePatient();
    this.openModal(`
      <div class="space-y-4">
        <div class="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 class="text-base font-extrabold text-slate-900">Agendar Nueva Cita Odontológica</h3>
          <button onclick="app.closeModal()" class="text-slate-400 hover:text-slate-700 text-sm font-bold">✕</button>
        </div>
        <form onsubmit="app.submitNewAppointment(event)" class="space-y-3 text-xs">
          <div>
            <label class="block font-bold text-slate-700 mb-1">Paciente</label>
            <select id="modal-appt-patient" required class="w-full p-2.5 rounded-xl border border-slate-200">
              ${this.data.patients.map((pat) => `<option value="${pat.id}" ${pat.id === p?.id ? 'selected' : ''}>${pat.name} (${pat.docNumber})</option>`).join('')}
            </select>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block font-bold text-slate-700 mb-1">Odontólogo Especialista</label>
              <select id="modal-appt-dentist" required class="w-full p-2.5 rounded-xl border border-slate-200">
                ${this.data.dentists.map((d) => `<option value="${d.id}">${d.name}</option>`).join('')}
              </select>
            </div>
            <div>
              <label class="block font-bold text-slate-700 mb-1">Consultorio / Sillón</label>
              <select id="modal-appt-chair" class="w-full p-2.5 rounded-xl border border-slate-200">
                <option value="Consultorio 1">Consultorio 1 (Principal)</option>
                <option value="Consultorio 2">Consultorio 2 (Endo & Rx)</option>
                <option value="Consultorio 3">Consultorio 3 (Ortodoncia)</option>
              </select>
            </div>
          </div>
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div>
              <label class="block font-bold text-slate-700 mb-1">Fecha</label>
              <input type="date" id="modal-appt-date" value="2026-11-24" required class="w-full p-2.5 rounded-xl border border-slate-200" />
            </div>
            <div>
              <label class="block font-bold text-slate-700 mb-1">Hora</label>
              <input type="time" id="modal-appt-time" value="17:30" required class="w-full p-2.5 rounded-xl border border-slate-200" />
            </div>
            <div>
              <label class="block font-bold text-slate-700 mb-1">Pieza Dental</label>
              <input type="text" id="modal-appt-tooth" value="${this.selectedTooth || 'General'}" class="w-full p-2.5 rounded-xl border border-slate-200" />
            </div>
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">Procedimiento / Motivo de Consulta</label>
            <select id="modal-appt-service" required class="w-full p-2.5 rounded-xl border border-slate-200">
              ${this.data.catalog.map((s) => `<option value="${s.id}">${s.name} (${s.duration}m — $ ${s.price})</option>`).join('')}
            </select>
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">Indicaciones / Observaciones de Recepción</label>
            <input type="text" id="modal-appt-notes" placeholder="Ej. Verificar alergias o radiografía previa..." class="w-full p-2.5 rounded-xl border border-slate-200" />
          </div>
          <div class="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button type="button" onclick="app.closeModal()" class="px-4 py-2 rounded-xl border border-slate-200 font-semibold">Cancelar</button>
            <button type="submit" class="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold">Guardar Cita</button>
          </div>
        </form>
      </div>
    `);
  }

  submitNewAppointment(e) {
    e.preventDefault();
    const patId = document.getElementById('modal-appt-patient').value;
    const docId = document.getElementById('modal-appt-dentist').value;
    const srvId = document.getElementById('modal-appt-service').value;

    const pat = this.data.patients.find((p) => p.id === patId);
    const doc = this.data.dentists.find((d) => d.id === docId);
    const srv = this.data.catalog.find((s) => s.id === srvId);

    const newAppt = {
      id: `CIT-${Math.floor(210 + Math.random() * 700)}`,
      date: document.getElementById('modal-appt-date').value,
      time: document.getElementById('modal-appt-time').value,
      duration: srv ? srv.duration : 45,
      patientId: pat.id,
      patientName: pat.name,
      dentistId: doc.id,
      dentistName: doc.name,
      chair: document.getElementById('modal-appt-chair').value,
      serviceId: srv.id,
      serviceName: srv.name,
      tooth: document.getElementById('modal-appt-tooth').value || 'General',
      status: 'Confirmada',
      notes: document.getElementById('modal-appt-notes').value || 'Cita registrada en recepción'
    };

    this.data.appointments.push(newAppt);
    this.saveState(`Nueva cita: ${pat.name} (${newAppt.date} ${newAppt.time})`);
    this.closeModal();
    this.renderCurrentView();
    this.showToast(`Cita agendada para ${pat.name} el ${newAppt.date} a las ${newAppt.time}`, 'success');
  }

  openPatientModal() {
    this.openModal(`
      <div class="space-y-4">
        <div class="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 class="text-base font-extrabold text-slate-900">Alta de Nuevo Paciente e Historia Clínica</h3>
          <button onclick="app.closeModal()" class="text-slate-400 hover:text-slate-700 text-sm font-bold">✕</button>
        </div>
        <form onsubmit="app.submitNewPatient(event)" class="space-y-3 text-xs">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div class="sm:col-span-2">
              <label class="block font-bold text-slate-700 mb-1">Nombres y Apellidos Completos</label>
              <input type="text" id="modal-pat-name" required placeholder="Ej. Mariana López Gálvez" class="w-full p-2.5 rounded-xl border border-slate-200" />
            </div>
            <div>
              <label class="block font-bold text-slate-700 mb-1">DNI / Documento</label>
              <input type="text" id="modal-pat-doc" required placeholder="Ej. 45891203" class="w-full p-2.5 rounded-xl border border-slate-200" />
            </div>
            <div>
              <label class="block font-bold text-slate-700 mb-1">Edad (años)</label>
              <input type="number" id="modal-pat-age" value="30" required class="w-full p-2.5 rounded-xl border border-slate-200" />
            </div>
            <div>
              <label class="block font-bold text-slate-700 mb-1">Teléfono Móvil (WhatsApp)</label>
              <input type="text" id="modal-pat-phone" required placeholder="+51 987 000 111" class="w-full p-2.5 rounded-xl border border-slate-200" />
            </div>
            <div>
              <label class="block font-bold text-slate-700 mb-1">Seguro / Convenio</label>
              <input type="text" id="modal-pat-ins" value="Particular" class="w-full p-2.5 rounded-xl border border-slate-200" />
            </div>
          </div>
          <div>
            <label class="block font-bold text-rose-700 mb-1">Alertas Médicas / Alergias (Importante)</label>
            <input type="text" id="modal-pat-alerts" placeholder="Ej. Alergia a AINEs, Hipertensión (o dejar en blanco)" class="w-full p-2.5 rounded-xl border border-rose-200 bg-rose-50/40" />
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">Motivo de Consulta / Antecedentes</label>
            <textarea id="modal-pat-notes" rows="2" placeholder="Evaluación odontológica integral..." class="w-full p-2.5 rounded-xl border border-slate-200"></textarea>
          </div>
          <div class="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button type="button" onclick="app.closeModal()" class="px-4 py-2 rounded-xl border border-slate-200 font-semibold">Cancelar</button>
            <button type="submit" class="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold">Aperturar HCE</button>
          </div>
        </form>
      </div>
    `);
  }

  submitNewPatient(e) {
    e.preventDefault();
    const name = document.getElementById('modal-pat-name').value.trim();
    const age = Number(document.getElementById('modal-pat-age').value || 30);
    const alertRaw = document.getElementById('modal-pat-alerts').value.trim();

    const newPat = {
      id: `PAC-${1000 + this.data.patients.length + 1}`,
      name,
      docType: 'DNI',
      docNumber: document.getElementById('modal-pat-doc').value.trim(),
      birthDate: '1995-05-15',
      age,
      gender: 'No especificado',
      phone: document.getElementById('modal-pat-phone').value.trim(),
      email: 'paciente@dentacare.pe',
      address: 'Lima Metropolitana',
      insurance: document.getElementById('modal-pat-ins').value.trim() || 'Particular',
      bloodType: 'O+',
      emergencyContact: 'Familiar directo',
      alerts: alertRaw ? alertRaw.split(',').map((s) => s.trim()) : ['Sin alergias medicamentosas conocidas (RAMA Negativo)'],
      systemicConditions: ['Ninguna registrada'],
      currentMedication: 'Ninguna',
      lastVisit: '2026-11-24',
      status: 'En Tratamiento',
      dentitionType: age <= 11 ? 'child' : 'adult',
      clinicalNotes: document.getElementById('modal-pat-notes').value.trim() || 'Apertura de Historia Clínica Electrónica en Fase 1.',
      odontogram: {},
      evolutions: [],
      radiographs: []
    };

    this.data.patients.unshift(newPat);
    this.activePatientId = newPat.id;
    this.saveState(`Apertura de HCE: ${newPat.name}`);
    this.closeModal();
    this.navigate('patients');
    this.showToast(`Historia Clínica #${newPat.id} creada para ${newPat.name}`, 'success');
  }

  openEvolutionModal() {
    const p = this.getActivePatient();
    this.openModal(`
      <div class="space-y-4">
        <div class="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 class="text-base font-extrabold text-slate-900">Registrar Evolución Clínica SOAP — ${p.name}</h3>
          <button onclick="app.closeModal()" class="text-slate-400 hover:text-slate-700 text-sm font-bold">✕</button>
        </div>
        <form onsubmit="app.submitNewEvolution(event)" class="space-y-3 text-xs">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block font-bold text-slate-700 mb-1">Odontólogo Tratante</label>
              <select id="modal-evo-dentist" class="w-full p-2.5 rounded-xl border border-slate-200">
                ${this.data.dentists.map((d) => `<option value="${d.name}">${d.name}</option>`).join('')}
              </select>
            </div>
            <div>
              <label class="block font-bold text-slate-700 mb-1">Pieza Dental / Sector</label>
              <input type="text" id="modal-evo-tooth" value="${this.selectedTooth || '16'}" required class="w-full p-2.5 rounded-xl border border-slate-200" />
            </div>
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">Procedimiento Realizado</label>
            <select id="modal-evo-proc" class="w-full p-2.5 rounded-xl border border-slate-200">
              ${this.data.catalog.map((s) => `<option value="${s.name}">${s.name}</option>`).join('')}
            </select>
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">Nota de Evolución (Subjetivo, Objetivo, Análisis, Plan)</label>
            <textarea id="modal-evo-soap" rows="4" required placeholder="S: Paciente acude a sesión. O: Aislamiento absoluto, preparación cavitaria... A: Procedimiento sin complicaciones. P: Control oclusal." class="w-full p-2.5 rounded-xl border border-slate-200"></textarea>
          </div>
          <div class="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button type="button" onclick="app.closeModal()" class="px-4 py-2 rounded-xl border border-slate-200 font-semibold">Cancelar</button>
            <button type="submit" class="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold">Firmar y Guardar Evolución</button>
          </div>
        </form>
      </div>
    `);
  }

  submitNewEvolution(e) {
    e.preventDefault();
    const p = this.getActivePatient();
    if (!p.evolutions) p.evolutions = [];
    p.evolutions.unshift({
      id: `EVO-${Date.now()}`,
      date: '2026-11-24 ' + new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }),
      dentist: document.getElementById('modal-evo-dentist').value,
      tooth: document.getElementById('modal-evo-tooth').value,
      procedure: document.getElementById('modal-evo-proc').value,
      soap: document.getElementById('modal-evo-soap').value,
      attachment: 'Firma Digital COP Validada'
    });
    this.hceTab = 'evolutions';
    this.saveState(`Nueva evolución SOAP registrada (${p.name})`);
    this.closeModal();
    this.renderCurrentView();
    this.showToast('Evolución clínica firmada y agregada a la HCE.', 'success');
  }

  openAddBudgetItemModal() {
    const p = this.getActivePatient();
    this.openModal(`
      <div class="space-y-4">
        <div class="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 class="text-base font-extrabold text-slate-900">Añadir Procedimiento al Plan de ${p.name}</h3>
          <button onclick="app.closeModal()" class="text-slate-400 hover:text-slate-700 text-sm font-bold">✕</button>
        </div>
        <form onsubmit="app.submitBudgetItem(event)" class="space-y-3 text-xs">
          <div>
            <label class="block font-bold text-slate-700 mb-1">Procedimiento del Catálogo</label>
            <select id="modal-bi-service" class="w-full p-2.5 rounded-xl border border-slate-200">
              ${this.data.catalog.map((s) => `<option value="${s.id}">${s.code} — ${s.name} ($ ${s.price})</option>`).join('')}
            </select>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-bold text-slate-700 mb-1">Pieza Dental FDI</label>
              <input type="text" id="modal-bi-tooth" value="16" required class="w-full p-2.5 rounded-xl border border-slate-200" />
            </div>
            <div>
              <label class="block font-bold text-slate-700 mb-1">Estado Inicial</label>
              <select id="modal-bi-status" class="w-full p-2.5 rounded-xl border border-slate-200">
                <option value="Pendiente">Pendiente</option>
                <option value="En Proceso">En Proceso</option>
                <option value="Completado">Completado</option>
              </select>
            </div>
          </div>
          <div class="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button type="button" onclick="app.closeModal()" class="px-4 py-2 rounded-xl border border-slate-200 font-semibold">Cancelar</button>
            <button type="submit" class="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold">Añadir al Presupuesto</button>
          </div>
        </form>
      </div>
    `);
  }

  submitBudgetItem(e) {
    e.preventDefault();
    const p = this.getActivePatient();
    const srvId = document.getElementById('modal-bi-service').value;
    const srv = this.data.catalog.find((s) => s.id === srvId);
    const budget = this.data.budgets.find((b) => b.patientId === p.id);
    if (budget && srv) {
      budget.items.push({
        id: `IT-${Date.now()}`,
        serviceId: srv.id,
        name: srv.name,
        tooth: document.getElementById('modal-bi-tooth').value,
        price: srv.price,
        status: document.getElementById('modal-bi-status').value
      });
      this.saveState(`Procedimiento añadido al presupuesto de ${p.name}`);
    }
    this.closeModal();
    this.renderBudgets();
    this.showToast('Procedimiento añadido al presupuesto.', 'success');
  }

  openPaymentModal() {
    const p = this.getActivePatient();
    this.openModal(`
      <div class="space-y-4">
        <div class="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 class="text-base font-extrabold text-slate-900">Registrar Abono en Caja — ${p.name}</h3>
          <button onclick="app.closeModal()" class="text-slate-400 hover:text-slate-700 text-sm font-bold">✕</button>
        </div>
        <form onsubmit="app.submitPayment(event)" class="space-y-3 text-xs">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-bold text-slate-700 mb-1">Monto a Abonar ($)</label>
              <input type="number" step="0.01" id="modal-pay-amount" value="250" required class="w-full p-2.5 rounded-xl border border-slate-200 font-extrabold text-sm" />
            </div>
            <div>
              <label class="block font-bold text-slate-700 mb-1">Medio de Pago</label>
              <select id="modal-pay-method" class="w-full p-2.5 rounded-xl border border-slate-200">
                <option value="Tarjeta Crédito / Débito POS">Tarjeta Crédito / Débito POS</option>
                <option value="Transferencia Bancaria">Transferencia Bancaria</option>
                <option value="Efectivo en Caja">Efectivo en Caja</option>
              </select>
            </div>
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">N° de Operación / Comprobante</label>
            <input type="text" id="modal-pay-ref" value="BOL-${Math.floor(10000 + Math.random() * 89999)}" required class="w-full p-2.5 rounded-xl border border-slate-200" />
          </div>
          <div class="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button type="button" onclick="app.closeModal()" class="px-4 py-2 rounded-xl border border-slate-200 font-semibold">Cancelar</button>
            <button type="submit" class="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold">Emitir Recibo de Pago</button>
          </div>
        </form>
      </div>
    `);
  }

  submitPayment(e) {
    e.preventDefault();
    const p = this.getActivePatient();
    const budget = this.data.budgets.find((b) => b.patientId === p.id);
    const amount = Number(document.getElementById('modal-pay-amount').value || 0);
    if (budget && amount > 0) {
      budget.payments.push({
        id: `PAG-${Date.now()}`,
        date: '2026-11-24',
        amount,
        method: document.getElementById('modal-pay-method').value,
        reference: document.getElementById('modal-pay-ref').value
      });
      this.saveState(`Pago registrado $ ${amount.toFixed(2)} (${p.name})`);
    }
    this.closeModal();
    this.renderBudgets();
    this.showToast(`Abono de $ ${amount.toFixed(2)} registrado correctamente.`, 'success');
  }

  openRadiographViewer(rxId) {
    const p = this.getActivePatient();
    const rx = (p.radiographs || []).find((r) => r.id === rxId) || {
      title: 'Estudio Radiográfico Digital',
      date: '2026-11-24',
      tooth: 'Arcada',
      type: 'RVG Digital',
      finding: 'Estructuras óseas y radiculares dentro de parámetros normales.'
    };

    this.openModal(`
      <div class="space-y-4">
        <div class="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <span class="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-teal-50 text-teal-700">${rx.type}</span>
            <h3 class="text-base font-extrabold text-slate-900 mt-1">${rx.title}</h3>
          </div>
          <button onclick="app.closeModal()" class="text-slate-400 hover:text-slate-700 text-sm font-bold">✕</button>
        </div>
        <div class="bg-slate-950 rounded-2xl p-6 flex flex-col items-center justify-center border border-slate-800">
          <svg class="w-64 h-44 text-sky-200/80" viewBox="0 0 240 150" fill="none">
            <rect x="6" y="6" width="228" height="138" rx="12" stroke="#38bdf8" stroke-opacity="0.35" stroke-dasharray="4 4"/>
            <path d="M45 36C45 20 75 20 75 36C75 62 66 105 58 122C54 98 45 62 45 36Z" fill="currentColor" fill-opacity="0.75"/>
            <path d="M100 32C100 16 138 16 138 32C138 62 132 108 125 126C120 96 116 96 111 126C104 108 100 62 100 32Z" fill="currentColor"/>
            <path d="M114 45L112 118M124 45L125 118" stroke="#38bdf8" stroke-width="3.5" stroke-linecap="round"/>
            <path d="M162 36C162 20 192 20 192 36C192 62 184 105 176 122C172 98 162 62 162 36Z" fill="currentColor" fill-opacity="0.75"/>
          </svg>
          <p class="text-[11px] text-sky-300 mt-2">Paciente: ${p.name} • Zona: ${rx.tooth} • Fecha: ${rx.date}</p>
        </div>
        <div class="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
          <p class="font-bold text-slate-900">Hallazgo Radiológico:</p>
          <p class="text-slate-600 mt-0.5">${rx.finding}</p>
        </div>
      </div>
    `);
  }

  openQRCheckInModal() {
    const p = this.getActivePatient();
    this.openModal(`
      <div class="space-y-4 text-center">
        <div class="flex items-center justify-between border-b border-slate-100 pb-3 text-left">
          <h3 class="text-base font-extrabold text-slate-900">Pase Digital QR — Check-In en Recepción</h3>
          <button onclick="app.closeModal()" class="text-slate-400 hover:text-slate-700 text-sm font-bold">✕</button>
        </div>
        <div class="p-5 bg-slate-50 rounded-2xl border border-slate-200 inline-block mx-auto">
          <svg class="w-40 h-40 text-slate-900 mx-auto" viewBox="0 0 100 100" fill="currentColor">
            <rect x="8" y="8" width="26" height="26" rx="3" fill="none" stroke="currentColor" stroke-width="6"/>
            <rect x="16" y="16" width="10" height="10"/>
            <rect x="66" y="8" width="26" height="26" rx="3" fill="none" stroke="currentColor" stroke-width="6"/>
            <rect x="74" y="16" width="10" height="10"/>
            <rect x="8" y="66" width="26" height="26" rx="3" fill="none" stroke="currentColor" stroke-width="6"/>
            <rect x="16" y="74" width="10" height="10"/>
            <rect x="44" y="14" width="8" height="8"/><rect x="44" y="30" width="8" height="16"/>
            <rect x="14" y="44" width="18" height="8"/><rect x="42" y="48" width="16" height="8"/>
            <rect x="66" y="44" width="10" height="18"/><rect x="82" y="52" width="10" height="14"/>
            <rect x="44" y="68" width="14" height="8"/><rect x="66" y="72" width="22" height="8"/>
            <rect x="52" y="84" width="16" height="8"/>
          </svg>
        </div>
        <div class="text-xs space-y-1">
          <p class="font-extrabold text-slate-900 text-sm">${p.name}</p>
          <p class="text-slate-500">HC #${p.id} • ${p.docType} ${p.docNumber}</p>
        </div>
        <button onclick="app.simulateQRCheckInArrival()" class="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold">
          Simular Escaneo en Recepción (Marcar "En Sala")
        </button>
      </div>
    `);
  }

  simulateQRCheckInArrival() {
    const p = this.getActivePatient();
    const appt = this.data.appointments.find((a) => a.patientId === p.id && a.status !== 'Atendida');
    if (appt) {
      appt.status = 'En Sala';
      this.saveState(`Check-in QR: ${p.name} ingresó a Sala de Espera`);
    }
    this.closeModal();
    this.renderCurrentView();
    this.showToast(`Check-in QR exitoso: ${p.name} figura ahora "En Sala de Espera"`, 'success');
  }

  openRequirementsModal() {
    const reqs = this.data.requirementsPhase1 || [];
    const navMap = {
      'RF-01': 'dashboard',
      'RF-02': 'agenda',
      'RF-03': 'patients',
      'RF-04': 'odontogram',
      'RF-05': 'budgets',
      'RF-06': 'patient-portal'
    };

    this.openModal(`
      <div class="space-y-4">
        <div class="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <span class="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-teal-50 text-teal-700">Matriz de Trazabilidad</span>
            <h3 class="text-base font-extrabold text-slate-900 mt-0.5">Requerimientos Cubiertos — Fase 1 (PWA Clínica Dental)</h3>
          </div>
          <button onclick="app.closeModal()" class="text-slate-400 hover:text-slate-700 text-sm font-bold">✕</button>
        </div>
        <div class="space-y-2.5">
          ${reqs.map((r) => `
            <div class="p-3 rounded-xl border border-slate-200 bg-slate-50/70 flex items-start justify-between gap-3">
              <div class="text-xs">
                <div class="flex items-center gap-2">
                  <span class="font-extrabold text-teal-700">${r.code}</span>
                  <span class="font-bold text-slate-900">${r.title}</span>
                </div>
                <p class="text-[11px] text-slate-600 mt-1">${r.description}</p>
              </div>
              <button onclick="app.closeModal(); app.navigate('${navMap[r.code] || 'dashboard'}')" class="px-2.5 py-1 rounded-lg bg-slate-900 text-white text-[11px] font-bold flex-shrink-0">
                Ir al Módulo →
              </button>
            </div>
          `).join('')}
        </div>
      </div>
    `);
  }

  // =========================================================================
  // SIMULADOR PWA OFFLINE / ONLINE & RESET DEMO
  // =========================================================================
  toggleOfflineMode() {
    this.isOffline = !this.isOffline;
    if (!this.isOffline && this.offlineQueue.length > 0) {
      const count = this.offlineQueue.length;
      this.offlineQueue = [];
      this.showToast(`Conexión restablecida: ${count} cambio(s) clínicos sincronizados con el servidor.`, 'success');
    } else if (this.isOffline) {
      this.showToast('Modo Offline activado: La PWA guardará todas tus acciones en la cola local.', 'warning');
    } else {
      this.showToast('Modo Online activo y sincronizado.', 'info');
    }
    this.updateOfflineUI();
    this.renderCurrentView();
  }

  updateOfflineUI() {
    const banner = document.getElementById('offline-banner');
    const countBanner = document.getElementById('offline-queue-count-banner');
    const btn = document.getElementById('btn-offline-toggle');
    const dot = document.getElementById('status-dot');
    const text = document.getElementById('status-text');

    if (countBanner) countBanner.textContent = this.offlineQueue.length;

    if (this.isOffline) {
      banner?.classList.remove('hidden');
      if (btn) btn.className = 'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition bg-amber-100 text-amber-900 border-amber-300';
      if (dot) dot.className = 'w-2 h-2 rounded-full bg-amber-600 animate-ping';
      if (text) text.textContent = `Offline (${this.offlineQueue.length} en cola)`;
    } else {
      banner?.classList.add('hidden');
      if (btn) btn.className = 'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100';
      if (dot) dot.className = 'w-2 h-2 rounded-full bg-emerald-500';
      if (text) text.textContent = 'Online (PWA Sync)';
    }
  }

  simulatePWAInstall() {
    this.showToast('Aplicación PWA lista para instalarse en pantalla de inicio (manifest.json + Service Worker verificados).', 'success');
  }

  resetDemoData() {
    localStorage.removeItem(STORAGE_KEY);
    this.data = JSON.parse(JSON.stringify(window.INITIAL_MOCK_DATA));
    this.activePatientId = this.data.patients[0].id;
    this.offlineQueue = [];
    this.isOffline = false;
    this.updateOfflineUI();
    this.populateGlobalSelectors();
    this.renderCurrentView();
    this.showToast('Datos mock de demostración restaurados al estado inicial.', 'info');
  }

  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const colors = {
      success: 'bg-slate-900 text-white border-teal-500',
      warning: 'bg-amber-500 text-slate-950 border-amber-700',
      info: 'bg-slate-900 text-white border-sky-500'
    };
    const toast = document.createElement('div');
    toast.className = `pointer-events-auto px-4 py-3 rounded-xl border-l-4 shadow-xl text-xs font-semibold flex items-center justify-between gap-3 transition-all ${colors[type] || colors.info}`;
    toast.innerHTML = `<span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 250);
    }, 3400);
  }
}

window.app = new DentaCareApp();
window.addEventListener('DOMContentLoaded', () => window.app.init());
