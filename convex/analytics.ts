import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/* ================================================================
   PUBLIC MUTATION — Record an analytics event
   Called from tracker.js on the public website.
   No authentication required (public analytics ingestion).
   ================================================================ */
export const recordEvent = mutation({
  args: {
    eventType: v.string(),
    timestamp: v.number(),
    page: v.string(),
    visitorId: v.string(),
    sessionId: v.string(),
    metadata: v.optional(
      v.object({
        location: v.optional(v.string()),
        ctaType: v.optional(v.string()),
        referrer: v.optional(v.string()),
        appliance: v.optional(v.string()),
        governorate: v.optional(v.string()),
        clientName: v.optional(v.string()),
        clientPhone: v.optional(v.string()),
        problem: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    // Validate eventType whitelist — prevent arbitrary data injection
    const allowed = [
      "page_view",
      "whatsapp_click",
      "hotline_click",
      "cta_click",
      "form_submit",
    ];
    if (!allowed.includes(args.eventType)) {
      throw new Error(`Invalid eventType: ${args.eventType}`);
    }

    // Sanitize page — must start with /
    const page = args.page.startsWith("/") ? args.page : "/" + args.page;

    await ctx.db.insert("analyticsEvents", {
      ...args,
      page,
    });

    // If it's a form submission, automatically spawn a maintenance request
    if (args.eventType === "form_submit") {
      const randNum = Math.floor(1000 + Math.random() * 9000);
      const requestId = `MR-${randNum}`;
      await ctx.db.insert("maintenanceRequests", {
        requestId,
        clientName: args.metadata?.clientName ?? "عميل غير معروف",
        clientPhone: args.metadata?.clientPhone ?? "بدون رقم",
        appliance: args.metadata?.appliance ?? "جهاز غير محدد",
        problem: args.metadata?.problem ?? "صيانة عامة",
        governorate: args.metadata?.governorate ?? "غير محدد",
        sourcePage: page,
        status: "new",
        timestamp: args.timestamp,
      });
    }
  },
});

/* ================================================================
   DASHBOARD QUERY — Get KPI summary
   Requires authentication via Clerk.
   ================================================================ */
export const getSummary = query({
  args: {
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Require authentication
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    // Get all events in range
    let events = await ctx.db
      .query("analyticsEvents")
      .withIndex("by_timestamp")
      .collect();

    if (args.startDate !== undefined) {
      events = events.filter((e) => e.timestamp >= args.startDate!);
    }
    if (args.endDate !== undefined) {
      events = events.filter((e) => e.timestamp <= args.endDate!);
    }

    // Partition by type
    const pageViews    = events.filter((e) => e.eventType === "page_view");
    const whatsapp     = events.filter((e) => e.eventType === "whatsapp_click");
    const hotline      = events.filter((e) => e.eventType === "hotline_click");
    const cta          = events.filter((e) => e.eventType === "cta_click");
    const formSubmits  = events.filter((e) => e.eventType === "form_submit");

    // Unique visitors (by visitorId) — based on page_view events
    const uniqueVisitorIds = new Set(pageViews.map((e) => e.visitorId));
    const totalVisitors    = uniqueVisitorIds.size;

    // Unique visitors who performed any CTA
    const ctaEvents        = [...whatsapp, ...hotline, ...cta, ...formSubmits];
    const ctaVisitorIds    = new Set(ctaEvents.map((e) => e.visitorId));
    const ctaUniqueVisitors = ctaVisitorIds.size;

    // Conversion rate
    const conversionRate =
      totalVisitors > 0
        ? ((ctaUniqueVisitors / totalVisitors) * 100).toFixed(2)
        : "0.00";

    return {
      totalVisitors,
      totalPageViews: pageViews.length,
      whatsappClicks: whatsapp.length,
      hotlineClicks: hotline.length,
      ctaClicks: cta.length,
      formSubmits: formSubmits.length,
      totalCTAInteractions: ctaEvents.length,
      conversionRate: parseFloat(conversionRate),
    };
  },
});

/* ================================================================
   DASHBOARD QUERY — Get time series data for chart
   Returns daily counts for the given range.
   ================================================================ */
export const getTimeSeries = query({
  args: {
    startDate: v.number(),
    endDate: v.number(),
    eventType: v.optional(v.string()), // kept for backwards compatibility
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    let events = await ctx.db
      .query("analyticsEvents")
      .withIndex("by_timestamp")
      .collect();

    events = events.filter(
      (e) =>
        e.timestamp >= args.startDate && e.timestamp <= args.endDate
    );

    // Group by day (YYYY-MM-DD)
    const byDay: Record<string, { visitors: number; interactions: number; requests: number; count: number }> = {};

    for (const evt of events) {
      const day = new Date(evt.timestamp).toISOString().slice(0, 10);
      if (!byDay[day]) {
        byDay[day] = { visitors: 0, interactions: 0, requests: 0, count: 0 };
      }
      if (evt.eventType === "page_view") {
        byDay[day].visitors++;
        byDay[day].count++;
      } else if (evt.eventType === "whatsapp_click" || evt.eventType === "hotline_click" || evt.eventType === "cta_click") {
        byDay[day].interactions++;
        byDay[day].count++;
      } else if (evt.eventType === "form_submit") {
        byDay[day].requests++;
        byDay[day].count++;
      }
    }

    // Build sorted array
    const result = Object.entries(byDay)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, val]) => ({
        date,
        count: val.count,
        visitors: val.visitors,
        interactions: val.interactions,
        requests: val.requests,
      }));

    return result;
  },
});

