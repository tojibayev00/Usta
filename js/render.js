/**
 * ============================================================
 * USTATOP — Renderers
 * ------------------------------------------------------------
 * DOM elementlarni data.js dagi ma'lumotlar bilan to'ldiruvchi
 * funksiyalar. Har biri mustaqil va kerak bo'lganda qayta
 * chaqiriladi (masalan filtr o'zgarganda ustalar ro'yxati).
 * ============================================================
 */

// ---------------------------------------------------------------
// 1) BOSH SAHIFA — kategoriyalar gridi + tavsiya etilgan ustalar
// ---------------------------------------------------------------

function renderHomeCategories() {
  const grid = document.getElementById('home-category-grid');
  if (!grid) return;
  grid.innerHTML = CATEGORIES.slice(0, 8).map((cat) => `
    <button class="category-tile" onclick="openCategory('${cat.id}')">
      <div class="category-icon-wrap">${icon(cat.icon)}</div>
      <span>${cat.name}</span>
    </button>
  `).join('');
}

function renderTopMasters() {
  const wrap = document.getElementById('home-top-masters');
  if (!wrap) return;
  const top = [...MASTERS].sort((a, b) => b.rating - a.rating).slice(0, 5);
  wrap.innerHTML = top.map(masterCardCompact).join('');
}

function masterCardCompact(m) {
  return `
    <div class="master-card compact" onclick="openMasterProfile('${m.id}')">
      <img class="master-photo" src="${m.photo}" alt="${m.name}" loading="lazy" />
      <div class="master-body">
        <div class="master-name">${m.name}</div>
        <div class="master-meta">${categoryName(m.category)}</div>
        <div class="master-footer">
          <span class="badge-rating">${icon('star').replace('<svg', '<svg class="star-icon"')} ${m.rating.toFixed(1)}</span>
          <span class="master-price">${formatSum(m.price)}</span>
        </div>
      </div>
    </div>
  `;
}

// ---------------------------------------------------------------
// 2) XIZMAT KATEGORIYALARI SAHIFASI
// ---------------------------------------------------------------

function renderCategoriesScreen() {
  const wrap = document.getElementById('categories-full-grid');
  if (!wrap) return;
  wrap.innerHTML = CATEGORIES.map((cat) => `
    <button class="category-tile" onclick="openCategory('${cat.id}')">
      <div class="category-icon-wrap">${icon(cat.icon)}</div>
      <span>${cat.name}</span>
    </button>
  `).join('');
}

function categoryName(id) {
  const c = CATEGORIES.find((c) => c.id === id);
  return c ? c.name : id;
}

/** Kategoriya tanlanganda ustalar ro'yxatiga o'tish */
function openCategory(categoryId) {
  App.state.selectedCategory = categoryId;
  App.state.masterListFilter = 'all';
  renderMastersList();
  document.getElementById('masters-list-title').textContent = categoryName(categoryId);
  App.navigate('screen-masters-list');
}

// ---------------------------------------------------------------
// 3) USTALAR RO'YXATI (filtr + saralash bilan)
// ---------------------------------------------------------------

function renderMastersList() {
  const wrap = document.getElementById('masters-list-wrap');
  if (!wrap) return;

  let list = MASTERS.filter((m) => m.category === App.state.selectedCategory);

  const filter = App.state.masterListFilter;
  if (filter === 'top') list = list.filter((m) => m.rating >= 4.8);
  if (filter === 'near') list = [...list].sort((a, b) => a.distanceKm - b.distanceKm);
  if (filter === 'cheap') list = [...list].sort((a, b) => a.price - b.price);
  if (filter === 'online') list = list.filter((m) => m.online);

  if (list.length === 0) {
    wrap.innerHTML = `
      <div class="fade-in" style="text-align:center; padding: 60px 24px; color: var(--color-text-secondary);">
        <div style="font-size:40px; margin-bottom:12px;">🔍</div>
        <div style="font-weight:700; color:var(--color-text); margin-bottom:4px;">Ustalar topilmadi</div>
        <div style="font-size:13.5px;">Boshqa filtrni tanlab ko'ring</div>
      </div>`;
    return;
  }

  wrap.innerHTML = `<div class="stagger" style="display:flex; flex-direction:column; gap:12px; padding: 0 20px;">
    ${list.map(masterCardWide).join('')}
  </div>`;
}

function masterCardWide(m) {
  return `
    <div class="master-card master-card-wide" onclick="openMasterProfile('${m.id}')">
      <img class="master-photo avatar" src="${m.photo}" alt="${m.name}" style="width:76px; height:76px;" loading="lazy" />
      <div style="flex:1; min-width:0;">
        <div style="display:flex; align-items:center; justify-content:space-between; gap:8px;">
          <div class="master-name">${m.name}</div>
          ${m.online ? `<span class="badge-online">Onlayn</span>` : ''}
        </div>
        <div class="master-meta">${m.experience}</div>
        <div style="display:flex; align-items:center; gap:10px; margin-top:6px; flex-wrap:wrap;">
          <span class="badge-rating">${icon('star').replace('<svg', '<svg class="star-icon"')} ${m.rating.toFixed(1)} <span class="text-tertiary" style="font-weight:500;">(${m.reviewsCount})</span></span>
          <span class="text-secondary" style="font-size:12.5px;">${m.distanceKm} km · ${m.etaMin} daq</span>
        </div>
      </div>
      <div style="text-align:right; flex-shrink:0;">
        <div class="master-price">${formatSum(m.price)}</div>
      </div>
    </div>
  `;
}

