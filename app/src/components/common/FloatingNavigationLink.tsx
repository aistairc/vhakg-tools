import React from 'react';
import { Box, Button } from '@chakra-ui/react';
import { Link } from 'react-router-dom';

const FloatingNavigationLink = ({
  linkTo,
  buttonText,
}: {
  linkTo: string;
  buttonText: string;
}) => {
  return (
    <Box m={1} float="left" position="absolute">
      <Link to={linkTo}>
        <Button width={200}>{buttonText}</Button>
      </Link>
    </Box>
  );
};
export default FloatingNavigationLink;
