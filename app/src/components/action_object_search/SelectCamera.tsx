import React, { useCallback } from 'react';
import { Select, Td, Th, Tr } from '@chakra-ui/react';
import { type CameraQueryType } from 'utils/action_object_search/sparql';
import {
  CAMERA_KEY,
  type SearchParamKey,
} from 'constants/action_object_search/constants';

type SelectCameraProps = {
  cameras: CameraQueryType[];
  selectedCamera: string;
  setSelectedCamera: (camera: string) => void;
  handleSearchParamsChange: (key: SearchParamKey, value: string) => void;
};
export function SelectCamera({
  cameras,
  selectedCamera,
  setSelectedCamera,
  handleSearchParamsChange,
}: SelectCameraProps): React.ReactElement {
  const options = Array.from(
    new Set(
      cameras
        .map((camera) => camera.camera.value.split('_').pop())
        .filter((camera) => camera !== undefined)
        .sort()
    )
  );

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      setSelectedCamera(event.target.value);
      handleSearchParamsChange(CAMERA_KEY, event.target.value);
    },
    [setSelectedCamera, handleSearchParamsChange]
  );

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
