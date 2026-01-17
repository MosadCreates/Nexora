
import React from 'react';
import { AnalysisStep } from '../types';

interface LoadingStateProps {
  step: AnalysisStep;
}

const LoadingState: React.FC<LoadingStateProps> = ({ step }) => {
  const steps = [
    { id: AnalysisStep.RESEARCHING, label: 'Identifying high-signal sources and extracting complaints...' },
    { id: AnalysisStep.CLUSTERING, label: 'Clustering feedback into systematic weakness patterns...' },
    { id: AnalysisStep.SCORING, label: 'Calculating opportunity scores and monetization potential...' },
  ];

  return (
    <div className="max-w-2xl mx-auto py-20 px-4 text-center">
      <div className="mb-8 flex justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>
      
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Analyzing Market Gaps...</h2>
      
      <div className="space-y-4 text-left">
        {steps.map((s, idx) => {
          const isCompleted = steps.findIndex(x => x.id === step) > idx;
          const isActive = s.id === step;
          
          return (
            <div key={s.id} className="flex items-center space-x-3">
              <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                isCompleted ? 'bg-green-100 text-green-600' : 
                isActive ? 'bg-blue-600 text-white animate-pulse' : 'bg-gray-100 text-gray-400'
              }`}>
                {isCompleted ? '✓' : idx + 1}
              </div>
              <p className={`text-sm ${isActive ? 'font-semibold text-gray-900' : 'text-gray-500'}`}>
                {s.label}
              </p>
            </div>
          );
        })}
      </div>
      
      <p className="mt-8 text-xs text-gray-400 italic">
        "Transforming scattered complaints into actionable intelligence..."
      </p>
    </div>
  );
};

export default LoadingState;
