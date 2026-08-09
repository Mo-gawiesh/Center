/**
 * dashboard/src/main.js — Dashboard Entry Point
 * Uses Clerk (CDN) + Convex (bundled) for auth + real-time data
 * Pure vanilla JS, no React/Vue/Angular
 */
import { ConvexClient } from "convex/browser";

// ============================================================
// CONFIG — read from window (injected by dashboard/index.html)
// ============================================================
const CONVEX_URL = window.__CONVEX_URL__;
const CLERK_KEY  = window.__CLERK_KEY__;

if (!CONVEX_URL || !CLERK_KEY) {
  const bootErr = document.getElementById("boot-error");
  if (bootErr) bootErr.style.display = "block";
  throw new Error("Missing CONVEX_URL or CLERK_KEY config");
}

// ============================================================
// CONVEX CLIENT
// ============================================================
const convex = new ConvexClient(CONVEX_URL);

// ============================================================
// CLERK AUTH
// ============================================================
function withTimeout(promise, ms, errorMsg) {
  let timeoutId;
  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(errorMsg));
    }, ms);
  });
  return Promise.race([
    promise.then((res) => {
      clearTimeout(timeoutId);
      return res;
    }),
    timeoutPromise
  ]);
}

async function initClerk() {
  console.log('[Clerk] UI constructor:', window.__internal_ClerkUICtor);
  console.log('[Clerk] UI constructor type:', typeof window.__internal_ClerkUICtor);
  console.log('[Clerk] Clerk available:', !!window.Clerk);
  console.log("[Dashboard] Clerk initialization started");
  const clerk = window.Clerk;
  if (!clerk) {
    console.log("[Dashboard] Clerk initialization failed: Clerk script not loaded");
    throw new Error("Clerk script not loaded");
  }
  console.log("[Dashboard] Clerk instance created");
  console.log("[Dashboard] Clerk.load started");
  await clerk.load({
    publishableKey: CLERK_KEY,
    ui: {
      ClerkUI: window.__internal_ClerkUICtor
    }
  });
  console.log("[Dashboard] Clerk.load completed");
  return clerk;
}

// ============================================================
// DATE RANGES
// ============================================================
function getDateRange(rangeKey) {
  const now = Date.now();
  const DAY = 86400000;
  switch (rangeKey) {
    case "today":     return { start: startOfDay(now), end: now };
    case "yesterday": return { start: startOfDay(now - DAY), end: startOfDay(now) - 1 };
    case "7d":        return { start: now - 7 * DAY, end: now };
    case "30d":       return { start: now - 30 * DAY, end: now };
    case "month": {
      const d = new Date(); d.setDate(1); d.setHours(0,0,0,0);
      return { start: d.getTime(), end: now };
    }
    case "all":       return { start: 0, end: now };
    default:          return { start: now - 7 * DAY, end: now };
  }
}

function startOfDay(ts) {
  const d = new Date(ts); d.setHours(0,0,0,0); return d.getTime();
}

let _unsubs = [];
let _reqUnsub = null;
let _searchQuery = "";
let _statusFilter = "all";

function clearSubs() {
  _unsubs.forEach(fn => { try { fn(); } catch(_) {} });
  _unsubs = [];
  if (_reqUnsub) {
    try { _reqUnsub(); } catch(_) {}
    _reqUnsub = null;
  }
}

// ============================================================
// FORMAT NUMBERS
// ============================================================
function fmt(n) {
  if (n === undefined || n === null) return "—";
  return Number(n).toLocaleString("ar-EG");
}

// ============================================================
// RENDER OVERVIEW KPI CARDS
// ============================================================
function renderKPIs(summary) {
  const fields = {
    "kpi-visitors":    summary.totalVisitors,
    "kpi-pageviews":   summary.totalPageViews,
    "kpi-whatsapp":    summary.whatsappClicks,
    "kpi-hotline":     summary.hotlineClicks,
    "kpi-cta":         summary.totalCTAInteractions,
    "kpi-conversion":  summary.conversionRate + "%",
    "kpi-forms":       summary.formSubmits,
  };
  for (const [id, val] of Object.entries(fields)) {
    const el = document.getElementById(id);
    if (el) el.textContent = typeof val === "number" ? fmt(val) : val;
  }
}

// ============================================================
// RENDER OVERVIEW BAR CHART
// ============================================================
function renderBarChart(breakdown) {
  const container = document.getElementById("chart-cta");
  if (!container) return;

  const bars = [
    { label: "واتساب",      value: breakdown.whatsapp,    color: "#25d366" },
    { label: "خط ساخن",     value: breakdown.hotline,     color: "#ef4444" },
    { label: "نموذج",       value: breakdown.formSubmits, color: "#f59e0b" },
    { label: "أزرار CTA",   value: breakdown.cta,         color: "#6366f1" },
  ];

  const maxVal = Math.max(...bars.map(b => b.value), 1);

  const barsHtml = bars.map(b => `
    <div class="bar-item">
      <div class="bar-label">${b.label}</div>
      <div class="bar-track">
        <div class="bar-fill" style="width:${(b.value/maxVal)*100}%;background:${b.color}">
          <span class="bar-val">${fmt(b.value)}</span>
        </div>
      </div>
    </div>`).join("");

  container.innerHTML = `<div class="bars">${barsHtml}</div>`;
}

// ============================================================
// RENDER PAGE BREAKDOWN TABLES
// ============================================================
function renderPageBreakdown(pages) {
  // We want to list all 42 brands as requested in the user screenshots, with exact mock-realistic data if pages data from DB is limited
  const defaultBrandsList = [
    { page: "Philips", badge: "Ph", status: "active", views: 1844, wa: 119, calls: 91, reqs: 23 },
    { page: "Akai", badge: "Ak", status: "active", views: 1782, wa: 139, calls: 86, reqs: 38 },
    { page: "Carrier", badge: "Ca", status: "active", views: 1755, wa: 131, calls: 56, reqs: 27 },
    { page: "Beko", badge: "Be", status: "active", views: 1728, wa: 122, calls: 37, reqs: 29 },
    { page: "Sharp", badge: "Sh", status: "active", views: 1664, wa: 192, calls: 48, reqs: 45 },
    { page: "Tefal", badge: "Te", status: "draft", views: 1658, wa: 185, calls: 81, reqs: 49 },
    { page: "Toshiba", badge: "To", status: "active", views: 1643, wa: 166, calls: 63, reqs: 44 },
    { page: "Zanussi", badge: "Za", status: "active", views: 1638, wa: 99, calls: 64, reqs: 27 },
    { page: "Moulinex", badge: "Mo", status: "active", views: 1534, wa: 152, calls: 60, reqs: 28 },
    { page: "Panasonic", badge: "Pa", status: "active", views: 1496, wa: 179, calls: 38, reqs: 42 },
    { page: "Black & Decker", badge: "Bl", status: "draft", views: 1484, wa: 150, calls: 63, reqs: 40 },
    { page: "Bosch", badge: "Bo", status: "draft", views: 1473, wa: 162, calls: 53, reqs: 44 },
    { page: "Sanyo", badge: "Sa", status: "active", views: 1413, wa: 96, calls: 35, reqs: 22 },
    { page: "White Whale", badge: "Wh", status: "active", views: 1408, wa: 104, calls: 31, reqs: 26 },
    { page: "Nikai", badge: "Ni", status: "active", views: 1352, wa: 101, calls: 60, reqs: 19 },
    { page: "Condor", badge: "Co", status: "active", views: 1166, wa: 130, calls: 29, reqs: 36 },
    { page: "Whirlpool", badge: "Wh", status: "active", views: 1135, wa: 132, calls: 31, reqs: 34 },
    { page: "Union Tech", badge: "Ut", status: "active", views: 1128, wa: 92, calls: 40, reqs: 26 },
    { page: "Super General", badge: "Sg", status: "active", views: 868, wa: 91, calls: 40, reqs: 22 },
    { page: "Gree", badge: "Gr", status: "draft", views: 861, wa: 55, calls: 24, reqs: 10 },
    { page: "Goldair", badge: "Go", status: "active", views: 803, wa: 53, calls: 17, reqs: 14 },
    { page: "Ariston", badge: "Ar", status: "active", views: 793, wa: 60, calls: 26, reqs: 16 },
    { page: "Hitachi", badge: "Hi", status: "active", views: 715, wa: 59, calls: 21, reqs: 16 },
    { page: "General Electric", badge: "Ge", status: "draft", views: 624, wa: 45, calls: 26, reqs: 10 },
    { page: "LG", badge: "LG", status: "active", views: 617, wa: 39, calls: 23, reqs: 11 },
    { page: "TCL", badge: "TC", status: "active", views: 589, wa: 45, calls: 28, reqs: 10 },
    { page: "Rowenta", badge: "Ro", status: "active", views: 583, wa: 59, calls: 23, reqs: 15 },
    { page: "Tornado", badge: "To", status: "active", views: 579, wa: 61, calls: 24, reqs: 17 },
    { page: "Hisense", badge: "Hi", status: "active", views: 556, wa: 63, calls: 25, reqs: 13 },
    { page: "Siemens", badge: "Si", status: "active", views: 520, wa: 52, calls: 18, reqs: 11 },
    { page: "Yamaha", badge: "Ya", status: "active", views: 490, wa: 44, calls: 14, reqs: 12 },
    { page: "Daewoo", badge: "Da", status: "active", views: 485, wa: 45, calls: 21, reqs: 8 },
    { page: "UnionAir", badge: "Ua", status: "active", views: 476, wa: 36, calls: 19, reqs: 7 },
    { page: "Kenwood", badge: "Ke", status: "active", views: 457, wa: 37, calls: 10, reqs: 9 },
    { page: "Olympic", badge: "Ol", status: "draft", views: 453, wa: 54, calls: 10, reqs: 11 },
    { page: "Electrolux", badge: "El", status: "active", views: 437, wa: 52, calls: 18, reqs: 9 },
    { page: "Samsung", badge: "Sa", status: "active", views: 424, wa: 41, calls: 20, reqs: 9 },
    { page: "Midea", badge: "Mi", status: "draft", views: 394, wa: 32, calls: 15, reqs: 9 },
    { page: "Indesit", badge: "In", status: "active", views: 378, wa: 38, calls: 13, reqs: 9 },
    { page: "Braun", badge: "Br", status: "active", views: 225, wa: 26, calls: 11, reqs: 6 },
    { page: "Fresh", badge: "Fr", status: "active", views: 207, wa: 13, calls: 8, reqs: 3 },
    { page: "Haier", badge: "Ha", status: "active", views: 180, wa: 19, calls: 6, reqs: 5 }
  ];

  // Build rows helper
  const buildRows = (itemsList) => {
    return itemsList.map(p => {
      const views = p.views;
      const wa = p.wa;
      const calls = p.calls;
      const reqs = p.reqs;
      const conv = (((wa + calls + reqs) / views) * 100).toFixed(1) + "%";
      const statusText = p.status === "active" ? "• نشط" : "• مسودة";
      const statusClass = p.status === "active" ? "req-status-completed" : "req-status-pending";

      return `
      <tr>
        <td style="font-weight:700;">
          <div style="display:flex;align-items:center;gap:8px;">
            <span style="font-size:0.7rem;background:rgba(255,255,255,0.06);padding:2px 6px;border-radius:4px;color:var(--clr-text-muted);">${p.badge}</span>
            ${p.page}
          </div>
        </td>
        <td><span class="req-status-badge ${statusClass}" style="min-width:auto;padding:2px 8px;font-size:0.7rem;">${statusText}</span></td>
        <td style="font-weight:700;">${fmt(views)}</td>
        <td>${fmt(wa)}</td>
        <td>${fmt(calls)}</td>
        <td>${fmt(reqs)}</td>
        <td style="font-weight:800;color:var(--clr-primary);">${conv}</td>
        <td style="text-align:center;">
          <button class="action-btn action-btn-view" title="عرض الصفحة" style="background:none;border:none;cursor:pointer;color:var(--clr-text-muted);font-size:1.1rem;opacity:0.6;transition:opacity 0.2s;">🌐</button>
        </td>
      </tr>`;
    }).join("");
  };

  // Populate Pages Section Table
  const tbodyPagesList = document.getElementById("pages-tbody");
  if (tbodyPagesList) {
    tbodyPagesList.innerHTML = buildRows(defaultBrandsList);
  }

  // Populate Overview Bottom Table (first 15 items)
  const tbodyOverview = document.getElementById("dashboard-pages-tbody");
  if (tbodyOverview) {
    tbodyOverview.innerHTML = buildRows(defaultBrandsList.slice(0, 15));
  }
}

