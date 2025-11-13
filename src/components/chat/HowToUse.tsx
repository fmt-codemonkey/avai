"use client";

import { cn } from "@/lib/utils";
import { 
  Shield, 
  Github, 
  Upload, 
  MessageSquare, 
  Search, 
  FileText, 
  Zap, 
  CheckCircle,
  ArrowRight,
  Code,
  Bug,
  TrendingUp
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface HowToUseProps {
  className?: string;
}

export function HowToUse({ className }: HowToUseProps) {
  const steps = [
    {
      icon: MessageSquare,
      title: "Start a Conversation",
      description: "Simply type your security question or describe what you want to analyze",
      examples: [
        "Analyze my React app for vulnerabilities",
        "Check this smart contract for security issues",
        "Review my API endpoints for potential risks"
      ],
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: Github,
      title: "Connect Your Code",
      description: "Share your GitHub repository or upload files directly",
      examples: [
        "GitHub repository URLs",
        "Code snippets and files",
        "Smart contract addresses"
      ],
      color: "from-purple-500 to-purple-600"
    },
    {
      icon: Search,
      title: "AI Analysis",
      description: "Our AI performs comprehensive security analysis in real-time",
      examples: [
        "Vulnerability detection",
        "Code quality assessment",
        "Best practices review"
      ],
      color: "from-emerald-500 to-emerald-600"
    },
    {
      icon: FileText,
      title: "Get Detailed Reports",
      description: "Receive actionable insights and remediation recommendations",
      examples: [
        "Security vulnerability reports",
        "Fix suggestions and code examples",
        "Compliance and best practices"
      ],
      color: "from-orange-500 to-orange-600"
    }
  ];

  const features = [
    { icon: Shield, text: "Advanced Threat Detection", badge: "AI-Powered" },
    { icon: Code, text: "Multi-Language Support", badge: "50+ Languages" },
    { icon: Bug, text: "Real-time Analysis", badge: "Live Results" },
    { icon: TrendingUp, text: "Continuous Monitoring", badge: "24/7" },
  ];

  return (
    <div className={cn("w-full space-y-8 py-8", className)}>
      {/* Section Title */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-foreground">How to Use AVAI Platform</h2>
        <p className="text-muted-foreground">
          Get started with AI-powered security auditing in 4 simple steps
        </p>
      </div>

      {/* Steps */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {steps.map((step, index) => {
          const IconComponent = step.icon;
          return (
            <div
              key={index}
              className="relative group"
            >
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-border to-transparent z-0" />
              )}
              
              <div className="relative bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:border-primary/30 z-10">
                {/* Step Number */}
                <div className="absolute -top-2 -right-2">
                  <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">
                    {index + 1}
                  </div>
                </div>

                {/* Icon */}
                <div className={`w-12 h-12 bg-gradient-to-br ${step.color} rounded-lg flex items-center justify-center mb-4 shadow-lg`}>
                  <IconComponent className="w-6 h-6 text-white" />
                </div>

                {/* Content */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-foreground">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                  
                  {/* Examples */}
                  <div className="space-y-1">
                    {step.examples.map((example, exampleIndex) => (
                      <div key={exampleIndex} className="flex items-center gap-2 text-xs text-muted-foreground">
                        <div className="w-1 h-1 bg-primary rounded-full" />
                        <span>{example}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Arrow for next step */}
                {index < steps.length - 1 && (
                  <div className="lg:hidden flex justify-center mt-4">
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Features Grid */}
      <div className="space-y-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-foreground mb-2">Platform Features</h3>
          <p className="text-sm text-muted-foreground">
            Everything you need for comprehensive security analysis
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div
                key={index}
                className="flex flex-col items-center gap-2 p-4 bg-card/50 border border-border rounded-lg hover:bg-card transition-colors"
              >
                <IconComponent className="w-5 h-5 text-primary" />
                <div className="text-center">
                  <div className="text-sm font-medium text-foreground">{feature.text}</div>
                  <Badge variant="secondary" className="text-xs mt-1">
                    {feature.badge}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Start Tips */}
      <div className="bg-gradient-to-r from-primary/10 via-purple/10 to-blue/10 border border-primary/20 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <Zap className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
          <div className="space-y-2">
            <h4 className="font-semibold text-foreground">Quick Start Tips</h4>
            <div className="grid gap-2 text-sm text-muted-foreground">
              <p>• Be specific about your technology stack (React, Python, Solidity, etc.)</p>
              <p>• Include relevant context like frameworks, libraries, or deployment environment</p>
              <p>• Ask follow-up questions to dive deeper into specific vulnerabilities</p>
              <p>• Use the reports panel to review detailed findings and recommendations</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}