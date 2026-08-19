#!/usr/bin/env node
import { readFileSync, writeFileSync } from "node:fs";
import { build } from "esbuild";

/**
 * Bundles the map into one self-contained architecture.html.
 *
 * esbuild produces a single IIFE bundle plus the extracted CSS; both are
 * inlined into the page together with the Phenix design tokens (copied from
 * phenix.ui/packages/ui/src/theme.css) mapped onto the map's `--am-*`
 * variables, light under :root and dark under .dark. A tiny boot script sets
 * `.dark` before first paint from localStorage or the OS preference.
 *
 * The result opens from disk (file://) — no server, no external assets except
 * the IBM Plex Sans stylesheet, which degrades to the system stack offline.
 */

const result = await build({
  entryPoints: ["src/entry.tsx"],
  bundle: true,
  minify: true,
  format: "iife",
  write: false,
  outdir: "out",
  define: { "process.env.NODE_ENV": '"production"' },
});

const js = result.outputFiles.find((f) => f.path.endsWith(".js"))?.text ?? "";
const css = result.outputFiles.find((f) => f.path.endsWith(".css"))?.text ?? "";

/** Phenix oklch tokens (packages/ui/src/theme.css) → the map's semantic names. */
const tokens = `
:root {
  --am-surface: oklch(1 0 0);
  --am-border: oklch(0.92 0.004 286.32);
  --am-structure: oklch(0.705 0.015 286.067);
  --am-ink-primary: oklch(0.141 0.005 285.823);
  --am-ink-secondary: oklch(0.442 0.017 285.786);
  --am-ink-tertiary: oklch(0.552 0.016 285.938);
  --am-accent: oklch(0.488 0.243 264.376);
  --am-accent-wash: oklch(0.93 0.045 264.376);
  --am-font-title: "IBM Plex Sans", ui-sans-serif, system-ui, -apple-system, "Segoe UI", "Helvetica Neue", Arial, sans-serif;
  --am-font-body: "IBM Plex Sans", ui-sans-serif, system-ui, -apple-system, "Segoe UI", "Helvetica Neue", Arial, sans-serif;
  --am-font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
}
.dark {
  --am-surface: oklch(0.141 0.005 285.823);
  --am-border: oklch(1 0 0 / 12%);
  --am-structure: oklch(0.552 0.016 285.938);
  --am-ink-primary: oklch(0.985 0 0);
  --am-ink-secondary: oklch(0.871 0.006 286.286);
  --am-ink-tertiary: oklch(0.705 0.015 286.067);
  --am-accent: oklch(0.623 0.214 259.815);
  --am-accent-wash: oklch(0.28 0.07 264.376);
}
html, body { margin: 0; padding: 0; }
body { background: var(--am-surface); color: var(--am-ink-primary); font-family: var(--am-font-body); }
`;

const bootTheme = `try{var t=localStorage.getItem("am-theme");var d=t?t==="dark":matchMedia("(prefers-color-scheme: dark)").matches;if(d)document.documentElement.classList.add("dark")}catch(e){}`;

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="robots" content="noindex, nofollow" />
<title>Phenix architecture</title>
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
<style>${tokens}${css}</style>
<script>${bootTheme}</script>
</head>
<body>
<div id="root"></div>
<script>${js}</script>
</body>
</html>
`;

writeFileSync("architecture.html", html);
const kb = Math.round(Buffer.byteLength(html) / 1024);
console.log(`architecture.html written (${kb} kB)`);

// A guard against building from a stale measurement — same check CI would run.
const measured = readFileSync("src/measured.generated.ts", "utf8");
if (!measured.includes("MEASURED")) {
  console.error("measured.generated.ts looks wrong — run `pnpm sync` first.");
  process.exit(1);
}
