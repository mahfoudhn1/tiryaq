import Link from 'next/link';
import type { Translate } from './shared';

const NAV: { href: string; key: Parameters<Translate>[0] }[] = [
  { href: '#learn', key: 'homeNavLearn' },
  { href: '#practice', key: 'homeNavPractice' },
  { href: '#tools', key: 'homeNavTools' },
  { href: '#instructors', key: 'homeNavInstructors' },
  { href: '#faq', key: 'homeNavFaq' },
];

export function SiteFooter({ t }: { t: Translate }) {
  return (
    <footer className="border-t border-[#DCE3EA] bg-[#F4F9FD] px-5 py-12 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <Link
              href="/"
              className="home-display text-[18px] text-[#123247] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0369A1]/40"
            >
              tiryaq
            </Link>
            <p className="mt-1 text-[12px] text-[#5B7184]">{t('homeFooterTagline')}</p>
          </div>
          <nav className="flex flex-wrap gap-6 text-[12px] font-semibold text-[#5B7184]">
            {NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="transition-colors hover:text-[#123247] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0369A1]/40"
              >
                {t(item.key)}
              </a>
            ))}
          </nav>
        </div>
        <div className="mt-8 flex flex-col gap-2 border-t border-[#E1E7EE] pt-6 text-[11px] text-[#93A5B3] sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} Tiryaq</span>
          <span>{t('homeFooterTaglineTodo')}</span>
        </div>
      </div>
    </footer>
  );
}
