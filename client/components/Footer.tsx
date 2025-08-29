import { Link } from "react-router-dom";
import { GraduationCap, Mail, Phone, MapPin } from "lucide-react";

const footerNavigation = {
  platform: [
    { name: "For Universities", href: "/universities" },
    { name: "For Students", href: "/students" },
    { name: "For Companies", href: "/companies" },
    { name: "Admin Portal", href: "/admin" },
  ],
  features: [
    { name: "AI Matching", href: "#" },
    { name: "Resume Builder", href: "#" },
    { name: "Drive Management", href: "#" },
    { name: "Analytics", href: "#" },
  ],
  support: [
    { name: "Help Center", href: "#" },
    { name: "Documentation", href: "#" },
    { name: "Contact Us", href: "#" },
    { name: "System Status", href: "#" },
  ],
  legal: [
    { name: "Privacy Policy", href: "#" },
    { name: "Terms of Service", href: "#" },
    { name: "Cookie Policy", href: "#" },
    { name: "GDPR", href: "#" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-uninest-navy text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
            {/* Company Info */}
            <div className="lg:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-uninest-blue to-uninest-blue-dark rounded-lg flex items-center justify-center">
                  <GraduationCap className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold">UniNest</span>
              </div>
              <p className="text-gray-300 mb-6 max-w-sm">
                Revolutionizing university placement management with AI-powered matching, 
                streamlined processes, and comprehensive analytics for better outcomes.
              </p>
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm text-gray-300">
                  <Mail className="h-4 w-4" />
                  <span>contact@uninest.platform</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-300">
                  <Phone className="h-4 w-4" />
                  <span>+1 (555) 123-4567</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-300">
                  <MapPin className="h-4 w-4" />
                  <span>San Francisco, CA</span>
                </div>
              </div>
            </div>

            {/* Platform */}
            <div>
              <h3 className="text-sm font-semibold mb-4">Platform</h3>
              <ul className="space-y-2">
                {footerNavigation.platform.map((item) => (
                  <li key={item.name}>
                    <Link
                      to={item.href}
                      className="text-sm text-gray-300 hover:text-white transition-colors"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Features */}
            <div>
              <h3 className="text-sm font-semibold mb-4">Features</h3>
              <ul className="space-y-2">
                {footerNavigation.features.map((item) => (
                  <li key={item.name}>
                    <Link
                      to={item.href}
                      className="text-sm text-gray-300 hover:text-white transition-colors"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="text-sm font-semibold mb-4">Support</h3>
              <ul className="space-y-2">
                {footerNavigation.support.map((item) => (
                  <li key={item.name}>
                    <Link
                      to={item.href}
                      className="text-sm text-gray-300 hover:text-white transition-colors"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="text-sm font-semibold mb-4">Legal</h3>
              <ul className="space-y-2">
                {footerNavigation.legal.map((item) => (
                  <li key={item.name}>
                    <Link
                      to={item.href}
                      className="text-sm text-gray-300 hover:text-white transition-colors"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom section */}
        <div className="border-t border-gray-700 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-400">
              © 2024 UniNest Platform. All rights reserved.
            </p>
            <div className="flex items-center space-x-6 mt-4 md:mt-0">
              <span className="text-sm text-gray-400">Made with ❤️ for education</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
