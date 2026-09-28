import { OG_SIZE, renderOgImage } from "@/app/_og/og-image";

export const alt = "videoCn playground";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return renderOgImage({ title: "Every prop, live", cta: "Open the playground" });
}
