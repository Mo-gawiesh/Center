/**
 * build-dashboard.mjs
 * Bundles dashboard/src/main.js → dashboard/bundle.js using esbuild
 * Run: node build-dashboard.mjs
 */
import esbuild from "esbuild";
import { readFileSync } from "fs";

const pkg = JSON.parse(readFileSync("./package.json", "utf8"));

console.log("⚡ Building dashboard bundle...");

await esbuild.build({
  entryPoints: ["dashboard/src/main.js"],
  bundle: true,
  minify: false,
  format: "iife",
  globalName: "HCDashboard",
  outfile: "dashboard/bundle.js",
  platform: "browser",
  target: ["es2019"],
  define: {
    "process.env.NODE_ENV": '"production"',
  },
  logLevel: "info",
});

console.log("✅ Bundle written to dashboard/bundle.js");
console.log(`📦 Version: ${pkg.version}`);
