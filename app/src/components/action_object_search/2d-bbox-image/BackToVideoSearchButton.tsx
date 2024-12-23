import { Button, Center } from '@chakra-ui/react';
import { VIDEO_SEARCH_SESSION_STORAGE_KEY } from 'constants/action_object_search/constants';
import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

export function BackToVideoSearchButton(): React.ReactElement {
  const navigate = useNavigate();
  const handleClick = useCallback(() => {
    const videoSearchParams = sessionStorage.getItem(
      VIDEO_SEARCH_SESSION_STORAGE_KEY
    );
    if (videoSearchParams) {
      navigate('/action-object-search?' + videoSearchParams);
    } else {
      navigate('/action-object-search');
    }
  }, []);
  return (
    <Center>
      <Button onClick={handleClick}>Back</Button>
    </Center>
  );
}
