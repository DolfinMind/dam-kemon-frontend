import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { GUIDES } from '../content/guides';
import { BookOpen, ArrowRight } from 'lucide-react';

export default function Guides() {
  useEffect(() => {
    document.title = 'Guides & Insights — Damkemon';
  }, []);

  return (
    <div className="container-tight py-6 sm:py-10 lg:py-14">
      <Helmet>
        <title>Bangladesh online shopping guides | Damkemon</title>
        <meta name="description" content="Practical guides for comparing prices, spotting fake discounts and buying safely from online sellers in Bangladesh." />
        <link rel="canonical" href="https://damkemon.com/guides" />
      </Helmet>
      {/* Header */}
      <div className="mb-10 sm:mb-14">
        <div className="flex items-center gap-2 mb-3">
          <span className="w-7 h-px bg-acid-deep" />
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-gray">Learn</span>
        </div>
        <h1 className="font-sans font-extrabold text-[clamp(2rem,5vw,3.5rem)] leading-[1.05] tracking-[-0.03em] text-ink max-w-2xl">
          Guides &amp; insights
        </h1>
        <p className="text-ink/65 text-[15px] sm:text-lg mt-4 max-w-lg leading-relaxed">
          Everything you need to know to buy smarter in Bangladesh. From spotting fake discounts to buying safely from unknown sellers.
        </p>
      </div>

      {/* Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
        {GUIDES.map((g) => {
          const Icon = g.Icon || BookOpen;
          return (
            <Link key={g.slug} to={`/guides/${g.slug}`} className="group card-soft p-6 sm:p-7 flex flex-col hover:border-line-strong transition-colors">
              <div className="flex items-center justify-between mb-5">
                <span className={`w-12 h-12 rounded-2xl flex items-center justify-center ${g.tone || 'bg-ink/5 text-ink'}`}>
                  <Icon className="w-5 h-5" weight="duotone" />
                </span>
                <span className="font-mono text-[10px] uppercase tracking-wider text-gray">{g.readMin} min read</span>
              </div>
              <h2 className="font-sans text-xl font-bold text-ink leading-snug group-hover:text-acid-deep transition-colors mb-3">
                {g.title}
              </h2>
              <p className="text-ink/65 text-sm leading-relaxed flex-1">
                {g.dek}
              </p>
              <div className="mt-6 flex items-center justify-between pt-5 border-t border-line">
                <span className="font-mono text-[10px] uppercase tracking-wider text-gray">{g.category}</span>
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink group-hover:text-acid-deep transition-colors">
                  Read <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
