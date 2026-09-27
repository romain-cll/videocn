import type { ReactNode } from "react";

/**
 * Une section de la page de documentation. L'`id` du titre est l'ancre que
 * vise le sommaire : `scroll-mt-20` le fait atterrir sous le header collant
 * (56 px) au lieu de s'y cacher.
 */
export function DocsSection({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4">
      <h2 id={id} className="scroll-mt-20 text-2xl font-semibold tracking-tight">
        {title}
      </h2>
      {children}
    </section>
  );
}

/** Un sous-titre de section, pour découper sans ancrer. */
export function DocsSubheading({ children }: { children: ReactNode }) {
  return <h3 className="mt-4 text-lg font-medium tracking-tight">{children}</h3>;
}

/** Un paragraphe de doc : la taille et la couleur de toute la page, en un seul endroit. */
export function DocsText({ children }: { children: ReactNode }) {
  return <p className="text-muted-foreground leading-7 text-pretty">{children}</p>;
}

/** Du code dans le texte : un nom de prop, une valeur, un chemin. */
export function InlineCode({ children }: { children: ReactNode }) {
  return (
    <code className="bg-muted text-foreground rounded-sm px-1 py-0.5 font-mono text-sm">
      {children}
    </code>
  );
}
