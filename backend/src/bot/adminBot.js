/**
 * ============================================================
 * UstaTop Bot — umumiy foydalanuvchilar + admin buyruqlari
 * ------------------------------------------------------------
 * Bitta bot ikkita rolda ishlaydi:
 *  1) Oddiy foydalanuvchi uchun: /start bosilganda qisqa
 *     qo'llanma va Web App'ni ochish tugmasi ko'rsatiladi.
 *  2) Faqat ADMIN_TELEGRAM_ID'dan kelgan xabarlar uchun:
 *     ustalarni boshqarish va xabar tarqatish buyruqlari.
 *
 * Admin buyruqlari:
 *   /addmaster           — yangi usta qo'shish (bosqichma-bosqich so'rov)
 *   /listmasters         — barcha ustalar ro'yxati (ID bilan)
 *   /editmaster <id>      — mavjud ustaning bitta maydonini tahrirlash
 *   /deletemaster <id>    — ustani o'chirish
 *   /verify <id>          — ustani "tasdiqlangan" qilish
 *   /toggleonline <id>    — ustaning onlayn/offlayn holatini almashtirish
 *   /broadcast            — barcha foydalanuvchilarga xabar yuborish
 *   /cancel               — joriy amalni bekor qilish
 * ============================================================
 */

const TelegramBot = require('node-telegram-bot-api');
const config = require('../config/env');
const categoryRepository = require('../repositories/categoryRepository');
const masterRepository = require('../repositories/masterRepository');
const userRepository = require('../repositories/userRepository');

// Har bir chat uchun joriy "wizard" holatini xotirada saqlaymiz.
const wizardState = new Map();

const ADD_MASTER_STEPS = [
  { key: 'categoryId', prompt: null }, // maxsus: inline keyboard orqali so'raladi
  { key: 'telegramId', prompt: "Ustaning Telegram ID raqamini yuboring (masalan 123456789).\n\nEslatma: @userinfobot orqali aniqlashi mumkin, yoki hozircha ixtiyoriy 9 xonali raqam kiriting." },
  { key: 'firstName', prompt: "Ustaning ismini yuboring:" },
  { key: 'lastName', prompt: "Familiyasini yuboring (bo'lmasa /skip yozing):" },
  { key: 'experienceYrs', prompt: "Tajribasi necha yil? (faqat raqam, masalan 5):" },
  { key: 'basePrice', prompt: "Taxminiy narxi so'mda (bo'lmasa /skip, narx keyin kelishiladi):" },
  { key: 'region', prompt: "Viloyatini yuboring (masalan: Toshkent shahri):" },
  { key: 'district', prompt: "Tumanini yuboring (masalan: Chilonzor tumani):" },
  { key: 'village', prompt: "Qishlog'i/mahallasini yuboring (bo'lmasa /skip):" },
  { key: 'bio', prompt: "Qisqacha ma'lumot/bio yuboring (bo'lmasa /skip):" },
  { key: 'photo', prompt: "Rasm URL manzilini yuboring (bo'lmasa /skip):" },
  { key: 'skills', prompt: "Ko'nikmalarni vergul bilan ajratib yuboring (masalan: Quvur ta'mirlash, Isitish tizimi). Bo'lmasa /skip:" },
];

const EDITABLE_FIELDS = [
  { key: 'firstName', label: 'Ism' },
  { key: 'lastName', label: 'Familiya' },
  { key: 'basePrice', label: 'Narx' },
  { key: 'experienceYrs', label: 'Tajriba (yil)' },
  { key: 'region', label: 'Viloyat' },
  { key: 'district', label: 'Tuman' },
  { key: 'village', label: 'Qishloq/mahalla' },
  { key: 'bio', label: 'Bio' },
  { key: 'photo', label: 'Rasm URL' },
];

function isAdmin(telegramId) {
  return config.telegram.adminId && String(telegramId) === String(config.telegram.adminId);
}

/** Qisqartirilgan ID (8 belgi) orqali to'liq usta yozuvini topadi */
async function findMasterByShortId(idPrefix) {
  const masters = await masterRepository.findAllForAdmin();
  return masters.find((m) => m.id.startsWith(idPrefix));
}

function customerStartKeyboard() {
  const rows = [];
  if (config.frontendUrl) {
    rows.push([{ text: "📱 Ilovani ochish", web_app: { url: config.frontendUrl } }]);
  }
  if (config.telegram.adminContactUsername) {
    rows.push([{ text: "🆘 Yordam kerak", url: `https://t.me/${config.telegram.adminContactUsername}` }]);
  }
  return rows.length ? { reply_markup: { inline_keyboard: rows } } : {};
}

