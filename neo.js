const express = require('express');
const path = require('path');
const fs = require('fs');
const { Document, Packer, Paragraph, TextRun, AlignmentType } = require("docx");
const app = express();

app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

const DATA_FILE = 'inquiries.json';
const BLOCKED_FILE = 'blocked-dates.json';
const VIEWS_DIR = path.join(__dirname, 'views'); 

const ASR_TERMS = [
    "1. Booking is confirmed only after 50% advance payment.",
    "2. Advance amount is non-refundable in case of cancellation.",
    "3. Any damage to property will be charged to the customer.",
    "4. Final payment must be cleared before the event starts.",
    "5. Outside catering is only allowed with prior written permission."
];

// --- 1. SYSTEM INITIALIZATION ---
if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, JSON.stringify([]));
if (!fs.existsSync(BLOCKED_FILE)) fs.writeFileSync(BLOCKED_FILE, JSON.stringify([]));

// --- 2. PUBLIC ROUTES ---

// Main Home Page
app.get('/', (req, res) => {
    res.sendFile(path.join(VIEWS_DIR, 'index.html'));
});

// Define the pages you want to actually OPEN
const pages = ['about', 'facilities', 'events', 'gallery', 'faqs', 'blog', 'contact'];

pages.forEach(page => {
    app.get(`/${page}`, (req, res) => {
        const filePath = path.join(VIEWS_DIR, `${page}.html`);
        if (fs.existsSync(filePath)) {
            res.sendFile(filePath);
        } else {
            // If the file doesn't exist, THEN go home
            res.redirect('/');
        }
    });
});

app.get('/about', (req, res) => res.sendFile(path.join(VIEWS_DIR, 'about.html')));
app.get('/facilities', (req, res) => res.sendFile(path.join(VIEWS_DIR, 'facilities.html')));
app.get('/events', (req, res) => res.sendFile(path.join(VIEWS_DIR, 'events.html')));
app.get('/gallery', (req, res) => res.sendFile(path.join(VIEWS_DIR, 'gallery.html')));
app.get('/contact', (req, res) => res.sendFile(path.join(VIEWS_DIR, 'contact.html')));
app.get('/faqs', (req, res) => res.sendFile(path.join(VIEWS_DIR, 'faqs.html')));
app.get('/blog', (req, res) => res.sendFile(path.join(VIEWS_DIR, 'blog.html')));

// --- 3. QUOTATION & CALENDAR BRIDGE ---
app.get('/get-blocked-dates', (req, res) => {
    try {
        const blocked = JSON.parse(fs.readFileSync(BLOCKED_FILE));
        res.json(blocked);
    } catch (err) { res.json([]); }
});

app.post('/submit-quote', (req, res) => {
    try {
        let d = JSON.parse(fs.readFileSync(DATA_FILE));
        d.push({ 
            id: Date.now(), 
            totalAmount: 0, cateringPrice: 0, decorPrice: 0, 
            advancePaid: 0, discountPercent: 0, ...req.body 
        });
        fs.writeFileSync(DATA_FILE, JSON.stringify(d, null, 2));
        res.json({ success: true });
    } catch (err) { res.status(500).json({ success: false }); }
});

// --- 4. DATA API ROUTES (For background updates) ---
app.post('/update-lead', (req, res) => {
    let d = JSON.parse(fs.readFileSync(DATA_FILE));
    let l = d.find(x => x.id == req.body.id);
    if(l) Object.assign(l, req.body);
    fs.writeFileSync(DATA_FILE, JSON.stringify(d));
    res.json({success:true});
});

app.post('/block-date', (req, res) => {
    let b = JSON.parse(fs.readFileSync(BLOCKED_FILE));
    b.push(req.body.date);
    fs.writeFileSync(BLOCKED_FILE, JSON.stringify(b));
    res.json({success:true});
});

app.post('/add-offline', (req, res) => {
    let d = JSON.parse(fs.readFileSync(DATA_FILE));
    d.push({ id: Date.now(), totalAmount: 0, cateringPrice: 0, decorPrice: 0, advancePaid: 0, discountPercent: 0, ...req.body });
    fs.writeFileSync(DATA_FILE, JSON.stringify(d));
    res.json({ success: true });
});


app.listen(3000, () => console.log('ASR Executive Server Online (No Admin Panel)'));


////owner page

app.get('/owner', (req,res)=>res.sendFile(__dirname+'/views/owner.html'));
app.get('/manager', (req,res)=>res.sendFile(__dirname+'/views/manager.html'));
app.get('/admin', (req,res)=>res.sendFile(__dirname+'/views/admin-login.html'));

app.get('/api/inquiries', (req,res)=>{
  res.json(JSON.parse(fs.readFileSync('inquiries.json')));
});

app.get('/api/expenses/all', (req,res)=>{
  const owner = JSON.parse(fs.readFileSync('expenses-owner.json','utf8') || '[]');
  const manager = JSON.parse(fs.readFileSync('expenses-manager.json','utf8') || '[]');
  res.json([...owner.map(e=>({...e,role:'owner'})), ...manager.map(e=>({...e,role:'manager'}))]);
});

app.post('/api/expenses/manager', (req,res)=>{
  const data = JSON.parse(fs.readFileSync('expenses-manager.json','utf8') || '[]');
  data.push(req.body);
  fs.writeFileSync('expenses-manager.json', JSON.stringify(data,null,2));
  res.sendStatus(200);
});
app.get('/api/bookings', (req, res) => {
  const data = JSON.parse(fs.readFileSync('bookings.json', 'utf8') || '[]');
  res.json(data);
});

app.post('/api/bookings', (req, res) => {
  const data = JSON.parse(fs.readFileSync('bookings.json', 'utf8') || '[]');
  data.push({ ...req.body, id: Date.now() });
  fs.writeFileSync('bookings.json', JSON.stringify(data, null, 2));
  res.sendStatus(200);
});

app.put('/api/bookings/:id', (req, res) => {
  let data = JSON.parse(fs.readFileSync('bookings.json', 'utf8') || '[]');

  data = data.map(b =>
    b.id == req.params.id
      ? { ...b, payment: req.body.payment }
      : b
  );

  fs.writeFileSync('bookings.json', JSON.stringify(data, null, 2));
  res.sendStatus(200);
});


function saveBooking() {
  fetch('/api/bookings', {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({
      venue: venue.value,
      guests: guests.value,
      eventType: eventType.value,
      eventDate: eventDate.value,
      session: session.value,
      phone: phone.value,
      name: name.value,
      email: email.value,
      payment: payment.value
    })
  }).then(() => {
    alert('Booking saved');
    loadBookings();
  });
}

function loadBookings() {
  fetch('/api/bookings')
    .then(r => r.json())
    .then(data => {
      bookings.innerHTML = data.map(b => `
        <div class="table-row">
          <b>${b.name}</b> | ${b.eventType} | ${b.payment}
        </div>
      `).join('');
    });
}

if (document.getElementById('bookings')) {
  loadBookings();
}


