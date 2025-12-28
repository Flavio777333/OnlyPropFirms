'use client';

import FirmList from '@/components/propFirms/FirmList';
import FilterSidebar from '@/components/filters/FilterSidebar';
import { NewDealsSection } from '@/components/home/NewDealsSection';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            OnlyPropFirms
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Compare and filtering top prop trading firms.
          </p>
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* New Deals Section */}
          <NewDealsSection />

          {/* Main Content: Filters + Firm List */}
          <div className="flex flex-col lg:flex-row gap-8 mt-8">
            <aside className="w-full lg:w-64 flex-shrink-0">
              <FilterSidebar />
            </aside>
            <section className="flex-1">
              <FirmList />
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
