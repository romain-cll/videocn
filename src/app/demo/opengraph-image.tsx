import { OG_SIZE, renderOgImage } from "@/app/_og/og-image";

export const alt = "videoCn playground";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return renderOgImage({
    label: "playground",
    title: "Playground",
    description: "Set the props, watch the player change, copy the JSX.",
  });
}
