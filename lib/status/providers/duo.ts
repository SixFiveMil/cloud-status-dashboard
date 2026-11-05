import { NormalizedStatus } from '../types';
import { fetchStatuspageSummaryStatus } from './statuspage-utils';

export async function fetchDuoStatus(): Promise<NormalizedStatus> {
  return fetchStatuspageSummaryStatus('duo', 'https://status.duo.com/api/v2/summary.json');
}
