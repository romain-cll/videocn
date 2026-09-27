import { cn } from "@/lib/utils";

/**
 * Une section de la landing. Toutes partagent le même gabarit : une rangée
 * entre deux filets, dans le cadre à rails posé par la page, avec un en-tête
 * sobre — l'étiquette monospace (un nom d'API), un titre de 24 px, une phrase.
 *
 * Pas de titres géants ni d'icônes : c'est la démonstration qui porte la
 * section, le texte ne fait que la nommer.
 */
export function LandingSection({
  id,
  label,
  title,
  description,
  children,
  className,
}: {
  id?: string;
  label: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={cn("scroll-mt-16 border-t px-6 py-16 md:px-10 md:py-20", className)}>
      <header className="flex max-w-xl flex-col gap-2">
        <span className="text-muted-foreground font-mono text-xs">{label}</span>
        <h2 className="text-2xl font-semibold tracking-tight text-balance">{title}</h2>
        {description && <p className="text-muted-foreground text-pretty">{description}</p>}
      </header>
      <div className="mt-10">{children}</div>
    </section>
  );
}
