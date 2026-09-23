import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { EXAMPLES, findExample } from "@/components/examples";

export function generateStaticParams() {
  return EXAMPLES.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/examples/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  return { title: `Example: ${findExample(slug)?.label ?? slug}` };
}

export default async function ExamplePage({ params }: PageProps<"/examples/[slug]">) {
  const { slug } = await params;
  const example = findExample(slug);
  if (!example) notFound();

  const { Component } = example;
  return (
    <main className="mx-auto max-w-screen-2xl">
      <Component />
    </main>
  );
}