/* ================================================================
   DASHBOARD QUERY — CTA breakdown by type
   ================================================================ */
export const getCTABreakdown = query({
  args: {
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    let events = await ctx.db
      .query("analyticsEvents")
      .withIndex("by_timestamp")
      .collect();

    if (args.startDate !== undefined) {
      events = events.filter((e) => e.timestamp >= args.startDate!);
    }
    if (args.endDate !== undefined) {
      events = events.filter((e) => e.timestamp <= args.endDate!);
    }

    // By location
    const locationCounts: Record<string, number> = {};
    for (const e of events) {
      if (e.eventType === "whatsapp_click" || e.eventType === "hotline_click" || e.eventType === "cta_click") {
        const loc = e.metadata?.location ?? "unknown";
        locationCounts[loc] = (locationCounts[loc] ?? 0) + 1;
      }
    }

    return {
      whatsapp:    events.filter((e) => e.eventType === "whatsapp_click").length,
      hotline:     events.filter((e) => e.eventType === "hotline_click").length,
      cta:         events.filter((e) => e.eventType === "cta_click").length,
      formSubmits: events.filter((e) => e.eventType === "form_submit").length,
      byLocation:  locationCounts,
    };
  },
});

/* ================================================================
   DASHBOARD QUERY — Page views breakdown
   ================================================================ */
export const getPageBreakdown = query({
  args: {
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    let events = await ctx.db
      .query("analyticsEvents")
      .withIndex("by_eventType")
      .filter((q) => q.eq(q.field("eventType"), "page_view"))
      .collect();

    if (args.startDate !== undefined) {
      events = events.filter((e) => e.timestamp >= args.startDate!);
    }
    if (args.endDate !== undefined) {
      events = events.filter((e) => e.timestamp <= args.endDate!);
    }

    const pageCounts: Record<string, { views: number; uniqueVisitors: Set<string> }> = {};
    for (const e of events) {
      if (!pageCounts[e.page]) {
        pageCounts[e.page] = { views: 0, uniqueVisitors: new Set() };
      }
      pageCounts[e.page].views++;
      pageCounts[e.page].uniqueVisitors.add(e.visitorId);
    }

    return Object.entries(pageCounts)
      .map(([page, { views, uniqueVisitors }]) => ({
        page,
        views,
        uniqueVisitors: uniqueVisitors.size,
      }))
      .sort((a, b) => b.views - a.views);
  },
});

/* ================================================================
   DASHBOARD QUERY — Recent events (live feed)
   ================================================================ */
export const getRecentEvents = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const limit = Math.min(args.limit ?? 20, 100);

    const events = await ctx.db
      .query("analyticsEvents")
      .withIndex("by_timestamp")
      .order("desc")
      .take(limit);

    return events.map((e) => ({
      _id: e._id,
      eventType: e.eventType,
      timestamp: e.timestamp,
      page: e.page,
      visitorId: e.visitorId.slice(0, 8) + "***", // partial anonymization in list
      metadata: e.metadata,
    }));
  },
});

/* ================================================================
   SITE CONFIGURATION & SETTINGS
   ================================================================ */

