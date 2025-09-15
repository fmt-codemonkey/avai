"use client";

import { Shield, Github, Twitter, Mail, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface FooterLink {
  title: string;
  href: string;
  external?: boolean;
}

const companyLinks: FooterLink[] = [
  { title: "About", href: "/about" },
  { title: "Blog", href: "/blog" },
  { title: "Careers", href: "/careers" },
  { title: "Contact", href: "/contact" },
];

const productLinks: FooterLink[] = [
  { title: "Features", href: "/features" },
  { title: "Pricing", href: "/pricing" },
  { title: "Documentation", href: "/docs" },
  { title: "API", href: "/api-docs" },
];

const legalLinks: FooterLink[] = [
  { title: "Privacy Policy", href: "/privacy" },
  { title: "Terms of Service", href: "/terms" },
  { title: "Security", href: "/security" },
  { title: "Compliance", href: "/compliance" },
];

const socialLinks = [
  { icon: Github, href: "https://github.com/avai", label: "GitHub" },
  { icon: Twitter, href: "https://twitter.com/avai", label: "Twitter" },
  { icon: Mail, href: "mailto:contact@avai.dev", label: "Email" },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-card/50">
      <div className="container mx-auto px-4 py-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="h-6 w-6 text-primary glow-cyber" />
              <span className="text-xl font-bold text-gradient-cyber">AVAI</span>
            </div>
            <p className="text-sm text-muted-foreground mb-4 max-w-md">
              Next-generation AI-powered security auditing platform for comprehensive 
              code analysis, vulnerability detection, and security recommendations.
            </p>
            <div className="flex items-center gap-2">
              {socialLinks.map((social) => (
                <Button
                  key={social.label}
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 hover:text-primary"
                  asChild
                >
                  <a 
                    href={social.href} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    aria-label={social.label}
                  >
                    <social.icon className="h-4 w-4" />
                  </a>
                </Button>
              ))}
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="font-semibold text-sm mb-3">Product</h3>
            <ul className="space-y-2">
              {productLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
                  >
                    {link.title}
                    {link.external && <ExternalLink className="h-3 w-3" />}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="font-semibold text-sm mb-3">Company</h3>
            <ul className="space-y-2">
              {companyLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
                  >
                    {link.title}
                    {link.external && <ExternalLink className="h-3 w-3" />}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="font-semibold text-sm mb-3">Legal</h3>
            <ul className="space-y-2">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
                  >
                    {link.title}
                    {link.external && <ExternalLink className="h-3 w-3" />}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Separator className="my-6" />

        {/* Bottom Section */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <p>© 2025 AVAI. All rights reserved.</p>
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-2 h-2 bg-secure rounded-full animate-pulse-cyber"></div>
              <span>System Status: Operational</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>SOC 2 Type II Certified</span>
            <span>•</span>
            <span>GDPR Compliant</span>
            <span>•</span>
            <span>ISO 27001</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
