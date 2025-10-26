'use client';

import { Check } from 'lucide-react';

const steps = [
  { number: 1, title: 'Business Info', description: 'Name & hours' },
  { number: 2, title: 'Services', description: 'Add services' },
  { number: 3, title: 'Workflow', description: 'Build bot flow' },
];

export default function WizardStepper({ currentStep }) {
  return (
    <div className="w-full py-8">
      <div className="max-w-3xl mx-auto px-4">
        {/* Mobile: Simplified progress */}
        <div className="block md:hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-600">
              Step {currentStep} of 3
            </span>
            <span className="text-sm text-slate-500">{steps[currentStep - 1].title}</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-orange-500 to-orange-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / 3) * 100}%` }}
            />
          </div>
        </div>

        {/* Desktop: Full stepper */}
        <div className="hidden md:flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                {/* Circle */}
                <div
                  className={`
                    flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300
                    ${
                      currentStep > step.number
                        ? 'bg-orange-500 border-orange-500 text-white'
                        : currentStep === step.number
                        ? 'bg-orange-500 border-orange-500 text-white ring-4 ring-orange-100'
                        : 'bg-white border-slate-300 text-slate-400'
                    }
                  `}
                >
                  {currentStep > step.number ? (
                    <Check className="w-6 h-6" />
                  ) : (
                    <span className="text-lg font-semibold">{step.number}</span>
                  )}
                </div>

                {/* Title */}
                <div className="mt-3 text-center">
                  <div
                    className={`text-sm font-semibold ${
                      currentStep >= step.number ? 'text-orange-600' : 'text-slate-400'
                    }`}
                  >
                    {step.title}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">{step.description}</div>
                </div>
              </div>

              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="flex-1 h-0.5 mx-4 -mt-12">
                  <div
                    className={`h-full transition-all duration-300 ${
                      currentStep > step.number ? 'bg-orange-500' : 'bg-slate-300'
                    }`}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
