'use client';

import { Check } from 'lucide-react';
import { Fragment } from 'react';

const steps = [
  { number: 1, title: 'Business Info', description: 'Name & hours' },
  { number: 2, title: 'Services', description: 'Add services' },
  { number: 3, title: 'Staff', description: 'Add team members' },
  { number: 4, title: 'Pages', description: 'Build booking flow' },
];

export default function WizardStepper({ currentStep }) {
  return (
    <div className="w-full py-8">
      <div className="max-w-3xl mx-auto px-4">
        {/* Mobile: Simplified progress */}
        <div className="block md:hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-600">
              Step {currentStep} of 4
            </span>
            <span className="text-sm text-slate-500">{steps[currentStep - 1].title}</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-orange-500 to-orange-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / 4) * 100}%` }}
            />
          </div>
        </div>

        {/* Desktop: Full stepper */}
        <div className="hidden md:block">
          {/* Circles and lines row */}
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <Fragment key={step.number}>
                {/* Circle */}
                <div className="flex-shrink-0">
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
                </div>

                {/* Connector line */}
                {index < steps.length - 1 && (
                  <div className="flex-1 h-0.5 mx-4">
                    <div
                      className={`h-full transition-all duration-300 ${
                        currentStep > step.number ? 'bg-orange-500' : 'bg-slate-300'
                      }`}
                    />
                  </div>
                )}
              </Fragment>
            ))}
          </div>

          {/* Labels row */}
          <div className="flex justify-between mt-3">
            {steps.map((step) => (
              <div key={step.number} className="text-center" style={{ width: '48px' }}>
                <div
                  className={`text-sm font-semibold ${
                    currentStep >= step.number ? 'text-orange-600' : 'text-slate-400'
                  }`}
                >
                  {step.title}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">{step.description}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
