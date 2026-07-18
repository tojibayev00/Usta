/**
 * ============================================================
 * USTATOP — Live Tracking, History, Profile (Backend API bilan)
 * ------------------------------------------------------------
 * Frontendda WebSocket yo'q, shuning uchun buyurtma holatini
 * har 4 soniyada backenddan qayta so'rab turamiz (polling).
 * Bu kichik-o'rta miqyosdagi ilova uchun WebSocket'siz eng
 * sodda ishonchli yechim; backend README'sida WebSocket'ga
 * o'tish tavsiya sifatida yozilgan.
 * ============================================================
 */

const STATUS_STEPS = [
  { key: 'PENDING', title: 'Buyurtma qabul qilindi', icon: 'check' },
  { key: 'ACCEPTED', title: "Usta buyurtmani tasdiqladi", icon: 'check' },
  { key: 'ON_WAY', title: "Usta yo'lda", icon: 'truck' },
  { key: 'ARRIVED', title: 'Manzilga yetib keldi', icon: 'flag' },
  { key: 'IN_PROGRESS', title: 'Ish bajarilmoqda', icon: 'helmet' },
  { key: 'COMPLETED', title: 'Yakunlandi', icon: 'doorCheck' },
];

const STATUS_BANNER_TEXT = {
  PENDING: "Usta buyurtmangizni ko'rib chiqmoqda",
  ACCEPTED: 'Usta buyurtmangizni qabul qildi',
  ON_WAY: 'Usta sizga tomon yo\'lda',
  ARRIVED: 'Usta manzilga yetib keldi',
  IN_PROGRESS: 'Usta ish bilan band',
  COMPLETED: 'Ish muvaffaqiyatli yakunlandi',
  CANCELLED: 'Buyurtma bekor qilindi',
};

// Xarita ustida ustaning "vizual" pozitsiyasi — backendda haqiqiy GPS
// yo'qligi sababli, statusga qarab taxminiy nuqta ko'rsatamiz.
const TRACKING_PATH_BY_STATUS = {
  PENDING: { x: 16, y: 78 },
  ACCEPTED: { x: 16, y: 78 },
  ON_WAY: { x: 50, y: 50 },
  ARRIVED: { x: 80, y: 20 },
  IN_PROGRESS: { x: 80, y: 20 },
  COMPLETED: { x: 80, y: 20 },
};

let trackingPollTimer = null;

// ---------------------------------------------------------------
// 7) BUYURTMA HOLATI — LIVE TRACKING
// ---------------------------------------------------------------

async function renderOrderStatus(orderId) {
  try {
    const order = await Api.orders.getById(orderId);
    paintOrderStatus(order);
  } catch (err) {
    showToast('Buyurtma holatini yuklab bo\'lmadi');
  }
}

function paintOrderStatus(order) {
  document.getElementById('status-master-name').textContent = order.master?.name || '';
  document.getElementById('status-master-photo').src = order.master?.photo || '';
  document.getElementById('status-eta-text').textContent = STATUS_BANNER_TEXT[order.status] || '';

  const currentIndex = STATUS_STEPS.findIndex((s) => s.key === order.status);
  const isCancelled = order.status === 'CANCELLED';

  const timeline = document.getElementById('status-timeline');
  timeline.innerHTML = STATUS_STEPS.map((s, i) => {
    const eventForStep = order.statusEvents?.find((e) => e.status === s.key);
    const done = !isCancelled && i < currentIndex;
    const current = !isCancelled && i === currentIndex;
    return `
      <div class="status-step ${done ? 'done' : ''} ${current ? 'current' : ''}">
        <div class="status-dot">${icon(s.icon)}</div>
        <div>
          <div class="st-title">${s.title}</div>
          <div class="st-time">${eventForStep ? formatTime(eventForStep.createdAt) : ''}</div>
        </div>
      </div>
    `;
  }).join('');

  const pin = document.getElementById('tracking-master-pin');
  const pos = TRACKING_PATH_BY_STATUS[order.status] || TRACKING_PATH_BY_STATUS.PENDING;
  if (pin) { pin.style.left = pos.x + '%'; pin.style.top = pos.y + '%'; }

  const cta = document.getElementById('status-done-cta');
  if (cta) cta.style.display = order.status === 'COMPLETED' || order.status === 'CANCELLED' ? 'block' : 'none';

  // Yakunlangan/bekor qilingan bo'lsa, pollingni to'xtatamiz
  if (order.status === 'COMPLETED' || order.status === 'CANCELLED') {
    stopLiveStatusPolling();
  }
}

