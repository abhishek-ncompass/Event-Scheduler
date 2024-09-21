import React, { useEffect, useState } from "react";
import {
  Calendar,
  Whisper,
  Popover,
  Badge,
  Modal,
  Button,
  DateRangePicker,
} from "rsuite";
import "rsuite/dist/rsuite.min.css";
import io from "socket.io-client";

const socket = io.connect("http://localhost:3005");

function CalendarComponent() {
  const [events, setEvents] = useState([]);
  const [error, setError] = useState(null);
  const [modalTitle, setModalTitle] = useState("");
  const [open, setOpen] = useState(false);
  const [selectedDayEvents, setSelectedDayEvents] = useState([]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("http://localhost:3000/event", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();

        const parsedEvents = data.map(event => ({
          ...event,
          start: new Date(event.startDateTime),
          end: new Date(event.endDateTime),
        }));
        setEvents(parsedEvents);
      } catch (err) {
        setError(err.message);
      }
    };
    fetchEvents();
  }, []);

  useEffect(() => {
    socket.on("new_event", (eventData) => {
      const newEvent = {
        ...eventData,
        start: new Date(eventData.startDateTime),
        end: new Date(eventData.endDateTime),
      };
      setEvents((prevEvents) => [...prevEvents, newEvent]);
    });

    return () => {
      socket.off("new_event");
    };
  }, []);

  function renderCell(date) {
    const list = events.filter(event => {
      const eventStartDate = event.start.toDateString();
      const eventEndDate = event.end.toDateString();
      const selectedDate = date.toDateString();
      return selectedDate >= eventStartDate && selectedDate <= eventEndDate;
    });
    const displayList = list.slice(0, 1);
    const moreCount = list.length - displayList.length;
    if (list.length) {
      const moreItem = (
        <div >
          <Whisper
            placement="top"
            trigger="click"
            speaker={
              <Popover>
                {list.slice(1).map((item, index) => (
                  <p key={index}>
                    <b>{item.start.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</b> - {item.title}
                  </p>
                ))}
              </Popover>
            }
          >
            <a>{moreCount} more</a>
          </Whisper>
        </div>
      );
      return (
        <ul className="calendar-todo-list">
          {displayList.map((item, index) => (
            <div key={index}>
              <Badge color="blue" /> <b>{item.start.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</b> - {item.title}
              </div>
          ))}
          {moreCount ? moreItem : null}
        </ul>
      );
    }
    return null;
  }

  const handleOpen = (date) => {
    const dayEvents = events.filter(event => 
      event.start.toDateString() === date.toDateString()
    );
    setSelectedDayEvents(dayEvents);
    setOpen(true);
    setModalTitle(`Events for ${date.toLocaleDateString()}`);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div className="calendar-container">
      <Calendar bordered renderCell={renderCell} onSelect={handleOpen}/>
      <Modal open={open} onClose={handleClose} size="md">
        <Modal.Header>
          <Modal.Title>{modalTitle}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedDayEvents.length > 0 ? (
            selectedDayEvents.map((event, index) => (
              <div key={index} style={{marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '10px'}}>
                <h4>{event.title}</h4>
                <p><strong>Description:</strong> {event.description}</p>
                <p><strong>Start:</strong> {new Date(event.startDateTime).toLocaleString()}</p>
                <p><strong>End:</strong> {new Date(event.endDateTime).toLocaleString()}</p>
                <p><strong>Created By:</strong> {event?.createdBy?.firstname} ({event.createdBy.email})</p>
              </div>
            ))
          ) : (
            <p>No events scheduled for this day.</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={handleClose} appearance="primary">
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default CalendarComponent;