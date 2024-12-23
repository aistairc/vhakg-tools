import React, { useEffect, useState } from 'react';
import { Select, Td, Th, Tr } from '@chakra-ui/react';
import { fetchObject, fetchStartFrameOfObject } from 'utils/root/sparql';
import { PREFIXES } from 'utils/common/sparql';

type SelectObjectProps = {
  selectedActivity: string;
  selectedScene: string;
  selectedCamera: string;
  selectedMedia: string;
  selectedEvent: string;
  startFrameForAction: number;
  setFrame: (frame: number, media: string) => void;
};

export function SelectObject({
  selectedActivity,
  selectedScene,
  selectedCamera,
  selectedMedia,
  selectedEvent,
  startFrameForAction,
  setFrame,
}: SelectObjectProps): React.ReactElement {
  const [objectList, setObjectList] = useState<string[]>([]);
  const [selectedObject, setSelectedObject] = useState<string>('');
  const [startFrame, setStartFrame] = useState<number>(0);

  const onChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    const object = event.target.value;
    setSelectedObject(object);
    const data = await fetchStartFrameOfObject(
      selectedActivity,
      selectedScene,
      selectedCamera,
      selectedEvent,
      object
    );
    if (data.length > 0) {
      const cameraId = selectedCamera.replace('camera', '');
      const startFrame = data[0].startFrame.value
        .replace(PREFIXES.ex, '')
        .replace(`${selectedActivity}_${cameraId}_${selectedScene}_frame`, '');
      setStartFrame(Number(startFrame));
      setFrame(Number(startFrame), selectedMedia);
    } else {
      setFrame(startFrameForAction, selectedMedia);
    }
  };

  useEffect(() => {
    (async () => {
      const list: string[] = [];
      const data = await fetchObject(
        selectedActivity,
        selectedScene,
        selectedCamera,
        selectedEvent
      );
      data.forEach((value) => {
        const object = value.object.value
          .replace(PREFIXES.ex, '')
          .replace(`_${selectedScene}`, '');
        list.push(object);
      });
      setObjectList(list);
    })();
  }, [selectedActivity, selectedScene, selectedCamera, selectedEvent]);

  useEffect(() => {
    setSelectedObject('');
  }, [selectedActivity, selectedScene, selectedEvent]);

  useEffect(() => {
    setFrame(Math.max(startFrame, startFrameForAction), selectedMedia);
  }, [selectedMedia]);

  return (
    <>
      <Tr>
        <Th width={60} fontSize="large">
          Object
        </Th>
        <Td>
          <Select
            placeholder="select"
            value={selectedObject}
            onChange={onChange}
          >
            {objectList.map((object) => (
              <option key={object} value={object}>
                {object}
              </option>
            ))}
          </Select>
        </Td>
      </Tr>
    </>
  );
}
