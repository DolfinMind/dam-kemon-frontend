import { useParams, Link, Navigate } from 'react-router-dom';
import { getGuide, otherGuides } from '../content/guides';
import GuideSEO from '../components/GuideSEO';
import { ArrowLeft, Clock, CalendarDays, ArrowRight } from 'lucide-react';

export default function GuideDetail() {
  const { slug } = useParams();
  const guide = getGuide(slug);

  if (!guide) {
    return <Navigate to="/guides" replace />;
  }

  const others = otherGuides(slug);

  return (
    <div className="container-tight py-6 sm:py-10 lg:py-14">
      <GuideSEO guide={guide} />

      {/* Back link */}
      <Link to="/guides" className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink/60 hover:text-ink transition-colors mb-8 sm:mb-12">
        <ArrowLeft className="w-4 h-4" /> All guides
      </Link>

      <div className="grid lg:grid-cols-[1fr_300px] gap-10 lg:gap-16 items-start">
        {/* Main Article */}
        <article className="max-w-[700px]">
          <header className="mb-8 sm:mb-10">
            <div className="flex items-center gap-3 mb-4">
              <span className="chip chip-ghost !bg-ink/5 !text-ink">{guide.category}</span>
              <span className="inline-flex items-center gap-1.5 text-xs font-mono text-gray">
                <Clock className="w-3.5 h-3.5" /> {guide.readMin} min
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs font-mono text-gray">
                <CalendarDays className="w-3.5 h-3.5" /> {new Date(guide.datePublished).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
            <h1 className="font-sans font-extrabold text-[clamp(1.8rem,4.5vw,3rem)] leading-[1.05] tracking-[-0.03em] text-ink mb-4">
              {guide.title}
            </h1>
            <p className="text-lg sm:text-xl text-ink/65 leading-relaxed">
              {guide.dek}
            </p>
          </header>

          <div className="prose prose-ink prose-lg max-w-none prose-headings:font-sans prose-headings:font-extrabold prose-headings:tracking-tight prose-a:text-acid-deep prose-a:no-underline hover:prose-a:underline prose-img:rounded-2xl prose-img:border prose-img:border-line">
            <guide.Body />
          </div>
        </article>

        {/* Sidebar */}
        <aside className="sticky top-24 lg:pt-2">
          <h3 className="font-sans font-bold text-sm uppercase tracking-[0.14em] text-gray mb-5">
            More guides
          </h3>
          <div className="space-y-4">
            {others.map((g) => {
              const Icon = g.Icon;
              return (
                <Link key={g.slug} to={`/guides/${g.slug}`} className="group block p-4 rounded-2xl border border-line bg-surface hover:shadow-[var(--shadow-lift)] hover:border-line-strong transition-all">
                  <div className="flex gap-4">
                    <span className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${g.tone}`}>
                      {Icon && <Icon className="w-5 h-5" weight="duotone" />}
                    </span>
                    <div>
                      <h4 className="font-sans font-bold text-sm text-ink leading-snug group-hover:text-acid-deep transition-colors mb-1.5">
                        {g.title}
                      </h4>
                      <span className="font-mono text-[10px] uppercase tracking-wider text-gray inline-flex items-center gap-1">
                        {g.readMin} min <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </aside>
      </div>
    </div>
  );
}
