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

  const handleAddLeave = async () => {
    if (employeeName.trim()) {
      const employee = employees.find((e) => e.name === employeeName);
      const color = employee?.color || '#76bc55';
      const newEvent = { title: employeeName, start: selectedDate, backgroundColor: color };

      try {
        await addDoc(collection(db, 'events'), newEvent);
        setEmployeeName('');
        setIsModalOpen(false);
      } catch (error) {
        console.error('Error adding leave:', error);
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
    try {
      await deleteDoc(doc(db, 'employees', employeeId));
    } catch (error) {
      console.error('Error deleting employee:', error);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    try {
      await deleteDoc(doc(db, 'events', eventId));
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  Modal.setAppElement('#root');

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', color: '#4cbc55' }}>
      <h1 style={{ textAlign: 'center', color: '#4cbc55' }}>ปฏิทินการลา TESTER INET</h1>

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
              onClick={() => handleDeleteEvent(eventInfo.event.id)} // ลบเหตุการณ์
            >
              ✕
            </button>
          </div>
        )}
      />

      <div style={{ marginTop: '30px' }}>
        <h2>จัดการพนัก</h2>
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
                boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.2)',
                transition: 'box-shadow 0.3s ease-in-out',
              }}
              onMouseOver={(e) => {
                e.target.style.boxShadow = '0px 0px 15px rgba(0, 0, 0, 0.3)';
              }}
              onMouseOut={(e) => {
                e.target.style.boxShadow = '0px 0px 10px rgba(0, 0, 0, 0.2)';
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
              boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.2)',
              transition: 'box-shadow 0.3s ease-in-out',
            }}
            onMouseOver={(e) => {
              e.target.style.boxShadow = '0px 0px 15px rgba(0, 0, 0, 0.3)';
            }}
            onMouseOut={(e) => {
              e.target.style.boxShadow = '0px 0px 10px rgba(0, 0, 0, 0.2)';
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
                    onClick={() => handleDeleteEmployee(employee.id)} // ลบพนักงาน
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        style={{
          overlay: { backgroundColor: 'rgba(0, 0, 0, 0.75)' },
          content: {
            top: '50%',
            left: '50%',
            right: 'auto',
            bottom: 'auto',
            marginRight: '-50%',
            transform: 'translate(-50%, -50%)',
            width: '300px',
            borderRadius: '10px',
          },
        }}
      >
        <h2>Add Employee Leave</h2>
        <p>Date: {selectedDate}</p>
        <select
          value={employeeName}
          onChange={(e) => setEmployeeName(e.target.value)}
          style={{
            width: '100%',
            marginBottom: '10px',
            padding: '10px',
            borderRadius: '5px',
            border: '1px solid #4cbc55',
          }}
        >
          <option value="">Select Employee</option>
          {employees.map((employee) => (
            <option key={employee.id} value={employee.name}>
              {employee.name}
            </option>
          ))}
        </select>
        <button
          onClick={handleAddLeave}
          style={{
            width: '100%',
            background: '#4cbc55',
            color: 'white',
            padding: '10px',
            borderRadius: '5px',
          }}
        >
          Add Leave
        </button>
        <button
          onClick={() => setIsModalOpen(false)}
          style={{
            width: '100%',
            marginTop: '10px',
            background: 'gray',
            color: 'white',
            padding: '10px',
            borderRadius: '5px',
          }}
        >
          Cancel
        </button>
      </Modal>
    </div>
  );
};

export default EmployeeLeaveCalendar;
