"use client";

/**
 * Le panneau de réglages du playground. Il ne connaît que l'état à plat de
 * `playground-state.ts` : ce qu'il en fait côté lecteur ne le regarde pas.
 *
 * Chaque étiquette est un vrai nom d'API, en monospace — `pictureInPicture`,
 * `scrubber.chapters`, `--radius` — pour qu'on retrouve dans l'extrait ce
 * qu'on vient de toucher.
 */

import {
  DEMO_SOURCES,
  getDemoSource,
  type DemoSourceId,
} from "@/lib/demo-media";
import {
  PALETTES,
  RADII,
  type PaletteId,
  type RadiusId,
} from "@/lib/demo-themes";
import { Switch } from "@/components/ui/switch";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";
import {
  AUTO_HIDE_DELAYS,
  CONTROL_TOGGLES,
  VISIBILITIES,
  type PlaygroundState,
  type RatePreset,
} from "@/components/playground/playground-state";

type Update = (patch: Partial<PlaygroundState>) => void;

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3 px-4 py-4">
      <h2 className="text-muted-foreground font-mono text-xs">{title}</h2>
      {children}
    </section>
  );
}

/** Une ligne interrupteur : le `<label>` englobe tout, la ligne entière est cliquable. */
function SwitchRow({
  name,
  checked,
  onCheckedChange,
  disabled,
  nested,
}: {
  name: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  nested?: boolean;
}) {
  return (
    <label
      className={cn(
        "flex items-center justify-between gap-3 font-mono text-xs",
        nested && "text-muted-foreground pl-3",
        disabled && "opacity-50",
      )}
    >
      <span className="truncate">{name}</span>
      <Switch
        size="sm"
        checked={checked}
        onCheckedChange={(next) => onCheckedChange(next)}
        disabled={disabled}
      />
    </label>
  );
}

/** Un choix parmi quelques valeurs, avec le nom du réglage au-dessus. */
function ChoiceRow<T extends string>({
  name,
  value,
  options,
  onValueChange,
  disabled,
  nested,
}: {
  name: string;
  value: T;
  options: readonly { value: T; label: React.ReactNode; ariaLabel?: string }[];
  onValueChange: (value: T) => void;
  disabled?: boolean;
  nested?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-1.5",
        nested && "pl-3",
        disabled && "opacity-50",
      )}
    >
      <span
        className={cn("font-mono text-xs", nested && "text-muted-foreground")}
      >
        {name}
      </span>
      <ToggleGroup
        value={[value]}
        onValueChange={(next) => {
          // Le groupe laisse tout désélectionner ; on garde alors la valeur courante.
          if (next[0]) onValueChange(next[0] as T);
        }}
        variant="outline"
        size="sm"
        disabled={disabled}
        className="flex-wrap"
      >
        {options.map((option) => (
          <ToggleGroupItem
            key={option.value}
            value={option.value}
            aria-label={option.ariaLabel}
          >
            {option.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  );
}

function Hint({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-muted-foreground text-xs text-pretty">{children}</p>
  );
}

export function SettingsPanel({
  state,
  update,
}: {
  state: PlaygroundState;
  update: Update;
}) {
  const source = getDemoSource(state.sourceId);

  return (
    <div className="divide-y">
      <Section title="source">
        <ToggleGroup
          value={[state.sourceId]}
          onValueChange={(next) => {
            if (next[0]) update({ sourceId: next[0] as DemoSourceId });
          }}
          variant="outline"
          size="sm"
          className="flex-wrap"
        >
          {DEMO_SOURCES.map((candidate) => (
            <ToggleGroupItem key={candidate.id} value={candidate.id}>
              {candidate.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        <Hint>{source.note}</Hint>
      </Section>

      <Section title="chapters">
        {/* Écrit comme la prop, pour ne pas le confondre avec `controls.chapters`, le menu. */}
        <SwitchRow
          name="chapters={chapters}"
          checked={state.chapters && source.supportsChapters}
          onCheckedChange={(chapters) => update({ chapters })}
          disabled={!source.supportsChapters}
        />
        {!source.supportsChapters && (
          <Hint>
            A live window has no fixed timeline to cut: the player ignores
            chapters.
          </Hint>
        )}
      </Section>

      <Section title="controls">
        <ChoiceRow
          name="visibility"
          value={state.visibility}
          options={VISIBILITIES.map((value) => ({ value, label: value }))}
          onValueChange={(visibility) => update({ visibility })}
        />
        <ChoiceRow
          name="autoHideDelay"
          value={String(state.autoHideDelay)}
          options={AUTO_HIDE_DELAYS.map((delay) => ({
            value: String(delay),
            label: `${delay / 1000} s`,
            ariaLabel: `${delay} ms`,
          }))}
          onValueChange={(delay) => update({ autoHideDelay: Number(delay) })}
          disabled={state.visibility !== "auto"}
        />
        {CONTROL_TOGGLES.map((key) => (
          <div key={key} className="flex flex-col gap-3">
            <SwitchRow
              name={key}
              checked={state.toggles[key]}
              onCheckedChange={(checked) =>
                update({ toggles: { ...state.toggles, [key]: checked } })
              }
            />
            {key === "scrubber" && (
              <SwitchRow
                name="scrubber.chapters"
                checked={state.scrubberChapters}
                onCheckedChange={(scrubberChapters) =>
                  update({ scrubberChapters })
                }
                disabled={!state.toggles.scrubber}
                nested
              />
            )}
            {key === "playbackRate" && (
              <ChoiceRow<RatePreset>
                name="playbackRate.rates"
                value={state.ratePreset}
                options={[
                  { value: "default", label: "default" },
                  { value: "short", label: "[1, 1.5, 2]" },
                ]}
                onValueChange={(ratePreset) => update({ ratePreset })}
                disabled={!state.toggles.playbackRate}
                nested
              />
            )}
          </div>
        ))}
      </Section>

      <Section title="props">
        <SwitchRow
          name="autoPlay"
          checked={state.autoPlay}
          onCheckedChange={(autoPlay) => update({ autoPlay })}
        />
        <SwitchRow
          name="loop"
          checked={state.loop}
          onCheckedChange={(loop) => update({ loop })}
        />
        <SwitchRow
          name="defaultMuted"
          checked={state.defaultMuted || state.autoPlay}
          onCheckedChange={(defaultMuted) => update({ defaultMuted })}
          disabled={state.autoPlay}
        />
        {state.autoPlay && (
          <Hint>
            Browsers only autoplay muted video, so autoPlay comes with
            defaultMuted.
          </Hint>
        )}
      </Section>

      <Section title="theme">
        <ChoiceRow<PaletteId>
          name="palette"
          value={state.palette}
          options={PALETTES.map((candidate) => ({
            value: candidate.id,
            // La pastille lit `--primary` à travers la classe de sa palette.
            label: (
              <>
                <span
                  className={cn(
                    candidate.className,
                    "bg-primary size-3 rounded-full",
                  )}
                />
                {candidate.label}
              </>
            ),
          }))}
          onValueChange={(palette) => update({ palette })}
        />
        <ChoiceRow<RadiusId>
          name="--radius"
          value={state.radius}
          options={RADII.map((candidate) => ({
            value: candidate.id,
            label: candidate.label,
          }))}
          onValueChange={(radius) => update({ radius })}
        />
      </Section>
    </div>
  );
}
