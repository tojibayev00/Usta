/**
 * ============================================================
 * App — Express ilova konfiguratsiyasi
 * ------------------------------------------------------------
 * server.js bu faylni import qilib, faqat listen() chaqiradi.
 * Test yozishda ham shu faylni (http server ochmasdan) alohida
 * import qilish mumkin.
 * ============================================================
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const config = require('./config/env');
const apiRoutes = require('./routes');
const { errorHandler, notFoundHandler } = require('./middlewares/errorHandler');

const app = express();

// Railway (va boshqa ko'p hosting platformalari) so'rovlarni proxy orqali
// yuboradi va X-Forwarded-For headerini qo'shadi. Buni Express'ga aytib
// qo'ymasak, express-rate-limit "ERR_ERL_UNEXPECTED_X_FORWARDED_FOR"
// xatosini tashlab, so'rovlarni muvaffaqiyatsiz qiladi.
app.set('trust proxy', 1);

// --- Xavfsizlik headerlari ---
app.use(helmet());

// --- CORS: faqat ruxsat etilgan domenlar (yoki CORS_ORIGIN=* bo'lsa — hammasi) ---
const allowAllOrigins = config.cors.origins.includes('*');

app.use(
  cors({
    origin(origin, callback) {
      // Server-to-server yoki curl kabi Origin headersiz so'rovlarga ruxsat beramiz
      if (!origin || allowAllOrigins || config.cors.origins.length === 0 || config.cors.origins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error('CORS: bu domenga ruxsat berilmagan'));
    },
    credentials: true,
  })
);

// --- Body parser ---
app.use(express.json({ limit: '1mb' }));

// --- Loglash (faqat development'da batafsil) ---
if (config.env === 'development') {
  app.use(morgan('dev'));
}

// --- Rate limiting: brute-force va suiiste'moldan himoya ---
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 daqiqa
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Juda ko\'p so\'rov yuborildi, keyinroq urinib ko\'ring', code: 'RATE_LIMITED' },
});
app.use('/api', apiLimiter);

// --- Health check (Docker/monitoring uchun) ---
app.get('/health', (req, res) => {
  res.status(200).json({ success: true, status: 'ok', timestamp: new Date().toISOString() });
});

// --- Asosiy API yo'llari ---
app.use('/api', apiRoutes);

// --- 404 va markazlashtirilgan xato ushlagichi ---
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
