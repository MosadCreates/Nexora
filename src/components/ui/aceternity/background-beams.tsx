import dynamic from "next/dynamic";

export const BackgroundBeams = dynamic(
  () => import("./background-beams-core").then((mod) => mod.BackgroundBeams),
  { ssr: false, loading: () => null }
);
