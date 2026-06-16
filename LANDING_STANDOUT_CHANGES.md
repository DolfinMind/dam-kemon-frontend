# Landing-page "standout" changes — Home.jsx

Four surgical, on-brand edits to make the homepage lead with the thing that
actually makes Damkemon stand out to the BD public: **trust**, not just price.
All changes reuse existing design tokens, icons, and CSS — no new dependencies.

> Verify locally with `npm run build` (or `npm run dev`). The changes were
> lint-parsed clean; they add **zero** new ESLint errors (the pre-existing
> `prop-types` / unused-import / unescaped-apostrophe warnings are unrelated).

---

## 1. Surfaced the `ProtectShowcase` component on the homepage  ★ biggest win
**File:** `src/pages/Home.jsx` (new import + `<ProtectShowcase />` rendered
after the trust marquee, before the "Out of the box" section).

`ProtectShowcase` — your animated, anti-scam "live risk check" spotlight — was
**already built but never rendered anywhere in the app** (`grep` confirmed it had
no import). It's your single strongest differentiator vs. every other BD price
site (MuthoPhone, PriceMama, BDStall do price only; none do trust). It now
appears high on the page where first-time visitors will see it.

*Why it matters:* trust is the #1 reason BD shoppers hesitate post-Evaly. The
component literally demonstrates flagging the "bKash Send Money to a personal
number" trap and "32% below market" — the exact scam patterns buyers fear.

## 2. Bangla brand line in the hero — own the name
Added under the H1:

> **দাম কেমন?** — "how's the price?" The question we answer for every shop in Bangladesh.

Your brand name *is* the everyday Bangla phrase for "what's the price?" — a
memorable, deeply local asset most users won't consciously register until you
say it. The `Hind Siliguri` Bangla font is already loaded, so it renders crisply.

## 3. Trust micro-proofs under the hero search
Added a compact row at the point of action: **Real prices, never fake ·
Scam-risk checked · Free for shoppers.** Conversion research is consistent that
trust signals placed next to the primary action lift confidence. Uses icons
already imported (`BadgeCheck`, `ShieldCheck`, `Sparkles`).

## 4. (implicit) Reordered emphasis
The page now reads: price proof (hero + deals) → **trust/anti-scam (Protect)** →
how it works → social proof → FAQ. Trust is no longer buried.

---

## How to revert
Each change is a self-contained block. To undo, remove:
1. the `import ProtectShowcase …` line and the `<ProtectShowcase />` block,
2. the `<p>` Bangla brand line under the `<h1>`,
3. the "Trust micro-proofs" `<div>` after the live-searches row.

## Not done in code (needs your input — see the strategy report)
- **Replace placeholder testimonials** with real shopper quotes (currently
  marked `NOTE: placeholder` in `Home.jsx`). Fake testimonials are a trust risk.
- Swap the marquee shop names for real **shop logos** (logos lift conversion
  more than text; only use shops you actually index).
- Full Bangla/English language toggle (high-value, larger effort).
