"use client";

import { useCallback, useEffect, useState } from "react";

/** Copie un texte et garde `copied` vrai un court instant, le temps d'afficher la coche. */
export function useCopy(duration = 1500) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timeout = setTimeout(() => setCopied(false), duration);
    return () => clearTimeout(timeout);
  }, [copied, duration]);

  const copy = useCallback((text: string) => {
    void navigator.clipboard.writeText(text).then(() => setCopied(true));
  }, []);

  return { copied, copy };
}
