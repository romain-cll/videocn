import { EXAMPLE_VIDEOS } from "@/components/examples/videos";
import { VideoCn } from "@/registry/videocn/video-cn";

/** Bouchon : remplacé par la page type documentation technique. */
export function DocsExample() {
  const video = EXAMPLE_VIDEOS.tearsOfSteel;
  return (
    <div className="@container p-6">
      <VideoCn src={video.src} poster={video.poster} />
    </div>
  );
}
