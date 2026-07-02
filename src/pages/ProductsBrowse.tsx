import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../utils/api';
import { Search, MapPin, Sparkles, Filter, SlidersHorizontal, AlertCircle } from 'lucide-react';

const ConditionsList = ['NEW', 'LIKE_NEW', 'GOOD', 'FAIR', 'POOR'];

const ProductsBrowse: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Filters State
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [categoryId, setCategoryId] = useState(searchParams.get('category_id') || '');
  const [condition, setCondition] = useState(searchParams.get('condition') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('min_price') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('max_price') || '');
  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');
  const [page, setPage] = useState(Number(searchParams.get('page') || 1));

  // Sync state when URL search parameters change
  useEffect(() => {
    setSearch(searchParams.get('search') || '');
    setCategoryId(searchParams.get('category_id') || '');
    setCondition(searchParams.get('condition') || '');
    setMinPrice(searchParams.get('min_price') || '');
    setMaxPrice(searchParams.get('max_price') || '');
    setLocation(searchParams.get('location') || '');
    setSort(searchParams.get('sort') || 'newest');
    setPage(Number(searchParams.get('page') || 1));
  }, [searchParams]);

  // Fetch Categories
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await api.get('/categories');
      return response.data;
    },
  });

  // Fetch Products based on parameters
  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ['products', categoryId, condition, minPrice, maxPrice, location, search, sort, page],
    queryFn: async () => {
      const params: any = { page, limit: 12 };
      if (categoryId) params.category_id = categoryId;
      if (condition) params.condition = condition;
      if (minPrice) params.min_price = minPrice;
      if (maxPrice) params.max_price = maxPrice;
      if (location) params.location = location;
      if (search) params.search = search;
      if (sort) params.sort = sort;

      const queryString = new URLSearchParams(params).toString();
      const response = await api.get(`/products?${queryString}`);
      return response.data;
    },
  });

  const applyFilters = () => {
    const params: any = {};
    if (search) params.search = search;
    if (categoryId) params.category_id = categoryId;
    if (condition) params.condition = condition;
    if (minPrice) params.min_price = minPrice;
    if (maxPrice) params.max_price = maxPrice;
    if (location) params.location = location;
    if (sort) params.sort = sort;
    params.page = 1; // Reset to page 1 on filter apply

    setSearchParams(params);
  };

  const clearFilters = () => {
    setSearch('');
    setCategoryId('');
    setCondition('');
    setMinPrice('');
    setMaxPrice('');
    setLocation('');
    setSort('newest');
    setSearchParams({});
  };

  const handlePageChange = (newPage: number) => {
    const currentParams = Object.fromEntries(searchParams.entries());
    currentParams.page = String(newPage);
    setSearchParams(currentParams);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Browse Listings</h1>
          <p className="text-slate-400 text-sm mt-1">
            Browse through active second-hand product listings.
          </p>
        </div>

        {/* Sort and Actions */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <span className="text-sm text-slate-400 shrink-0">Sort By</span>
          <select
            className="bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-primary-500 w-full md:w-auto"
            value={sort}
            onChange={(e) => {
              setSort(e.target.value);
              const cp = Object.fromEntries(searchParams.entries());
              cp.sort = e.target.value;
              cp.page = '1';
              setSearchParams(cp);
            }}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Filters */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-6">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <h3 className="font-bold text-white flex items-center gap-2">
                <Filter className="w-4 h-4 text-primary-400" /> Filters
              </h3>
              <button
                onClick={clearFilters}
                className="text-xs font-semibold text-slate-500 hover:text-primary-400 transition-colors cursor-pointer"
              >
                Clear All
              </button>
            </div>

            {/* Keyword Search */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Search</label>
              <div className="flex items-center px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 focus-within:border-primary-500 transition-colors">
                <Search className="w-4 h-4 text-slate-500 mr-2 shrink-0" />
                <input
                  type="text"
                  placeholder="Keyword..."
                  className="w-full bg-transparent text-white border-none outline-none focus:ring-0 placeholder:text-slate-700 text-sm py-0.5"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Category</label>
              <select
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-primary-500"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
              >
                <option value="">All Categories</option>
                {categoriesData?.data?.map((cat: any) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.category_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Condition */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Condition</label>
              <select
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-primary-500"
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
              >
                <option value="">Any Condition</option>
                {ConditionsList.map((cond) => (
                  <option key={cond} value={cond}>
                    {cond.replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Range */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Price Range (₹)</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-primary-500"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                />
                <input
                  type="number"
                  placeholder="Max"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-primary-500"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                />
              </div>
            </div>

            {/* Location */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Location</label>
              <div className="flex items-center px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 focus-within:border-primary-500 transition-colors">
                <MapPin className="w-4 h-4 text-slate-500 mr-2 shrink-0" />
                <input
                  type="text"
                  placeholder="City, State..."
                  className="w-full bg-transparent text-white border-none outline-none focus:ring-0 placeholder:text-slate-700 text-sm py-0.5"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
            </div>

            {/* Apply Button */}
            <button
              onClick={applyFilters}
              className="gradient-btn w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
            >
              <SlidersHorizontal className="w-4 h-4" /> Apply Filters
            </button>
          </div>
        </div>

        {/* Product Grid */}
        <div className="lg:col-span-3 space-y-8">
          {productsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="h-80 rounded-2xl bg-slate-900/50 animate-pulse border border-slate-800"></div>
              ))}
            </div>
          ) : productsData?.data && productsData.data.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {productsData.data.map((prod: any) => (
                  <Link
                    key={prod.id}
                    to={`/products/${prod.id}`}
                    className="glass-card flex flex-col rounded-2xl overflow-hidden group"
                  >
                    {/* Image */}
                    <div className="aspect-[4/3] bg-slate-950 overflow-hidden relative">
                      <img
                        src={prod.images?.[0]?.image_url || 'https://picsum.photos/400/300'}
                        alt={prod.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-350"
                        loading="lazy"
                      />
                      {prod.condition && (
                        <span className="absolute top-3 left-3 px-2 py-0.5 text-xs font-semibold bg-slate-900/80 text-primary-300 rounded border border-slate-700 backdrop-blur-sm">
                          {prod.condition.replace('_', ' ')}
                        </span>
                      )}
                      
                    </div>

                    {/* Meta */}
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-1">
                        <h3 className="font-bold text-white text-base group-hover:text-primary-300 transition-colors line-clamp-1">
                          {prod.title}
                        </h3>
                        <p className="text-slate-500 text-xs flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 shrink-0" /> {prod.location}
                        </p>
                      </div>

                      <div className="flex justify-between items-center pt-2 border-t border-slate-800/60">
                        <span className="text-lg font-bold text-emerald-400">
                          ₹{Number(prod.selling_price).toLocaleString('en-IN')}
                        </span>
                        {prod.ai_estimated_price && (
                          <span className="text-xs text-primary-400 bg-primary-950/40 border border-primary-900/50 px-2 py-0.5 rounded flex items-center gap-0.5">
                            <Sparkles className="w-3 h-3" /> AI Valued
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Pagination */}
              {productsData?.meta?.totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 pt-4">
                  <button
                    disabled={page === 1}
                    onClick={() => handlePageChange(page - 1)}
                    className="px-4 py-2 text-sm rounded-xl border border-slate-800 bg-slate-900/40 text-slate-300 hover:border-slate-700 disabled:opacity-30 disabled:hover:border-slate-800 transition-colors cursor-pointer"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-slate-400 px-3">
                    Page {page} of {productsData.meta.totalPages}
                  </span>
                  <button
                    disabled={page === productsData.meta.totalPages}
                    onClick={() => handlePageChange(page + 1)}
                    className="px-4 py-2 text-sm rounded-xl border border-slate-800 bg-slate-900/40 text-slate-300 hover:border-slate-700 disabled:opacity-30 disabled:hover:border-slate-800 transition-colors cursor-pointer"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="py-20 text-center rounded-2xl bg-slate-900/10 border border-slate-800 flex flex-col items-center justify-center space-y-3">
              <AlertCircle className="w-10 h-10 text-slate-600" />
              <p className="text-slate-400 font-medium">No listings found matching your current filter set.</p>
              <button
                onClick={clearFilters}
                className="text-sm font-semibold text-primary-400 hover:text-primary-300 cursor-pointer"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductsBrowse;
