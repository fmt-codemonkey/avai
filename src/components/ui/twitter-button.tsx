import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface TwitterButtonProps {
  className?: string;
  variant?: "outline" | "ghost" | "default";
  size?: "sm" | "lg";
  showText?: boolean;
  showIcon?: boolean;
}

export function TwitterButton({ 
  className, 
  variant = "outline",
  size = "sm",
  showText = true,
  showIcon = true
}: TwitterButtonProps) {
  const handleTwitterClick = () => {
    window.open('https://x.com/avai_canister', '_blank', 'noopener,noreferrer');
  };

  return (
    <Button
      onClick={handleTwitterClick}
      variant={variant}
      size={size}
      className={cn(
        "gap-2 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 transition-colors",
        className
      )}
      aria-label="Visit AVAI on Twitter"
    >
      {showIcon && (
        <svg
          viewBox="0 0 24 24"
          className="w-4 h-4 fill-current"
          aria-hidden="true"
        >
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      )}
      {showText && "Follow"}
      {showText && showIcon && <ExternalLink className="w-3 h-3" />}
    </Button>
  );
}