import { CheckIcon } from "lucide-react";

import { SectionHeading } from "@/components/landing/section-heading";
import { roadmap } from "@/lib/roadmap";
import { cn } from "@/lib/utils";

// `scroll-mt-20` : le header collant fait 56px, l'ancre `/#roadmap` ne doit
// pas glisser le titre dessous.
export function Roadmap() {
  return (
    <section id="roadmap" className="flex w-full scroll-mt-20 flex-col gap-10 py-16 md:py-24">
      <SectionHeading
        title="Roadmap"
        description="The player stays free and only reads standard web formats. Here is what ships next."
      />
      <div className="grid gap-8 md:grid-cols-3">
        {roadmap.map((column) => {
          const shipped = column.id === "shipped";
          return (
            <div key={column.id} className="flex flex-col gap-4">
              <h3 className="flex items-center gap-2 text-sm font-medium">
                {column.label}
                <span className="text-muted-foreground tabular-nums">{column.items.length}</span>
              </h3>
              <ul className="flex flex-col gap-4">
                {column.items.map((item) => (
                  <li key={item.title} className="flex gap-3">
                    {/* Livré : une coche. À venir : un simple anneau, plus discret. */}
                    <span
                      className={cn(
                        "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full",
                        shipped ? "bg-primary text-primary-foreground" : "border border-dashed",
                      )}
                      aria-hidden
                    >
                      {shipped && <CheckIcon className="size-3" />}
                    </span>
                    <div className="flex flex-col gap-1">
                      <span className={cn("text-sm font-medium", !shipped && "text-muted-foreground")}>
                        {item.title}
                      </span>
                      <span className="text-muted-foreground text-sm text-pretty">{item.description}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </section>
  );
}
