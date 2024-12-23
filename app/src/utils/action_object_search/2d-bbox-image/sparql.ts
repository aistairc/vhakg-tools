import { NamedNode } from 'rdf-js';
import { makeClient } from 'utils/common/sparql';

export type FrameQueryType = {
  frame: NamedNode;
};
export const fetchFrameByCamera: (
  cameraIri: string,
  mainObject: string,
  targetObject: string
) => Promise<FrameQueryType[]> = async (
  cameraIri,
  mainObject,
  targetObject
) => {
  const isTargetObjectSpecified = targetObject !== '';
  const query = `
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX mssn: <http://mssn.sigappfr.org/mssn/>
    PREFIX vh2kg: <http://kgrc4si.home.kg/virtualhome2kg/ontology/>
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>

    SELECT DISTINCT ?frame WHERE { 
      BIND (<${cameraIri}> AS ?camera) .
      BIND ("${mainObject}" AS ?mainObjectName) .
      ${isTargetObjectSpecified ? `BIND ("${targetObject}" AS ?targetObjectName) .` : ''}
      
      ?scene vh2kg:hasVideo ?camera .
      ?scene vh2kg:hasEvent ?event .
      ?event vh2kg:mainObject ?mainObject .
      ${isTargetObjectSpecified ? '?event vh2kg:targetObject ?targetObject .' : ''}
      
      ?camera mssn:hasMediaSegment ?videoSegment .
      ?videoSegment mssn:hasMediaDescriptor ?frame .
      ?frame mssn:hasMediaDescriptor ?object .
      ${
        isTargetObjectSpecified
          ? `{{?object vh2kg:is2DbboxOf ?mainObject} UNION {?object vh2kg:is2DbboxOf ?targetObject}} .`
          : `?object vh2kg:is2DbboxOf ?mainObject .`
      }
      
      ?mainObject rdfs:label ?mainObjectLabel .
      ${isTargetObjectSpecified ? `?targetObject rdfs:label ?targetObjectLabel .` : ''}
      FILTER regex(?mainObjectLabel, ?mainObjectName, "i") .
      ${isTargetObjectSpecified ? `FILTER regex(?targetObjectLabel, ?targetObjectName, "i") . ` : ''}
    } ORDER BY asc(?frame)
  `;
  const result = (await makeClient().query.select(query)) as FrameQueryType[];
  return result;
};

export const fetchFrameByVideoSegment: (
  videoSegmentIri: string,
  mainObject: string,
  targetObject: string
) => Promise<FrameQueryType[]> = async (
  videoSegmentIri,
  mainObject,
  targetObject
) => {
  const isTargetObjectSpecified = targetObject !== '';
  const query = `
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX mssn: <http://mssn.sigappfr.org/mssn/>
    PREFIX vh2kg: <http://kgrc4si.home.kg/virtualhome2kg/ontology/>
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>

    SELECT DISTINCT ?frame WHERE { 
      BIND (<${videoSegmentIri}> AS ?videoSegment) .
      BIND ("${mainObject}" AS ?mainObjectName) .
      ${isTargetObjectSpecified ? `BIND ("${targetObject}" AS ?targetObjectName) .` : ''}
      
      ?scene vh2kg:hasVideo ?camera .
      ?scene vh2kg:hasEvent ?event .
      ?event vh2kg:mainObject ?mainObject .
      ${isTargetObjectSpecified ? '?event vh2kg:targetObject ?targetObject .' : ''}
      
      ?camera mssn:hasMediaSegment ?videoSegment .
      ?videoSegment mssn:hasMediaDescriptor ?frame .
      ?frame mssn:hasMediaDescriptor ?object .
      ${
        isTargetObjectSpecified
          ? `{{?object vh2kg:is2DbboxOf ?mainObject} UNION {?object vh2kg:is2DbboxOf ?targetObject}} .`
          : `?object vh2kg:is2DbboxOf ?mainObject .`
      }
      
      ?mainObject rdfs:label ?mainObjectLabel .
      ${isTargetObjectSpecified ? `?targetObject rdfs:label ?targetObjectLabel .` : ''}
      FILTER regex(?mainObjectLabel, ?mainObjectName, "i") .
      ${isTargetObjectSpecified ? `FILTER regex(?targetObjectLabel, ?targetObjectName, "i") .` : ''}
    } ORDER BY asc(?frame)
  `;
  const result = (await makeClient().query.select(query)) as FrameQueryType[];
  return result;
};

