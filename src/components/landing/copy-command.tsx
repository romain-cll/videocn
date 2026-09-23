"use client";

import { CheckIcon, CopyIcon } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

/** Une commande sur une ligne, avec son bouton pour la copier. */
export function CopyCommand({ command }: { command: string }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timeout = setTimeout(() => setCopied(false), 1500);
    return () => clearTimeout(timeout);
  }, [copied]);

  return (
    <div className="bg-muted/50 flex h-11 w-fit max-w-full items-center gap-3 rounded-lg border pr-1.5 pl-4">
      <code className="truncate font-mono text-sm">
        <span className="text-muted-foreground select-none">$ </span>
        {command}
      </code>
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => {
          void navigator.clipboard.writeText(command).then(() => setCopied(true));
        }}
      >
        {copied ? <CheckIcon /> : <CopyIcon />}
        <span className="sr-only">{copied ? "Command copied" : "Copy command"}</span>
      </Button>
    </div>
  );
}
