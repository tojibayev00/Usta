/**
 * ============================================================
 * USTATOP — App State & Router
 * ------------------------------------------------------------
 * Oddiy client-side "router": screen elementlar orasida
 * .active klassini almashtirish orqali navigatsiya qiladi.
 * Backend integratsiyasida bu joy o'zgarmaydi — faqat
 * data.js dagi funksiyalar fetch() chaqiruvlariga aylanadi.
 * ============================================================
 */

const App = {
  // Joriy oqim uchun tanlangan qiymatlar (buyurtma davomida saqlanadi)
  state: {
    history: ['screen-splash'],     // orqaga qaytish uchun stack
    selectedCategory: null,
    selectedMaster: null,
    selectedDate: null,
    selectedTime: null,
    address: "Chilonzor tumani, 12-uy",
    masterListFilter: 'all',
  },

  /** Sahifaga o'tish. addToHistory=false bo'lsa stack'ga qo'shilmaydi (masalan tabbar) */
  navigate(screenId, { addToHistory = true } = {}) {
    const current = document.querySelector('.screen.active');
    const next = document.getElementById(screenId);
    if (!next || current === next) return;

    if (current) {
      current.classList.remove('active');
    }
    next.classList.add('active');

    if (addToHistory) {
      this.state.history.push(screenId);
    }

    updateTabbarState(screenId);
    const content = next.querySelector('.screen-content');
    if (content) content.scrollTop = 0;
  },

  back() {
    if (this.state.history.length <= 1) return;
    this.state.history.pop();
    const prev = this.state.history[this.state.history.length - 1];
    this.navigate(prev, { addToHistory: false });
  },
};

/** Tabbar bir nechta asosiy sahifada ko'rinadi: shularni bir-biriga bog'laymiz */
const TAB_SCREENS = {
  'screen-home': 'tab-home',
  'screen-categories': 'tab-categories',
  'screen-history': 'tab-history',
  'screen-profile': 'tab-profile',
};

function updateTabbarState(screenId) {
  const tabId = TAB_SCREENS[screenId];
  document.querySelectorAll('.tab-item').forEach((el) => {
    el.classList.toggle('active', el.id === tabId);
  });
  document.querySelectorAll('.tabbar').forEach((bar) => {
    bar.style.display = tabId ? 'flex' : 'none';
  });
}

// Narxni formatlash: 80000 -> "80 000 so'm"
function formatSum(n) {
  return n.toLocaleString('ru-RU').replace(/,/g, ' ') + " so'm";
}

document.addEventListener('DOMContentLoaded', () => {
  updateTabbarState('screen-splash');
});
