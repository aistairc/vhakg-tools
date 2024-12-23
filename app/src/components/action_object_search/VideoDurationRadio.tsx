import { Radio, RadioGroup, Stack, Td, Th, Tr } from '@chakra-ui/react';
import {
  type SearchParamKey,
  VIDEO_DURATION_KEY,
} from 'constants/action_object_search/constants';
import React, { useCallback } from 'react';

export type VideoDurationType = 'full' | 'segment';
type VideoDurationRadioProps = {
  selectedVideoDuration: VideoDurationType;
  setSelectedVideoDuration: (videoDuration: VideoDurationType) => void;
  handleSearchParamsChange: (key: SearchParamKey, value: string) => void;
};
export function VideoDurationRadio({
  selectedVideoDuration,
  setSelectedVideoDuration,
  handleSearchParamsChange,
}: VideoDurationRadioProps): React.ReactElement {
  const handleChange = useCallback(
    (value: VideoDurationType) => {
      setSelectedVideoDuration(value);
      handleSearchParamsChange(VIDEO_DURATION_KEY, value);
    },
    [setSelectedVideoDuration, handleSearchParamsChange]
  );

  return (
    <>
      <Tr>
        <Th width={60} fontSize="large">
          Video Duration
        </Th>
        <Td>
          <RadioGroup onChange={handleChange} value={selectedVideoDuration}>
            <Stack direction="row">
              <Radio value="full">Full</Radio>
              <Radio value="segment">Segment</Radio>
            </Stack>
          </RadioGroup>
        </Td>
      </Tr>
    </>
  );
}
