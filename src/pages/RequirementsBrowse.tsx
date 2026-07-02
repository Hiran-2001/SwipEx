import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { MapPin, Tag, Calendar, MessageSquare, AlertCircle, Plus, Sparkles } from 'lucide-react';

const RequirementsBrowse: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Filters State
  const [categoryId, setCategoryId] = useState('');
  const [location, setLocation] = useState('');
  const [maxBudget, setMaxBudget] = useState('');

  // Offer Product modal state
  const [offerOpen, setOfferOpen] = useState(false);
  const [selectedRequirement, setSelectedRequirement] = useState<any>(null);
  const [offerProductId, setOfferProductId] = useState('');
  const [offerMessage, setOfferMessage] = useState('');
  const [offerError, setOfferError] = useState('');

  // Fetch Requirements
  const { data: requirementsData, isLoading: requirementsLoading } = useQuery({
    queryKey: ['requirements', categoryId, location, maxBudget],
    queryFn: async () => {
      const params: any = {};
      if (categoryId) params.category_id = categoryId;
      if (location) params.location = location;
      if (maxBudget) params.max_budget = maxBudget;

      const queryString = new URLSearchParams(params).toString();
      const response = await api.get(`/requirements?${queryString}`);
      return response.data;
    },
  });

  // Fetch Categories
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await api.get('/categories');
      return response.data;
    },
  });

  // Fetch User's Products to offer
  const { data: myProductsData } = useQuery({
    queryKey: ['myProducts'],
    queryFn: async () => {
      const response = await api.get('/products'); // We will filter locally or via a my listings endpoint
      return response.data;
    },
    enabled: !!user,
  });

  const handleContactBuyerClick = (req: any) => {
    if (!user) {
      navigate('/auth/login');
      return;
    }
    setSelectedRequirement(req);
    setOfferOpen(true);
  };

  // Mutation to send message offering a product
  const sendOfferMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post('/messages', {
        receiverId: selectedRequirement.buyer_id,
        productId: offerProductId,
        message: offerMessage || `Hi, I noticed your request for "${selectedRequirement.title}". I have a listing matching your description: "${myProducts?.find((p: any) => p.id === offerProductId)?.title}".`,
      });
      return response.data;
    },
    onSuccess: () => {
      setOfferOpen(false);
      setOfferProductId('');
      setOfferMessage('');
      navigate('/inbox');
    },
    onError: (err: any) => {
      setOfferError(err.response?.data?.message || 'Failed to send offer message');
    },
  });

  const handleSendOffer = (e: React.FormEvent) => {
    e.preventDefault();
    setOfferError('');
    if (!offerProductId) {
      setOfferError('Please select a product listing to offer');
      return;
    }
    sendOfferMutation.mutate();
  };

  const myProducts = myProductsData?.data?.filter((p: any) => p.seller_id === user?.id && p.status === 'AVAILABLE');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Buyer Requirements</h1>
          <p className="text-slate-400 text-sm mt-1">
            See what items buyers are looking for. Offer them your listings directly.
          </p>
        </div>
        <Link to="/buyer-requirements/new" className="gradient-btn px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-1.5 shrink-0 shadow-md">
          <Plus className="w-4 h-4" /> Post Requirement
        </Link>
      </div>

      {/* Filters Bar */}
      <div className="glass-card p-6 rounded-2xl border border-slate-800 grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
        {/* Category */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Category</label>
          <select
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-primary-500"
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

        {/* Location */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Location</label>
          <input
            type="text"
            placeholder="City or state..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-primary-500"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>

        {/* Max Budget */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Max Budget (₹)</label>
          <input
            type="number"
            placeholder="Max budget..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-primary-500"
            value={maxBudget}
            onChange={(e) => setMaxBudget(e.target.value)}
          />
        </div>

        {/* Reset Buttons */}
        <button
          onClick={() => {
            setCategoryId('');
            setLocation('');
            setMaxBudget('');
          }}
          className="w-full py-2.5 rounded-xl border border-slate-800 bg-slate-900/40 text-slate-400 hover:text-white hover:border-slate-700 transition-colors text-sm font-semibold cursor-pointer"
        >
          Clear Filters
        </button>
      </div>

      {/* Grid List */}
      {requirementsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-48 rounded-2xl bg-slate-900/55 animate-pulse border border-slate-800"></div>
          ))}
        </div>
      ) : requirementsData?.data && requirementsData.data.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {requirementsData.data.map((req: any) => (
            <div key={req.id} className="glass-card p-6 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-start gap-4">
                  <h3 className="text-lg font-bold text-white leading-snug line-clamp-1">{req.title}</h3>
                  <span className="text-sm font-extrabold text-emerald-400 shrink-0">
                    Max: ₹{Number(req.budget).toLocaleString('en-IN')}
                  </span>
                </div>

                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{req.description}</p>
              </div>

              <div className="flex flex-wrap items-center gap-y-2 justify-between pt-3 border-t border-slate-800/60">
                <div className="flex flex-wrap gap-2 text-[10px] text-slate-500">
                  <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-900 text-primary-400 uppercase">
                    {req.preferred_condition}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-900 flex items-center gap-0.5">
                    <Tag className="w-3 h-3" /> {req.category?.category_name}
                  </span>
                  <span className="flex items-center gap-0.5">
                    <MapPin className="w-3 h-3" /> {req.location}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-slate-500 flex items-center gap-0.5">
                    <Calendar className="w-3 h-3" /> Expiry:{' '}
                    {new Date(req.expiry_date).toLocaleDateString()}
                  </span>
                  {user?.id !== req.buyer_id && (
                    <button
                      onClick={() => handleContactBuyerClick(req)}
                      className="px-3.5 py-1.5 rounded-lg bg-primary-600 hover:bg-primary-500 text-white font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <MessageSquare className="w-3 h-3" /> Offer item
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-20 text-center rounded-2xl bg-slate-900/10 border border-slate-800 flex flex-col items-center justify-center space-y-3">
          <AlertCircle className="w-10 h-10 text-slate-600" />
          <p className="text-slate-400 font-medium">No open buyer requirements found.</p>
          <button
            onClick={() => {
              setCategoryId('');
              setLocation('');
              setMaxBudget('');
            }}
            className="text-sm font-semibold text-primary-400 hover:text-primary-300 cursor-pointer"
          >
            Reset filter searches
          </button>
        </div>
      )}

      {/* Offer Product Modal */}
      {offerOpen && selectedRequirement && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card w-full max-w-md p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex justify-between items-start">
              <h3 className="text-lg font-bold text-white flex items-center gap-1.5">
                <Sparkles className="w-5 h-5 text-primary-400" /> Offer Product
              </h3>
              <button
                onClick={() => setOfferOpen(false)}
                className="text-slate-500 hover:text-slate-400 text-sm cursor-pointer"
              >
                Cancel
              </button>
            </div>

            {offerError && (
              <div className="p-3 rounded-lg bg-red-950/40 border border-red-900/50 text-red-200 text-xs">
                {offerError}
              </div>
            )}

            <form onSubmit={handleSendOffer} className="space-y-4">
              <p className="text-xs text-slate-400 leading-relaxed">
                Select one of your active listings that matches the buyer's requirement for <strong className="text-white">"{selectedRequirement.title}"</strong> (Max Budget: <strong className="text-white">₹{Number(selectedRequirement.budget).toLocaleString()}</strong>).
              </p>

              {/* Product selector */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Your Available Listing *</label>
                {myProducts && myProducts.length > 0 ? (
                  <select
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-primary-500"
                    value={offerProductId}
                    onChange={(e) => setOfferProductId(e.target.value)}
                    required
                  >
                    <option value="">Select a listing...</option>
                    {myProducts.map((p: any) => (
                      <option key={p.id} value={p.id}>
                        {p.title} (₹{Number(p.selling_price).toLocaleString()})
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-900 text-center text-xs text-slate-500 space-y-2">
                    <p>You have no active products listed that are available.</p>
                    <Link to="/products/new" className="text-primary-400 font-semibold underline block">
                      Create a product listing first
                    </Link>
                  </div>
                )}
              </div>

              {/* Optional message */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Personal message (Optional)</label>
                <textarea
                  placeholder="Tell the buyer why your item is a good fit..."
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-primary-500"
                  value={offerMessage}
                  onChange={(e) => setOfferMessage(e.target.value)}
                  disabled={!myProducts || myProducts.length === 0}
                />
              </div>

              <button
                type="submit"
                disabled={!offerProductId || sendOfferMutation.isPending}
                className="gradient-btn w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-30"
              >
                {sendOfferMutation.isPending ? 'Sending offer...' : 'Send Offer'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RequirementsBrowse;
