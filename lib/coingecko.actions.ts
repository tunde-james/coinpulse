'use server';

import qs from 'query-string';

const BASE_URL = process.env.COINGECKO_BASE_URL;
const API_KEY = process.env.COINGECKO_API_KEY;

if (!BASE_URL) throw new Error('Could not get base url');
if (!API_KEY) throw new Error('Could not get api key');

export async function fetcher<T>(
  endpoint: string,
  params?: QueryParams,
  revalidate = 60,
): Promise<T> {
  const url = qs.stringifyUrl(
    {
      url: `${BASE_URL}/${endpoint}`,
      query: params,
    },
    { skipEmptyString: true, skipNull: true },
  );

  const response = await fetch(url, {
    headers: {
      'x-cg-demo-api-key': API_KEY,
      'Content-Type': 'application/json',
    } as Record<string, string>,
    next: { revalidate },
  });

  if (!response.ok) {
    const errorBody: CoinGeckoErrorBody = await response
      .json()
      .catch(() => ({}));

    console.error('API Error Details:', {
      status: response.status,
      url,
      error: errorBody,
    });

    throw new Error(
      `API Error: ${response.status}: ${errorBody.error || response.statusText}`,
    );
  }

  return response.json();
}

export async function getPools(
  id: string,
  network?: string | null,
  contractAddress?: string | null,
): Promise<PoolData> {
  const fallback: PoolData = {
    id: '',
    address: '',
    name: '',
    network: '',
  };

  if (network && contractAddress) {
    const poolData = await fetcher<{ data: PoolData[] }>(
      `/onchain/networks/${network}/tokens/${contractAddress}/pools`,
    );

    return poolData.data?.[0] ?? fallback;
  }

  try {
    const poolData = await fetcher<{ data: PoolData[] }>(
      '/onchain/search/pools',
      { query: id },
    );

    return poolData.data?.[0] ?? fallback;
  } catch {
    return fallback;
  }
}

export interface SearchCoinBasic {
  id: string;
  name: string;
  api_symbol: string;
  symbol: string;
  market_cap_rank: number;
  thumb: string;
  large: string;
}

export interface SearchResponse {
  coins: SearchCoinBasic[];
}

export async function searchCoins(query: string): Promise<CoinMarketData[]> {
  if (!query || query.trim().length === 0) {
    return [];
  }

  try {
    const searchData = await fetcher<SearchResponse>('/search', { query });

    const topCoinIds = (searchData.coins ?? [])
      .slice(0, 10)
      .map((coin) => coin.id);

    if (topCoinIds.length === 0) {
      return [];
    }

    const marketData = await fetcher<CoinMarketData[]>('/coins/markets', {
      vs_currency: 'usd',
      ids: topCoinIds.join(','),
      order: 'market_cap_desc',
      price_change_percentage: '24h',
      sparkline: false,
    });

    return marketData;
  } catch (error) {
    console.error('Error in searchCoins:', error);
    return [];
  }
}

export async function getTrendingCoins(): Promise<TrendingCoin[]> {
  try {
    const data = await fetcher<{ coins: TrendingCoin[] }>('/search/trending');
    return data.coins ?? [];
  } catch (error) {
    console.error('Error fetching trending coins:', error);
    return [];
  }
}
