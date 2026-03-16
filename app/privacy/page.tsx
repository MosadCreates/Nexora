import { Metadata } from "next";
import Privacy from "@/components/Privacy";

export const metadata: Metadata = {
  title: "Privacy Policy | Nexora",
  description: "Learn how Nexora handles your data with privacy by design.",
};

export default function PrivacyPage() {
  return <Privacy />;
}
