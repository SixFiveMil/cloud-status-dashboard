import * as cheerio from 'cheerio';
import { getProviderConfig, PROVIDER_TIMEOUT_MS } from '../constants';
import { classifyByKeywords } from '../keywords';
import { createUnknownStatus, normalizeDescription } from '../normalize';
import { NormalizedStatus } from '../types';
import { fetchTextWithTimeout, normalizeText } from '../utils';

function getDecodedFeedText(text: string): string {
  if (!text) {
    return '';
  }

  return normalizeText(cheerio.load(text).text());
}

export async function fetchO365Status(): Promise<NormalizedStatus> {
  const config = getProviderConfig('o365');

  try {
    const xml = await fetchTextWithTimeout(
      'https://status.office.com/api/feed/mac',
      {},
      PROVIDER_TIMEOUT_MS
    );
    const $ = cheerio.load(xml, { xmlMode: true });
    const firstItem = $('item').first();

    if (firstItem.length === 0) {
      return {
        id: config.id,
        name: config.name,
        status: 'operational',
        description: 'All systems operational',
        link: config.link,
        lastUpdated: new Date().toISOString(),
      };
    }

    const title = normalizeText(firstItem.find('title').text());
    const description = getDecodedFeedText(firstItem.find('description').text());
    const status = classifyByKeywords(`${title} ${description}`);
    const pubDate = normalizeText(firstItem.find('pubDate').text());
    const lastBuildDate = normalizeText($('channel > lastBuildDate').first().text());
    const updatedAt =
      (pubDate && !Number.isNaN(Date.parse(pubDate)) ? new Date(pubDate).toISOString() : '') ||
      (lastBuildDate && !Number.isNaN(Date.parse(lastBuildDate))
        ? new Date(lastBuildDate).toISOString()
        : '') ||
      new Date().toISOString();

    return {
      id: config.id,
      name: config.name,
      status,
      description: normalizeDescription(title || description, 'All systems operational'),
      link: config.link,
      lastUpdated: updatedAt,
    };
  } catch {
    return createUnknownStatus(config);
  }
}
