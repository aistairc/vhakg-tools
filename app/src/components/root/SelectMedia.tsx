import React, { useEffect } from 'react';
import {
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Select,
  Td,
  Th,
  Tr,
} from '@chakra-ui/react';
import { SelectAction } from 'components/root/SelectAction';

type SelectMediaProps = {
  selectedActivity: string;
  selectedScene: string;
  selectedCamera: string;
  selectedMedia: string;
  setSelectedMedia: (media: string) => void;
  frame: number;
  setFrame: (frame: number, media: string) => void;
};

export function SelectMedia({
  selectedActivity,
  selectedScene,
  selectedCamera,
  selectedMedia,
  setSelectedMedia,
  frame,
  setFrame,
}: SelectMediaProps): React.ReactElement {
  const mediaList = ['image', 'video'];
  const step = selectedMedia === 'image' ? 5 : 1;

  useEffect(() => {
    setSelectedMedia('');
    setFrame(0, '');
  }, [selectedActivity, selectedScene]);

  return (
    <>
      <Tr>
        <Th width={60} fontSize="large">
          Output Type
        </Th>
        <Td>
          <Select
            placeholder="select"
            value={selectedMedia}
            onChange={(event) => setSelectedMedia(event.target.value)}
          >
            {mediaList.map((media) => (
              <option key={media} value={media}>
                {media}
                {media === 'image' ? ' (under development)' : ''}
              </option>
            ))}
          </Select>
        </Td>
      </Tr>
      {selectedMedia && (
        <>
          <SelectAction
            selectedActivity={selectedActivity}
            selectedScene={selectedScene}
            selectedCamera={selectedCamera}
            selectedMedia={selectedMedia}
            setFrame={setFrame}
          />
          <Tr>
            <Th width={60} fontSize="large">
              Frame
            </Th>
            <Td>
              <NumberInput
                value={frame}
                min={0}
                step={step}
                onChange={(event) => setFrame(Number(event), selectedMedia)}
              >
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </Td>
          </Tr>
        </>
      )}
    </>
  );
}
