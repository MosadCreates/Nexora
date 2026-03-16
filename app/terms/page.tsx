import { Metadata } from "next";
import { Terms } from "@/components/Terms";

export const metadata: Metadata = {
  title: "Terms of Service | Nexora",
  description: "Read the legal terms and conditions for using the Nexora platform.",
};

export default function TermsPage() {
  return <Terms />;
}
