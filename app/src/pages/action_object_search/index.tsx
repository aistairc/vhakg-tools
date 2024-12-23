import {
  ChakraProvider,
  Flex,
  Table,
  TableContainer,
  Tbody,
} from '@chakra-ui/react';
import { InputObject } from 'components/action_object_search/InputObject';
import { Pagination } from 'components/action_object_search/Pagination';
import { SelectAction } from 'components/action_object_search/SelectAction';
import {
  VideoDurationRadio,
  type VideoDurationType,
} from 'components/action_object_search/VideoDurationRadio';
import { VideoGrid } from 'components/action_object_search/VideoGrid';
import {
  type SearchParamKey,
  type SearchParamObjectKey,
  MAIN_OBJECT_KEY,
  SEARCH_RESULT_PAGE_KEY,
  ACTION_KEY,
  VIDEO_DURATION_KEY,
  TARGET_OBJECT_KEY,
  TOTAL_VIDEOS_PER_PAGE,
  SCENE_KEY,
  CAMERA_KEY,
  VIDEO_SEARCH_SESSION_STORAGE_KEY,
} from 'constants/action_object_search/constants';
import {
  type ActionQueryType,
  type CameraQueryType,
  fetchAction,
  fetchScene,
  fetchVideo,
  fetchVideoCount,
  fetchVideoSegment,
  type SceneQueryType,
  type VideoQueryType,
  type VideoSegmentQueryType,
} from 'utils/action_object_search/sparql';
import FloatingNavigationLink from 'components/common/FloatingNavigationLink';
import React, { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SelectScene } from 'components/action_object_search/SelectScene';
import { SelectCamera } from 'components/action_object_search/SelectCamera';
import { fetchCamera } from 'utils/action_object_search/sparql';
import Loading from 'components/common/Loading';
import { useDatabaseConnectivity } from 'hooks/useDatabaseConnectivity';