function startAdminBot() {
  if (!config.telegram.botToken) return null;

  const bot = new TelegramBot(config.telegram.botToken, { polling: true });

  bot.on('polling_error', (err) => {
    // eslint-disable-next-line no-console
    console.error('[Bot] Polling xatosi:', err.message);
  });

  // ------------------------------------------------------------
  // /start — HAMMA uchun (admin uchun boshqacha, oddiy uchun boshqacha)
  // ------------------------------------------------------------
  bot.onText(/^\/start$/, (msg) => {
    if (isAdmin(msg.from.id)) {
      return bot.sendMessage(msg.chat.id, adminHelpText());
    }

    const guide = [
      "🔧 <b>UstaTop</b>ga xush kelibsiz!",
      '',
      "Bu bot orqali yaqin atrofingizdagi santexnik, elektrik, konditsioner ustasi va boshqa mutaxassislarni topishingiz mumkin.",
      '',
      "👉 Boshlash uchun pastdagi <b>\"Ilovani ochish\"</b> tugmasini bosing.",
      "👉 O'zingiz usta bo'lsangiz, ilova ichida \"Usta sifatida ro'yxatdan o'tish\"ni tanlang.",
      "👉 Savol yoki muammo bo'lsa — \"Yordam kerak\" tugmasi orqali biz bilan bog'laning.",
    ].join('\n');

    bot.sendMessage(msg.chat.id, guide, { parse_mode: 'HTML', ...customerStartKeyboard() });
  });

  bot.onText(/^\/help$/, (msg) => {
    if (isAdmin(msg.from.id)) return bot.sendMessage(msg.chat.id, adminHelpText());
    bot.sendMessage(msg.chat.id, "Yordam kerakmi? Pastdagi tugma orqali murojaat qiling.", customerStartKeyboard());
  });

  bot.onText(/^\/cancel$/, (msg) => {
    if (!isAdmin(msg.from.id)) return;
    wizardState.delete(msg.chat.id);
    bot.sendMessage(msg.chat.id, 'Bekor qilindi.');
  });

  // ------------------------------------------------------------
  // /addmaster — yangi usta qo'shish wizard'i
  // ------------------------------------------------------------
  bot.onText(/^\/addmaster$/, async (msg) => {
    if (!isAdmin(msg.from.id)) return;
    const categories = await categoryRepository.findAll();
    if (categories.length === 0) {
      return bot.sendMessage(msg.chat.id, 'Bazada kategoriya topilmadi. Avval seed ishga tushirilganini tekshiring.');
    }

    wizardState.set(msg.chat.id, { mode: 'add', step: 0, data: {} });

    bot.sendMessage(msg.chat.id, "Yangi usta qo'shish. Avval kategoriyani tanlang:", {
      reply_markup: {
        inline_keyboard: categories.map((c) => [{ text: c.name, callback_data: `cat:${c.id}` }]),
      },
    });
  });

  // ------------------------------------------------------------
  // /listmasters — ro'yxat
  // ------------------------------------------------------------
  bot.onText(/^\/listmasters$/, async (msg) => {
    if (!isAdmin(msg.from.id)) return;
    const masters = await masterRepository.findAllForAdmin();
    if (masters.length === 0) {
      return bot.sendMessage(msg.chat.id, "Hozircha ustalar yo'q.");
    }
    const lines = masters.map((m) => {
      const loc = [m.region, m.district, m.village].filter(Boolean).join(', ') || "manzil yo'q";
      const price = m.basePrice ? `${m.basePrice} so'm` : 'narx kelishiladi';
      return `#${m.id.slice(0, 8)} — ${m.user.firstName} ${m.user.lastName || ''} | ${m.category.name} | ${price} | ${loc} | ${m.isOnline ? 'onlayn' : 'offlayn'}${m.isVerified ? ' ✅' : ''}`;
    });
    bot.sendMessage(msg.chat.id, lines.join('\n\n'));
  });

  // ------------------------------------------------------------
  // /deletemaster <id>
  // ------------------------------------------------------------
  bot.onText(/^\/deletemaster (.+)$/, async (msg, match) => {
    if (!isAdmin(msg.from.id)) return;
    try {
      const target = await findMasterByShortId(match[1].trim());
      if (!target) return bot.sendMessage(msg.chat.id, "Bunday ID'li usta topilmadi.");
      await masterRepository.delete(target.id);
      bot.sendMessage(msg.chat.id, `O'chirildi: ${target.user.firstName}`);
    } catch (err) {
      bot.sendMessage(msg.chat.id, 'Xato: ' + err.message);
    }
  });

  // ------------------------------------------------------------
  // /verify <id>
  // ------------------------------------------------------------
  bot.onText(/^\/verify (.+)$/, async (msg, match) => {
    if (!isAdmin(msg.from.id)) return;
    try {
      const target = await findMasterByShortId(match[1].trim());
      if (!target) return bot.sendMessage(msg.chat.id, "Bunday ID'li usta topilmadi.");
      await masterRepository.setVerified(target.id, true);
      bot.sendMessage(msg.chat.id, `Tasdiqlandi: ${target.user.firstName}`);
    } catch (err) {
      bot.sendMessage(msg.chat.id, 'Xato: ' + err.message);
    }
  });

  // ------------------------------------------------------------
  // /toggleonline <id>
  // ------------------------------------------------------------
  bot.onText(/^\/toggleonline (.+)$/, async (msg, match) => {
    if (!isAdmin(msg.from.id)) return;
    try {
      const target = await findMasterByShortId(match[1].trim());
      if (!target) return bot.sendMessage(msg.chat.id, "Bunday ID'li usta topilmadi.");
      const updated = await masterRepository.setOnlineStatus(target.id, !target.isOnline);
      bot.sendMessage(msg.chat.id, `${target.user.firstName} endi: ${updated.isOnline ? 'onlayn' : 'offlayn'}`);
    } catch (err) {
      bot.sendMessage(msg.chat.id, 'Xato: ' + err.message);
    }
  });

  // ------------------------------------------------------------
  // /editmaster <id> — tahrirlash wizard'i
  // ------------------------------------------------------------
  bot.onText(/^\/editmaster (.+)$/, async (msg, match) => {
    if (!isAdmin(msg.from.id)) return;
    const target = await findMasterByShortId(match[1].trim());
    if (!target) return bot.sendMessage(msg.chat.id, "Bunday ID'li usta topilmadi. /listmasters orqali ID'ni tekshiring.");

    wizardState.set(msg.chat.id, { mode: 'edit_select_field', masterId: target.id, data: {} });

    bot.sendMessage(msg.chat.id, `${target.user.firstName} — qaysi maydonni tahrirlaymiz?`, {
      reply_markup: {
        inline_keyboard: EDITABLE_FIELDS.map((f) => [{ text: f.label, callback_data: `editfield:${f.key}` }]),
      },
    });
  });

  // ------------------------------------------------------------
  // /broadcast — barcha foydalanuvchilarga xabar yuborish
  // ------------------------------------------------------------
  bot.onText(/^\/broadcast$/, (msg) => {
    if (!isAdmin(msg.from.id)) return;
    wizardState.set(msg.chat.id, { mode: 'broadcast_await_content' });
    bot.sendMessage(msg.chat.id, [
      "Yubormoqchi bo'lgan xabaringizni yuboring — matn, rasm (izoh bilan) yoki havolali matn bo'lishi mumkin.",
      "Bekor qilish uchun /cancel yozing.",
    ].join('\n'));
  });

  // ------------------------------------------------------------
  // Inline keyboard bosilganda (kategoriya tanlash yoki tahrirlash maydoni)
  // ------------------------------------------------------------
  bot.on('callback_query', async (query) => {
    if (!isAdmin(query.from.id)) return;
    const chatId = query.message.chat.id;
    const state = wizardState.get(chatId);
    if (!state) return;

    if (query.data.startsWith('cat:') && state.mode === 'add') {
      state.data.categoryId = query.data.slice(4);
      state.step = 1;
      wizardState.set(chatId, state);
      bot.answerCallbackQuery(query.id);
      bot.sendMessage(chatId, ADD_MASTER_STEPS[1].prompt);
      return;
    }

    if (query.data.startsWith('editfield:') && state.mode === 'edit_select_field') {
      const field = query.data.slice('editfield:'.length);
      state.mode = 'edit_await_value';
      state.field = field;
      wizardState.set(chatId, state);
      bot.answerCallbackQuery(query.id);
      const fieldLabel = EDITABLE_FIELDS.find((f) => f.key === field)?.label || field;
      bot.sendMessage(chatId, `Yangi qiymatni yuboring — ${fieldLabel}:`);
    }
  });

  // ------------------------------------------------------------
  // Barcha xabarlar — wizard bosqichlarini boshqaradi (faqat admin uchun,
  // chunki wizardState faqat admin buyruqlari orqali to'ldiriladi).
  // ------------------------------------------------------------
  bot.on('message', async (msg) => {
    if (!isAdmin(msg.from.id)) return;

    const state = wizardState.get(msg.chat.id);
    if (!state) return;

    // --- Xabar tarqatish: kontent kutilmoqda ---
    if (state.mode === 'broadcast_await_content') {
      wizardState.delete(msg.chat.id);
      await runBroadcast(bot, msg);
      return;
    }

    if (!msg.text || msg.text.startsWith('/')) return;

    // --- Tahrirlash oqimi: yangi qiymat kutilmoqda ---
    if (state.mode === 'edit_await_value') {
      wizardState.delete(msg.chat.id);
      try {
        const updated = await masterRepository.updateField(state.masterId, state.field, msg.text.trim());
        bot.sendMessage(msg.chat.id, `✅ Yangilandi: ${updated.user.firstName} — ${state.field} o'zgartirildi.`);
      } catch (err) {
        bot.sendMessage(msg.chat.id, '❌ Xato: ' + err.message);
      }
      return;
    }

    // --- Qo'shish oqimi: bosqichma-bosqich so'rov ---
    if (state.mode === 'add') {
      if (state.step === 0) return; // 0-qadam inline keyboard orqali, matn kutmaydi

      const currentField = ADD_MASTER_STEPS[state.step];
      const value = msg.text.trim();

      if (value !== '/skip') {
        state.data[currentField.key] = value;
      }

      state.step += 1;

      if (state.step >= ADD_MASTER_STEPS.length) {
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
            basePrice: d.basePrice ? parseInt(d.basePrice, 10) : null,
            region: d.region,
            district: d.district,
            village: d.village,
            skills: d.skills ? d.skills.split(',').map((s) => s.trim()).filter(Boolean) : [],
          });
          bot.sendMessage(msg.chat.id, `✅ Usta qo'shildi: ${d.firstName} (ID: ${master.id.slice(0, 8)})`);
        } catch (err) {
          bot.sendMessage(msg.chat.id, '❌ Xato yuz berdi: ' + err.message);
        }
        return;
      }

      const nextField = ADD_MASTER_STEPS[state.step];
      wizardState.set(msg.chat.id, state);
      bot.sendMessage(msg.chat.id, nextField.prompt);
    }
  });

  // eslint-disable-next-line no-console
  console.log('[Bot] Ishga tushdi (umumiy /start + admin buyruqlari).');
  return bot;
}

