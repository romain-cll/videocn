import type { ReactNode } from "react";

import { CodeBlock } from "@/components/code-block";
import { Frame } from "@/components/frame";

/**
 * La typographie de la page de doc, calquée sur une page composant de
 * ui.shadcn.com : H2 de 20 px sans bordure, H3 de 16 px, texte de 14 px en
 * `muted-foreground`. L'`id` d'un titre est l'ancre que vise le sommaire :
 * `scroll-mt-20` le fait atterrir sous le header collant (56 px).
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
      <h2 id={id} className="scroll-mt-20 text-xl font-semibold tracking-tight">
        {title}
      </h2>
      {children}
    </section>
  );
}

/** Un sous-titre de section. Ancré quand le sommaire le liste. */
export function DocsSubheading({ id, children }: { id?: string; children: ReactNode }) {
  return (
    <h3 id={id} className="mt-4 scroll-mt-20 text-base font-semibold tracking-tight">
      {children}
    </h3>
  );
}

/** Un paragraphe de doc : la taille et la couleur de toute la page, en un seul endroit. */
export function DocsText({ children }: { children: ReactNode }) {
  return <p className="text-muted-foreground text-sm leading-relaxed text-pretty">{children}</p>;
}

/** Une liste à puces, dans le corps du texte. */
export function DocsList({ children }: { children: ReactNode }) {
  return (
    <ul className="text-muted-foreground flex list-disc flex-col gap-2 pl-5 text-sm leading-relaxed">
      {children}
    </ul>
  );
}

/** Du code dans le texte : un nom de prop, une valeur, un chemin. */
export function InlineCode({ children }: { children: ReactNode }) {
  return (
    <code className="bg-muted text-foreground rounded-md px-1 py-0.5 font-mono text-xs">
      {children}
    </code>
  );
}

/** Un lien dans le corps du texte. */
export function DocsLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} className="text-foreground font-medium underline underline-offset-4">
      {children}
    </a>
  );
}

/**
 * Un exemple : une phrase, l'aperçu vivant dans son cadre, puis le code qui le
 * produit. L'étiquette du cadre est le nom d'API que l'exemple illustre.
 */
export function DocsExample({
  id,
  title,
  description,
  label,
  code,
  extra,
  children,
}: {
  id: string;
  title: string;
  description: ReactNode;
  label: string;
  /** Un ou plusieurs blocs : le JSX, et le CSS quand l'exemple en demande. */
  code: readonly { code: string; title?: string }[];
  /** Ce qui suit le code : une règle, une précision. */
  extra?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4">
      <DocsSubheading id={id}>{title}</DocsSubheading>
      <DocsText>{description}</DocsText>
      <div className="flex flex-col gap-3">
        <Frame label={label} contentClassName="p-4 sm:p-6">
          {children}
        </Frame>
        {code.map((sample) => (
          <CodeBlock key={sample.code} code={sample.code} title={sample.title} />
        ))}
      </div>
      {extra}
    </div>
  );
}
