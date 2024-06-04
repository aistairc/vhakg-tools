PREFIX_EX = "http://kgrc4si.home.kg/virtualhome2kg/instance/"
PREFIX_VH2KG = "http://kgrc4si.home.kg/virtualhome2kg/ontology/"
ENDPOINT = "http://localhost:7200/repositories/kgrc4si"


def get_all_frames(activity, scene, camera):
    print("Searching for all frames...")
    from SPARQLWrapper import SPARQLWrapper, JSON
    frame_list = {}

    query = """
PREFIX ex: <http://kgrc4si.home.kg/virtualhome2kg/instance/>
PREFIX vh2kg: <http://kgrc4si.home.kg/virtualhome2kg/ontology/>
PREFIX mssn: <http://mssn.sigappfr.org/mssn/>
select DISTINCT ?segment ?start_frame ?end_frame where {
    ex:""" + activity + "_" + scene + "_" + camera + """ mssn:hasMediaSegment ?segment.
    ?segment vh2kg:hasStartFrame ?start_frame ;
             vh2kg:hasEndFrame ?end_frame .
}
    """
    sparql = SPARQLWrapper(ENDPOINT)
    sparql.setQuery(query)
    sparql.setReturnFormat(JSON)
    results = sparql.query().convert()

    bindings = results["results"]["bindings"]
    for result in bindings:
        segment = result["segment"]["value"].replace(PREFIX_EX, "")
        frame_list[segment] = {'start_frame': int(result["start_frame"]["value"]), 'end_frame': int(result["end_frame"]["value"])}

    return frame_list


def get_frames_from_action(activity, scene, camera, action):
    print("Searching for frames from event...")
    from SPARQLWrapper import SPARQLWrapper, JSON
    frame_list = {}

    query = """
PREFIX ex: <http://kgrc4si.home.kg/virtualhome2kg/instance/>
PREFIX vh2kg: <http://kgrc4si.home.kg/virtualhome2kg/ontology/>
PREFIX mssn: <http://mssn.sigappfr.org/mssn/>
select DISTINCT ?segment ?start_frame ?end_frame where {
    ex:""" + activity + "_" + scene + "_" + camera + """ mssn:hasMediaSegment ?segment.
    ?segment vh2kg:isVideoSegmentOf ?event ;
             vh2kg:hasStartFrame ?start_frame ;
             vh2kg:hasEndFrame ?end_frame .
    ?event vh2kg:action ?action .
    filter (regex(str(?action), '""" + action + """'))
}
    """
    sparql = SPARQLWrapper(ENDPOINT)
    sparql.setQuery(query)
    sparql.setReturnFormat(JSON)
    results = sparql.query().convert()

    bindings = results["results"]["bindings"]
    for result in bindings:
        segment = result["segment"]["value"].replace(PREFIX_EX, "")
        frame_list[segment] = {'start_frame': int(result["start_frame"]["value"]), 'end_frame': int(result["end_frame"]["value"])}

    return frame_list


def get_frames_from_object(activity, scene, camera, action, object):
    print("Searching for frames from object...")
    from SPARQLWrapper import SPARQLWrapper, JSON
    frame_list = {}

    query = """
PREFIX ex: <http://kgrc4si.home.kg/virtualhome2kg/instance/>
PREFIX vh2kg: <http://kgrc4si.home.kg/virtualhome2kg/ontology/>
PREFIX mssn: <http://mssn.sigappfr.org/mssn/>
select DISTINCT ?segment ?frame_number where {
    ex:""" + activity + "_" + scene + "_" + camera + """ mssn:hasMediaSegment ?segment.
    ?segment mssn:hasMediaDescriptor ?descriptor .
    ?descriptor mssn:hasMediaDescriptor ?descriptor_object ;
                     vh2kg:frameNumber ?frame_number .
    ?descriptor_object vh2kg:is2DbboxOf ex:""" + object + "_" + scene + """ .
    """
    if action is not None:
        query += """
    ?event vh2kg:action ?action .
    filter (regex(str(?action), '""" + action + """'))
        """
    query += "} order by asc(?frame_number)"

    sparql = SPARQLWrapper(ENDPOINT)
    sparql.setQuery(query)
    sparql.setReturnFormat(JSON)
    results = sparql.query().convert()

    bindings = results["results"]["bindings"]
    frames = {}

    for result in bindings:
        segment = result["segment"]["value"].replace(PREFIX_EX, "")
        frame_number = int(result["frame_number"]["value"])
        if segment not in frames:
            frames[segment] = [frame_number]
        else:
            frames[segment].append(frame_number)

    for segment in frames:
        frame_list[segment] = {'start_frame': min(frames[segment]), 'end_frame': max(frames[segment])}

    return frame_list


def get_video(activity, scene, camera):
    print("Getting video...")
    from SPARQLWrapper import SPARQLWrapper, JSON

    query = """
PREFIX ex: <http://kgrc4si.home.kg/virtualhome2kg/instance/>
PREFIX vh2kg: <http://kgrc4si.home.kg/virtualhome2kg/ontology/>
select DISTINCT ?frame_rate ?video where {
    ex:""" + activity + "_" + scene + "_" + camera + """ vh2kg:frameRate ?frame_rate ;
                                                         vh2kg:video ?video .
}
    """
    sparql = SPARQLWrapper(ENDPOINT)
    sparql.setQuery(query)
    sparql.setReturnFormat(JSON)
    results = sparql.query().convert()

    return results


