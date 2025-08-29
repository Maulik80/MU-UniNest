import { PlaceholderPage } from "@/components/PlaceholderPage";

export default function Universities() {
  const features = [
    "Student onboarding & management",
    "Department & class hierarchy",
    "Company & drive management", 
    "Resume rules & verification",
    "AI-powered analytics & insights"
  ];

  return (
    <PlaceholderPage
      title="University Portal"
      description="The central hub for universities to manage placement activities, student onboarding, company relationships, and drive coordination."
      moduleName="University"
      features={features}
    />
  );
}
