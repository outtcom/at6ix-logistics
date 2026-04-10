# CLAUDE.md

This file provides guidance to Claude Code when working with this repository.

---

## Project Overview

**AT6ix Logistics** — a static multi-page marketing website for a Toronto-based logistics company. No build pipeline. All styles are inline within each HTML file, delivered via Tailwind CDN.

**GitHub:** https://github.com/outtcom/at6ix-logistics

---

## Always Do First
- **Invoke the `ui-ux-pro-max` skill** before writing any frontend code, every session.

## Pages
| File | Purpose |
|------|---------|
| `index.html` | Homepage — video hero, services list, fleet, freight, coverage map, quote form |
| `services.html` | Services detail page |
| `fleet.html` | Fleet page (Box Trucks, Sprinter Vans, Cargo Vans, Flatbeds, Specialized) |
| `freight.html` | Freight page (Skidded, Appliances, Construction, Steel, Windows) |

## Brand
- **Primary red:** `#B8112A` (hover: `#9A0E23`)
- **Dark:** `#0A0A0A`
- **Light bg:** `#FAFAFA` / `#F3F3F4`
- **Headings:** `Oswald` (500/600/700) — Google Fonts
- **Body:** `DM Sans` (400/500/600/700) — Google Fonts
- Logo: `AT 6 - logo.png` (root directory)
- No `brand_assets/` folder — all assets live in the project root

## Local Server
- Start: `node serve.mjs` (serves root at `http://localhost:3000`)
- **Never screenshot a `file:///` URL — always use localhost.**
- If server is already running, do not start a second instance.

## Screenshot Workflow
- Chrome executable: `C:/Users/Fahad/.cache/puppeteer/chrome/win64-146.0.7680.153/chrome-win64/chrome.exe`
- Run: `node screenshot.mjs http://localhost:3000 [label]`
- Output: `./temporary screenshots/screenshot-N[-label].png` (auto-incremented)
- Mobile audit: use Puppeteer with `width:390, height:844, isMobile:true, deviceScaleFactor:2`
- After screenshotting, read the PNG with the Read tool and analyse it directly.

## Mobile Rules
- **Verified clean at 390px** — no horizontal overflow.
- Always test mobile after layout changes.
- `min-width: auto` on flex/grid children causes Safari overflow — always add `min-w-0` to direct children with fixed widths.
- Hover-only interactions don't fire on touch — provide static affordances (opacity, visible arrows) for mobile.
- Use `height: 100svh` (not `100vh`) for full-screen sections on mobile.

## Tailwind CDN Cascade
- Tailwind CDN injects its `<style>` after the page loads — it wins any specificity tie with inline styles.
- Any CSS that must override Tailwind **must use `!important`**.
- Applies to: `flex-direction`, `width`, `display`, `padding`, `font-size`.

## Hooks (enabled)
Hooks are configured in `.claude/settings.local.json`:
- **PostToolUse on Edit/Write**: After editing any `.html` file, the hook ensures the dev server is running (starts it if not).
- **PreToolUse on Bash(screenshot)**: Verified server is up before screenshotting.

## Deployment
- **Git remote:** `https://github.com/outtcom/at6ix-logistics.git`
- Branch: `main`
- Push after every significant change: `git add -A && git commit -m "..." && git push origin main`

## AEO (Answer Engine Optimization)
- `llms.txt` at root — readable by AI crawlers (Perplexity, ChatGPT, etc.), not linked from any visible page element.
- FAQPage JSON-LD in `<head>` of every page.
- BreadcrumbList JSON-LD on subpages.
- LocalBusiness JSON-LD on `index.html`.
- Do NOT add visible links to `llms.txt` anywhere on the site.

## Anti-Generic Guardrails
- **Colors:** Never use default Tailwind palette (indigo-500, blue-600). Use `#B8112A` as primary.
- **Shadows:** Layered, color-tinted (`rgba(184,17,42,0.35)`), not flat `shadow-md`.
- **Typography:** Oswald for headings (tight tracking `-0.04em`), DM Sans for body (line-height 1.7).
- **Animations:** Only animate `transform` and `opacity`. Never `transition-all`.
- **Interactive states:** hover + focus-visible + active on every clickable element.

## Hard Rules
- Do not use `transition-all`
- Do not use default Tailwind blue/indigo as primary color
- Do not stop after one screenshot pass — always verify visually
- Do not add content or sections the user hasn't asked for
- Do not commit `.claude/` directory (it's gitignored)
