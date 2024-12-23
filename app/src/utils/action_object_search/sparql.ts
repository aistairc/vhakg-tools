import { NamedNode } from 'rdf-js';
import { makeClient } from 'utils/common/sparql';
import { type VideoDurationType } from 'components/action_object_search/VideoDurationRadio';

export type ActionQueryType = {
  action: NamedNode;
};
export const fetchAction: () => Promise<ActionQueryType[]> = async () => {
  const query = `
      PREFIX vh2kg: <http://kgrc4si.home.kg/virtualhome2kg/ontology/>
      select DISTINCT ?action where {
        ?action a vh2kg:Action .
      } order by asc(?action)
    `;
  const result = (await makeClient().query.select(query)) as ActionQueryType[];
  return result;
};

export type VideoQueryType = {
  camera: NamedNode;
  base64Video: NamedNode;
};
export const fetchVideo: (
  action: string,
  mainObject: string,
  targetObject: string,
  scene: string,
  camera: string,
  limit: number,
  page: number
) => Promise<VideoQueryType[]> = async (
  action,
  mainObject,
  targetObject,
  scene,
  camera,
  limit,
  page
) => {
  const query = `
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX vh2kg: <http://kgrc4si.home.kg/virtualhome2kg/ontology/>
    SELECT DISTINCT ?camera ?base64Video WHERE {
      ?mainObject rdfs:label ?mainObjectLabel FILTER regex(?mainObjectLabel, "${mainObject}", "i") .
      ${
        targetObject !== ''
          ? `?targetObject rdfs:label ?targetObjectLabel FILTER regex(?targetObjectLabel, "${targetObject}", "i") .`
          : ''
      }
      ?event vh2kg:mainObject ?mainObject ;
             ${targetObject !== '' ? 'vh2kg:targetObject ?targetObject ;' : ''}
             vh2kg:action <${action}> .
      ?scene vh2kg:hasEvent ?event ;
             vh2kg:hasVideo ?camera .
      ?camera vh2kg:video ?base64Video .
      ${scene !== '' ? `FILTER regex(STR(?camera), "${scene}", "i") .` : ''}
      ${camera !== '' ? `FILTER regex(STR(?camera), "${camera}", "i") .` : ''}
    } ORDER BY asc(?camera) LIMIT ${limit} OFFSET ${limit * (page - 1)}
  `;
  const result = (await makeClient().query.select(query)) as VideoQueryType[];
  return result;
};

export type VideoSegmentQueryType = {
  videoSegment: NamedNode;
  base64Video: NamedNode;
  frameRate: NamedNode;
  startFrame: NamedNode;
  endFrame: NamedNode;
};
export const fetchVideoSegment: (
  action: string,
  mainObject: string,
  targetObject: string,
  scene: string,
  camera: string,
  limit: number,
  page: number
) => Promise<VideoSegmentQueryType[]> = async (
  action,
  mainObject,
  targetObject,
  scene,
  camera,
  limit,
  page
) => {
  const query = `
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX mssn: <http://mssn.sigappfr.org/mssn/>
    PREFIX vh2kg: <http://kgrc4si.home.kg/virtualhome2kg/ontology/>
    SELECT DISTINCT ?videoSegment ?base64Video ?frameRate ?startFrame ?endFrame WHERE {
      ?mainObject rdfs:label ?mainObjectLabel FILTER regex(?mainObjectLabel, "${mainObject}", "i") .
      ${
        targetObject !== ''
          ? `?targetObject rdfs:label ?targetObjectLabel FILTER regex(?targetObjectLabel, "${targetObject}", "i") .`
          : ''
      }
      ?event vh2kg:mainObject ?mainObject ;
             ${targetObject !== '' ? 'vh2kg:targetObject ?targetObject ;' : ''}
             vh2kg:action <${action}> ;
             vh2kg:hasVideoSegment ?videoSegment .
      ?videoSegment vh2kg:hasStartFrame ?startFrame ;
                    vh2kg:hasEndFrame ?endFrame .
      ?camera mssn:hasMediaSegment ?videoSegment ;
              vh2kg:video ?base64Video ;
              vh2kg:frameRate ?frameRate .
      ${scene !== '' ? `FILTER regex(STR(?camera), "${scene}", "i") .` : ''}
      ${camera !== '' ? `FILTER regex(STR(?camera), "${camera}", "i") .` : ''}
    } ORDER BY asc(?videoSegment) LIMIT ${limit} OFFSET ${limit * (page - 1)}`;

  const result = (await makeClient().query.select(
    query
  )) as VideoSegmentQueryType[];
  return result;
};