function adminHelpText() {
  return [
    'UstaTop Admin Bot',
    '',
    "/addmaster — yangi usta qo'shish",
    "/listmasters — ustalar ro'yxati",
    '/editmaster <id> — ustani tahrirlash',
    "/deletemaster <id> — ustani o'chirish",
    '/toggleonline <id> — onlayn/offlayn almashtirish',
    '/verify <id> — ustani tasdiqlash',
    '/broadcast — barcha foydalanuvchilarga xabar yuborish',
    '/cancel — joriy amalni bekor qilish',
    '',
    "ID'larni /listmasters orqali ko'rish mumkin (# belgisidan keyingi qism).",
  ].join('\n');
}

/**
 * Admin yuborgan xabarni (matn/rasm) barcha ro'yxatdan o'tgan
 * foydalanuvchilarga tarqatadi. Telegram tezlik cheklovidan
 * (rate limit) chetlanish uchun xabarlar orasida kichik pauza qo'yiladi.
 */
async function runBroadcast(bot, adminMsg) {
  const users = await userRepository.listAllTelegramIds();
  await bot.sendMessage(adminMsg.chat.id, `Tarqatish boshlandi: ${users.length} ta foydalanuvchi...`);

  let success = 0;
  let failed = 0;

  for (const user of users) {
    const chatId = user.telegramId.toString();
    try {
      if (adminMsg.photo) {
        const fileId = adminMsg.photo[adminMsg.photo.length - 1].file_id;
        await bot.sendPhoto(chatId, fileId, { caption: adminMsg.caption || '' });
      } else if (adminMsg.text) {
        await bot.sendMessage(chatId, adminMsg.text);
      }
      success += 1;
    } catch {
      failed += 1; // Foydalanuvchi botni bloklagan yoki boshqa xato — o'tkazib yuboramiz
    }
    // Telegram'ning ~30 xabar/soniya cheklovidan chetlanish uchun kichik pauza
    await new Promise((resolve) => setTimeout(resolve, 40));
  }

  bot.sendMessage(adminMsg.chat.id, `Tarqatish yakunlandi.\n✅ Yuborildi: ${success}\n❌ Muvaffaqiyatsiz: ${failed}`);
}

module.exports = { startAdminBot };
