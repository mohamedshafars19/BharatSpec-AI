import React, { useState } from 'react';
import { ClarificationQuestion, ClarificationAnswer } from '../types';
import { HelpCircle, X, ArrowRight, ArrowLeft, Check, Sparkles } from 'lucide-react';

interface ClarifyingQuestionsModalProps {
  questions: ClarificationQuestion[];
  isOpen: boolean;
  onClose: () => void;
  onSubmitAnswers: (answers: ClarificationAnswer[]) => void;
  isLoading?: boolean;
}

export const ClarifyingQuestionsModal: React.FC<ClarifyingQuestionsModalProps> = ({
  questions,
  isOpen,
  onClose,
  onSubmitAnswers,
  isLoading = false
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});

  if (!isOpen || !questions || questions.length === 0) return null;

  const currentQ = questions[currentIndex];
  const isLast = currentIndex === questions.length - 1;

  const handleSelectOption = (optionValue: string) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [currentQ.id]: optionValue
    }));
  };

  const handleNext = () => {
    if (isLast) {
      // Build answers array
      const answers: ClarificationAnswer[] = Object.entries(selectedAnswers).map(([qid, val]) => ({
        question_id: qid,
        selected_option: val
      }));
      onSubmitAnswers(answers);
    } else {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const currentSelected = selectedAnswers[currentQ.id];

  return (
    <div className="modal-backdrop animate-fade-in" onClick={onClose}>
      <div
        className="bg-white rounded-lg shadow-2xl border border-[#E2DBD0] w-full max-w-lg overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#20241F] text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded bg-[#8B9A6E]/20 border border-[#8B9A6E]/40 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-[#8B9A6E]" />
            </div>
            <div>
              <h3 className="text-sm font-bold font-heading text-white">
                Specification Clarification
              </h3>
              <p className="text-[11px] text-slate-300">
                Help improve specification completeness & audit accuracy
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded hover:bg-white/10"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="bg-[#EEEEEE] h-1.5 w-full">
          <div
            className="bg-[#8B9A6E] h-full transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
          />
        </div>

        {/* Question Body */}
        <div className="p-5 sm:p-6 space-y-4">
          <div className="flex justify-between items-center text-xs text-[#7E867B]">
            <span className="font-semibold uppercase tracking-wider text-[#8B9A6E]">
              Question {currentIndex + 1} of {questions.length}
            </span>
            <span>Target: {currentQ.context_field}</span>
          </div>

          <h4 className="text-sm font-bold text-[#20241F] font-heading leading-snug">
            {currentQ.question}
          </h4>

          {currentQ.help_text && (
            <p className="text-xs text-[#575E54] bg-[#FAF7F2] p-2.5 rounded border border-[#EAE2D6] leading-relaxed">
              {currentQ.help_text}
            </p>
          )}

          {/* Options List */}
          <div className="space-y-2 pt-1">
            {currentQ.options.map(opt => {
              const isChecked = currentSelected === opt.value;
              return (
                <div
                  key={opt.id}
                  onClick={() => handleSelectOption(opt.value)}
                  className={`p-3 rounded border text-xs cursor-pointer transition-all flex items-start justify-between gap-3 ${
                    isChecked
                      ? 'border-[#20241F] bg-[#FAF7F2] font-semibold text-[#20241F]'
                      : 'border-[#EAE2D6] bg-white hover:bg-[#FAF7F2]/60 text-[#575E54]'
                  }`}
                >
                  <span className="leading-relaxed">{opt.label}</span>
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                      isChecked ? 'border-[#20241F] bg-[#20241F] text-white' : 'border-[#CDC4B6]'
                    }`}
                  >
                    {isChecked && <Check className="w-2.5 h-2.5" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-[#FAF7F2] border-t border-[#E2DBD0] flex items-center justify-between">
          <button
            type="button"
            onClick={handleBack}
            disabled={currentIndex === 0}
            className="btn-secondary text-xs disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="text-xs text-[#7E867B] hover:text-[#20241F] px-2 py-1"
            >
              Skip
            </button>
            <button
              type="button"
              onClick={handleNext}
              disabled={isLoading}
              className="btn-primary text-xs"
            >
              <span>{isLast ? (isLoading ? 'Updating Audit...' : 'Apply & Update') : 'Continue'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
