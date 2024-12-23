import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import Modal from 'react-modal';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, deleteDoc, doc, onSnapshot } from 'firebase/firestore';
import { TextField, Button, IconButton, Grid } from '@mui/material';
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
  const [leaveDetailModalOpen, setLeaveDetailModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
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
      const confirmDelete = window.confirm("ยืนยันการลบพนักงาน ?");
      if (confirmDelete) {
        try {
          await deleteDoc(doc(db, 'employees', employeeId));
        } catch (error) {
          console.error('Error deleting employee:', error);
        }
      }
    };

    const handleDeleteTask = async (employeeId, taskId) => {
        const confirmDelete = window.confirm("ยืนยันการลบงาน ?");
        if (confirmDelete) {
          try {
            await deleteDoc(doc(db, 'tasks', taskId));
          } catch (error) {
            console.error('Error deleting task:', error);
          }
        }
      };

      const handleEditTask = (employeeId) => {
        setSelectedEmployeeId(employeeId);
        setTaskDialogOpen(true);
      };

  const handleSaveLeave = async () => {
    if (employeeName.trim() && selectedDate && leaveType) {
      const eventColors = {
        "ลาป่วยทั้งวัน": { backgroundColor: '#76bc55', color: 'black' },
        "ลาป่วยช่วงเช้า": { backgroundColor: '#76bc55', color: 'black' },
        "ลาป่วยช่วงบ่าย": { backgroundColor: '#76bc55', color: 'black' },
        "ลากิจทั้งวัน": { backgroundColor: '#f9c74f', color: 'black' },
        "ลากิจช่วงเช้า": { backgroundColor: '#f9c74f', color: 'black' },
        "ลากิจช่วงบ่าย": { backgroundColor: '#f9c74f', color: 'black' },
        "ลาพักร้อนทั้งวัน": { backgroundColor: '#4fb5f9', color: 'black' },
        "ลาพักร้อนช่วงเช้า": { backgroundColor: '#4fb5f9', color: 'black' },
        "ลาพักร้อนช่วงบ่าย": { backgroundColor: '#4fb5f9', color: 'black' },
        "ลาอื่นๆ": { backgroundColor: '#9b59b6', color: 'black' },
        "Note": { backgroundColor: 'red', color: 'white' },
      };

      const newEvent = {
        title: employeeName,
        start: selectedDate,
        backgroundColor: eventColors[leaveType]?.backgroundColor || '#76bc55',
        color: eventColors[leaveType]?.color || 'white',
        description: leaveType === 'Note' ? note : leaveType,
        leaveNumber: leaveNumber || '',
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

  const handleDeleteEvent = async (eventId) => {
    const confirmDelete = window.confirm("ยืนยันที่จะลบ");
    if (confirmDelete) {
      try {
        await deleteDoc(doc(db, 'events', eventId));
        setLeaveDetailModalOpen(false);
      } catch (error) {
        console.error('Error deleting event:', error);
      }
    }
  };

  Modal.setAppElement('#root');

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', color: '#4cbc55' }}>
      <h1 style={{ textAlign: 'center', color: '#4cbc55' }}>TESTER KKC JOB TRACKING</h1>

      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        events={events}
        dateClick={(info) => {
          setSelectedDate(info.dateStr);
          setIsModalOpen(true);
        }}
        eventClick={(info) => {
          setSelectedEvent(info.event);
          setLeaveDetailModalOpen(true);
        }}
      />

<div style={{ marginTop: '30px' }}>
        <h2>จัดการพนักงาน</h2>
        <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center' }}>
          <TextField
            label="กรอกชื่อพนักงานใหม่"
            variant="outlined"
            value={newEmployee}
            onChange={(e) => setNewEmployee(e.target.value)}
            style={{ margin: '10px', width: '250px' }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleAddEmployee}
            style={{ margin: '10px' }}
          >
            บันทึก
          </Button>
        </div>

        <Grid container spacing={2}>
          <Grid item xs={12}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#4cbc55', color: 'white' }}>
                  <th style={{ padding: '10px', border: '1px solid white' }}>ชื่อพนักงาน</th>
                  <th style={{ padding: '10px', border: '1px solid white' }}>งานที่ถือ</th>
                  <th style={{ padding: '10px', border: '1px solid white' }}> </th>
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
                        style={{ margin: '10px' }}
                      >
                        <EditIcon />
                      </Button>
                      <Button
                        variant="outlined"
                        color="warning"
                        onClick={() => handleDeleteEmployee(employee.id)}
                      >
                        ลบพนักงาน
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Grid>
        </Grid>
      </div>

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
                  position: 'relative', // เพิ่มเพื่อวางปุ่ม X
                },
              }}
            >
              <button
    onClick={() => setTaskDialogOpen(false)}
    style={{
      position: 'absolute',
      top: '10px',
      right: '10px',
      background: 'transparent',
      border: 'none',
      fontSize: '20px',
      cursor: 'pointer',
    }}
  >
    &times;
  </button>
              <h2>เพิ่มงาน</h2>
              <TextField
                label="ชื่องาน"
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
                บันทึกงาน
              </Button>
            </Modal>

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
            position: 'relative', // เพิ่มเพื่อวางปุ่ม X
          },
        }}
      >
  
        {/* ปุ่ม X */}
  <button
    onClick={() => setIsModalOpen(false)}
    style={{
      position: 'absolute',
      top: '10px',
      right: '10px',
      background: 'transparent',
      border: 'none',
      fontSize: '20px',
      cursor: 'pointer',
    }}
  >
    &times;
  </button>
        <h2>เพิ่มใบลา</h2>
        <div style={{ marginBottom: '10px' }}>
          <label style={{ display: 'block' }}>เลือกชื่อพนักงาน</label>
          <select
            value={employeeName}
            onChange={(e) => setEmployeeName(e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              marginBottom: '20px',
              borderRadius: '5px',
              borderColor: '#4cbc55',
            }}
          >
            <option value="">เลือกชื่อพนักงาน</option>
            {employees.map((employee) => (
              <option key={employee.id} value={employee.name}>
                {employee.name}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label style={{ display: 'block' }}>ประเภทการลา</label>
          <select
            value={leaveType}
            onChange={(e) => setLeaveType(e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              marginBottom: '20px',
              borderRadius: '5px',
              borderColor: '#4cbc55',
            }}
          >
            <option value="">ประเภทการลา</option>
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
            <option value="Note">Note</option>
          </select>
        </div>

        {leaveType !== 'Note' && (
          <TextField
            label="เลขที่ใบลา"
            variant="outlined"
            fullWidth
            value={leaveNumber}
            onChange={(e) => setLeaveNumber(e.target.value)}
          />
        )}

        {leaveType === 'Note' && (
          <TextField
            label="Note"
            variant="outlined"
            fullWidth
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        )}

        <Button
          variant="contained"
          color="primary"
          onClick={handleSaveLeave}
          style={{ marginTop: '20px', backgroundColor: '#4cbc55', color: 'white' }}
        >
          บันทึกใบลา
        </Button>
      </Modal>

      {/* Modal for Leave Details */}
      <Modal
        isOpen={leaveDetailModalOpen}
        onRequestClose={() => setLeaveDetailModalOpen(false)}
        style={{
          content: {
            width: '400px',
            margin: 'auto',
            padding: '20px',
            borderRadius: '10px',
            border: '1px solid #4cbc55',
            position: 'relative', // เพิ่มเพื่อวางปุ่ม X
          },
        }}
      >
        {/* ปุ่ม X */}
  <button
    onClick={() => setLeaveDetailModalOpen(false)}
    style={{
      position: 'absolute',
      top: '10px',
      right: '10px',
      background: 'transparent',
      border: 'none',
      fontSize: '20px',
      cursor: 'pointer',
    }}
  >
    &times;
  </button>
        <h2>รายละเอียดใบลา</h2>
        {selectedEvent && (
          <div>
            <p><strong>ชื่อพนักงาน:</strong> {selectedEvent.title}</p>
            <p><strong>วันที่ลา:</strong> {new Date(selectedEvent.start).toLocaleDateString()}</p>
            <p><strong>ประเภทการลา:</strong> {selectedEvent.extendedProps?.description}</p>
            <p><strong>เลขที่ใบลา:</strong> {selectedEvent.extendedProps?.leaveNumber}</p>
            <Button
              variant="contained"
              color="secondary"
              onClick={() => handleDeleteEvent(selectedEvent.id)}
              startIcon={<DeleteIcon />}
              style={{ backgroundColor: '#e74c3c', color: 'white' }}
            >
              ลบใบลา
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default EmployeeLeaveCalendar;
