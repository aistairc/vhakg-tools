export const TOTAL_VIDEOS_PER_PAGE = 9;
export const TOTAL_IMAGES_PER_PAGE = 1;

export type SearchParamObjectKey = 'mainObject' | 'targetObject';
export type SearchParamKey =
  | 'action'
  | 'videoDuration'
  | 'searchResultPage'
  | 'scene'
  | 'camera'
  | SearchParamObjectKey
  | 'isVideoSegment'
  | 'iri'
  | 'imageViewerPage';
export const ACTION_KEY: SearchParamKey = 'action';
export const MAIN_OBJECT_KEY: SearchParamKey = 'mainObject';
export const TARGET_OBJECT_KEY: SearchParamKey = 'targetObject';
export const VIDEO_DURATION_KEY: SearchParamKey = 'videoDuration';
export const SEARCH_RESULT_PAGE_KEY: SearchParamKey = 'searchResultPage';
export const SCENE_KEY: SearchParamKey = 'scene';
export const CAMERA_KEY: SearchParamKey = 'camera';
export const IRI_KEY: SearchParamKey = 'iri';
export const IMAGE_VIEWER_PAGE_KEY: SearchParamKey = 'imageViewerPage';

export const VIDEO_SEARCH_SESSION_STORAGE_KEY = 'videoSearchParams';
