import { cn } from "@/lib/utils";

/**
 * Le cadre de toutes les démonstrations du site, à la manière des pages
 * `/charts` et `/blocks` de shadcn : l'étiquette et les actions posées
 * au-dessus du cadre, jamais dedans.
 *
 * `label` est un vrai nom d'API — `chapters`, `controls`, `--radius` — et se
 * lit en monospace : c'est le fil qui relie chaque démonstration au code qui
 * la produit.
 */
export function Frame({
  label,
  actions,
  children,
  className,
  contentClassName,
}: {
  label?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
}) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-2", className)}>
      {(label || actions) && (
        <div className="flex min-h-8 items-center justify-between gap-3">
          {label && <div className="text-muted-foreground font-mono text-xs">{label}</div>}
          {actions && <div className="ml-auto flex items-center gap-1">{actions}</div>}
        </div>
      )}
      <div className={cn("bg-background min-w-0 overflow-hidden rounded-2xl border", contentClassName)}>
        {children}
      </div>
    </div>
  );
}
