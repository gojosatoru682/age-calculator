const birthDateInput = document.getElementById("birthDate");
const timeZoneSelect = document.getElementById("timeZone");
const ageForm = document.getElementById("ageForm");
const errorMessage = document.getElementById("errorMessage");

const ageYearsEl = document.getElementById("ageYears");
const ageMonthsEl = document.getElementById("ageMonths");
const ageDaysEl = document.getElementById("ageDays");
const ageWeeksEl = document.getElementById("ageWeeks");
const ageHoursEl = document.getElementById("ageHours");
const ageMinutesEl = document.getElementById("ageMinutes");
const ageSecondsEl = document.getElementById("ageSeconds");
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

const ageTimelineEl = document.getElementById("ageTimeline");
const worldCupsCountEl = document.getElementById("worldCupsCount");
const leapYearsCountEl = document.getElementById("leapYearsCount");

const shareCardTextEl = document.getElementById("shareCardText");
const copyLinkBtn = document.getElementById("copyLinkBtn");
const shareWhatsAppBtn = document.getElementById("shareWhatsAppBtn");
const shareTwitterBtn = document.getElementById("shareTwitterBtn");

const compareDate1Input = document.getElementById("compareDate1");
const compareDate2Input = document.getElementById("compareDate2");
const compareBtn = document.getElementById("compareBtn");
const compareResultOlderEl = document.getElementById("compareResultOlder");
const compareResultDifferenceEl = document.getElementById(
  "compareResultDifference"
);

const ageMercuryEl = document.getElementById("ageMercury");
const ageVenusEl = document.getElementById("ageVenus");
const ageMarsPlanetsEl = document.getElementById("ageMarsPlanets");
const ageJupiterEl = document.getElementById("ageJupiter");
const ageSaturnEl = document.getElementById("ageSaturn");

const celebrityMatchesEl = document.getElementById("celebrityMatches");

const birthdayMessageEl = document.getElementById("birthdayMessage");
const generateWishBtn = document.getElementById("generateWishBtn");

const themeToggle = document.getElementById("themeToggle");
const installPwaBtn = document.getElementById("installPwaBtn");

let countdownTimer = null;
let ageTickerTimer = null;
let deferredPrompt = null;
let lastAgeResult = null;
let currentShareUrl = null;

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

const WORLD_CUP_YEARS = [
  1930, 1934, 1938,
  // 1942, 1946 skipped due to World War II
  1950, 1954, 1958, 1962, 1966, 1970, 1974, 1978, 1982, 1986, 1990, 1994, 1998,
  2002, 2006, 2010, 2014, 2018, 2022,
];

function countWorldCupsSinceBirth(birthYear, currentYear) {
  return WORLD_CUP_YEARS.filter(
    (year) => year >= birthYear && year <= currentYear
  ).length;
}

