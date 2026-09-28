import { OG_SIZE, renderOgImage } from "@/app/_og/og-image";

export const alt = "videoCn documentation";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return renderOgImage({
    label: "docs",
    title: "Video Player",
    description: "Install with the shadcn CLI, then tune it through props.",
  });
}
