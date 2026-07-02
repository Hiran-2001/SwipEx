import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { MapPin, Sparkles, Heart, MessageSquare, AlertTriangle, ShieldCheck, Tag, Info, Send, Calendar } from 'lucide-react';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [chatOpen, setChatOpen] = useState(false);
  const [initialMessage, setInitialMessage] = useState('');
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportSuccess, setReportSuccess] = useState('');

  // Fetch Product Details
  const { data: productData, isLoading, error } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const response = await api.get(`/products/${id}`);
      return response.data;
    },
    enabled: !!id,
  });

  // Fetch Wishlist status for current user if logged in
  const { data: wishlistData } = useQuery({
    queryKey: ['wishlistStatus', id],
    queryFn: async () => {
      const response = await api.get(`/wishlist/status/${id}`);
      return response.data;
    },
    enabled: !!id && !!user,
  });

  // Toggle Wishlist Mutation
  const toggleWishlistMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post('/wishlist/toggle', { productId: id });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlistStatus', id] });
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    },
  });

  // Send Initial Message Mutation
  const sendMessageMutation = useMutation({
    mutationFn: async () => {
      if (!productData?.data) return;
      const response = await api.post('/messages', {
        receiverId: productData.data.seller_id,
        productId: id,
        message: initialMessage,
      });
      return response.data;
    },
    onSuccess: () => {
      setChatOpen(false);
      setInitialMessage('');
      navigate('/inbox');
    },
  });

  // Create Report Mutation
  const reportMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post('/reports', {
        productId: id,
        reason: reportReason,
      });
      return response.data;
    },
    onSuccess: () => {
      setReportSuccess('Listing reported successfully. Moderation team will review it.');
      setReportReason('');
      setTimeout(() => {
        setReportOpen(false);
        setReportSuccess('');
      }, 3000);
    },
  });

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto py-12 space-y-8 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="h-96 bg-slate-900/60 rounded-3xl border border-slate-800"></div>
          <div className="space-y-6">
            <div className="h-10 bg-slate-900/60 rounded-lg w-3/4"></div>
            <div className="h-6 bg-slate-900/60 rounded-lg w-1/4"></div>
            <div className="h-32 bg-slate-900/60 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !productData?.success) {
    return (
      <div className="max-w-md mx-auto text-center py-20 space-y-4">
        <AlertTriangle className="w-16 h-16 text-red-500 mx-auto" />
        <h2 className="text-2xl font-bold">Listing Not Found</h2>
        <p className="text-slate-400">The product listing you requested has been deleted or does not exist.</p>
        <Link to="/products" className="gradient-btn px-6 py-2 rounded-xl inline-block">
          Back to Listings
        </Link>
      </div>
    );
  }

  const prod = productData.data;
  const isOwner = user?.id === prod.seller_id;
  const wishlisted = wishlistData?.data?.wishlisted;

  const handleContactSellerClick = () => {
    if (!user) {
      navigate('/auth/login');
      return;
    }
    setChatOpen(true);
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (initialMessage.trim()) {
      sendMessageMutation.mutate();
    }
  };

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (reportReason.trim()) {
      reportMutation.mutate();
    }
  };

  // Get AI price outputs
  const aiPriceReport = prod.ai_price_history?.[0];
  const aiConditionReport = prod.ai_condition_reps?.[0];

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-16">
      {/* Back button */}
      <div>
        <Link to="/products" className="text-sm font-semibold text-slate-400 hover:text-primary-400 transition-colors">
          &larr; Back to all listings
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Images Slideshow */}
        <div className="space-y-4">
          <div className="aspect-[4/3] rounded-3xl overflow-hidden bg-slate-950 border border-slate-800 relative">
            <img
              src={prod.images?.[activeImageIndex]?.image_url || 'https://picsum.photos/800/600'}
              alt={prod.title}
              className="w-full h-full object-cover"
            />
          </div>
          {prod.images && prod.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto py-1">
              {prod.images.map((img: any, idx: number) => (
                <button
                  key={img.id}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`w-20 h-16 rounded-xl overflow-hidden border-2 shrink-0 cursor-pointer transition-all ${
                    idx === activeImageIndex ? 'border-primary-500 scale-95' : 'border-slate-800 opacity-60'
                  }`}
                >
                  <img src={img.image_url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Listing Primary Info */}
        <div className="space-y-6">
          <div className="space-y-3">
            <div className="flex justify-between items-start gap-4">
              <h1 className="text-3xl font-extrabold tracking-tight text-white leading-tight">
                {prod.title}
              </h1>
              {user && !isOwner && (
                <button
                  onClick={() => toggleWishlistMutation.mutate()}
                  className={`p-2.5 rounded-full border transition-all cursor-pointer ${
                    wishlisted
                      ? 'bg-rose-950/20 border-rose-800 text-rose-500'
                      : 'bg-slate-900 border-slate-850 text-slate-400 hover:text-rose-500 hover:border-rose-900/30'
                  }`}
                >
                  <Heart className={`w-5.5 h-5.5 ${wishlisted ? 'fill-rose-500' : ''}`} />
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3.5">
              <span className="px-3 py-1 text-xs font-semibold rounded bg-slate-900 border border-slate-800 text-primary-300 uppercase">
                {prod.condition.replace('_', ' ')}
              </span>
              <span className="px-3 py-1 text-xs font-semibold rounded bg-slate-900 border border-slate-800 text-slate-400 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5" /> {prod.category?.category_name}
              </span>
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 shrink-0" /> {prod.location}
              </span>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 flex justify-between items-center gap-6">
            <div className="space-y-1">
              <span className="text-xs text-slate-500 font-medium">Selling Price</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-emerald-400">
                  ₹{Number(prod.selling_price).toLocaleString('en-IN')}
                </span>
                {prod.original_price && (
                  <span className="text-sm text-slate-500 line-through">
                    ₹{Number(prod.original_price).toLocaleString('en-IN')}
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-col items-end gap-1.5">
              {isOwner ? (
                <span className="px-4 py-1.5 text-xs font-bold text-slate-400 bg-slate-950 border border-slate-800 rounded-xl">
                  Your Listing
                </span>
              ) : (
                <button
                  onClick={handleContactSellerClick}
                  className="gradient-btn px-6 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 cursor-pointer shadow-lg"
                >
                  <MessageSquare className="w-4 h-4" /> Contact Seller
                </button>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-white">Description</h3>
            <p className="text-slate-400 text-sm leading-relaxed whitespace-pre-line">
              {prod.description}
            </p>
          </div>

          {/* Seller profile */}
          <div className="p-5 rounded-2xl bg-slate-900/20 border border-slate-800/80 flex items-center gap-4">
            <img
              src={prod.seller?.avatar_url || 'https://api.dicebear.com/7.x/bottts/svg?seed=' + prod.seller?.full_name}
              alt=""
              className="w-12 h-12 rounded-full border border-slate-700 object-cover"
            />
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold text-white truncate">{prod.seller?.full_name}</h4>
              <p className="text-xs text-slate-500 truncate">{prod.seller?.email}</p>
              {prod.seller?.phone && (
                <p className="text-xs text-slate-500 mt-0.5">{prod.seller.phone}</p>
              )}
            </div>
            {!isOwner && user && (
              <button
                onClick={() => setReportOpen(true)}
                className="p-2 text-slate-500 hover:text-red-400 hover:bg-slate-900 rounded-lg transition-colors cursor-pointer"
                title="Report listing"
              >
                <AlertTriangle className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* AI Analysis Section */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-slate-800/60 pt-10">
        {/* Price Estimation */}
        <div className="glass-card p-8 rounded-3xl border border-slate-800 space-y-6">
          <div className="flex justify-between items-center border-b border-slate-800/80 pb-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-violet-400" /> AI Pricing Analysis
            </h3>
            {aiPriceReport && (
              <span className={`px-2.5 py-0.5 rounded text-xs font-bold border ${
                aiPriceReport.confidence >= 80
                  ? 'bg-emerald-950/20 border-emerald-900 text-emerald-400'
                  : aiPriceReport.confidence >= 60
                  ? 'bg-amber-950/20 border-amber-900 text-amber-400'
                  : 'bg-red-950/20 border-red-900 text-red-400'
              }`}>
                {aiPriceReport.confidence}% Confidence
              </span>
            )}
          </div>

          {prod.ai_estimated_price ? (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-xs text-slate-500 font-medium">Estimated Market Value</span>
                  <p className="text-2xl font-extrabold text-violet-400">
                    ₹{Number(prod.ai_estimated_price).toLocaleString('en-IN')}
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-slate-500 font-medium">Recommended Range</span>
                  <p className="text-sm font-bold text-slate-300">
                    ₹{Math.round(Number(prod.ai_estimated_price) * 0.9).toLocaleString('en-IN')} - ₹
                    {Math.round(Number(prod.ai_estimated_price) * 1.1).toLocaleString('en-IN')}
                  </p>
                </div>
              </div>

              {/* Price Gauge Comparison */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-slate-500 font-semibold">
                  <span>Underpriced</span>
                  <span className="text-violet-400">Fair Value</span>
                  <span>Overpriced</span>
                </div>
                <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden relative border border-slate-900">
                  {/* Gauge indicator */}
                  {(() => {
                    const priceVal = Number(prod.selling_price);
                    const estVal = Number(prod.ai_estimated_price);
                    const diffPercent = ((priceVal - estVal) / estVal) * 100;
                    // Cap position between 5% and 95%
                    const position = Math.min(95, Math.max(5, 50 + diffPercent * 1.5));
                    return (
                      <div
                        className="absolute top-0 bottom-0 w-3 -ml-1.5 bg-primary-500 border border-white rounded-full transition-all"
                        style={{ left: `${position}%` }}
                      ></div>
                    );
                  })()}
                </div>
                <p className="text-xs text-slate-500 leading-relaxed italic">
                  *The marker represents where the current listing price stands compared to our AI estimation.
                </p>
              </div>

              {/* Logic explanations */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <Info className="w-3.5 h-3.5" /> Estimation Factors
                </h4>
                <ul className="text-xs text-slate-400 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-violet-500 rounded-full mt-1.5 shrink-0"></span>
                    Base depreciation calculates item age & category wear metrics.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-violet-500 rounded-full mt-1.5 shrink-0"></span>
                    Estimated condition adjustments applied for '{prod.condition.toLowerCase().replace('_', ' ')}' listing.
                  </li>
                </ul>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-500 italic">No pricing estimate available for this product.</p>
          )}
        </div>

        {/* Condition Scan */}
        <div className="glass-card p-8 rounded-3xl border border-slate-800 space-y-6">
          <div className="flex justify-between items-center border-b border-slate-800/80 pb-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" /> AI Condition Scans
            </h3>
            {aiConditionReport && (
              <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-slate-900 border border-slate-800 text-emerald-400">
                {aiConditionReport.confidence}% Match
              </span>
            )}
          </div>

          {aiConditionReport ? (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-xs text-slate-500 font-medium">Assessed Condition</span>
                  <p className="text-lg font-bold text-emerald-400 uppercase">
                    {aiConditionReport.estimated_condition.replace('_', ' ')}
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-slate-500 font-medium">Scan Integrity</span>
                  <p className="text-sm font-semibold text-slate-350 flex items-center gap-1">
                    <Calendar className="w-4 h-4 shrink-0 text-slate-500" /> Analyzed Live
                  </p>
                </div>
              </div>

              {/* Detected damages */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Flagged Analysis Logs</h4>
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-900 text-xs text-slate-400 leading-relaxed font-mono">
                  {aiConditionReport.detected_damage || 'No structural damage, wear marks, or cracked panels flagged in text review.'}
                </div>
              </div>

              {/* Explanation */}
              <p className="text-xs text-slate-400 italic">
                *The condition evaluation searches item descriptions for keyword matches (e.g. scuffs, dents, cracks) and factors in the quantity of uploaded photos to assess diagnostic confidence.
              </p>
            </div>
          ) : (
            <p className="text-sm text-slate-500 italic">No condition scan has been run for this listing.</p>
          )}
        </div>
      </section>

      {/* Messaging Modal Dialog */}
      {chatOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card w-full max-w-md p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex justify-between items-start">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary-400" /> Message Seller
              </h3>
              <button
                onClick={() => setChatOpen(false)}
                className="text-slate-500 hover:text-slate-400 text-sm cursor-pointer"
              >
                Cancel
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Send an inquiry to <strong className="text-white">{prod.seller?.full_name}</strong> about their listing <strong className="text-white">"{prod.title}"</strong>.
            </p>

            <form onSubmit={handleSendChat} className="space-y-4">
              <textarea
                placeholder="Hi, is this item still available? I am interested."
                rows={4}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-primary-500"
                value={initialMessage}
                onChange={(e) => setInitialMessage(e.target.value)}
                required
              />

              <button
                type="submit"
                disabled={sendMessageMutation.isPending}
                className="gradient-btn w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {sendMessageMutation.isPending ? 'Sending...' : (
                  <>
                    <Send className="w-4 h-4" /> Send Message
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Reporting Modal Dialog */}
      {reportOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card w-full max-w-md p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex justify-between items-start">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" /> Report Listing
              </h3>
              <button
                onClick={() => setReportOpen(false)}
                className="text-slate-500 hover:text-slate-400 text-sm cursor-pointer"
              >
                Cancel
              </button>
            </div>

            {reportSuccess ? (
              <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-900/50 text-emerald-250 text-xs">
                {reportSuccess}
              </div>
            ) : (
              <form onSubmit={handleReportSubmit} className="space-y-4">
                <p className="text-xs text-slate-400">
                  Please describe the issue with this listing (e.g. fraudulent, catalog mismatch, abusive content).
                </p>

                <textarea
                  placeholder="Reason for report..."
                  rows={4}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-primary-500"
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  required
                />

                <button
                  type="submit"
                  disabled={reportMutation.isPending}
                  className="w-full py-2.5 rounded-xl bg-red-650 hover:bg-red-550 text-white font-semibold text-sm transition-colors cursor-pointer"
                >
                  {reportMutation.isPending ? 'Reporting...' : 'Submit Report'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;
