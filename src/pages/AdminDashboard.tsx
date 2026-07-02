import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { CheckCircle, Trash2, Shield, Loader2 } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Redirect if not ADMIN or not logged in
  useEffect(() => {
    if (!user) {
      navigate('/auth/login');
    } else if (user.role !== 'ADMIN') {
      navigate('/');
    }
  }, [user, navigate]);

  // Fetch Reports
  const { data: reportsData, isLoading, refetch } = useQuery({
    queryKey: ['adminReports'],
    queryFn: async () => {
      const response = await api.get('/reports');
      return response.data;
    },
    enabled: !!user && user.role === 'ADMIN',
  });

  // Update Report Status Mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ reportId, status }: { reportId: string; status: string }) => {
      const response = await api.patch(`/reports/${reportId}/status`, { status });
      return response.data;
    },
    onSuccess: () => {
      refetch();
    },
  });

  // Delete Listing (Moderation Action) Mutation
  const deleteProductMutation = useMutation({
    mutationFn: async ({ productId, reportId }: { productId: string; reportId: string }) => {
      // Delete the product
      await api.delete(`/products/${productId}`);
      // Auto-resolve the report
      await api.patch(`/reports/${reportId}/status`, { status: 'RESOLVED' });
    },
    onSuccess: () => {
      refetch();
    },
  });

  const reports = reportsData?.data || [];

  if (isLoading) {
    return (
      <div className="h-96 flex items-center justify-center gap-2">
        <Loader2 className="w-6 h-6 text-primary-500 animate-spin" />
        <span className="text-slate-400 text-sm">Loading admin dashboard...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center gap-2.5">
        <div className="w-10 h-10 bg-primary-950/80 border border-primary-800 rounded-xl flex items-center justify-center">
          <Shield className="w-5.5 h-5.5 text-primary-400" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Admin Moderation Dashboard</h1>
          <p className="text-slate-400 text-sm mt-0.5">
            Manage reported listings and protect SecondSpin marketplace integrity.
          </p>
        </div>
      </div>

      <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900/40 border-b border-slate-850 text-xs font-bold uppercase tracking-wider text-slate-450">
                <th className="p-4 pl-6">Reported Listing</th>
                <th className="p-4">Reporter</th>
                <th className="p-4">Reason / Description</th>
                <th className="p-4">Status</th>
                <th className="p-4 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850 text-sm">
              {reports.length > 0 ? (
                reports.map((rep: any) => (
                  <tr key={rep.id} className="hover:bg-slate-900/10 transition-colors">
                    {/* Listing Column */}
                    <td className="p-4 pl-6">
                      {rep.product?.status === 'DELETED' ? (
                        <span className="text-slate-500 line-through text-xs font-medium">
                          {rep.product?.title || 'Deleted Product'}
                        </span>
                      ) : (
                        <Link
                          to={`/products/${rep.product?.id}`}
                          className="font-bold text-white hover:text-primary-400 hover:underline block"
                        >
                          {rep.product?.title}
                        </Link>
                      )}
                      {rep.product?.seller && (
                        <span className="text-[10px] text-slate-500 block mt-0.5">
                          Seller: {rep.product.seller.full_name} ({rep.product.seller.email})
                        </span>
                      )}
                    </td>

                    {/* Reporter Column */}
                    <td className="p-4">
                      <p className="font-semibold text-slate-300">{rep.reporter?.full_name}</p>
                      <span className="text-[10px] text-slate-500">{rep.reporter?.email}</span>
                    </td>

                    {/* Reason Column */}
                    <td className="p-4 max-w-xs">
                      <p className="text-slate-350 text-xs leading-relaxed whitespace-pre-line">
                        {rep.reason}
                      </p>
                      <span className="text-[9px] text-slate-500 block mt-1">
                        Reported at: {new Date(rep.created_at).toLocaleString()}
                      </span>
                    </td>

                    {/* Status Column */}
                    <td className="p-4">
                      <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider ${
                        rep.status === 'PENDING'
                          ? 'bg-red-950/20 border-red-900/50 text-red-400'
                          : rep.status === 'REVIEWED'
                          ? 'bg-amber-950/20 border-amber-900/50 text-amber-400'
                          : 'bg-emerald-950/20 border-emerald-900/50 text-emerald-450'
                      }`}>
                        {rep.status}
                      </span>
                    </td>

                    {/* Actions Column */}
                    <td className="p-4 pr-6 text-right space-x-2">
                      {rep.status !== 'RESOLVED' && (
                        <>
                          <button
                            onClick={() =>
                              updateStatusMutation.mutate({
                                reportId: rep.id,
                                status: 'RESOLVED',
                              })
                            }
                            className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-slate-900 rounded-lg transition-colors cursor-pointer"
                            title="Resolve Report"
                          >
                            <CheckCircle className="w-5 h-5" />
                          </button>

                          {rep.product?.status !== 'DELETED' && (
                            <button
                              onClick={() => {
                                if (confirm('Are you sure you want to delete this product listing under moderation?')) {
                                  deleteProductMutation.mutate({
                                    productId: rep.product_id,
                                    reportId: rep.id,
                                  });
                                }
                              }}
                              className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-900 rounded-lg transition-colors cursor-pointer"
                              title="Delete Listing & Resolve"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          )}
                        </>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500 italic">
                    No listing reports in queue. Excellent job!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
