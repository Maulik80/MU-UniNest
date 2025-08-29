import { PlaceholderPage } from "@/components/PlaceholderPage";

export default function Admin() {
  const features = [
    "University & company management",
    "Global student oversight",
    "Platform analytics & insights",
    "AI placement forecasting",
    "Fraud detection & security"
  ];

  return (
    <PlaceholderPage
      title="Admin Portal"
      description="Centralized control and oversight across all universities, companies, and students with advanced analytics and AI-powered insights."
      moduleName="Admin"
      features={features}
    />
  );
}
