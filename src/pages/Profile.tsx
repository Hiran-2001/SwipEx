import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { Phone, MapPin, Mail, Calendar, Settings, ShoppingBag, ClipboardList, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';

const Profile: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate('/auth/login');
    }
  }, [user, navigate]);

  // Form edit states
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [location, setLocation] = useState(user?.location || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || '');

  const [activeTab, setActiveTab] = useState<'listings' | 'requirements'>('listings');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editOpen, setEditOpen] = useState(false);

  // Sync profile details if user loads asynchronously
  useEffect(() => {
    if (user) {
      setFullName(user.full_name);
      setPhone(user.phone);
      setLocation(user.location || '');
      setAvatarUrl(user.avatar_url || '');
    }
  }, [user]);

  // Fetch My Listings
  const { data: productsData, refetch: refetchProducts } = useQuery({
    queryKey: ['myListings'],
    queryFn: async () => {
      const response = await api.get('/products');
      return response.data;
    },
    enabled: !!user,
  });

  // Fetch My Requirements
  const { data: requirementsData, refetch: refetchRequirements } = useQuery({
    queryKey: ['myRequirements'],
    queryFn: async () => {
      const response = await api.get('/requirements');
      return response.data;
    },
    enabled: !!user,
  });

  const myListings = productsData?.data?.filter((p: any) => p.seller_id === user?.id) || [];
  const myRequirements = requirementsData?.data?.filter((r: any) => r.buyer_id === user?.id) || [];

  // Update Profile Mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (payload: any) => {
      const response = await api.patch('/users/profile', payload);
      return response.data;
    },
    onSuccess: (res) => {
      if (res?.success) {
        setSuccess('Profile updated successfully!');
        setEditOpen(false);
        refreshUser();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(res?.message || 'Update failed');
      }
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Update failed');
    },
  });

  // Delete Listing Mutation
  const deleteListingMutation = useMutation({
    mutationFn: async (productId: string) => {
      await api.delete(`/products/${productId}`);
    },
    onSuccess: () => {
      refetchProducts();
      queryClient.invalidateQueries({ queryKey: ['recentProducts'] });
    },
  });

  // Update Listing Status Mutation
  const updateListingStatusMutation = useMutation({
    mutationFn: async ({ productId, status }: { productId: string; status: string }) => {
      await api.patch(`/products/${productId}`, { status });
    },
    onSuccess: () => {
      refetchProducts();
      queryClient.invalidateQueries({ queryKey: ['recentProducts'] });
    },
  });

  // Delete Requirement Mutation
  const deleteRequirementMutation = useMutation({
    mutationFn: async (reqId: string) => {
      await api.delete(`/requirements/${reqId}`);
    },
    onSuccess: () => {
      refetchRequirements();
    },
  });

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!fullName || !phone) {
      setError('Name and Phone are required fields');
      return;
    }

    updateProfileMutation.mutate({
      full_name: fullName,
      phone,
      location: location || null,
      avatar_url: avatarUrl || null,
    });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-16">
      {/* Profile Details Panel */}
      <section className="glass-card p-8 rounded-3xl border border-slate-800 flex flex-col md:flex-row items-center md:items-start gap-6 relative">
        {success && (
          <div className="absolute top-4 right-4 flex items-center gap-1.5 p-3 rounded-xl bg-emerald-950/40 border border-emerald-900/50 text-emerald-200 text-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> {success}
          </div>
        )}

        <img
          src={user?.avatar_url || 'https://api.dicebear.com/7.x/bottts/svg?seed=' + user?.full_name}
          alt=""
          className="w-24 h-24 rounded-full border border-slate-700 object-cover"
        />

        <div className="flex-1 text-center md:text-left space-y-4">
          <div className="space-y-1">
            <h2 className="text-2xl font-extrabold text-white">{user?.full_name}</h2>
            <span className="inline-flex px-2.5 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase bg-primary-950 border border-primary-900 text-primary-400">
              {user?.role}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-slate-400">
            <p className="flex items-center justify-center md:justify-start gap-2">
              <Mail className="w-4 h-4 text-slate-500" /> {user?.email}
            </p>
            <p className="flex items-center justify-center md:justify-start gap-2">
              <Phone className="w-4 h-4 text-slate-500" /> {user?.phone}
            </p>
            <p className="flex items-center justify-center md:justify-start gap-2">
              <MapPin className="w-4 h-4 text-slate-500" /> {user?.location || 'No location set'}
            </p>
            <p className="flex items-center justify-center md:justify-start gap-2">
              <Calendar className="w-4 h-4 text-slate-500" /> Member since:{' '}
              {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
            </p>
          </div>
        </div>

        <button
          onClick={() => setEditOpen(true)}
          className="px-4 py-2 rounded-xl border border-slate-800 bg-slate-900/40 text-slate-300 hover:text-white hover:border-slate-750 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow"
        >
          <Settings className="w-4 h-4" /> Edit Profile
        </button>
      </section>

      {/* Tabs list */}
      <div className="space-y-6">
        <div className="flex border-b border-slate-800">
          <button
            onClick={() => setActiveTab('listings')}
            className={`px-6 py-3 font-semibold text-sm border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'listings'
                ? 'border-primary-500 text-primary-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShoppingBag className="w-4 h-4" /> My Listings ({myListings.length})
          </button>
          <button
            onClick={() => setActiveTab('requirements')}
            className={`px-6 py-3 font-semibold text-sm border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'requirements'
                ? 'border-primary-500 text-primary-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ClipboardList className="w-4 h-4" /> My Requirements ({myRequirements.length})
          </button>
        </div>

        {/* Tab Listings */}
        {activeTab === 'listings' && (
          <div className="grid grid-cols-1 gap-4">
            {myListings.length > 0 ? (
              myListings.map((prod: any) => (
                <div
                  key={prod.id}
                  className="glass-card p-5 rounded-2xl border border-slate-850 flex flex-col sm:flex-row justify-between items-center gap-4"
                >
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <img
                      src={prod.images?.[0]?.image_url || 'https://picsum.photos/80/60'}
                      alt=""
                      className="w-16 h-12 rounded-lg object-cover shrink-0 border border-slate-800 bg-slate-950"
                    />
                    <div className="min-w-0">
                      <Link
                        to={`/products/${prod.id}`}
                        className="font-bold text-white hover:text-primary-400 truncate hover:underline text-base block"
                      >
                        {prod.title}
                      </Link>
                      <p className="text-xs text-emerald-400 font-extrabold mt-0.5">
                        ₹{Number(prod.selling_price).toLocaleString('en-IN')}{' '}
                        <span className="text-[10px] text-slate-500 font-semibold uppercase px-1.5 py-0.2 bg-slate-900 border border-slate-850 rounded">
                          {prod.status}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                    {prod.status === 'AVAILABLE' && (
                      <button
                        onClick={() =>
                          updateListingStatusMutation.mutate({
                            productId: prod.id,
                            status: 'SOLD',
                          })
                        }
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer shadow transition-colors"
                      >
                        Mark as Sold
                      </button>
                    )}

                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this listing?')) {
                          deleteListingMutation.mutate(prod.id);
                        }
                      }}
                      className="p-2 text-slate-500 hover:text-red-400 hover:bg-slate-900 rounded-lg transition-colors cursor-pointer"
                      title="Delete Listing"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 text-center text-slate-500 text-sm">
                You have not listed any products yet.{' '}
                <Link to="/products/new" className="text-primary-400 hover:underline">
                  List an item now
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Tab Requirements */}
        {activeTab === 'requirements' && (
          <div className="grid grid-cols-1 gap-4">
            {myRequirements.length > 0 ? (
              myRequirements.map((req: any) => (
                <div
                  key={req.id}
                  className="glass-card p-5 rounded-2xl border border-slate-850 flex flex-col sm:flex-row justify-between items-center gap-4"
                >
                  <div className="w-full sm:w-auto">
                    <h4 className="font-bold text-white text-base">{req.title}</h4>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-1">{req.description}</p>
                    <p className="text-xs text-emerald-400 font-extrabold mt-1">
                      Budget: ₹{Number(req.budget).toLocaleString('en-IN')}{' '}
                      <span className="text-[10px] text-slate-500 font-semibold uppercase px-1.5 py-0.2 bg-slate-900 border border-slate-850 rounded">
                        {req.status}
                      </span>
                    </p>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this requirement?')) {
                          deleteRequirementMutation.mutate(req.id);
                        }
                      }}
                      className="p-2 text-slate-500 hover:text-red-400 hover:bg-slate-900 rounded-lg transition-colors cursor-pointer"
                      title="Delete requirement"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 text-center text-slate-500 text-sm">
                You have not posted any buyer requirements yet.{' '}
                <Link to="/buyer-requirements/new" className="text-primary-400 hover:underline">
                  Post a requirement
                </Link>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      {editOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card w-full max-w-md p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex justify-between items-start">
              <h3 className="text-lg font-bold text-white flex items-center gap-1.5">
                <Settings className="w-5 h-5 text-primary-400" /> Edit Profile Details
              </h3>
              <button
                onClick={() => setEditOpen(false)}
                className="text-slate-500 hover:text-slate-400 text-sm cursor-pointer"
              >
                Cancel
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-950/40 border border-red-900/50 text-red-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" /> {error}
              </div>
            )}

            <form onSubmit={handleProfileSubmit} className="space-y-4">
              {/* Full Name */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-550">Full Name *</label>
                <input
                  type="text"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-primary-500"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>

              {/* Phone */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-550">Phone Number *</label>
                <input
                  type="tel"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-primary-500"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>

              {/* Location */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-550">Location</label>
                <input
                  type="text"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-primary-500"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>

              {/* Avatar Url */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-550">Avatar Image URL (Optional)</label>
                <input
                  type="url"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-primary-500"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="https://example.com/avatar.jpg"
                />
              </div>

              <button
                type="submit"
                disabled={updateProfileMutation.isPending}
                className="gradient-btn w-full py-2.5 rounded-xl text-sm font-semibold cursor-pointer"
              >
                {updateProfileMutation.isPending ? 'Updating...' : 'Save Profile Details'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
