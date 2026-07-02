import React from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { MessageSquare, Heart, LogOut, ShieldAlert, Plus, Layers } from 'lucide-react';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ProductsBrowse from './pages/ProductsBrowse';
import ProductDetail from './pages/ProductDetail';
import ProductCreate from './pages/ProductCreate';
import RequirementsBrowse from './pages/RequirementsBrowse';
import RequirementCreate from './pages/RequirementCreate';
import Inbox from './pages/Inbox';
import Wishlist from './pages/Wishlist';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';

// Protected Route component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-400">
        Loading...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }

  return <>{children}</>;
};

// Admin Route component
const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-400">
        Loading...
      </div>
    );
  }

  if (!user || user.role !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

function App() {
  const { user, logout } = useAuth();

  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-primary-500 selection:text-white">
        {/* Navbar */}
        <header className="sticky top-0 bg-slate-950/80 backdrop-blur-md border-b border-slate-900 z-40 transition-all">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-primary-950/30 group-hover:scale-105 transition-transform">
                <Layers className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-350 tracking-tight">
                Second<span className="text-primary-400 font-extrabold">Spin</span>
              </span>
            </Link>

            {/* Navigation links */}
            <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-400">
              <Link to="/products" className="hover:text-slate-100 transition-colors">
                Browse Items
              </Link>
              <Link to="/buyer-requirements" className="hover:text-slate-100 transition-colors">
                Buyer Demands
              </Link>
            </nav>

            {/* Right side items */}
            <div className="flex items-center gap-4">
              {user ? (
                <>
                  {/* Sell Button */}
                  <Link
                    to="/products/new"
                    className="gradient-btn px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1 hover:shadow-lg shadow-primary-950/20"
                  >
                    <Plus className="w-3.5 h-3.5" /> Sell Item
                  </Link>

                  {/* Wishlist */}
                  <Link
                    to="/wishlist"
                    className="p-2 text-slate-400 hover:text-rose-500 hover:bg-slate-900 rounded-lg transition-all"
                    title="Wishlist"
                  >
                    <Heart className="w-5 h-5" />
                  </Link>

                  {/* Chat Inbox */}
                  <Link
                    to="/inbox"
                    className="p-2 text-slate-400 hover:text-primary-400 hover:bg-slate-900 rounded-lg transition-all"
                    title="Chat Messages"
                  >
                    <MessageSquare className="w-5 h-5" />
                  </Link>

                  {/* Admin Mod Queue */}
                  {user.role === 'ADMIN' && (
                    <Link
                      to="/admin/reports"
                      className="p-2 text-slate-400 hover:text-amber-500 hover:bg-slate-900 rounded-lg transition-all"
                      title="Moderation Center"
                    >
                      <ShieldAlert className="w-5 h-5" />
                    </Link>
                  )}

                  {/* Profile */}
                  <Link
                    to="/profile"
                    className="flex items-center gap-2 pl-2 border-l border-slate-900 group"
                  >
                    <img
                      src={user.avatar_url || 'https://api.dicebear.com/7.x/bottts/svg?seed=' + user.full_name}
                      alt=""
                      className="w-8 h-8 rounded-full border border-slate-800 object-cover group-hover:border-slate-600 transition-colors"
                    />
                    <span className="hidden sm:inline text-xs font-semibold text-slate-350 group-hover:text-white transition-colors truncate max-w-[80px]">
                      {user.full_name
                      // .split(' ')[0]
                      }
                    </span>
                  </Link>

                  {/* Logout */}
                  <button
                    onClick={logout}
                    className="p-2 text-slate-450 hover:text-red-400 hover:bg-slate-900 rounded-lg transition-all cursor-pointer"
                    title="Sign Out"
                  >
                    <LogOut className="w-4.5 h-4.5" />
                  </button>
                </>
              ) : (
                <div className="flex items-center gap-3">
                  <Link
                    to="/auth/login"
                    className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    to="/auth/register"
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-850 text-white rounded-xl border border-slate-800 text-xs font-bold transition-all shadow-md"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/register" element={<Register />} />
            <Route path="/products" element={<ProductsBrowse />} />
            <Route path="/products/:id" element={<ProductDetail />} />

            {/* Protected Routes */}
            <Route
              path="/products/new"
              element={
                <ProtectedRoute>
                  <ProductCreate />
                </ProtectedRoute>
              }
            />
            <Route path="/buyer-requirements" element={<RequirementsBrowse />} />
            <Route
              path="/buyer-requirements/new"
              element={
                <ProtectedRoute>
                  <RequirementCreate />
                </ProtectedRoute>
              }
            />
            <Route
              path="/inbox"
              element={
                <ProtectedRoute>
                  <Inbox />
                </ProtectedRoute>
              }
            />
            <Route
              path="/wishlist"
              element={
                <ProtectedRoute>
                  <Wishlist />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />

            {/* Admin Only Routes */}
            <Route
              path="/admin/reports"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />

            {/* Catch-all Redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-900/60 bg-slate-950/20 py-8 text-center text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 space-y-2">
            <p>&copy; {new Date().getFullYear()} SecondSpin Peer-to-Peer AI Trust Marketplace.</p>
            <div className="flex justify-center gap-4 text-[10px] text-slate-600">
              <Link to="/products" className="hover:underline">Browse Listings</Link>
              <span>&bull;</span>
              <Link to="/buyer-requirements" className="hover:underline">Buyer Requirements</Link>
            </div>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default App;
