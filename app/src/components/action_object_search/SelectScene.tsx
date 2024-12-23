import React, { useCallback } from 'react';
import { Select, Td, Th, Tr } from '@chakra-ui/react';
import { type SceneQueryType } from 'utils/action_object_search/sparql';
import {
  SCENE_KEY,
  type SearchParamKey,
} from 'constants/action_object_search/constants';

type SelectSceneProps = {
  scenes: SceneQueryType[];
  selectedScene: string;
  setSelectedScene: (scene: string) => void;
  handleSearchParamsChange: (key: SearchParamKey, value: string) => void;
};
export function SelectScene({
  scenes,
  selectedScene,
  setSelectedScene,
  handleSearchParamsChange,
}: SelectSceneProps): React.ReactElement {
  const options = Array.from(
    new Set(
      scenes
        .map((scene) => scene.scene.value.split('_').pop())
        .filter((scene) => scene !== undefined)
        .sort()
    )
  );

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      setSelectedScene(event.target.value);
      handleSearchParamsChange(SCENE_KEY, event.target.value);
    },
    [setSelectedScene, handleSearchParamsChange]
  );

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
            onChange={handleChange}
          >
            {options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </Select>
        </Td>
      </Tr>
    </>
  );
}
