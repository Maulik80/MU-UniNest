import { PlaceholderPage } from "@/components/PlaceholderPage";

export default function Companies() {
  const features = [
    "Company profile management",
    "Placement drive creation",
    "AI-powered student screening",
    "Offer workflow management",
    "University partnership tools"
  ];

  return (
    <PlaceholderPage
      title="Company Portal"
      description="Connect with top universities and discover exceptional talent through streamlined placement drives and AI-enhanced candidate screening."
      moduleName="Company"
      features={features}
    />
  );
}
