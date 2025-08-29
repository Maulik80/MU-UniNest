import { PlaceholderPage } from "@/components/PlaceholderPage";

export default function Students() {
  const features = [
    "Digital profile & resume management",
    "AI resume-JD matching",
    "Placement drive participation",
    "Offer management & negotiations",
    "Profile verification system"
  ];

  return (
    <PlaceholderPage
      title="Student Portal"
      description="Empower students to manage their digital identity, build standout resumes, and navigate their placement journey with AI-powered insights."
      moduleName="Student"
      features={features}
    />
  );
}
