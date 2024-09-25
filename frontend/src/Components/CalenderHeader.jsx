// CalendarHeader.js
import React, { useState } from 'react';
import { useToaster, Message } from 'rsuite';
import { useNavigate } from 'react-router-dom';
import useSocketEvents from '../Hooks/useSocketEvents';
import EventCreationModal from './Calendar/CreateEvent';
import 'rsuite/dist/rsuite.min.css';
import '../styles/CalenderHeader.css';

const CalendarHeader = () => {
  const [open, setOpen] = useState(false);
  const [datetime, setDatetime] = useState([new Date(), new Date( )]);
  const [formValue, setFormValue] = useState({
    title: '',
    description: '',
    participants: '',
  });

  const navigate = useNavigate();
  const toaster = useToaster();
  const email = localStorage.getItem('email');
  useSocketEvents(email);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/', { replace: true });
  };

  const handleOpen = () => {
    setOpen(true);
    setFormValue({ title: '', description: '', participants: '' });
  };

  const handleClose = () => {
    setOpen(false);
    setFormValue({ title: '', description: '', participants: '' });
  };

  const handleSubmit = () => {
    const startDateTime = datetime[0].toISOString().replace('T', ' ').replace('Z', '');
    const endDateTime = datetime[1].toISOString().replace('T', ' ').replace('Z', '');
    const participants = formValue.participants.split(' ');

    const eventData = {
      title: formValue.title,
      description: formValue.description,
      startDateTime,
      endDateTime,
      participants,
      createdBy: email,
    };

    fetch(import.meta.env.VITE_CREATE_EVENT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(eventData),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.statusCode === 201) {
          toaster.push(
            <Message showIcon type="success">
              {data.message}
            </Message>,
            { placement: 'topCenter', duration: 4000 }
          );
        } else {
          toaster.push(
            <Message showIcon type="error" closable>
              {data.message}
            </Message>,
            { placement: 'topCenter', duration: 4000 }
          );
        }
      })
      .catch((error) => {
        console.error(error);
        toaster.push(
          <Message showIcon type="error" closable>
            Failed to create event
          </Message>,
          { placement: 'topCenter', duration: 4000 }
        );
      });
    setOpen(false);    
  };

  return (
    <header className="calendar-header">
      <div className="calendar-header-left">
        <span className="calendar-header-title">Calendar</span>
      </div>
      <h2>Hello {email}</h2>
      <div className="calendar-header-right">
        <button className="calendar-header-button" onClick={handleOpen}>
          Create
        </button>
        <button className="calendar-header-button" onClick={handleLogout}>
          Logout
        </button>
        <EventCreationModal
          open={open}
          onClose={handleClose}
          formValue={formValue}
          setFormValue={setFormValue}
          datetime={datetime}
          setDatetime={setDatetime}
          onSubmit={handleSubmit}
        />
      </div>
    </header>
  );
};

export default CalendarHeader;