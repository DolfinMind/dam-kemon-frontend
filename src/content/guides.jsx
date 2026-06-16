import { Link } from 'react-router-dom';
import {
  MagnifyingGlass as PhSearch,
  ShieldCheck as PhShieldCheck,
  SealCheck as PhSealCheck,
} from '@phosphor-icons/react';

/**
 * SEO guide content. Each entry drives:
 *   - the homepage "Guides & insights" cards (Home.jsx),
 *   - the /guides hub (Guides.jsx),
 *   - the /guides/:slug article (GuideDetail.jsx),
 *   - and the structured data emitted by GuideSEO.jsx.
 *
 * `faqs[].a` MUST be plain text (no JSX) — it is reused verbatim in the
 * FAQPage JSON-LD, where Google only accepts text answers. The article `Body`
 * can use rich JSX (headings, lists, internal links, callouts).
 *
 * Keep the articles honest: Damkemon Protect today is a trust + dispute layer
 * (it scores scam risk and records a protected order); it does not yet hold
 * money in escrow. Never imply a guaranteed refund.
 */

/* ── small presentational helpers used inside article bodies ── */
export function KeyTakeaways({ items }) {
  return (
    <aside className="not-prose my-8 rounded-2xl border border-line bg-acid-soft/60 p-5 sm:p-6">
      <h2 className="!mt-0 font-sans text-sm font-bold uppercase tracking-[0.14em] text-acid-deep mb-3">
        Key takeaways
      </h2>
      <ul className="space-y-2">
        {items.map((t, i) => (
          <li key={i} className="flex items-start gap-2.5 text-[15px] leading-relaxed text-ink/80">
            <span className="mt-2 w-1.5 h-1.5 rounded-full bg-acid-deep shrink-0" />
            <span>{t}</span>
          </li>
        ))}
      </ul>
    </aside>
  );
}

export function Callout({ tone = 'ink', title, children }) {
  const tones = {
    ink: 'bg-ink text-cream border-ink',
    red: 'bg-red-soft text-ink border-red/20',
    green: 'bg-green-soft text-ink border-green/20',
  };
  return (
    <div className={`not-prose my-7 rounded-2xl border p-5 sm:p-6 ${tones[tone]}`}>
      {title && <p className="font-sans font-bold text-base mb-1.5">{title}</p>}
      <div className={`text-[15px] leading-relaxed ${tone === 'ink' ? 'text-cream/80' : 'text-ink/80'}`}>
        {children}
      </div>
    </div>
  );
}

