const birthDateInput = document.getElementById("birthDate");
const timeZoneSelect = document.getElementById("timeZone");
const ageForm = document.getElementById("ageForm");
const errorMessage = document.getElementById("errorMessage");

const ageYearsEl = document.getElementById("ageYears");
const ageMonthsEl = document.getElementById("ageMonths");
const ageDaysEl = document.getElementById("ageDays");
const zodiacSignEl = document.getElementById("zodiacSign");

const totalDaysEl = document.getElementById("totalDays");
const totalHoursEl = document.getElementById("totalHours");
const ageMarsEl = document.getElementById("ageMars");

const nextBirthdayDateEl = document.getElementById("nextBirthdayDate");
const nextBirthdayCountdownEl =
  document.getElementById("nextBirthdayCountdown");
const nextBirthdayAgeEl = document.getElementById("nextBirthdayAge");

const daysUntil100El = document.getElementById("daysUntil100");
const lifeProgressLabelEl = document.getElementById("lifeProgressLabel");
const lifeProgressBarEl = document.getElementById("lifeProgressBar");

const themeToggle = document.getElementById("themeToggle");
const installPwaBtn = document.getElementById("installPwaBtn");

let countdownTimer = null;
let deferredPrompt = null;

// Set max attribute so users can't pick a future date
birthDateInput.max = new Date().toISOString().slice(0, 10);

function formatNumber(n) {
  return n.toLocaleString(undefined, { maximumFractionDigits: 0 });
}

function getNow(timeZone) {
  if (!timeZone) return new Date();
  try {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
    const parts = formatter.formatToParts(now);
    const obj = Object.fromEntries(parts.map((p) => [p.type, p.value]));
    return new Date(
      `${obj.year}-${obj.month}-${obj.day}T${obj.hour}:${obj.minute}:${obj.second}Z`
    );
  } catch {
    return new Date();
  }
}

function calculateZodiac(month, day) {
  const zodiac = [
    { sign: "Capricorn", from: [12, 22], to: [1, 19] },
    { sign: "Aquarius", from: [1, 20], to: [2, 18] },
    { sign: "Pisces", from: [2, 19], to: [3, 20] },
    { sign: "Aries", from: [3, 21], to: [4, 19] },
    { sign: "Taurus", from: [4, 20], to: [5, 20] },
    { sign: "Gemini", from: [5, 21], to: [6, 20] },
    { sign: "Cancer", from: [6, 21], to: [7, 22] },
    { sign: "Leo", from: [7, 23], to: [8, 22] },
    { sign: "Virgo", from: [8, 23], to: [9, 22] },
    { sign: "Libra", from: [9, 23], to: [10, 22] },
    { sign: "Scorpio", from: [10, 23], to: [11, 21] },
    { sign: "Sagittarius", from: [11, 22], to: [12, 21] },
  ];

  for (const z of zodiac) {
    const [fm, fd] = z.from;
    const [tm, td] = z.to;
    if (
      (month === fm && day >= fd) ||
      (month === tm && day <= td) ||
      (fm > tm && (month >= fm || month <= tm))
    ) {
      return z.sign;
    }
  }
  return "–";
}

function updateCountdowns(birthDate, timeZone) {
  if (countdownTimer) clearInterval(countdownTimer);

  function tick() {
    const now = getNow(timeZone);
    const thisYear = now.getUTCFullYear();
    let nextBirthday = new Date(Date.UTC(thisYear, birthDate.getUTCMonth(), birthDate.getUTCDate()));
    if (nextBirthday <= now) {
      nextBirthday = new Date(
        Date.UTC(thisYear + 1, birthDate.getUTCMonth(), birthDate.getUTCDate())
      );
    }

    const diffMs = nextBirthday - now;
    if (diffMs <= 0) {
      nextBirthdayCountdownEl.textContent = "Happy birthday! 🎉";
      return;
    }

    const totalSeconds = Math.floor(diffMs / 1000);
    const days = Math.floor(totalSeconds / (24 * 3600));
    const hours = Math.floor((totalSeconds % (24 * 3600)) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    nextBirthdayCountdownEl.textContent = `${days}d ${hours}h ${minutes}m ${seconds}s`;
  }

  tick();
  countdownTimer = setInterval(tick, 1000);
}

function calculateAge(birthDate, timeZone) {
  const now = getNow(timeZone);
  if (birthDate > now) {
    throw new Error("Birth date must be in the past.");
  }

  const birth = birthDate;

  // Years, months, days breakdown
  let years = now.getUTCFullYear() - birth.getUTCFullYear();
  let months = now.getUTCMonth() - birth.getUTCMonth();
  let days = now.getUTCDate() - birth.getUTCDate();

  if (days < 0) {
    const prevMonthDate = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 0)
    );
    days += prevMonthDate.getUTCDate();
    months -= 1;
  }

  if (months < 0) {
    months += 12;
    years -= 1;
  }

  // Totals in days/hours
  const diffMs = now - birth;
  const totalDays = diffMs / (1000 * 60 * 60 * 24);
  const totalHours = totalDays * 24;

  // Next birthday
  let nextBirthday = new Date(
    Date.UTC(now.getUTCFullYear(), birth.getUTCMonth(), birth.getUTCDate())
  );
  if (nextBirthday <= now) {
    nextBirthday = new Date(
      Date.UTC(now.getUTCFullYear() + 1, birth.getUTCMonth(), birth.getUTCDate())
    );
  }
  const nextAge = years + 1;

  // 100th birthday and days until 100 years
  const hundredthBirthday = new Date(
    Date.UTC(birth.getUTCFullYear() + 100, birth.getUTCMonth(), birth.getUTCDate())
  );
  const msUntil100 = hundredthBirthday - now;
  const daysUntil100 =
    msUntil100 > 0 ? Math.floor(msUntil100 / (1000 * 60 * 60 * 24)) : 0;

  // Life progress as percentage of 100 years (approx using 365.25)
  const totalDaysFor100Years = 100 * 365.25;
  const progressPercent = Math.max(
    0,
    Math.min(100, (totalDays / totalDaysFor100Years) * 100)
  );

  // Age on Mars (Martian year ~ 686.98 Earth days)
  const marsYears = totalDays / 686.98;

  // Zodiac sign based on birth date
  const zodiac = calculateZodiac(
    birth.getUTCMonth() + 1,
    birth.getUTCDate()
  );

  return {
    years,
    months,
    days,
    totalDays,
    totalHours,
    nextBirthday,
    nextAge,
    zodiac,
    daysUntil100,
    progressPercent,
    marsYears,
  };
}

