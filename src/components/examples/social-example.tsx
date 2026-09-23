import { EXAMPLE_VIDEOS } from "@/components/examples/videos";
import { VideoCn } from "@/registry/videocn/video-cn";

/** Bouchon : remplacé par le fil type réseau social. */
export function SocialExample() {
  const video = EXAMPLE_VIDEOS.bigBuckBunny;
  return (
    <div className="@container p-6">
      <VideoCn src={video.src} poster={video.poster} autoPlay defaultMuted loop />
    </div>
  );
}
