import Image from 'next/image';

import { fetcher } from '@/lib/coingecko.actions';
import { formatCurrency } from '@/lib/utils';
import { CoinOverviewFallback } from './fallback';
import CandlestickCharts from '../candlestick-charts';

const fetchCoinData = async () => {
  try {
    const [coin, coinOHLCData] = await Promise.all([
      fetcher<CoinDetailsData>('/coins/bitcoin'),
      fetcher<OHLCData[]>('/coins/bitcoin/ohlc', {
        vs_currency: 'usd',
        days: 1,
      }),
    ]);

    return { success: true as const, coin, coinOHLCData };
  } catch (error) {
    console.error('Error fetching coin overview:', error);
    return { success: false as const };
  }
};

const CoinOverview = async () => {
  const result = await fetchCoinData();

  if (!result.success) {
    return <CoinOverviewFallback />;
  }

  const { coin, coinOHLCData } = result;

  return (
    <div id="coin-overview">
      <CandlestickCharts data={coinOHLCData} coinId="bitcoin">
        <div className="header pt-2">
          <Image
            src={coin.image.large}
            alt={coin.name}
            width={56}
            height={56}
          />

          <div className="info">
            <p>
              {coin.name} / {coin.symbol.toUpperCase()}
            </p>
            <h1>{formatCurrency(coin.market_data.current_price.usd)}</h1>
          </div>
        </div>
      </CandlestickCharts>
    </div>
  );
};

export default CoinOverview;
