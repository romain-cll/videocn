import Link from "next/link";

import { CopyCommand } from "@/components/landing/copy-command";
import { Button } from "@/components/ui/button";

/** Le dernier appel : la même commande que le hero, et les deux entrées du site. */
export function FinalCta({ command }: { command: string }) {
  return (
    <section className="flex w-full flex-col items-center gap-6 py-16 text-center md:py-24">
      <h2 className="text-3xl font-semibold tracking-tight text-balance">Add it to your project</h2>
      <CopyCommand command={command} />
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button className="rounded-full" nativeButton={false} render={<Link href="/docs" />}>
          Read the docs
        </Button>
        <Button className="rounded-full" variant="secondary" nativeButton={false} render={<Link href="/demo" />}>
          View the demo
        </Button>
      </div>
    </section>
  );
}
