import { Grid, GridItem } from '@chakra-ui/react';
import {
  type VideoSegmentQueryType,
  type VideoQueryType,
} from 'utils/action_object_search/sparql';
import React from 'react';
import { ImagePageLink } from 'components/action_object_search/ImagePageLink';

function getVideoDurationAsMediaFragment(video: VideoSegmentQueryType) {
  const frameRate = Number(video.frameRate.value);
  const start = Math.floor(Number(video.startFrame.value) / frameRate);
  const end = Math.floor(Number(video.endFrame.value) / frameRate);
  return `#t=${start},${end}`;
}

type VideoGridProps = {
  videos: VideoQueryType[] | VideoSegmentQueryType[];
  mainObject: string;
  targetObject: string;
};
export function VideoGrid({
  videos,
  mainObject,
  targetObject,
}: VideoGridProps): React.ReactElement {
  return (
    <Grid templateColumns="repeat(3, 1fr)" gap={4}>
      {videos.map((video) => {
        const hasVideoSegment = 'videoSegment' in video;
        return (
          <GridItem
            key={
              hasVideoSegment ? video.videoSegment.value : video.camera.value
            }
            p={2}
            border="1px"
            borderColor="gray.200"
            rounded="xl"
          >
            <video
              src={`data:video/mp4;base64,${video.base64Video.value}${hasVideoSegment ? getVideoDurationAsMediaFragment(video) : ''}`}
              controls
              width="100%"
              height="auto"
            />
            <ImagePageLink
              linkText={
                hasVideoSegment
                  ? video.videoSegment.value.split('/').pop() || ''
                  : video.camera.value.split('/').pop() || ''
              }
              mainObject={mainObject}
              targetObject={targetObject}
              iri={
                hasVideoSegment ? video.videoSegment.value : video.camera.value
              }
            ></ImagePageLink>
          </GridItem>
        );
      })}
    </Grid>
  );
}
