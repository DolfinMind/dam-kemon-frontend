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
 * Keep the articles honest: Damkemon compares listings and seller signals; it
 * does not hold payments, guarantee sellers, or recover money after a scam.
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
    dek: 'See available sellers and their recently checked prices side by side.',
    readMin: 4,
    category: 'Smart shopping',
    tone: 'bg-acid-soft text-acid-deep',
    Icon: PhSearch,
    datePublished: '2026-06-16',
    dateModified: '2026-07-15',
    keywords: [
      'price comparison Bangladesh', 'compare prices online BD', 'cheapest price Bangladesh',
      'online shopping Bangladesh', 'best price BD', 'দাম তুলনা',
    ],
    metaTitle: 'Price comparison in Bangladesh: why one search beats ten browser tabs',
    metaDescription:
      'Stop opening a dozen tabs to compare prices. Learn how one search lines up recently checked listings and available seller signals side by side.',
    faqs: [
      {
        q: 'Is Damkemon free to use?',
        a: 'Yes. Searching and comparing prices across Bangladeshi shops is completely free for shoppers — there is no fee and no account required to compare.',
      },
      {
        q: 'Where do the prices come from?',
        a: 'Prices come from listings at shops across Bangladesh and include a checked-at timestamp. Always confirm the final price and stock on the seller’s page before paying.',
      },
      {
        q: 'Can I search in Bangla?',
        a: 'Yes. Damkemon understands Bengali and common transliterations, so you can type a product name in Bangla or English and still get the same side-by-side comparison.',
      },
      {
        q: 'Why is the cheapest price not always the best choice?',
        a: 'A low price is only useful if the listing and seller check out. Damkemon shows available seller, delivery and rating signals, but you should still confirm the final price, stock and seller policy before paying.',
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
          Price comparison reduces that work by putting <strong>recently checked listing prices and
          available seller context</strong> in one search. Here is why that beats ten browser tabs.
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
          show you how the same product is priced elsewhere or whether seller context is available.
        </p>

        <h2>What a single price-comparison search actually does</h2>
        <p>
          A price-comparison engine flips the work around. Instead of you visiting every shop, you type
          the product <strong>once</strong> and it lines up matching offers in Damkemon’s catalog —
          recently checked listing prices in one view. Type{' '}
          <Link to="/search?q=iphone">a phone model</Link>, a brand, or a category and the whole market
          answers at once. You can even search in Bangla; Damkemon understands Bengali and
          transliteration, so <span lang="bn">দাম কেমন</span> works as well as “price”.
        </p>

        <h2>Price is only one-third of a good decision</h2>
        <p>
          The cheapest price is worthless if the seller never ships, or if the listing is a fake low
          price designed to pull an advance payment. That is the difference between a plain comparison
          site and a useful comparison: where data is available, a price can sit beside a{' '}
          <strong>seller score</strong>, ratings, typical delivery and policy details. These are
          decision signals, not a guarantee, so confirm everything important on the seller’s page.
        </p>
        <p>
          If you want to understand how that score sees through bait pricing, read{' '}
          <Link to="/guides/how-trust-score-spots-fake-low-prices">
            what our seller score means and what it does not
          </Link>
          . For an unknown seller — such as a Facebook page — use the independent checks in our{' '}
          <Link to="/guides/buying-from-unknown-seller-check-risk">buyer-safety guide</Link>.
        </p>

        <Callout tone="green" title="A quick example">
          Search a popular phone and you may see several offers. The cheapest can have little seller
          context, while another costs slightly more and has a longer shop history, ratings or a clearer
          return policy. One comparison shows the price difference and the available evidence together.
        </Callout>

        <h2>How to get the most out of one search</h2>
        <p>
          Start broad, then narrow: search the product, scan the lined-up prices, and check the trust
          score before you fixate on the lowest figure. Watch the{' '}
          price history on the relevant product page before big festival sales — a “30% off” banner
          is worth checking against earlier prices. For any seller you do not recognise, verify its
          page history, payment identity and independent reviews before paying.
        </p>

        <KeyTakeaways
          items={[
            'Ten tabs cost time; one search lines up matching offers from Damkemon’s current catalog.',
            'Available seller, rating and delivery signals add context to price, but do not guarantee a purchase.',
            'You can search in Bangla or English and still get the full comparison.',
            'Confirm the final price, stock and seller policy before paying.',
          ]}
        />
      </>
    ),
  },

  /* ============================ GUIDE 2 ============================ */
  {
    slug: 'buying-from-unknown-seller-check-risk',
    title: 'Buying from an unknown seller? Check the risk first',
    dek: 'Use price, payment and seller-history checks before you hand over money.',
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
      'Facebook-page sellers and “Send Money” advance payments are common scam risks. Learn the red flags and how to check a seller before you pay.',
    faqs: [
      {
        q: 'Is it safe to pay in advance to an online seller in Bangladesh?',
        a: 'Prefer cash on delivery whenever you can. If you must pay in advance, keep it small, verify the seller first, and never use bKash or Nagad “Send Money” to an unverified personal number.',
      },
      {
        q: 'What is the bKash “Send Money” trap?',
        a: 'Scammers ask you to use the personal “Send Money” option instead of a merchant Payment, because Send Money to a personal number is hard to trace or reverse. A genuine shop almost always uses a merchant or cash-on-delivery flow.',
      },
      {
        q: 'How can I check a Facebook seller?',
        a: 'Compare the asking price with established shops, inspect the page history and independent reviews, verify its payment identity, and prefer cash on delivery. A price far below the market plus pressure to pay a personal number is a strong warning.',
      },
      {
        q: 'Can Damkemon get my money back if I am scammed?',
        a: 'No. Damkemon does not hold payments, guarantee sellers or recover money. Compare the market price, verify the seller independently, prefer cash on delivery and keep your payment and conversation records.',
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
          You do not have to stop buying from small or unknown sellers. You need a consistent risk
          check before paying, starting with the market price and the seller’s independent history.
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

        <h2>How Damkemon helps with the first check</h2>
        <p>
          Search the product on Damkemon to see whether the asking price is anywhere near the listed
          market. On product comparisons, use the available seller, delivery and payment signals to
          narrow the shortlist. Then verify the seller independently before sending money.
        </p>

        <Callout tone="ink" title="A comparison is not a payment guarantee">
          Damkemon does not hold your money, guarantee a seller, or recover a payment. Treat price and
          trust signals as a shortlist, not insurance. Prefer cash on delivery and never advance more
          than you can afford to lose.
        </Callout>

        <h2>Check the deal in three steps</h2>
        <ol>
          <li>Compare the product’s asking price with several established shops.</li>
          <li>Verify the seller’s page history, payment identity, address and independent reviews.</li>
          <li>Prefer cash on delivery; if you proceed, save the listing, messages and receipt.</li>
        </ol>

        <KeyTakeaways
          items={[
            'The biggest BD scam is the advance “Send Money” to a personal number — never do it.',
            'Compare the asking price with established shops before you pay.',
            'Verify page history, payment identity and independent reviews—not screenshots supplied by the seller.',
            'Damkemon is a comparison tool, not escrow or a payment guarantee; still prefer cash on delivery.',
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
    title: 'What Damkemon’s seller score means',
    dek: 'Editorial shop facts and available buyer or listing ratings, summarized clearly.',
    readMin: 5,
    category: 'How it works',
    tone: 'bg-yellow-soft text-ink',
    Icon: PhSealCheck,
    datePublished: '2026-06-16',
    dateModified: '2026-07-15',
    keywords: [
      'fake discount Bangladesh', 'too good to be true price', 'is this online seller genuine',
      'trust score', 'fake MRP Bangladesh', 'how to tell if a shop is real',
    ],
    metaTitle: 'What Damkemon’s seller score means — and what it does not',
    metaDescription:
      'Learn which editorial, buyer and listing signals feed Damkemon’s seller score, what is shown separately, and why the score is not a purchase guarantee.',
    faqs: [
      {
        q: 'What does a higher seller score mean?',
        a: 'It means the shop has a stronger editorial baseline and, where available, more positive buyer or listing-rating signals. It is a comparison aid, not proof that a specific listing or transaction is safe.',
      },
      {
        q: 'Does the seller score verify that a price is real?',
        a: 'No. Compare the offer with other shops and its product price history, then confirm the final price and stock on the seller’s page. The seller score does not authenticate an individual offer.',
      },
      {
        q: 'Does a low seller score mean a shop is a scam?',
        a: 'No. It can mean limited or weaker available signals. Verify the shop independently, prefer cash on delivery and never treat one score as a final verdict.',
      },
      {
        q: 'How is the seller score calculated?',
        a: 'It starts with an editorial shop baseline, then incorporates available buyer ratings, trust votes, recommendations, scraped listing ratings and a small verified-buyer confidence adjustment. Delivery and return details are displayed separately.',
      },
    ],
    Body: () => (
      <>
        <p>
          A price alone does not tell you enough about a seller. Damkemon’s seller score summarizes
          the signals currently available for a shop, so offers are easier to compare. It does not
          authenticate a listing, insure a payment or promise that an order will go well.
        </p>

        <h2>What feeds the score</h2>
        <p>
          Each known shop begins with an editorial baseline. That profile records details such as the
          shop type, typical delivery window, cash-on-delivery availability, returns and warranty notes.
          The numeric score then moves as real feedback becomes available.
        </p>
        <ul>
          <li><strong>Buyer ratings.</strong> Star ratings gradually move the baseline as the sample grows.</li>
          <li><strong>Trust and recommendation votes.</strong> Community feedback adds a smaller positive or negative adjustment.</li>
          <li><strong>Listing ratings.</strong> Available ratings collected from seller listings contribute with a limited weight.</li>
          <li><strong>Verified-buyer signal.</strong> Reviews connected to a prior outbound seller visit get a small confidence adjustment.</li>
        </ul>

        <h2>What does not feed the score</h2>
        <p>
          The seller score does not currently judge whether one specific price is fake, and it does not
          include product price history, stock depth or dispute history. Typical delivery, cash on
          delivery, returns and warranty details are shown beside the score, but they are not part of
          the numeric calculation. Keeping these boundaries visible prevents one number from claiming
          more than the evidence supports.
        </p>

        <Callout tone="green" title="Use the score as a shortlist, not a guarantee">
          Compare the seller score, ratings and policies, then cross-check the offer against other
          sellers. Confirm price and stock on the destination page and prefer cash on delivery when
          you do not already know the shop.
        </Callout>

        <h2>How to assess a suspiciously low price</h2>
        <p>
          A genuine clearance, grey-market unit, refurbished device and bait offer can all look cheap
          for different reasons. Compare the same model and condition across several shops, inspect the
          product’s recorded price history, and check warranty and return terms. A large price gap is a
          reason to investigate, not automatic proof of a scam.
        </p>

        <h2>How to use the seller score</h2>
        <p>
          Start with a <Link to="/search">product search</Link>, compare like-for-like offers, and use
          the seller score to decide which shops deserve a closer look. Then read the underlying ratings,
          delivery and policy details. If evidence is thin, verify the seller independently before paying.
        </p>

        <KeyTakeaways
          items={[
            'The seller score starts with an editorial baseline and adjusts with available rating and community signals.',
            'Delivery, returns, warranty and price history are useful context but do not feed the numeric score.',
            'A high score is not a transaction guarantee, and a low score is not proof of fraud.',
            'Compare like-for-like offers and confirm the final price, stock and policy on the seller’s page.',
          ]}
        />

        <p>
          Want the bigger picture on comparing safely? See{' '}
          <Link to="/guides/why-one-search-beats-ten-browser-tabs">
            why one search beats ten browser tabs
          </Link>{' '}
          and{' '}
          <Link to="/guides/buying-from-unknown-seller-check-risk">
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