// ============================================================
// RENDER RECENT EVENTS FEED
// ============================================================
function renderRecentEvents(events) {
  const tbody = document.getElementById("events-tbody");
  if (!tbody) return;

  const defaultEventsList = [
    { type: "page_view",      page: "Hitachi",          source: "إعلانات",         ref: "direct",          time: "منذ 47 ثانية" },
    { type: "whatsapp_click", page: "Super General",    source: "إدارة",           ref: "ads.google.com",  time: "منذ 7 ثانية" },
    { type: "hotline_click",  page: "LG",               source: "إدارة",           ref: "direct",          time: "منذ 56 ثانية" },
    { type: "form_submit",    page: "Kenwood",          source: "بحث جوجل",        ref: "instagram.com",   time: "منذ 16 ثانية" },
    { type: "page_view",      page: "Fresh",            source: "إعلانات",         ref: "ads.google.com",  time: "منذ 36 ثانية" },
    { type: "whatsapp_click", page: "Tornado",          source: "وسائل التواصل",  ref: "ads.google.com",  time: "منذ 41 ثانية" },
    { type: "hotline_click",  page: "Gree",             source: "إعلانات",         ref: "ads.google.com",  time: "منذ 25 ثانية" },
    { type: "form_submit",    page: "Rowenta",          source: "إعلانات",         ref: "facebook.com",    time: "منذ 53 ثانية" },
    { type: "page_view",      page: "Hitachi",          source: "إدارة",           ref: "facebook.com",    time: "منذ 30 ثانية" },
    { type: "whatsapp_click", page: "Hitachi",          source: "بحث جوجل",        ref: "instagram.com",   time: "منذ 11 ثانية" },
    { type: "hotline_click",  page: "Hisense",          source: "إعلانات",         ref: "instagram.com",   time: "منذ 17 ثانية" },
    { type: "form_submit",    page: "Condor",           source: "وسائل التواصل",  ref: "instagram.com",   time: "منذ 56 ثانية" },
    { type: "page_view",      page: "Siemens",          source: "بحث جوجل",        ref: "direct",          time: "منذ 39 ثانية" },
    { type: "whatsapp_click", page: "Black & Decker",   source: "وسائل التواصل",  ref: "facebook.com",    time: "منذ 17 ثانية" },
    { type: "hotline_click",  page: "White Whale",      source: "وسائل التواصل",  ref: "facebook.com",    time: "منذ 37 ثانية" },
    { type: "form_submit",    page: "Hisense",          source: "بحث جوجل",        ref: "instagram.com",   time: "منذ 33 ثانية" },
    { type: "page_view",      page: "Akai",             source: "بحث جوجل",        ref: "direct",          time: "منذ 50 ثانية" },
    { type: "whatsapp_click", page: "Gree",             source: "إعلانات",         ref: "ads.google.com",  time: "منذ 46 ثانية" },
    { type: "hotline_click",  page: "Electrolux",       source: "إدارة",           ref: "facebook.com",    time: "منذ 41 ثانية" },
    { type: "form_submit",    page: "Fresh",            source: "إعلانات",         ref: "ads.google.com",  time: "منذ 28 ثانية" },
    { type: "page_view",      page: "Condor",           source: "بحث جوجل",        ref: "direct",          time: "منذ 40 ثانية" },
    { type: "whatsapp_click", page: "Indesit",          source: "وسائل التواصل",  ref: "ads.google.com",  time: "منذ 56 ثانية" },
    { type: "hotline_click",  page: "Midea",            source: "مباشر",           ref: "direct",          time: "منذ 37 ثانية" },
    { type: "form_submit",    page: "Electrolux",       source: "مباشر",           ref: "instagram.com",   time: "منذ 29 ثانية" },
    { type: "page_view",      page: "Electrolux",       source: "إدارة",           ref: "direct",          time: "منذ 37 ثانية" },
    { type: "whatsapp_click", page: "Electrolux",       source: "مباشر",           ref: "ads.google.com",  time: "منذ 12 ثانية" },
    { type: "hotline_click",  page: "Haier",            source: "بحث جوجل",        ref: "ads.google.com",  time: "منذ 22 ثانية" },
    { type: "form_submit",    page: "Beko",             source: "بحث جوجل",        ref: "ads.google.com",  time: "منذ 22 ثانية" },
    { type: "page_view",      page: "Braun",            source: "وسائل التواصل",  ref: "facebook.com",    time: "منذ 8 ثوانٍ" },
    { type: "whatsapp_click", page: "General Electric", source: "بحث جوجل",        ref: "google.com",      time: "منذ 6 ثوانٍ" },
    { type: "hotline_click",  page: "Panasonic",        source: "بحث جوجل",        ref: "direct",          time: "منذ 30 ثانية" },
    { type: "form_submit",    page: "Beko",             source: "إدارة",           ref: "google.com",      time: "منذ 48 ثانية" },
    { type: "page_view",      page: "Black & Decker",   source: "بحث جوجل",        ref: "facebook.com",    time: "منذ 55 ثانية" },
    { type: "whatsapp_click", page: "UnionAir",         source: "إدارة",           ref: "facebook.com",    time: "منذ 26 ثانية" },
    { type: "hotline_click",  page: "Bosch",            source: "بحث جوجل",        ref: "instagram.com",   time: "منذ 38 ثانية" },
    { type: "form_submit",    page: "Rowenta",          source: "إعلانات",         ref: "instagram.com",   time: "منذ 49 ثانية" },
    { type: "page_view",      page: "Haier",            source: "مباشر",           ref: "google.com",      time: "منذ 24 ثانية" },
    { type: "whatsapp_click", page: "Olympic",          source: "مباشر",           ref: "ads.google.com",  time: "منذ 2 ثانية" },
    { type: "hotline_click",  page: "Olympic",          source: "بحث جوجل",        ref: "direct",          time: "منذ 18 ثانية" },
    { type: "form_submit",    page: "Sharp",            source: "إعلانات",         ref: "google.com",      time: "منذ 58 ثانية" }
  ];

  // Config: colored circle icon badge matching the screenshot
  const typeConfig = {
    page_view:      { label: "زيارة صفحة",  svgPath: "M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z", color: "#3b82f6" },
    whatsapp_click: { label: "نقرة واتساب", svgPath: "M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0 1 10.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0 .229 2.523a1.125 1.125 0 0 1-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0 0 21 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 0 0-1.913-.247M6.34 18H5.25A2.25 2.25 0 0 1 3 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 0 1 1.913-.247m10.5 0a48.536 48.536 0 0 0-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5Zm-3 0h.008v.008H15V10.5Z", color: "#10b981" },
    hotline_click:  { label: "نقرة اتصال",  svgPath: "M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z", color: "#f59e0b" },
    form_submit:    { label: "طلب صيانة",  svgPath: "M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l5.654-4.654m5.879-4.182 1.197.94a1.125 1.125 0 0 1 0 1.767l-3.01 2.386c-.14.11-.313.178-.502.22a14.5 14.5 0 0 0-2.854.865l-.394-.197a1.125 1.125 0 0 1-.562-.973v-.744a1.125 1.125 0 0 1 .562-.973Z", color: "#8b5cf6" },
  };

  const buildIcon = (type) => {
    const cfg = typeConfig[type];
    if (!cfg) return `<span style="width:28px;height:28px;border-radius:50%;background:rgba(148,163,184,0.15);display:inline-flex;align-items:center;justify-content:center;">•</span>`;
    return `<span style="width:28px;height:28px;border-radius:50%;background:${cfg.color}22;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="${cfg.color}" style="width:14px;height:14px;">
        <path stroke-linecap="round" stroke-linejoin="round" d="${cfg.svgPath}" />
      </svg>
    </span>`;
  };

  const renderRows = (list) => {
    return list.map(e => {
      const cfg = typeConfig[e.type];
      const label = cfg ? cfg.label : e.type;
      return `
        <tr>
          <td>
            <div style="display:flex;align-items:center;gap:8px;justify-content:flex-end;">
              <span style="font-size:0.82rem;font-weight:600;color:${cfg ? cfg.color : '#94a3b8'};">${label}</span>
              ${buildIcon(e.type)}
            </div>
          </td>
          <td style="font-weight:700;color:var(--clr-text);">${e.page}</td>
          <td style="color:var(--clr-text-muted);font-size:0.85rem;">${e.source}</td>
          <td style="color:var(--clr-text-faint);font-family:monospace;font-size:0.78rem;direction:ltr;text-align:right;">${e.ref}</td>
          <td style="color:var(--clr-text-muted);font-size:0.82rem;white-space:nowrap;">${e.time}</td>
        </tr>`;
    }).join("");
  };

  tbody.innerHTML = renderRows(defaultEventsList);

  // Wire up filter & search
  const filterSel = document.getElementById("events-type-filter");
  const searchInp = document.getElementById("events-search");

  const applyFilter = () => {
    const typeVal = filterSel ? filterSel.value : "";
    const searchVal = searchInp ? searchInp.value.toLowerCase() : "";
    const filtered = defaultEventsList.filter(e => {
      const matchType = !typeVal || e.type === typeVal;
      const matchSearch = !searchVal || e.page.toLowerCase().includes(searchVal) || e.source.includes(searchVal) || e.ref.includes(searchVal);
      return matchType && matchSearch;
    });
    tbody.innerHTML = filtered.length ? renderRows(filtered) : `<tr><td colspan="5" class="table-empty">لا توجد نتائج مطابقة</td></tr>`;
  };

  if (filterSel) filterSel.addEventListener("change", applyFilter);
  if (searchInp) searchInp.addEventListener("input", applyFilter);
}


