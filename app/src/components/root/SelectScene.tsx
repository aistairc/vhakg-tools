import React, { useEffect } from 'react';
import { Select, Td, Th, Tr } from '@chakra-ui/react';

type SelectSceneProps = {
  activityList: Map<string, string[]>;
  selectedActivity: string;
  selectedScene: string;
  setSelectedScene: (scene: string) => void;
};

export function SelectScene({
  activityList,
  selectedActivity,
  selectedScene,
  setSelectedScene,
}: SelectSceneProps): React.ReactElement {
  useEffect(() => {
    setSelectedScene('');
  }, [selectedActivity]);

  return (
    <>
      <Tr>
        <Th width={60} fontSize="large">
          Scene
        </Th>
        <Td>
          <Select
            placeholder="select"
            value={selectedScene}
            onChange={(event) => setSelectedScene(event.target.value)}
          >
            {activityList.get(selectedActivity)?.map((scene) => (
              <option key={scene} value={scene}>
                {scene}
              </option>
            ))}
          </Select>
        </Td>
      </Tr>
    </>
  );
}
