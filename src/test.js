import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import Modal from 'react-modal';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, deleteDoc, doc, onSnapshot } from 'firebase/firestore';
import { TextField, Button, IconButton, Grid, MenuItem, Select, InputLabel, FormControl } from '@mui/material';
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
  const [leaveType, setLeaveType] = useState('');
  const [leaveNumber, setLeaveNumber] = useState('');
  const [note, setNote] = useState('');
  const [tasks, setTasks] = useState({});
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [newEmployee, setNewEmployee] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');

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

    const unsubscribeTasks = onSnapshot(collection(db, 'tasks'), (snapshot) => {
      const fetchedTasks = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      const tasksByEmployee = fetchedTasks.reduce((acc, task) => {
        acc[task.employeeId] = acc[task.employeeId] || [];
        acc[task.employeeId].push(task);
        return acc;
      }, {});
      setTasks(tasksByEmployee);
    });

    return () => {
      unsubscribeEvents();
      unsubscribeEmployees();
      unsubscribeTasks();
    };
  }, []);

  const handleSaveLeave = async () => {
    if (employeeName.trim() && selectedDate && leaveType) {
      const eventColors = {
        "ลาป่วยทั้งวัน": { backgroundColor: '#76bc55' },
        "ลาป่วยช่วงเช้า": { backgroundColor: '#76bc55' },
        "ลาป่วยช่วงบ่าย": { backgroundColor: '#76bc55' },
        "ลากิจทั้งวัน": { backgroundColor: '#f9c74f' },
        "ลากิจช่วงเช้า": { backgroundColor: '#f9c74f' },
        "ลากิจช่วงบ่าย": { backgroundColor: '#f9c74f' },
        "ลาพักร้อนทั้งวัน": { backgroundColor: '#4fb5f9' },
        "ลาพักร้อนช่วงเช้า": { backgroundColor: '#4fb5f9' },
        "ลาพักร้อนช่วงบ่าย": { backgroundColor: '#4fb5f9' },
        "ลาอื่นๆ": { backgroundColor: '#9b59b6' },
        "Note": { backgroundColor: '#f1c1c1', color: 'black' },
      };

      const newEvent = { 
        title: `${employeeName} - ${leaveType}`, 
        start: selectedDate, 
        backgroundColor: eventColors[leaveType]?.backgroundColor || '#76bc55',
        color: eventColors[leaveType]?.color || 'white', 
      };

      try {
        await addDoc(collection(db, 'events'), newEvent);
        setEmployeeName('');
        setLeaveType('');
        setLeaveNumber('');
        setNote('');
        setIsModalOpen(false);
      } catch (error) {
        console.error('Error saving leave:', error);
      }
    }
  };

  const handleAddEmployee = async () => {
    if (newEmployee.trim()) {
      const newEmployeeData = { name: newEmployee };
      try {
        await addDoc(collection(db, 'employees'), newEmployeeData);
        setNewEmployee('');
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

  const handleDeleteTask = async (employeeId, taskId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this task?");
    if (confirmDelete) {
      try {
        await deleteDoc(doc(db, 'tasks', taskId));
      } catch (error) {
        console.error('Error deleting task:', error);
      }
    }
  };

  const handleAddTask = async () => {
    if (taskDescription.trim() && selectedEmployeeId) {
      const newTask = {
        employeeId: selectedEmployeeId,
        task: taskDescription,
      };

      try {
        await addDoc(collection(db, 'tasks'), newTask);
        setTaskDescription('');
        setTaskDialogOpen(false);
      } catch (error) {
        console.error('Error adding task:', error);
      }
    }
  };

  const handleEditTask = (employeeId) => {
    setSelectedEmployeeId(employeeId);
    setTaskDialogOpen(true);
  };

  Modal.setAppElement('#root');

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', color: '#4cbc55' }}>
      <h1 style={{ textAlign: 'center', color: '#4cbc55' }}>Employee Leave & Task Management</h1>

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
          <TextField
            label="Add Employee Name"
            variant="outlined"
            value={newEmployee}
            onChange={(e) => setNewEmployee(e.target.value)}
            style={{ marginRight: '10px', width: '250px' }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleAddEmployee}
            style={{ marginLeft: '10px' }}
          >
            Add
          </Button>
        </div>

        <Grid container spacing={2}>
          <Grid item xs={12}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#4cbc55', color: 'white' }}>
                  <th style={{ padding: '10px', border: '1px solid white' }}>Employee Name</th>
                  <th style={{ padding: '10px', border: '1px solid white' }}>Tasks</th>
                  <th style={{ padding: '10px', border: '1px solid white' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((employee) => (
                  <tr key={employee.id} style={{ textAlign: 'center' }}>
                    <td style={{ padding: '10px', border: '1px solid #4cbc55' }}>{employee.name}</td>
                    <td style={{ padding: '10px', border: '1px solid #4cbc55' }}>
                      {tasks[employee.id]
                        ? tasks[employee.id].map((task) => (
                            <div key={task.id} style={{ marginBottom: '5px' }}>
                              {task.task}
                              <IconButton
                                color="error"
                                size="small"
                                onClick={() => handleDeleteTask(employee.id, task.id)}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </div>
                          ))
                        : 'No tasks assigned'}
                    </td>
                    <td style={{ padding: '10px', border: '1px solid #4cbc55' }}>
                      <Button
                        variant="outlined"
                        color="primary"
                        onClick={() => handleEditTask(employee.id)}
                        style={{ marginRight: '10px' }}
                      >
                        <EditIcon />
                      </Button>
                      <Button
                        variant="outlined"
                        color="secondary"
                        onClick={() => handleDeleteEmployee(employee.id)}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Grid>
        </Grid>
      </div>

      {/* Modal for Adding Task */}
      <Modal
        isOpen={taskDialogOpen}
        onRequestClose={() => setTaskDialogOpen(false)}
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
        <h2>Add Task</h2>
        <TextField
          label="Task Description"
          variant="outlined"
          value={taskDescription}
          onChange={(e) => setTaskDescription(e.target.value)}
          fullWidth
          style={{ marginBottom: '20px' }}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleAddTask}
          style={{ width: '100%' }}
        >
          Save Task
        </Button>
      </Modal>
      
      {/* Modal for Leave Management */}
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
        <h2>Leave Management</h2>
        <FormControl fullWidth style={{ marginBottom: '20px' }}>
          <InputLabel>Employee Name</InputLabel>
          <Select
            label="Employee Name"
            value={employeeName}
            onChange={(e) => setEmployeeName(e.target.value)}
          >
            {employees.map((employee) => (
              <MenuItem key={employee.id} value={employee.name}>
                {employee.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl fullWidth style={{ marginBottom: '20px' }}>
        <InputLabel>Leave Type</InputLabel>
        <Select
          label="Leave Type"
          variant="outlined"
          select
          value={leaveType}
          onChange={(e) => setLeaveType(e.target.value)}
          fullWidth
          style={{ marginBottom: '20px' }}
        >
          <option value="ลาป่วยทั้งวัน">ลาป่วยทั้งวัน</option>
          <option value="ลาป่วยช่วงเช้า">ลาป่วยช่วงเช้า</option>
          <option value="ลาป่วยช่วงบ่าย">ลาป่วยช่วงบ่าย</option>
          <option value="ลากิจทั้งวัน">ลากิจทั้งวัน</option>
          <option value="ลากิจช่วงเช้า">ลากิจช่วงเช้า</option>
          <option value="ลากิจช่วงบ่าย">ลากิจช่วงบ่าย</option>
          <option value="ลาพักร้อนทั้งวัน">ลาพักร้อนทั้งวัน</option>
          <option value="ลาพักร้อนช่วงเช้า">ลาพักร้อนช่วงเช้า</option>
          <option value="ลาพักร้อนช่วงบ่าย">ลาพักร้อนช่วงบ่าย</option>
          <option value="ลาอื่นๆ">ลาอื่นๆ</option>
          </Select>
          </FormControl>
        <TextField
          label="Leave Number"
          variant="outlined"
          type="number"
          value={leaveNumber}
          onChange={(e) => setLeaveNumber(e.target.value)}
          fullWidth
          style={{ marginBottom: '20px' }}
        />

        <TextField
          label="Note"
          variant="outlined"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          fullWidth
          style={{ marginBottom: '20px' }}
        />

        <Button
          variant="contained"
          color="primary"
          onClick={handleSaveLeave}
          style={{ width: '100%' }}
        >
          Save Leave
        </Button>
      </Modal>
    </div>
  );
};

export default EmployeeLeaveCalendar;