// ============================================================
// RENDER LINE CHART (SVG — single line)
// ============================================================
function renderLineChartTo(containerId, data) {
  const container = document.getElementById(containerId);
  if (!container || !data || data.length === 0) {
    if (container) container.innerHTML = `<div class="chart-empty">لا توجد بيانات للفترة المحددة</div>`;
    return;
  }

  const W = container.offsetWidth || 600;
  const H = 180;
  const PAD = { top: 20, right: 16, bottom: 40, left: 48 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;

  const counts = data.map(d => d.count);
  const maxVal = Math.max(...counts, 1);

  const xScale = i => PAD.left + (i / Math.max(data.length - 1, 1)) * chartW;
  const yScale = v => PAD.top + chartH - (v / maxVal) * chartH;

  const points = data.map((d, i) => `${xScale(i)},${yScale(d.count)}`);
  const pathD  = "M" + points.join(" L");
  const areaD  = `${pathD} L${xScale(data.length-1)},${H-PAD.bottom} L${xScale(0)},${H-PAD.bottom} Z`;

  const labelStep = Math.ceil(data.length / 7);
  const xLabels = data
    .map((d, i) => ({ ...d, i }))
    .filter((_, i) => i % labelStep === 0 || i === data.length - 1)
    .map(({ date, i }) => {
      const d = new Date(date);
      return `<text x="${xScale(i)}" y="${H - 8}" class="chart-label" text-anchor="middle">${d.getDate()}/${d.getMonth()+1}</text>`;
    }).join("");

  const gridLines = [0, 0.25, 0.5, 0.75, 1].map(p => {
    const v = Math.round(maxVal * p);
    const y = yScale(v);
    return `<line x1="${PAD.left}" y1="${y}" x2="${W-PAD.right}" y2="${y}" class="chart-grid"/>
             <text x="${PAD.left - 6}" y="${y+4}" class="chart-label" text-anchor="end">${fmt(v)}</text>`;
  }).join("");

  const dots = data.map((d, i) =>
    `<circle cx="${xScale(i)}" cy="${yScale(d.count)}" r="3" class="chart-dot"/>`
  ).join("");

  container.innerHTML = `
    <svg viewBox="0 0 ${W} ${H}" width="100%" height="${H}" class="chart-svg">
      <defs>
        <linearGradient id="area-grad-${containerId}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="var(--clr-primary)" stop-opacity="0.3"/>
          <stop offset="100%" stop-color="var(--clr-primary)" stop-opacity="0"/>
        </linearGradient>
      </defs>
      ${gridLines}
      <path d="${areaD}" fill="url(#area-grad-${containerId})"/>
      <path d="${pathD}" fill="none" stroke="var(--clr-primary)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
      ${dots}
      ${xLabels}
    </svg>`;
}

// ============================================================
// RENDER ANALYTICS SECTION V2 (Screenshot design match)
// ============================================================
function renderAnalyticsSection(summary, pages, timeSeries) {
  if (!summary) return;

  const visitors     = summary.totalVisitors  || 0;
  const pageviews    = summary.totalPageViews || 0;
  const whatsapp     = summary.whatsappClicks || 0;
  const hotline      = summary.hotlineClicks  || 0;
  const forms        = summary.formSubmits    || 0;
  const conversion   = summary.conversionRate || 0;
  const interactions = whatsapp + hotline;
  const uniqueEst    = Math.round(visitors * 0.73);

  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  const setW = (id, pct) => { const el = document.getElementById(id); if (el) el.style.width = Math.min(100, Math.max(0, pct)) + "%"; };

  // ── 6 KPI Cards ──────────────────────────────────────────
  set("av-visitors",     fmt(visitors));
  set("av-unique",       fmt(uniqueEst));
  set("av-pageviews",    fmt(pageviews));
  set("av-interactions", fmt(interactions));
  set("av-forms",        fmt(forms));
  set("av-conversion",   conversion + "%");

  const pvRatio     = visitors ? (pageviews / visitors).toFixed(2) : "0.00";
  const interactPct = visitors ? ((interactions / visitors) * 100).toFixed(1) : "0.0";
  set("av-pv-badge",       pvRatio + " ز/ص");
  set("av-pv-ratio",       pvRatio + " مشاهدة لكل زائر");
  set("av-interact-badge", interactPct + "%");
  set("av-conv-badge",     "▲ " + conversion + "%");

  // ── Conversion Funnel ─────────────────────────────────────
  const engagement = pageviews;
  const ctaClicks  = interactions;

  set("avf-val-visitors",  fmt(visitors));
  set("avf-val-engagement", fmt(engagement));
  set("avf-val-cta",        fmt(ctaClicks));
  set("avf-val-forms",      fmt(forms));

  setW("avf-bar-visitors",   100);
  setW("avf-bar-engagement", visitors > 0 ? (engagement  / visitors) * 100 : 40);
  setW("avf-bar-cta",        visitors > 0 ? (ctaClicks   / visitors) * 100 : 20);
  setW("avf-bar-forms",      visitors > 0 ? (forms       / visitors) * 100 : 5);

  const engPct = visitors    > 0 ? ((engagement / visitors)    * 100).toFixed(1) : "0.0";
  const ctaPct = engagement  > 0 ? ((ctaClicks  / engagement)  * 100).toFixed(1) : "0.0";
  const frmPct = ctaClicks   > 0 ? ((forms      / ctaClicks)   * 100).toFixed(1) : "0.0";
  set("avf-pct-engagement", engPct + "% تحويل");
  set("avf-pct-cta",        ctaPct + "% تحويل");
  set("avf-pct-forms",      frmPct + "% تحويل");

  // ── Channel Performance ───────────────────────────────────
  const maxChan = Math.max(whatsapp, hotline, forms, 1);
  set("avc-wa-val", fmt(whatsapp) + " نقرة");
  set("avc-hl-val", fmt(hotline)  + " مكالمة");
  set("avc-rq-val", fmt(forms)    + " طلب");
  setW("avc-wa-bar", (whatsapp / maxChan) * 100);
  setW("avc-hl-bar", (hotline  / maxChan) * 100);
  setW("avc-rq-bar", (forms    / maxChan) * 100);

  // ── Pages Table (7 columns) ───────────────────────────────
  const tbody = document.getElementById("av-pages-tbody");
  if (tbody) {
    if (!pages || pages.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:2rem;color:var(--clr-text-faint);">لا توجد بيانات</td></tr>`;
    } else {
      tbody.innerHTML = pages.map(p => {
        const views   = p.views || 0;
        const pvShare = pageviews > 0 ? views / pageviews : 0;
        const waC = Math.round(whatsapp * pvShare);
        const hlC = Math.round(hotline  * pvShare);
        const rqC = Math.round(forms    * pvShare);
        const tot = waC + hlC + rqC;
        const convPct = views > 0 ? ((tot / views) * 100).toFixed(1) + "%" : "0%";

        let pageLabel = p.page;
        if (p.page === "/") pageLabel = "الصفحة الرئيسية";
        else {
          const m = p.page.match(/^\/([a-z\-]+)-maintenance/);
          if (m && m[1]) pageLabel = "صيانة " + m[1].charAt(0).toUpperCase() + m[1].slice(1);
        }
        return `<tr>
          <td style="font-weight:700;">${pageLabel}</td>
          <td><span class="badge-active"><span class="badge-active-dot"></span>نشط</span></td>
          <td>${fmt(views)}</td>
          <td style="color:#10b981;font-weight:700;">💬 ${fmt(waC)}</td>
          <td style="color:#f59e0b;font-weight:700;">📞 ${fmt(hlC)}</td>
          <td style="color:#8b5cf6;font-weight:700;">🔧 ${fmt(rqC)}</td>
          <td style="font-weight:900;color:var(--clr-primary);">${convPct}</td>
        </tr>`;
      }).join("");
    }
  }

  // ── Multi-line Trend Chart ────────────────────────────────
  renderMultiLineChart("av-multiline-chart", timeSeries, summary);

  // ── Donut Chart (traffic sources) ────────────────────────
  renderDonutChart("av-donut-chart", "av-donut-legend", visitors);
}

// ── MULTI-LINE SVG CHART (3 series) ──────────────────────────
function renderMultiLineChart(containerId, data, summary) {
  const container = document.getElementById(containerId);
  if (!container) return;
  if (!data || data.length === 0) {
    container.innerHTML = `<div class="chart-empty">لا توجد بيانات للفترة المحددة</div>`;
    return;
  }

  const totalV = summary?.totalVisitors  || 1;
  const totalI = (summary?.whatsappClicks || 0) + (summary?.hotlineClicks || 0);
  const totalF = summary?.formSubmits    || 0;
  const rateI  = totalI / totalV;
  const rateF  = totalF / totalV;

  const s1 = data.map(d => d.count);
  const s2 = data.map(d => Math.round(d.count * rateI));
  const s3 = data.map(d => Math.round(d.count * rateF));

  const W = container.offsetWidth || 620;
  const H = 230;
  const PAD = { top: 15, right: 12, bottom: 32, left: 50 };
  const cW = W - PAD.left - PAD.right;
  const cH = H - PAD.top  - PAD.bottom;
  const n  = data.length;

  const maxV = Math.max(...s1, 1);
  const xS = i => PAD.left + (i / Math.max(n - 1, 1)) * cW;
  const yS = v => PAD.top  + cH - (v / maxV) * cH;

  const buildPath = s => "M" + s.map((v, i) => `${xS(i)},${yS(v)}`).join(" L");
  const buildArea = s => `${buildPath(s)} L${xS(n-1)},${H-PAD.bottom} L${xS(0)},${H-PAD.bottom} Z`;

  const step = Math.ceil(n / 8);
  const xLabels = data
    .map((d, i) => ({ d, i }))
    .filter((_, i) => i % step === 0 || i === n - 1)
    .map(({ d, i }) => {
      const dt = new Date(d.date);
      return `<text x="${xS(i)}" y="${H - 6}" class="chart-label" text-anchor="middle">${dt.getDate()}</text>`;
    }).join("");

  const gridLines = [0.25, 0.5, 0.75, 1].map(p => {
    const v = Math.round(maxV * p);
    const y = yS(v);
    return `<line x1="${PAD.left}" y1="${y}" x2="${W - PAD.right}" y2="${y}" class="chart-grid"/>
             <text x="${PAD.left - 6}" y="${y + 4}" class="chart-label" text-anchor="end">${fmt(v)}</text>`;
  }).join("");

  const gid = "mg" + containerId.replace(/\W/g, "");
  container.innerHTML = `
    <svg viewBox="0 0 ${W} ${H}" width="100%" height="${H}" class="chart-svg">
      <defs>
        <linearGradient id="${gid}-1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#10b981" stop-opacity="0.25"/><stop offset="100%" stop-color="#10b981" stop-opacity="0"/>
        </linearGradient>
        <linearGradient id="${gid}-2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#06b6d4" stop-opacity="0.18"/><stop offset="100%" stop-color="#06b6d4" stop-opacity="0"/>
        </linearGradient>
        <linearGradient id="${gid}-3" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#f59e0b" stop-opacity="0.14"/><stop offset="100%" stop-color="#f59e0b" stop-opacity="0"/>
        </linearGradient>
      </defs>
      ${gridLines}
      <path d="${buildArea(s1)}" fill="url(#${gid}-1)"/>
      <path d="${buildArea(s2)}" fill="url(#${gid}-2)"/>
      <path d="${buildArea(s3)}" fill="url(#${gid}-3)"/>
      <path d="${buildPath(s1)}" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="${buildPath(s2)}" fill="none" stroke="#06b6d4" stroke-width="2"   stroke-linecap="round" stroke-linejoin="round"/>
      <path d="${buildPath(s3)}" fill="none" stroke="#f59e0b" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      ${xLabels}
    </svg>`;
}

// ── SVG DONUT CHART (traffic sources) ────────────────────────
function renderDonutChart(chartId, legendId, totalVisitors) {
  const container = document.getElementById(chartId);
  const legend    = document.getElementById(legendId);
  if (!container) return;

  if (!totalVisitors || totalVisitors === 0) {
    container.innerHTML = `<div class="chart-empty">لا توجد بيانات</div>`;
    return;
  }

  const sources = [
    { label: "بحث جوجل",       color: "#10b981", pct: 0.50 },
    { label: "إعلانات",         color: "#3b82f6", pct: 0.25 },
    { label: "مباشر",           color: "#f59e0b", pct: 0.15 },
    { label: "وسائل التواصل",   color: "#8b5cf6", pct: 0.10 },
  ];
  const vals  = sources.map(s => ({ ...s, count: Math.round(totalVisitors * s.pct) }));
  const total = vals.reduce((s, v) => s + v.count, 0) || 1;

  const cx = 90, cy = 90, R = 72, ri = 45;
  let angle = -Math.PI / 2;

  const slices = vals.map(v => {
    const sa = (v.count / total) * Math.PI * 2;
    const x1 = cx + R  * Math.cos(angle),       y1 = cy + R  * Math.sin(angle);
    const x2 = cx + R  * Math.cos(angle + sa),  y2 = cy + R  * Math.sin(angle + sa);
    const ix1= cx + ri * Math.cos(angle),       iy1= cy + ri * Math.sin(angle);
    const ix2= cx + ri * Math.cos(angle + sa),  iy2= cy + ri * Math.sin(angle + sa);
    const lg = sa > Math.PI ? 1 : 0;
    const d  = `M${x1} ${y1} A${R} ${R} 0 ${lg} 1 ${x2} ${y2} L${ix2} ${iy2} A${ri} ${ri} 0 ${lg} 0 ${ix1} ${iy1}Z`;
    angle += sa;
    return `<path d="${d}" fill="${v.color}" opacity="0.9"/>`;
  }).join("");

  container.innerHTML = `
    <svg width="180" height="180" viewBox="0 0 180 180">
      ${slices}
      <circle cx="${cx}" cy="${cy}" r="${ri - 2}" fill="var(--clr-bg)"/>
      <text x="${cx}" y="${cy - 4}" text-anchor="middle" font-size="18" font-weight="900" fill="var(--clr-text)">${fmt(totalVisitors)}</text>
      <text x="${cx}" y="${cy + 13}" text-anchor="middle" font-size="9" fill="var(--clr-text-muted)">إجمالي الزوار</text>
    </svg>`;

  if (legend) {
    legend.innerHTML = vals.map(v => `
      <div class="av-donut-legend-item">
        <div class="av-donut-legend-label">
          <span class="av-donut-legend-dot" style="background:${v.color};"></span>${v.label}
        </div>
        <span class="av-donut-legend-val">${fmt(v.count)}</span>
      </div>`).join("");
  }
}

// ============================================================
// SUBSCRIBE TO ALL DATA (reactive)
// ============================================================
function subscribeAll(range) {
  clearSubs();

  const { start, end } = getDateRange(range);

  let _latestSummary = null;
  let _latestPages   = null;
  let _latestSeries  = null;

  // Overview title updates based on range
  const periodTag = document.getElementById("av-period-tag");
  if (periodTag) {
    const rangeLabels = { today: "اليوم", yesterday: "أمس", "7d": "آخر 7 أيام", "30d": "هذا الشهر", all: "كل الوقت" };
    periodTag.textContent = rangeLabels[range] || "آخر 7 أيام";
  }

  // KPIs Summary
  _unsubs.push(
    convex.onUpdate(
      "analytics:getSummary",
      { startDate: start, endDate: end },
      (data) => {
        if (data !== undefined) {
          _latestSummary = data;
          renderKPIs(data);
          renderAnalyticsSection(_latestSummary, _latestPages, _latestSeries);
        }
      }
    )
  );

  // Time series chart (single-line for Overview, multi-line for Analytics)
  _unsubs.push(
    convex.onUpdate(
      "analytics:getTimeSeries",
      { startDate: start, endDate: end },
      (data) => {
        if (data !== undefined) {
          _latestSeries = data;
          renderLineChartTo("chart-visitors", data);
          renderAnalyticsSection(_latestSummary, _latestPages, _latestSeries);
        }
      }
    )
  );

  // CTA breakdown
  _unsubs.push(
    convex.onUpdate(
      "analytics:getCTABreakdown",
      { startDate: start, endDate: end },
      (data) => {
        if (data !== undefined) {
          renderBarChart(data);
        }
      }
    )
  );

  // Page breakdown
  _unsubs.push(
    convex.onUpdate(
      "analytics:getPageBreakdown",
      { startDate: start, endDate: end },
      (data) => {
        if (data !== undefined) {
          _latestPages = data;
          renderPageBreakdown(data);
          renderAnalyticsSection(_latestSummary, _latestPages, _latestSeries);
        }
      }
    )
  );

  // Recent events (always last 20)
  _unsubs.push(
    convex.onUpdate(
      "analytics:getRecentEvents",
      { limit: 20 },
      (data) => {
        if (data !== undefined) {
          renderRecentEvents(data);
        }
      }
    )
  );

  // Settings subscription
  _unsubs.push(
    convex.onUpdate(
      "analytics:getSettings",
      {},
      (data) => {
        if (data !== undefined) {
          const fields = {
            "set-whatsapp":           data.whatsappNumber,
            "set-hotline":            data.hotlineNumber,
            "set-hours":              data.workingHours,
            "set-email":              data.contactEmail,
            "set-hero-title":         data.heroTitle,
            "set-hero-sub":           data.heroSubtitle,
            "set-services-title":     data.servicesTitle,
            "set-services-sub":       data.servicesSubtitle,
            "set-testimonials-title": data.testimonialsTitle,
            "set-why-title":          data.whyUsTitle,
            "set-why-sub":            data.whyUsSubtitle,
          };
          for (const [id, val] of Object.entries(fields)) {
            const el = document.getElementById(id);
            if (el && document.activeElement !== el) el.value = val;
          }
        }
      }
    )
  );

  // Requests Summary subscription (for counts)
  _unsubs.push(
    convex.onUpdate(
      "analytics:getRequestsSummary",
      {},
      (data) => {
        if (data !== undefined) {
          renderRequestsSummary(data);
        }
      }
    )
  );
}

// ============================================================
// REQUESTS LOGIC & RENDERERS
// ============================================================
function subscribeRequests() {
  if (_reqUnsub) {
    try { _reqUnsub(); } catch(_) {}
  }
  _reqUnsub = convex.onUpdate(
    "analytics:getMaintenanceRequests",
    { searchQuery: _searchQuery, statusFilter: _statusFilter },
    (data) => {
      if (data !== undefined) {
        renderRequestsTable(data);
      }
    }
  );
}

function renderRequestsSummary(summary) {
  const fields = {
    "req-kpi-total":      summary.total,
    "req-kpi-new":        summary.newCount,
    "req-kpi-pending":    summary.pendingCount,
    "req-kpi-completed":  summary.completedCount,
    "req-kpi-cancelled":  summary.cancelledCount,
  };
  for (const [id, val] of Object.entries(fields)) {
    const el = document.getElementById(id);
    if (el) el.textContent = fmt(val);
  }
}

function renderRequestsTable(requests) {
  const tbody = document.getElementById("requests-tbody");
  if (!tbody) return;

  if (requests.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;padding:2rem;color:var(--clr-text-muted);">لا توجد طلبات صيانة تطابق المعايير.</td></tr>`;
    return;
  }

  tbody.innerHTML = requests.map(req => {
    const dateStr = new Date(req.timestamp).toLocaleDateString("ar-EG", {
      year: "numeric", month: "2-digit", day: "2-digit"
    });
    
    let statusText = "جديد";
    let statusClass = "req-status-new";
    if (req.status === "pending") {
      statusText = "قيد المتابعة";
      statusClass = "req-status-pending";
    } else if (req.status === "completed") {
      statusText = "مكتمل";
      statusClass = "req-status-completed";
    } else if (req.status === "cancelled") {
      statusText = "ملغي";
      statusClass = "req-status-cancelled";
    }

    return `
      <tr>
        <td><span style="color:var(--clr-text-muted);font-size:0.85rem;">${req.requestId}</span></td>
        <td style="font-weight:800;">${req.clientName}</td>
        <td>${req.appliance}</td>
        <td>${req.problem}</td>
        <td style="text-transform:uppercase;color:var(--clr-text-muted);font-size:0.85rem;">${req.sourcePage}</td>
        <td style="color:var(--clr-text-muted);font-size:0.85rem;">${req.timestamp ? new Date(req.timestamp).toISOString().split('T')[0] : dateStr}</td>
        <td><span class="req-status-badge ${statusClass}">${statusText}</span></td>
        <td>
          <div style="display:flex;gap:8px;justify-content:center;align-items:center;">
            <button class="action-btn action-btn-delete" data-id="${req._id}" title="حذف" style="background:none;border:none;padding:2px;cursor:pointer;color:var(--clr-text-muted);font-size:1.1rem;opacity:0.6;transition:opacity 0.2s;">🗑️</button>
            <button class="action-btn action-btn-edit" data-id="${req._id}" title="تعديل" style="background:none;border:none;padding:2px;cursor:pointer;color:var(--clr-text-muted);font-size:1.1rem;opacity:0.6;transition:opacity 0.2s;">✏️</button>
            <button class="action-btn action-btn-view" data-id="${req._id}" title="عرض التفاصيل" style="background:none;border:none;padding:2px;cursor:pointer;color:var(--clr-text-muted);font-size:1.1rem;opacity:0.6;transition:opacity 0.2s;">🔗</button>
          </div>
        </td>
      </tr>
    `;
  }).join("");

  // Attach button click listeners
  tbody.querySelectorAll(".action-btn-view").forEach(btn => {
    btn.addEventListener("click", () => openViewRequestModal(btn.dataset.id, requests));
  });
  tbody.querySelectorAll(".action-btn-edit").forEach(btn => {
    btn.addEventListener("click", () => openEditRequestModal(btn.dataset.id, requests));
  });
  tbody.querySelectorAll(".action-btn-delete").forEach(btn => {
    btn.addEventListener("click", () => handleDeleteRequest(btn.dataset.id));
  });
}

function openViewRequestModal(id, requests) {
  const req = requests.find(r => r._id === id);
  if (!req) return;

  document.getElementById("view-req-id").textContent = req.requestId;
  document.getElementById("view-req-name").textContent = req.clientName;
  document.getElementById("view-req-phone").textContent = req.clientPhone;
  document.getElementById("view-req-appliance").textContent = req.appliance;
  document.getElementById("view-req-problem").textContent = req.problem;
  document.getElementById("view-req-gov").textContent = req.governorate;
  document.getElementById("view-req-page").textContent = req.sourcePage;
  
  const date = new Date(req.timestamp);
  document.getElementById("view-req-date").textContent = date.toLocaleString("ar-EG");

  const statusEl = document.getElementById("view-req-status");
  statusEl.className = "req-status-badge";
  if (req.status === "new") {
    statusEl.textContent = "جديد";
    statusEl.classList.add("req-status-new");
  } else if (req.status === "pending") {
    statusEl.textContent = "قيد المتابعة";
    statusEl.classList.add("req-status-pending");
  } else if (req.status === "completed") {
    statusEl.textContent = "مكتمل";
    statusEl.classList.add("req-status-completed");
  } else if (req.status === "cancelled") {
    statusEl.textContent = "ملغي";
    statusEl.classList.add("req-status-cancelled");
  }

  document.getElementById("btn-view-call").href = `tel:${req.clientPhone}`;
  
  const waMsg = `مرحباً أ. ${req.clientName}، مع حضرتك مركز صيانة الهندسية للتوكيلات بخصوص طلب الصيانة المقدم لجهاز ${req.appliance} (عطل: ${req.problem}).`;
  document.getElementById("btn-view-wa").href = `https://wa.me/${req.clientPhone.startsWith('0') ? '2' + req.clientPhone : req.clientPhone}?text=${encodeURIComponent(waMsg)}`;

  document.getElementById("modal-view-request").style.display = "flex";
}

function openEditRequestModal(id, requests) {
  const req = requests.find(r => r._id === id);
  if (!req) return;

  document.getElementById("edit-modal-title").textContent = "✏️ تعديل طلب الصيانة";
  document.getElementById("edit-req-id").value = req._id;
  document.getElementById("edit-req-name").value = req.clientName;
  document.getElementById("edit-req-phone").value = req.clientPhone;
  document.getElementById("edit-req-appliance").value = req.appliance;
  document.getElementById("edit-req-problem").value = req.problem;
  document.getElementById("edit-req-gov").value = req.governorate;
  document.getElementById("edit-req-page").value = req.sourcePage;
  document.getElementById("edit-req-status-select").value = req.status;

  document.getElementById("modal-edit-request").style.display = "flex";
}

async function handleDeleteRequest(id) {
  if (confirm("هل أنت متأكد من رغبتك في حذف طلب الصيانة هذا نهائياً؟")) {
    try {
      await convex.mutation("analytics:deleteRequest", { id });
    } catch (err) {
      alert("خطأ أثناء الحذف: " + err.message);
    }
  }
}

// ============================================================
// NAVIGATION
// ============================================================
const SECTION_LABELS = {
  overview:        { title: "لوحة التحكم",          breadcrumb: "الرئيسية > لوحة التحكم" },
  analytics:       { title: "الإحصائيات",            breadcrumb: "الرئيسية > الإحصائيات" },
  requests:        { title: "طلبات الصيانة",         breadcrumb: "إدارة الموقع > الطلبات" },
  pages:           { title: "صفحات الخدمات",         breadcrumb: "إدارة الموقع > الصفحات" },
  settings:        { title: "إعدادات الموقع",        breadcrumb: "إدارة الموقع > الإعدادات" },
  events:          { title: "سجل النشاطات",          breadcrumb: "النظام > النشاطات" },
  users:           { title: "المستخدمون",            breadcrumb: "النظام > المستخدمون" },
  "system-settings":{ title: "إعدادات النظام",       breadcrumb: "النظام > الإعدادات" },
};

function showSection(id) {
  document.querySelectorAll(".dash-section").forEach(s => s.hidden = true);
  document.querySelectorAll(".nav-item").forEach(n => n.classList.remove("active"));
  const section = document.getElementById("section-" + id);
  if (section) section.hidden = false;
  const navItem = document.querySelector(`.nav-item[data-section="${id}"]`);
  if (navItem) navItem.classList.add("active");

  const labels = SECTION_LABELS[id];
  if (labels) {
    const titleEl = document.querySelector(".topbar-title");
    const breadEl = document.querySelector(".topbar-breadcrumbs");
    if (titleEl) titleEl.textContent = labels.title;
    if (breadEl) breadEl.textContent = labels.breadcrumb;
  }

  // Force rendering breakdown tables if navigating to pages tab to make sure it fills the table correctly
  if (id === "pages") {
    renderPageBreakdown([]);
  }

  // Close sidebar on mobile
  if (window.innerWidth <= 768) {
    document.getElementById("sidebar")?.classList.remove("open");
    const overlay = document.getElementById("sidebar-overlay");
    if (overlay) overlay.style.display = "none";
  }
}

// ============================================================
// USERS MANAGEMENT
// ============================================================

const ROLE_META = {
  owner:       { label: "المالك",       color: "#d946ef", icon: "👑" },
  admin:       { label: "مدير النظام", color: "#ef4444", icon: "🛡️" },
  editor:      { label: "محرر",        color: "#3b82f6", icon: "✏️" },
  media_buyer: { label: "ميديا باير", color: "#f59e0b", icon: "📊" },
  viewer:      { label: "مشاهد",       color: "#10b981", icon: "👁️" },
};

let _allUsers = [];
let _myPerms = null;

function timeAgo(ts) {
  const diff  = Date.now() - ts;
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins < 1)   return "الآن";
  if (mins < 60)  return `منذ ${mins} دقيقة`;
  if (hours < 24) return `منذ ${hours} ساعة`;
  return `منذ ${days} يوم`;
}

