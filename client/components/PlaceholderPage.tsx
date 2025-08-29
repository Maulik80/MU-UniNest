import { Button } from "./ui/button";
import { ArrowRight, Construction } from "lucide-react";

interface PlaceholderPageProps {
  title: string;
  description: string;
  moduleName: string;
  features?: string[];
}

export function PlaceholderPage({ 
  title, 
  description, 
  moduleName, 
  features = [] 
}: PlaceholderPageProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <div className="w-16 h-16 bg-uninest-blue rounded-full flex items-center justify-center mx-auto mb-6">
            <Construction className="h-8 w-8 text-white" />
          </div>
          
          <h1 className="text-4xl font-bold text-uninest-navy mb-4">
            {title}
          </h1>
          
          <p className="text-xl text-uninest-gray mb-8 max-w-2xl mx-auto">
            {description}
          </p>

          <div className="bg-white rounded-xl shadow-sm border border-border p-8 mb-8">
            <h2 className="text-2xl font-semibold text-uninest-navy mb-4">
              Coming Soon: {moduleName} Module
            </h2>
            
            {features.length > 0 && (
              <div className="text-left max-w-md mx-auto">
                <h3 className="font-medium text-uninest-navy mb-3">Key Features:</h3>
                <ul className="space-y-2">
                  {features.map((feature, index) => (
                    <li key={index} className="flex items-center text-uninest-gray">
                      <ArrowRight className="h-4 w-4 text-uninest-blue mr-2" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
            <Button size="lg" className="w-full sm:w-auto">
              Continue Building This Module
            </Button>
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              Back to Dashboard
            </Button>
          </div>

          <p className="text-sm text-uninest-gray mt-8">
            This page is a placeholder. Continue prompting to build out the specific 
            functionality for the {moduleName} module.
          </p>
        </div>
      </div>
    </div>
  );
}