export type ImageQueryType = {
  base64SplitImage: NamedNode;
  splitImageId: NamedNode;
  resolution: NamedNode;
  splitWidth: NamedNode;
  splitHeight: NamedNode;
};
export const fetchImage: (
  frameIri: string
) => Promise<ImageQueryType[]> = async (frameIri) => {
  const query = `
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX mssn: <http://mssn.sigappfr.org/mssn/>
    PREFIX vh2kg: <http://kgrc4si.home.kg/virtualhome2kg/ontology/>
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>

    SELECT DISTINCT ?base64SplitImage ?splitImageId ?resolution ?splitWidth ?splitHeight WHERE { 
        BIND (<${frameIri}> AS ?frame) .
        ?videoSegment mssn:hasMediaDescriptor ?frame .
        ?camera mssn:hasMediaSegment ?videoSegment ;
                vh2kg:hasResolution ?resolution .
        ?frame vh2kg:image ?splitImage ;
               vh2kg:splitWidth ?splitWidth ;
               vh2kg:splitHeight ?splitHeight .
        ?splitImage vh2kg:splitImageID ?splitImageId ;
                    rdf:value ?base64SplitImage .
    } ORDER BY asc(?splitImageId)
  `;
  const result = (await makeClient().query.select(query)) as ImageQueryType[];
  return result;
};

export type BoundingBoxQueryType = {
  label: NamedNode;
  boundingBoxValue: NamedNode;
};
export const fetchBoundingBox: (
  frameIri: string,
  mainObject: string,
  targetObject: string
) => Promise<BoundingBoxQueryType[]> = async (
  frameIri,
  mainObject,
  targetObject
) => {
  const isTargetObjectSpecified = targetObject !== '';
  const query = `
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX mssn: <http://mssn.sigappfr.org/mssn/>
    PREFIX vh2kg: <http://kgrc4si.home.kg/virtualhome2kg/ontology/>
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>

    SELECT DISTINCT ?label ?boundingBoxValue WHERE { 
      BIND (<${frameIri}> AS ?frame) .
      BIND ("${mainObject}" AS ?mainObjectName) .
      BIND ("${targetObject}" AS ?targetObjectName) .
      
      ?scene vh2kg:hasVideo ?camera .
      ?scene vh2kg:hasEvent ?event .
      ?event vh2kg:mainObject ?mainObject .
      ${isTargetObjectSpecified ? `?event vh2kg:targetObject ?targetObject .` : ''}
      
      ?camera mssn:hasMediaSegment ?videoSegment .
      ?videoSegment mssn:hasMediaDescriptor ?frame .
      ?frame mssn:hasMediaDescriptor ?object .
      
      ${
        isTargetObjectSpecified
          ? `{
               ?object vh2kg:is2DbboxOf ?mainObject .
             }
             UNION
             {
               ?object vh2kg:is2DbboxOf ?targetObject .
             }`
          : `?object vh2kg:is2DbboxOf ?mainObject .`
      }
      
      ?object vh2kg:bbox-2d-value ?boundingBoxValue ;
              rdfs:label ?label .
      
      ?mainObject rdfs:label ?mainObjectLabel .
      ${isTargetObjectSpecified ? `?targetObject rdfs:label ?targetObjectLabel .` : ''}
      FILTER regex(?mainObjectLabel, ?mainObjectName, "i") .
      ${isTargetObjectSpecified ? `FILTER regex(?targetObjectLabel, ?targetObjectName, "i") .` : ''}
    } 
  `;
  const result = (await makeClient().query.select(
    query
  )) as BoundingBoxQueryType[];
  return result;
};

export type VideoQueryType = {
  base64Video: NamedNode;
  resolution: NamedNode;
  frameRate: NamedNode;
  originalFrameRate: NamedNode;
};
export const fetchVideoByCamera: (
  cameraIri: string
) => Promise<VideoQueryType | null> = async (cameraIri) => {
  const query = `
    PREFIX vh2kg: <http://kgrc4si.home.kg/virtualhome2kg/ontology/>

    SELECT DISTINCT ?base64Video ?resolution ?frameRate ?originalFrameRate WHERE { 
      BIND (<${cameraIri}> AS ?camera) .

      ?camera vh2kg:video ?base64Video ;
              vh2kg:hasResolution ?resolution ;
              vh2kg:frameRate ?frameRate ;
              vh2kg:originalFrameRate ?originalFrameRate .
    }
  `;
  const result = (await makeClient().query.select(query)) as VideoQueryType[];
  return result.pop() || null;
};

export const fetchVideoByVideoSegment: (
  videoSegmentIri: string
) => Promise<VideoQueryType | null> = async (videoSegmentIri) => {
  const query = `
    PREFIX mssn: <http://mssn.sigappfr.org/mssn/>
    PREFIX vh2kg: <http://kgrc4si.home.kg/virtualhome2kg/ontology/>

    SELECT DISTINCT ?base64Video ?resolution ?frameRate ?originalFrameRate WHERE { 
      BIND (<${videoSegmentIri}> AS ?videoSegment) .

      ?camera mssn:hasMediaSegment ?videoSegment ;
              vh2kg:video ?base64Video ;
              vh2kg:hasResolution ?resolution ;
              vh2kg:frameRate ?frameRate ;
              vh2kg:originalFrameRate ?originalFrameRate .
    }
  `;
  const result = (await makeClient().query.select(query)) as VideoQueryType[];
  return result.pop() || null;
};