function displayResults(result, birthDate, timeZone) {
  ageYearsEl.textContent = formatNumber(result.years);
  ageMonthsEl.textContent = formatNumber(result.years * 12 + result.months);
  ageDaysEl.textContent = formatNumber(Math.floor(result.totalDays));
  zodiacSignEl.textContent = result.zodiac;

  totalDaysEl.textContent = formatNumber(Math.floor(result.totalDays));
  totalHoursEl.textContent = formatNumber(Math.floor(result.totalHours));
  ageMarsEl.textContent = result.marsYears.toFixed(2);

  const nextBirthdayLocal = new Date(result.nextBirthday.getTime());
  nextBirthdayDateEl.textContent = nextBirthdayLocal.toLocaleDateString(
    undefined,
    { year: "numeric", month: "long", day: "numeric" }
  );
  nextBirthdayAgeEl.textContent = `${result.nextAge} years old`;

  daysUntil100El.textContent =
    result.daysUntil100 > 0
      ? `${formatNumber(result.daysUntil100)} days`
      : "You are 100+ years old 🎉";

  lifeProgressLabelEl.textContent = `${result.progressPercent.toFixed(1)}%`;
  lifeProgressBarEl.style.width = `${result.progressPercent}%`;

  updateCountdowns(birthDate, timeZone);
}

ageForm.addEventListener("submit", (e) => {
  e.preventDefault();
  errorMessage.textContent = "";

  const birthDateValue = birthDateInput.value;
  if (!birthDateValue) {
    errorMessage.textContent = "Please select your birth date.";
    return;
  }

  const [year, month, day] = birthDateValue.split("-").map(Number);
  const birthDate = new Date(Date.UTC(year, month - 1, day));
  const timeZone = timeZoneSelect.value || null;

  try {
    const result = calculateAge(birthDate, timeZone);
    displayResults(result, birthDate, timeZone);
  } catch (err) {
    console.error(err);
    errorMessage.textContent = err.message || "Something went wrong.";
  }
});

// Theme handling
const THEME_KEY = "age-calculator-theme";

function applyTheme(theme) {
  if (theme === "light") {
    document.body.classList.add("light");
    themeToggle.textContent = "☀️";
  } else {
    document.body.classList.remove("light");
    themeToggle.textContent = "🌙";
  }
}

function initTheme() {
  const stored = localStorage.getItem(THEME_KEY);
  if (stored === "light" || stored === "dark") {
    applyTheme(stored);
  } else {
    const prefersLight = window.matchMedia(
      "(prefers-color-scheme: light)"
    ).matches;
    applyTheme(prefersLight ? "light" : "dark");
  }
}

themeToggle.addEventListener("click", () => {
  const isLight = document.body.classList.contains("light");
  const next = isLight ? "dark" : "light";
  localStorage.setItem(THEME_KEY, next);
  applyTheme(next);
});

initTheme();

// PWA install handling
window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  deferredPrompt = event;
  installPwaBtn.classList.remove("hidden");
});

installPwaBtn.addEventListener("click", async () => {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  if (outcome === "accepted") {
    installPwaBtn.classList.add("hidden");
  }
  deferredPrompt = null;
});

// Register service worker
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("sw.js")
      .catch((err) => console.error("SW registration failed", err));
  });
}

