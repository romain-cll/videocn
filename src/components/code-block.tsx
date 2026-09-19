import { cn } from "@/lib/utils";

export function CodeBlock({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <pre
      className={cn(
        "bg-muted text-muted-foreground overflow-x-auto rounded-lg border px-4 py-3 font-mono text-sm",
        className,
      )}
    >
      <code>{children}</code>
    </pre>
  );
}