function formatTime(iso) {
  return new Date(iso).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });
}

/** Har 4 soniyada buyurtma holatini backenddan qayta so'raydi */
function startLiveStatusPolling(orderId) {
  stopLiveStatusPolling();
  trackingPollTimer = setInterval(() => renderOrderStatus(orderId), 4000);
}

function stopLiveStatusPolling() {
  if (trackingPollTimer) {
    clearInterval(trackingPollTimer);
    trackingPollTimer = null;
  }
}

function callMaster() {
  showToast("Qo'ng'iroq qilinmoqda...");
}

function finishOrderDemo() {
  stopLiveStatusPolling();
  App.state.history = ['screen-home'];
  App.navigate('screen-home', { addToHistory: false });
}

// ---------------------------------------------------------------
// 8) BUYURTMALAR TARIXI
// ---------------------------------------------------------------

async function renderHistory() {
  const wrap = document.getElementById('history-list-wrap');
  if (!wrap) return;
  wrap.innerHTML = `<div style="padding:0 20px;"><div class="skeleton" style="height:70px;border-radius:16px;margin-bottom:12px;"></div><div class="skeleton" style="height:70px;border-radius:16px;"></div></div>`;

  try {
    const orders = await Api.orders.listMine();

    if (orders.length === 0) {
      wrap.innerHTML = emptyState("Buyurtmalar yo'q", "Birinchi buyurtmangizni bering va u shu yerda paydo bo'ladi.");
      return;
    }

    const STATUS_LABEL = {
      COMPLETED: 'Bajarildi', CANCELLED: 'Bekor qilindi',
      PENDING: 'Kutilmoqda', ACCEPTED: 'Qabul qilindi',
      ON_WAY: "Yo'lda", ARRIVED: 'Yetib keldi', IN_PROGRESS: 'Jarayonda',
    };
    const STATUS_CLASS = {
      COMPLETED: 'completed', CANCELLED: 'cancelled',
    };

    wrap.innerHTML = `<div class="stagger" style="display:flex; flex-direction:column; gap:12px; padding: 0 20px;">
      ${orders.map((o) => `
        <div class="card history-card" style="display:flex; gap:12px; align-items:center;" onclick="openOrderFromHistory('${o.id}')">
          <img class="avatar" src="${o.master?.photo || ''}" style="width:52px;height:52px;" />
          <div style="flex:1; min-width:0;">
            <div style="display:flex; justify-content:space-between; align-items:center; gap:8px;">
              <span class="master-name">${o.master?.name || ''}</span>
              <span class="status-pill ${STATUS_CLASS[o.status] || 'active-p'}">${STATUS_LABEL[o.status] || o.status}</span>
            </div>
            <div class="master-meta">${o.master?.category || ''} · ${formatRelativeDate(o.createdAt)}</div>
          </div>
          <div style="text-align:right;">
            <div style="font-weight:800; font-size:14px;">${formatSum(o.totalPrice)}</div>
          </div>
        </div>
      `).join('')}
    </div>`;
  } catch (err) {
    wrap.innerHTML = emptyState('Yuklab bo\'lmadi', 'Buyurtmalar tarixini olishda xatolik yuz berdi.');
  }
}

