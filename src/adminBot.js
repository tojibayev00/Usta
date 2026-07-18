/**
 * ============================================================
 * Admin Bot — Telegram orqali ustalarni boshqarish
 * ------------------------------------------------------------
 * Bu oddiy foydalanuvchilar ko'rmaydigan, faqat ADMIN_TELEGRAM_ID
 * da ko'rsatilgan Telegram ID'dan kelgan xabarlarga javob
 * beradigan bot. Xuddi shu TELEGRAM_BOT_TOKEN ishlatiladi —
 * bitta bot ham Web App tugmasini ko'rsatadi, ham admin
 * buyruqlarini qabul qiladi.
 *
 * Buyruqlar:
 *   /addmaster   — yangi usta qo'shish (bosqichma-bosqich so'rov)
 *   /listmasters — barcha ustalar ro'yxati (ID bilan)
 *   /deletemaster <id> — ustani o'chirish
 *   /verify <id> — ustani "tasdiqlangan" qilish
 *   /cancel      — joriy amalni bekor qilish
 *   /help        — buyruqlar ro'yxati
 * ============================================================
 */

const TelegramBot = require('node-telegram-bot-api');
const config = require('../config/env');
const categoryRepository = require('../repositories/categoryRepository');
const masterRepository = require('../repositories/masterRepository');

// Har bir admin chat uchun joriy "wizard" holatini xotirada saqlaymiz.
// Bitta admin uchun bu yetarli; agar kelajakda bir nechta admin bo'lsa,
// bu Redis kabi tashqi xotiraga ko'chirilishi kerak.
const wizardState = new Map();

const ADD_MASTER_STEPS = [
  { key: 'categoryId', prompt: null }, // maxsus: inline keyboard orqali so'raladi
  { key: 'telegramId', prompt: "Ustaning Telegram ID raqamini yuboring (masalan 123456789).\n\nEslatma: bu — ustaning shaxsiy Telegram akkaunt ID'si. Agar bilmasangiz, @userinfobot orqali aniqlashi mumkin, yoki hozircha 9 xonali ixtiyoriy raqam kiriting." },
  { key: 'firstName', prompt: "Ustaning ismini yuboring:" },
  { key: 'lastName', prompt: "Familiyasini yuboring (bo'lmasa /skip yozing):" },
  { key: 'experienceYrs', prompt: "Tajribasi necha yil? (faqat raqam, masalan 5):" },
  { key: 'basePrice', prompt: "Xizmat narxi so'mda (faqat raqam, masalan 80000):" },
  { key: 'bio', prompt: "Qisqacha ma'lumot/bio yuboring (bo'lmasa /skip):" },
  { key: 'photo', prompt: "Rasm URL manzilini yuboring (bo'lmasa /skip):" },
  { key: 'skills', prompt: "Ko'nikmalarni vergul bilan ajratib yuboring (masalan: Quvur ta'mirlash, Isitish tizimi). Bo'lmasa /skip:" },
];

function isAdmin(telegramId) {
  return config.telegram.adminId && String(telegramId) === String(config.telegram.adminId);
}

