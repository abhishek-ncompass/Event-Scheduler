import React, { useEffect, useState } from "react";
import { Calendar } from "rsuite";
import { useToaster, Message } from "rsuite";
import io from "socket.io-client";
import renderCell from "../Components/Calendar/RenderCell";
import ShowEventModal from "../Components/Calendar/ShowEventModal";
import useEventHandlers from "../Hooks/useEventHandlers";
import "rsuite/dist/rsuite.min.css";
import "../styles/CalenderPage.css";

const socket = io.connect(import.meta.env.SOCKET_URL);
function CalendarPage() {
  const [events, setEvents] = useState([]);
  const [error, setError] = useState(null);
  const [modalTitle, setModalTitle] = useState("");
  const [open, setOpen] = useState(false);
  const [selectedDayEvents, setSelectedDayEvents] = useState([]);
  const { handleOpen, handleClose } = useEventHandlers(events, setSelectedDayEvents, setOpen, setModalTitle);
  
  const toaster = useToaster();
  const handleNewEvent = (eventData) => {
    console.log("baosdknfsadf")
    const newEvent = {
      ...eventData,
      start: new Date(eventData.start),
      end: new Date(eventData.end),
    };
    console.log('new Events: -----', newEvent)
    
    useSocketEvents(email);
    // Update the events state to include the new event
    setEvents((prevEvents) => [...prevEvents, newEvent]);
  };

  const fetchEvents = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(import.meta.env.VITE_GET_EVENTS, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      const parsedEvents = data.data.map((event) => ({
        ...event,
        start: new Date(event.startDateTime),
        end: new Date(event.endDateTime),
      }));
      setEvents(parsedEvents);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    // const fetchEvents = async () => {
    //   try {
    //     const token = localStorage.getItem("token");
    //     const response = await fetch(import.meta.env.VITE_GET_EVENTS, {
    //       headers: { Authorization: `Bearer ${token}` },
    //     });
    //     const data = await response.json();
    //     // console.log("data.....data.....", data.data)
    //     const parsedEvents = data.data.map((event) => ({
    //       ...event,
    //       start: new Date(event.startDateTime),
    //       end: new Date(event.endDateTime),
    //     }));
    //     // console.log("Holaaaaa",parsedEvents)
    //     setEvents(parsedEvents);
    //     // console.log("evennnnnnnnnts",events)
    //   } catch (err) {
    //     setError(err.message);
    //   }
    // };

    fetchEvents();
    console.log('after fetch', events)
    // const handleNewEvent = (eventData) => {
    //   const newEvent = {
    //     ...eventData,
    //     start: new Date(eventData.start),
    //     end: new Date(eventData.end),
    //   };
    //   console.log('new Events: -----', newEvent)
      
    //   useSocketEvents(email);
    //   // Update the events state to include the new event
    //   setEvents((prevEvents) => [...prevEvents, newEvent]);
    // };
    socket.on("event_invitation", handleNewEvent);
    socket.on("new_event", handleNewEvent)
    return () => {
      socket.off("event_invitation", handleNewEvent);
    };
  }, []);

  useEffect(()=>{
    socket.on("new_event", handleNewEvent)
    fetchEvents();
  },[events, setEvents])
  return (
    <div className="calendar-container">
      <Calendar
        className="inside-calendar"
        bordered
        renderCell={(date) => renderCell(events, date)}
        onSelect={handleOpen}
      />
      <ShowEventModal
        open={open}
        onClose={handleClose}
        modalTitle={modalTitle}
        selectedDayEvents={selectedDayEvents}
      />
    </div>
  );
}

export default CalendarPage;