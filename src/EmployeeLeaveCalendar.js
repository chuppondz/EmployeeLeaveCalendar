// EmployeeLeaveCalendar.js
import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import Modal from 'react-modal';

const EmployeeLeaveCalendar = () => {
  const [events, setEvents] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [employeeName, setEmployeeName] = useState('');

  // Load events from LocalStorage on component mount
  useEffect(() => {
    const storedEvents = localStorage.getItem('events');
    if (storedEvents) {
      setEvents(JSON.parse(storedEvents));
    }
  }, []);

  // Save events to LocalStorage whenever they change
  useEffect(() => {
    localStorage.setItem('events', JSON.stringify(events));
  }, [events]);

  const handleDateClick = (info) => {
    setSelectedDate(info.dateStr);
    setIsModalOpen(true);
  };

  const handleAddLeave = () => {
    if (employeeName) {
      const newEvent = {
        id: Date.now().toString(),
        title: employeeName,
        start: selectedDate,
        backgroundColor: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
      };

      setEvents((prevEvents) => [...prevEvents, newEvent]);
      setEmployeeName('');
      setIsModalOpen(false);
    }
  };

  const handleDeleteLeave = (id) => {
    setEvents((prevEvents) => prevEvents.filter((event) => event.id !== id));
  };

  Modal.setAppElement('#root');

  return (
    <div>
      <h1>Employee Leave Calendar</h1>
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        events={events}
        dateClick={handleDateClick}
        eventContent={(eventInfo) => (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{eventInfo.event.title}</span>
            <button
              style={{ marginLeft: '5px', background: 'red', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' }}
              onClick={() => handleDeleteLeave(eventInfo.event.id)}
            >
              ✕
            </button>
          </div>
        )}
      />

      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        style={{
          overlay: {
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            zIndex: 1000,
          },
          content: {
            top: '50%',
            left: '50%',
            right: 'auto',
            bottom: 'auto',
            marginRight: '-50%',
            transform: 'translate(-50%, -50%)',
            width: '300px',
            borderRadius: '10px',
            zIndex: 1001,
          },
        }}
      >
        <h2>Add Employee Leave</h2>
        <p>Date: {selectedDate}</p>
        <input
          type="text"
          placeholder="Employee Name"
          value={employeeName}
          onChange={(e) => setEmployeeName(e.target.value)}
          style={{ width: '100%', marginBottom: '10px', padding: '5px', fontSize: '16px' }}
        />
        <button
          onClick={handleAddLeave}
          style={{ width: '100%', background: 'green', color: 'white', padding: '10px', border: 'none', borderRadius: '5px', cursor: 'pointer', marginBottom: '10px' }}
        >
          Add Leave
        </button>
        <button
          onClick={() => setIsModalOpen(false)}
          style={{ width: '100%', background: 'gray', color: 'white', padding: '10px', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
        >
          Cancel
        </button>
      </Modal>
    </div>
  );
};

export default EmployeeLeaveCalendar;
