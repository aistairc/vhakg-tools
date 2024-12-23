import React, { useEffect, useMemo, useState } from 'react';
import { fetchVideo } from 'utils/root/sparql';

type ResultVideoProps = {
  selectedActivity: string;
  selectedScene: string;
  selectedCamera: string;
  frame: number;
};

export function ResultVideo({
  selectedActivity,
  selectedScene,
  selectedCamera,
  frame,
}: ResultVideoProps): React.ReactElement {
  const [frameRate, setFrameRate] = useState<number>(1);
  const [video, setVideo] = useState<string>('');

  const currentTime = useMemo(() => frame / frameRate, [frame, frameRate]);

  const handleVideoRef = (video: HTMLVideoElement | null) => {
    if (video) {
      video.currentTime = currentTime;
    }
  };

  useEffect(() => {
    (async () => {
      const data = await fetchVideo(
        selectedActivity,
        selectedScene,
        selectedCamera
      );
      if (data.length > 0) {
        setFrameRate(Number(data[0].frameRate.value));
        setVideo(data[0].video.value);
      } else {
        setFrameRate(1);
      }
    })();
  }, [selectedActivity, selectedScene, selectedCamera]);

  return (
    <>
      <video
        src={`data:video/mp4;base64,${video}`}
        controls
        width="100%"
        height="auto"
        ref={handleVideoRef}
      />
    </>
  );
}
