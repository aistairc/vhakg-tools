import {
  ChakraProvider,
  Flex,
  Table,
  TableContainer,
  Tbody,
} from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import { SelectAction } from 'action_object_search/components/SelectAction';
import FloatingNavigationLink from 'common/components/FloatingNavigationLink';
import {
  ActionQueryType,
  fetchAction,
  fetchVideo,
  fetchVideoCount,
  VideoQueryType,
} from 'action_object_search/utils/sparql';
import { InputObject } from 'action_object_search/components/InputObject';
import {
  VideoDurationRadio,
  VideoDurationType,
} from 'action_object_search/components/VideoDurationRadio';
import { VideoGrid } from 'action_object_search/components/VideoGrid';
import { TOTAL_VIDEOS_PER_PAGE } from 'action_object_search/constants';
import { Pagination } from 'action_object_search/components/Pagination';
import { useSearchParams } from 'react-router-dom';

function ActionObjectSearch(): React.ReactElement {
  const [actions, setActions] = useState<ActionQueryType[]>([]);
  const [mainObject, setMainObject] = useState<string>('');
  const [targetObject, setTargetObject] = useState<string>('');
  const [videos, setVideos] = useState<VideoQueryType[]>([]);
  const [videoCount, setVideoCount] = useState<number>(0);

  const [selectedAction, setSelectedAction] = useState<string>('');
  const [selectedVideoDuration, setSelectedVideoDuration] =
    useState<VideoDurationType>('full');

  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    (async () => {
      setActions(await fetchAction());
    })();
  }, []);

  useEffect(() => {
    if (selectedAction === '') {
      return;
    }
    if (mainObject === '') {
      return;
    }

    (async () => {
      if (selectedVideoDuration === 'full') {
        setVideos(
          await fetchVideo(
            selectedAction,
            mainObject,
            targetObject,
            TOTAL_VIDEOS_PER_PAGE,
            Number(searchParams.get('searchResultPage')) || 1
          )
        );
        setVideoCount(
          await fetchVideoCount(selectedAction, mainObject, targetObject)
        );
      }
    })();
  }, [
    selectedAction,
    mainObject,
    targetObject,
    selectedVideoDuration,
    searchParams,
  ]);

  return (
    <ChakraProvider>
      <FloatingNavigationLink linkTo="/" buttonText="Home" />
      <Flex flexDirection="column" width="1000px" mx="auto" gap={4}>
        <TableContainer>
          <Table>
            <Tbody>
              <SelectAction
                actions={actions}
                selectedAction={selectedAction}
                setSelectedAction={setSelectedAction}
              />
              <InputObject
                objectState={mainObject}
                setObjectState={setMainObject}
                tableHeader="Main Object"
                inputPlaceholder="Required"
              />
              <InputObject
                objectState={targetObject}
                setObjectState={setTargetObject}
                tableHeader="Target Object"
                inputPlaceholder="Optional"
              />
              <VideoDurationRadio
                selectedVideoDuration={selectedVideoDuration}
                setSelectedVideoDuration={setSelectedVideoDuration}
              />
            </Tbody>
          </Table>
        </TableContainer>
        <VideoGrid videos={videos} />
        <Pagination
          searchParams={searchParams}
          setSearchParams={setSearchParams}
          totalVideos={videoCount}
        />
      </Flex>
    </ChakraProvider>
  );
}
export default ActionObjectSearch;