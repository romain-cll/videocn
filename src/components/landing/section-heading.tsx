/** Le titre et le sous-titre communs à toutes les sections de la landing. */
export function SectionHeading({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex max-w-2xl flex-col gap-3">
      <h2 className="text-3xl font-semibold tracking-tight text-balance">{title}</h2>
      <p className="text-muted-foreground text-pretty">{description}</p>
    </div>
  );
}
