import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';

interface ErrorStateProps {
  error: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ error, onRetry }) => {
  return (
    <div className="card-enterprise bg-red-50/50 border border-red-200 p-6 rounded-lg max-w-lg mx-auto my-6 text-center animate-fade-in">
      <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-3 text-red-600">
        <AlertCircle className="w-6 h-6" />
      </div>

      <h3 className="text-sm font-bold text-red-900 font-heading mb-1">
        Analysis Interrupted
      </h3>

      <p className="text-xs text-red-700 mb-4 leading-relaxed">
        {error || "Unable to complete analysis right now. Please try again."}
      </p>

      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-700 hover:bg-red-800 text-white rounded text-xs font-semibold shadow-sm transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Try Again</span>
        </button>
      )}
    </div>
  );
};
