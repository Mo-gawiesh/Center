import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  /**
   * Analytics events from the public website.
   * All events are anonymous (no PII stored).
   */
  analyticsEvents: defineTable({
    /** Event type: page_view | whatsapp_click | hotline_click | cta_click | form_submit */
    eventType: v.string(),
    /** Unix timestamp (ms) when event occurred */
    timestamp: v.number(),
    /** Page path e.g. "/" | "/contact.html" | "/brands/lg.html" */
    page: v.string(),
    /** Anonymous visitor ID (generated client-side, stored in localStorage) */
    visitorId: v.string(),
    /** Session ID (generated client-side, stored in sessionStorage) */
    sessionId: v.string(),
    /** Optional metadata: button location, CTA type, etc. */
    metadata: v.optional(
      v.object({
        /** Where on the page: hero | header | footer | floating | mobile_nav | contact_form | topbar */
        location: v.optional(v.string()),
        /** CTA type for cta_click events */
        ctaType: v.optional(v.string()),
        /** Referrer URL (truncated, no personal info) */
        referrer: v.optional(v.string()),
        /** Appliance type for form_submit events */
        appliance: v.optional(v.string()),
        /** Governorate for form_submit events */
        governorate: v.optional(v.string()),
        /** Customer name for requests */
        clientName: v.optional(v.string()),
        /** Customer phone number for requests */
        clientPhone: v.optional(v.string()),
        /** Specific problem or malfunction */
        problem: v.optional(v.string()),
      })
    ),
  })
    .index("by_timestamp", ["timestamp"])
    .index("by_eventType", ["eventType"])
    .index("by_visitorId", ["visitorId"])
    .index("by_eventType_and_timestamp", ["eventType", "timestamp"]),

  /**
   * Site-wide configuration and settings, editable from the admin dashboard.
   */
  siteSettings: defineTable({
    key: v.string(), // "main"
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
  }).index("by_key", ["key"]),

  /**
   * Maintenance requests submitted by users or created by admins.
   */
  maintenanceRequests: defineTable({
    requestId: v.string(),
    clientName: v.string(),
    clientPhone: v.string(),
    appliance: v.string(),
    problem: v.string(),
    governorate: v.string(),
    sourcePage: v.string(),
    status: v.string(), // "new" | "pending" | "completed" | "cancelled"
    timestamp: v.number(),
  })
    .index("by_timestamp", ["timestamp"])
    .index("by_status", ["status"])
    .index("by_requestId", ["requestId"]),

  /**
   * Dashboard user accounts with roles and permissions.
   * Linked to Clerk user IDs.
   * Roles: "admin" | "editor" | "media_buyer" | "viewer"
   */
  dashboardUsers: defineTable({
    /** Clerk user ID (subject) */
    clerkId: v.string(),
    /** Display name */
    name: v.string(),
    /** Email address */
    email: v.string(),
    /** Role: admin | editor | media_buyer | viewer */
    role: v.string(),
    /** Account status: active | suspended */
    status: v.string(),
    /** Avatar URL from Clerk */
    avatarUrl: v.optional(v.string()),
    /** Timestamp when the user was added to the dashboard */
    createdAt: v.number(),
    /** Last activity timestamp */
    lastActiveAt: v.optional(v.number()),
    /** Permissions flags */
    permissions: v.object({
      canViewAnalytics: v.boolean(),
      canViewRequests: v.boolean(),
      canEditRequests: v.boolean(),
      canViewSettings: v.boolean(),
      canEditSettings: v.boolean(),
      canManageUsers: v.boolean(),
    }),
  })
    .index("by_clerkId", ["clerkId"])
    .index("by_email", ["email"])
    .index("by_role", ["role"]),
});
