import { OG_SIZE, renderOgImage } from "@/app/_og/og-image";

export const alt = "videoCn, a video player for shadcn/ui";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return renderOgImage({ title: "A video player for shadcn/ui", cta: "Get started" });
}
