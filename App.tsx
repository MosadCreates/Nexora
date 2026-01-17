
import React, { useState, useEffect } from 'react';
import { AnalysisStep, AnalysisReport, UserProfile } from './types';
import { analyzeWeakness } from './services/geminiService';
import LoadingState from './components/LoadingState';
import ReportView from './components/ReportView';
import Auth from './components/Auth';
import { supabase } from './lib/supabase';

const MAX_FREE_CREDITS = 10;

const App: React.FC = () => {
  const [query, setQuery] = useState('');
  const [step, setStep] = useState<AnalysisStep>(AnalysisStep.IDLE);
  const [report, setReport] = useState<AnalysisReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Auth state
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (data) setProfile(data);
  };

  const remainingCredits = profile ? (profile.is_pro ? 'Unlimited' : Math.max(0, MAX_FREE_CREDITS - profile.credits_used)) : 0;
  const isOutOfCredits = !profile?.is_pro && (profile?.credits_used || 0) >= MAX_FREE_CREDITS;

  const handleAnalyze = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim() || isOutOfCredits) return;

    setStep(AnalysisStep.RESEARCHING);
    setError(null);
    setReport(null);

    // Visual feedback delays
    const clusteringTimeout = setTimeout(() => setStep(AnalysisStep.CLUSTERING), 4000);
    const scoringTimeout = setTimeout(() => setStep(AnalysisStep.SCORING), 8000);

    try {
      const result = await analyzeWeakness(query);
      
      // Successfully analyzed, update Supabase tracking
      if (session?.user?.id) {
        // 1. Increment credits
        const { error: updateError } = await supabase.rpc('increment_credits', { 
          user_id: session.user.id 
        });

        // 2. Log history
        await supabase.from('analysis_history').insert({
          user_id: session.user.id,
          query: query.trim()
        });

        if (!updateError) fetchProfile(session.user.id);
      }

      setReport(result);
      setStep(AnalysisStep.COMPLETED);
    } catch (err: any) {
      clearTimeout(clusteringTimeout);
      clearTimeout(scoringTimeout);
      console.error(err);
      setError("Analysis failed. This could be due to network issues or API limits. Please try again.");
      setStep(AnalysisStep.ERROR);
    }
  };

  const reset = () => {
    setQuery('');
    setStep(AnalysisStep.IDLE);
    setReport(null);
    setError(null);
  };

  const handleSignOut = () => {
    supabase.auth.signOut();
  };

  const examples = [
    { label: "Analyze Notion's weaknesses", value: "Analyze Notion's weaknesses" },
    { label: "Find gaps in project management tools", value: "Find gaps in project management tools" },
    { label: "People struggling with meal planning", value: "People struggling with meal planning" },
    { label: "Remote teams frustrated with video calls", value: "Remote teams frustrated with video calls" },
  ];

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
    </div>;
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className={`bg-white border-b border-gray-100 sticky top-0 z-50 transition-all ${step === AnalysisStep.IDLE ? 'py-8 shadow-none' : 'py-4 shadow-sm'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={reset}>
            <div className="bg-blue-600 p-2 rounded-xl">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 leading-tight">CompetitorLens</h1>
              <p className="text-xs text-gray-400 font-medium">Competitor Intelligence Agent</p>
            </div>
          </div>

          {session ? (
            <div className="flex items-center space-x-4">
              {profile && (
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-bold text-gray-900">{profile.first_name} {profile.last_name}</p>
                  <div className="flex items-center justify-end space-x-2">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${profile.is_pro ? 'bg-amber-100 text-amber-700' : 'bg-blue-50 text-blue-700'}`}>
                      {profile.is_pro ? 'PRO' : 'FREE'}
                    </span>
                    <p className="text-xs text-gray-400">
                      Credits: <span className="font-bold text-gray-700">{remainingCredits}</span> left
                    </p>
                  </div>
                </div>
              )}
              <button 
                onClick={handleSignOut}
                className="text-sm font-semibold text-gray-600 hover:text-red-600 bg-gray-50 px-4 py-2 rounded-lg transition-colors border border-gray-100"
              >
                Sign Out
              </button>
            </div>
          ) : null}
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {!session ? (
          <Auth />
        ) : (
          <>
            {step === AnalysisStep.IDLE && (
              <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="text-center mb-12">
                  <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-4">
                    Find your next startup opportunity in the <span className="text-blue-600">failures of others.</span>
                  </h2>
                  <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-4">
                    Welcome back, {profile?.first_name || 'Innovator'}. 
                  </p>
                  <div className="inline-flex items-center space-x-4 px-4 py-2 bg-gray-50 rounded-full border border-gray-100">
                    <span className="text-sm text-gray-500">Credits Remaining:</span>
                    <span className={`text-sm font-bold ${isOutOfCredits ? 'text-red-600' : 'text-blue-600'}`}>
                      {remainingCredits} / {profile?.is_pro ? '∞' : MAX_FREE_CREDITS}
                    </span>
                  </div>
                </div>

                {isOutOfCredits && (
                  <div className="mb-8 p-4 bg-amber-50 border border-amber-200 rounded-xl text-center">
                    <p className="text-amber-800 text-sm font-medium">
                      You've used all your free credits. <strong>Upgrade to Pro</strong> for unlimited intelligence reports.
                    </p>
                  </div>
                )}

                <form onSubmit={handleAnalyze} className="relative group mb-12">
                  <input
                    type="text"
                    placeholder="What product or market should I analyze?"
                    disabled={isOutOfCredits}
                    className="w-full pl-6 pr-32 py-5 text-lg border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all shadow-lg group-hover:border-blue-300 disabled:bg-gray-50 disabled:cursor-not-allowed"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                  <button
                    type="submit"
                    disabled={!query.trim() || step !== AnalysisStep.IDLE || isOutOfCredits}
                    className="absolute right-3 top-3 bottom-3 px-6 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 disabled:bg-gray-200 disabled:cursor-not-allowed transition-all"
                  >
                    Analyze
                  </button>
                </form>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {examples.map((ex, i) => (
                    <button
                      key={i}
                      disabled={isOutOfCredits}
                      onClick={() => { setQuery(ex.value); handleAnalyze(); }}
                      className="text-left px-5 py-4 bg-white border border-gray-100 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-all shadow-sm group disabled:opacity-50 disabled:hover:border-gray-100 disabled:hover:bg-white"
                    >
                      <p className="text-sm font-bold text-gray-900 group-hover:text-blue-600">{ex.label}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {(step === AnalysisStep.RESEARCHING || step === AnalysisStep.CLUSTERING || step === AnalysisStep.SCORING) && (
              <LoadingState step={step} />
            )}

            {step === AnalysisStep.ERROR && (
              <div className="max-w-xl mx-auto py-20 text-center">
                <div className="bg-red-50 text-red-600 p-8 rounded-2xl border border-red-100 mb-8">
                  <svg className="w-12 h-12 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="text-xl font-bold mb-2">Analysis Interrupted</h3>
                  <p>{error}</p>
                </div>
                <button 
                  onClick={handleAnalyze}
                  className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all"
                >
                  Retry Analysis
                </button>
              </div>
            )}

            {step === AnalysisStep.COMPLETED && report && (
              <ReportView report={report} />
            )}
          </>
        )}
      </main>

      <footer className="bg-gray-50 border-t border-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm text-gray-500 font-medium mb-2">Developed for competitive intelligence specialists and entrepreneurs.</p>
          <p className="text-xs text-gray-400">Powered by Gemini 3.0 & Supabase Auth.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
