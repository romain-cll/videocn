"use client";

import { CheckIcon, CopyIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useCopy } from "@/hooks/use-copy";

/** Le bouton copier des blocs de code : seule partie cliente du bloc. */
export function CopyButton({ text, className }: { text: string; className?: string }) {
  const { copied, copy } = useCopy();

  return (
    <Button variant="ghost" size="icon-sm" className={className} onClick={() => copy(text)}>
      {copied ? <CheckIcon /> : <CopyIcon />}
      <span className="sr-only">{copied ? "Copied" : "Copy"}</span>
    </Button>
  );
}
