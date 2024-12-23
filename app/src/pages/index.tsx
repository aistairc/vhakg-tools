import React, { useEffect, useState } from 'react';
import 'pages/index.css';
import {
  ChakraProvider,
  Flex,
  Table,
  TableContainer,
  Tbody,
} from '@chakra-ui/react';
import { fetchActivity } from 'utils/root/sparql';
import { SelectActivity } from 'components/root/SelectActivity';
import { SelectScene } from 'components/root/SelectScene';
import { SelectCamera } from 'components/root/SelectCamera';
import { SelectMedia } from 'components/root/SelectMedia';
import { ResultVideo } from 'components/root/ResultVideo';
import { ResultImage } from 'components/root/ResultImage';
import FloatingNavigationLink from 'components/common/FloatingNavigationLink';
import { PREFIXES } from 'utils/common/sparql';
import { useDatabaseConnectivity } from 'hooks/useDatabaseConnectivity';
import Loading from 'components/common/Loading';

function App() {
  const [activityList, setActivityList] = useState<Map<string, string[]>>(
    new Map<string, string[]>()
  );
  const [selectedActivity, setSelectedActivity] = useState<string>('');
  const [selectedScene, setSelectedScene] = useState<string>('');
  const [selectedCamera, setSelectedCamera] = useState<string>('');
  const [selectedMedia, setSelectedMedia] = useState<string>('');
  const [frame, setFrame] = useState<number>(0);

  const canDatabaseBeConnected = useDatabaseConnectivity();

  const onChangeFrame = (frame: number, media: string) => {
    let innerFrame = frame;
    if (media === 'image') {
      // 余りが1だったら切り捨て、それ以外は切り上げしていそう
      if (frame % 5 === 1) {
        innerFrame = frame - 1;
      } else {
        innerFrame = Math.ceil(frame / 5) * 5;
      }
    }
    setFrame(innerFrame);
  };

  useEffect(() => {
    (async () => {
      try {
        const map = new Map<string, string[]>();
        const data = await fetchActivity();
        data.forEach((value) => {
          const activity = value.activity.value.replace(PREFIXES.ex, '');
          const splitActivity = activity.split('_scene');
          const activityName = splitActivity[0];
          const sceneName = 'scene' + splitActivity[1];
          if (map.has(activityName)) {
            map.get(activityName)?.push(sceneName);
          } else {
            map.set(activityName, [sceneName]);
          }
        });
        setActivityList(map);
      } catch (e) {
        console.error(e);
      }
    })();
  }, [canDatabaseBeConnected]);

  if (!canDatabaseBeConnected) {
    return (
      <ChakraProvider>
        <Loading />
      </ChakraProvider>
    );
  }
  return (
    <ChakraProvider>
      <FloatingNavigationLink
        linkTo="/action-object-search"
        buttonText="Action Object Search"
      />
      <Flex flexDirection="column" width="1000px" mx="auto" gap={4}>
        <TableContainer>
          <Table>
            <Tbody>
              <SelectActivity
                activityList={activityList}
                selectedActivity={selectedActivity}
                setSelectedActivity={setSelectedActivity}
              />
              {selectedActivity && (
                <SelectScene
                  activityList={activityList}
                  selectedActivity={selectedActivity}
                  selectedScene={selectedScene}
                  setSelectedScene={setSelectedScene}
                />
              )}
              {selectedScene && (
                <SelectCamera
                  selectedActivity={selectedActivity}
                  selectedScene={selectedScene}
                  selectedCamera={selectedCamera}
                  setSelectedCamera={setSelectedCamera}
                />
              )}
              {selectedCamera && (
                <SelectMedia
                  selectedActivity={selectedActivity}
                  selectedScene={selectedScene}
                  selectedCamera={selectedCamera}
                  selectedMedia={selectedMedia}
                  setSelectedMedia={setSelectedMedia}
                  frame={frame}
                  setFrame={onChangeFrame}
                />
              )}
            </Tbody>
          </Table>
        </TableContainer>
        {selectedMedia === 'video' && (
          <ResultVideo
            selectedActivity={selectedActivity}
            selectedScene={selectedScene}
            selectedCamera={selectedCamera}
            frame={frame}
          />
        )}
        {selectedMedia === 'image' && (
          <ResultImage
            selectedActivity={selectedActivity}
            selectedScene={selectedScene}
            selectedCamera={selectedCamera}
            frame={frame}
          />
        )}
      </Flex>
    </ChakraProvider>
  );
}

export default App;