/* ───────────────────────────── guides ───────────────────────────── */
export const GUIDES = [
  /* ============================ GUIDE 1 ============================ */
  {
    slug: 'why-one-search-beats-ten-browser-tabs',
    title: 'Why one search beats ten browser tabs',
    dek: 'See every shop that sells your product — price, trust and delivery, side by side.',
    readMin: 4,
    category: 'Smart shopping',
    tone: 'bg-acid-soft text-acid-deep',
    Icon: PhSearch,
    datePublished: '2026-06-16',
    dateModified: '2026-06-16',
    keywords: [
      'price comparison Bangladesh', 'compare prices online BD', 'cheapest price Bangladesh',
      'online shopping Bangladesh', 'best price BD', 'দাম তুলনা',
    ],
    metaTitle: 'Price comparison in Bangladesh: why one search beats ten browser tabs',
    metaDescription:
      'Stop opening a dozen tabs to compare prices. Learn how a single search across Bangladesh’s shops shows the cheapest — and safest — seller, side by side.',
    faqs: [
      {
        q: 'Is Damkemon free to use?',
        a: 'Yes. Searching and comparing prices across Bangladeshi shops is completely free for shoppers — there is no fee and no account required to compare.',
      },
      {
        q: 'Where do the prices come from?',
        a: 'Prices are read from real, current listings at shops across Bangladesh and kept fresh. When a listing goes stale, Damkemon flags it instead of showing a made-up number.',
      },
      {
        q: 'Can I search in Bangla?',
        a: 'Yes. Damkemon understands Bengali and common transliterations, so you can type a product name in Bangla or English and still get the same side-by-side comparison.',
      },
      {
        q: 'Why is the cheapest price not always the best choice?',
        a: 'A low price is only worth it if the seller is genuine and actually delivers. That is why Damkemon shows a trust score and delivery estimate next to every price, not just the number.',
      },
    ],
    Body: () => (
      <>
        <p>
          You know the ritual. You want to buy a phone, an air conditioner, or a pair of headphones,
          so you open StarTech in one tab, Ryans in another, then Pickaboo, then Daraz, then a couple
          of Facebook pages a friend mentioned. Ten tabs later you have ten prices, a sore thumb, and
          you <em>still</em> are not sure who is actually cheapest — or who will actually deliver.
        </p>
        <p>
          Price comparison fixes the first problem. Damkemon fixes all three: <strong>price, trust,
          and delivery</strong>, in a single search. Here is why one good search beats ten browser tabs.
        </p>

        <h2>The hidden cost of shopping with ten tabs</h2>
        <p>
          Opening a tab per shop feels thorough, but it quietly costs you. It takes time you do not
          have. Prices change between the tab you opened first and the one you opened last. And after
          all that effort, most people give up halfway and just buy from the shop they already know —
          often overpaying by hundreds or thousands of taka without realising it.
        </p>
        <p>
          Worse, ten tabs can not tell you the two things that matter most in Bangladesh: whether a
          “discount” is real, and whether the seller is safe. A tab shows you a number. It does not
          show you a shop’s delivery record or whether that suspiciously low price is bait.
        </p>

        <h2>What a single price-comparison search actually does</h2>
        <p>
          A price-comparison engine flips the work around. Instead of you visiting every shop, you type
          the product <strong>once</strong> and it brings every shop that sells it to you — real,
          current prices lined up in one row. Type{' '}
          <Link to="/search?q=iphone">a phone model</Link>, a brand, or a category and the whole market
          answers at once. You can even search in Bangla; Damkemon understands Bengali and
          transliteration, so <span lang="bn">দাম কেমন</span> works as well as “price”.
        </p>

        <h2>Price is only one-third of a good decision</h2>
        <p>
          The cheapest price is worthless if the seller never ships, or if the listing is a fake low
          price designed to pull an advance payment. That is the difference between a plain comparison
          site and Damkemon: every price sits next to a <strong>trust score</strong> and a{' '}
          <strong>delivery estimate</strong>, so you are comparing whole decisions, not just numbers.
        </p>
        <p>
          If you want to understand how that score sees through bait pricing, read{' '}
          <Link to="/guides/how-trust-score-spots-fake-low-prices">
            how our trust score spots fake low prices
          </Link>
          . And if a seller is unknown — say, a Facebook page — check it first with{' '}
          <Link to="/guides/buying-from-unknown-seller-use-protect">Damkemon Protect</Link>.
        </p>

        <Callout tone="green" title="A quick example">
          Search a popular phone and you might see eight sellers. The very cheapest is a two-week-old
          shop with a thin trust score and no delivery history. The second-cheapest is ৳500 more, from
          a top-trust shop that delivers in two days. The Smart Pick is not the lowest number — it is
          the lowest number <em>you can trust</em>. One search shows you both in the same glance.
        </Callout>

        <h2>How to get the most out of one search</h2>
        <p>
          Start broad, then narrow: search the product, scan the lined-up prices, and check the trust
          score before you fixate on the lowest figure. Watch the{' '}
          <Link to="/browse">price history</Link> before big festival sales — a “30% off” banner means
          nothing if the price was quietly raised the week before. And for any seller you do not
          recognise, run a quick risk check with Protect before you pay a single taka.
        </p>

        <KeyTakeaways
          items={[
            'Ten tabs cost you time and usually end in overpaying — one search lines up every shop at once.',
            'Damkemon shows price, trust score and delivery together, so you compare decisions, not just numbers.',
            'You can search in Bangla or English and still get the full comparison.',
            'The smartest buy is the lowest price from a seller you can actually trust.',
          ]}
        />
      </>
    ),
  },

  /* ============================ GUIDE 2 ============================ */
  {
    slug: 'buying-from-unknown-seller-use-protect',
    title: 'Buying from an unknown seller? Use Protect',
    dek: 'Check the scam risk and open a protected order before you hand over money.',
    readMin: 3,
    category: 'Buyer safety',
    tone: 'bg-green-soft text-green',
    Icon: PhShieldCheck,
    datePublished: '2026-06-16',
    dateModified: '2026-06-16',
    keywords: [
      'online shopping scam Bangladesh', 'Facebook page scam BD', 'bKash send money scam',
      'advance payment fraud Bangladesh', 'safe online shopping Bangladesh', 'অনলাইন প্রতারণা',
    ],
    metaTitle: 'Buying from an unknown seller in Bangladesh? Check the scam risk first',
    metaDescription:
      'Facebook-page sellers and “Send Money” advance payments are where Bangladeshis lose money. Learn the red flags and how Damkemon Protect checks a seller before you pay.',
    faqs: [
      {
        q: 'Is it safe to pay in advance to an online seller in Bangladesh?',
        a: 'Prefer cash on delivery whenever you can. If you must pay in advance, keep it small, verify the seller first, and never use bKash or Nagad “Send Money” to a personal number. Bangladesh rules cap advance payment at 10% of the price.',
      },
      {
        q: 'What is the bKash “Send Money” trap?',
        a: 'Scammers ask you to use the personal “Send Money” option instead of a merchant Payment, because Send Money to a personal number is hard to trace or reverse. A genuine shop almost always uses a merchant or cash-on-delivery flow.',
      },
      {
        q: 'Does Damkemon Protect work for Facebook sellers?',
        a: 'Yes. Protect works for any seller, including off-platform Facebook pages. You can check the scam risk and open a protected order even when the seller is not listed on Damkemon.',
      },
      {
        q: 'Can Damkemon get my money back if I am scammed?',
        a: 'Today Protect is a trust and dispute layer: it scores the risk before you pay, puts your order on record, and a dispute lowers the seller’s trust score. It does not yet hold your money in escrow, so always pay cautiously and prefer cash on delivery.',
      },
    ],
    Body: () => (
      <>
        <p>
          It is a dream price on a Facebook page. The seller is friendly, the photos look real, and
          they say: “Just <strong>Send Money</strong> to this bKash number and we will deliver
          tomorrow.” This is exactly how thousands of Bangladeshis have lost money — from the Evaly era
          to the everyday fake page that vanishes the moment your payment lands.
        </p>
        <p>
          You do not have to stop buying from small or unknown sellers. You just need to check them
          first. That is what <Link to="/protect">Damkemon Protect</Link> is for.
        </p>

        <h2>Why unknown sellers are risky in Bangladesh</h2>
        <p>
          Social commerce runs on Facebook here, and most pages have no public track record and no
          accountability. The classic trap is the <strong>advance payment to a personal number</strong>
          : once you Send Money, there is no merchant, no receipt, and little recourse. Add fake pages
          that copy a real shop’s name, and “too-good-to-be-true” prices designed purely to trigger a
          fast payment, and you have the three scams every BD shopper should recognise.
        </p>

        <h2>The red flags of a scam seller</h2>
        <p>Before you pay anyone you do not know, run down this checklist:</p>
        <ul>
          <li>They insist on bKash or Nagad <strong>“Send Money”</strong> (personal), not a merchant Payment or cash on delivery.</li>
          <li>The price is far below the market — check it against a <Link to="/search">real price comparison</Link> first.</li>
          <li>The page is brand new, recently renamed, or has almost no genuine history.</li>
          <li>There is pressure or urgency: “only 2 left”, “offer ends tonight”, “pay now to confirm”.</li>
          <li>Reviews are missing, all five stars, or clearly copy-pasted.</li>
          <li>They refuse cash on delivery or any partial-on-delivery option.</li>
        </ul>

        <Callout tone="red" title="The single most important rule">
          Never use bKash or Nagad <strong>Send Money</strong> to a personal number for an online
          purchase. A real shop uses a merchant payment or cash on delivery. “Send Money to this
          personal number” is the number-one signal of a scam in Bangladesh.
        </Callout>

        <h2>What Damkemon Protect does</h2>
        <p>
          Protect reads the seller and the deal the way an experienced buyer would — but instantly. It
          scores the <strong>scam risk</strong> using the seller’s trust signals and the real market
          price, and it flags the exact traps above: the personal-number request, an unverified seller,
          and a price that is suspiciously below market. If the risk is high, it points you to safer,
          trusted sellers for the same product.
        </p>
        <p>
          If you decide to go ahead, you can open a <strong>Protected Order</strong> with a shareable
          code that puts the deal on record. If it goes wrong, you can file a dispute — and a dispute
          dents that seller’s trust score, which protects the next buyer too. Protect works for any
          seller, including off-platform Facebook pages.
        </p>

        <Callout tone="ink" title="An honest note on how far Protect goes today">
          Right now Protect is a <strong>trust and dispute layer</strong> — it checks risk, records
          your order, and lowers a seller’s score when a deal goes bad. It does <em>not</em> yet hold
          your money in escrow. So treat it as a strong early-warning system, keep preferring cash on
          delivery, and never advance more than you can afford to lose.
        </Callout>

        <h2>Use Protect in three steps</h2>
        <ol>
          <li>Enter the seller, the product and the price, and read the risk check.</li>
          <li>If you proceed, open a protected order and save the code.</li>
          <li>Share the code with the seller; if the deal goes wrong, file a dispute.</li>
        </ol>

        <KeyTakeaways
          items={[
            'The biggest BD scam is the advance “Send Money” to a personal number — never do it.',
            'Check any unknown or Facebook seller with Protect before you pay.',
            'Protect scores scam risk, suggests safer sellers, and records a protected order.',
            'Protect is a trust + dispute layer today (not escrow) — still prefer cash on delivery.',
          ]}
        />

        <p>
          New to comparing sellers in the first place? Start with{' '}
          <Link to="/guides/why-one-search-beats-ten-browser-tabs">
            why one search beats ten browser tabs
          </Link>
          .
        </p>
      </>
    ),
  },

  /* ============================ GUIDE 3 ============================ */
  {
    slug: 'how-trust-score-spots-fake-low-prices',
    title: 'How our trust score spots fake low prices',
    dek: 'Delivery signals, review history and stock depth — combined into one number.',
    readMin: 5,
    category: 'How it works',
    tone: 'bg-yellow-soft text-ink',
    Icon: PhSealCheck,
    datePublished: '2026-06-16',
    dateModified: '2026-06-16',
    keywords: [
      'fake discount Bangladesh', 'too good to be true price', 'is this online seller genuine',
      'trust score', 'fake MRP Bangladesh', 'how to tell if a shop is real',
    ],
    metaTitle: 'How Damkemon’s trust score spots fake low prices and fake discounts',
    metaDescription:
      'A low price can be bait. See how Damkemon combines price history, delivery, reviews and stock depth into one trust score that flags fake discounts and risky sellers.',
    faqs: [
      {
        q: 'What is a good trust score?',
        a: 'Higher is safer. A high score means consistent pricing, real reviews and a reliable delivery record, so you can buy with confidence. A low score, or a “too good to be true” flag, means you should check reviews and delivery — or use Protect — before paying.',
      },
      {
        q: 'Why is the cheapest price sometimes flagged?',
        a: 'Because Damkemon compares it against the cross-shop price history. A price far below what the same product reliably sells for — or a “discount” from an MRP that was never really charged — is flagged as a possible fake low price or fake discount.',
      },
      {
        q: 'Does a low price always mean a scam?',
        a: 'No. Genuine clearance, festival deals and grey-market stock can all be cheap and legitimate. The trust score exists to tell the difference, by weighing the price against delivery, reviews, account age and stock depth rather than the number alone.',
      },
      {
        q: 'How is the trust score calculated?',
        a: 'It combines several real signals: the price versus cross-shop history, delivery reliability, review history and quality, how long the shop has been active, stock depth and dispute history — blended into a single number you can read at a glance.',
      },
    ],
    Body: () => (
      <>
        <p>
          The lowest price on the page is not always the best deal. Sometimes it is bait. A{' '}
          <strong>fake low price</strong> — or a fake “discount” from an inflated MRP that nobody ever
          paid — is one of the oldest tricks in Bangladeshi e-commerce. Damkemon’s trust score exists
          to see through it. Here is how.
        </p>

        <h2>Why fake low prices exist</h2>
        <p>
          A price that looks impossible usually has a reason behind it. It might be bait to pull an
          advance payment before the seller disappears. It might be grey-market or refurbished stock
          sold as new. Or it might be a manufactured discount — “was ৳40,000, now ৳22,000” — where the
          ৳40,000 was never a real selling price. In every case, the number alone is designed to
          short-circuit your judgement.
        </p>

        <h2>The signals behind the score</h2>
        <p>
          Instead of trusting a single price, the trust score weighs several independent signals that a
          scammer can not easily fake all at once:
        </p>
        <ul>
          <li><strong>Price versus history.</strong> The cross-shop price history reveals what the product really sells for — so an impossible price, or a fake MRP, stands out immediately.</li>
          <li><strong>Delivery reliability.</strong> Does this shop actually deliver, and on time? A great price from a shop that never ships is not a deal.</li>
          <li><strong>Review history and quality.</strong> Not just the star count, but whether reviews look real and consistent over time.</li>
          <li><strong>Account age and activity.</strong> A brand-new or freshly renamed shop carries more risk than one with a long, steady track record.</li>
          <li><strong>Stock depth.</strong> Thin, single-item listings behave differently from a real, well-stocked catalogue.</li>
          <li><strong>Dispute history.</strong> Past disputes — including those opened through <Link to="/protect">Protect</Link> — pull a score down.</li>
        </ul>

        <h2>How the signals combine into one number</h2>
        <p>
          No single signal decides it. A suspiciously low price <em>plus</em> a new account{' '}
          <em>plus</em> no delivery record adds up to a low score and a warning. Consistent pricing,
          real reviews and reliable delivery add up to a high score you can buy from with confidence.
          The result is one glanceable number — and a Smart Verdict — sitting right next to the price,
          so you never have to do this detective work yourself.
        </p>

        <Callout tone="green" title="Read the score, then read the price">
          A high score means buy with confidence. A middling score means check the reviews and delivery
          first. A low score, or a “too good to be true” flag, means slow down — cross-check the{' '}
          <Link to="/browse">price history</Link>, or run the seller through{' '}
          <Link to="/protect">Protect</Link> before you pay.
        </Callout>

        <h2>Why no single shop can fake it</h2>
        <p>
          A seller can fake their own page — the photos, the reviews, the “MRP”. What they can not fake
          is the <strong>whole market’s price history</strong>. Because Damkemon is a neutral layer
          sitting above every shop, it sees the aggregate that no individual seller controls. That is
          what makes a fake low price visible: it disagrees with everything else the market is saying.
        </p>

        <h2>How to use the score when you shop</h2>
        <p>
          Treat the score as your first filter and the price as your second. Compare like-for-like with{' '}
          <Link to="/search">one search</Link>, let the trust score rule out the risky sellers, and then
          pick the lowest price that remains. If you are still unsure about a specific shop, browse{' '}
          <Link to="/sellers">shop trust profiles</Link> to see the signals in detail.
        </p>

        <KeyTakeaways
          items={[
            'A fake low price or fake MRP is bait — the number is designed to bypass your judgement.',
            'The trust score weighs price history, delivery, reviews, account age, stock depth and disputes.',
            'No single signal decides it; combined, they are very hard for a scammer to fake.',
            'Only a neutral cross-shop layer can see the whole market’s price history — which is what exposes fakes.',
          ]}
        />

        <p>
          Want the bigger picture on comparing safely? See{' '}
          <Link to="/guides/why-one-search-beats-ten-browser-tabs">
            why one search beats ten browser tabs
          </Link>{' '}
          and{' '}
          <Link to="/guides/buying-from-unknown-seller-use-protect">
            how to buy safely from an unknown seller
          </Link>
          .
        </p>
      </>
    ),
  },
];

/* ── lookups ── */
export const getGuide = (slug) => GUIDES.find((g) => g.slug === slug);
export const otherGuides = (slug) => GUIDES.filter((g) => g.slug !== slug);
