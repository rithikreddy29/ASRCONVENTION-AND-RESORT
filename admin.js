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
  data = data.map(b => b.id == req.params.id ? req.body : b);
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
  const filter = document.getElementById('filterPayment')?.value || '';

  fetch('/api/bookings')
    .then(r => r.json())
    .then(data => {
      if (filter) {
        data = data.filter(b => b.payment === filter);
      }

      bookings.innerHTML = data.map(b => `
        <div class="table-row">
          <b>${b.name}</b> | ${b.eventType} | ${b.eventDate}
          <br>
          <select onchange="updatePayment(${b.id}, this.value)">
            <option ${b.payment==='Pending'?'selected':''}>Pending</option>
            <option ${b.payment==='Advance Paid'?'selected':''}>Advance Paid</option>
            <option ${b.payment==='Fully Paid'?'selected':''}>Fully Paid</option>
          </select>
        </div>
      `).join('');
    });
}
function updatePayment(id, payment) {
  fetch('/api/bookings/' + id, {
    method: 'PUT',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({ payment })
  }).then(() => {
    alert('Payment status updated');
  });
}



