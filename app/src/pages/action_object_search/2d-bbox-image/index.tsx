import { Box, Center, ChakraProvider } from '@chakra-ui/react';
import { BackToVideoSearchButton } from 'components/action_object_search/2d-bbox-image/BackToVideoSearchButton';
import { Pagination } from 'components/action_object_search/Pagination';
import Loading from 'components/common/Loading';
import {
  IMAGE_VIEWER_PAGE_KEY,
  IRI_KEY,
  MAIN_OBJECT_KEY,
  type SearchParamKey,
  TARGET_OBJECT_KEY,
  TOTAL_IMAGES_PER_PAGE,
} from 'constants/action_object_search/constants';
import { useDatabaseConnectivity } from 'hooks/useDatabaseConnectivity';
import React, { useCallback, useEffect, useState, createRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  type FrameQueryType,
  type VideoQueryType,
  fetchBoundingBox,
  fetchFrameByCamera,
  fetchFrameByVideoSegment,
  fetchVideoByCamera,
  fetchVideoByVideoSegment,
} from 'utils/action_object_search/2d-bbox-image/sparql';

function BoundingBoxImageViewer(): React.ReactElement {
  const [searchParams, setSearchParams] = useSearchParams();

  const mainObject = searchParams.get(MAIN_OBJECT_KEY) || '';
  const targetObject = searchParams.get(TARGET_OBJECT_KEY) || '';
  const iri = searchParams.get(IRI_KEY) || '';

  const [frames, setFrames] = useState<FrameQueryType[]>([]);
  const [imageViewerPage, setImageViewerPage] = useState(
    Number(searchParams.get(IMAGE_VIEWER_PAGE_KEY)) || 1
  );
  const [canvasContext, setCanvasContext] =
    useState<CanvasRenderingContext2D | null>(null);
  const [video, setVideo] = useState<VideoQueryType | null>(null);
  const [resolution, setResolution] = useState<{
    width: number;
    height: number;
  }>({ width: 0, height: 0 });

  const canDatabaseBeConnected = useDatabaseConnectivity();

  const videoElementRef = createRef<HTMLVideoElement>();

  const isAnyRequiredParamEmpty = mainObject === '' || iri === '';
  const isVideoSegment = iri.includes('video_segment');
  const frameCount = frames.length;

  useEffect(() => {
    const canvas = document.getElementById('image') as HTMLCanvasElement | null;
    const context = canvas?.getContext('2d') || null;
    setCanvasContext(context);

    (async () => {
      if (isAnyRequiredParamEmpty) {
        return;
      }
      try {
        let videoQueryResult;
        if (isVideoSegment) {
          videoQueryResult = await fetchVideoByVideoSegment(iri);
          setFrames(
            await fetchFrameByVideoSegment(iri, mainObject, targetObject)
          );
        } else {
          videoQueryResult = await fetchVideoByCamera(iri);
          setFrames(await fetchFrameByCamera(iri, mainObject, targetObject));
        }
        setVideo(videoQueryResult);

        if (videoQueryResult === null) {
          return;
        }

        const [width, height] = videoQueryResult.resolution.value
          .split('x')
          .map((v) => Number(v)); // "1920x1080" -> [1920, 1080]
        setResolution({ width, height });
      } catch (e) {
        console.error(e);
      }
    })();
  }, [canDatabaseBeConnected]);

  useEffect(() => {
    (() => {
      if (frameCount === 0) {
        return;
      }
      const frameIri = frames[imageViewerPage - 1].frame.value;
      const frameNumber =
        Number(frameIri.split('_').pop()?.replace('frame', '')) || 0;

      if (videoElementRef.current === null) {
        return;
      }
      videoElementRef.current.currentTime =
        frameNumber / Number(video?.frameRate.value);
    })();
  }, [frames, imageViewerPage]);

  const handleSearchParamsChange = useCallback(
    (key: SearchParamKey, value: string) => {
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.set(key, value);
      setSearchParams(newSearchParams);
    },
    [searchParams, setSearchParams]
  );

  const handleTimeUpdate = useCallback(async () => {
    if (frameCount === 0) {
      return;
    }
    if (videoElementRef.current === null) {
      return;
    }
    if (canvasContext === null) {
      return;
    }

    const frameIri = frames[imageViewerPage - 1].frame.value;
    canvasContext.clearRect(0, 0, resolution.width, resolution.height);
    canvasContext.drawImage(
      videoElementRef.current,
      0,
      0,
      resolution.width,
      resolution.height
    );

    const boundingBoxes = await fetchBoundingBox(
      frameIri,
      mainObject,
      targetObject
    );

    boundingBoxes.forEach((boundingBox) => {
      const [leftX, topY, rightX, bottomY] = boundingBox.boundingBoxValue.value
        .split(',')
        .map((v) => Number(v));
      boundingBox.label.value.includes(mainObject)
        ? (canvasContext.strokeStyle = 'red')
        : (canvasContext.strokeStyle = 'blue');
      canvasContext?.strokeRect(
        leftX,
        resolution.height - topY, // Y軸はRDFとcanvasで上下が逆
        rightX - leftX,
        topY - bottomY
      );
    });
  }, [frames, imageViewerPage, resolution, mainObject, targetObject]);

  if (!canDatabaseBeConnected) {
    return (
      <ChakraProvider>
        <Loading />
      </ChakraProvider>
    );
  }
  return (
    <ChakraProvider>
      <Center>
        <Box>
          <Center>
            <video
              style={{ display: 'none' }}
              src={`data:video/mp4;base64,${video?.base64Video.value}`}
              width="100%"
              height="auto"
              ref={videoElementRef}
              onTimeUpdate={handleTimeUpdate}
            />
            <canvas
              width={`${resolution.width}px`}
              height={`${resolution.height}px`}
              id="image"
            />
          </Center>
          <Pagination
            pageState={imageViewerPage}
            setPageState={setImageViewerPage}
            searchParamPageKey={IMAGE_VIEWER_PAGE_KEY}
            handleSearchParamsChange={handleSearchParamsChange}
            totalElements={frameCount}
            displayedElementsPerPage={TOTAL_IMAGES_PER_PAGE}
          />
          <BackToVideoSearchButton />
        </Box>
      </Center>
    </ChakraProvider>
  );
}
export default BoundingBoxImageViewer;
