/**
 * ============================================================
 * USTATOP — Sharh qoldirish (Reviews)
 * ------------------------------------------------------------
 * Faqat yakunlangan (COMPLETED) buyurtmaga sharh qoldirish
 * mumkin. Backend buni majburiy tekshiradi (orderService),
 * bu yerda faqat UI mantiq.
 * ============================================================
 */

let _reviewSelectedRating = 0;
let _reviewTargetOrderId = null;

/** Sharh sheet'ini ochish. orderId — qaysi buyurtmaga sharh yozilayotgani */
function openReviewSheet(orderId) {
  _reviewTargetOrderId = orderId;
  _reviewSelectedRating = 0;
  document.getElementById('review-text-input').value = '';
  renderReviewStars();
  showSheet('review-sheet');
}

function renderReviewStars() {
  const wrap = document.getElementById('review-star-picker');
  wrap.innerHTML = Array.from({ length: 5 }).map((_, i) => {
    const filled = i < _reviewSelectedRating;
    return `
      <button onclick="selectReviewStar(${i + 1})" style="background:none; border:none; padding:4px;">
        <svg viewBox="0 0 24 24" width="34" height="34" fill="${filled ? 'var(--color-star)' : 'none'}" stroke="var(--color-star)" stroke-width="1.6">
          <path d="M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z"/>
        </svg>
      </button>
    `;
  }).join('');
}

function selectReviewStar(n) {
  _reviewSelectedRating = n;
  renderReviewStars();
}

async function submitReview() {
  if (!_reviewSelectedRating) {
    showToast('Baho tanlang (kamida 1 yulduz)');
    return;
  }

  const text = document.getElementById('review-text-input').value.trim();
  const btn = event?.target;
  if (btn) { btn.disabled = true; btn.textContent = 'Yuborilmoqda...'; }

  try {
    await Api.orders.review(_reviewTargetOrderId, _reviewSelectedRating, text || undefined);
    hideSheet('review-sheet');
    showToast('Rahmat! Sharhingiz yuborildi');
    // Agar tarix sahifasida bo'lsak, ro'yxatni yangilaymiz
    if (document.getElementById('screen-history').classList.contains('active')) {
      renderHistory();
    }
  } catch (err) {
    showToast(err.message || "Sharh yuborib bo'lmadi");
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = 'Yuborish'; }
  }
}
