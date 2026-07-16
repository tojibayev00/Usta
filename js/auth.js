/**
 * ============================================================
 * USTATOP — Auth Flow (Login / OTP) & App Init
 * ------------------------------------------------------------
 * Backend tayyor bo'lganda:
 *   - requestOtp() -> POST /api/auth/request-otp { phone }
 *   - verifyOtp()  -> POST /api/auth/verify-otp { phone, code } -> JWT token
 * Hozircha frontend-only demo: har qanday 4 xonali kod qabul qilinadi.
 * ============================================================
 */

let otpDigits = ['', '', '', ''];

function formatPhoneInput(el) {
  let digits = el.value.replace(/\D/g, '').slice(0, 9);
  let formatted = digits;
  if (digits.length > 2) formatted = digits.slice(0, 2) + ' ' + digits.slice(2);
  if (digits.length > 5) formatted = digits.slice(0, 2) + ' ' + digits.slice(2, 5) + ' ' + digits.slice(5);
  if (digits.length > 7) formatted = digits.slice(0, 2) + ' ' + digits.slice(2, 5) + ' ' + digits.slice(5, 7) + ' ' + digits.slice(7);
  el.value = formatted;

  const btn = document.getElementById('login-continue-btn');
  btn.disabled = digits.length !== 9;
}

/** "Davom etish" bosilganda — SMS kod so'raladi (demo: to'g'ridan-to'g'ri OTP ekraniga o'tadi) */
function requestOtp() {
  const phone = document.getElementById('login-phone-input').value;
  document.getElementById('otp-phone-display').textContent = '+998 ' + phone;
  otpDigits = ['', '', '', ''];
  renderOtpBoxes();
  App.navigate('screen-otp');
  setTimeout(() => document.getElementById('otp-hidden-input').focus(), 400);
}

function renderOtpBoxes() {
  const boxes = document.querySelectorAll('.otp-box');
  boxes.forEach((b, i) => {
    b.textContent = otpDigits[i] || '';
    b.classList.toggle('filled', !!otpDigits[i]);
  });
  document.getElementById('otp-verify-btn').disabled = otpDigits.join('').length !== 4;
}

/** Yashirin input orqali OTP kiritish (mobil klaviatura uchun qulay) */
function handleOtpInput(el) {
  const digits = el.value.replace(/\D/g, '').slice(0, 4).split('');
  otpDigits = ['', '', '', ''];
  digits.forEach((d, i) => (otpDigits[i] = d));
  renderOtpBoxes();
}

/** Kodni tasdiqlash — backend integratsiyasida shu yerda JWT olinadi va saqlanadi */
function verifyOtp() {
  showToast('Tasdiqlanmoqda...');
  setTimeout(() => {
    App.state.history = ['screen-home'];
    App.navigate('screen-home', { addToHistory: false });
    initHomeAndTabs();
  }, 500);
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

function initHomeAndTabs() {
  renderHomeCategories();
  renderTopMasters();
  renderCategoriesScreen();
}

// ---------------------------------------------------------------
// App boshlanishi: splash -> login (2.2s dan keyin avtomatik)
// ---------------------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
  // Splash progress-bar animatsiyasi tugagach login sahifasiga o'tish
  setTimeout(() => {
    App.state.history = ['screen-login'];
    App.navigate('screen-login', { addToHistory: false });
  }, 2200);
});
