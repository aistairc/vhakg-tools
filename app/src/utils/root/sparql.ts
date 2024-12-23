import { makeClient } from 'utils/common/sparql';
import { NamedNode } from 'rdf-js';

export type ActivityQueryType = {
  activity: NamedNode;
};
export const fetchActivity: () => Promise<ActivityQueryType[]> = async () => {
  const query = `
PREFIX vh2kg: <http://kgrc4si.home.kg/virtualhome2kg/ontology/>
select DISTINCT ?activity where {
    ?activity vh2kg:hasVideo ?camera .
    filter (regex(str(?camera), "camera0"))
} order by asc(?activity)
  `;
  const result = (await makeClient().query.select(
    query
  )) as ActivityQueryType[];
  return result;
};

export type CameraQueryType = {
  camera: NamedNode;
};
export const fetchCamera: (
  activity: string,
  scene: string
) => Promise<CameraQueryType[]> = async (activity, scene) => {
  if (!activity || !scene) return Promise.resolve([]);

  const query = `
PREFIX vh2kg: <http://kgrc4si.home.kg/virtualhome2kg/ontology/>
PREFIX ex: <http://kgrc4si.home.kg/virtualhome2kg/instance/>
select DISTINCT ?camera where {
    ex:${activity}_${scene} vh2kg:hasVideo ?camera .
} order by asc(?camera)
  `;
  const result = (await makeClient().query.select(query)) as CameraQueryType[];
  return result;
};

export type EventQueryType = {
  event: NamedNode;
  action: NamedNode;
  startFrame: NamedNode;
};
export const fetchEvent: (
  activity: string,
  scene: string,
  camera: string
) => Promise<EventQueryType[]> = async (activity, scene, camera) => {
  if (!activity || !scene || !camera) return Promise.resolve([]);

  const query = `
PREFIX vh2kg: <http://kgrc4si.home.kg/virtualhome2kg/ontology/>
PREFIX ex: <http://kgrc4si.home.kg/virtualhome2kg/instance/>
PREFIX mssn: <http://mssn.sigappfr.org/mssn/>
select DISTINCT ?event ?startFrame ?action where {
    ex:${activity}_${scene}_${camera} mssn:hasMediaSegment ?segment .
    ?segment vh2kg:isVideoSegmentOf ?event ;
            vh2kg:hasStartFrame ?startFrame .
    ?event vh2kg:action ?action .
}order by asc(?startFrame)
  `;
  const result = (await makeClient().query.select(query)) as EventQueryType[];
  return result;
};

export type ObjectQueryType = {
  object: NamedNode;
};
export const fetchObject: (
  activity: string,
  scene: string,
  camera: string,
  event: string
) => Promise<ObjectQueryType[]> = async (activity, scene, camera, event) => {
  if (!activity || !scene || !camera) return Promise.resolve([]);

  let query = '';

  if (event) {
    query = `
PREFIX ex: <http://kgrc4si.home.kg/virtualhome2kg/instance/>
PREFIX mssn: <http://mssn.sigappfr.org/mssn/>
PREFIX vh2kg: <http://kgrc4si.home.kg/virtualhome2kg/ontology/>
select DISTINCT ?object where {
    ex:${activity}_${scene}_${camera} mssn:hasMediaSegment ?segment .
    ?segment vh2kg:isVideoSegmentOf ex:${event}_${activity}_${scene} ;
             mssn:hasMediaDescriptor ?descriptorFrame .
    ?descriptorFrame mssn:hasMediaDescriptor ?descriptor .
    ?descriptor vh2kg:is2DbboxOf ?object .
}order by asc(?object)
    `;
  } else {
    query = `
PREFIX ex: <http://kgrc4si.home.kg/virtualhome2kg/instance/>
PREFIX mssn: <http://mssn.sigappfr.org/mssn/>
PREFIX vh2kg: <http://kgrc4si.home.kg/virtualhome2kg/ontology/>
select DISTINCT ?object where {
    ex:${activity}_${scene}_${camera} mssn:hasMediaSegment ?segment .
    ?segment mssn:hasMediaDescriptor ?descriptorFrame .
    ?descriptorFrame mssn:hasMediaDescriptor ?descriptor .
    ?descriptor vh2kg:is2DbboxOf ?object .
}order by asc(?object)
  `;
  }
  const result = (await makeClient().query.select(query)) as ObjectQueryType[];
  return result;
};

