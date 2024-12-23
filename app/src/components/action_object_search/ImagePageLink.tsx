import { Link } from '@chakra-ui/react';
import { Link as ReactRouterLink } from 'react-router-dom';
import {
  IRI_KEY,
  MAIN_OBJECT_KEY,
  TARGET_OBJECT_KEY,
} from 'constants/action_object_search/constants';
import React from 'react';

function splitVideoName(videoName: string) {
  const pattern = /(.+)_(scene\d+)_(camera\d+)/;
  const groups = pattern.exec(videoName)?.slice(1);
  if (!groups) {
    return videoName;
  }
  return groups.join(' ');
}

function splitVideoSegmentName(videoSegmentName: string) {
  const pattern = /(.+)_(\d+)_(scene\d+)_(video_segment\d+)/;
  const groups = pattern.exec(videoSegmentName)?.slice(1);
  if (!groups) {
    return videoSegmentName;
  }
  groups[1] = 'camera' + groups[1];
  return groups.join(' ');
}

type ImagePageLinkProps = {
  linkText: string;
  mainObject: string;
  targetObject: string;
  iri: string;
};
export function ImagePageLink({
  linkText,
  mainObject,
  targetObject,
  iri,
}: ImagePageLinkProps): React.ReactElement {
  const imageSearchParams = new URLSearchParams({
    [MAIN_OBJECT_KEY]: mainObject,
    [TARGET_OBJECT_KEY]: targetObject,
    [IRI_KEY]: iri,
  });
  const path =
    '/action-object-search/2d-bbox-image?' + imageSearchParams.toString();
  return (
    <Link as={ReactRouterLink} to={path} overflowWrap={'break-word'}>
      {linkText.includes('video_segment')
        ? splitVideoSegmentName(linkText)
        : splitVideoName(linkText)}
    </Link>
  );
}
