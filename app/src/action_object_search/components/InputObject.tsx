import React, { useCallback } from 'react';
import { Input, Td, Th, Tr } from '@chakra-ui/react';
import {
  SearchParamKey,
  SearchParamObjectKey,
} from 'action_object_search/constants';

type InputObjectProps = {
  searchParamObjectKey: SearchParamObjectKey;
  objectState: string;
  setObjectState: (objectState: string) => void;
  handleSearchParamsChange: (key: SearchParamKey, value: string) => void;
  tableHeader: string;
  inputPlaceholder: string;
};
export function InputObject({
  searchParamObjectKey,
  objectState,
  setObjectState,
  handleSearchParamsChange,
  tableHeader,
  inputPlaceholder,
}: InputObjectProps): React.ReactElement {
  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setObjectState(event.target.value);
      handleSearchParamsChange(
        searchParamObjectKey as SearchParamKey,
        event.target.value
      );
    },
    [searchParamObjectKey, setObjectState, handleSearchParamsChange]
  );

  return (
    <>
      <Tr>
        <Th width={60} fontSize="large">
          {tableHeader}
        </Th>
        <Td>
          <Input
            placeholder={inputPlaceholder}
            value={objectState}
            onChange={handleChange}
          />
        </Td>
      </Tr>
    </>
  );
}