export const getPublicSettings = query({
  args: {},
  handler: async (ctx) => {
    const settings = await ctx.db
      .query("siteSettings")
      .withIndex("by_key", (q) => q.eq("key", "main"))
      .unique();
    return {
      whatsappNumber: settings?.whatsappNumber ?? "201062842903",
      hotlineNumber: settings?.hotlineNumber ?? "16481",
      workingHours: settings?.workingHours ?? "السبت – الخميس: 9 ص – 10 م",
      contactEmail: settings?.contactEmail ?? "info@appliances-center.com",
      heroTitle: settings?.heroTitle ?? "الهندسية للتوكيلات<br><span class=\"highlight\">صيانة متخصصة للأجهزة المنزلية</span>",
      heroSubtitle: settings?.heroSubtitle ?? "مركز الصيانة المعتمد الأول في مصر لجميع الأجهزة المنزلية. نوفر لك خدمة احترافية فورية داخل منزلك بقطع غيار أصلية 100% وضمان معتمد.",
      servicesTitle: settings?.servicesTitle ?? "خدمات <span>الهندسية للتوكيلات</span>",
      servicesSubtitle: settings?.servicesSubtitle ?? "الالتزام والجودة هما مبدأنا الأساسي في كل أعمال الصيانة",
      testimonialsTitle: settings?.testimonialsTitle ?? "ماذا يقول <span>عملاؤنا؟</span>",
      whyUsTitle: settings?.whyUsTitle ?? "لماذا تختار <span>الهندسية للتوكيلات؟</span>",
      whyUsSubtitle: settings?.whyUsSubtitle ?? "بنقدر نفرق لأننا بنهتم بكل تفصيلة في خدمة عميلنا",
    };
  },
});

export const getSettings = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const settings = await ctx.db
      .query("siteSettings")
      .withIndex("by_key", (q) => q.eq("key", "main"))
      .unique();
    return {
      whatsappNumber: settings?.whatsappNumber ?? "201062842903",
      hotlineNumber: settings?.hotlineNumber ?? "16481",
      workingHours: settings?.workingHours ?? "السبت – الخميس: 9 ص – 10 م",
      contactEmail: settings?.contactEmail ?? "info@appliances-center.com",
      heroTitle: settings?.heroTitle ?? "الهندسية للتوكيلات<br><span class=\"highlight\">صيانة متخصصة للأجهزة المنزلية</span>",
      heroSubtitle: settings?.heroSubtitle ?? "مركز الصيانة المعتمد الأول في مصر لجميع الأجهزة المنزلية. نوفر لك خدمة احترافية فورية داخل منزلك بقطع غيار أصلية 100% وضمان معتمد.",
      servicesTitle: settings?.servicesTitle ?? "خدمات <span>الهندسية للتوكيلات</span>",
      servicesSubtitle: settings?.servicesSubtitle ?? "الالتزام والجودة هما مبدأنا الأساسي في كل أعمال الصيانة",
      testimonialsTitle: settings?.testimonialsTitle ?? "ماذا يقول <span>عملاؤنا؟</span>",
      whyUsTitle: settings?.whyUsTitle ?? "لماذا تختار <span>الهندسية للتوكيلات؟</span>",
      whyUsSubtitle: settings?.whyUsSubtitle ?? "بنقدر نفرق لأننا بنهتم بكل تفصيلة في خدمة عميلنا",
    };
  },
});

export const updateSettings = mutation({
  args: {
    whatsappNumber: v.string(),
    hotlineNumber: v.string(),
    workingHours: v.string(),
    contactEmail: v.string(),
    heroTitle: v.string(),
    heroSubtitle: v.string(),
    servicesTitle: v.string(),
    servicesSubtitle: v.string(),
    testimonialsTitle: v.string(),
    whyUsTitle: v.string(),
    whyUsSubtitle: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const existing = await ctx.db
      .query("siteSettings")
      .withIndex("by_key", (q) => q.eq("key", "main"))
      .unique();

    const fields = {
      whatsappNumber: args.whatsappNumber,
      hotlineNumber: args.hotlineNumber,
      workingHours: args.workingHours,
      contactEmail: args.contactEmail,
      heroTitle: args.heroTitle,
      heroSubtitle: args.heroSubtitle,
      servicesTitle: args.servicesTitle,
      servicesSubtitle: args.servicesSubtitle,
      testimonialsTitle: args.testimonialsTitle,
      whyUsTitle: args.whyUsTitle,
      whyUsSubtitle: args.whyUsSubtitle,
    };

    if (existing) {
      await ctx.db.patch(existing._id, fields);
    } else {
      await ctx.db.insert("siteSettings", {
        key: "main",
        ...fields,
      });
    }
  },
});

