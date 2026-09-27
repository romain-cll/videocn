/**
 * Le sommaire « On This Page » : de simples liens d'ancre, sans suivi de la
 * section courante, donc aucun JavaScript. Un niveau d'imbrication, pour les
 * exemples et les tableaux de référence.
 */
export interface DocsTocItem {
  id: string;
  title: string;
  items?: readonly DocsTocItem[];
}

function TocLink({ item }: { item: DocsTocItem }) {
  return (
    <a
      href={`#${item.id}`}
      className="text-muted-foreground hover:text-foreground block py-1 transition-colors"
    >
      {item.title}
    </a>
  );
}

export function DocsToc({ items }: { items: readonly DocsTocItem[] }) {
  return (
    <nav aria-label="On this page" className="flex flex-col gap-2 text-xs">
      <p className="font-medium">On This Page</p>
      <ul className="flex flex-col">
        {items.map((item) => (
          <li key={item.id}>
            <TocLink item={item} />
            {item.items && (
              <ul className="flex flex-col pl-3">
                {item.items.map((child) => (
                  <li key={child.id}>
                    <TocLink item={child} />
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}
