import { Suspense } from 'react';
import CoinOverview from '@/components/home/coin-overview';
import TrendingCoins from '@/components/home/trending-coins';
import {
  CategoriesFallback,
  CoinOverviewFallback,
  TrendingCoinsFallback,
} from '@/components/home/fallback';
import Categories from '@/components/home/categories';

const Page = async () => {
  return (
    <div className="main-container">
      <section className="home-grid">
        <Suspense fallback={<CoinOverviewFallback />}>
          <CoinOverview />
        </Suspense>

        <Suspense fallback={<TrendingCoinsFallback />}>
          <TrendingCoins />
        </Suspense>
      </section>

      <section className="w-full mt-7 space-y-4">
        <Suspense fallback={<CategoriesFallback />}>
          <Categories />
        </Suspense>
      </section>
    </div>
  );
};

export default Page;