/* ================================================================
   MOCK DATA POPULATION
   ================================================================ */
export const populateMockData = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    // Clean up existing events to start fresh
    const existingEvents = await ctx.db.query("analyticsEvents").collect();
    for (const e of existingEvents) {
      await ctx.db.delete(e._id);
    }

    const pages = [
      "/",
      "/contact.html",
      "/services.html",
      "/why-us.html",
      "/testimonials.html",
      "/brands/lg.html",
      "/brands/samsung.html",
      "/brands/zanussi.html",
      "/brands/toshiba.html",
      "/brands/sharp.html",
      "/brands/carrier.html",
      "/brands/whirlpool.html"
    ];

    const governorates = ["القاهرة", "الجيزة", "الإسكندرية", "القليوبية", "المنوفية", "الغربية"];
    const appliances = ["غسالة", "ثلاجة", "تكييف", "ديب فريزر", "شاشة", "ميكروويف"];
    const locations = ["hero", "header", "footer", "floating", "contact_form"];

    const now = Date.now();
    const DAY = 86400000;

    // Generate events for the last 30 days
    for (let dayOffset = 30; dayOffset >= 0; dayOffset--) {
      const dayStart = now - dayOffset * DAY;
      // Random number of visitors for this day (10 to 40)
      const dailyVisitorsCount = Math.floor(Math.random() * 30) + 10;

      for (let v = 0; v < dailyVisitorsCount; v++) {
        const visitorId = "mock_v_" + Math.random().toString(36).slice(2, 10);
        const sessionId = "mock_s_" + Math.random().toString(36).slice(2, 10);
        
        // Random hour of the day
        const timestamp = dayStart + Math.floor(Math.random() * 24) * 3600000;

        // 1. Every visitor has at least 1-3 page views
        const viewsCount = Math.floor(Math.random() * 3) + 1;
        for (let pv = 0; pv < viewsCount; pv++) {
          const page = pages[Math.floor(Math.random() * pages.length)];
          await ctx.db.insert("analyticsEvents", {
            eventType: "page_view",
            timestamp: timestamp + pv * 60000,
            page,
            visitorId,
            sessionId,
            metadata: {
              referrer: "https://www.google.com"
            }
          });
        }

        // 2. Conversion chance (35% probability of clicking some CTA)
        if (Math.random() < 0.35) {
          const actionChance = Math.random();
          const page = pages[Math.floor(Math.random() * pages.length)];
          const location = locations[Math.floor(Math.random() * locations.length)];

          if (actionChance < 0.5) {
            // WhatsApp click
            await ctx.db.insert("analyticsEvents", {
              eventType: "whatsapp_click",
              timestamp: timestamp + 5 * 60000,
              page,
              visitorId,
              sessionId,
              metadata: { location }
            });
          } else if (actionChance < 0.8) {
            // Hotline click
            await ctx.db.insert("analyticsEvents", {
              eventType: "hotline_click",
              timestamp: timestamp + 5 * 60000,
              page,
              visitorId,
              sessionId,
              metadata: { location }
            });
          } else {
            // Form submit
            const appliance = appliances[Math.floor(Math.random() * appliances.length)];
            const gov = governorates[Math.floor(Math.random() * governorates.length)];
            
            const arabNames = [
              "أحمد عبد الله", "منى السيد", "خالد إبراهيم", "سارة محمود",
              "يوسف حسن", "فاطمة علي", "مصطفى كمال", "نورا سمير",
              "محمود عبد الرحمن", "رنا أحمد", "كريم محمد", "أميرة سعيد",
              "ياسر عبد العزيز", "هالة عمر", "طارق سليمان", "رانيا مجدي"
            ];
            const arabProblems = [
              "عدم التبريد", "تسريب مياه", "صوت عالي", "لا تشعل الشعلة",
              "لا يبرد", "تراكم ثلج", "تسريب فريون", "لا تعصر",
              "ضعف الموتور", "عطل في التايمر", "الباب لا يغلق", "ماس كهربائي"
            ];
            const name = arabNames[Math.floor(Math.random() * arabNames.length)];
            const problem = arabProblems[Math.floor(Math.random() * arabProblems.length)];
            const brandName = page.split("/").pop()?.replace(".html", "").toUpperCase() || "LG";
            const phone = "010" + Math.floor(10000000 + Math.random() * 90000000);
            
            // Random status distribution: new (22%), pending (34%), completed (39%), cancelled (5%)
            const statRoll = Math.random();
            const status = statRoll < 0.22 ? "new" : statRoll < 0.56 ? "pending" : statRoll < 0.95 ? "completed" : "cancelled";

            await ctx.db.insert("analyticsEvents", {
              eventType: "form_submit",
              timestamp: timestamp + 8 * 60000,
              page,
              visitorId,
              sessionId,
              metadata: {
                location: "contact_form",
                appliance: `${appliances[Math.floor(Math.random() * appliances.length)]} ${brandName}`,
                governorate: gov,
                clientName: name,
                clientPhone: phone,
                problem: problem
              }
            });

            // Insert matching maintenance request
            const randNum = Math.floor(1000 + Math.random() * 9000);
            const requestId = `MR-${randNum}`;
            await ctx.db.insert("maintenanceRequests", {
              requestId,
              clientName: name,
              clientPhone: phone,
              appliance: `${appliances[Math.floor(Math.random() * appliances.length)]} ${brandName}`,
              problem,
              governorate: gov,
              sourcePage: brandName,
              status,
              timestamp: timestamp + 8 * 60000,
            });

            // Form submit always triggers an automatic WhatsApp click as well
            await ctx.db.insert("analyticsEvents", {
              eventType: "whatsapp_click",
              timestamp: timestamp + 8 * 60000 + 500,
              page,
              visitorId,
              sessionId,
              metadata: { location: "contact_form" }
            });
          }
        }
      }
    }
  }
});

