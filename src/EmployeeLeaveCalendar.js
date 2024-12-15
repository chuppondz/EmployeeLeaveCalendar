import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import Modal from 'react-modal';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, deleteDoc, doc, onSnapshot } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAV4fOIcNuZr2uR0dYMXzwtRnv8ejmTvzk",
  authDomain: "employeeleavecalendar.firebaseapp.com",
  projectId: "employeeleavecalendar",
  storageBucket: "employeeleavecalendar.firebasestorage.app",
  messagingSenderId: "678292437150",
  appId: "1:678292437150:web:71c9e3964c2393ae9b638f",
  measurementId: "G-0R8EY08TL7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const EmployeeLeaveCalendar = () => {
  const [events, setEvents] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [employeeName, setEmployeeName] = useState('');
  const [employees, setEmployees] = useState([]);
  const [newEmployee, setNewEmployee] = useState('');
  const [selectedColor, setSelectedColor] = useState('#76bc55');
  const [note, setNote] = useState('');

  useEffect(() => {
    const unsubscribeEvents = onSnapshot(collection(db, 'events'), (snapshot) => {
      const fetchedEvents = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setEvents(fetchedEvents);
    });

    const unsubscribeEmployees = onSnapshot(collection(db, 'employees'), (snapshot) => {
      const fetchedEmployees = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setEmployees(fetchedEmployees);
    });

    return () => {
      unsubscribeEvents();
      unsubscribeEmployees();
    };
  }, []);

  const handleSaveLeave = async () => {
    if (employeeName.trim() && selectedDate) {
      const employee = employees.find((e) => e.name === employeeName);
      const color = employee?.color || '#76bc55';
      const newEvent = { title: `${employeeName} - ${note}`, start: selectedDate, backgroundColor: color };

      try {
        await addDoc(collection(db, 'events'), newEvent);
        setEmployeeName('');
        setNote('');
        setIsModalOpen(false);
      } catch (error) {
        console.error('Error saving leave:', error);
      }
    }
  };

  const handleAddEmployee = async () => {
    if (newEmployee.trim() && selectedColor) {
      const newEmployeeData = { name: newEmployee, color: selectedColor };
      try {
        await addDoc(collection(db, 'employees'), newEmployeeData);
        setNewEmployee('');
        setSelectedColor('#76bc55');
      } catch (error) {
        console.error('Error adding employee:', error);
      }
    }
  };

  const handleDeleteEmployee = async (employeeId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this employee?");
    if (confirmDelete) {
      try {
        await deleteDoc(doc(db, 'employees', employeeId));
      } catch (error) {
        console.error('Error deleting employee:', error);
      }
    }
  };

  const handleDeleteEvent = async (eventId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this leave event?");
    if (confirmDelete) {
      try {
        await deleteDoc(doc(db, 'events', eventId));
      } catch (error) {
        console.error('Error deleting event:', error);
      }
    }
  };

  Modal.setAppElement('#root');

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', color: '#4cbc55' }}>
      <h1 style={{ textAlign: 'center', color: '#4cbc55' }}>Employee Leave Calendar</h1>

      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        events={events}
        dateClick={(info) => {
          setSelectedDate(info.dateStr);
          setIsModalOpen(true);
        }}
        eventContent={(eventInfo) => (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{eventInfo.event.title}</span>
            <button
              style={{
                marginLeft: '5px',
                background: 'red',
                color: 'white',
                border: 'none',
                borderRadius: '3px',
                cursor: 'pointer',
              }}
              onClick={() => handleDeleteEvent(eventInfo.event.id)}
            >
              ✕
            </button>
          </div>
        )}
      />

      <div style={{ marginTop: '30px' }}>
        <h2>Manage Employees</h2>
        <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Add Employee Name"
            value={newEmployee}
            onChange={(e) => setNewEmployee(e.target.value)}
            style={{
              padding: '10px',
              width: '250px',
              borderRadius: '5px',
              border: '1px solid #4cbc55',
            }}
          />
          <div style={{ marginLeft: '10px' }}>
            <input
              type="color"
              value={selectedColor}
              onChange={(e) => setSelectedColor(e.target.value)}
              style={{
                padding: '5px',
                width: '40px',
                height: '40px',
                border: 'none',
                borderRadius: '50%',
                cursor: 'pointer',
              }}
            />
          </div>
          <button
            onClick={handleAddEmployee}
            style={{
              marginLeft: '10px',
              padding: '10px 20px',
              background: '#4cbc55',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
            }}
          >
            Add
          </button>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#4cbc55', color: 'white' }}>
              <th style={{ padding: '10px', border: '1px solid white' }}>Employee Name</th>
              <th style={{ padding: '10px', border: '1px solid white' }}>Color</th>
              <th style={{ padding: '10px', border: '1px solid white' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((employee) => (
              <tr key={employee.id} style={{ textAlign: 'center' }}>
                <td style={{ padding: '10px', border: '1px solid #4cbc55' }}>{employee.name}</td>
                <td style={{ padding: '10px', border: '1px solid #4cbc55' }}>
                  <span
                    style={{
                      display: 'inline-block',
                      width: '20px',
                      height: '20px',
                      backgroundColor: employee.color,
                    }}
                  ></span>
                </td>
                <td style={{ padding: '10px', border: '1px solid #4cbc55' }}>
                  <button
                    style={{
                      background: 'red',
                      color: 'white',
                      border: 'none',
                      borderRadius: '3px',
                      cursor: 'pointer',
                      padding: '5px 10px',
                    }}
                    onClick={() => handleDeleteEmployee(employee.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal for Adding Leave */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        style={{
          content: {
            width: '400px',
            margin: 'auto',
            padding: '20px',
            borderRadius: '10px',
            border: '1px solid #4cbc55',
          },
        }}
      >
        <h2>Add Leave</h2>
        <div style={{ marginBottom: '10px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Select Employee:</label>
          <select
            value={employeeName}
            onChange={(e) => setEmployeeName(e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '5px',
              border: '1px solid #ccc',
            }}
          >
            <option value="">-- Select Employee --</option>
            {employees.map((employee) => (
              <option key={employee.id} value={employee.name}>
                {employee.name}
              </option>
            ))}
          </select>
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Note:</label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add a note (optional)"
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '5px',
              border: '1px solid #ccc',
            }}
          />
        </div>
        <div style={{ textAlign: 'right' }}>
          <button
            onClick={handleSaveLeave}
            style={{
              padding: '10px 20px',
              background: '#4cbc55',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              marginRight: '10px',
            }}
          >
            Save
          </button>
          <button
            onClick={() => setIsModalOpen(false)}
            style={{
              padding: '10px 20px',
              background: 'gray',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default EmployeeLeaveCalendar;