def get_images(segment, start_frame, end_frame):
    print("Getting images...")
    import base64
    import cv2
    import numpy
    from SPARQLWrapper import SPARQLWrapper, JSON
    image_dict = {}

    query = """
PREFIX ex: <http://kgrc4si.home.kg/virtualhome2kg/instance/>
PREFIX vh2kg: <http://kgrc4si.home.kg/virtualhome2kg/ontology/>
PREFIX mssn: <http://mssn.sigappfr.org/mssn/>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
select DISTINCT ?descriptor ?frame_number ?split_width ?image_id ?image where {
    ex:""" + segment + """ mssn:hasMediaDescriptor ?descriptor .
    ?descriptor vh2kg:frameNumber ?frame_number ;
                vh2kg:splitWidth ?split_width ;
                vh2kg:image ?split_image .
    ?split_image vh2kg:splitImageID ?image_id ;
                rdf:value ?image .
"""
    if start_frame is not None:
        query += "filter (?frame_number >= " + str(start_frame) + ")"
    if end_frame is not None:
        query += "filter (?frame_number <= " + str(end_frame) + ")"

    query += "} order by asc(?frame_number) asc(?image_id)"

    sparql = SPARQLWrapper(ENDPOINT)
    sparql.setQuery(query)
    sparql.setReturnFormat(JSON)
    results = sparql.query().convert()

    bindings = results["results"]["bindings"]
    for result in bindings:
        frame_number = int(result["frame_number"]["value"])
        if frame_number < start_frame or end_frame < frame_number:
            continue

        descriptor = result["descriptor"]["value"].replace(PREFIX_EX, "")
        split_width = int(result["split_width"]["value"])
        image_id = result["image_id"]["value"]
        base64_data = result["image"]["value"]
        if descriptor not in image_dict:
            image_dict[descriptor] = {'split_width': split_width, 'frame_number': frame_number, 'images': {}}
        img_raw = numpy.frombuffer(base64.b64decode(base64_data), numpy.uint8)
        image = cv2.imdecode(img_raw, cv2.IMREAD_UNCHANGED)
        image_dict[descriptor]['images'][image_id] = image

    for descriptor in image_dict:
        image_dict[descriptor]['images'] = dict(sorted(image_dict[descriptor]['images'].items(), key=lambda item: int(item[0])))

    return image_dict


def get_annotation_2d_bbox(scene, frame_list):
    print("Getting annotation 2D bbox...")
    from SPARQLWrapper import SPARQLWrapper, JSON
    annotation_list = []

    for segment in frame_list:
        if segment == 'all':
            continue

        start_frame = frame_list[segment]['start_frame']
        end_frame = frame_list[segment]['end_frame']
        query = """
PREFIX ex: <http://kgrc4si.home.kg/virtualhome2kg/instance/>
PREFIX vh2kg: <http://kgrc4si.home.kg/virtualhome2kg/ontology/>
PREFIX mssn: <http://mssn.sigappfr.org/mssn/>
select DISTINCT ?frame_number ?object ?2dbbox  where {
    ex:""" + segment + """ mssn:hasMediaDescriptor ?descriptor .
    ?descriptor mssn:hasMediaDescriptor ?descriptor_object ;
                     vh2kg:frameNumber ?frame_number .
    ?descriptor_object vh2kg:bbox-2d-value ?2dbbox ;
                       vh2kg:is2DbboxOf ?object .
"""
        if start_frame is not None:
            query += "filter (?frame_number >= " + str(start_frame) + ")"
        if end_frame is not None:
            query += "filter (?frame_number <= " + str(end_frame) + ")"

        query += "} order by asc(?frame_number)"

        sparql = SPARQLWrapper(ENDPOINT)
        sparql.setQuery(query)
        sparql.setReturnFormat(JSON)
        results = sparql.query().convert()

        bindings = results["results"]["bindings"]
        for result in bindings:
            frame_number = result["frame_number"]["value"]
            object = result["object"]["value"].replace(PREFIX_EX, "").replace("_" + scene, "")
            bbox = result["2dbbox"]["value"]
            annotation_list.append({'frame_number': frame_number, 'object': object, '2dbbox': bbox})

    return annotation_list


def get_annotation_action(scene, frame_list):
    print("Getting annotation action...")
    from SPARQLWrapper import SPARQLWrapper, JSON
    annotation_list = []

    for segment in frame_list:
        if segment == 'all':
            continue

        start_frame = frame_list[segment]['start_frame']
        end_frame = frame_list[segment]['end_frame']
        query = """
PREFIX ex: <http://kgrc4si.home.kg/virtualhome2kg/instance/>
PREFIX vh2kg: <http://kgrc4si.home.kg/virtualhome2kg/ontology/>
PREFIX mssn: <http://mssn.sigappfr.org/mssn/>
select DISTINCT ?action ?main_object ?target_object  where {
    ex:""" + segment + """ vh2kg:isVideoSegmentOf ?event .
    ?event vh2kg:action ?action ;
           vh2kg:mainObject ?main_object .
    OPTIONAL{?event vh2kg:targetObject ?target_object} .
}
"""

        sparql = SPARQLWrapper(ENDPOINT)
        sparql.setQuery(query)
        sparql.setReturnFormat(JSON)
        results = sparql.query().convert()

        bindings = results["results"]["bindings"]
        for result in bindings:
            action = result["action"]["value"].replace(PREFIX_VH2KG, "").replace("action/", " ")
            main_object = result["main_object"]["value"].replace(PREFIX_EX, "").replace("_" + scene, "")
            target_object = result["target_object"]["value"].replace(PREFIX_EX, "").replace("_" + scene, "") if "target_object" in result else ''
            annotation_list.append({'action': action, 'main_object': main_object, 'target_object': target_object, 'start_frame': start_frame, 'end_frame': end_frame})

    return annotation_list
