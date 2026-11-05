import { CLIENT_REFRESH_MS, PROVIDERS } from './constants';

export const DASHBOARD_MONITORING_COOKIE = 'status_dashboard_monitoring';
export const DASHBOARD_MONITORING_MAX_AGE_SECONDS = 60 * 60 * 24 * 120;

export const REFRESH_INTERVAL_OPTIONS_MS = [
  60_000,
  300_000,
  900_000,
  1_800_000,
] as const;

export type RefreshIntervalOptionMs = (typeof REFRESH_INTERVAL_OPTIONS_MS)[number];

export interface DashboardMonitoringPreferences {
  monitoredProviderIds: string[];
  refreshIntervalMs: RefreshIntervalOptionMs;
}

const VALID_PROVIDER_IDS = new Set(PROVIDERS.map((provider) => provider.id));

function isRefreshIntervalOption(value: number): value is RefreshIntervalOptionMs {
  return REFRESH_INTERVAL_OPTIONS_MS.includes(value as RefreshIntervalOptionMs);
}

function readCookieValue(name: string): string | null {
  if (typeof document === 'undefined') {
    return null;
  }

  const rawCookie = document.cookie.split('; ').find((entry) => entry.startsWith(`${name}=`));

  return rawCookie ? rawCookie.slice(name.length + 1) : null;
}

export function readDashboardMonitoringPreferences(): DashboardMonitoringPreferences | null {
  const rawValue = readCookieValue(DASHBOARD_MONITORING_COOKIE);

  if (!rawValue) {
    return null;
  }

  try {
    const parsed = JSON.parse(decodeURIComponent(rawValue)) as Partial<DashboardMonitoringPreferences>;

    if (!parsed || typeof parsed !== 'object') {
      return null;
    }

    const monitoredProviderIds = Array.isArray(parsed.monitoredProviderIds)
      ? parsed.monitoredProviderIds.filter(
          (value): value is string => typeof value === 'string' && VALID_PROVIDER_IDS.has(value)
        )
      : [];
    const refreshIntervalMs =
      typeof parsed.refreshIntervalMs === 'number' && isRefreshIntervalOption(parsed.refreshIntervalMs)
        ? parsed.refreshIntervalMs
        : CLIENT_REFRESH_MS;

    return {
      monitoredProviderIds,
      refreshIntervalMs,
    };
  } catch {
    return null;
  }
}

export function writeDashboardMonitoringPreferences(preferences: DashboardMonitoringPreferences) {
  if (typeof document === 'undefined') {
    return;
  }

  document.cookie = `${DASHBOARD_MONITORING_COOKIE}=${encodeURIComponent(
    JSON.stringify(preferences)
  )}; path=/; max-age=${DASHBOARD_MONITORING_MAX_AGE_SECONDS}; samesite=lax`;
}

export function formatRefreshIntervalLabel(intervalMs: number): string {
  const minutes = Math.round(intervalMs / 60_000);

  if (minutes < 60) {
    return `${minutes} min`;
  }

  const hours = minutes / 60;

  return Number.isInteger(hours) ? `${hours} hr` : `${hours.toFixed(1)} hr`;
}
