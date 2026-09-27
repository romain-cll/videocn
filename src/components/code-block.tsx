import { CopyButton } from "@/components/copy-button";
import { cn } from "@/lib/utils";

/**
 * Un bloc de code copiable tel quel. Le code arrive en chaîne et non en
 * `children` : c'est la même chaîne qui s'affiche et qui part au presse-papiers,
 * donc ce qu'on copie est exactement ce qu'on lit.
 *
 * `title` nomme le bloc au-dessus du code — un nom de fichier, un langage.
 */
export function CodeBlock({
  code,
  title,
  className,
}: {
  code: string;
  title?: string;
  className?: string;
}) {
  return (
    <div className={cn("bg-muted min-w-0 overflow-hidden rounded-lg border", className)}>
      {title && (
        <div className="text-muted-foreground border-b px-4 py-2 font-mono text-xs">{title}</div>
      )}
      <div className="relative">
        <pre className="text-muted-foreground overflow-x-auto px-4 py-3 pr-12 font-mono text-sm">
          <code>{code}</code>
        </pre>
        <CopyButton text={code} className="absolute top-1.5 right-1.5" />
      </div>
    </div>
  );
}
