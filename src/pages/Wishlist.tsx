import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { Heart, MapPin, Sparkles } from 'lucide-react';

const Wishlist: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Redirect if not logged in
  React.useEffect(() => {
    if (!user) {
      navigate('/auth/login');
    }
  }, [user, navigate]);

  // Fetch Wishlisted Products
  const { data: wishlistData, isLoading } = useQuery({
    queryKey: ['wishlist'],
    queryFn: async () => {
      const response = await api.get('/wishlist');
      return response.data;
    },
    enabled: !!user,
  });

  const products = wishlistData?.data || [];

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Saved Listings</h1>
        <p className="text-slate-400 text-sm mt-1">
          Keep track of items you have wishlisted for quick reference.
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-80 rounded-2xl bg-slate-900/50 animate-pulse border border-slate-800"></div>
          ))}
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {products.map((prod: any) => (
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
        <div className="py-20 text-center rounded-2xl bg-slate-900/10 border border-slate-800 flex flex-col items-center justify-center space-y-3">
          <Heart className="w-10 h-10 text-slate-700" />
          <p className="text-slate-400 font-medium">Your wishlist is currently empty.</p>
          <Link to="/products" className="text-sm font-semibold text-primary-400 hover:text-primary-300 underline">
            Browse active listings
          </Link>
        </div>
      )}
    </div>
  );
};

export default Wishlist;
