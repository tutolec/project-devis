import React from 'react';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  onStepClick: (step: number) => void;
}

export function StepIndicator({ currentStep, totalSteps, onStepClick }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center space-x-4 mb-8">
      {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => {
        const isActive = step === currentStep;
        const isPast = step < currentStep;
        const isClickable = step < currentStep;

        return (
          <React.Fragment key={step}>
            {step > 1 && (
              <div
                className={`h-0.5 w-12 ${
                  step <= currentStep ? 'bg-blue-900' : 'bg-gray-300'
                }`}
              />
            )}
            <button
              onClick={() => isClickable && onStepClick(step)}
              disabled={!isClickable}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors
                ${isActive ? 'bg-blue-900 text-white' : ''}
                ${isPast ? 'bg-blue-900 text-white cursor-pointer hover:bg-blue-700' : ''}
                ${!isActive && !isPast ? 'bg-gray-200 text-gray-600 cursor-not-allowed' : ''}
              `}
            >
              {step}
            </button>
          </React.Fragment>
        );
      })}
    </div>
  );
}