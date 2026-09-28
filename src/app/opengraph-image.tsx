import { OG_SIZE, renderOgImage } from "@/app/_og/og-image";

export const alt = "videoCn, a video player for shadcn/ui";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return renderOgImage({
    label: "@videocn/player",
    title: "A video player for shadcn/ui",
    description: "Reads your theme tokens. Configured through props.",
  });
}