function startAdminBot() {
  if (!config.telegram.adminId) {
    // eslint-disable-next-line no-console
    console.warn('[AdminBot] ADMIN_TELEGRAM_ID berilmagan — admin bot buyruqlari ishlamaydi.');
    return null;
  }

  const bot = new TelegramBot(config.telegram.botToken, { polling: true });

  bot.on('polling_error', (err) => {
    // eslint-disable-next-line no-console
    console.error('[AdminBot] Polling xatosi:', err.message);
  });

  bot.onText(/\/start|\/help/, (msg) => {
    if (!isAdmin(msg.from.id)) return;
    bot.sendMessage(msg.chat.id, [
      "UstaTop Admin Bot",
      '',
      '/addmaster — yangi usta qo\'shish',
      '/listmasters — ustalar ro\'yxati',
      '/deletemaster <id> — ustani o\'chirish',
      '/verify <id> — ustani tasdiqlash',
      '/cancel — joriy amalni bekor qilish',
    ].join('\n'));
  });

  bot.onText(/\/cancel/, (msg) => {
    if (!isAdmin(msg.from.id)) return;
    wizardState.delete(msg.chat.id);
    bot.sendMessage(msg.chat.id, 'Bekor qilindi.');
  });

  bot.onText(/\/addmaster/, async (msg) => {
    if (!isAdmin(msg.from.id)) return;
    const categories = await categoryRepository.findAll();
    if (categories.length === 0) {
      return bot.sendMessage(msg.chat.id, "Bazada kategoriya topilmadi. Avval seed ishga tushirilganini tekshiring.");
    }

    wizardState.set(msg.chat.id, { step: 0, data: {} });

    bot.sendMessage(msg.chat.id, "Yangi usta qo'shish. Avval kategoriyani tanlang:", {
      reply_markup: {
        inline_keyboard: categories.map((c) => [{ text: c.name, callback_data: `cat:${c.id}` }]),
      },
    });
  });

  bot.on('callback_query', async (query) => {
    if (!isAdmin(query.from.id)) return;
    const chatId = query.message.chat.id;
    const state = wizardState.get(chatId);
    if (!state) return;

    if (query.data.startsWith('cat:')) {
      state.data.categoryId = query.data.slice(4);
      state.step = 1;
      wizardState.set(chatId, state);
      bot.answerCallbackQuery(query.id);
      bot.sendMessage(chatId, ADD_MASTER_STEPS[1].prompt);
    }
  });

  bot.onText(/\/listmasters/, async (msg) => {
    if (!isAdmin(msg.from.id)) return;
    const masters = await masterRepository.findAllForAdmin();
    if (masters.length === 0) {
      return bot.sendMessage(msg.chat.id, "Hozircha ustalar yo'q.");
    }
    const lines = masters.map((m) =>
      `#${m.id.slice(0, 8)} — ${m.user.firstName} ${m.user.lastName || ''} | ${m.category.name} | ${m.basePrice} so'm | ${m.isOnline ? 'onlayn' : 'offlayn'}${m.isVerified ? ' ✅' : ''}`
    );
    bot.sendMessage(msg.chat.id, lines.join('\n'));
  });

  bot.onText(/\/deletemaster (.+)/, async (msg, match) => {
    if (!isAdmin(msg.from.id)) return;
    const idPrefix = match[1].trim();
    try {
      const masters = await masterRepository.findAllForAdmin();
      const target = masters.find((m) => m.id.startsWith(idPrefix));
      if (!target) return bot.sendMessage(msg.chat.id, "Bunday ID'li usta topilmadi.");
      await masterRepository.delete(target.id);
      bot.sendMessage(msg.chat.id, `O'chirildi: ${target.user.firstName}`);
    } catch (err) {
      bot.sendMessage(msg.chat.id, "Xato: " + err.message);
    }
  });

  bot.onText(/\/verify (.+)/, async (msg, match) => {
    if (!isAdmin(msg.from.id)) return;
    const idPrefix = match[1].trim();
    try {
      const masters = await masterRepository.findAllForAdmin();
      const target = masters.find((m) => m.id.startsWith(idPrefix));
      if (!target) return bot.sendMessage(msg.chat.id, "Bunday ID'li usta topilmadi.");
      await masterRepository.setVerified(target.id, true);
      bot.sendMessage(msg.chat.id, `Tasdiqlandi: ${target.user.firstName}`);
    } catch (err) {
      bot.sendMessage(msg.chat.id, "Xato: " + err.message);
    }
  });

  // Wizard bosqichlarini boshqaruvchi umumiy xabar tinglovchisi.
  // Faqat admin chatida va faol wizard bo'lsa ishlaydi; buyruqlar
  // (/ bilan boshlanuvchi) bu yerda e'tiborga olinmaydi.
  bot.on('message', async (msg) => {
    if (!isAdmin(msg.from.id)) return;
    if (!msg.text || msg.text.startsWith('/')) return;

    const state = wizardState.get(msg.chat.id);
    if (!state || state.step === 0) return; // 0-qadam inline keyboard orqali, matn kutmaydi

    const currentField = ADD_MASTER_STEPS[state.step];
    const value = msg.text.trim();

    if (value !== '/skip') {
      state.data[currentField.key] = value;
    }

    state.step += 1;

    if (state.step >= ADD_MASTER_STEPS.length) {
      // Wizard tugadi — ustani yaratamiz
      wizardState.delete(msg.chat.id);
      try {
        const d = state.data;
        const master = await masterRepository.createWithUser({
          telegramId: d.telegramId,
          firstName: d.firstName,
          lastName: d.lastName,
          categoryId: d.categoryId,
          bio: d.bio,
          photo: d.photo,
          experienceYrs: parseInt(d.experienceYrs, 10) || 0,
          basePrice: parseInt(d.basePrice, 10) || 0,
          skills: d.skills ? d.skills.split(',').map((s) => s.trim()).filter(Boolean) : [],
        });
        bot.sendMessage(msg.chat.id, `✅ Usta qo'shildi: ${d.firstName} (ID: ${master.id.slice(0, 8)})`);
      } catch (err) {
        bot.sendMessage(msg.chat.id, "❌ Xato yuz berdi: " + err.message);
      }
      return;
    }

    const nextField = ADD_MASTER_STEPS[state.step];
    wizardState.set(msg.chat.id, state);
    bot.sendMessage(msg.chat.id, nextField.prompt);
  });

  // eslint-disable-next-line no-console
  console.log('[AdminBot] Ishga tushdi, admin buyruqlarini tinglamoqda.');
  return bot;
}

module.exports = { startAdminBot };
