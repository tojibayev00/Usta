/**
 * ============================================================
 * USTATOP — API Client
 * ------------------------------------------------------------
 * Backend bilan bog'lanadigan yagona qatlam. Boshqa fayllar
 * to'g'ridan-to'g'ri fetch() chaqirmaydi — shu yerdagi
 * funksiyalardan foydalanadi. Shunday qilinsa:
 *  - JWT token har bir so'rovga avtomatik qo'shiladi,
 *  - xato formatlari bir joyda boshqariladi,
 *  - backend manzili o'zgarsa, faqat API_BASE_URL yangilanadi.
 * ============================================================
 */

// Backend manzili. Lokal ishlab chiqishda 4000-port, production'da
// Railway'dagi haqiqiy backend domeni ishlatiladi.
const API_BASE_URL = (() => {
  const isLocal = ['localhost', '127.0.0.1'].includes(window.location.hostname);
  return isLocal ? 'http://localhost:4000/api' : 'https://usta-production.up.railway.app/api';
})();

const TOKEN_STORAGE_KEY = 'ustatop_token';

const Api = {
  // --- Token boshqaruvi -----------------------------------------
  getToken() {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  },
  setToken(token) {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
  },
  clearToken() {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  },

  /**
   * Markazlashtirilgan so'rov yuboruvchi. Barcha metodlar (get/post/patch/delete)
   * shu funksiyani chaqiradi.
   */
  async request(path, { method = 'GET', body, auth = true } = {}) {
    const headers = { 'Content-Type': 'application/json' };

    if (auth) {
      const token = Api.getToken();
      if (token) headers.Authorization = `Bearer ${token}`;
    }

    let response;
    try {
      response = await fetch(`${API_BASE_URL}${path}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });
    } catch (networkErr) {
      // Server umuman javob bermadi (offline, CORS, DNS va h.k.)
      throw new ApiError('Serverga ulanib bo\'lmadi. Internetni tekshiring.', 0, 'NETWORK_ERROR');
    }

    // 204 No Content holatida body bo'lmaydi
    if (response.status === 204) return null;

    let json;
    try {
      json = await response.json();
    } catch {
      throw new ApiError('Server javobini o\'qib bo\'lmadi', response.status, 'PARSE_ERROR');
    }

    if (!response.ok || json.success === false) {
      throw new ApiError(json.message || 'Xatolik yuz berdi', response.status, json.code);
    }
    if (json.pagination) {
      return { items: json.data, pagination: json.pagination };
    }

    return json.data;
  },

  get(path, opts) {

    return json.data;
  },

  get(path, opts) {
    return Api.request(path, { ...opts, method: 'GET' });
  },
  post(path, body, opts) {
    return Api.request(path, { ...opts, method: 'POST', body });
  },
  patch(path, body, opts) {
    return Api.request(path, { ...opts, method: 'PATCH', body });
  },
  delete(path, opts) {
    return Api.request(path, { ...opts, method: 'DELETE' });
  },

  // ================================================================
  // Domenga xos chaqiruvlar
  // ================================================================

  auth: {
    /** Telegram Web App initData orqali login/registratsiya */
    loginWithTelegram(initData) {
      return Api.post('/auth/telegram', { initData }, { auth: false });
    },
    me() {
      return Api.get('/auth/me');
    },
    updateMe(payload) {
      return Api.patch('/auth/me', payload);
    },
  },

  categories: {
    list() {
      return Api.get('/categories', { auth: false });
    },
  },

  masters: {
    /** @param {{categoryId?, categorySlug?, sort?, onlineOnly?, lat?, lng?, page?, pageSize?}} params */
    list(params = {}) {
      const qs = new URLSearchParams(
        Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '')
      ).toString();
      return Api.get(`/masters${qs ? `?${qs}` : ''}`, { auth: false });
    },
    getById(id) {
      return Api.get(`/masters/${id}`, { auth: false });
    },
    setOnlineStatus(isOnline) {
      return Api.patch('/masters/me/online', { isOnline });
    },
  },

  orders: {
    create(payload) {
      return Api.post('/orders', payload);
    },
    getById(id) {
      return Api.get(`/orders/${id}`);
    },
    listMine(params = {}) {
      const qs = new URLSearchParams(params).toString();
      return Api.get(`/orders/mine${qs ? `?${qs}` : ''}`);
    },
    updateStatus(id, status, note) {
      return Api.patch(`/orders/${id}/status`, { status, note });
    },
    review(orderId, rating, text) {
      return Api.post(`/orders/${orderId}/review`, { rating, text });
    },
  },

  addresses: {
    list() {
      return Api.get('/addresses');
    },
    create(payload) {
      return Api.post('/addresses', payload);
    },
    remove(id) {
      return Api.delete(`/addresses/${id}`);
    },
  },
};

/** Backenddan kelgan xatolarni aniq ajratish uchun maxsus Error klassi */
class ApiError extends Error {
  constructor(message, status, code) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

window.Api = Api;
window.ApiError = ApiError;
