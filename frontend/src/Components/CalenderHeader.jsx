import React, { useEffect, useState } from "react";
import {
  Calendar,
  Whisper,
  Popover,
  Badge,
  Modal,
  Form,
  Button,
  DateRangePicker,
} from "rsuite";
import "rsuite/dist/rsuite.min.css";
import "../styles/CalenderHeader.css";
import { useNavigate } from "react-router-dom";
import io from "socket.io-client"; 

const socket = io.connect("http://localhost:3005"); 

const CalendarHeader = () => {
  const [open, setOpen] = useState(false);
  const [formValue, setFormValue] = useState({
    title: "",
    description: "",
    participants: "",
  });
  const [datetime, setDatetime] = useState([new Date(), new Date()]);
  const [modalTitle, setModalTitle] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");

  const navigate = useNavigate();
  const email = localStorage.getItem("email");

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/", { replace: true });
  };

  const handleOpen = () => {
    setOpen(true);
    setModalTitle(`New Event`);
    setFormValue({ title: "", description: "", participants: "" });
  };

  const handleClose = () => {
    setOpen(false);
    setFormValue({ title: "", description: "", participants: "" });
  };

  const handleSubmit = () => {
    const startDateTime = datetime[0].toISOString().replace("T", " ").replace("Z", "");
    const endDateTime = datetime[1].toISOString().replace("T", " ").replace("Z", "");
    setStart(startDateTime);
    setEnd(endDateTime);
    const participants = formValue.participants.split(" ");

    const eventData = {
      title: formValue.title,
      description: formValue.description,
      startDateTime,
      endDateTime,
      participants,
    };

    // Emit new_event to the server
    socket.emit("new_event", eventData);

    fetch("http://localhost:3000/event/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(eventData),
    })
      .then((response) => response.json())
      .then((data) => console.log(data))
      .catch((error) => console.error(error));
    setOpen(false);
  };

  useEffect(() => {
    socket.emit("login", email);

    socket.on("event_invitation", (eventData) => {
      // Display an alert or notification to the user
      alert(
        `You have a new event invitation!\nTitle: ${eventData.title}\nDescription: ${eventData.description}`
      );
    });

    return () => {
      socket.off("event_invitation");
    };
  }, [email]); 

  return (
    <header className="calendar-header">
      <div className="calendar-header-left">
        <span className="calendar-header-title">Calendar</span>
        <p>{start}</p>
        <p>{end}</p>
      </div>
      <h1>Hello {email}</h1>
      <div className="calendar-header-right">
        <button className="calendar-header-button" onClick={handleOpen}>
          Create
        </button>
        <button className="calendar-header-button" onClick={handleLogout}>
          Logout
        </button>
        <Modal open={open} onClose={handleClose} size="xs">
          <Modal.Header>
            <Modal.Title>{modalTitle}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form fluid onChange={setFormValue} formValue={formValue}>
              <Form.Group controlId="title">
                <Form.ControlLabel>Title</Form.ControlLabel>
                <Form.Control name="title" required />
                <Form.HelpText>Required</Form.HelpText>
              </Form.Group>
              <Form.Group controlId="description">
                <Form.ControlLabel>Description</Form.ControlLabel>
                <Form.Control name="description" />
              </Form.Group>
              <Form.Group controlId="participants">
                <Form.ControlLabel>Participants</Form.ControlLabel>
                <Form.Control name="participants" />
              </Form.Group>
              <Form.Group controlId="datetime">
                <Form.ControlLabel>Date and Time</Form.ControlLabel>
                <DateRangePicker
                  format="dd/MM/yyyy HH:mm"
                  value={datetime}
                  onChange={(value) => setDatetime(value)}
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={handleSubmit} appearance="primary">
              Confirm
            </Button>
            <Button onClick={handleClose} appearance="subtle">
              Cancel
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </header>
  );
};

export default CalendarHeader;
