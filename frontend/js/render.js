/**
 * ============================================================
 * USTATOP — Renderers (Backend API bilan)
 * ------------------------------------------------------------
 * Har bir render funksiyasi endi Api.* orqali backenddan
 * ma'lumot oladi va DOM'ni to'ldiradi. Xatolar toast orqali
 * ko'rsatiladi, ilova to'liq qulab tushmaydi.
 * ============================================================
 */

// Kategoriyalarni keshlash — bir nechta sahifada qayta so'ramaslik uchun
let _categoriesCache = null;

async function getCategories() {
  if (_categoriesCache) return _categoriesCache;
  _categoriesCache = await Api.categories.list();
  return _categoriesCache;
}

function categoryName(id) {
  const c = (_categoriesCache || []).find((c) => c.id === id);
  return c ? c.name : '';
}

// ---------------------------------------------------------------
// 1) BOSH SAHIFA
// ---------------------------------------------------------------

async function renderHomeCategories() {
  const grid = document.getElementById('home-category-grid');
  if (!grid) return;
  try {
    const categories = await getCategories();
    grid.innerHTML = categories.slice(0, 8).map((cat) => `
      <button class="category-tile" onclick="openCategory('${cat.id}')">
        <div class="category-icon-wrap">${icon(cat.icon)}</div>
        <span>${cat.name}</span>
      </button>
    `).join('');
  } catch (err) {
    grid.innerHTML = '';
    showToast('Kategoriyalarni yuklab bo\'lmadi');
  }
}

async function renderTopMasters() {
  const wrap = document.getElementById('home-top-masters');
  if (!wrap) return;
  try {
    const { items } = await Api.masters.list({ sort: 'rating', pageSize: 8 });
    wrap.innerHTML = items.map(masterCardCompact).join('');
  } catch (err) {
    wrap.innerHTML = '';
    showToast('Ustalarni yuklab bo\'lmadi');
  }
}