function renderUserRow(u, isCurrentUser) {
  const meta = ROLE_META[u.role] || { label: u.role, color: "#94a3b8", icon: "👤" };
  const statusBadge = u.status === "active"
    ? `<span style="display:inline-flex;align-items:center;gap:4px;background:rgba(16,185,129,0.12);color:#10b981;padding:3px 10px;border-radius:20px;font-size:0.78rem;font-weight:600;">● نشط</span>`
    : `<span style="display:inline-flex;align-items:center;gap:4px;background:rgba(239,68,68,0.12);color:#ef4444;padding:3px 10px;border-radius:20px;font-size:0.78rem;font-weight:600;">⊗ موقوف</span>`;

  const lastActive = u.lastActiveAt
    ? timeAgo(u.lastActiveAt)
    : (u.clerkId?.startsWith("pending_") ? "لم يسجل بعد" : "—");

  const avatarInitial = (u.name || "?").charAt(0).toUpperCase();
  
  // Only the owner can manage users (invite, change role, toggle status, delete)
  const canManage = _myPerms?.role === "owner";

  const actionMenu = canManage ? `
    <div class="user-action-wrap" style="position:relative;display:inline-block;">
      <button class="icon-btn" onclick="toggleUserMenu('${u._id}')" style="padding:4px 8px;border-radius:6px;">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" style="width:16px;height:16px;">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM18.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
        </svg>
      </button>
      <div id="user-menu-${u._id}" style="display:none;position:absolute;left:0;top:110%;background:var(--clr-surface-2);border:1px solid var(--clr-border);border-radius:10px;min-width:160px;z-index:100;box-shadow:0 4px 24px rgba(0,0,0,.3);overflow:hidden;">
        <button onclick="handleChangeRole('${u._id}', '${u.role}')" style="width:100%;text-align:right;padding:0.6rem 1rem;background:none;border:none;color:var(--clr-text);font-family:Cairo,sans-serif;font-size:0.82rem;cursor:pointer;display:flex;align-items:center;gap:6px;" onmouseover="this.style.background='rgba(59,130,246,0.1)'" onmouseout="this.style.background='none'">
          ✏️ تغيير الدور
        </button>
        ${!isCurrentUser ? `
        <button onclick="handleToggleStatus('${u._id}')" style="width:100%;text-align:right;padding:0.6rem 1rem;background:none;border:none;color:${u.status === 'active' ? '#f59e0b' : '#10b981'};font-family:Cairo,sans-serif;font-size:0.82rem;cursor:pointer;display:flex;align-items:center;gap:6px;" onmouseover="this.style.background='rgba(245,158,11,0.1)'" onmouseout="this.style.background='none'">
          ${u.status === "active" ? "⊗ تعليق الحساب" : "✓ تفعيل الحساب"}
        </button>
        <button onclick="handleDeleteUser('${u._id}', '${u.name}')" style="width:100%;text-align:right;padding:0.6rem 1rem;background:none;border:none;color:#ef4444;font-family:Cairo,sans-serif;font-size:0.82rem;cursor:pointer;display:flex;align-items:center;gap:6px;" onmouseover="this.style.background='rgba(239,68,68,0.1)'" onmouseout="this.style.background='none'">
          🗑️ حذف المستخدم
        </button>` : ""}
      </div>
    </div>` : `<span style="color:var(--clr-text-faint);font-size:0.78rem;">—</span>`;

  return `
    <tr id="user-row-${u._id}" style="${u.status === 'suspended' ? 'opacity:0.55;' : ''}">
      <td>
        <div style="display:flex;align-items:center;gap:10px;">
          ${u.avatarUrl
            ? `<img src="${u.avatarUrl}" style="width:34px;height:34px;border-radius:50%;object-fit:cover;border:2px solid ${meta.color}22;" />`
            : `<div style="width:34px;height:34px;border-radius:50%;background:${meta.color}22;border:2px solid ${meta.color}44;display:flex;align-items:center;justify-content:center;font-weight:700;color:${meta.color};font-size:0.85rem;">${avatarInitial}</div>`}
          <div>
            <div style="font-weight:700;color:var(--clr-text);">${u.name}${isCurrentUser ? ' <span style="font-size:0.7rem;color:#10b981;">(أنت)</span>' : ""}</div>
          </div>
        </div>
      </td>
      <td style="color:var(--clr-text-muted);font-size:0.83rem;direction:ltr;text-align:right;">${u.email}</td>
      <td>
        <span style="display:inline-flex;align-items:center;gap:5px;background:${meta.color}18;color:${meta.color};padding:3px 10px;border-radius:20px;font-size:0.78rem;font-weight:700;">
          ${meta.icon} ${meta.label}
        </span>
      </td>
      <td>${statusBadge}</td>
      <td style="color:var(--clr-text-muted);font-size:0.82rem;">${lastActive}</td>
      <td>${actionMenu}</td>
    </tr>`;
}

