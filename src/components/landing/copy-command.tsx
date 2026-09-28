"use client";

import { CheckIcon, CopyIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useCopy } from "@/hooks/use-copy";
import { trackEvent, type AnalyticsEvent } from "@/lib/analytics";

/** Une commande sur une ligne, avec son bouton pour la copier. */
export function CopyCommand({ command, event }: { command: string; event?: AnalyticsEvent }) {
  const { copied, copy } = useCopy();

  return (
    <div className="bg-muted/50 flex h-11 w-fit max-w-full items-center gap-3 rounded-lg border pr-1.5 pl-4">
      <code className="truncate font-mono text-sm">
        <span className="text-muted-foreground select-none">$ </span>
        {command}
      </code>
      <Button variant="ghost" size="icon-sm" onClick={() => {
          copy(command);
          if (event) trackEvent(event);
        }}>
        {copied ? <CheckIcon /> : <CopyIcon />}
        <span className="sr-only">{copied ? "Command copied" : "Copy command"}</span>
      </Button>
    </div>
  );
}