function masterCardCompact(m) {
  return `
    <div class="master-card compact" onclick="openMasterProfile('${m.id}')">
      <img class="master-photo" src="${m.photo || ''}" alt="${m.name}" loading="lazy" />
      <div class="master-body">
        <div class="master-name">${m.name}</div>
        <div class="master-meta">${m.location || (m.category ? m.category.name : '')}</div>
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

async function renderCategoriesScreen() {
  const wrap = document.getElementById('categories-full-grid');
  if (!wrap) return;
  try {
    const categories = await getCategories();
    wrap.innerHTML = categories.map((cat) => `
      <button class="category-tile" onclick="openCategory('${cat.id}')">
        <div class="category-icon-wrap">${icon(cat.icon)}</div>
        <span>${cat.name}</span>
      </button>
    `).join('');
  } catch (err) {
    wrap.innerHTML = '';
    showToast('Kategoriyalarni yuklab bo\'lmadi');
  }
}

/** Kategoriya tanlanganda ustalar ro'yxatiga o'tish */
function openCategory(categoryId) {
  App.state.selectedCategory = categoryId;
  App.state.masterListFilter = 'all';
  App.state.regionFilter = null;
  App.state.districtFilter = null;
  App.state.villageFilter = null;
  document.getElementById('masters-list-title').textContent = categoryName(categoryId);
  App.navigate('screen-masters-list');
  renderMastersList();
}

/** "Eng yaxshi ustalar — Barchasi" bosilganda: kategoriyasiz, barcha ustalar ro'yxati */
function openAllMasters() {
  App.state.selectedCategory = null;
  App.state.masterListFilter = 'top';
  App.state.regionFilter = null;
  App.state.districtFilter = null;
  App.state.villageFilter = null;
  document.getElementById('masters-list-title').textContent = 'Eng yaxshi ustalar';
  App.navigate('screen-masters-list');
  document.querySelectorAll('#masters-filter-bar .chip').forEach((c) => c.classList.remove('active'));
  const topChip = document.querySelector('#masters-filter-bar .chip:nth-child(2)');
  if (topChip) topChip.classList.add('active');
  renderMastersList();
}

// ---------------------------------------------------------------
// 3) USTALAR RO'YXATI (filtr + saralash bilan)
// ---------------------------------------------------------------

async function renderMastersList() {
  const wrap = document.getElementById('masters-list-wrap');
  if (!wrap) return;
  wrap.innerHTML = mastersListSkeleton();

  const filter = App.state.masterListFilter;
  const params = { categoryId: App.state.selectedCategory || undefined, pageSize: 30 };

  if (App.state.regionFilter) params.region = App.state.regionFilter;
  if (App.state.districtFilter) params.district = App.state.districtFilter;
  if (App.state.villageFilter) params.village = App.state.villageFilter;

  if (filter === 'top') params.sort = 'rating';
  if (filter === 'cheap') params.sort = 'price_asc';
  if (filter === 'online') params.onlineOnly = true;

  if (filter === 'near') {
    const loc = await getUserCoordsSafe();
    if (loc) {
      params.sort = 'distance';
      params.lat = loc.lat;
      params.lng = loc.lng;
    } else {
      showToast("Joylashuvga ruxsat berilmadi — telefon sozlamalaridan yoqing");
    }
  }

  try {
    const { items } = await Api.masters.list(params);

    if (filter === 'top') {
      // Backendda "top" maxsus filtr emas, shu yerda 4.8+ deb ajratamiz
      const filtered = items.filter((m) => m.rating >= 4.8);
      return renderMastersListResult(filtered.length ? filtered : items);
    }

    renderMastersListResult(items);
  } catch (err) {
    wrap.innerHTML = `<div class="fade-in" style="text-align:center; padding: 60px 24px;">
      <div class="text-secondary" style="font-size:14px;">Ustalarni yuklab bo'lmadi. Qayta urinib ko'ring.</div>
    </div>`;
  }
}

function renderMastersListResult(list) {
  const wrap = document.getElementById('masters-list-wrap');
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

function mastersListSkeleton() {
  const row = `<div class="card" style="display:flex; gap:12px; align-items:center;">
    <div class="skeleton" style="width:76px;height:76px;border-radius:999px;"></div>
    <div style="flex:1;">
      <div class="skeleton" style="width:60%;height:14px;margin-bottom:8px;"></div>
      <div class="skeleton" style="width:40%;height:12px;"></div>
    </div>
  </div>`;
  return `<div style="display:flex; flex-direction:column; gap:12px; padding: 0 20px;">${row}${row}${row}</div>`;
}

function masterCardWide(m) {
  return `
    <div class="master-card master-card-wide" onclick="openMasterProfile('${m.id}')">
      <img class="master-photo avatar" src="${m.photo || ''}" alt="${m.name}" style="width:76px; height:76px;" loading="lazy" />
      <div style="flex:1; min-width:0;">
        <div style="display:flex; align-items:center; justify-content:space-between; gap:8px;">
          <div class="master-name">${m.name}</div>
          ${m.isOnline ? `<span class="badge-online">Onlayn</span>` : ''}
        </div>
        <div class="master-meta">${m.location ? m.location + ' · ' : ''}${m.experienceYears} yil tajriba</div>
        <div style="display:flex; align-items:center; gap:10px; margin-top:6px; flex-wrap:wrap;">
          <span class="badge-rating">${icon('star').replace('<svg', '<svg class="star-icon"')} ${m.rating.toFixed(1)} <span class="text-tertiary" style="font-weight:500;">(${m.reviewsCount})</span></span>
          ${m.distanceKm != null ? `<span class="text-secondary" style="font-size:12.5px;">${m.distanceKm} km</span>` : ''}
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

// --- Viloyat/tuman bo'yicha qidiruv (bottom-sheet, kaskadli) -----

async function openLocationFilterSheet() {
  const regionSelect = document.getElementById('location-filter-region');
  const districtSelect = document.getElementById('location-filter-district');

  if (regionSelect.options.length <= 1) {
    try {
      const regions = await getRegions();
      regionSelect.innerHTML = '<option value="">Barcha viloyatlar</option>' +
        regions.map((r) => `<option value="${r}">${r}</option>`).join('');
    } catch {
      showToast("Viloyatlarni yuklab bo'lmadi");
    }
  }

  regionSelect.value = App.state.regionFilter || '';
  document.getElementById('location-filter-village').value = App.state.villageFilter || '';

  if (App.state.regionFilter) {
    await onFilterRegionChange(App.state.districtFilter);
  } else {
    districtSelect.innerHTML = '<option value="">Avval viloyat tanlang</option>';
    districtSelect.disabled = true;
  }

  showSheet('location-filter-sheet');
}

/** Filtr sheetida viloyat tanlanganda tumanlarni yuklaydi */
async function onFilterRegionChange(preselectDistrict) {
  const region = document.getElementById('location-filter-region').value;
  const districtSelect = document.getElementById('location-filter-district');

  if (!region) {
    districtSelect.innerHTML = '<option value="">Avval viloyat tanlang</option>';
    districtSelect.disabled = true;
    return;
  }

  districtSelect.disabled = true;
  districtSelect.innerHTML = '<option value="">Yuklanmoqda...</option>';

  try {
    const districts = await Api.locations.districts(region);
    districtSelect.innerHTML = '<option value="">Barcha tumanlar</option>' +
      districts.map((d) => `<option value="${d}">${d}</option>`).join('');
    districtSelect.disabled = false;
    if (preselectDistrict) districtSelect.value = preselectDistrict;
  } catch {
    districtSelect.innerHTML = '<option value="">Yuklab bo\'lmadi</option>';
    showToast("Tumanlarni yuklab bo'lmadi");
  }
}

function applyLocationFilter() {
  const region = document.getElementById('location-filter-region').value.trim();
  const district = document.getElementById('location-filter-district').value.trim();
  const village = document.getElementById('location-filter-village').value.trim();
  App.state.regionFilter = region || null;
  App.state.districtFilter = district || null;
  App.state.villageFilter = village || null;
  hideSheet('location-filter-sheet');
  renderMastersList();
}

function clearLocationFilter() {
  App.state.regionFilter = null;
  App.state.districtFilter = null;
  App.state.villageFilter = null;
  document.getElementById('location-filter-region').value = '';
  document.getElementById('location-filter-district').innerHTML = '<option value="">Avval viloyat tanlang</option>';
  document.getElementById('location-filter-district').disabled = true;
  document.getElementById('location-filter-village').value = '';
  hideSheet('location-filter-sheet');
  renderMastersList();
}

/** Brauzer geolokatsiyasini so'raydi; ruxsat bo'lmasa null qaytaradi (xato tashlamaydi) */
function getUserCoordsSafe() {
  return new Promise((resolve) => {
    if (!navigator.geolocation) return resolve(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => resolve(null),
      { timeout: 4000 }
    );
  });
}

/** Bosh sahifadagi "Menga eng yaqin ustalarni ko'rsat" tugmasi */
async function openNearbyMasters() {
  App.state.selectedCategory = null;
  App.state.masterListFilter = 'near';
  App.state.regionFilter = null;
  App.state.districtFilter = null;
  App.state.villageFilter = null;
  document.getElementById('masters-list-title').textContent = 'Eng yaqin ustalar';
  App.navigate('screen-masters-list');
  document.querySelectorAll('#masters-filter-bar .chip').forEach((c) => c.classList.remove('active'));
  const nearChip = document.querySelector('#masters-filter-bar .chip:nth-child(3)');
  if (nearChip) nearChip.classList.add('active');
  renderMastersList();
}

// ---------------------------------------------------------------
// 4) USTA PROFILI
// ---------------------------------------------------------------

async function openMasterProfile(masterId) {
  App.state.selectedMaster = masterId;
  App.navigate('screen-master-profile');
  await renderMasterProfile(masterId);
}

async function renderMasterProfile(masterId) {
  const root = document.getElementById('master-profile-content');
  root.innerHTML = `<div style="padding:80px 24px; text-align:center;" class="text-secondary">Yuklanmoqda...</div>`;

  let m;
  try {
    m = await Api.masters.getById(masterId);
  } catch (err) {
    root.innerHTML = `<div style="padding:80px 24px; text-align:center;" class="text-secondary">Ma'lumotni yuklab bo'lmadi</div>`;
    return;
  }

  App.state.masterCache = m; // narx va boshqa maydonlarga tez murojaat uchun

  root.innerHTML = `
    <div class="profile-hero">
      <img src="${m.photo || ''}" alt="${m.name}" />
      <div class="profile-hero-nav">
        <button class="nav-icon-btn" onclick="App.back()">${icon('back')}</button>
        <button class="nav-icon-btn">${icon('chatBubble')}</button>
      </div>
      <div class="profile-hero-info">
        <h2>${m.name}</h2>
        <div style="display:flex; align-items:center; gap:8px; font-size:13.5px;">
          <span>${m.category ? m.category.name : ''}${m.location ? ' · ' + m.location : ''}</span>
          ${m.isOnline ? `<span class="badge-online" style="color:#8CFFA6;">Onlayn</span>` : ''}
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
        <div class="val">${m.experienceYears}</div>
        <div class="lbl">yil tajriba</div>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-item">
        <div class="val">${m.distanceKm != null ? m.distanceKm + ' km' : '—'}</div>
        <div class="lbl">masofa</div>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-item">
        <div class="val">${m.isVerified ? icon('checkCircle').replace('<svg', '<svg style="width:16px;height:16px;color:var(--color-success);vertical-align:-3px;"') : '—'}</div>
        <div class="lbl">tasdiqlangan</div>
      </div>
    </div>

    ${m.bio ? `
    <div style="padding: 0 20px 20px;">
      <h3 style="font-size:16px; font-weight:700; margin: 0 0 8px;">Haqida</h3>
      <p class="text-secondary" style="font-size:14px; line-height:1.6; margin:0;">${m.bio}</p>
    </div>` : ''}

    ${m.skills && m.skills.length ? `
    <div style="padding: 0 20px 24px;">
      <h3 style="font-size:16px; font-weight:700; margin: 0 0 10px;">Ko'nikmalar</h3>
      <div style="display:flex; flex-wrap:wrap; gap:8px;">
        ${m.skills.map((s) => `<span class="chip" style="cursor:default;">${s}</span>`).join('')}
      </div>
    </div>` : ''}

    <div style="padding: 0 20px 24px;">
      <div class="section-header" style="padding:0; margin-bottom:10px;">
        <h3>Sharhlar (${m.reviewsCount})</h3>
      </div>
      <div class="list-group">
        ${(m.reviews && m.reviews.length ? m.reviews : []).map((r) => `
          <div class="list-row review-item" style="align-items:flex-start;">
            <div style="flex:1;">
              <div class="review-head">
                <span class="name">${r.customerName}</span>
                <span style="display:flex; gap:1px;">${Array.from({length:5}).map((_,i)=>`<svg class="star-icon" style="opacity:${i < r.rating ? 1 : 0.25}" viewBox="0 0 24 24" fill="currentColor" width="12" height="12"><path d="M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z"/></svg>`).join('')}</span>
                <span class="date">${formatRelativeDate(r.createdAt)}</span>
              </div>
              ${r.text ? `<div class="review-text">${r.text}</div>` : ''}
            </div>
          </div>
        `).join('') || `<div class="list-row"><span class="text-secondary" style="font-size:14px;">Hozircha sharhlar yo'q</span></div>`}
      </div>
    </div>
  `;

  document.getElementById('master-profile-price').textContent = formatSum(m.price);
}

function formatRelativeDate(iso) {
  const d = new Date(iso);
  const diffDays = Math.floor((Date.now() - d.getTime()) / 86400000);
  if (diffDays <= 0) return 'Bugun';
  if (diffDays === 1) return 'Kecha';
  if (diffDays < 7) return `${diffDays} kun oldin`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} hafta oldin`;
  return d.toLocaleDateString('uz-UZ', { day: 'numeric', month: 'long' });
}

function startOrderFlow() {
  renderOrderDateTime();
  App.navigate('screen-order-datetime');
}
