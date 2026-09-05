const API = window.location.port === "8080" ? "" : "http://127.0.0.1:8080";
const APP_VERSION = "0.3.0";
let token = "";
const picked = [];

async function req(method, path, body) {
  const res = await fetch(API + path, {
    method,
    headers: {
      "content-type": "application/json",
      ...(token ? { authorization: "Bearer " + token } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "REQUEST_FAILED");
  return data;
}

function show(id) {
  document.querySelectorAll(".page").forEach((p) => p.classList.add("hidden"));
  document.getElementById(id).classList.remove("hidden");
}

async function loginAndTrip() {
  const box = document.getElementById("homeOut");
  try {
    try { await req("POST", "/auth/register", { email: email.value, password: password.value }); } catch (_) {}
    const session = await req("POST", "/auth/login", { email: email.value, password: password.value });
    token = session.token;
    const trip = await req("POST", "/trips", {
      title: "سفر آزمایشی",
      stops: [{ name: "تهران", lat: 35.7, lng: 51.4 }, { name: "اصفهان", lat: 32.6, lng: 51.7 }],
    });
    box.textContent = "وارد شدید. سفر: " + trip.title;
    await loadMe();
  } catch (e) {
    box.textContent = "API را اول اجرا کنید. " + e.message;
  }
}

async function loadMe() {
  const box = document.getElementById("currentPlan");
  if (!box) return;
  try {
    const me = await req("GET", "/auth/me");
    box.textContent = "نسخه فعال: " + (me.pack?.nameFa || me.edition);
  } catch (_) {
    box.textContent = "نسخه فعال: وارد نشده";
  }
}

async function loadPlans() {
  const box = document.getElementById("planGrid");
  if (!box) return;
  try {
    const rows = await fetch(API + "/editions").then((r) => r.json());
    box.innerHTML = rows.map((e) => `<article class="plan"><h3>${e.nameFa}</h3><p>${e.tagline}</p><div>${e.priceMonthlyUsd === 0 ? "رایگان" : e.priceMonthlyUsd + " $"}</div><div>${Number(e.priceMonthlyIrr).toLocaleString("fa-IR")} ریال</div><button class="primary" onclick="selectEdition('${e.id}')">فعال‌سازی</button><button onclick="orderEdition('${e.id}','IRR','monthly')">سفارش ریال</button></article>`).join("");
  } catch (_) {
    box.textContent = "API را روشن کنید";
  }
}

async function selectEdition(id) {
  try {
    const data = await req("POST", "/editions/select", { edition: id });
    document.getElementById("homeOut").textContent = "نسخه فعال: " + data.edition;
    await loadMe();
  } catch (e) {
    document.getElementById("homeOut").textContent = e.message;
  }
}

async function orderEdition(id, currency, cycle) {
  try {
    const order = await req("POST", "/billing/orders", { edition: id, currency, cycle });
    document.getElementById("homeOut").textContent = "سفارش " + order.status + " — " + order.amount + " " + order.currency;
    await loadOrders();
  } catch (e) {
    document.getElementById("homeOut").textContent = e.message;
  }
}

async function loadOrders() {
  const box = document.getElementById("orderList");
  if (!box) return;
  try {
    const rows = await req("GET", "/billing/orders");
    box.innerHTML = (rows || []).map((o) => `<article class="item"><b>${o.edition}</b><span>${o.amount} ${o.currency} • ${o.status}</span></article>`).join("") || "<p>سفارشی نیست</p>";
  } catch (_) {
    box.textContent = "ابتدا وارد شوید";
  }
}

async function loadHealth() {
  const box = document.getElementById("healthOut");
  try {
    box.textContent = JSON.stringify(await fetch(API + "/health").then((r) => r.json()), null, 2);
  } catch (_) {
    box.textContent = "API قطع است";
  }
}

async function sendSos() {
  const box = document.getElementById("sosOut");
  try {
    await req("POST", "/emergency/contacts", { id: "home", name: "خانه", phone: "110" });
    const data = await req("POST", "/emergency/sos", { coords: { lat: 35.7, lng: 51.4 }, offline: true });
    box.textContent = "SOS: " + data.event.id;
  } catch (e) {
    box.textContent = e.message;
  }
}

async function suggestPro() {
  const box = document.getElementById("aiOut");
  try {
    const data = await req("POST", "/ai/suggest", { query: "ایران" });
    box.textContent = data.title + " — " + data.note;
  } catch (e) {
    box.textContent = e.message;
  }
}

async function searchDest() {
  const box = document.getElementById("places");
  try {
    const rows = await fetch(API + "/destinations?q=" + encodeURIComponent((document.getElementById("q") || {}).value || "اصفهان")).then((r) => r.json());
    box.innerHTML = rows.map((p) => `<article class="item"><b>${p.name}</b><span>${p.city}</span></article>`).join("");
  } catch (_) {
    box.textContent = "API قطع است";
  }
}

async function checkAppUpdate() {
  const box = document.getElementById("updateBanner");
  if (!box) return;
  try {
    const data = await fetch(API + "/update/check?platform=web&current=" + APP_VERSION).then((r) => r.json());
    box.textContent = data.updateAvailable ? "نسخه " + data.latest + " آماده است" : "نسخه " + APP_VERSION + " به‌روز است";
  } catch (_) {
    box.textContent = "بررسی آپدیت ممکن نیست";
  }
}

async function loadTrips() {
  const box = document.getElementById("tripList");
  if (!box) return;
  try {
    const rows = await req("GET", "/trips");
    box.innerHTML = (rows || []).map((t) => `<article class="item"><b>${t.title}</b></article>`).join("") || "<p>سفری نیست</p>";
  } catch (_) {
    box.textContent = "وارد شوید";
  }
}

async function checkSpeed() {
  const box = document.getElementById("speedOut");
  try {
    const data = await req("POST", "/safety/speed", { currentSpeedKmh: 120, speedLimitKmh: 100, limitConfidence: "high", weatherRisk: "none" });
    box.textContent = data.level + " — " + data.message;
  } catch (e) {
    box.textContent = e.message;
  }
}

checkAppUpdate();