/* ================================================================
   DASHBOARD MUTATION — Create a Request manually
   Requires authentication via Clerk.
   ================================================================ */
export const createRequestDashboard = mutation({
  args: {
    clientName: v.string(),
    clientPhone: v.string(),
    appliance: v.string(),
    problem: v.string(),
    governorate: v.string(),
    sourcePage: v.string(),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const randNum = Math.floor(1000 + Math.random() * 9000);
    const requestId = `MR-${randNum}`;

    await ctx.db.insert("maintenanceRequests", {
      requestId,
      clientName: args.clientName,
      clientPhone: args.clientPhone,
      appliance: args.appliance,
      problem: args.problem,
      governorate: args.governorate,
      sourcePage: args.sourcePage,
      status: args.status,
      timestamp: Date.now(),
    });
  },
});

/* ================================================================
   DASHBOARD QUERY — Get requests list with search and filters
   Requires authentication via Clerk.
   ================================================================ */
export const getMaintenanceRequests = query({
  args: {
    searchQuery: v.optional(v.string()),
    statusFilter: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    let requests = await ctx.db
      .query("maintenanceRequests")
      .withIndex("by_timestamp")
      .order("desc")
      .collect();

    // Filter by status if provided
    if (args.statusFilter && args.statusFilter !== "all") {
      requests = requests.filter((r) => r.status === args.statusFilter);
    }

    // Filter by search query if provided
    if (args.searchQuery) {
      const q = args.searchQuery.toLowerCase();
      requests = requests.filter(
        (r) =>
          r.clientName.toLowerCase().includes(q) ||
          r.clientPhone.includes(q) ||
          r.requestId.toLowerCase().includes(q) ||
          r.appliance.toLowerCase().includes(q) ||
          r.problem.toLowerCase().includes(q) ||
          r.governorate.toLowerCase().includes(q) ||
          r.sourcePage.toLowerCase().includes(q)
      );
    }

    return requests;
  },
});

/* ================================================================
   DASHBOARD MUTATION — Update request status
   Requires authentication via Clerk.
   ================================================================ */
export const updateRequestStatus = mutation({
  args: {
    id: v.id("maintenanceRequests"),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    await ctx.db.patch(args.id, { status: args.status });
  },
});

/* ================================================================
   DASHBOARD MUTATION — Edit request details
   Requires authentication via Clerk.
   ================================================================ */
export const editRequest = mutation({
  args: {
    id: v.id("maintenanceRequests"),
    clientName: v.string(),
    clientPhone: v.string(),
    appliance: v.string(),
    problem: v.string(),
    governorate: v.string(),
    sourcePage: v.string(),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    await ctx.db.patch(args.id, {
      clientName: args.clientName,
      clientPhone: args.clientPhone,
      appliance: args.appliance,
      problem: args.problem,
      governorate: args.governorate,
      sourcePage: args.sourcePage,
      status: args.status,
    });
  },
});

