import { getProviderConfig } from '../constants';
import { createManualCheckStatus } from '../normalize';
import { NormalizedStatus } from '../types';
import { normalizeText } from '../utils';
import { fetchStatuspageSummaryStatus } from './statuspage-utils';

const WORKDAY_STATUS_SUMMARY_URL = 'https://status.workday.com/api/v2/summary.json';

export async function fetchWorkdayStatus(): Promise<NormalizedStatus> {
  const config = getProviderConfig('workday');
  const cookie = normalizeText(process.env.WORKDAY_STATUS_COOKIE);
  const authorization = normalizeText(process.env.WORKDAY_STATUS_AUTHORIZATION);

  if (!cookie && !authorization) {
    return createManualCheckStatus(config);
  }

  const headers: HeadersInit = {
    Accept: 'application/json',
  };

  if (cookie) {
    headers.Cookie = cookie;
  }

  if (authorization) {
    headers.Authorization = authorization;
  }

  return fetchStatuspageSummaryStatus(config.id, WORKDAY_STATUS_SUMMARY_URL, { headers });
}
