
import React from 'react';
import { AnalysisReport } from '../types';

interface ReportViewProps {
  report: AnalysisReport;
}

const ReportView: React.FC<ReportViewProps> = ({ report }) => {
  return (
    <div className="max-w-5xl mx-auto pb-24 px-4 sm:px-6 lg:px-8 space-y-12 animate-in fade-in duration-700">
      
      {/* Executive Summary */}
      <section className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
        <h2 className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-4">Executive Summary</h2>
        <p className="text-xl text-gray-800 leading-relaxed font-medium">
          {report.executiveSummary}
        </p>
      </section>

      {/* Weakness Matrix */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center">
          <span className="bg-blue-600 text-white w-8 h-8 rounded-lg flex items-center justify-center text-sm mr-3">1</span>
          Weakness Matrix
        </h2>
        <div className="grid gap-8">
          {report.weaknessMatrix?.map((w, idx) => (
            <div key={idx} className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 transition-all hover:border-blue-200">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{w.name}</h3>
                  <div className="flex gap-4">
                    <span className="text-sm text-gray-500">
                      Frequency: <span className="font-semibold text-gray-900">{w.frequency} ({w.frequencyPercentage})</span>
                    </span>
                    <span className="text-sm text-gray-500">
                      Pain: <span className="font-semibold text-gray-900">{w.painIntensity}</span>
                    </span>
                  </div>
                </div>
                <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-xl border border-blue-100 flex items-center">
                  <span className="text-sm font-bold mr-2">Opportunity Score:</span>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className={`text-lg ${i < w.opportunityScore ? 'text-blue-600' : 'text-blue-200'}`}>★</span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase mb-3">User Voices</h4>
                    <div className="space-y-3">
                      {w.quotes?.map((quote, qIdx) => (
                        <blockquote key={qIdx} className="bg-gray-50 p-4 rounded-xl text-sm italic text-gray-700 border-l-4 border-blue-500">
                          "{quote}"
                        </blockquote>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase mb-3">Monetization Signals</h4>
                    <p className="text-sm text-gray-600 bg-green-50 p-4 rounded-xl border border-green-100">
                      {w.monetizationSignals}
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase mb-3">Why This Matters</h4>
                    <p className="text-sm text-gray-700 leading-relaxed">{w.significance}</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase mb-3">Competitors Affected</h4>
                    <ul className="space-y-2">
                      {w.competitorsAffected?.map((comp, cIdx) => (
                        <li key={cIdx} className="flex items-start text-sm">
                          <span className="font-bold text-gray-900 mr-2">• {comp.name}:</span>
                          <span className="text-gray-600">{comp.failureMode}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Comparison Table */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center">
          <span className="bg-blue-600 text-white w-8 h-8 rounded-lg flex items-center justify-center text-sm mr-3">2</span>
          Opportunity Ranking
        </h2>
        <div className="overflow-hidden bg-white shadow-sm border border-gray-100 rounded-2xl">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Weakness</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Freq</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Pain</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Moat</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Score</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Differentiation</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {report.comparisonTable?.map((row, i) => (
                <tr key={i}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{row.weakness}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{row.frequency}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{row.pain}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{row.moat}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 font-bold">
                    {'⭐'.repeat(row.opportunityScore)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{row.whyBuildThis}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Strategic Recommendations */}
      <section className="grid md:grid-cols-2 gap-8">
        <div className="bg-blue-900 text-white rounded-2xl p-8 shadow-lg">
          <h2 className="text-xl font-bold mb-6 flex items-center">
            <svg className="w-6 h-6 mr-2 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Strongest Opportunity
          </h2>
          <p className="leading-relaxed opacity-90">{report.strategicRecommendations?.strongestOpportunity}</p>
        </div>
        
        <div className="space-y-8">
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Quick Win Alternative
            </h2>
            <p className="text-sm text-gray-600">{report.strategicRecommendations?.quickWinAlternative}</p>
          </div>
          <div className="bg-red-50 rounded-2xl p-8 shadow-sm border border-red-100">
            <h2 className="text-lg font-bold text-red-900 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Red Flags
            </h2>
            <p className="text-sm text-red-700">{report.strategicRecommendations?.redFlags}</p>
          </div>
        </div>
      </section>

      {/* Validation Next Steps */}
      <section className="bg-gray-900 text-white rounded-2xl p-8 shadow-xl">
        <h2 className="text-2xl font-bold mb-8">Validation Next Steps</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {report.validationNextSteps?.map((step, i) => (
            <div key={i} className="bg-white/10 p-6 rounded-xl border border-white/10 backdrop-blur-sm">
              <div className="text-3xl font-bold text-blue-400 mb-4">0{i + 1}</div>
              <p className="text-sm font-medium">{step}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Grounding Sources */}
      {report.sources?.length > 0 && (
        <section className="pb-12">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Evidence Sources</h2>
          <div className="flex flex-wrap gap-2">
            {report.sources.map((source, i) => (
              <a 
                key={i} 
                href={source.uri} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center px-3 py-1 bg-white border border-gray-200 rounded-full text-xs text-blue-600 hover:bg-blue-50 transition-colors"
              >
                {source.title}
                <svg className="w-3 h-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            ))}
          </div>
        </section>
      )}

    </div>
  );
};

export default ReportView;
