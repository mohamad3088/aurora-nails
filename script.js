// ===== Behandelingen =====
// Er staan nergens prijzen online. Vul "price" in zodra de zaak ze bevestigt (bv. "vanaf €35").
const TREATMENTS = [
  { icon: "💅", name: "Gelnagels", desc: "Stevige, glanzende gelnagels in elke kleur of vorm — amandel, ovaal of square.", color: "var(--pink)", price: "" },
  { icon: "✨", name: "Acrylnagels", desc: "Verlenging met acryl voor wie lange, sterke nagels wil.", color: "var(--lilac)", price: "" },
  { icon: "🫧", name: "Dip powder", desc: "De powdertechniek: supersterk, licht en lang mooi. Een favoriet van onze vaste klanten.", color: "var(--sky)", price: "" },
  { icon: "🎨", name: "Nail art", desc: "Stippen, hartjes, bloemetjes, swirls of een french met een twist. Breng gerust een voorbeeld mee.", color: "var(--butter)", price: "" },
  { icon: "🤲", name: "Manicure", desc: "Verzorgde handen: vijlen, nagelriemen, en een mooie afwerking.", color: "var(--mint)", price: "" },
  { icon: "🦶", name: "Pedicure", desc: "Even ontspannen en verzorgde voeten — met of zonder kleur.", color: "var(--white)", price: "" },
];

// 0 = zondag … 6 = zaterdag. null = gesloten. (Google: ma–za 9–18; Instagram zegt vanaf 8u)
const HOURS = { 0: null, 1: ["09:00", "18:00"], 2: ["09:00", "18:00"], 3: ["09:00", "18:00"], 4: ["09:00", "18:00"], 5: ["09:00", "18:00"], 6: ["09:00", "18:00"] };
const DAY_NAMES = ["Zondag", "Maandag", "Dinsdag", "Woensdag", "Donderdag", "Vrijdag", "Zaterdag"];

document.getElementById("treatments").innerHTML = TREATMENTS.map(t => `
  <article class="card reveal" style="--c:${t.color}">
    <span class="card__icon" aria-hidden="true">${t.icon}</span>
    <h3>${t.name}</h3>
    <p>${t.desc}</p>
    <span class="card__price">${t.price || "Prijs op aanvraag"}</span>
  </article>`).join("");

// ===== Openingsuren + live status (Belgische tijd) =====
function brusselsNow() {
  const parts = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Brussels", weekday: "short", hour: "2-digit", minute: "2-digit", hour12: false }).formatToParts(new Date());
  const get = t => parts.find(p => p.type === t).value;
  return { day: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(get("weekday")), mins: (+get("hour") % 24) * 60 + +get("minute") };
}
const toMins = s => { const [h, m] = s.split(":").map(Number); return h * 60 + m; };

function renderHours() {
  const { day, mins } = brusselsNow();
  document.getElementById("hours").innerHTML = [1, 2, 3, 4, 5, 6, 0].map(d => {
    const h = HOURS[d];
    return `<tr class="${d === day ? "is-today" : ""}"><td>${DAY_NAMES[d]}</td><td>${h ? `${h[0]} – ${h[1]}` : "Gesloten"}</td></tr>`;
  }).join("");

  const today = HOURS[day];
  const isOpen = !!today && mins >= toMins(today[0]) && mins < toMins(today[1]);
  let text;
  if (isOpen) text = `Nu open tot ${today[1]}`;
  else if (today && mins < toMins(today[0])) text = `Gesloten · vandaag open om ${today[0]}`;
  else {
    let n = 1;
    while (n < 8 && !HOURS[(day + n) % 7]) n++;
    const d = (day + n) % 7;
    text = `Gesloten · ${n === 1 ? "morgen" : DAY_NAMES[d].toLowerCase()} open om ${HOURS[d][0]}`;
  }
  document.querySelector("[data-status-text]").textContent = text;
  document.querySelector("[data-status-box]").classList.toggle("is-open", isOpen);
  const chip = document.querySelector("[data-status]");
  chip.classList.toggle("is-open", isOpen);
  chip.textContent = isOpen ? `Nu open tot ${today[1]} · Heverlee` : "Naamsesteenweg 123 · Heverlee";
}
renderHours();
setInterval(renderHours, 60_000);

// ===== Nav =====
const nav = document.getElementById("nav");
const toggle = document.getElementById("navToggle");
const onScroll = () => nav.classList.toggle("is-scrolled", window.scrollY > 10);
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();
toggle.addEventListener("click", () => toggle.setAttribute("aria-expanded", nav.classList.toggle("is-open")));
document.querySelectorAll("#navLinks a").forEach(a => a.addEventListener("click", () => {
  nav.classList.remove("is-open");
  toggle.setAttribute("aria-expanded", "false");
}));

// ===== Reveal =====
const io = new IntersectionObserver(entries => entries.forEach(e => {
  if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
}), { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
document.querySelectorAll(".reveal").forEach((el, i) => {
  el.style.transitionDelay = `${(i % 3) * 80}ms`;
  io.observe(el);
});

// ===== Lightbox =====
const lb = document.getElementById("lightbox");
const lbImg = lb.querySelector("img");
document.querySelectorAll(".tile").forEach(t => t.addEventListener("click", () => {
  const img = t.querySelector("img");
  lbImg.src = img.src;
  lbImg.alt = img.alt;
  lb.hidden = false;
}));
const close = () => { lb.hidden = true; };
lb.addEventListener("click", e => { if (e.target !== lbImg) close(); });
document.addEventListener("keydown", e => { if (e.key === "Escape") close(); });

document.getElementById("year").textContent = new Date().getFullYear();
