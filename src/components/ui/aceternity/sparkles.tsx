import dynamic from "next/dynamic";
import type { Container, SingleOrMultiple } from "@tsparticles/engine";

type ParticlesProps = {
  id?: string;
  className?: string;
  background?: string;
  particleSize?: number;
  minSize?: number;
  maxSize?: number;
  speed?: number;
  particleColor?: string;
  particleDensity?: number;
};

// Next.js dynamic import for the heavy tsparticles integration
export const SparklesCore = dynamic(
  () => import("./sparkles-core").then((mod) => mod.SparklesCore),
  { ssr: false, loading: () => null }
);
