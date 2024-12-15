import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import Modal from 'react-modal';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, deleteDoc, doc, onSnapshot } from 'firebase/firestore';
import { Button, TextField, Grid, Box, Typography, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

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
  const [tasks, setTasks] = useState({});

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

  const handleEditTask = (employeeId) => {
    const task = prompt('Enter task for this employee:');
    if (task) {
      setTasks((prevTasks) => {
        const updatedTasks = { ...prevTasks, [employeeId]: task };
        return updatedTasks;
      });
    }
  };

  const handleDeleteTask = (employeeId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this task?");
    if (confirmDelete) {
      setTasks((prevTasks) => {
        const updatedTasks = { ...prevTasks };
        delete updatedTasks[employeeId];
        return updatedTasks;
      });
    }
  };

  Modal.setAppElement('#root');

  return (
    <Box sx={{ padding: { xs: '10px', sm: '20px' }, fontFamily: 'Arial, sans-serif', color: '#4cbc55' }}>
      <Typography variant="h4" align="center" color="#4cbc55">
        Employee Leave Calendar
      </Typography>

      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        events={events}
        dateClick={(info) => {
          setSelectedDate(info.dateStr);
          setIsModalOpen(true);
        }}
        eventContent={(eventInfo) => (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{eventInfo.event.title}</span>
            <IconButton
              onClick={() => handleDeleteEvent(eventInfo.event.id)}
              sx={{
                marginLeft: '5px',
                backgroundColor: 'red',
                color: 'white',
                borderRadius: '3px',
              }}
            >
              <DeleteIcon />
            </IconButton>
          </Box>
        )}
      />

      <Box sx={{ marginTop: '30px' }}>
        <Typography variant="h6">Manage Employees</Typography>
        <Grid container spacing={2} sx={{ marginBottom: '20px' }} alignItems="center">
          <Grid item xs={12} sm={8}>
            <TextField
              label="Add Employee Name"
              variant="outlined"
              fullWidth
              value={newEmployee}
              onChange={(e) => setNewEmployee(e.target.value)}
              sx={{ width: '100%' }}
            />
          </Grid>
          <Grid item xs={6} sm={2}>
            <input
              type="color"
              value={selectedColor}
              onChange={(e) => setSelectedColor(e.target.value)}
              style={{
                padding: '5px',
                width: '100%',
                height: '40px',
                border: 'none',
                borderRadius: '50%',
                cursor: 'pointer',
              }}
            />
          </Grid>
          <Grid item xs={6} sm={2}>
            <Button
              onClick={handleAddEmployee}
              variant="contained"
              fullWidth
              sx={{
                backgroundColor: '#4cbc55',
                color: 'white',
              }}
            >
              Add
            </Button>
          </Grid>
        </Grid>

        <Box sx={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#4cbc55', color: 'white' }}>
                <th style={{ padding: '10px', border: '1px solid white' }}>Employee Name</th>
                <th style={{ padding: '10px', border: '1px solid white' }}>Color</th>
                <th style={{ padding: '10px', border: '1px solid white' }}>Tasks</th>
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
                    {tasks[employee.id] ? tasks[employee.id] : 'No tasks assigned'}
                  </td>
                  <td style={{ padding: '10px', border: '1px solid #4cbc55' }}>
                    <Button
                      onClick={() => handleEditTask(employee.id)}
                      sx={{
                        backgroundColor: '#4cbc55',
                        color: 'white',
                        marginRight: '5px',
                      }}
                    >
                      <EditIcon />
                    </Button>
                    <Button
                      onClick={() => handleDeleteTask(employee.id)}
                      sx={{
                        backgroundColor: 'red',
                        color: 'white',
                      }}
                    >
                      <DeleteIcon />
                    </Button>
                    <Button
                      onClick={() => handleDeleteEmployee(employee.id)}
                      sx={{
                        backgroundColor: 'red',
                        color: 'white',
                        marginLeft: '5px',
                      }}
                    >
                      <DeleteIcon />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Box>
      </Box>

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
        <Typography variant="h6" gutterBottom>Add Leave</Typography>
        <TextField
          label="Select Employee"
          select
          value={employeeName}
          onChange={(e) => setEmployeeName(e.target.value)}
          fullWidth
          sx={{ marginBottom: '10px' }}
        >
          <option value="">-- Select Employee --</option>
          {employees.map((employee) => (
            <option key={employee.id} value={employee.name}>
              {employee.name}
            </option>
          ))}
        </TextField>
        <TextField
          label="Note"
          variant="outlined"
          fullWidth
          value={note}
          onChange={(e) => setNote(e.target.value)}
          sx={{ marginBottom: '10px' }}
        />
        <Box sx={{ textAlign: 'right' }}>
          <Button
            onClick={handleSaveLeave}
            variant="contained"
            sx={{ marginRight: '10px', backgroundColor: '#4cbc55' }}
          >
            Save
          </Button>
          <Button onClick={() => setIsModalOpen(false)} variant="outlined">
            Cancel
          </Button>
        </Box>
      </Modal>
    </Box>
  );
};

export default EmployeeLeaveCalendar;
