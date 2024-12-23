import React, { useEffect, useState } from 'react';
import { fetchImage } from 'utils/root/sparql';

type ResultImageProps = {
  selectedActivity: string;
  selectedScene: string;
  selectedCamera: string;
  frame: number;
};

export function ResultImage({
  selectedActivity,
  selectedScene,
  selectedCamera,
  frame,
}: ResultImageProps): React.ReactElement {
  const [canvasContext, setCanvasContext] =
    useState<CanvasRenderingContext2D | null>(null);
  const [splitImage, setSplitImage] = useState<string[]>([]);
  const [splitWidth, setSplitWidth] = useState<number>(0);
  const [resolution, setResolution] = useState<{
    width: number;
    height: number;
  }>({ width: 0, height: 0 });

  useEffect(() => {
    const canvas = document.getElementById('resultImage') as HTMLCanvasElement;
    const context = canvas.getContext('2d');
    setCanvasContext(context);
  }, [resolution]);

  useEffect(() => {
    (async () => {
      const list: string[] = [];
      const data = await fetchImage(
        selectedActivity,
        selectedScene,
        selectedCamera,
        frame
      );
      data.forEach((value) => {
        const resolution = value.resolution.value.split('x');
        list.push(value.image.value);
        setSplitWidth(Number(value.splitWidth.value));
        setResolution({
          width: Number(resolution[0]),
          height: Number(resolution[1]),
        });
      });
      setSplitImage(list);
    })();
  }, [selectedActivity, selectedScene, selectedCamera, frame]);

  useEffect(() => {
    if (canvasContext) {
      if (splitImage.length === 0) {
        canvasContext.clearRect(0, 0, resolution.width, resolution.height);
        return;
      }
      splitImage.forEach((image, index) => {
        const img = new Image();
        img.src = `data:image/jpeg;base64,${image}`;
        img.onload = () => {
          const x = (index % splitWidth) * img.width;
          const y = Math.floor(index / splitWidth) * img.height;
          canvasContext.drawImage(img, x, y);
        };
      });
    }
  }, [canvasContext, splitImage]);

  return (
    <canvas
      width={`${resolution.width}px`}
      height={`${resolution.height}px`}
      id="resultImage"
    />
  );
}
