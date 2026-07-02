import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { AlertCircle, Calendar, Send } from 'lucide-react';

const ConditionsList = [
  { value: 'NEW', label: 'New (Unused)' },
  { value: 'LIKE_NEW', label: 'Like New' },
  { value: 'GOOD', label: 'Good' },
  { value: 'FAIR', label: 'Fair' },
  { value: 'POOR', label: 'Poor' },
];

const RequirementCreate: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate('/auth/login');
    }
  }, [user, navigate]);

  // Form fields state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState('');
  const [preferredCondition, setPreferredCondition] = useState('GOOD');
  const [categoryId, setCategoryId] = useState('');
  const [location, setLocation] = useState(user?.location || '');
  const [expiryDate, setExpiryDate] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch Categories
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await api.get('/categories');
      return response.data;
    },
  });

  const createRequirementMutation = useMutation({
    mutationFn: async (payload: any) => {
      const response = await api.post('/requirements', payload);
      return response.data;
    },
    onSuccess: (res) => {
      setLoading(false);
      if (res?.success) {
        navigate('/buyer-requirements');
      } else {
        setError(res?.message || 'Failed to submit requirement');
      }
    },
    onError: (err: any) => {
      setLoading(false);
      setError(err.response?.data?.message || 'Failed to post requirement. Please check inputs.');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim() || !description.trim() || !budget || !categoryId || !location.trim() || !expiryDate) {
      setError('Please fill in all required fields');
      return;
    }

    const budgetVal = Number(budget);
    if (budgetVal <= 0) {
      setError('Budget must be a positive number');
      return;
    }

    const expiry = new Date(expiryDate);
    if (expiry <= new Date()) {
      setError('Expiry date must be a future date');
      return;
    }

    setLoading(true);

    const payload = {
      title,
      description,
      budget: budgetVal,
      preferred_condition: preferredCondition,
      category_id: categoryId,
      location,
      expiry_date: expiryDate,
    };

    createRequirementMutation.mutate(payload);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Post Requirement</h1>
        <p className="text-slate-400 text-sm mt-1">
          Tell sellers what you are hunting for so they can contact you with matching offers.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 rounded-xl bg-red-950/40 border border-red-900/50 text-red-200 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-400" />
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="glass-card p-8 rounded-3xl border border-slate-800 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Title */}
          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">What are you looking for? *</label>
            <input
              type="text"
              placeholder="e.g. iPhone 15 Pro, 256GB, Blue Titanium"
              className="w-full bg-slate-950 border border-slate-850 focus:border-primary-500 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Category *</label>
            <select
              className="w-full bg-slate-950 border border-slate-850 focus:border-primary-500 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
            >
              <option value="">Select Category</option>
              {categoriesData?.data?.map((cat: any) => (
                <option key={cat.id} value={cat.id}>
                  {cat.category_name}
                </option>
              ))}
            </select>
          </div>

          {/* Preferred Condition */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Minimum Condition *</label>
            <select
              className="w-full bg-slate-950 border border-slate-850 focus:border-primary-500 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none"
              value={preferredCondition}
              onChange={(e) => setPreferredCondition(e.target.value)}
              required
            >
              {ConditionsList.map((cond) => (
                <option key={cond.value} value={cond.value}>
                  {cond.label}
                </option>
              ))}
            </select>
          </div>

          {/* Budget */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Max Budget (₹) *</label>
            <input
              type="number"
              placeholder="e.g. 50000"
              className="w-full bg-slate-950 border border-slate-850 focus:border-primary-500 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              required
            />
          </div>

          {/* Location */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Target Location *</label>
            <input
              type="text"
              placeholder="e.g. Mumbai, Maharashtra"
              className="w-full bg-slate-950 border border-slate-850 focus:border-primary-500 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
            />
          </div>

          {/* Expiry Date */}
          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-500" /> Expiry Date (When should this post auto-archive?) *
            </label>
            <input
              type="date"
              className="w-full bg-slate-950 border border-slate-850 focus:border-primary-500 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Requirements Details *</label>
            <textarea
              placeholder="Describe what specific specifications, colors, model years, or details you are looking for in the item."
              rows={5}
              className="w-full bg-slate-950 border border-slate-850 focus:border-primary-500 rounded-xl p-3.5 text-sm text-white focus:outline-none"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="gradient-btn w-full py-3.5 rounded-xl text-base font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xl"
        >
          {loading ? 'Posting...' : (
            <>
              <Send className="w-4 h-4" /> Post Buyer Requirement
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default RequirementCreate;
