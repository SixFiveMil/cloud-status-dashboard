import { NextRequest, NextResponse } from 'next/server';
import { fetchAllProviderStatuses, fetchProviderStatuses, fetchProviderStatusesByCategory } from '@/lib/status';
import { PROVIDERS, PROVIDER_CATEGORIES } from '@/lib/status/constants';
import { createUnknownStatus } from '@/lib/status/normalize';
import { ProviderCategory } from '@/lib/status/types';

export const dynamic = 'force-dynamic';

function isProviderCategory(value: string | null): value is ProviderCategory {
  return PROVIDER_CATEGORIES.some((category) => category.id === value);
}

function parseProviderIds(value: string | null): string[] | undefined {
  if (!value) {
    return undefined;
  }

  const validProviderIds = new Set(PROVIDERS.map((provider) => provider.id));

  return Array.from(
    new Set(
      value
        .split(',')
        .map((providerId) => providerId.trim())
        .filter((providerId) => validProviderIds.has(providerId))
    )
  );
}

export async function GET(request: NextRequest) {
  try {
    const category = request.nextUrl.searchParams.get('category');
    const providerIds = parseProviderIds(request.nextUrl.searchParams.get('providers'));
    let statuses;

    if (isProviderCategory(category)) {
      const categoryProviderIdSet = new Set(
        PROVIDERS.filter((provider) => provider.category === category).map((provider) => provider.id)
      );
      const categoryProviderIds = providerIds?.filter((providerId) => categoryProviderIdSet.has(providerId));
      statuses = categoryProviderIds ? await fetchProviderStatuses(categoryProviderIds) : await fetchProviderStatusesByCategory(category);
    } else {
      statuses = providerIds ? await fetchProviderStatuses(providerIds) : await fetchAllProviderStatuses();
    }

    return NextResponse.json(statuses);
  } catch (error) {
    console.error('Error fetching provider statuses:', error);

    const category = request.nextUrl.searchParams.get('category');
    const providerIds = parseProviderIds(request.nextUrl.searchParams.get('providers'));
    const providersByCategory = isProviderCategory(category)
      ? PROVIDERS.filter((provider) => provider.category === category)
      : PROVIDERS;
    const providers = providerIds
      ? providersByCategory.filter((provider) => providerIds.includes(provider.id))
      : providersByCategory;

    return NextResponse.json(providers.map((provider) => createUnknownStatus(provider)));
  }
}
