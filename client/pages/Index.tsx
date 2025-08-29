import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  GraduationCap,
  Building,
  Users,
  Settings,
  ArrowRight,
  CheckCircle,
  TrendingUp,
  Brain,
  Shield,
  Zap,
  BarChart3,
  FileText,
  UserCheck,
  Briefcase,
  Star,
  Target
} from "lucide-react";

const modules = [
  {
    title: "University Module",
    description: "Complete control over placement activities with advanced student management",
    icon: GraduationCap,
    href: "/universities",
    color: "bg-blue-500",
    features: [
      "Bulk student onboarding via Excel/CSV",
      "Email & phone OTP verification",
      "Department hierarchy management",
      "AI-powered student filtering",
      "Resume rules & verification"
    ]
  },
  {
    title: "Student Module", 
    description: "Empower students with AI-driven profile management and placement tools",
    icon: Users,
    href: "/students",
    color: "bg-green-500",
    features: [
      "Digital profile & resume builder",
      "ATS resume-JD matching",
      "AI improvement suggestions",
      "Offer management & negotiations",
      "Transparent verification process"
    ]
  },
  {
    title: "Company Module",
    description: "Streamlined recruitment with intelligent candidate screening",
    icon: Building,
    href: "/companies",
    color: "bg-purple-500", 
    features: [
      "Smart drive management",
      "AI-powered candidate screening",
      "Bulk resume downloads",
      "Automated offer workflows",
      "University partnership tools"
    ]
  },
  {
    title: "Admin Module",
    description: "Centralized oversight with advanced analytics and fraud detection",
    icon: Settings,
    href: "/admin",
    color: "bg-orange-500",
    features: [
      "Global university management",
      "Cross-platform analytics",
      "AI placement forecasting", 
      "Fraud detection system",
      "Subscription management"
    ]
  }
];

const stats = [
  { label: "Universities", value: "500+", icon: GraduationCap },
  { label: "Students Placed", value: "50K+", icon: Users },
  { label: "Partner Companies", value: "2K+", icon: Building },
  { label: "Success Rate", value: "94%", icon: TrendingUp }
];

const features = [
  {
    title: "AI-Powered Matching",
    description: "Advanced algorithms match students to opportunities based on skills, CGPA, and career goals.",
    icon: Brain
  },
  {
    title: "Comprehensive Analytics",
    description: "Real-time insights into placement trends, participation rates, and success metrics.",
    icon: BarChart3
  },
  {
    title: "Automated Workflows", 
    description: "Streamlined processes from student onboarding to offer management.",
    icon: Zap
  },
  {
    title: "Secure & Compliant",
    description: "Enterprise-grade security with GDPR compliance and fraud detection.",
    icon: Shield
  },
  {
    title: "Resume Intelligence",
    description: "ATS-compatible resume building with AI-driven improvement suggestions.",
    icon: FileText
  },
  {
    title: "Verification System",
    description: "Multi-level verification ensures data integrity and authenticity.",
    icon: UserCheck
  }
];

export default function Index() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center">
            <Badge variant="outline" className="mb-4 text-uninest-blue border-uninest-blue">
              <Star className="h-3 w-3 mr-1" />
              AI-Powered Placement Platform
            </Badge>
            
            <h1 className="text-4xl md:text-6xl font-bold text-uninest-navy mb-6">
              Transform University
              <span className="block text-uninest-blue">Placement Management</span>
            </h1>
            
            <p className="text-xl text-uninest-gray mb-8 max-w-3xl mx-auto leading-relaxed">
              UniNest revolutionizes how universities, students, and companies connect through 
              AI-driven matching, automated workflows, and comprehensive analytics for better placement outcomes.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Button size="lg" className="w-full sm:w-auto text-lg px-8 py-3">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button variant="outline" size="lg" className="w-full sm:w-auto text-lg px-8 py-3">
                Watch Demo
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="flex justify-center mb-2">
                    <stat.icon className="h-8 w-8 text-uninest-blue" />
                  </div>
                  <div className="text-3xl font-bold text-uninest-navy">{stat.value}</div>
                  <div className="text-sm text-uninest-gray">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Modules Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-uninest-navy mb-4">
              Comprehensive Module System
            </h2>
            <p className="text-xl text-uninest-gray max-w-2xl mx-auto">
              Four specialized modules designed to serve every stakeholder in the placement ecosystem.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {modules.map((module) => (
              <Card key={module.title} className="group hover:shadow-lg transition-all duration-300 border-0 shadow-sm">
                <CardHeader className="pb-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className={`w-12 h-12 ${module.color} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <module.icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl text-uninest-navy">{module.title}</CardTitle>
                    </div>
                  </div>
                  <CardDescription className="text-uninest-gray text-base">
                    {module.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 mb-6">
                    {module.features.map((feature) => (
                      <li key={feature} className="flex items-center text-sm text-uninest-gray">
                        <CheckCircle className="h-4 w-4 text-uninest-blue mr-2 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Link to={module.href}>
                    <Button variant="outline" className="w-full group-hover:bg-uninest-blue group-hover:text-white transition-colors">
                      Explore Module
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-uninest-navy mb-4">
              Powered by Advanced AI
            </h2>
            <p className="text-xl text-uninest-gray max-w-2xl mx-auto">
              Cutting-edge technology meets placement management for unprecedented efficiency and success rates.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => (
              <Card key={feature.title} className="text-center border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="pt-8 pb-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-uninest-blue to-uninest-blue-dark rounded-full flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-uninest-navy mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-uninest-gray">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-uninest-blue to-uninest-blue-dark">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Transform Your Placement Process?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join leading universities already using UniNest to achieve higher placement rates 
            and better outcomes for their students.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-3">
              <Target className="mr-2 h-5 w-5" />
              Schedule Demo
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-3 text-white border-white hover:bg-white hover:text-uninest-blue">
              <Briefcase className="mr-2 h-5 w-5" />
              Contact Sales
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
