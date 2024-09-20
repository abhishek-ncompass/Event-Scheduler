import React, { useEffect, useState } from "react";
import {
  Calendar,
  Whisper,
  Popover,
  Badge,
} from "rsuite";
import "rsuite/dist/rsuite.min.css";

function CalendarComponent() {
  const [events, setEvents] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("http://localhost:3000/event", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
       
        const parsedEvents = data.map(event => {
          return {
            ...event,
            start: new Date(event.startDateTime),
            end: new Date(event.endDateTime),
          };
        });
        setEvents(parsedEvents);
      } catch (err) {
        setError(err.message);
      }
    };
    fetchEvents();
  }, []);
  

  function renderCell(date) {
    console.log(events)
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
        <li>
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
            <a >{moreCount} more</a>
          </Whisper>
        </li>
      );
      return (
        <ul className="calendar-todo-list">
          {displayList.map((item, index) => (
            <li key={index}>
              <Badge /> <b>{item.start.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</b> - {item.title}
            </li>
          ))}
          {moreCount ? moreItem : null}
        </ul>
      );
    }
    return null;
  }

  return (
    <div className="calendar-container">
      <Calendar bordered renderCell={renderCell} />
    </div>
  );
}

export default CalendarComponent;