function setMasterFilter(filter, btnEl) {
  App.state.masterListFilter = filter;
  document.querySelectorAll('#masters-filter-bar .chip').forEach((c) => c.classList.remove('active'));
  btnEl.classList.add('active');
  renderMastersList();
}

// ---------------------------------------------------------------
// 4) USTA PROFILI
// ---------------------------------------------------------------

function getMaster(id) {
  return MASTERS.find((m) => m.id === id);
}

function openMasterProfile(masterId) {
  App.state.selectedMaster = masterId;
  renderMasterProfile(masterId);
  App.navigate('screen-master-profile');
}

function renderMasterProfile(masterId) {
  const m = getMaster(masterId);
  if (!m) return;
  const root = document.getElementById('master-profile-content');

  root.innerHTML = `
    <div class="profile-hero">
      <img src="${m.photo}" alt="${m.name}" />
      <div class="profile-hero-nav">
        <button class="nav-icon-btn" onclick="App.back()">${icon('back')}</button>
        <button class="nav-icon-btn">${icon('chatBubble')}</button>
      </div>
      <div class="profile-hero-info">
        <h2>${m.name}</h2>
        <div style="display:flex; align-items:center; gap:8px; font-size:13.5px;">
          <span>${categoryName(m.category)}</span>
          ${m.online ? `<span class="badge-online" style="color:#8CFFA6;">Onlayn</span>` : ''}
        </div>
      </div>
    </div>

    <div class="stat-row fade-in">
      <div class="stat-item">
        <div class="val">${icon('star').replace('<svg', '<svg class="star-icon" style="width:14px;height:14px;vertical-align:-2px;"')} ${m.rating.toFixed(1)}</div>
        <div class="lbl">${m.reviewsCount} sharh</div>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-item">
        <div class="val">${m.experience.split(' ')[0]}</div>
        <div class="lbl">yil tajriba</div>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-item">
        <div class="val">${m.distanceKm} km</div>
        <div class="lbl">masofa</div>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-item">
        <div class="val">${m.etaMin} daq</div>
        <div class="lbl">yetib kelish</div>
      </div>
    </div>

    <div style="padding: 0 20px 20px;">
      <h3 style="font-size:16px; font-weight:700; margin: 0 0 8px;">Haqida</h3>
      <p class="text-secondary" style="font-size:14px; line-height:1.6; margin:0;">${m.bio}</p>
    </div>

    <div style="padding: 0 20px 24px;">
      <h3 style="font-size:16px; font-weight:700; margin: 0 0 10px;">Ko'nikmalar</h3>
      <div style="display:flex; flex-wrap:wrap; gap:8px;">
        ${m.skills.map((s) => `<span class="chip" style="cursor:default;">${s}</span>`).join('')}
      </div>
    </div>

    <div style="padding: 0 20px 24px;">
      <div class="section-header" style="padding:0; margin-bottom:10px;">
        <h3>Sharhlar (${m.reviewsCount})</h3>
        <span class="link">Barchasi</span>
      </div>
      <div class="list-group">
        ${m.reviews.map((r) => `
          <div class="list-row review-item" style="align-items:flex-start;">
            <div style="flex:1;">
              <div class="review-head">
                <span class="name">${r.name}</span>
                <span style="display:flex; gap:1px;">${Array.from({length:5}).map((_,i)=>`<svg class="star-icon" style="opacity:${i < r.rating ? 1 : 0.25}" viewBox="0 0 24 24" fill="currentColor" width="12" height="12"><path d="M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z"/></svg>`).join('')}</span>
                <span class="date">${r.date}</span>
              </div>
              <div class="review-text">${r.text}</div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  document.getElementById('master-profile-price').textContent = formatSum(m.price);
}

function startOrderFlow() {
  renderOrderDateTime();
  App.navigate('screen-order-datetime');
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

function renderOrderConfirm() {
  const m = getMaster(App.state.selectedMaster);
  const root = document.getElementById('order-confirm-content');

  const dateLabel = new Date(App.state.selectedDate).toLocaleDateString('uz-UZ', { day: 'numeric', month: 'long' });

  root.innerHTML = `
    <div class="list-group" style="margin: 0 20px 16px;">
      <div class="list-row">
        <img class="avatar" src="${m.photo}" style="width:48px;height:48px;" />
        <div style="flex:1;">
          <div class="master-name">${m.name}</div>
          <div class="master-meta">${categoryName(m.category)}</div>
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
        <span style="font-weight:600;">${formatSum(5000)}</span>
      </div>
      <div class="list-row" style="justify-content:space-between;">
        <span style="font-weight:700;">Jami</span>
        <span style="font-weight:800; color:var(--color-primary); font-size:16px;">${formatSum(m.price + 5000)}</span>
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

/** Buyurtmani yuborish — bu yerda backend mavjud bo'lganda POST /api/orders chaqiriladi */
function submitOrder() {
  showToast("Buyurtma yuborildi!");
  setTimeout(() => {
    renderOrderStatus();
    App.navigate('screen-order-status');
    startLiveTrackingDemo();
  }, 650);
}
