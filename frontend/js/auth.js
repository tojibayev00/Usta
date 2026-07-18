/**
 * ============================================================
 * USTATOP — Auth Flow (Telegram Web App orqali)
 * ------------------------------------------------------------
 * Bu ilova FAQAT Telegram Web App ichida ishlaydi. Login uchun
 * alohida forma yo'q — Telegram foydalanuvchini avtomatik
 * autentifikatsiya qiladi (window.Telegram.WebApp.initData).
 *
 * Oqim:
 *  1) Splash ko'rsatiladi
 *  2) initData backendga yuboriladi -> POST /api/auth/telegram
 *  3) Backend JWT qaytaradi -> localStorage'ga saqlanadi
 *  4) Bosh sahifaga o'tiladi
 *
 * Agar ilova brauzerda (Telegram tashqarisida) ochilsa,
 * initData bo'sh bo'ladi va tushunarli xato ko'rsatiladi.
 * ============================================================
 */

/**
 * Backend bilan Telegram orqali autentifikatsiyadan o'tish.
 * Muvaffaqiyatli bo'lsa token saqlanadi va CURRENT_USER to'ldiriladi.
 */
async function authenticateWithTelegram() {
  const tg = window.Telegram && window.Telegram.WebApp;
  const initData = tg ? tg.initData : '';

  if (!initData) {
    // Telegram tashqarisida ochilgan — real autentifikatsiya mumkin emas.
    showAuthError(
      "Bu ilova faqat Telegram ichida ishlaydi. Iltimos, botni Telegram orqali oching."
    );
    return false;
  }

  try {
    const { token, user } = await Api.auth.loginWithTelegram(initData);
    Api.setToken(token);
    window.CURRENT_USER = user;
    return true;
  } catch (err) {
    console.error('Telegram auth xatosi:', err);
    showAuthError(err.message || 'Autentifikatsiya muvaffaqiyatsiz tugadi. Qayta urinib ko\'ring.');
    return false;
  }
}

function showAuthError(message) {
  const splash = document.getElementById('screen-splash');
  splash.innerHTML = `
    <div class="fade-in" style="text-align:center; padding: 0 32px; position:relative; z-index:1;">
      <div style="width:64px;height:64px;border-radius:20px;background:rgba(255,255,255,0.16);display:flex;align-items:center;justify-content:center;margin:0 auto 18px;">
        <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16h.01"/></svg>
      </div>
      <div style="font-weight:700; font-size:17px; margin-bottom:8px;">Kirish imkonsiz</div>
      <div style="font-size:14px; opacity:0.9; line-height:1.5;">${message}</div>
      <button class="btn btn-secondary" style="margin-top:24px; background:rgba(255,255,255,0.16); color:#fff;" onclick="location.reload()">Qayta urinish</button>
    </div>
  `;
}

// ---------------------------------------------------------------
// Tabbar navigatsiyasi (asosiy 4 sahifa)
// ---------------------------------------------------------------

function goToTab(screenId) {
  App.state.history = [screenId];
  App.navigate(screenId, { addToHistory: false });
  if (screenId === 'screen-history') renderHistory();
  if (screenId === 'screen-profile') renderProfile();
  if (screenId === 'screen-categories') renderCategoriesScreen();
}

async function initHomeAndTabs() {
  await Promise.all([renderHomeCategories(), renderTopMasters()]);
  await renderCategoriesScreen();
}

// ---------------------------------------------------------------
// App boshlanishi: splash -> Telegram auth -> bosh sahifa
// ---------------------------------------------------------------

document.addEventListener('DOMContentLoaded', async () => {
  // Splash progress-bar animatsiyasi kamida ko'rinishi uchun minimal kutish
  const minSplashDelay = new Promise((resolve) => setTimeout(resolve, 1400));

  const [authOk] = await Promise.all([authenticateWithTelegram(), minSplashDelay]);

  if (!authOk) return; // Xato ekrani allaqachon ko'rsatildi

  try {
    await initHomeAndTabs();
    await renderProfile();
  } catch (err) {
    console.error('Boshlang\'ich ma\'lumotlarni yuklashda xato:', err);
    showToast('Ma\'lumotlarni yuklashda xatolik yuz berdi');
  }

  App.state.history = ['screen-home'];
  App.navigate('screen-home', { addToHistory: false });
});
