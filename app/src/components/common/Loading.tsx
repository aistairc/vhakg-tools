import {
  Center,
  Heading,
  HStack,
  Spinner,
  Text,
  VStack,
} from '@chakra-ui/react';
import React from 'react';

const Loading = () => {
  return (
    <Center>
      <VStack>
        <HStack>
          <Spinner />
          <Heading>Loading database...</Heading>
        </HStack>
        <Text>
          If this process takes too long, please check if the database container
          is running.
        </Text>
      </VStack>
    </Center>
  );
};
export default Loading;