/* ================================================================
   DASHBOARD MUTATION — Delete a request
   Requires authentication via Clerk.
   ================================================================ */
export const deleteRequest = mutation({
  args: {
    id: v.id("maintenanceRequests"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    await ctx.db.delete(args.id);
  },
});

/* ================================================================
   DASHBOARD QUERY — Get requests summary count
   Requires authentication via Clerk.
   ================================================================ */
export const getRequestsSummary = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const requests = await ctx.db.query("maintenanceRequests").collect();

    const total = requests.length;
    const newCount = requests.filter((r) => r.status === "new").length;
    const pendingCount = requests.filter((r) => r.status === "pending").length;
    const completedCount = requests.filter((r) => r.status === "completed").length;
    const cancelledCount = requests.filter((r) => r.status === "cancelled").length;

    return {
      total,
      newCount,
      pendingCount,
      completedCount,
      cancelledCount,
    };
  },
});

/* ================================================================
   ROLE PERMISSIONS MAP
   ================================================================ */
const ROLE_PERMISSIONS: Record<string, {
  canViewAnalytics: boolean;
  canViewRequests: boolean;
  canEditRequests: boolean;
  canViewSettings: boolean;
  canEditSettings: boolean;
  canManageUsers: boolean;
}> = {
  owner: {
    canViewAnalytics: true,
    canViewRequests: true,
    canEditRequests: true,
    canViewSettings: true,
    canEditSettings: true,
    canManageUsers: true,
  },
  admin: {
    canViewAnalytics: true,
    canViewRequests: true,
    canEditRequests: true,
    canViewSettings: true,
    canEditSettings: true,
    canManageUsers: false,
  },
  editor: {
    canViewAnalytics: true,
    canViewRequests: true,
    canEditRequests: true,
    canViewSettings: true,
    canEditSettings: false,
    canManageUsers: false,
  },
  media_buyer: {
    canViewAnalytics: true,
    canViewRequests: false,
    canEditRequests: false,
    canViewSettings: false,
    canEditSettings: false,
    canManageUsers: false,
  },
  viewer: {
    canViewAnalytics: true,
    canViewRequests: true,
    canEditRequests: false,
    canViewSettings: false,
    canEditSettings: false,
    canManageUsers: false,
  },
};

/* ================================================================
   QUERY — List all dashboard users
   ================================================================ */
export const listDashboardUsers = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");
    return await ctx.db.query("dashboardUsers").collect();
  },
});

/* ================================================================
   MUTATION — Register/update the current logged-in user in DB
   Called automatically on login to keep record up-to-date.
   ================================================================ */
export const registerCurrentUser = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    avatarUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const clerkId = identity.subject;
    const existing = await ctx.db
      .query("dashboardUsers")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", clerkId))
      .first();

    const now = Date.now();

    if (existing) {
      // If this is the owner's email, automatically upgrade them to owner role
      const isOwnerEmail = args.email === "gawishwashere@gmail.com";
      const newRole = isOwnerEmail ? "owner" : existing.role;
      const perms = ROLE_PERMISSIONS[newRole] || existing.permissions;

      // Update last active + sync profile info
      await ctx.db.patch(existing._id, {
        name: args.name,
        email: args.email,
        avatarUrl: args.avatarUrl,
        lastActiveAt: now,
        role: newRole,
        permissions: perms,
      });
      return existing._id;
    } else {
      // First login — create as owner (first user) or viewer
      const allUsers = await ctx.db.query("dashboardUsers").collect();
      const isFirst = allUsers.length === 0;
      const role = isFirst ? "owner" : "viewer";
      const perms = ROLE_PERMISSIONS[role];

      return await ctx.db.insert("dashboardUsers", {
        clerkId,
        name: args.name,
        email: args.email,
        avatarUrl: args.avatarUrl,
        role,
        status: "active",
        createdAt: now,
        lastActiveAt: now,
        permissions: perms,
      });
    }
  },
});

/* ================================================================
   MUTATION — Invite a new user (owner only)
   ================================================================ */
