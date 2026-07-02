import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { Sparkles, Upload, AlertCircle, Info, BadgePercent } from 'lucide-react';

const ConditionsList = [
  { value: 'NEW', label: 'New (Unused)' },
  { value: 'LIKE_NEW', label: 'Like New' },
  { value: 'GOOD', label: 'Good' },
  { value: 'FAIR', label: 'Fair' },
  { value: 'POOR', label: 'Poor (Damaged)' },
];

const ProductCreate: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate('/auth/login');
    }
  }, [user, navigate]);

  // Form Fields State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [condition, setCondition] = useState('GOOD');
  const [categoryId, setCategoryId] = useState('');
  const [location, setLocation] = useState(user?.location || '');
  const [age, setAge] = useState('1');
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  // Errors & Loading States
  const [error, setError] = useState('');
  const [uploadProgress, setUploadProgress] = useState(false);

  // Live AI Pricing State
  const [aiPrice, setAiPrice] = useState<any>(null);
  const [aiPriceLoading, setAiPriceLoading] = useState(false);

  // Live AI Condition State
  const [aiCondition, setAiCondition] = useState<any>(null);
  const [aiConditionLoading, setAiConditionLoading] = useState(false);

  // Fetch Categories
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await api.get('/categories');
      return response.data;
    },
  });

  // Handle live AI Pricing updates
  useEffect(() => {
    const fetchAiPrice = async () => {
      const originalPriceVal = Number(originalPrice);
      const ageVal = Number(age);
      if (!originalPriceVal || originalPriceVal <= 0 || isNaN(ageVal)) {
        setAiPrice(null);
        return;
      }

      setAiPriceLoading(true);
      try {
        const response = await api.post('/ai/price-estimator', {
          originalPrice: originalPriceVal,
          age: ageVal,
          condition,
        });
        setAiPrice(response.data.data);
      } catch (err) {
        console.error('AI valuation failed', err);
      } finally {
        setAiPriceLoading(false);
      }
    };

    const timer = setTimeout(fetchAiPrice, 600);
    return () => clearTimeout(timer);
  }, [originalPrice, age, condition]);

  // Handle live AI Condition scanner
  useEffect(() => {
    const fetchAiCondition = async () => {
      if (!description.trim()) {
        setAiCondition(null);
        return;
      }

      setAiConditionLoading(true);
      try {
        const response = await api.post('/ai/condition-analyzer', {
          description,
          imagesCount: images.length,
        });
        setAiCondition(response.data.data);
      } catch (err) {
        console.error('AI condition scanner failed', err);
      } finally {
        setAiConditionLoading(false);
      }
    };

    const timer = setTimeout(fetchAiCondition, 600);
    return () => clearTimeout(timer);
  }, [description, images.length]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      if (images.length + selectedFiles.length > 8) {
        setError('You can upload a maximum of 8 images');
        return;
      }

      setError('');
      setImages((prev) => [...prev, ...selectedFiles]);

      const previews = selectedFiles.map((file) => URL.createObjectURL(file));
      setImagePreviews((prev) => [...prev, ...previews]);
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, idx) => idx !== index));
    setImagePreviews((prev) => prev.filter((_, idx) => idx !== index));
  };

  const createProductMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await api.post('/products', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    },
    onSuccess: (res) => {
      setUploadProgress(false);
      if (res?.success) {
        navigate(`/products/${res.data.id}`);
      } else {
        setError(res?.message || 'Failed to create listing');
      }
    },
    onError: (err: any) => {
      setUploadProgress(false);
      setError(err.response?.data?.message || 'Failed to create listing. Please check inputs.');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim() || !description.trim() || !sellingPrice || !categoryId || !location.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    if (images.length === 0) {
      setError('Please upload at least one image of the product');
      return;
    }

    setUploadProgress(true);

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('selling_price', sellingPrice);
    if (originalPrice) formData.append('original_price', originalPrice);
    formData.append('condition', condition);
    formData.append('category_id', categoryId);
    formData.append('location', location);
    formData.append('age', age);

    images.forEach((file) => {
      formData.append('images', file);
    });

    createProductMutation.mutate(formData);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Create Listing</h1>
        <p className="text-slate-400 text-sm mt-1">
          Provide details about your second-hand item and check our live AI insights before posting.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 rounded-xl bg-red-950/40 border border-red-900/50 text-red-200 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-400" />
          <p>{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Creation Form */}
        <form onSubmit={handleSubmit} className="lg:col-span-2 glass-card p-8 rounded-3xl border border-slate-800 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Title */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Listing Title *</label>
              <input
                type="text"
                placeholder="e.g. Sony WH-1000XM4 Noise Canceling Headphones"
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

            {/* Condition */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Declared Condition *</label>
              <select
                className="w-full bg-slate-950 border border-slate-850 focus:border-primary-500 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none"
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                required
              >
                {ConditionsList.map((cond) => (
                  <option key={cond.value} value={cond.value}>
                    {cond.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Original Price */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                Original Buy Price <span className="text-slate-600 font-normal italic">(For AI Valuation)</span>
              </label>
              <input
                type="number"
                placeholder="₹ Retail price when new"
                className="w-full bg-slate-950 border border-slate-850 focus:border-primary-500 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none"
                value={originalPrice}
                onChange={(e) => setOriginalPrice(e.target.value)}
              />
            </div>

            {/* Product Age */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Product Age (Years)</label>
              <input
                type="number"
                placeholder="e.g. 1, 2"
                min="0"
                step="0.5"
                className="w-full bg-slate-950 border border-slate-850 focus:border-primary-500 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none"
                value={age}
                onChange={(e) => setAge(e.target.value)}
              />
            </div>

            {/* Selling Price */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Your Selling Price (₹) *</label>
              <input
                type="number"
                placeholder="₹ Desired selling price"
                className="w-full bg-slate-950 border border-slate-850 focus:border-primary-500 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none"
                value={sellingPrice}
                onChange={(e) => setSellingPrice(e.target.value)}
                required
              />
            </div>

            {/* Location */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Location (City, State) *</label>
              <input
                type="text"
                placeholder="Mumbai, Maharashtra"
                className="w-full bg-slate-950 border border-slate-850 focus:border-primary-500 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Item Description *</label>
              <textarea
                placeholder="Describe your item in detail (e.g. usage, box availability, scratch details, etc.)"
                rows={6}
                className="w-full bg-slate-950 border border-slate-850 focus:border-primary-500 rounded-xl p-3.5 text-sm text-white focus:outline-none"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Multiple Image Upload */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Product Images (1 to 8 images) *</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="aspect-[4/3] rounded-xl overflow-hidden relative border border-slate-850 bg-slate-950">
                  <img src={preview} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1.5 right-1.5 bg-red-600/90 text-white rounded-full p-1 text-[10px] cursor-pointer hover:bg-red-500"
                  >
                    &times;
                  </button>
                </div>
              ))}

              {imagePreviews.length < 8 && (
                <label className="aspect-[4/3] rounded-xl border-2 border-dashed border-slate-800 hover:border-primary-500/50 bg-slate-950/40 flex flex-col justify-center items-center gap-1 cursor-pointer transition-colors group">
                  <Upload className="w-6 h-6 text-slate-500 group-hover:text-primary-400 transition-colors" />
                  <span className="text-[11px] font-semibold text-slate-500 group-hover:text-primary-400">Upload Image</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={uploadProgress}
            className="gradient-btn w-full py-3.5 rounded-xl text-base font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xl"
          >
            {uploadProgress ? 'Uploading and analyzing listing...' : 'Submit Listing'}
          </button>
        </form>

        {/* AI Assistant Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* AI Pricing Estimate Card */}
          <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
            <h3 className="font-bold text-white flex items-center gap-1.5 text-base">
              <Sparkles className="w-5 h-5 text-violet-400" /> AI Pricing Assistant
            </h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Calculates dynamic market value based on retrievable purchase age and condition. Enter an **Original Buy Price** and **Age** to activate.
            </p>

            {aiPriceLoading ? (
              <div className="h-20 flex justify-center items-center">
                <span className="text-xs text-slate-500">AI Valuation computation in progress...</span>
              </div>
            ) : aiPrice ? (
              <div className="space-y-4 pt-2 border-t border-slate-800/80">
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-slate-500 font-medium">Estimated Value</span>
                    <p className="text-lg font-extrabold text-violet-400">₹{aiPrice.estimatedPrice}</p>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-slate-500 font-medium">Confidence</span>
                    <p className="text-sm font-bold text-slate-300">{aiPrice.confidence}</p>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] text-slate-500 font-medium">Recommended Listing Window</span>
                  <p className="text-xs font-semibold text-slate-350">
                    ₹{aiPrice.recommendedRange.min} - ₹{aiPrice.recommendedRange.max}
                  </p>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider flex items-center gap-0.5">
                    <Info className="w-3 h-3 text-slate-400" /> Factors
                  </span>
                  <ul className="text-[10px] text-slate-400 space-y-1">
                    {aiPrice.explanations.map((exp: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-1">
                        <span className="w-1 h-1 bg-violet-400 rounded-full mt-1.5 shrink-0"></span>
                        {exp}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-900 text-center text-xs text-slate-500 italic">
                Awaiting input details...
              </div>
            )}
          </div>

          {/* AI Condition Scanning Card */}
          <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
            <h3 className="font-bold text-white flex items-center gap-1.5 text-base">
              <BadgePercent className="w-5 h-5 text-emerald-400" /> AI Condition Scanner
            </h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Analyzes description text for keyword cues of damage, scuffs, or dents, comparing it against the count of photos uploaded.
            </p>

            {aiConditionLoading ? (
              <div className="h-20 flex justify-center items-center">
                <span className="text-xs text-slate-500">AI scanning listing description...</span>
              </div>
            ) : aiCondition ? (
              <div className="space-y-4 pt-2 border-t border-slate-800/80">
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-slate-500 font-medium">Predicted Condition</span>
                    <p className="text-sm font-extrabold text-emerald-400 uppercase">
                      {aiCondition.estimatedCondition.replace('_', ' ')}
                    </p>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-slate-500 font-medium">Confidence Score</span>
                    <p className="text-sm font-bold text-slate-300">{aiCondition.confidence}</p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Wear & Damage Cues</span>
                  <ul className="text-[10px] text-slate-400 space-y-1">
                    {aiCondition.detectedIssues.map((issue: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-1">
                        <span className="w-1 h-1 bg-emerald-400 rounded-full mt-1.5 shrink-0"></span>
                        {issue}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-900 text-center text-xs text-slate-500 italic">
                Awaiting input details...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCreate;
