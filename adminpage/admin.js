// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional


const firebaseConfig = {
  apiKey: "AIzaSyAT8avGZGopiWi9bRmdeOyXlpyTA6nVysU",
  authDomain: "attandence-9cfd8.firebaseapp.com",
  projectId: "attandence-9cfd8",
  storageBucket: "attandence-9cfd8.firebasestorage.app",
  messagingSenderId: "951936428754",
  appId: "1:951936428754:web:86b50623d0e57fc205db0b",
  measurementId: "G-M6BE93RYME"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && passwordMatches) {
        // Redirect based on role
        if (user.role === 'admin') {
            return res.redirect('/admin/dashboard');
        } else if (user.role === 'manager') {
            return res.redirect('/manager/dashboard');
        }
    } else {
        res.send("Invalid Credentials");
    }
});

////////
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;

    if (email === "admin@asr.com" && password === "asr123") {
        // Correct path to your new dashboard file
        res.sendFile(__dirname + '/views/admin-dashboard.html'); 
    } else {
        res.send("Wrong credentials!");
    }
});
////////////
const BookingSchema = new mongoose.Schema({
    propertyType: { 
        type: String, 
        enum: ['Whole Resort', 'Big Hall', 'Small Hall'], 
        required: true 
    },
    eventDate: { type: Date, required: true },
    customerName: String,
    totalPrice: Number,
    isPaid: { type: Boolean, default: false }
});
///////////
const express = require('express');
const mongoose = require('mongoose');
const appp = express();

appp.use(express.json());
appp.use(express.static('public')); // Serves your HTML files

// 1. Connect to your Render Database (Replace with your actual URL)
mongoose.connect(process.env.DATABASE_URL || 'mongodb://localhost/asr_resort');

// 2. Define the Booking Schema (Designed for your model)
const Booking = mongoose.model('Booking', {
    title: String,
    start: String,
    end: String,
    color: String,
    propertyType: String // 'Whole Resort', 'Big Hall', or 'Small Hall'
});

// 3. API to GET all bookings (To show on the calendar)
app.get('/api/bookings', async (req, res) => {
    const bookings = await Booking.find();
    res.json(bookings);
});


//////////

document.addEventListener('DOMContentLoaded', function() {
    var calendarEl = document.getElementById('calendar');
    
    var calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        height: 600, // Makes the calendar more compact
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: '' // Clean look: no view switching needed
        },
        editable: true,
        selectable: true,
        events: '/api/bookings',

        // OPEN MODAL FOR NEW BOOKING
        select: function(info) {
            document.getElementById('bookingForm').reset();
            document.getElementById('modalTitle').innerText = "New Booking";
            document.getElementById('startDate').value = info.startStr;
            document.getElementById('endDate').value = info.endStr;
            document.getElementById('deleteBtn').classList.add('hidden');
            openModal();
        },

        // OPEN MODAL TO DELETE/VIEW
        eventClick: function(info) {
            document.getElementById('modalTitle').innerText = "Edit/Delete Booking";
            document.getElementById('eventTitle').value = info.event.title;
            document.getElementById('eventId').value = info.event.id;
            document.getElementById('deleteBtn').classList.remove('hidden');
            openModal();
        }
    });
    calendar.render();
});

// Helper Functions
function openModal() { document.getElementById('bookingModal').classList.remove('hidden'); }
function closeModal() { document.getElementById('bookingModal').classList.add('hidden'); }

// Submit Form (Save)
document.getElementById('bookingForm').onsubmit = async (e) => {
    e.preventDefault();
    const data = {
        title: document.getElementById('eventTitle').value,
        start: document.getElementById('startDate').value,
        end: document.getElementById('endDate').value,
        propertyType: document.getElementById('propertyType').value,
        reason: document.getElementById('reason').value,
        color: getColor(document.getElementById('propertyType').value)
    };

    await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    location.reload(); // Refresh to show new event
};

// Delete Function
async function deleteBooking() {
    const id = document.getElementById('eventId').value;
    const reason = document.getElementById('reason').value;

    if (!reason) return alert("Please provide a reason for deletion.");

    if (confirm("Are you sure you want to delete this booking?")) {
        await fetch(`/api/bookings/${id}`, { 
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reason }) 
        });
        location.reload();
    }
}

function getColor(type) {
    if (type === 'Whole Resort') return '#4f46e5';
    if (type === 'Big Hall') return '#059669';
    return '#d97706';
}


/////////////


app.delete('/api/bookings/:id', async (req, res) => {
    const { reason } = req.body;
    const bookingId = req.params.id;

    // Log the cancellation reason here if you have a logs table
    console.log(`Booking ${bookingId} deleted. Reason: ${reason}`);

    await Booking.findByIdAndDelete(bookingId);
    res.json({ success: true });
});

// 4. API to SAVE a new booking
app.post('/api/bookings', async (req, res) => {
    const newBooking = new Booking(req.body);
    await newBooking.save();
    res.status(201).json(newBooking);
});

app.listen(3000, () => console.log('ASR Server running on port 3000'));