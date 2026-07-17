/**
 * ============================================================
 * USTATOP — Order Flow (Backend API bilan)
 * ============================================================
 */

const TIME_SLOTS = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];

function generateDateSlots() {
  const days = ['Yak', 'Dush', 'Sesh', 'Chor', 'Pay', 'Jum', 'Shan'];
  const out = [];
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    out.push({ label: i === 0 ? 'Bugun' : days[d.getDay()], dnum: d.getDate(), iso: d.toISOString().slice(0, 10) });
  }
  return out;
}

// ---------------------------------------------------------------
// 5) BUYURTMA: SANA / VAQT TANLASH
// ---------------------------------------------------------------

function renderOrderDateTime() {
  const dateWrap = document.getElementById('order-date-scroll');
  const slots = generateDateSlots();
  App.state.selectedDate = slots[0].iso;

  dateWrap.innerHTML = slots.map((d, i) => `
    <button class="date-chip ${i === 0 ? 'active' : ''}" data-iso="${d.iso}" onclick="selectDate(this, '${d.iso}')">
      <div class="dow">${d.label}</div>
      <div class="dnum">${d.dnum}</div>
    </button>
  `).join('');

  const timeWrap = document.getElementById('order-time-grid');
  App.state.selectedTime = null;
  timeWrap.innerHTML = TIME_SLOTS.map((t, i) => `
    <button class="time-slot ${i === 2 ? 'disabled' : ''}" onclick="selectTime(this, '${t}')">${t}</button>
  `).join('');

  updateOrderContinueBtn();
}

function selectDate(el, iso) {
  document.querySelectorAll('.date-chip').forEach((c) => c.classList.remove('active'));
  el.classList.add('active');
  App.state.selectedDate = iso;
}

function selectTime(el, time) {
  document.querySelectorAll('.time-slot').forEach((c) => c.classList.remove('active'));
  el.classList.add('active');
  App.state.selectedTime = time;
  updateOrderContinueBtn();
}

function updateOrderContinueBtn() {
  const btn = document.getElementById('order-datetime-continue');
  if (!btn) return;
  btn.disabled = !App.state.selectedTime;
}

function goToOrderConfirm() {
  renderOrderConfirm();
  App.navigate('screen-order-confirm');
}

// ---------------------------------------------------------------
// 6) BUYURTMANI TASDIQLASH
// ---------------------------------------------------------------

const SERVICE_FEE = 5000;

function renderOrderConfirm() {
  const m = App.state.masterCache; // usta profilidan keshlangan
  const root = document.getElementById('order-confirm-content');
  const dateLabel = new Date(App.state.selectedDate).toLocaleDateString('uz-UZ', { day: 'numeric', month: 'long' });

  root.innerHTML = `
    <div class="list-group" style="margin: 0 20px 16px;">
      <div class="list-row">
        <img class="avatar" src="${m.photo || ''}" style="width:48px;height:48px;" />
        <div style="flex:1;">
          <div class="master-name">${m.name}</div>
          <div class="master-meta">${m.category ? m.category.name : ''}</div>
        </div>
        <span class="master-price">${formatSum(m.price)}</span>
      </div>
    </div>

    <div class="list-group" style="margin: 0 20px 16px;">
      <div class="list-row">
        <div class="settings-icon-wrap" style="background:var(--color-primary-soft); color:var(--color-primary);">${icon('calendar')}</div>
        <div style="flex:1;">
          <div class="text-secondary" style="font-size:12.5px;">Sana va vaqt</div>
          <div style="font-weight:600; font-size:14.5px;">${dateLabel}, ${App.state.selectedTime}</div>
        </div>
        <button class="link" style="color:var(--color-primary); font-size:13px; font-weight:600;" onclick="App.back()">O'zgartirish</button>
      </div>
      <div class="list-row">
        <div class="settings-icon-wrap" style="background:var(--color-primary-soft); color:var(--color-primary);">${icon('mapPin')}</div>
        <div style="flex:1;">
          <div class="text-secondary" style="font-size:12.5px;">Manzil</div>
          <div style="font-weight:600; font-size:14.5px;">${App.state.address}</div>
        </div>
        <button class="link" style="color:var(--color-primary); font-size:13px; font-weight:600;" onclick="editAddress()">O'zgartirish</button>
      </div>
    </div>

    <div style="margin: 0 20px 16px;">
      <textarea id="order-note" class="input-field" rows="3" placeholder="Muammo haqida qisqacha yozing (ixtiyoriy)" style="resize:none;"></textarea>
    </div>

    <div class="list-group" style="margin: 0 20px 16px;">
      <div class="list-row" style="justify-content:space-between;">
        <span class="text-secondary" style="font-size:14px;">Xizmat narxi</span>
        <span style="font-weight:600;">${formatSum(m.price)}</span>
      </div>
      <div class="list-row" style="justify-content:space-between;">
        <span class="text-secondary" style="font-size:14px;">Xizmat haqi</span>
        <span style="font-weight:600;">${formatSum(SERVICE_FEE)}</span>
      </div>
      <div class="list-row" style="justify-content:space-between;">
        <span style="font-weight:700;">Jami</span>
        <span style="font-weight:800; color:var(--color-primary); font-size:16px;">${formatSum(m.price + SERVICE_FEE)}</span>
      </div>
    </div>
  `;
}

function editAddress() {
  document.getElementById('address-sheet-input').value = App.state.address;
  showSheet('address-sheet');
}

function saveAddress() {
  const val = document.getElementById('address-sheet-input').value.trim();
  if (val) App.state.address = val;
  hideSheet('address-sheet');
  renderOrderConfirm();
}

/** Buyurtmani backendga yuborish */
async function submitOrder() {
  const btn = event?.target;
  if (btn) { btn.disabled = true; btn.textContent = 'Yuborilmoqda...'; }

  try {
    const note = document.getElementById('order-note')?.value?.trim() || undefined;
    const scheduledAt = new Date(`${App.state.selectedDate}T${App.state.selectedTime}:00`).toISOString();

    const order = await Api.orders.create({
      masterId: App.state.selectedMaster,
      scheduledAt,
      note,
      address: { fullText: App.state.address },
    });

    App.state.currentOrderId = order.id;
    showToast('Buyurtma yuborildi!');

    setTimeout(async () => {
      await renderOrderStatus(order.id);
      App.navigate('screen-order-status');
      startLiveStatusPolling(order.id);
    }, 500);
  } catch (err) {
    showToast(err.message || 'Buyurtmani yuborib bo\'lmadi');
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = 'Buyurtmani yuborish'; }
  }
}
