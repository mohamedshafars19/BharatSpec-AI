import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';

export const Signup: React.FC = () => {
  const navigate = useNavigate();
  const { signup, isLoading } = useAuth();
  const { showToast } = useUI();

  const [name, setName] = useState<string>('');
  const [organization, setOrganization] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [acceptTerms, setAcceptTerms] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim();
    const cleanOrg = organization.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanName || !cleanOrg || !cleanEmail || !password) {
      setError('Please fill in all required registration fields.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify your entries.');
      return;
    }
    if (!acceptTerms) {
      setError('Please accept the procurement terms and confidentiality conditions.');
      return;
    }

    try {
      setError(null);
      await signup({
        name: cleanName,
        organization: cleanOrg,
        email: cleanEmail,
        password: password,
        accept_terms: true
      });
      showToast('Registration successful! Welcome to BharatSpec AI.', 'success');
      navigate('/dashboard');
    } catch (err: any) {
      setError(err?.message || 'Registration failed. Please check your details.');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-lg w-full bg-white rounded-2xl border border-[#EAE2D6] p-8 shadow-sm space-y-6">
        <div className="text-center space-y-1">
          <div className="inline-flex items-center gap-2 mb-2">
            <span className="w-3 h-3 rounded-full bg-[#8B9A6E]" />
            <span className="font-serif text-xl font-bold tracking-tight text-[#20241F]">
              BharatSpec AI
            </span>
          </div>
          <h2 className="font-serif text-2xl font-bold text-[#20241F]">
            Create Procurement Account
          </h2>
          <p className="text-xs text-gray-500">
            Audit specifications and prepare tender schedules with Indian Standards intelligence.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#20241F] mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. R. K. Sharma"
                className="w-full text-xs p-3 border border-[#EAE2D6] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#8B9A6E] bg-[#FAF7F2] focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#20241F] mb-1">
                Organization / Ministry *
              </label>
              <input
                type="text"
                required
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                placeholder="e.g. State Highway Authority"
                className="w-full text-xs p-3 border border-[#EAE2D6] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#8B9A6E] bg-[#FAF7F2] focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#20241F] mb-1">
              Official Email Address *
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. sharma.rk@nic.in"
              className="w-full text-xs p-3 border border-[#EAE2D6] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#8B9A6E] bg-[#FAF7F2] focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#20241F] mb-1">
                Password *
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full text-xs p-3 border border-[#EAE2D6] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#8B9A6E] bg-[#FAF7F2] focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#20241F] mb-1">
                Confirm Password *
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full text-xs p-3 border border-[#EAE2D6] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#8B9A6E] bg-[#FAF7F2] focus:bg-white"
              />
            </div>
          </div>

          <div className="pt-1">
            <label className="flex items-start gap-2 cursor-pointer text-xs text-gray-600">
              <input
                type="checkbox"
                required
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="rounded border-[#EAE2D6] text-[#8B9A6E] focus:ring-[#8B9A6E] mt-0.5"
              />
              <span className="leading-snug">
                I accept the terms of use for procurement specification analysis and understand that final tender specifications require gazetted verification.
              </span>
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
                <span>Creating Account...</span>
              </>
            ) : (
              <span>Create Procurement Account →</span>
            )}
          </button>
        </form>

        <div className="pt-4 border-t border-[#EAE2D6] text-center text-xs text-gray-500">
          <span>Already registered? </span>
          <Link to="/login" className="text-[#8B9A6E] font-semibold hover:underline">
            Sign In Here
          </Link>
        </div>
      </div>
    </div>
  );
};