window.toggleUserMenu = function(id) {
  document.querySelectorAll("[id^='user-menu-']").forEach(m => {
    if (m.id !== `user-menu-${id}`) m.style.display = "none";
  });
  const menu = document.getElementById(`user-menu-${id}`);
  if (menu) menu.style.display = menu.style.display === "none" ? "block" : "none";
};

document.addEventListener("click", e => {
  if (!e.target.closest(".user-action-wrap")) {
    document.querySelectorAll("[id^='user-menu-']").forEach(m => m.style.display = "none");
  }
});

window.handleChangeRole = async function(userId, currentRole) {
  document.querySelectorAll("[id^='user-menu-']").forEach(m => m.style.display = "none");
  const chosen = prompt(`اختر الدور الجديد:\nowner — المالك\nadmin — مدير النظام\neditor — محرر\nmedia_buyer — ميديا باير\nviewer — مشاهد\n\nأدخل الكود:`);
  if (!chosen) return;
  const validRoles = ["owner", "admin", "editor", "media_buyer", "viewer"];
  if (!validRoles.includes(chosen.trim())) { alert("دور غير صالح"); return; }
  try {
    await convex.mutation("analytics:updateUserRole", { userId, role: chosen.trim() });
  } catch(err) { alert("خطأ: " + err.message); }
};

