import { Select, Td, Th, Tr } from '@chakra-ui/react';
import {
  type SearchParamKey,
  ACTION_KEY,
} from 'constants/action_object_search/constants';
import { type ActionQueryType } from 'utils/action_object_search/sparql';
import React, { useCallback } from 'react';

type SelectActionProps = {
  actions: ActionQueryType[];
  selectedAction: string;
  setSelectedAction: (action: string) => void;
  handleSearchParamsChange: (key: SearchParamKey, value: string) => void;
};
export function SelectAction({
  actions,
  selectedAction,
  setSelectedAction,
  handleSearchParamsChange,
}: SelectActionProps): React.ReactElement {
  const options = actions.map((action) => ({
    value: action.action.value,
    label: action.action.value.split('/').pop(), // vh2kg:action/<Action>から<Action>を取得
  }));

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      setSelectedAction(event.target.value);
      handleSearchParamsChange(ACTION_KEY, event.target.value);
    },
    [setSelectedAction, handleSearchParamsChange]
  );

  return (
    <>
      <Tr>
        <Th width={60} fontSize="large">
          Action
        </Th>
        <Td>
          <Select
            placeholder="select"
            value={selectedAction}
            onChange={handleChange}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </Td>
      </Tr>
    </>
  );
}
