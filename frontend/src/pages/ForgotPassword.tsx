import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useUI } from '../context/UIContext';

export const ForgotPassword: React.FC = () => {
  const { showToast } = useUI();
  const [email, setEmail] = useState<string>('');
  const [submitted, setSubmitted] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitted(true);
    showToast('Password reset link sent to your registered email address.', 'info');
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-2xl border border-[#EAE2D6] p-8 shadow-sm space-y-6">
        <div className="text-center space-y-1">
          <div className="inline-flex items-center gap-2 mb-2">
            <span className="w-3 h-3 rounded-full bg-[#8B9A6E]" />
            <span className="font-serif text-xl font-bold tracking-tight text-[#20241F]">
              BharatSpec AI
            </span>
          </div>
          <h2 className="font-serif text-2xl font-bold text-[#20241F]">
            Reset Password
          </h2>
          <p className="text-xs text-gray-500">
            Enter your official procurement email to receive password recovery instructions.
          </p>
        </div>

        {submitted ? (
          <div className="p-4 bg-[#F0FFF4] border border-[#38A169]/30 rounded-xl text-center space-y-3">
            <p className="text-xs text-[#22543D] leading-relaxed">
              If an account exists for <strong>{email}</strong>, a secure password reset link has been dispatched.
            </p>
            <Link
              to="/login"
              className="inline-block px-4 py-2 bg-[#8B9A6E] text-white text-xs font-semibold rounded-lg hover:bg-[#707E55]"
            >
              Return to Login
            </Link>
          </div>
        ) : (
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
                className="w-full text-xs p-3 border border-[#EAE2D6] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#8B9A6E] bg-[#FAF7F2] focus:bg-white"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-[#8B9A6E] hover:bg-[#707E55] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
            >
              Send Password Reset Link →
            </button>
          </form>
        )}

        <div className="pt-4 border-t border-[#EAE2D6] text-center text-xs text-gray-500">
          <Link to="/login" className="text-[#8B9A6E] font-semibold hover:underline">
            ← Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};
