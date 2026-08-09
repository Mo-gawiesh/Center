/**
 * Convex Auth Configuration — Clerk Integration
 *
 * After setting up Clerk:
 * 1. Go to Clerk Dashboard → JWT Templates → New Template → Convex
 * 2. Copy the Issuer URL (looks like: https://xxx.clerk.accounts.dev)
 * 3. Replace the domain below with your actual Clerk issuer URL
 *
 * Docs: https://docs.convex.dev/auth/clerk
 */
export default {
  providers: [
    {
      domain: "https://clerk.elhandasia-16481.com",
      applicationID: "convex",
    },
  ],
};
