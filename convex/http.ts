import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";

const http = httpRouter();

/**
 * POST /track
 * Public endpoint — accepts analytics events from the static website.
 * No authentication required. Input is validated server-side.
 * CORS is open so the live site (elhandasia-16481.com) can post to Convex.
 */
http.route({
  path: "/track",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    // Parse body
    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON" }), {
        status: 400,
        headers: corsHeaders("application/json"),
      });
    }

    const {
      eventType,
      page,
      visitorId,
      sessionId,
      timestamp,
      metadata,
    } = body as Record<string, unknown>;

    // Basic validation
    if (
      typeof eventType !== "string" ||
      typeof page !== "string" ||
      typeof visitorId !== "string" ||
      typeof sessionId !== "string"
    ) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: corsHeaders("application/json") }
      );
    }

    try {
      await ctx.runMutation(api.analytics.recordEvent, {
        eventType,
        page,
        visitorId,
        sessionId,
        timestamp: typeof timestamp === "number" ? timestamp : Date.now(),
        metadata:
          metadata && typeof metadata === "object"
            ? (metadata as {
                location?: string;
                ctaType?: string;
                referrer?: string;
                appliance?: string;
                governorate?: string;
              })
            : undefined,
      });
    } catch (err) {
      // Return 400 for validation errors from the mutation
      return new Response(
        JSON.stringify({ error: String(err) }),
        { status: 400, headers: corsHeaders("application/json") }
      );
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: corsHeaders("application/json"),
    });
  }),
});

/**
 * GET /settings
 * Public endpoint — returns the current active site settings (hotline, whatsapp number).
 */
http.route({
  path: "/settings",
  method: "GET",
  handler: httpAction(async (ctx) => {
    const settings = await ctx.runQuery(api.analytics.getPublicSettings);
    return new Response(JSON.stringify(settings), {
      status: 200,
      headers: corsHeaders("application/json"),
    });
  }),
});

/**
 * OPTIONS /settings
 * CORS preflight handler.
 */
http.route({
  path: "/settings",
  method: "OPTIONS",
  handler: httpAction(async () => {
    return new Response(null, {
      status: 204,
      headers: corsHeaders(),
    });
  }),
});

/**
 * OPTIONS /track
 * CORS preflight handler.
 */
http.route({
  path: "/track",
  method: "OPTIONS",
  handler: httpAction(async () => {
    return new Response(null, {
      status: 204,
      headers: corsHeaders(),
    });
  }),
});

/** Helper: build CORS-enabled headers */
function corsHeaders(contentType?: string): HeadersInit {
  const headers: Record<string, string> = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
  };
  if (contentType) headers["Content-Type"] = contentType;
  return headers;
}

export default http;