export type StartFrameOfObjectQueryType = {
  startFrame: NamedNode;
};
export const fetchStartFrameOfObject: (
  activity: string,
  scene: string,
  camera: string,
  event: string,
  object: string
) => Promise<StartFrameOfObjectQueryType[]> = async (
  activity,
  scene,
  camera,
  event,
  object
) => {
  if (!activity || !scene || !camera || !object) return Promise.resolve([]);

  let query = '';

  if (event) {
    query = `
PREFIX ex: <http://kgrc4si.home.kg/virtualhome2kg/instance/>
PREFIX mssn: <http://mssn.sigappfr.org/mssn/>
PREFIX vh2kg: <http://kgrc4si.home.kg/virtualhome2kg/ontology/>
select DISTINCT ?startFrame where {
    ex:${activity}_${scene}_${camera} mssn:hasMediaSegment ?segment .
    ?segment vh2kg:isVideoSegmentOf ex:${event}_${activity}_${scene} ;
             mssn:hasMediaDescriptor ?startFrame .
    ?startFrame mssn:hasMediaDescriptor ?imageFrame .
    ?imageFrame vh2kg:is2DbboxOf ex:${object}_${scene} .
}order by asc(?imageFrame) limit 1
    `;
  } else {
    query = `
PREFIX ex: <http://kgrc4si.home.kg/virtualhome2kg/instance/>
PREFIX mssn: <http://mssn.sigappfr.org/mssn/>
PREFIX vh2kg: <http://kgrc4si.home.kg/virtualhome2kg/ontology/>
select DISTINCT ?startFrame where {
    ex:${activity}_${scene}_${camera} mssn:hasMediaSegment ?segment .
    ?segment mssn:hasMediaDescriptor ?startFrame .
    ?startFrame mssn:hasMediaDescriptor ?imageFrame .
    ?imageFrame vh2kg:is2DbboxOf ex:${object}_${scene} .
}order by asc(?imageFrame) limit 1
  `;
  }
  const result = (await makeClient().query.select(
    query
  )) as StartFrameOfObjectQueryType[];
  return result;
};

export type VideoQueryType = {
  frameRate: NamedNode;
  video: NamedNode;
};
export const fetchVideo: (
  activity: string,
  scene: string,
  camera: string
) => Promise<VideoQueryType[]> = async (activity, scene, camera) => {
  const query = `
PREFIX ex: <http://kgrc4si.home.kg/virtualhome2kg/instance/>
PREFIX vh2kg: <http://kgrc4si.home.kg/virtualhome2kg/ontology/>
select ?frameRate ?video where {
    ex:${activity}_${scene}_${camera} vh2kg:frameRate ?frameRate ;
                                      vh2kg:video ?video .
}
  `;
  const result = (await makeClient().query.select(query)) as VideoQueryType[];
  return result;
};

export type ImageQueryType = {
  image: NamedNode;
  splitWidth: NamedNode;
  resolution: NamedNode;
};
export const fetchImage: (
  activity: string,
  scene: string,
  camera: string,
  frame: number
) => Promise<ImageQueryType[]> = async (activity, scene, camera, frame) => {
  const query = `
PREFIX ex: <http://kgrc4si.home.kg/virtualhome2kg/instance/>
PREFIX vh2kg: <http://kgrc4si.home.kg/virtualhome2kg/ontology/>
PREFIX mssn: <http://mssn.sigappfr.org/mssn/>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
select ?splitWidth ?image ?resolution where {
    ex:${activity}_${scene}_${camera} mssn:hasMediaSegment ?segment ;
                                      vh2kg:hasResolution ?resolution .
    ?segment mssn:hasMediaDescriptor ?descriptor .
    ?descriptor vh2kg:frameNumber ${frame} ;
                vh2kg:splitWidth ?splitWidth ;
                vh2kg:image ?splitImage .
    ?splitImage vh2kg:splitImageID ?id ;
            rdf:value ?image .
}order by asc(?id)
  `;
  const result = (await makeClient().query.select(query)) as ImageQueryType[];
  return result;
};