export const inviteDashboardUser = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    role: v.string(),
    permissions: v.optional(v.object({
      canViewAnalytics: v.boolean(),
      canViewRequests: v.boolean(),
      canEditRequests: v.boolean(),
      canViewSettings: v.boolean(),
      canEditSettings: v.boolean(),
      canManageUsers: v.boolean(),
    })),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    // Check caller is owner
    const caller = await ctx.db
      .query("dashboardUsers")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!caller || caller.role !== "owner") {
      throw new Error("عذراً، المالك فقط يمكنه إضافة مستخدمين أو إدارتهم");
    }

    // Validate role
    const validRoles = ["owner", "admin", "editor", "media_buyer", "viewer"];
    if (!validRoles.includes(args.role)) {
      throw new Error("دور غير صالح");
    }

    // Check for duplicate email
    const existing = await ctx.db
      .query("dashboardUsers")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
    if (existing) throw new Error("هذا البريد الإلكتروني مسجل بالفعل");

    const perms = args.permissions || ROLE_PERMISSIONS[args.role];
    const now = Date.now();

    return await ctx.db.insert("dashboardUsers", {
      clerkId: "pending_" + now,
      name: args.name,
      email: args.email,
      role: args.role,
      status: "active",
      createdAt: now,
      permissions: perms,
    });
  },
});

/* ================================================================
   MUTATION — Update user role & custom permissions
   ================================================================ */
export const updateUserRole = mutation({
  args: {
    userId: v.id("dashboardUsers"),
    role: v.string(),
    permissions: v.optional(v.object({
      canViewAnalytics: v.boolean(),
      canViewRequests: v.boolean(),
      canEditRequests: v.boolean(),
      canViewSettings: v.boolean(),
      canEditSettings: v.boolean(),
      canManageUsers: v.boolean(),
    })),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const caller = await ctx.db
      .query("dashboardUsers")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .first();
    if (!caller || caller.role !== "owner") {
      throw new Error("عذراً، المالك فقط يمكنه تعديل أدوار المستخدمين وصلاحياتهم");
    }

    const validRoles = ["owner", "admin", "editor", "media_buyer", "viewer"];
    if (!validRoles.includes(args.role)) throw new Error("دور غير صالح");

    const perms = args.permissions || ROLE_PERMISSIONS[args.role];
    await ctx.db.patch(args.userId, { role: args.role, permissions: perms });
  },
});

/* ================================================================
   MUTATION — Toggle user status (active / suspended) (owner only)
   ================================================================ */
export const toggleUserStatus = mutation({
  args: {
    userId: v.id("dashboardUsers"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const caller = await ctx.db
      .query("dashboardUsers")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .first();
    if (!caller || caller.role !== "owner") {
      throw new Error("عذراً، المالك فقط يمكنه تعديل حالة الحسابات");
    }

    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("المستخدم غير موجود");

    await ctx.db.patch(args.userId, {
      status: user.status === "active" ? "suspended" : "active",
    });
  },
});

/* ================================================================
   MUTATION — Delete a dashboard user (owner only)
   ================================================================ */
export const deleteDashboardUser = mutation({
  args: {
    userId: v.id("dashboardUsers"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const caller = await ctx.db
      .query("dashboardUsers")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .first();
    if (!caller || caller.role !== "owner") {
      throw new Error("عذراً، المالك فقط يمكنه حذف المستخدمين");
    }

    // Prevent self-deletion
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("المستخدم غير موجود");
    if (user.clerkId === identity.subject) {
      throw new Error("لا يمكنك حذف حسابك الخاص");
    }

    await ctx.db.delete(args.userId);
  },
});

/* ================================================================
   QUERY — Get current user's permissions
   ================================================================ */
export const getMyPermissions = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query("dashboardUsers")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .first();

    return user ?? null;
  },
});

/* ================================================================
   MUTATION — Force promote Mohamed gawish to Owner (dev utility)
   ================================================================ */
export const makeGawishOwner = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await ctx.db
      .query("dashboardUsers")
      .withIndex("by_email", (q) => q.eq("email", "gawishwashere@gmail.com"))
      .first();
    if (user) {
      await ctx.db.patch(user._id, {
        role: "owner",
        permissions: {
          canViewAnalytics: true,
          canViewRequests: true,
          canEditRequests: true,
          canViewSettings: true,
          canEditSettings: true,
          canManageUsers: true,
        }
      });
      return "Success: User upgraded to Owner";
    }
    return "Error: User not found";
  }
});