function isLeapYear(year) {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

function countLeapYearsSinceBirth(birthYear, currentYear) {
  let count = 0;
  for (let year = birthYear; year <= currentYear; year++) {
    if (isLeapYear(year)) count++;
  }
  return count;
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

function startAgeTicker(birthDate, timeZone) {
  if (ageTickerTimer) clearInterval(ageTickerTimer);

  function tick() {
    try {
      const now = getNow(timeZone);
      const age = calculateAge(birthDate, timeZone);
      const diffMs = now - birthDate;

      const totalSeconds = Math.floor(diffMs / 1000);
      const totalMinutes = Math.floor(totalSeconds / 60);
      const totalHours = Math.floor(diffMs / (1000 * 60 * 60));
      const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const totalWeeks = Math.floor(totalDays / 7);

      if (ageYearsEl) ageYearsEl.textContent = formatNumber(age.years);
      if (ageMonthsEl)
        ageMonthsEl.textContent = formatNumber(age.years * 12 + age.months);
      if (ageWeeksEl) ageWeeksEl.textContent = formatNumber(totalWeeks);
      if (ageDaysEl) ageDaysEl.textContent = formatNumber(totalDays);
      if (ageHoursEl) ageHoursEl.textContent = formatNumber(totalHours);
      if (ageMinutesEl) ageMinutesEl.textContent = formatNumber(totalMinutes);
      if (ageSecondsEl)
        ageSecondsEl.textContent = formatNumber(totalSeconds);
    } catch {
      clearInterval(ageTickerTimer);
      ageTickerTimer = null;
    }
  }

  tick();
  ageTickerTimer = setInterval(tick, 1000);
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

function updateTimelineAndStats(birthDate, timeZone, result) {
  if (!ageTimelineEl || !worldCupsCountEl || !leapYearsCountEl) return;

  const now = getNow(timeZone);
  const birthYear = birthDate.getUTCFullYear();
  const milestones = [
    { age: 0, label: "Birth" },
    { age: 1, label: "First birthday" },
    { age: 5, label: "School age (approx.)" },
    { age: 18, label: "Adulthood (18)" },
    { age: 60, label: "Retirement (60)" },
  ];

  const items = milestones.map((m) => {
    const date = new Date(
      Date.UTC(
        birthYear + m.age,
        birthDate.getUTCMonth(),
        birthDate.getUTCDate()
      )
    );
    const formattedDate = date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
    const status = date <= now ? "Passed" : "Upcoming";
    return `<li class="timeline-item">
      <span class="timeline-age">${m.age}</span>
      <span class="timeline-label">${m.label}</span>
      <span class="timeline-date">${formattedDate}</span>
      <span class="timeline-status ${
        status === "Passed" ? "past" : "future"
      }">${status}</span>
    </li>`;
  });

  ageTimelineEl.innerHTML = items.join("");

  const currentYear = now.getUTCFullYear();
  const worldCups = countWorldCupsSinceBirth(birthYear, currentYear);
  const leapYears = countLeapYearsSinceBirth(birthYear, currentYear);

  worldCupsCountEl.textContent = worldCups.toString();
  leapYearsCountEl.textContent = leapYears.toString();
}

function updateShareCard(birthDate, result) {
  if (!shareCardTextEl) return;

  const shareText = `I am ${result.years} years, ${result.months} months, ${result.days} days old. See yours at myageflow.netlify.app`;
  shareCardTextEl.textContent = shareText;

  const dobValue = birthDateInput.value;
  const baseUrl = "https://myageflow.netlify.app";
  currentShareUrl = dobValue ? `${baseUrl}?dob=${dobValue}` : baseUrl;

  shareCardTextEl.dataset.shareText = shareText;
}

function updatePlanetAges(result) {
  if (!ageMercuryEl) return;

  const earthYears = result.totalDays / 365.25;
  const planets = {
    mercury: earthYears / 0.2408467,
    venus: earthYears / 0.61519726,
    mars: earthYears / 1.8808158,
    jupiter: earthYears / 11.862615,
    saturn: earthYears / 29.447498,
  };

  ageMercuryEl.textContent = planets.mercury.toFixed(2);
  ageVenusEl.textContent = planets.venus.toFixed(2);
  ageMarsPlanetsEl.textContent = planets.mars.toFixed(2);
  ageJupiterEl.textContent = planets.jupiter.toFixed(2);
  ageSaturnEl.textContent = planets.saturn.toFixed(2);
}

const CELEBRITY_BIRTHDAYS = [
  { name: "Albert Einstein", month: 3, day: 14 },
  { name: "Oprah Winfrey", month: 1, day: 29 },
  { name: "Elon Musk", month: 6, day: 28 },
  { name: "Bill Gates", month: 10, day: 28 },
  { name: "Taylor Swift", month: 12, day: 13 },
  { name: "Lionel Messi", month: 6, day: 24 },
  { name: "Cristiano Ronaldo", month: 2, day: 5 },
  { name: "Ariana Grande", month: 6, day: 26 },
  { name: "Barack Obama", month: 8, day: 4 },
  { name: "Steve Jobs", month: 2, day: 24 },
  { name: "Mahatma Gandhi", month: 10, day: 2 },
  { name: "Nelson Mandela", month: 7, day: 18 },
];

function updateCelebrityMatches(birthDate) {
  if (!celebrityMatchesEl) return;

  const month = birthDate.getUTCMonth() + 1;
  const day = birthDate.getUTCDate();

  const matches = CELEBRITY_BIRTHDAYS.filter(
    (c) => c.month === month && c.day === day
  );

  if (!matches.length) {
    celebrityMatchesEl.textContent =
      "We don't have a celebrity match for this date yet, but your story is just as unique!";
    return;
  }

  const items = matches.map((c) => `<li>${c.name}</li>`).join("");

  celebrityMatchesEl.innerHTML = `<p>You share your birthday with:</p><ul>${items}</ul>`;
}

function displayResults(result, birthDate, timeZone) {
  lastAgeResult = result;

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
  startAgeTicker(birthDate, timeZone);
  updateTimelineAndStats(birthDate, timeZone, result);
  updateShareCard(birthDate, result);
  updatePlanetAges(result);
  updateCelebrityMatches(birthDate);
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

function getShareTextAndUrl() {
  const baseUrl = "https://myageflow.netlify.app";
  const shareText =
    (shareCardTextEl && shareCardTextEl.dataset.shareText) ||
    "Check your age breakdown and life stats.";
  const url = currentShareUrl || baseUrl;
  return { shareText, url };
}

if (copyLinkBtn) {
  copyLinkBtn.addEventListener("click", async () => {
    const { url } = getShareTextAndUrl();
    try {
      await navigator.clipboard.writeText(url);
      const original = copyLinkBtn.textContent;
      copyLinkBtn.textContent = "Copied!";
      setTimeout(() => {
        copyLinkBtn.textContent = original;
      }, 1500);
    } catch {
      alert(`Link: ${url}`);
    }
  });
}

if (shareWhatsAppBtn) {
  shareWhatsAppBtn.addEventListener("click", () => {
    const { shareText, url } = getShareTextAndUrl();
    const full = `${shareText} ${url}`;
    const encoded = encodeURIComponent(full);
    window.open(`https://wa.me/?text=${encoded}`, "_blank");
  });
}

if (shareTwitterBtn) {
  shareTwitterBtn.addEventListener("click", () => {
    const { shareText, url } = getShareTextAndUrl();
    const encodedText = encodeURIComponent(shareText);
    const encodedUrl = encodeURIComponent(url);
    window.open(
      `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
      "_blank"
    );
  });
}

if (compareBtn) {
  compareBtn.addEventListener("click", () => {
    const v1 = compareDate1Input.value;
    const v2 = compareDate2Input.value;

    if (!v1 || !v2) {
      compareResultOlderEl.textContent = "Please select both birthdays.";
      compareResultDifferenceEl.textContent = "";
      return;
    }

    const [y1, m1, d1] = v1.split("-").map(Number);
    const [y2, m2, d2] = v2.split("-").map(Number);

    const date1 = new Date(Date.UTC(y1, m1 - 1, d1));
    const date2 = new Date(Date.UTC(y2, m2 - 1, d2));

    const msDiff = date1 - date2;
    const daysDiff = Math.abs(msDiff) / (1000 * 60 * 60 * 24);

    let olderMessage = "";
    if (msDiff === 0) {
      olderMessage = "Both people share the exact same birthday.";
    } else if (msDiff < 0) {
      olderMessage = "Person 1 is older.";
    } else {
      olderMessage = "Person 2 is older.";
    }

    compareResultOlderEl.textContent = olderMessage;
    compareResultDifferenceEl.textContent = `Age difference: ${formatNumber(
      Math.floor(daysDiff)
    )} days`;
  });
}

function generateBirthdayWish() {
  if (!lastAgeResult) {
    return "Calculate your age first so we can tailor a wish for you.";
  }

  const years = lastAgeResult.years;
  const templates = [
    (y) =>
      `Here’s to ${y} years of growth, memories, and stories—may your next chapter be your boldest yet. Happy birthday!`,
    (y) =>
      `You’ve completed ${y} full orbits around the Sun—wishing you a new year filled with joy, health, and quiet little miracles.`,
    (y) =>
      `At ${y} years young, you’re just getting started. May your days ahead be brighter, kinder, and even more meaningful.`,
    (y) =>
      `From your very first breath to now, ${y} years later, you’ve already come so far. Celebrate today like the gift it truly is.`,
  ];

  const random = templates[Math.floor(Math.random() * templates.length)];
  return random(years);
}

if (generateWishBtn) {
  generateWishBtn.addEventListener("click", () => {
    const message = generateBirthdayWish();
    birthdayMessageEl.textContent = message;
  });
}

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

