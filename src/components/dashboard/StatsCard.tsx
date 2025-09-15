"use client";

import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: "increase" | "decrease" | "neutral";
    period?: string;
  };
  icon?: React.ReactNode;
  description?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function StatsCard({
  title,
  value,
  change,
  icon,
  description,
  className,
  size = "md"
}: StatsCardProps) {
  const getChangeIcon = () => {
    switch (change?.type) {
      case "increase":
        return <TrendingUp className="w-3 h-3" />;
      case "decrease":
        return <TrendingDown className="w-3 h-3" />;
      default:
        return <Minus className="w-3 h-3" />;
    }
  };

  const getChangeColor = () => {
    switch (change?.type) {
      case "increase":
        return "text-secure";
      case "decrease":
        return "text-critical";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <Card className={cn(
      "hover:shadow-md transition-shadow duration-200",
      size === "lg" && "col-span-2",
      className
    )}>
      <CardHeader className={cn(
        "flex flex-row items-center justify-between space-y-0",
        size === "sm" ? "pb-2" : "pb-3"
      )}>
        <CardTitle className={cn(
          "font-medium text-muted-foreground",
          size === "sm" ? "text-sm" : "text-base"
        )}>
          {title}
        </CardTitle>
        {icon && (
          <div className="text-muted-foreground">
            {icon}
          </div>
        )}
      </CardHeader>
      <CardContent className={cn(size === "sm" ? "pt-0" : "pt-2")}>
        <div className="space-y-2">
          <div className={cn(
            "font-bold text-foreground",
            size === "sm" ? "text-xl" : size === "lg" ? "text-4xl" : "text-2xl"
          )}>
            {value}
          </div>
          
          {change && (
            <div className="flex items-center gap-2">
              <Badge 
                variant="secondary"
                className={cn(
                  "flex items-center gap-1 text-xs",
                  getChangeColor()
                )}
              >
                {getChangeIcon()}
                {change.value > 0 && "+"}
                {change.value}%
              </Badge>
              {change.period && (
                <span className="text-xs text-muted-foreground">
                  vs {change.period}
                </span>
              )}
            </div>
          )}
          
          {description && (
            <p className="text-xs text-muted-foreground leading-relaxed">
              {description}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
