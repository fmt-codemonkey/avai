"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { 
  Copy,
  Check,
  Download,
  Maximize2,
  Minimize2,
  FileCode,
  AlertTriangle,
  CheckCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface CodeBlockProps {
  code: string;
  language?: string;
  filename?: string;
  startLine?: number;
  highlightLines?: number[];
  vulnerabilityLines?: number[];
  fixedLines?: number[];
  showLineNumbers?: boolean;
  showCopyButton?: boolean;
  showDownloadButton?: boolean;
  showFullscreenButton?: boolean;
  maxHeight?: string;
  className?: string;
}

interface LineAnnotation {
  type: "vulnerability" | "fixed" | "normal";
  message?: string;
}

export function CodeBlock({
  code,
  language = "javascript",
  filename,
  startLine = 1,
  highlightLines = [],
  vulnerabilityLines = [],
  fixedLines = [],
  showLineNumbers = true,
  showCopyButton = true,
  showDownloadButton = false,
  showFullscreenButton = false,
  maxHeight = "400px",
  className,
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const lines = code.split('\n');

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy code:", err);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || `code.${language}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getLineAnnotation = (lineIndex: number): LineAnnotation => {
    const lineNumber = lineIndex + startLine;
    
    if (vulnerabilityLines.includes(lineNumber)) {
      return { type: "vulnerability", message: "Potential security vulnerability" };
    }
    if (fixedLines.includes(lineNumber)) {
      return { type: "fixed", message: "Fixed in latest version" };
    }
    return { type: "normal" };
  };

  const getLineClasses = (lineIndex: number) => {
    const lineNumber = lineIndex + startLine;
    const annotation = getLineAnnotation(lineIndex);
    
    let classes = "flex items-start gap-3 px-4 py-1 hover:bg-muted/50 transition-colors";
    
    if (highlightLines.includes(lineNumber)) {
      classes += " bg-primary/10 border-l-2 border-primary";
    }
    
    if (annotation.type === "vulnerability") {
      classes += " bg-critical/10 border-l-2 border-critical";
    }
    
    if (annotation.type === "fixed") {
      classes += " bg-secure/10 border-l-2 border-secure";
    }
    
    return classes;
  };

  const getLineIcon = (annotation: LineAnnotation) => {
    switch (annotation.type) {
      case "vulnerability":
        return <AlertTriangle className="h-4 w-4 text-critical mt-0.5" />;
      case "fixed":
        return <CheckCircle className="h-4 w-4 text-secure mt-0.5" />;
      default:
        return null;
    }
  };

  return (
    <div 
      className={cn(
        "w-full border border-border rounded-lg overflow-hidden bg-card",
        isFullscreen && "fixed inset-4 z-50 shadow-2xl",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-muted/50 border-b border-border">
        <div className="flex items-center gap-3">
          <FileCode className="h-4 w-4 text-muted-foreground" />
          {filename && (
            <span className="font-mono text-sm font-medium">{filename}</span>
          )}
          <Badge variant="outline" className="text-xs">
            {language}
          </Badge>
          {(vulnerabilityLines.length > 0 || fixedLines.length > 0) && (
            <div className="flex items-center gap-1">
              {vulnerabilityLines.length > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {vulnerabilityLines.length} issue{vulnerabilityLines.length !== 1 ? 's' : ''}
                </Badge>
              )}
              {fixedLines.length > 0 && (
                <Badge className="bg-secure text-secure-foreground text-xs">
                  {fixedLines.length} fixed
                </Badge>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1">
          {showCopyButton && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="gap-2"
            >
              {copied ? (
                <>
                  <Check className="h-3 w-3" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3" />
                  Copy
                </>
              )}
            </Button>
          )}
          
          {showDownloadButton && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDownload}
              className="gap-2"
            >
              <Download className="h-3 w-3" />
              Download
            </Button>
          )}

          {showFullscreenButton && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsFullscreen(!isFullscreen)}
            >
              {isFullscreen ? (
                <Minimize2 className="h-3 w-3" />
              ) : (
                <Maximize2 className="h-3 w-3" />
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Code Content */}
      <div 
        className="overflow-auto font-mono text-sm"
        style={{ maxHeight: isFullscreen ? 'calc(100vh - 200px)' : maxHeight }}
      >
        {lines.map((line, index) => {
          const lineNumber = index + startLine;
          const annotation = getLineAnnotation(index);
          const lineIcon = getLineIcon(annotation);
          
          return (
            <div
              key={index}
              className={getLineClasses(index)}
              title={annotation.message}
            >
              {/* Line number */}
              {showLineNumbers && (
                <span className="select-none text-muted-foreground text-right w-8 shrink-0 leading-5">
                  {lineNumber}
                </span>
              )}
              
              {/* Line icon */}
              <div className="w-4 shrink-0 flex justify-center">
                {lineIcon}
              </div>
              
              {/* Code content */}
              <pre className="flex-1 leading-5 overflow-x-auto">
                <code className="text-foreground">{line}</code>
              </pre>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Diff CodeBlock for showing before/after changes
interface DiffCodeBlockProps {
  beforeCode: string;
  afterCode: string;
  language?: string;
  filename?: string;
  className?: string;
}

export function DiffCodeBlock({
  beforeCode,
  afterCode,
  language = "javascript",
  filename,
  className,
}: DiffCodeBlockProps) {
  const [view, setView] = useState<"split" | "unified">("split");

  return (
    <div className={cn("w-full space-y-4", className)}>
      {/* View Toggle */}
      <div className="flex items-center gap-2">
        <Button
          variant={view === "split" ? "default" : "outline"}
          size="sm"
          onClick={() => setView("split")}
        >
          Split View
        </Button>
        <Button
          variant={view === "unified" ? "default" : "outline"}
          size="sm"
          onClick={() => setView("unified")}
        >
          Unified View
        </Button>
      </div>

      {view === "split" ? (
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm font-medium mb-2 text-critical flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Before (Vulnerable)
            </h4>
            <CodeBlock
              code={beforeCode}
              language={language}
              filename={filename}
              showDownloadButton={false}
              showFullscreenButton={false}
            />
          </div>
          
          <div>
            <h4 className="text-sm font-medium mb-2 text-secure flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              After (Fixed)
            </h4>
            <CodeBlock
              code={afterCode}
              language={language}
              filename={filename}
              showDownloadButton={false}
              showFullscreenButton={false}
            />
          </div>
        </div>
      ) : (
        <CodeBlock
          code={`${beforeCode}\n---\n${afterCode}`}
          language={language}
          filename={filename}
        />
      )}
    </div>
  );
}

// Syntax highlighting would typically be done with a library like Prism or highlight.js
// This is a simplified version for the component structure
