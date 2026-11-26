import React from 'react';

interface FooterProps {
  onNavigateSection: (sectionId: string) => void;
  onLaunchChart: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigateSection,
  onLaunchChart,
}) => {
  return (
    <footer className="border-t border-[#E0E3EB] dark:border-[#2A2E39] bg-[#F8F9FD] dark:bg-[#0F131C] mt-16">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-5">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 text-base font-extrabold text-[#131722] dark:text-white">
              <svg
                width="24"
                height="16"
                viewBox="0 0 36 24"
                fill="none"
                aria-hidden="true"
                className="text-[#131722] dark:text-white"
              >
                <path d="M2 5H15V10H10V21H5V10H2V5Z" fill="currentColor" />
                <circle cx="19" cy="7.5" r="3" fill="#2962FF" />
                <path d="M23.5 5H29L22.5 21H17L23.5 5Z" fill="currentColor" />
              </svg>
              <span>TradingView</span>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-[#6A6D78] dark:text-[#868993]">
              Global market intelligence across equities, indices, digital assets, currencies, commodities, and sovereign yields.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#131722] dark:text-white">
              Markets
            </h4>
            <ul className="mt-3 space-y-2 text-xs text-[#6A6D78] dark:text-[#868993]">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigateSection('market-summary')}
                  className="hover:text-[#2962FF] transition-colors"
                >
                  World Indices
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigateSection('stocks-section')}
                  className="hover:text-[#2962FF] transition-colors"
                >
                  US Stocks &amp; Sectors
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigateSection('crypto-forex-section')}
                  className="hover:text-[#2962FF] transition-colors"
                >
                  Cryptocurrencies
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigateSection('forex-panel')}
                  className="hover:text-[#2962FF] transition-colors"
                >
                  Forex Benchmarks
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#131722] dark:text-white">
              Macro &amp; Rates
            </h4>
            <ul className="mt-3 space-y-2 text-xs text-[#6A6D78] dark:text-[#868993]">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigateSection('futures-bonds-section')}
                  className="hover:text-[#2962FF] transition-colors"
                >
                  Commodity Futures
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigateSection('bonds-panel')}
                  className="hover:text-[#2962FF] transition-colors"
                >
                  Treasury Yield Curve
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigateSection('calendar-panel')}
                  className="hover:text-[#2962FF] transition-colors"
                >
                  Economic Calendar
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#131722] dark:text-white">
              Analysis
            </h4>
            <ul className="mt-3 space-y-2 text-xs text-[#6A6D78] dark:text-[#868993]">
              <li>
                <button
                  type="button"
                  onClick={onLaunchChart}
                  className="hover:text-[#2962FF] transition-colors"
                >
                  Supercharts
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigateSection('community-news-section')}
                  className="hover:text-[#2962FF] transition-colors"
                >
                  Community Ideas
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigateSection('community-news-section')}
                  className="hover:text-[#2962FF] transition-colors"
                >
                  Top Financial Stories
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#131722] dark:text-white">
              Disclosures
            </h4>
            <p className="mt-3 text-xs leading-relaxed text-[#6A6D78] dark:text-[#868993]">
              Market quotes, charts, and yields shown in this workspace are simulated reference data for display and interactive analysis.
            </p>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-[#E0E3EB] dark:border-[#2A2E39] pt-6 text-xs text-[#6A6D78] dark:text-[#868993]">
          <span>© 2026 TradingView Markets Workspace</span>
          <span>Global · English (US)</span>
        </div>
      </div>
    </footer>
  );
};
