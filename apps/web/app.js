const API = "http://127.0.0.1:8080";
let token = "";

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
    try {
      await req("POST", "/auth/register", {
        email: email.value,
        password: password.value,
      });
    } catch (_) {}
    const session = await req("POST", "/auth/login", {
      email: email.value,
      password: password.value,
    });
    token = session.token;
    const trip = await req("POST", "/trips", {
      title: "سفر آزمایشی",
      stops: [
        { name: "تهران", lat: 35.7, lng: 51.4 },
        { name: "اصفهان", lat: 32.6, lng: 51.7 },
      ],
    });
    box.textContent = "وارد شدید. سفر ساخته شد: " + trip.title;
  } catch (e) {
    box.textContent = "API را اول اجرا کنید. " + e.message;
  }
}

async function searchDest() {
  const box = document.getElementById("places");
  try {
    const rows = await fetch(API + "/destinations?q=" + encodeURIComponent(q.value)).then((r) => r.json());
    box.innerHTML = rows
      .map(
        (p) =>
          `<article class="item"><b>${p.name}</b><span>${p.city} • تازگی: ${p.freshness}</span>${
            p.warning ? `<small>${p.warning}</small>` : ""
          }</article>`
      )
      .join("");
  } catch (e) {
    box.textContent = "API در دسترس نیست";
  }
}

async function sendSos() {
  const box = document.getElementById("sosOut");
  try {
    await req("POST", "/emergency/contacts", { id: "home", name: "خانه", phone: "110" });
    const data = await req("POST", "/emergency/sos", {
      coords: { lat: 35.7, lng: 51.4 },
      offline: true,
    });
    box.textContent = "SOS ثبت شد: " + data.event.id;
  } catch (e) {
    box.textContent = e.message;
  }
}

async function loadHealth() {
  const box = document.getElementById("healthOut");
  try {
    const data = await fetch(API + "/health").then((r) => r.json());
    box.textContent = JSON.stringify(data, null, 2);
  } catch (e) {
    box.textContent = "قطع است. در پوشه services/api دستور npx tsx src/server.ts را بزنید.";
  }
}

async function checkAppUpdate() {
  const box = document.getElementById("updateBanner");
  if (!box) return;
  try {
    const data = await fetch(API + "/update/check?platform=web&current=0.1.0").then((r) => r.json());
    box.textContent = data.updateAvailable
      ? "نسخه جدید " + data.latest + " آماده است"
      : "نسخه فعلی به‌روز است (" + data.current + ")";
  } catch (e) {
    box.textContent = "بررسی آپدیت ممکن نیست تا API روشن شود";
  }
}

checkAppUpdate();
