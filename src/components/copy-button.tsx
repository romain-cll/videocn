"use client";

import { CheckIcon, CopyIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useCopy } from "@/hooks/use-copy";
import { trackEvent, type AnalyticsEvent } from "@/lib/analytics";

/**
 * Le bouton copier des blocs de code : seule partie cliente du bloc. `event`
 * part à Plausible à chaque copie, pour les blocs qu'on veut mesurer.
 */
export function CopyButton({
  text,
  event,
  className,
}: {
  text: string;
  event?: AnalyticsEvent;
  className?: string;
}) {
  const { copied, copy } = useCopy();

  return (
    <Button variant="ghost" size="icon-sm" className={className} onClick={() => {
        copy(text);
        if (event) trackEvent(event);
      }}>
      {copied ? <CheckIcon /> : <CopyIcon />}
      <span className="sr-only">{copied ? "Copied" : "Copy"}</span>
    </Button>
  );
}
