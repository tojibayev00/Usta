/**
 * ============================================================
 * USTATOP — Usta sifatida ro'yxatdan o'tish
 * ------------------------------------------------------------
 * Mijoz Web App ichida forma to'ldirib, usta profiliga
 * ega bo'ladi (POST /api/masters/register). Bu yerda shu
 * forma va O'zbekiston viloyat/tuman kaskadli tanlovi
 * mantiqi joylashgan.
 * ============================================================
 */

let _regionsCache = null;

async function getRegions() {
  if (_regionsCache) return _regionsCache;
  _regionsCache = await Api.locations.regions();
  return _regionsCache;
}

/** "Usta bo'lish" sahifasini ochish va formani tayyorlash */
async function openMasterRegisterScreen() {
  App.navigate('screen-master-register');

  // Kategoriyalarni to'ldirish
  const categorySelect = document.getElementById('mr-category');
  try {
    const categories = await getCategories();
    categorySelect.innerHTML = '<option value="">Tanlang...</option>' +
      categories.map((c) => `<option value="${c.id}">${c.name}</option>`).join('');
  } catch {
    showToast("Kategoriyalarni yuklab bo'lmadi");
  }

  // Viloyatlarni to'ldirish
  const regionSelect = document.getElementById('mr-region');
  try {
    const regions = await getRegions();
    regionSelect.innerHTML = '<option value="">Tanlang...</option>' +
      regions.map((r) => `<option value="${r}">${r}</option>`).join('');
  } catch {
    showToast("Viloyatlarni yuklab bo'lmadi");
  }

  // Formani tozalash
  ['mr-phone', 'mr-village', 'mr-experience', 'mr-price', 'mr-skills', 'mr-bio', 'mr-photo'].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  const districtSelect = document.getElementById('mr-district');
  districtSelect.innerHTML = '<option value="">Avval viloyat</option>';
  districtSelect.disabled = true;
}

/** Viloyat tanlanganda tumanlar ro'yxatini yuklaydi */
async function onRegisterRegionChange() {
  const region = document.getElementById('mr-region').value;
  const districtSelect = document.getElementById('mr-district');

  if (!region) {
    districtSelect.innerHTML = '<option value="">Avval viloyat</option>';
    districtSelect.disabled = true;
    return;
  }

  districtSelect.disabled = true;
  districtSelect.innerHTML = '<option value="">Yuklanmoqda...</option>';

  try {
    const districts = await Api.locations.districts(region);
    districtSelect.innerHTML = '<option value="">Tanlang...</option>' +
      districts.map((d) => `<option value="${d}">${d}</option>`).join('');
    districtSelect.disabled = false;
  } catch {
    districtSelect.innerHTML = '<option value="">Yuklab bo\'lmadi</option>';
    showToast("Tumanlarni yuklab bo'lmadi");
  }
}

/** Formani yig'ib backendga yuboradi */
async function submitMasterRegistration() {
  const categoryId = document.getElementById('mr-category').value;
  const phoneRaw = document.getElementById('mr-phone').value.trim();
  const region = document.getElementById('mr-region').value;
  const district = document.getElementById('mr-district').value;
  const village = document.getElementById('mr-village').value.trim();
  const experienceYrs = document.getElementById('mr-experience').value;
  const basePrice = document.getElementById('mr-price').value;
  const skillsRaw = document.getElementById('mr-skills').value.trim();
  const bio = document.getElementById('mr-bio').value.trim();
  const photo = document.getElementById('mr-photo').value.trim();

  if (!categoryId) return showToast("Kasbiy yo'nalishni tanlang");
  if (!phoneRaw || phoneRaw.length < 7) return showToast("Telefon raqamini to'g'ri kiriting");
  if (!region) return showToast("Viloyatni tanlang");
  if (!district) return showToast("Tumanni tanlang");

  const btn = event?.target;
  if (btn) { btn.disabled = true; btn.textContent = "Yuborilmoqda..."; }

  try {
    await Api.masters.register({
      categoryId,
      phone: `+998${phoneRaw.replace(/\D/g, '')}`,
      region,
      district,
      village: village || undefined,
      experienceYrs: experienceYrs ? parseInt(experienceYrs, 10) : 0,
      basePrice: basePrice ? parseInt(basePrice, 10) : undefined,
      bio: bio || undefined,
      photo: photo || undefined,
      skills: skillsRaw ? skillsRaw.split(',').map((s) => s.trim()).filter(Boolean) : [],
    });

    if (window.CURRENT_USER) window.CURRENT_USER.role = 'MASTER';
    showToast("Tabriklaymiz! Siz endi usta sifatida ro'yxatdan o'tdingiz");
    App.state.history = ['screen-profile'];
    App.navigate('screen-profile', { addToHistory: false });
    await renderProfile();
  } catch (err) {
    showToast(err.message || "Ro'yxatdan o'tishda xatolik yuz berdi");
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = "Ro'yxatdan o'tish"; }
  }
}
