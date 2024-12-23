import React, { useEffect, useState } from 'react';
import { Select, Td, Th, Tr } from '@chakra-ui/react';
import { fetchCamera } from 'utils/root/sparql';
import { PREFIXES } from 'utils/common/sparql';

type SelectCameraProps = {
  selectedActivity: string;
  selectedScene: string;
  selectedCamera: string;
  setSelectedCamera: (camera: string) => void;
};

export function SelectCamera({
  selectedActivity,
  selectedScene,
  selectedCamera,
  setSelectedCamera,
}: SelectCameraProps): React.ReactElement {
  const [cameraList, setCameraList] = useState<string[]>([]);

  useEffect(() => {
    (async () => {
      const list: string[] = [];
      const data = await fetchCamera(selectedActivity, selectedScene);
      data.forEach((value) => {
        const camera = value.camera.value
          .replace(PREFIXES.ex, '')
          .replace(`${selectedActivity}_${selectedScene}_`, '');
        list.push(camera);
      });
      setCameraList(list);
    })();
    setSelectedCamera('');
  }, [selectedActivity, selectedScene]);

  return (
    <>
      <Tr>
        <Th width={60} fontSize="large">
          Camera
        </Th>
        <Td>
          <Select
            placeholder="select"
            value={selectedCamera}
            onChange={(event) => setSelectedCamera(event.target.value)}
          >
            {cameraList.map((camera) => (
              <option key={camera} value={camera}>
                {camera}
              </option>
            ))}
          </Select>
        </Td>
      </Tr>
    </>
  );
}
