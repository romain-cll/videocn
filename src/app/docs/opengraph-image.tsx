import { OG_SIZE, renderOgImage } from "@/app/_og/og-image";

export const alt = "videoCn documentation";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return renderOgImage({ title: "The video player docs", cta: "Read the docs" });
}