export type VideoCountQueryType = {
  videoCount: NamedNode;
};
export const fetchVideoCount: (
  action: string,
  mainObject: string,
  targetObject: string,
  scene: string,
  camera: string,
  videoDuration: VideoDurationType
) => Promise<number> = async (
  action,
  mainObject,
  targetObject,
  scene,
  camera,
  videoDuration
) => {
  const query = `
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX mssn: <http://mssn.sigappfr.org/mssn/>
    PREFIX vh2kg: <http://kgrc4si.home.kg/virtualhome2kg/ontology/>
    SELECT (COUNT(DISTINCT ${videoDuration === 'full' ? '?camera' : '?videoSegment'}) AS ?videoCount) WHERE {
      ?mainObject rdfs:label ?mainObjectLabel FILTER regex(?mainObjectLabel, "${mainObject}", "i") .
      ${
        targetObject !== ''
          ? `?targetObject rdfs:label ?targetObjectLabel FILTER regex(?targetObjectLabel, "${targetObject}", "i") .`
          : ''
      }
      ?event vh2kg:mainObject ?mainObject ;
             ${targetObject !== '' ? 'vh2kg:targetObject ?targetObject ;' : ''}
             ${videoDuration === 'segment' ? 'vh2kg:hasVideoSegment ?videoSegment ;' : ''}
             vh2kg:action <${action}> .
      ?activity vh2kg:hasEvent ?event ;
                vh2kg:hasVideo ?camera .
      ${videoDuration === 'segment' ? '?camera mssn:hasMediaSegment ?videoSegment .' : ''}
      ${scene !== '' ? `FILTER regex(STR(?camera), "${scene}", "i") .` : ''}
      ${camera !== '' ? `FILTER regex(STR(?camera), "${camera}", "i") .` : ''}
    }
  `;
  const result = (await makeClient().query.select(
    query
  )) as VideoCountQueryType[];
  return Number(result[0].videoCount.value);
};

export type SceneQueryType = {
  scene: NamedNode;
};
export const fetchScene: (
  action: string,
  mainObject: string,
  targetObject: string,
  camera: string
) => Promise<SceneQueryType[]> = async (
  action,
  mainObject,
  targetObject,
  camera
) => {
  const query = `
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX vh2kg: <http://kgrc4si.home.kg/virtualhome2kg/ontology/>
    SELECT DISTINCT ?scene WHERE {
      ?mainObject rdfs:label ?mainObjectLabel FILTER regex(?mainObjectLabel, "${mainObject}", "i") .
      ${
        targetObject !== ''
          ? `?targetObject rdfs:label ?targetObjectLabel FILTER regex(?targetObjectLabel, "${targetObject}", "i") .`
          : ''
      }
      ?event vh2kg:mainObject ?mainObject ;
             ${targetObject !== '' ? 'vh2kg:targetObject ?targetObject ;' : ''}
             vh2kg:action <${action}> .
      ?scene vh2kg:hasEvent ?event .
      ${camera !== '' ? `?scene vh2kg:hasVideo ?camera FILTER regex(STR(?camera), "${camera}", "i") .` : ''}
    }
  `;
  const result = (await makeClient().query.select(query)) as SceneQueryType[];
  return result;
};

export type CameraQueryType = {
  camera: NamedNode;
};
export const fetchCamera: (
  action: string,
  mainObject: string,
  targetObject: string,
  scene: string
) => Promise<CameraQueryType[]> = async (
  action,
  mainObject,
  targetObject,
  scene
) => {
  const query = `
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX vh2kg: <http://kgrc4si.home.kg/virtualhome2kg/ontology/>
    SELECT DISTINCT ?camera WHERE {
      ?mainObject rdfs:label ?mainObjectLabel FILTER regex(?mainObjectLabel, "${mainObject}", "i") .
      ${
        targetObject !== ''
          ? `?targetObject rdfs:label ?targetObjectLabel FILTER regex(?targetObjectLabel, "${targetObject}", "i") .`
          : ''
      }
      ?event vh2kg:mainObject ?mainObject ;
             ${targetObject !== '' ? 'vh2kg:targetObject ?targetObject ;' : ''}
             vh2kg:action <${action}> .
      ?scene vh2kg:hasVideo ?camera ;
             vh2kg:hasEvent ?event .
      ${scene !== '' ? `FILTER regex(STR(?camera), "${scene}", "i") .` : ''}
    }
  `;
  const result = (await makeClient().query.select(query)) as CameraQueryType[];
  return result;
};
