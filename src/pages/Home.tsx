import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../utils/api';
import { Search, Sparkles, MapPin, Tag, ShieldCheck, MessageSquare, ArrowRight } from 'lucide-react';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch active products
  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ['recentProducts'],
    queryFn: async () => {
      const response = await api.get('/products?limit=4');
      return response.data;
    },
  });

  // Fetch categories
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await api.get('/categories');
      return response.data;
    },
  });

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
    } else {
      navigate('/products');
    }
  };

  const handleCategoryClick = (categoryId: string) => {
    navigate(`/products?category_id=${categoryId}`);
  };

  return (
    <div className="space-y-16 pb-12">
      {/* Hero Banner */}
      <section className="relative py-20 px-4 md:px-8 text-center rounded-3xl overflow-hidden bg-slate-900/40 border border-slate-800">
        {/* Glow Effects */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl -z-10 animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl -z-10 animate-pulse"></div>

        <div className="max-w-4xl mx-auto space-y-6">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold tracking-wide text-primary-400 bg-primary-950/50 border border-primary-800/50 rounded-full">
            <Sparkles className="w-3.5 h-3.5" /> Smarter P2P Second-hand Marketplace
          </span>

          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight">
            Buy and Sell with <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-400 via-violet-400 to-indigo-400">AI Trust</span>
          </h1>

          <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto">
            List your used goods and get instant fair-market valuation & condition scores analyzed by our AI helper.
          </p>

          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto flex items-center p-1.5 rounded-2xl bg-slate-950/80 border border-slate-800 focus-within:border-primary-500 shadow-2xl transition-all duration-300">
            <div className="flex items-center flex-1 px-3">
              <Search className="w-5 h-5 text-slate-500 mr-2 shrink-0" />
              <input
                type="text"
                placeholder="What are you looking for today? (e.g. iPhone, Sofa)"
                className="w-full bg-transparent text-white border-none outline-none focus:ring-0 placeholder:text-slate-500 py-2.5 text-sm md:text-base"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button type="submit" className="gradient-btn px-6 py-2.5 rounded-xl text-sm md:text-base cursor-pointer">
              Search
            </button>
          </form>
        </div>
      </section>

      {/* AI Features Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="glass-card p-8 rounded-2xl space-y-4">
          <div className="w-12 h-12 rounded-xl bg-violet-950/80 border border-violet-800 flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-violet-400" />
          </div>
          <h3 className="text-xl font-bold">Rule-based AI Valuation</h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            Specify original price, age, and condition to view instantaneous depreciation analysis and target fair range estimation.
          </p>
        </div>

        <div className="glass-card p-8 rounded-2xl space-y-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-950/80 border border-indigo-800 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6 text-indigo-400" />
          </div>
          <h3 className="text-xl font-bold">AI Condition Scanning</h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            Our analysis model scans text and image counts for keyword wear cues, flagging structural issues or cosmetic defects.
          </p>
        </div>

        <div className="glass-card p-8 rounded-2xl space-y-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-950/80 border border-emerald-800 flex items-center justify-center">
            <MessageSquare className="w-6 h-6 text-emerald-400" />
          </div>
          <h3 className="text-xl font-bold">Direct Buyer-Seller Chats</h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            Message sellers directly to coordinate handoffs, negotiate prices, or discuss item details through structured threads.
          </p>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="space-y-6">
        <div className="flex justify-between items-end">
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">Browse by Category</h2>
          <Link to="/products" className="text-sm font-semibold text-primary-400 hover:text-primary-300 flex items-center gap-1">
            Browse all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categoriesData?.data?.map((cat: any) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryClick(cat.id)}
              className="p-6 text-left rounded-xl bg-slate-900/30 border border-slate-800 hover:border-slate-700 hover:bg-slate-900/50 transition-all duration-200 cursor-pointer group"
            >
              <Tag className="w-5 h-5 text-primary-400 mb-3 group-hover:scale-110 transition-transform" />
              <h4 className="font-semibold text-white group-hover:text-primary-300 transition-colors">
                {cat.category_name}
              </h4>
            </button>
          ))}
        </div>
      </section>

      {/* Recent Listings Grid */}
      <section className="space-y-6">
        <div className="flex justify-between items-end">
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">Recent Additions</h2>
          <Link to="/products" className="text-sm font-semibold text-primary-400 hover:text-primary-300 flex items-center gap-1">
            View all listings <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {productsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-80 rounded-2xl bg-slate-900/50 animate-pulse border border-slate-800"></div>
            ))}
          </div>
        ) : productsData?.data && productsData.data.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {productsData.data.map((prod: any) => (
              <Link
                key={prod.id}
                to={`/products/${prod.id}`}
                className="glass-card flex flex-col rounded-2xl overflow-hidden group"
              >
                {/* Product Image */}
                <div className="aspect-[4/3] bg-slate-950 overflow-hidden relative">
                  <img
                    src={prod.images?.[0]?.image_url || 'https://picsum.photos/400/300'}
                    alt={prod.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  {prod.condition && (
                    <span className="absolute top-3 left-3 px-2 py-0.5 text-xs font-semibold bg-slate-900/80 text-primary-300 rounded border border-slate-700 backdrop-blur-sm">
                      {prod.condition.replace('_', ' ')}
                    </span>
                  )}
                </div>

                {/* Details */}
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
        ) : (
          <div className="py-12 text-center rounded-2xl bg-slate-900/20 border border-slate-800">
            <p className="text-slate-400">No products available at this time.</p>
          </div>
        )}
      </section>

      {/* Buyer Requirements Banner */}
      <section className="p-8 rounded-3xl bg-gradient-to-r from-violet-950/40 to-indigo-950/40 border border-violet-800/40 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="space-y-2 text-center md:text-left">
          <h3 className="text-xl md:text-2xl font-bold text-white">Can't find what you are looking for?</h3>
          <p className="text-slate-400 text-sm max-w-xl">
            Post a buyer requirement! Sellers on SecondSpin can view what active buyers are hunting for and contact them directly.
          </p>
        </div>
        <div className="flex gap-4 shrink-0">
          <Link to="/buyer-requirements" className="px-5 py-2.5 rounded-xl border border-slate-700 hover:border-slate-600 bg-slate-950/30 text-white font-medium text-sm transition-all">
            Browse Requirements
          </Link>
          <Link to="/buyer-requirements/new" className="gradient-btn px-5 py-2.5 rounded-xl text-sm font-medium">
            Post Requirement
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
