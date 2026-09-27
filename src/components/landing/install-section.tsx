import { CopyButton } from "@/components/copy-button";
import { Frame } from "@/components/frame";
import { LandingSection } from "@/components/landing/landing-section";
import { bundleSize } from "@/lib/bundle";
import { INSTALL_COMMAND } from "@/lib/install";
import registry from "../../../registry.json";

/**
 * Ce que la commande dépose réellement chez l'utilisateur. La liste est lue
 * dans `registry.json` au build, jamais recopiée : un fichier ajouté au lecteur
 * apparaît ici sans qu'on ait à s'en souvenir.
 *
 * `@ui/` est l'alias que le CLI résout vers le dossier `ui` du projet ; on
 * l'affiche sous sa forme la plus courante.
 */
const PLAYER_FILES = (registry.items.find((item) => item.name === "player")?.files ?? []).map(
  (file) => (file.target ?? file.path).replace(/^@ui\//, "components/ui/"),
);

const FILE_COUNT = PLAYER_FILES.length;
const DIRECTORY = "components/ui/video-player/";

export function InstallSection() {
  return (
    <LandingSection
      id="install"
      label="shadcn add"
      title="One command. Then the code is yours."
      description="The CLI copies the player into your project, one file per control. No package to update, nothing to eject: read it, change it, keep it."
    >
      <div className="grid gap-10 lg:grid-cols-5">
        <Frame
          className="lg:col-span-3"
          label="Terminal"
          actions={<CopyButton text={INSTALL_COMMAND} />}
          contentClassName="bg-muted/40"
        >
          <div className="font-mono text-xs leading-6">
            <p className="border-b px-4 py-3 break-all">
              <span className="text-muted-foreground select-none">$ </span>
              {INSTALL_COMMAND}
            </p>
            <div className="text-muted-foreground max-h-80 overflow-y-auto px-4 py-3">
              <p>
                <span className="text-foreground">✔</span> Checking registry.
              </p>
              <p>
                <span className="text-foreground">✔</span> Installing dependencies.
              </p>
              <p>
                <span className="text-foreground">✔</span> Created {FILE_COUNT} files:
              </p>
              <ul>
                {PLAYER_FILES.map((file) => (
                  <li key={file} className="truncate pl-4">
                    - {DIRECTORY}
                    <span className="text-foreground">{file.slice(DIRECTORY.length)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Frame>

        {/* Le poids, en faits vérifiables dans le texte plutôt qu'en gros
            chiffres : la question « est-ce que ça alourdit mon app ? » se pose,
            la réponse tient en trois lignes. */}
        <dl className="flex flex-col gap-6 text-sm lg:col-span-2 lg:pt-10">
          <div className="flex flex-col gap-1">
            <dt className="font-medium">
              {bundleSize.core.gzip} <span className="text-muted-foreground font-normal">gzip</span>
            </dt>
            <dd className="text-muted-foreground text-pretty">
              The whole player, controls included. React, lucide-react and your shadcn button are
              the ones your app already ships.
            </dd>
          </div>
          <div className="flex flex-col gap-1">
            <dt className="font-medium">
              {bundleSize.shaka.gzip}{" "}
              <span className="text-muted-foreground font-normal">gzip, on demand</span>
            </dt>
            <dd className="text-muted-foreground text-pretty">
              Shaka Player, fetched only when the source is HLS or DASH. An MP4 or WebM never
              downloads a line of it.
            </dd>
          </div>
          <div className="flex flex-col gap-1">
            <dt className="font-medium">No API</dt>
            <dd className="text-muted-foreground text-pretty">
              The player reads standard web formats and never calls a videoCn service.
            </dd>
          </div>
        </dl>
      </div>
    </LandingSection>
  );
}
