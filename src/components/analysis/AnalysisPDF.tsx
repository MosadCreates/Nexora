import dynamic from "next/dynamic";

const AnalysisPDF = dynamic(
  () => import("./AnalysisPDFCore"),
  { ssr: false, loading: () => null }
);

export default AnalysisPDF;
