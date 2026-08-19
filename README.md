# uscold architecture map

An interactive isometric map of the three Phenix v2 repositories — **phenix.ui**,
**phenix.yard** and **phenix.appointments** — with the v1 estate (USCS-FE,
USCS-BE, Oracle) drawn as a single building. Buildings are sized from real file
counts and line totals; every edge is a call or data path that exists in the
code; flows animate real journeys (gate arrival, appointment search, warehouse
migration, …).

Open **`architecture.html`** in a browser. No server needed.

## Keeping it honest

Counts and geometry are measured, prose and flows are authored.

```bash
pnpm sync    # re-measure the three sibling repos, update src/measured.generated.ts
pnpm build   # rebundle architecture.html
```

`pnpm sync` reports **unmapped files** — code that appeared in the repos that no
building claims. When that number is above zero (it also shows in the page
header), either widen a pattern in `src/coverage.json` or add the node the map
is missing in `src/graph.ts`.

The sync reads the sibling checkouts via relative paths, so it only works from
a machine that has `phenix.ui`, `phenix.yard` and `phenix.appointments` cloned
next to this directory (it is deliberately not wired into any CI).

## Editing

- **Prose, edges, flows** — `src/graph.ts`. Nothing else needs to change.
- **File ownership** — `src/coverage.json` (globs, most-specific pattern wins).
- **Theme** — Phenix oklch tokens are inlined in `scripts/build.mjs`; the map
  reads them through the `--am-*` variables in `src/components/theme.ts`.
- `src/core`, `src/stores`, `src/components` are the portable map engine
  (from the architecture-map skill) — copied verbatim, no repo-specific code.

```bash
pnpm typecheck   # strict TS over the whole thing
```
