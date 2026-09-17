// TARGET CYBER ARENA // GAME LOGIC
// ==========================================================
// I18N MULTILINGUAL SYSTEM (UZ / RU / EN)
// ==========================================================
let currentLang = 'uz';
try { currentLang = localStorage.getItem('arena-lang') || 'uz'; } catch (e) {}

function setArenaLang(l) {
  if (['uz', 'ru', 'en'].indexOf(l) === -1) l = 'uz';
  currentLang = l;
  document.documentElement.lang = l;
  try { localStorage.setItem('arena-lang', l); } catch (e) {}

  document.querySelectorAll('.btn-lang').forEach(b => {
    b.classList.toggle('is-active', b.id === 'btn-' + l);
  });

  // In-place text update with fallback
  document.querySelectorAll('[data-ru], [data-en], [data-uz]').forEach(el => {
    if (!el.dataset.uz) el.dataset.uz = el.innerHTML;
    const val = (l === 'uz') ? el.dataset.uz : el.getAttribute('data-' + l);
    el.innerHTML = (val !== null && val !== undefined && val !== '') ? val : el.dataset.uz;
  });

  updateUI();
}

// Ensure language initializes when DOM loads
document.addEventListener('DOMContentLoaded', () => {
  setArenaLang(currentLang);
});

// GAME VARIABLES
let energyScore = 0;
let itemsCount = 0;
let clickBonus; // BUG 5: undefined variable leads to NaN!

const energyCounter = document.getElementById("energy-counter");
const itemsCounter = document.getElementById("items-counter");
const mineBtn = document.getElementById("mine-btn");
const themeBtn = document.getElementById("theme-btn");

// ==========================================================
// BUG 6 (Event & ID Mismatch):
// HTML has id="sound-btn", but JS tries to select "audio-toggle".
// This throws "Uncaught TypeError: Cannot read properties of null"
// in DevTools Console, preventing sound setup!
// Fix: change "audio-toggle" to "sound-btn".
// ==========================================================
const soundBtn = document.getElementById("audio-toggle");
soundBtn.addEventListener("click", () => {
  playCyberBeep();
  const msg = {
    uz: "Kiber-ovoz effektlari faollashtirildi! 🔊",
    ru: "Кибер-звуковые эффекты активированы! 🔊",
    en: "Cyber audio FX activated! 🔊"
  };
  alert(msg[currentLang] || msg.uz);
});

// Sound synthesizer using Web Audio API (no external files needed!)
function playCyberBeep() {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5 note
    osc.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.15);
  } catch (e) {
    console.log("Audio not supported");
  }
}

// ==========================================================
// BUG 5 (Math / Logic Flaw):
// Using undefined clickBonus causes energyScore to become NaN!
// Fix: energyScore += 10;
// ==========================================================
mineBtn.addEventListener("click", () => {
  energyScore = energyScore + clickBonus + 10; // BUG: undefined variable produces NaN!
  updateUI();
  playCyberBeep();
});

// ==========================================================
// BUG 7 (Store Economy Bug):
// Buying an item ADDS to your energy instead of subtracting!
// Fix: energyScore = energyScore - price;
// ==========================================================
function buyItem(itemName, price) {
  if (energyScore >= price) {
    energyScore = energyScore + price; // BUG: Should be energyScore - price!
    itemsCount++;
    updateUI();
    playCyberBeep();
    const successMsg = {
      uz: "Tabriklaymiz! " + itemName + " xarid qilindi!",
      ru: "Поздравляем! " + itemName + " успешно приобретён!",
      en: "Congratulations! " + itemName + " purchased!"
    };
    alert(successMsg[currentLang] || successMsg.uz);
  } else {
    const failMsg = {
      uz: "Energiya yetarli emas! Sizda " + energyScore + " EP bor, narxi esa " + price + " EP.",
      ru: "Недостаточно энергии! У вас " + energyScore + " EP, а цена " + price + " EP.",
      en: "Not enough energy! You have " + energyScore + " EP, price is " + price + " EP."
    };
    alert(failMsg[currentLang] || failMsg.uz);
  }
}

// UI UPDATE FUNCTION
function updateUI() {
  if (energyCounter) energyCounter.textContent = energyScore + " EP";
  if (itemsCounter) {
    const suffix = { uz: " ta", ru: " шт.", en: " items" };
    itemsCounter.textContent = itemsCount + (suffix[currentLang] || suffix.uz);
  }
}

// THEME TOGGLE
themeBtn.addEventListener("click", () => {
  document.body.classList.toggle("dark-theme");
  const isDark = document.body.classList.contains("dark-theme");
  const themeLabels = {
    uz: isDark ? "☀️ Yorug'" : "🌙 Rejim",
    ru: isDark ? "☀️ Светлая" : "🌙 Тема",
    en: isDark ? "☀️ Light" : "🌙 Theme"
  };
  themeBtn.textContent = themeLabels[currentLang] || themeLabels.uz;
});

// INITIALIZE
updateUI();
