import React, { useEffect, useState } from 'react';
import { Select, Td, Th, Tr } from '@chakra-ui/react';
import { fetchEvent } from 'utils/root/sparql';
import { SelectObject } from 'components/root/SelectObject';
import { PREFIXES } from 'utils/common/sparql';

type EventActionType = { action: string; startFrame: number };

type SelectActionProps = {
  selectedActivity: string;
  selectedScene: string;
  selectedCamera: string;
  selectedMedia: string;
  setFrame: (frame: number, media: string) => void;
};

export function SelectAction({
  selectedActivity,
  selectedScene,
  selectedCamera,
  selectedMedia,
  setFrame,
}: SelectActionProps): React.ReactElement {
  const [eventList, setEventList] = useState<Map<string, EventActionType>>(
    new Map<string, EventActionType>()
  );
  const [selectedEvent, setSelectedEvent] = useState<string>('');

  useEffect(() => {
    (async () => {
      const map: Map<string, EventActionType> = new Map<
        string,
        EventActionType
      >();
      const data = await fetchEvent(
        selectedActivity,
        selectedScene,
        selectedCamera
      );
      data.forEach((value) => {
        const event = value.event.value
          .replace(PREFIXES.ex, '')
          .replace(`_${selectedActivity}_${selectedScene}`, '');
        const action = value.action.value
          .replace(PREFIXES.vh2kg, '')
          .replace(`action/`, '');
        const startFrame = Number(value.startFrame.value);
        map.set(event, { action, startFrame });
      });
      setEventList(map);
    })();
  }, [selectedActivity, selectedScene, selectedCamera]);

  useEffect(() => {
    setSelectedEvent('');
  }, [selectedActivity, selectedScene]);

  return (
    <>
      <Tr>
        <Th width={60} fontSize="large">
          Event
        </Th>
        <Td>
          <Select
            placeholder="select"
            value={selectedEvent}
            onChange={(e) => {
              const event = e.target.value;
              setSelectedEvent(event);
              const action = eventList.get(event);
              if (action !== undefined) {
                setFrame(action.startFrame, selectedMedia);
              }
            }}
          >
            {[...eventList.keys()].map((event) => (
              <option key={event} value={event}>
                {event} ({eventList.get(event)?.action})
              </option>
            ))}
          </Select>
        </Td>
      </Tr>
      <SelectObject
        selectedActivity={selectedActivity}
        selectedScene={selectedScene}
        selectedCamera={selectedCamera}
        selectedMedia={selectedMedia}
        selectedEvent={selectedEvent}
        startFrameForAction={eventList.get(selectedEvent)?.startFrame || 0}
        setFrame={setFrame}
      />
    </>
  );
}