/** Tarixdan bosilgan buyurtma hali faol bo'lsa — live statusga, aks holda profilga o'tkazamiz */
async function openOrderFromHistory(orderId) {
  try {
    const order = await Api.orders.getById(orderId);
    if (['PENDING', 'ACCEPTED', 'ON_WAY', 'ARRIVED', 'IN_PROGRESS'].includes(order.status)) {
      App.state.currentOrderId = order.id;
      paintOrderStatus(order);
      App.navigate('screen-order-status');
      startLiveStatusPolling(order.id);
    } else if (order.master?.id) {
      openMasterProfile(order.master.id);
    }
  } catch {
    showToast('Buyurtmani ochib bo\'lmadi');
  }
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

async function renderProfile() {
  try {
    const user = window.CURRENT_USER || (await Api.auth.me());
    window.CURRENT_USER = user; // keshni yangilab qo'yamiz, tahrirlashda kerak bo'ladi
    document.getElementById('profile-user-name').textContent = `${user.firstName} ${user.lastName || ''}`.trim();
    document.getElementById('profile-user-phone').textContent =
      user.phone || (user.username ? `@${user.username}` : "Telefon raqami kiritilmagan");
    document.getElementById('profile-user-photo').src = user.photoUrl || '';

    const orders = await Api.orders.listMine({ pageSize: 1 });
    // Aniq son kerak bo'lsa backendga alohida /count endpoint qo'shish mumkin;
    // hozircha ro'yxat uzunligini taxminiy ko'rsatamiz.
    document.getElementById('profile-orders-count').textContent = orders.length >= 1 ? orders.length : 0;
  } catch (err) {
    showToast('Profil ma\'lumotlarini yuklab bo\'lmadi');
  }
}

// --- Profilni tahrirlash (telefon raqami) -------------------------

function openEditProfileSheet() {
  const user = window.CURRENT_USER || {};
  document.getElementById('edit-profile-phone-input').value = user.phone || '';
  showSheet('edit-profile-sheet');
}

async function saveProfilePhone() {
  const phone = document.getElementById('edit-profile-phone-input').value.trim();
  if (!phone) {
    showToast('Telefon raqamini kiriting');
    return;
  }
  try {
    const updated = await Api.auth.updateMe({ phone });
    window.CURRENT_USER = updated;
    hideSheet('edit-profile-sheet');
    showToast('Profil yangilandi');
    renderProfile();
  } catch (err) {
    showToast(err.message || "Saqlab bo'lmadi");
  }
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

// ---------------------------------------------------------------
// Saqlangan manzillar
// ---------------------------------------------------------------

async function openSavedAddresses() {
  const list = document.getElementById('saved-addresses-list');
  list.innerHTML = `<div class="skeleton" style="height:50px;border-radius:12px;margin-bottom:10px;"></div>`;
  showSheet('saved-addresses-sheet');

  try {
    const addresses = await Api.addresses.list();

    if (addresses.length === 0) {
      list.innerHTML = `<div class="text-secondary" style="font-size:14px; text-align:center; padding:20px 0;">Hali saqlangan manzil yo'q</div>`;
      return;
    }

    list.innerHTML = `<div class="list-group">
      ${addresses.map((a) => `
        <div class="list-row">
          <div class="settings-icon-wrap" style="background:var(--color-primary-soft); color:var(--color-primary);">${icon('mapPin')}</div>
          <div style="flex:1;">
            <div style="font-weight:600; font-size:14.5px;">${a.title}</div>
            <div class="text-secondary" style="font-size:12.5px;">${a.fullText}</div>
          </div>
          <button class="nav-icon-btn" onclick="deleteSavedAddress('${a.id}')" style="width:30px;height:30px;">${icon('close')}</button>
        </div>
      `).join('')}
    </div>`;
  } catch (err) {
    list.innerHTML = `<div class="text-secondary" style="font-size:14px; text-align:center; padding:20px 0;">Yuklab bo'lmadi</div>`;
  }
}

async function deleteSavedAddress(id) {
  try {
    await Api.addresses.remove(id);
    showToast("Manzil o'chirildi");
    openSavedAddresses();
  } catch (err) {
    showToast("O'chirib bo'lmadi");
  }
}
