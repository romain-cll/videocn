import { LandingSection } from "@/components/landing/landing-section";
import { changelog, upcoming } from "@/lib/changelog";

/** « Sep 24 » : l'année n'apporte rien tant que tout tient dans la même. */
const DATE_FORMAT = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});

export function ChangelogSection() {
  return (
    <LandingSection
      id="changelog"
      label="changelog"
      title="What shipped, and what is next."
      description="Each release is a set of new props. The player stays free, and complete on its own."
    >
      <div className="grid gap-12 lg:grid-cols-5">
        <ol className="flex flex-col lg:col-span-3">
          {changelog.map((entry) => (
            <li
              key={entry.title}
              className="grid gap-1 border-t py-5 first:border-t-0 first:pt-0 sm:grid-cols-4 sm:gap-6"
            >
              <time dateTime={entry.date} className="text-muted-foreground font-mono text-xs sm:pt-1">
                {DATE_FORMAT.format(new Date(entry.date))}
              </time>
              <div className="flex flex-col gap-2 sm:col-span-3">
                <h3 className="font-medium">{entry.title}</h3>
                <p className="text-muted-foreground text-sm text-pretty">{entry.description}</p>
                {entry.api && (
                  <p className="flex flex-wrap gap-1.5">
                    {entry.api.map((name) => (
                      <code key={name} className="bg-muted rounded-md px-1.5 py-0.5 font-mono text-xs">
                        {name}
                      </code>
                    ))}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ol>

        {/* Ce qui vient, sans date : on ne promet pas un jour, seulement un ordre. */}
        <div className="flex flex-col gap-4 lg:col-span-2">
          <h3 className="text-muted-foreground font-mono text-xs">coming next</h3>
          <ul className="flex flex-col divide-y rounded-2xl border">
            {upcoming.map((entry) => (
              <li key={entry.title} className="flex flex-col gap-1 px-4 py-3">
                <span className="text-sm font-medium">{entry.title}</span>
                <span className="text-muted-foreground text-sm text-pretty">{entry.description}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </LandingSection>
  );
}