function ActionObjectSearch(): React.ReactElement {
  const [actions, setActions] = useState<ActionQueryType[]>([]);
  const [videos, setVideos] = useState<VideoQueryType[]>([]);
  const [videoSegments, setVideoSegments] = useState<VideoSegmentQueryType[]>(
    []
  );
  const [videoCount, setVideoCount] = useState<number>(0);
  const [scenes, setScenes] = useState<SceneQueryType[]>([]);
  const [cameras, setCameras] = useState<CameraQueryType[]>([]);

  const [searchParams, setSearchParams] = useSearchParams();

  const [selectedAction, setSelectedAction] = useState<string>(
    searchParams.get(ACTION_KEY) || ''
  );
  const [mainObject, setMainObject] = useState<string>(
    searchParams.get(MAIN_OBJECT_KEY) || ''
  );
  const [targetObject, setTargetObject] = useState<string>(
    searchParams.get(TARGET_OBJECT_KEY) || ''
  );
  const [selectedVideoDuration, setSelectedVideoDuration] =
    useState<VideoDurationType>(
      (searchParams.get(VIDEO_DURATION_KEY) as VideoDurationType) || 'full'
    );
  const [searchResultPage, setSearchResultPage] = useState<number>(
    Number(searchParams.get(SEARCH_RESULT_PAGE_KEY)) || 1
  );
  const [selectedScene, setSelectedScene] = useState<string>(
    searchParams.get(SCENE_KEY) || ''
  );
  const [selectedCamera, setSelectedCamera] = useState<string>(
    searchParams.get(CAMERA_KEY) || ''
  );

  const canDatabaseBeConnected = useDatabaseConnectivity();

  const isAnyRequiredParamsEmpty = selectedAction === '' || mainObject === '';

  const handleSearchParamsChange = useCallback(
    (key: SearchParamKey, value: string) => {
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.set(key, value);
      if (key !== SEARCH_RESULT_PAGE_KEY) {
        setSearchResultPage(1);
        newSearchParams.set(SEARCH_RESULT_PAGE_KEY, '1');
      }
      setSearchParams(newSearchParams);

      sessionStorage.removeItem(VIDEO_SEARCH_SESSION_STORAGE_KEY);
      sessionStorage.setItem(
        VIDEO_SEARCH_SESSION_STORAGE_KEY,
        newSearchParams.toString()
      );
    },
    [searchParams, setSearchParams, setSearchResultPage]
  );

  useEffect(() => {
    (async () => {
      try {
        setActions(await fetchAction());
      } catch (e) {
        console.error(e);
      }
    })();
  }, [canDatabaseBeConnected]);

  useEffect(() => {
    if (isAnyRequiredParamsEmpty) {
      return;
    }

    (async () => {
      try {
        setScenes(
          await fetchScene(
            selectedAction,
            mainObject,
            targetObject,
            selectedCamera
          )
        );
      } catch (e) {
        console.error(e);
      }
    })();
  }, [canDatabaseBeConnected, selectedAction, mainObject, targetObject, selectedCamera]);

  useEffect(() => {
    if (isAnyRequiredParamsEmpty) {
      return;
    }

    (async () => {
      try {
        setCameras(
          await fetchCamera(
            selectedAction,
            mainObject,
            targetObject,
            selectedScene
          )
        );
      } catch (e) {
        console.error(e);
      }
    })();
  }, [canDatabaseBeConnected, selectedAction, mainObject, targetObject, selectedScene]);

  useEffect(() => {
    if (isAnyRequiredParamsEmpty) {
      return;
    }

    (async () => {
      try {
        switch (selectedVideoDuration) {
          case 'full':
            setVideos(
              await fetchVideo(
                selectedAction,
                mainObject,
                targetObject,
                selectedScene,
                selectedCamera,
                TOTAL_VIDEOS_PER_PAGE,
                searchResultPage
              )
            );
            break;
          case 'segment':
            setVideoSegments(
              await fetchVideoSegment(
                selectedAction,
                mainObject,
                targetObject,
                selectedScene,
                selectedCamera,
                TOTAL_VIDEOS_PER_PAGE,
                searchResultPage
              )
            );
            break;
        }
      } catch (e) {
        console.error(e);
      }
    })();
  }, [
    canDatabaseBeConnected,
    selectedAction,
    mainObject,
    targetObject,
    selectedScene,
    selectedCamera,
    selectedVideoDuration,
    searchResultPage,
  ]);

  useEffect(() => {
    if (isAnyRequiredParamsEmpty) {
      return;
    }

    (async () => {
      try {
        setVideoCount(
          await fetchVideoCount(
            selectedAction,
            mainObject,
            targetObject,
            selectedScene,
            selectedCamera,
            selectedVideoDuration
          )
        );
      } catch (e) {
        console.error(e);
      }
    })();
  }, [
    canDatabaseBeConnected,
    selectedAction,
    mainObject,
    targetObject,
    selectedScene,
    selectedCamera,
    selectedVideoDuration,
  ]);

  if (!canDatabaseBeConnected) {
    return (
      <ChakraProvider>
        <Loading />
      </ChakraProvider>
    );
  }
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
                handleSearchParamsChange={handleSearchParamsChange}
              />
              <InputObject
                searchParamObjectKey={MAIN_OBJECT_KEY as SearchParamObjectKey}
                objectState={mainObject}
                setObjectState={setMainObject}
                handleSearchParamsChange={handleSearchParamsChange}
                tableHeader="Main Object"
                inputPlaceholder="Required"
              />
              <InputObject
                searchParamObjectKey={TARGET_OBJECT_KEY as SearchParamObjectKey}
                objectState={targetObject}
                setObjectState={setTargetObject}
                handleSearchParamsChange={handleSearchParamsChange}
                tableHeader="Target Object"
                inputPlaceholder="Optional"
              />
              <VideoDurationRadio
                selectedVideoDuration={selectedVideoDuration}
                setSelectedVideoDuration={setSelectedVideoDuration}
                handleSearchParamsChange={handleSearchParamsChange}
              />
              <SelectScene
                scenes={scenes}
                selectedScene={selectedScene}
                setSelectedScene={setSelectedScene}
                handleSearchParamsChange={handleSearchParamsChange}
              />
              <SelectCamera
                cameras={cameras}
                selectedCamera={selectedCamera}
                setSelectedCamera={setSelectedCamera}
                handleSearchParamsChange={handleSearchParamsChange}
              />
            </Tbody>
          </Table>
        </TableContainer>
        {selectedVideoDuration === 'full' && (
          <VideoGrid
            videos={videos}
            mainObject={mainObject}
            targetObject={targetObject}
          />
        )}
        {selectedVideoDuration === 'segment' && (
          <VideoGrid
            videos={videoSegments}
            mainObject={mainObject}
            targetObject={targetObject}
          />
        )}
        <Pagination
          pageState={searchResultPage}
          setPageState={setSearchResultPage}
          searchParamPageKey={SEARCH_RESULT_PAGE_KEY}
          handleSearchParamsChange={handleSearchParamsChange}
          totalElements={videoCount}
          displayedElementsPerPage={TOTAL_VIDEOS_PER_PAGE}
        />
      </Flex>
    </ChakraProvider>
  );
}
export default ActionObjectSearch;
