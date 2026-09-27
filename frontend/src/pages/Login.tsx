import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();
  const { showToast } = useUI();

  const [email, setEmail] = useState<string>('procurement@gov.in');
  const [password, setPassword] = useState<string>('BharatSpec2026!');
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !password) {
      setError('Please provide your official procurement email and password.');
      return;
    }

    try {
      setError(null);
      await login({ email: cleanEmail, password, remember_me: rememberMe });
      showToast('Welcome back to BharatSpec AI', 'success');
      navigate('/dashboard');
    } catch (err: any) {
      setError(err?.message || 'Invalid credentials. Please verify your email and password.');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-2xl border border-[#EAE2D6] p-8 shadow-sm space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-1">
          <div className="inline-flex items-center gap-2 mb-2">
            <span className="w-3 h-3 rounded-full bg-[#8B9A6E]" />
            <span className="font-serif text-xl font-bold tracking-tight text-[#20241F]">
              BharatSpec AI
            </span>
          </div>
          <h2 className="font-serif text-2xl font-bold text-[#20241F]">
            Sign in to your Workspace
          </h2>
          <p className="text-xs text-gray-500">
            From Requirement → Standard → Compliance → Tender
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#20241F] mb-1">
              Official Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. officer@dept.gov.in"
              className="w-full text-xs p-3 border border-[#EAE2D6] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#8B9A6E] bg-[#FAF7F2] focus:bg-white transition-colors"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-[#20241F]">
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-[11px] text-[#8B9A6E] hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full text-xs p-3 border border-[#EAE2D6] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#8B9A6E] bg-[#FAF7F2] focus:bg-white transition-colors"
            />
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-gray-600">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-[#EAE2D6] text-[#8B9A6E] focus:ring-[#8B9A6E]"
              />
              <span>Remember me on this workstation</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 bg-[#8B9A6E] hover:bg-[#707E55] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Authenticating...</span>
              </>
            ) : (
              <span>Sign In to Workspace →</span>
            )}
          </button>
        </form>

        <div className="pt-4 border-t border-[#EAE2D6] text-center text-xs text-gray-500">
          <span>Don't have an account? </span>
          <Link to="/signup" className="text-[#8B9A6E] font-semibold hover:underline">
            Register Procurement Account
          </Link>
        </div>
      </div>
    </div>
  );
};
