'use client'

import { AnalysisPage } from "@/components/analysis/AnalysisPage";
import { Suspense } from "react";
import { LoaderTwo } from "@/components/ui/loader";

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-black"><LoaderTwo /></div>}>
      <AnalysisPage />
    </Suspense>
  );
}
