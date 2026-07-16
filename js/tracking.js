/**
 * ============================================================
 * USTATOP — Tracking, History, Profile Renderers
 * ============================================================
 */

// ---------------------------------------------------------------
// 7) BUYURTMA HOLATI — LIVE TRACKING (signature element)
// ---------------------------------------------------------------

function renderOrderStatus() {
  const m = getMaster(App.state.selectedMaster);
  document.getElementById('status-master-name').textContent = m.name;
  document.getElementById('status-master-photo').src = m.photo;
  document.getElementById('status-master-eta').textContent = `${m.etaMin} daqiqada yetib keladi`;

  const steps = document.getElementById('status-timeline');
  const stepDefs = [
    { key: 'accepted', title: 'Buyurtma qabul qilindi', icon: 'check', time: 'Hozir' },
    { key: 'onway', title: "Usta yo'lda", icon: 'truck', time: '' },
    { key: 'arrived', title: 'Manzilga yetib keldi', icon: 'flag', time: '' },
    { key: 'working', title: 'Ish bajarilmoqda', icon: 'helmet', time: '' },
    { key: 'done', title: 'Yakunlandi', icon: 'doorCheck', time: '' },
  ];
  steps.innerHTML = stepDefs.map((s, i) => `
    <div class="status-step ${i === 0 ? 'current' : ''}" data-key="${s.key}">
      <div class="status-dot">${icon(s.icon)}</div>
      <div>
        <div class="st-title">${s.title}</div>
        <div class="st-time">${s.time}</div>
      </div>
    </div>
  `).join('');

  const cta = document.getElementById('status-done-cta');
  if (cta) cta.style.display = 'none';
}

let trackingInterval = null;
const TRACKING_PATH = [
  { x: 16, y: 78 }, { x: 34, y: 64 }, { x: 50, y: 55 }, { x: 66, y: 38 }, { x: 80, y: 20 },
];

/** Demo: bir necha soniyada tracking bosqichini oldinga suradi + xaritada nuqta harakati */
function startLiveTrackingDemo() {
  if (trackingInterval) clearInterval(trackingInterval);

  const pin = document.getElementById('tracking-master-pin');
  let idx = 0;

  function setPinPos(i) {
    const p = TRACKING_PATH[Math.min(i, TRACKING_PATH.length - 1)];
    if (pin) {
      pin.style.left = p.x + '%';
      pin.style.top = p.y + '%';
    }
  }
  setPinPos(0);

  function advanceStep() {
    const stepEls = Array.from(document.querySelectorAll('#status-timeline .status-step'));
    if (idx >= stepEls.length) {
      clearInterval(trackingInterval);
      return;
    }
    stepEls.forEach((el, i) => {
      el.classList.toggle('done', i < idx);
      el.classList.toggle('current', i === idx);
    });
    const timeEl = stepEls[idx].querySelector('.st-time');
    if (timeEl) timeEl.textContent = new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });

    setPinPos(idx);

    const banner = document.getElementById('status-eta-text');
    const bannerTexts = [
      "Usta buyurtmangizni qabul qildi",
      "Usta sizga tomon yo'lda",
      "Usta manzilga yetib keldi",
      "Usta ish bilan band",
      "Ish muvaffaqiyatli yakunlandi",
    ];
    if (banner) banner.textContent = bannerTexts[idx] || '';

    idx++;
    if (idx >= stepEls.length) {
      clearInterval(trackingInterval);
      setTimeout(() => {
        const cta = document.getElementById('status-done-cta');
        if (cta) cta.style.display = 'flex';
      }, 400);
    }
  }

  advanceStep();
  trackingInterval = setInterval(advanceStep, 3200);
}

function callMaster() {
  showToast("Qo'ng'iroq qilinmoqda...");
}

function finishOrderDemo() {
  if (trackingInterval) clearInterval(trackingInterval);
  App.state.history = ['screen-home'];
  App.navigate('screen-home', { addToHistory: false });
}

// ---------------------------------------------------------------
// 8) BUYURTMALAR TARIXI
// ---------------------------------------------------------------

function renderHistory() {
  const wrap = document.getElementById('history-list-wrap');
  if (!wrap) return;

  if (ORDER_HISTORY.length === 0) {
    wrap.innerHTML = emptyState("Buyurtmalar yo'q", "Birinchi buyurtmangizni bering va u shu yerda paydo bo'ladi.");
    return;
  }

  wrap.innerHTML = `<div class="stagger" style="display:flex; flex-direction:column; gap:12px; padding: 0 20px;">
    ${ORDER_HISTORY.map((o) => {
      const m = getMaster(o.masterId);
      const cls = o.status === 'cancelled' ? 'cancelled' : 'completed';
      const label = o.status === 'cancelled' ? 'Bekor qilindi' : 'Bajarildi';
      return `
      <div class="card history-card" style="display:flex; gap:12px; align-items:center;" onclick="openMasterProfile('${m.id}')">
        <img class="avatar" src="${m.photo}" style="width:52px;height:52px;" />
        <div style="flex:1; min-width:0;">
          <div style="display:flex; justify-content:space-between; align-items:center; gap:8px;">
            <span class="master-name">${m.name}</span>
            <span class="status-pill ${cls}">${label}</span>
          </div>
          <div class="master-meta">${o.category} · ${o.date}</div>
        </div>
        <div style="text-align:right;">
          <div style="font-weight:800; font-size:14px;">${formatSum(o.price)}</div>
        </div>
      </div>
    `;
    }).join('')}
  </div>`;
}

function emptyState(title, sub) {
  return `
    <div class="fade-in" style="text-align:center; padding: 70px 32px;">
      <div style="width:72px;height:72px;border-radius:22px;background:var(--color-primary-soft);display:flex;align-items:center;justify-content:center;margin:0 auto 16px;color:var(--color-primary);">
        ${icon('clock')}
      </div>
      <div style="font-weight:700; font-size:16px; margin-bottom:6px;">${title}</div>
      <div class="text-secondary" style="font-size:13.5px; line-height:1.5;">${sub}</div>
    </div>`;
}

// ---------------------------------------------------------------
// 9) PROFIL
// ---------------------------------------------------------------

function renderProfile() {
  document.getElementById('profile-user-name').textContent = CURRENT_USER.name;
  document.getElementById('profile-user-phone').textContent = CURRENT_USER.phone;
  document.getElementById('profile-user-photo').src = CURRENT_USER.photo;
  document.getElementById('profile-orders-count').textContent = CURRENT_USER.ordersCount;
}

// ---------------------------------------------------------------
// UI HELPERS: toast, bottom sheet
// ---------------------------------------------------------------

function showToast(text) {
  const toast = document.getElementById('global-toast');
  toast.querySelector('span').textContent = text;
  toast.classList.add('show');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => toast.classList.remove('show'), 2200);
}

function showSheet(id) {
  document.getElementById('sheet-overlay').classList.add('show');
  document.getElementById(id).classList.add('show');
}

function hideSheet(id) {
  document.getElementById('sheet-overlay').classList.remove('show');
  document.getElementById(id).classList.remove('show');
}

function toggleSwitch(el) {
  el.classList.toggle('on');
}
