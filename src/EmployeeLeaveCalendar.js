import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import Modal from 'react-modal';

// Firebase imports
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore, collection, addDoc, deleteDoc, doc, onSnapshot } from "firebase/firestore";

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

  // Load events from Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "events"), (snapshot) => {
      const fetchedEvents = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setEvents(fetchedEvents);
    });

    return () => unsubscribe(); // Unsubscribe when component is unmounted
  }, []);

  // Add leave event to Firestore
  const handleAddLeave = () => {
    if (employeeName.trim()) {
      const newEvent = {
        title: employeeName,
        start: selectedDate,
        backgroundColor: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
      };

      addDoc(collection(db, "events"), newEvent)
        .then(() => {
          setEmployeeName('');
          setIsModalOpen(false);
        })
        .catch((error) => {
          console.error('Error adding event: ', error);
        });
    } else {
      alert('กรุณากรอกชื่อพนักงาน');
    }
  };

  // Delete leave event from Firestore
  const handleDeleteLeave = (id) => {
    deleteDoc(doc(db, "events", id))
      .catch((error) => {
        console.error('Error deleting event: ', error);
      });
  };

  Modal.setAppElement('#root');

  return (
    <div>
      <h1>ปฏิทินการลาของพนักงาน</h1>
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
        <h2>เพิ่มวันลาพนักงาน</h2>
        <p>วันที่: {selectedDate}</p>
        <input
          type="text"
          placeholder="ชื่อพนักงาน"
          value={employeeName}
          onChange={(e) => setEmployeeName(e.target.value)}
          style={{ width: '100%', marginBottom: '10px', padding: '5px', fontSize: '16px' }}
        />
        <button
          onClick={handleAddLeave}
          style={{
            width: '100%',
            background: 'green',
            color: 'white',
            padding: '10px',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            marginBottom: '10px',
          }}
        >
          เพิ่มวันลา
        </button>
        <button
          onClick={() => setIsModalOpen(false)}
          style={{
            width: '100%',
            background: 'gray',
            color: 'white',
            padding: '10px',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
        >
          ยกเลิก
        </button>
      </Modal>
    </div>
  );
};

export default EmployeeLeaveCalendar;