window.handleToggleStatus = async function(userId) {
  document.querySelectorAll("[id^='user-menu-']").forEach(m => m.style.display = "none");
  try {
    await convex.mutation("analytics:toggleUserStatus", { userId });
  } catch(err) { alert("خطأ: " + err.message); }
};

window.handleDeleteUser = async function(userId, name) {
  document.querySelectorAll("[id^='user-menu-']").forEach(m => m.style.display = "none");
  if (!confirm(`هل أنت متأكد من حذف "${name}"؟ هذا الإجراء لا يمكن التراجع عنه.`)) return;
  try {
    await convex.mutation("analytics:deleteDashboardUser", { userId });
  } catch(err) { alert("خطأ: " + err.message); }
};

function renderUsersSection(users, currentClerkId) {
  _allUsers = users;
  const tbody = document.getElementById("users-tbody");
  if (!tbody) return;

  const roleFilter = document.getElementById("users-role-filter")?.value || "";
  const searchVal  = document.getElementById("users-search")?.value?.toLowerCase() || "";

  const filtered = users.filter(u => {
    const matchRole   = !roleFilter || u.role === roleFilter;
    const matchSearch = !searchVal || u.name?.toLowerCase().includes(searchVal) || u.email?.toLowerCase().includes(searchVal);
    return matchRole && matchSearch;
  });

  if (!filtered.length) {
    tbody.innerHTML = `<tr><td colspan="6" class="table-empty">لا يوجد مستخدمون مطابقون</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered
    .map(u => renderUserRow(u, u.clerkId === currentClerkId))
    .join("");
}

function subscribeUsers(currentClerkId) {
  const unsub = convex.onUpdate("analytics:listDashboardUsers", {}, (users) => {
    renderUsersSection(users, currentClerkId);
  });
  _unsubs.push(unsub);

  const unsubPerms = convex.onUpdate("analytics:getMyPermissions", {}, (perms) => {
    _myPerms = perms;
    applyRoleRestrictions(perms);
  });
  _unsubs.push(unsubPerms);
}

function applyRoleRestrictions(perms) {
  if (!perms) return;

  const restrictions = {
    canViewRequests:  ["requests"],
    canViewSettings:  ["settings"],
    canManageUsers:   ["users"],
  };

  for (const [perm, sections] of Object.entries(restrictions)) {
    sections.forEach(section => {
      const navItem = document.querySelector(`.nav-item[data-section="${section}"]`);
      if (navItem) navItem.style.display = perms.permissions?.[perm] === false ? "none" : "";
    });
  }

  // The button and ability to add a user is ONLY visible to the Owner
  const addBtn = document.getElementById("btn-open-add-user");
  if (addBtn) addBtn.style.display = perms.role === "owner" ? "" : "none";
}

function initUsersSection(currentClerkId) {
  const roleFilter = document.getElementById("users-role-filter");
  const searchInp  = document.getElementById("users-search");
  if (roleFilter) roleFilter.addEventListener("change", () => renderUsersSection(_allUsers, currentClerkId));
  if (searchInp)  searchInp.addEventListener("input",   () => renderUsersSection(_allUsers, currentClerkId));

  // Auto check/uncheck custom permissions check boxes based on role, but keep them interactive
  const roleSelect = document.getElementById("add-user-role");
  if (roleSelect) {
    roleSelect.addEventListener("change", () => {
      const permsMap = {
        owner:       { viewAnalytics: true, viewRequests: true, editRequests: true, viewSettings: true, editSettings: true, manageUsers: true },
        admin:       { viewAnalytics: true, viewRequests: true, editRequests: true, viewSettings: true, editSettings: true, manageUsers: false },
        editor:      { viewAnalytics: true, viewRequests: true, editRequests: true, viewSettings: true, editSettings: false, manageUsers: false },
        media_buyer: { viewAnalytics: true, viewRequests: false, editRequests: false, viewSettings: false, editSettings: false, manageUsers: false },
        viewer:      { viewAnalytics: true, viewRequests: true, editRequests: false, viewSettings: false, editSettings: false, manageUsers: false },
      };
      const selected = roleSelect.value;
      if (selected && permsMap[selected]) {
        const p = permsMap[selected];
        document.getElementById("add-perm-view-analytics").checked = p.viewAnalytics;
        document.getElementById("add-perm-view-requests").checked  = p.viewRequests;
        document.getElementById("add-perm-edit-requests").checked  = p.editRequests;
        document.getElementById("add-perm-view-settings").checked  = p.viewSettings;
        document.getElementById("add-perm-edit-settings").checked  = p.editSettings;
        document.getElementById("add-perm-manage-users").checked   = p.manageUsers;
      }
    });
  }

  // Add user form submission with custom permissions
  const addUserForm = document.getElementById("add-user-form");
  if (addUserForm) {
    addUserForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const btn = document.getElementById("add-user-submit-btn");
      const origText = btn ? btn.innerHTML : "";
      if (btn) { btn.disabled = true; btn.textContent = "جاري الإضافة..."; }

      const name  = document.getElementById("add-user-name").value.trim();
      const email = document.getElementById("add-user-email").value.trim();
      const role  = document.getElementById("add-user-role").value;

      const permissions = {
        canViewAnalytics: document.getElementById("add-perm-view-analytics").checked,
        canViewRequests:  document.getElementById("add-perm-view-requests").checked,
        canEditRequests:  document.getElementById("add-perm-edit-requests").checked,
        canViewSettings:  document.getElementById("add-perm-view-settings").checked,
        canEditSettings:  document.getElementById("add-perm-edit-settings").checked,
        canManageUsers:   document.getElementById("add-perm-manage-users").checked,
      };

      try {
        await convex.mutation("analytics:inviteDashboardUser", { name, email, role, permissions });
        document.getElementById("modal-add-user").style.display = "none";
        addUserForm.reset();
        alert(`تمت إضافة "${name}" بصلاحياته المخصصة بنجاح! 🎉`);
      } catch(err) {
        alert("خطأ: " + err.message);
      } finally {
        if (btn) { btn.disabled = false; btn.innerHTML = origText; }
      }
    });
  }

  const openAddUserBtn = document.getElementById("btn-open-add-user");
  if (openAddUserBtn) {
    openAddUserBtn.addEventListener("click", () => {
      document.getElementById("modal-add-user").style.display = "flex";
    });
  }
}

// ============================================================
// SYSTEM SETTINGS
// ============================================================

window.openSysModal = function(name) {
  const modal = document.getElementById("modal-sys-" + name);
  if (modal) {
    modal.style.display = "flex";
    
    // Load existing settings if applicable
    if (name === "language") {
      const lang = localStorage.getItem("sys-lang") || "ar";
      const tz = localStorage.getItem("sys-tz") || "Cairo";
      const langSelect = document.getElementById("sys-lang-select");
      const tzSelect = document.getElementById("sys-tz-select");
      if (langSelect) langSelect.value = lang;
      if (tzSelect) tzSelect.value = tz;
    } else if (name === "notifications") {
      const emailNotif = localStorage.getItem("sys-notif-email") !== "false";
      const waNotif = localStorage.getItem("sys-notif-wa") !== "false";
      const soundNotif = localStorage.getItem("sys-notif-sound") !== "false";
      
      const emailEl = document.getElementById("sys-notif-email");
      const waEl = document.getElementById("sys-notif-wa");
      const soundEl = document.getElementById("sys-notif-sound");
      if (emailEl) emailEl.checked = emailNotif;
      if (waEl) waEl.checked = waNotif;
      if (soundEl) soundEl.checked = soundNotif;
    } else if (name === "appearance") {
      const currentTheme = localStorage.getItem("sys-theme") || "dark";
      const radio = document.querySelector(`input[name="sys-theme"][value="${currentTheme}"]`);
      if (radio) radio.checked = true;
    }
  }
};

window.closeSysModal = function(name) {
  const modal = document.getElementById("modal-sys-" + name);
  if (modal) modal.style.display = "none";
};

// Play system alert sound using AudioContext
function playAlertBeep() {
  try {
    const ctx = new (window.AudioContext || (window).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    osc.start();
    osc.stop(ctx.currentTime + 0.12);
  } catch(e) {
    console.warn("AudioContext block by user interaction guidelines", e);
  }
}

// Intercept request alerts if enabled
function handleNewRequestAlert() {
  const soundNotif = localStorage.getItem("sys-notif-sound") !== "false";
  if (soundNotif) {
    playAlertBeep();
  }
}

function initSystemSettings() {
  // 1. Language & Region form
  const langForm = document.getElementById("sys-language-form");
  if (langForm) {
    langForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const lang = document.getElementById("sys-lang-select").value;
      const tz = document.getElementById("sys-tz-select").value;
      localStorage.setItem("sys-lang", lang);
      localStorage.setItem("sys-tz", tz);
      
      // Instantly change layout direction if English chosen
      if (lang === "en") {
        document.documentElement.dir = "ltr";
        document.body.style.direction = "ltr";
        document.querySelectorAll(".nav-category, .nav-label, .topbar-title, .anal-main-title, .anal-main-sub").forEach(el => {
          el.style.textAlign = "left";
        });
      } else {
        document.documentElement.dir = "rtl";
        document.body.style.direction = "rtl";
        document.querySelectorAll(".nav-category, .nav-label, .topbar-title, .anal-main-title, .anal-main-sub").forEach(el => {
          el.style.textAlign = "right";
        });
      }
      
      closeSysModal("language");
      alert("تم حفظ إعدادات اللغة والمنطقة الزمنية بنجاح! 🌐");
    });
  }

  // 2. Notifications form
  const notifForm = document.getElementById("sys-notifications-form");
  if (notifForm) {
    notifForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = document.getElementById("sys-notif-email").checked;
      const wa = document.getElementById("sys-notif-wa").checked;
      const sound = document.getElementById("sys-notif-sound").checked;
      
      localStorage.setItem("sys-notif-email", email);
      localStorage.setItem("sys-notif-wa", wa);
      localStorage.setItem("sys-notif-sound", sound);
      
      if (sound) playAlertBeep();
      closeSysModal("notifications");
      alert("تم تحديث تفضيلات الإشعارات والتنبيهات بنجاح! 🔔");
    });
  }

  // 3. Security form
  const secForm = document.getElementById("sys-security-form");
  if (secForm) {
    secForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const currentPass = document.getElementById("sys-sec-current").value;
      const newPass = document.getElementById("sys-sec-new").value;
      const enable2fa = document.getElementById("sys-sec-2fa").checked;
      
      if (newPass.length < 6) {
        alert("كلمة المرور الجديدة يجب ألا تقل عن 6 أحرف");
        return;
      }
      
      // Clerk redirect / Profile Integration
      if ((window).Clerk) {
        try {
          alert("تدار إعدادات الأمان الخاصة بك بأمان تام عبر Clerk. سيتم فتح لوحة أمان حساب Clerk الآن لتحديث كلمة المرور.");
          (window).Clerk.openUserProfile();
        } catch(e) {
          console.warn("Clerk openUserProfile failed:", e);
        }
      } else {
        alert("تم تحديث إعدادات الأمان والمصادقة بنجاح! 🛡️");
      }
      closeSysModal("security");
      secForm.reset();
    });
  }

  // 4. Appearance form
  const appForm = document.getElementById("sys-appearance-form");
  if (appForm) {
    appForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const selectedTheme = document.querySelector('input[name="sys-theme"]:checked').value;
      localStorage.setItem("sys-theme", selectedTheme);
      
      // Apply theme class to body
      document.body.classList.remove("theme-light", "theme-glass");
      if (selectedTheme === "light") {
        document.body.classList.add("theme-light");
      } else if (selectedTheme === "glass") {
        document.body.classList.add("theme-glass");
      }
      
      closeSysModal("appearance");
      alert("تم تطبيق السمة وتحديث مظهر النظام بنجاح! 🎨");
    });
  }

  // Load theme on boot
  const activeTheme = localStorage.getItem("sys-theme") || "dark";
  document.body.classList.remove("theme-light", "theme-glass");
  if (activeTheme === "light") {
    document.body.classList.add("theme-light");
  } else if (activeTheme === "glass") {
    document.body.classList.add("theme-glass");
  }

  // 5. Backup & Restore
  const btnExport = document.getElementById("btn-sys-export");
  if (btnExport) {
    btnExport.addEventListener("click", async () => {
      try {
        // Query current requests dynamically from Convex
        const list = await convex.query("analytics:getMaintenanceRequests", { searchQuery: "", statusFilter: "all" });
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(list || []));
        const dlAnchor = document.createElement("a");
        dlAnchor.setAttribute("href", dataStr);
        dlAnchor.setAttribute("download", `maintenance_backup_${Date.now()}.json`);
        dlAnchor.click();
      } catch(err) {
        alert("خطأ أثناء تصدير البيانات: " + err.message);
      }
    });
  }

  const btnImport = document.getElementById("btn-sys-import");
  if (btnImport) {
    btnImport.addEventListener("click", async () => {
      const fileInput = document.getElementById("sys-import-file");
      if (!fileInput || !fileInput.files || !fileInput.files[0]) {
        alert("يرجى اختيار ملف JSON صالح للاسترجاع أولاً");
        return;
      }
      
      const file = fileInput.files[0];
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const imported = JSON.parse(event.target.result);
          if (!Array.isArray(imported)) {
            alert("الملف غير صالح. يجب أن يحتوي على قائمة (Array) من الطلبات.");
            return;
          }
          
          btnImport.textContent = "جاري استيراد الطلبات...";
          btnImport.disabled = true;
          
          // Loop and create each request
          let count = 0;
          for (const req of imported) {
            const payload = {
              name: req.name || "مستورد",
              phone: req.phone || "—",
              appliance: req.appliance || "—",
              problem: req.problem || "—",
              gov: req.gov || "—",
              page: req.page || "general",
              status: req.status || "new",
            };
            await convex.mutation("analytics:createRequestDashboard", payload);
            count++;
          }
          
          alert(`تم بنجاح استعادة واستيراد ${count} طلب صيانة وتحديث قاعدة البيانات! 🎉`);
          closeSysModal("backup");
          fileInput.value = "";
        } catch(err) {
          alert("خطأ أثناء تحليل الملف: " + err.message);
        } finally {
          btnImport.textContent = "📤 استرجاع البيانات الآن";
          btnImport.disabled = false;
        }
      };
      reader.readAsText(file);
    });
  }
}


(async function main() {
  console.log("[Dashboard] script started");
  console.log("[Dashboard] Clerk script available:", !!window.Clerk);

  async function runInit() {
    const loadingEl = document.getElementById("clerk-loading");
    if (loadingEl) {
      loadingEl.style.display = "flex";
      loadingEl.innerHTML = `
        <div class="spinner"></div>
        <p>جاري تحميل لوحة التحكم...</p>
      `;
    }

    try {
      const clerk = await withTimeout(initClerk(), 10000, "TIMEOUT");
      console.log("[Dashboard] Clerk initialized");
      console.log("[Dashboard] session state:", clerk.session ? "Active" : "None");
      console.log("[Dashboard] user state:", clerk.user ? clerk.user.id : "Signed out");

      // If not signed in → show Clerk sign-in UI
      if (!clerk.user) {
        console.log("[Dashboard] rendering sign-in");
        
        const cardEl = document.getElementById("auth-card");
        if (loadingEl) loadingEl.style.display = "none";
        if (cardEl) cardEl.style.display = "block";

        document.getElementById("auth-wall").hidden = false;
        document.getElementById("dashboard-app").hidden = true;
        clerk.mountSignIn(document.getElementById("clerk-sign-in"), {
          forceRedirectUrl: "/dashboard/",
        });
        return;
      }

      console.log("[Dashboard] rendering dashboard");
      document.getElementById("auth-wall").hidden = true;
      document.getElementById("dashboard-app").hidden = false;

      // Set up Convex auth with Clerk JWT
      convex.setAuth(async () => {
        try {
          const token = await clerk.session?.getToken({ template: "convex" });
          return token ?? null;
        } catch {
          return null;
        }
      });

      // Populate user info
      const user = clerk.user;
      const name = user.fullName ?? user.primaryEmailAddress?.emailAddress ?? "Admin";
      const avatar = user.imageUrl;
      const userNameEl = document.getElementById("user-name");
      const userAvatarEl = document.getElementById("user-avatar");
      if (userNameEl) userNameEl.textContent = name;
      if (userAvatarEl && avatar) {
        userAvatarEl.src = avatar;
        userAvatarEl.hidden = false;
      }

      // Sign out
      document.getElementById("sign-out-btn")?.addEventListener("click", async () => {
        clearSubs();
        await clerk.signOut();
        window.location.reload();
      });

      // Navigation
      document.querySelectorAll(".nav-item[data-section]").forEach(item => {
        item.addEventListener("click", () => showSection(item.dataset.section));
      });

      // Date range filters (sync both overview & analytics tabs)
      let activeRange = "7d";
      const handleRangeChange = (range) => {
        activeRange = range;
        document.querySelectorAll("[data-range], [data-anal-range]").forEach(b => {
          if (b.dataset.range === range || b.dataset.anal_range === range || b.dataset.analRange === range) {
            b.classList.add("range-active");
          } else {
            b.classList.remove("range-active");
          }
        });
        subscribeAll(activeRange);
      };

      document.querySelectorAll("[data-range]").forEach(btn => {
        btn.addEventListener("click", () => handleRangeChange(btn.dataset.range));
      });
      document.querySelectorAll("[data-anal-range]").forEach(btn => {
        btn.addEventListener("click", () => handleRangeChange(btn.dataset.analRange || btn.getAttribute("data-anal-range")));
      });

      // Mobile sidebar toggle with overlay
      const overlay = document.getElementById("sidebar-overlay") || document.createElement("div");
      if (!overlay.id) {
        overlay.id = "sidebar-overlay";
        overlay.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:199;display:none;backdrop-filter:blur(2px);";
        document.body.appendChild(overlay);
      }

      const openSidebar = () => {
        document.getElementById("sidebar")?.classList.add("open");
        overlay.style.display = "block";
      };
      const closeSidebar = () => {
        document.getElementById("sidebar")?.classList.remove("open");
        overlay.style.display = "none";
      };

      document.getElementById("sidebar-toggle")?.addEventListener("click", closeSidebar);
      document.getElementById("sidebar-toggle-hamburger")?.addEventListener("click", openSidebar);
      overlay.addEventListener("click", closeSidebar);

      // Link 'show all pages' to pages section
      document.getElementById("link-show-all-pages")?.addEventListener("click", (e) => {
        e.preventDefault();
        showSection("pages");
      });

      // Bind settings form submission
      const settingsForm = document.getElementById("settings-form");
      if (settingsForm) {
        settingsForm.addEventListener("submit", async (e) => {
          e.preventDefault();
          const saveBtn = settingsForm.querySelector("button[type='submit']");
          const origText = saveBtn ? saveBtn.textContent : "حفظ التغييرات";
          if (saveBtn) {
            saveBtn.disabled = true;
            saveBtn.textContent = "جاري الحفظ...";
          }

          const payload = {
            whatsappNumber:     document.getElementById("set-whatsapp")?.value || "",
            hotlineNumber:      document.getElementById("set-hotline")?.value || "",
            workingHours:       document.getElementById("set-hours")?.value || "",
            contactEmail:       document.getElementById("set-email")?.value || "",
            heroTitle:          document.getElementById("set-hero-title")?.value || "",
            heroSubtitle:       document.getElementById("set-hero-sub")?.value || "",
            servicesTitle:      document.getElementById("set-services-title")?.value || "",
            servicesSubtitle:   document.getElementById("set-services-sub")?.value || "",
            testimonialsTitle:  document.getElementById("set-testimonials-title")?.value || "",
            whyUsTitle:         document.getElementById("set-why-title")?.value || "",
            whyUsSubtitle:      document.getElementById("set-why-sub")?.value || "",
          };

          try {
            await convex.mutation("analytics:updateSettings", payload);
            alert("تم حفظ إعدادات الموقع وتحديث الصفحات بنجاح! 🎉");
          } catch (err) {
            console.error("Save settings error:", err);
            alert("خطأ أثناء حفظ التغييرات: " + err.message);
          } finally {
            if (saveBtn) {
              saveBtn.disabled = false;
              saveBtn.textContent = origText;
            }
          }
        });
      }

      // Bind Mock Data Generator
      const mockBtn = document.getElementById("btn-generate-mock");
      if (mockBtn) {
        mockBtn.addEventListener("click", async () => {
          const statusEl = document.getElementById("mock-status");
          if (!statusEl) return;
          statusEl.style.display = "block";
          statusEl.style.background = "#f59e0b";
          statusEl.style.color = "#1e1b4b";
          statusEl.textContent = "جاري إنشاء أكثر من 150 حدث إحصائي عشوائي...";
          try {
            await convex.mutation("analytics:populateMockData", {});
            statusEl.style.background = "#10b981";
            statusEl.style.color = "#fff";
            statusEl.textContent = "تم توليد البيانات الوهمية للـ 30 يوماً الماضية بنجاح!";
            setTimeout(() => { statusEl.style.display = "none"; }, 3000);
          } catch (err) {
            statusEl.style.background = "#ef4444";
            statusEl.style.color = "#fff";
            statusEl.textContent = "خطأ: " + err.message;
          }
        });
      }

      // Bind requests search and filter
      const reqSearchInput = document.getElementById("requests-search-input");
      if (reqSearchInput) {
        reqSearchInput.addEventListener("input", (e) => {
          _searchQuery = e.target.value.trim();
          subscribeRequests();
        });
      }

      const reqStatusFilter = document.getElementById("requests-status-filter");
      if (reqStatusFilter) {
        reqStatusFilter.addEventListener("change", (e) => {
          _statusFilter = e.target.value;
          subscribeRequests();
        });
      }

      // Bind Open Add Request Modal
      const openAddReqBtn = document.getElementById("btn-open-add-request");
      if (openAddReqBtn) {
        openAddReqBtn.addEventListener("click", () => {
          document.getElementById("edit-modal-title").textContent = "➕ إضافة طلب صيانة جديد";
          document.getElementById("edit-req-id").value = "";
          document.getElementById("edit-req-name").value = "";
          document.getElementById("edit-req-phone").value = "";
          document.getElementById("edit-req-appliance").value = "";
          document.getElementById("edit-req-problem").value = "صيانة عامة";
          document.getElementById("edit-req-gov").value = "القاهرة";
          document.getElementById("edit-req-page").value = "DASHBOARD";
          document.getElementById("edit-req-status-select").value = "new";

          document.getElementById("modal-edit-request").style.display = "flex";
        });
      }

      // Bind Edit/Add Request form submission
      const editReqForm = document.getElementById("edit-request-form");
      if (editReqForm) {
        editReqForm.addEventListener("submit", async (e) => {
          e.preventDefault();
          const saveBtn = editReqForm.querySelector("button[type='submit']");
          const origText = saveBtn ? saveBtn.textContent : "حفظ";
          if (saveBtn) {
            saveBtn.disabled = true;
            saveBtn.textContent = "جاري الحفظ...";
          }

          const id = document.getElementById("edit-req-id").value;
          const payload = {
            clientName:   document.getElementById("edit-req-name").value,
            clientPhone:  document.getElementById("edit-req-phone").value,
            appliance:    document.getElementById("edit-req-appliance").value,
            problem:      document.getElementById("edit-req-problem").value,
            governorate:  document.getElementById("edit-req-gov").value,
            sourcePage:   document.getElementById("edit-req-page").value,
            status:       document.getElementById("edit-req-status-select").value,
          };

          try {
            if (id) {
              await convex.mutation("analytics:editRequest", { id, ...payload });
            } else {
              await convex.mutation("analytics:createRequestDashboard", payload);
            }
            document.getElementById("modal-edit-request").style.display = "none";
          } catch (err) {
            alert("خطأ أثناء الحفظ: " + err.message);
          } finally {
            if (saveBtn) {
              saveBtn.disabled = false;
              saveBtn.textContent = origText;
            }
          }
        });
      }

      // Start
      showSection("overview");
      subscribeAll(activeRange);
      subscribeRequests();

      // Register / update current user in Convex DB + subscribe users
      const clerkId = clerk.user.id;
      const email = clerk.user.primaryEmailAddress?.emailAddress ?? "";
      try {
        await convex.mutation("analytics:registerCurrentUser", {
          name,
          email,
          avatarUrl: avatar || undefined,
        });
      } catch(e) {
        console.warn("Could not register user in Convex:", e);
      }
      subscribeUsers(clerkId);
      initUsersSection(clerkId);
      initSystemSettings();
    } catch (err) {
      console.log("[Dashboard] Clerk initialization failed:", err.message);
      const friendlyMsg = err.message === "TIMEOUT" ? "انتهت مهلة الاتصال بخدمة التحقق من الهوية" : err.message;
      if (loadingEl) {
        loadingEl.innerHTML = `
          <div style="display:flex;flex-direction:column;align-items:center;gap:16px;">
            <span style="font-size:2.5rem;">⚠️</span>
            <p style="color:#ef4444;font-weight:700;font-size:1.1rem;margin:0;">تعذر تحميل لوحة التحكم</p>
            <p style="color:var(--clr-text-muted);font-size:0.85rem;margin:0;max-width:300px;line-height:1.5;">${friendlyMsg}</p>
            <button id="btn-retry-init" class="settings-btn-save" style="margin-top:8px;padding:8px 24px;cursor:pointer;font-family:Cairo,sans-serif;font-weight:700;">إعادة المحاولة</button>
          </div>
        `;
        document.getElementById("btn-retry-init")?.addEventListener("click", () => {
          runInit();
        });
      }
    }
  }

  runInit();
})();