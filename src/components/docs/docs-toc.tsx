/**
 * Le sommaire de la page. De simples liens d'ancre : pas de suivi de la
 * section courante, donc aucun JavaScript — la page reste un composant
 * serveur de bout en bout.
 */
export interface DocsTocItem {
  id: string;
  title: string;
}

export function DocsToc({ items }: { items: readonly DocsTocItem[] }) {
  return (
    <nav aria-label="On this page" className="flex flex-col gap-3">
      <p className="text-sm font-medium">On this page</p>
      <ul className="flex flex-col gap-2 text-sm">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {item.title}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
