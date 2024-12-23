import React from 'react';
import { Select, Td, Th, Tr } from '@chakra-ui/react';

type SelectActivityProps = {
  activityList: Map<string, string[]>;
  selectedActivity: string;
  setSelectedActivity: (activity: string) => void;
};

export function SelectActivity({
  activityList,
  selectedActivity,
  setSelectedActivity,
}: SelectActivityProps): React.ReactElement {
  return (
    <>
      <Tr>
        <Th width={60} fontSize="large">
          Activity
        </Th>
        <Td>
          <Select
            placeholder="select"
            value={selectedActivity}
            onChange={(event) => setSelectedActivity(event.target.value)}
          >
            {[...activityList.keys()].map((activity) => (
              <option key={activity} value={activity}>
                {activity}
              </option>
            ))}
          </Select>
        </Td>
      </Tr>
    </>
  );
}
