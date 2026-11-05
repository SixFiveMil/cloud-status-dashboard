'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { ArrowLeft, Check } from 'lucide-react';
import { getProvidersByCategory, PROVIDER_CATEGORIES, PROVIDERS } from '@/lib/status/constants';
import {
  formatRefreshIntervalLabel,
  readDashboardMonitoringPreferences,
  RefreshIntervalOptionMs,
  REFRESH_INTERVAL_OPTIONS_MS,
  writeDashboardMonitoringPreferences,
} from '@/lib/status/preferences';

export default function SettingsPage() {
  const initialPreferences = readDashboardMonitoringPreferences();
  const [monitoredProviderIds, setMonitoredProviderIds] = useState<string[]>(
    initialPreferences?.monitoredProviderIds ?? []
  );
  const [refreshIntervalMs, setRefreshIntervalMs] = useState<RefreshIntervalOptionMs>(
    initialPreferences?.refreshIntervalMs ?? REFRESH_INTERVAL_OPTIONS_MS[1]
  );
  const [hasSaved, setHasSaved] = useState(false);

  const monitoredProviderIdSet = useMemo(
    () => (monitoredProviderIds.length > 0 ? new Set(monitoredProviderIds) : null),
    [monitoredProviderIds]
  );

  const toggleProvider = (providerId: string) => {
    setHasSaved(false);
    setMonitoredProviderIds((current) => {
      if (current.length === 0) {
        return [providerId];
      }

      if (current.includes(providerId)) {
        return current.filter((id) => id !== providerId);
      }

      return [...current, providerId];
    });
  };

  const handleSave = () => {
    writeDashboardMonitoringPreferences({
      monitoredProviderIds,
      refreshIntervalMs,
    });
    setHasSaved(true);
  };

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1400px] space-y-6">
        <section className="rounded-4xl border border-(--panel-border) bg-(--panel) p-6 shadow-[0_26px_90px_rgba(2,10,28,0.38)] backdrop-blur xl:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-(--panel-border) pb-6">
            <div>
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.34em] text-sky-300/78">
                Dashboard Configuration
              </p>
              <h1 className="font-headline text-4xl font-bold tracking-[-0.04em] text-white md:text-5xl">
                Monitoring Settings
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-(--muted) md:text-base">
                Pick the providers this dashboard should monitor and set how often the board
                refreshes automatically.
              </p>
            </div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full border border-(--panel-border) bg-(--toolbar) px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-(--muted) transition hover:border-white/20 hover:text-white focus:outline-none focus:ring-2 focus:ring-(--focus-ring)"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back to Dashboard
            </Link>
          </div>

          <section className="mt-6 rounded-3xl border border-(--panel-border) bg-(--toolbar)/70 p-4 sm:p-5">
            <h2 className="text-sm font-semibold uppercase tracking-[0.24em] text-white">
              Automatic Refresh Interval
            </h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {REFRESH_INTERVAL_OPTIONS_MS.map((option) => {
                const isActive = refreshIntervalMs === option;

                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => {
                      setHasSaved(false);
                      setRefreshIntervalMs(option);
                    }}
                    className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition focus:outline-none focus:ring-2 focus:ring-(--focus-ring) ${
                      isActive
                        ? 'border-sky-300/40 bg-sky-400/12 text-sky-100'
                        : 'border-(--panel-border) bg-(--panel) text-(--muted) hover:border-white/20 hover:text-white'
                    }`}
                  >
                    {formatRefreshIntervalLabel(option)}
                  </button>
                );
              })}
            </div>
          </section>

          <section className="mt-5 rounded-3xl border border-(--panel-border) bg-(--toolbar)/70 p-4 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-[0.24em] text-white">
                  Monitored Providers
                </h2>
                <p className="mt-2 text-sm leading-6 text-(--muted)">
                  Leave everything unselected to monitor all providers.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setHasSaved(false);
                    setMonitoredProviderIds([]);
                  }}
                  className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition focus:outline-none focus:ring-2 focus:ring-(--focus-ring) ${
                    monitoredProviderIds.length === 0
                      ? 'border-sky-300/40 bg-sky-400/12 text-sky-100'
                      : 'border-(--panel-border) bg-(--panel) text-(--muted) hover:border-white/20 hover:text-white'
                  }`}
                >
                  All Providers ({PROVIDERS.length})
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setHasSaved(false);
                    setMonitoredProviderIds(PROVIDERS.map((provider) => provider.id));
                  }}
                  className="rounded-full border border-(--panel-border) bg-(--panel) px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-(--muted) transition hover:border-white/20 hover:text-white focus:outline-none focus:ring-2 focus:ring-(--focus-ring)"
                >
                  Select All
                </button>
              </div>
            </div>

            <div className="mt-4 space-y-4">
              {PROVIDER_CATEGORIES.map((category) => {
                const categoryProviders = getProvidersByCategory(category.id);

                return (
                  <section key={category.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-white/90">
                        {category.label}
                      </h3>
                      <p className="text-[11px] uppercase tracking-[0.22em] text-(--muted)">
                        {categoryProviders.length} providers
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {categoryProviders.map((provider) => {
                        const isSelected = monitoredProviderIdSet
                          ? monitoredProviderIdSet.has(provider.id)
                          : false;

                        return (
                          <button
                            key={provider.id}
                            type="button"
                            onClick={() => {
                              toggleProvider(provider.id);
                            }}
                            className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] transition focus:outline-none focus:ring-2 focus:ring-(--focus-ring) ${
                              isSelected
                                ? 'border-sky-300/40 bg-sky-400/12 text-sky-100'
                                : 'border-(--panel-border) bg-(--panel) text-(--muted) hover:border-white/20 hover:text-white'
                            }`}
                          >
                            {isSelected && <Check className="h-3.5 w-3.5" aria-hidden="true" />}
                            {provider.name}
                          </button>
                        );
                      })}
                    </div>
                  </section>
                );
              })}
            </div>
          </section>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleSave}
              className="inline-flex items-center rounded-full border border-sky-300/40 bg-sky-400/12 px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-sky-100 transition hover:border-sky-200/60 hover:bg-sky-400/20 focus:outline-none focus:ring-2 focus:ring-(--focus-ring)"
            >
              Save Configuration
            </button>
            {hasSaved && (
              <p className="text-sm text-emerald-200">
                Saved. The dashboard will use these settings on the next refresh.
              </p>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
