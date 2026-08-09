/**
 * tracker.js — الهندسية للتوكيلات
 * Anonymous analytics tracker for the public website.
 *
 * - Tracks: page_view, whatsapp_click, hotline_click, cta_click, form_submit
 * - Stores anonymous visitorId in localStorage (no PII)
 * - Stores sessionId in sessionStorage
 * - All requests are async and fire-and-forget (never block the user)
 * - If Convex is unreachable, the website continues normally
 *
 * Usage: Add before </body> on every public HTML page:
 *   <script src="/tracker.js" defer></script>
 *
 * Config: Set window.TRACKER_CONVEX_URL before loading this script,
 *         or it will use the default from convex.json after deployment.
 */
(function () {
  "use strict";

  /* ------------------------------------------------------------------
     CONFIG — set window.TRACKER_CONVEX_URL in a <script> block before
     loading this file, e.g.:
       <script>window.TRACKER_CONVEX_URL='https://xyz.convex.site';</script>
     ------------------------------------------------------------------ */
  const CONVEX_URL =
    (typeof window !== "undefined" && window.TRACKER_CONVEX_URL) ||
    "https://loyal-starfish-330.eu-west-1.convex.site"; // e.g. https://happy-animal-123.convex.site

  const ENDPOINT = CONVEX_URL.replace(/\/$/, "") + "/track";

  /* ------------------------------------------------------------------
     VISITOR & SESSION IDs
     visitorId → localStorage (persists across sessions)
     sessionId → sessionStorage (resets when tab/browser closes)
     ------------------------------------------------------------------ */
  function getId(storage, key) {
    try {
      let id = storage.getItem(key);
      if (!id) {
        id =
          "v_" +
          Date.now().toString(36) +
          "_" +
          Math.random().toString(36).slice(2, 10);
        storage.setItem(key, id);
      }
      return id;
    } catch {
      // localStorage/sessionStorage might be blocked (private mode etc.)
      return "anon_" + Math.random().toString(36).slice(2, 10);
    }
  }

  const visitorId = getId(localStorage, "_hc_vid");
  const sessionId = getId(sessionStorage, "_hc_sid");

  /* ------------------------------------------------------------------
     SEND EVENT — async, fire-and-forget
     ------------------------------------------------------------------ */
  function send(eventType, metadata) {
    // Do nothing if URL hasn't been configured yet
    if (CONVEX_URL === "REPLACE_WITH_YOUR_CONVEX_SITE_URL") return;

    const payload = {
      eventType: eventType,
      page:
        window.location.pathname +
        (window.location.search ? window.location.search : ""),
      visitorId: visitorId,
      sessionId: sessionId,
      timestamp: Date.now(),
      metadata: metadata || undefined,
    };

    // Use sendBeacon when available (best for analytics — works on page unload)
    if (navigator.sendBeacon) {
      try {
        const blob = new Blob([JSON.stringify(payload)], {
          type: "application/json",
        });
        navigator.sendBeacon(ENDPOINT, blob);
        return;
      } catch (_) {
        // fall through to fetch
      }
    }

    // Fallback: fetch with no-cors (silent, doesn't block)
    fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(function () {
      // Fail silently — analytics must never break the site
    });
  }

  /* ------------------------------------------------------------------
     1. PAGE VIEW
     Only send once per page load. Use sessionStorage to avoid duplicate
     events on SPA navigation (though this is a static site).
     ------------------------------------------------------------------ */
  (function trackPageView() {
    const key = "_hc_pv_" + window.location.pathname;
    const already = sessionStorage.getItem(key);
    if (!already) {
      sessionStorage.setItem(key, "1");
      // Short delay so it doesn't compete with critical resources
      setTimeout(function () {
        send("page_view", {
          referrer: document.referrer
            ? document.referrer.slice(0, 200)
            : undefined,
        });
      }, 300);
    }
  })();

  /* ------------------------------------------------------------------
     2. CLICK TRACKER
     Intercepts clicks using event delegation on document.
     We detect the closest meaningful ancestor anchor/button.
     ------------------------------------------------------------------ */
  document.addEventListener(
    "click",
    function (e) {
      var target = e.target;

      // Walk up DOM to find the anchor
      var anchor = null;
      var el = target;
      for (var i = 0; i < 5 && el; i++) {
        if (el.tagName === "A" || el.tagName === "BUTTON") {
          anchor = el;
          break;
        }
        el = el.parentElement;
      }
      if (!anchor) return;

      var href = anchor.getAttribute("href") || "";
      var classList = anchor.className || "";

      // Determine location from classes / position
      function getLocation() {
        // Floating buttons
        if (
          classList.includes("floating-whatsapp-btn") ||
          classList.includes("floating-call-btn")
        )
          return "floating";
        // Topbar
        if (classList.includes("topbar-hotline")) return "topbar";
        // Navbar CTA
        if (classList.includes("nav-cta")) return "navbar";
        // Mobile nav
        if (classList.includes("nav-mobile-link")) return "mobile_nav";
        // Hero
        var section = anchor.closest
          ? anchor.closest(".hero")
          : null;
        if (section) return "hero";
        // Footer
        if (anchor.closest && anchor.closest("footer")) return "footer";
        // Contact section
        if (anchor.closest && anchor.closest("#contact")) return "contact_section";
        return "page";
      }

      // --- WhatsApp ---
      if (
        href.includes("wa.me") ||
        href.includes("whatsapp.com") ||
        classList.includes("floating-whatsapp-btn")
      ) {
        send("whatsapp_click", { location: getLocation() });
        return;
      }

      // --- Hotline 16481 ---
      if (href === "tel:16481" || href.includes("tel:16481")) {
        send("hotline_click", { location: getLocation() });
        return;
      }

      // --- General CTA buttons (btn-primary, btn-secondary) ---
      if (
        classList.includes("btn-primary") ||
        classList.includes("btn-secondary") ||
        classList.includes("nav-cta") ||
        classList.includes("topbar-hotline")
      ) {
        // Don't double-count hotline or WhatsApp (already tracked above)
        if (
          href.startsWith("tel:") ||
          href.includes("wa.me")
        )
          return;

        send("cta_click", {
          location: getLocation(),
          ctaType: anchor.textContent
            ? anchor.textContent.trim().slice(0, 60)
            : undefined,
        });
      }
    },
    { passive: true }
  );

  /* ------------------------------------------------------------------
     3. INQUIRY FORM SUBMIT
     The form opens WhatsApp — track as form_submit + whatsapp_click.
     We patch the existing initInquiryForm by listening for submit on the
     form element. This fires BEFORE main.js's handler opens WhatsApp.
     ------------------------------------------------------------------ */
  document.addEventListener(
    "submit",
    function (e) {
      if (e.target && e.target.id === "inquiry-form") {
        var name =
          document.getElementById("form-name")
            ? document.getElementById("form-name").value
            : undefined;
        var phone =
          document.getElementById("form-phone")
            ? document.getElementById("form-phone").value
            : undefined;
        var appliance =
          document.getElementById("form-appliance")
            ? document.getElementById("form-appliance").value
            : undefined;
        var loc =
          document.getElementById("form-loc")
            ? document.getElementById("form-loc").value
            : undefined;

        send("form_submit", {
          location: "contact_form",
          appliance: appliance,
          governorate: loc,
          clientName: name,
          clientPhone: phone,
          problem: "صيانة عامة",
        });
        // Also count as a WhatsApp click because the form opens WhatsApp
        send("whatsapp_click", { location: "contact_form" });
      }
    },
    { passive: true }
  );

  window.HCTrack = send;

  /* ------------------------------------------------------------------
     5. DYNAMIC SETTINGS SYNC (REAL-TIME CONTROL)
     Fetches settings from Convex and updates hotline / whatsapp values
     ------------------------------------------------------------------ */
  function updateTextNodes(node, oldText, newText) {
    if (!node || !oldText || !newText) return;
    if (node.nodeType === Node.TEXT_NODE) {
      if (node.nodeValue.includes(oldText)) {
        node.nodeValue = node.nodeValue.split(oldText).join(newText);
      }
    } else {
      if (node.tagName !== "SCRIPT" && node.tagName !== "STYLE" && node.tagName !== "NOSCRIPT") {
        for (var i = 0; i < node.childNodes.length; i++) {
          updateTextNodes(node.childNodes[i], oldText, newText);
        }
      }
    }
  }

  function syncSiteSettings() {
    fetch(CONVEX_URL.replace(/\/$/, "") + "/settings")
      .then(function (r) { return r.json(); })
      .then(function (settings) {
        if (!settings) return;

        // 1. Expose WhatsApp number for main.js form submit
        window.__WHATSAPP_NUMBER__ = settings.whatsappNumber;

        // 2. Update hotline links and texts
        var defaultHotline = "16481";
        if (settings.hotlineNumber && settings.hotlineNumber !== defaultHotline) {
          // Update all tel links matching 16481
          document.querySelectorAll("a[href^='tel:']").forEach(function (a) {
            var href = a.getAttribute("href") || "";
            if (href.includes(defaultHotline)) {
              a.setAttribute("href", "tel:" + settings.hotlineNumber);
            }
          });
          // Update text nodes on the page
          updateTextNodes(document.body, defaultHotline, settings.hotlineNumber);
        }

        // 3. Update WhatsApp links matching the default phone
        var defaultWhatsapp = "201062842903";
        if (settings.whatsappNumber && settings.whatsappNumber !== defaultWhatsapp) {
          document.querySelectorAll("a[href*='wa.me'], a[href*='whatsapp.com']").forEach(function (a) {
            var href = a.getAttribute("href") || "";
            if (href.includes(defaultWhatsapp)) {
              a.setAttribute("href", href.split(defaultWhatsapp).join(settings.whatsappNumber));
            }
          });
          // Update any text references
          updateTextNodes(document.body, "01062842903", settings.whatsappNumber.replace(/^20/, "0"));
          updateTextNodes(document.body, defaultWhatsapp, settings.whatsappNumber);
        }

        // 4. Update working hours text
        var defaultHours = "السبت – الخميس: 9 ص – 10 م";
        if (settings.workingHours && settings.workingHours !== defaultHours) {
          updateTextNodes(document.body, "السبت – الخميس: 9 ص – 10 م", settings.workingHours);
          updateTextNodes(document.body, "9 ص – 10 م", settings.workingHours.replace("السبت – الخميس: ", ""));
        }

        // 5. Update Headings & Texts (Real-time CMS)
        if (settings.heroTitle) {
          var htEl = document.querySelector(".hero-title");
          if (htEl) htEl.innerHTML = settings.heroTitle;
        }
        if (settings.heroSubtitle) {
          var hsEl = document.querySelector(".hero-desc");
          if (hsEl) hsEl.textContent = settings.heroSubtitle;
        }
        if (settings.servicesTitle) {
          var stEl = document.querySelector("#services-heading") || document.querySelector(".services-overview .section-title");
          if (stEl) stEl.innerHTML = settings.servicesTitle;
        }
        if (settings.servicesSubtitle) {
          var ssEl = document.querySelector(".services-overview .section-sub-bold");
          if (ssEl) ssEl.textContent = settings.servicesSubtitle;
        }
        if (settings.testimonialsTitle) {
          var ttEl = document.querySelector("#testimonials-heading") || document.querySelector("#testimonials .section-title");
          if (ttEl) ttEl.innerHTML = settings.testimonialsTitle;
        }
        if (settings.whyUsTitle) {
          var wtEl = document.querySelector("#why-heading") || document.querySelector("#why-us .section-title");
          if (wtEl) wtEl.innerHTML = settings.whyUsTitle;
        }
        if (settings.whyUsSubtitle) {
          var wsEl = document.querySelector("#why-us .section-sub");
          if (wsEl) wsEl.textContent = settings.whyUsSubtitle;
        }
      })
      .catch(function () {
        // Fail silently
      });
  }

  // Run on DOMContentLoaded or immediately if already loaded
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", syncSiteSettings);
  } else {
    syncSiteSettings();
  }
})();
