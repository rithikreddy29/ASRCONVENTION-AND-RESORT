const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

const DATA_FILE = path.join(__dirname, 'inquiries.json');
const BOOKINGS_FILE = path.join(__dirname, 'bookings.json');
const BLOCKED_FILE = path.join(__dirname, 'blocked-dates.json');
const VIEWS_DIR = path.join(__dirname, 'views');

// --- 1. SYSTEM INITIALIZATION & DATA SEEDING ---
if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([
        {
            id: 1725000000001,
            name: "Rajesh Varma",
            phone: "9876543210",
            email: "rajesh.varma@example.com",
            category: "convention",
            eventType: "Grand Wedding & Reception",
            eventDate: "2026-09-18",
            session: "FullDay",
            guests: "1500",
            catering: "Grand Non-Veg & Veg Royal Feast",
            decor: "Royal Palace Theme & Stage Floral",
            addons: ["Stage Decor", "Catering Kitchen Access"],
            status: "New Inquiry",
            submittedAt: "2026-08-30T10:15:00.000Z"
        }
    ], null, 2));
}

if (!fs.existsSync(BOOKINGS_FILE)) {
    fs.writeFileSync(BOOKINGS_FILE, JSON.stringify([
        {
            id: "BK-1001",
            clientName: "Ananya & Rohan Wedding",
            clientPhone: "9988776655",
            clientEmail: "ananya.rohan@wedding.com",
            venue: "Convention Grand Hall (25,000 Sq Ft)",
            eventType: "Grand Wedding",
            eventDate: "2026-09-24",
            session: "FullDay",
            guests: 2000,
            subtotalAmount: 500000,
            discountPercent: 10,
            discountAmount: 50000,
            totalAmount: 450000,
            advancePaid: 250000,
            balanceDue: 200000,
            catering: "Grand Non-Veg & Veg Royal Feast",
            decor: "Royal Palace Theme & Stage Floral",
            paymentMode: "Bank Transfer (NEFT)",
            paymentStatus: "Partial",
            bookingStatus: "Confirmed",
            enteredBy: "Owner",
            notes: "Requires flower setup on stage and valet marshals.",
            paymentHistory: [
                { amount: 250000, mode: "Bank Transfer (NEFT)", date: "2026-08-28", note: "Initial Advance" }
            ],
            createdAt: "2026-08-28T09:00:00.000Z"
        }
    ], null, 2));
}

if (!fs.existsSync(BLOCKED_FILE)) {
    fs.writeFileSync(BLOCKED_FILE, JSON.stringify([
        "2026-09-24"
    ], null, 2));
}

// Helpers
function readJson(file) {
    try {
        return JSON.parse(fs.readFileSync(file, 'utf8'));
    } catch (e) {
        return [];
    }
}

function writeJson(file, data) {
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

// --- 2. PUBLIC PAGES ---
app.get('/', (req, res) => res.sendFile(path.join(VIEWS_DIR, 'index.html')));

const publicPages = ['about', 'facilities', 'events', 'gallery', 'faqs', 'blog', 'contact'];
publicPages.forEach(page => {
    app.get(`/${page}`, (req, res) => {
        const filePath = path.join(VIEWS_DIR, `${page}.html`);
        if (fs.existsSync(filePath)) {
            res.sendFile(filePath);
        } else {
            res.redirect('/');
        }
    });
});

// --- 3. PUBLIC QUOTATION & AVAILABILITY ENDPOINTS ---
app.get('/get-blocked-dates', (req, res) => {
    res.json(readJson(BLOCKED_FILE));
});

app.post('/submit-quote', (req, res) => {
    try {
        const inquiries = readJson(DATA_FILE);
        const newInquiry = {
            id: Date.now(),
            name: req.body.name || "Anonymous Guest",
            phone: req.body.phone || "",
            email: req.body.email || "",
            category: req.body.category || "convention",
            eventType: req.body.eventType || "Event",
            eventDate: req.body.eventDate || "",
            session: req.body.session || "Day",
            guests: req.body.guests || "0",
            catering: req.body.catering || "None / Self-Catering",
            decor: req.body.decor || "None / Standard Stage",
            addons: req.body.addons || [],
            status: "New Inquiry",
            submittedAt: new Date().toISOString()
        };

        inquiries.unshift(newInquiry);
        writeJson(DATA_FILE, inquiries);

        res.json({ success: true, message: "Quotation received successfully", inquiry: newInquiry });
    } catch (err) {
        console.error("Submit quote error:", err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// --- 4. HIDDEN ADMIN & EXECUTIVE PORTAL ---
app.get('/admin', (req, res) => {
    res.sendFile(path.join(VIEWS_DIR, 'admin.html'));
});

// Admin Dual Auth Check (Owner: owner2345 | Manager: asr1234)
app.post('/api/admin/login', (req, res) => {
    const { role, password } = req.body;
    const pwd = (password || '').toString().trim();

    if ((role === 'owner') && (pwd === 'owner2345' || pwd === '2345' || pwd === '9999')) {
        return res.json({
            success: true,
            token: 'asr_owner_' + Date.now(),
            role: 'owner',
            displayName: 'Estate Owner',
            canAccessManager: true
        });
    }

    if ((role === 'manager') && (pwd === 'asr1234' || pwd === '1234')) {
        return res.json({
            success: true,
            token: 'asr_manager_' + Date.now(),
            role: 'manager',
            displayName: 'Operations Manager',
            canAccessManager: false
        });
    }

    // Auto-detect based on password if role is not strictly matching
    if (pwd === 'owner2345' || pwd === '2345' || pwd === '9999') {
        return res.json({ success: true, token: 'asr_owner_' + Date.now(), role: 'owner', displayName: 'Estate Owner', canAccessManager: true });
    }
    if (pwd === 'asr1234' || pwd === '1234') {
        return res.json({ success: true, token: 'asr_manager_' + Date.now(), role: 'manager', displayName: 'Operations Manager', canAccessManager: false });
    }

    return res.status(401).json({ success: false, message: "Invalid credentials. Please enter correct password." });
});

// Public Availability Endpoint for Client Datepicker (tracks Day, Night, and FullDay sessions)
app.get('/api/public/availability', (req, res) => {
    try {
        const bookings = readJson(BOOKINGS_FILE);
        const blocked = readJson(BLOCKED_FILE);

        const dateMap = {};

        // Admin hard-blocked dates count as fully booked
        blocked.forEach(item => {
            const d = typeof item === 'string' ? item : (item && item.date ? item.date : null);
            if (!d) return;
            dateMap[d] = {
                date: d,
                status: 'full', // 'full', 'day_booked', 'night_booked'
                sessionsBooked: ['Day', 'Night', 'FullDay'],
                bookings: [{ clientName: 'Private Hold / Estate Block', session: 'FullDay' }]
            };
        });

        bookings.forEach(b => {
            const d = b.eventDate;
            if (!d) return;

            if (!dateMap[d]) {
                dateMap[d] = {
                    date: d,
                    status: 'available',
                    sessionsBooked: [],
                    bookings: []
                };
            }

            const session = b.session || 'FullDay';
            dateMap[d].bookings.push({
                clientName: b.clientName,
                venue: b.venue,
                session: session
            });

            if (session === 'FullDay') {
                dateMap[d].sessionsBooked.push('Day', 'Night', 'FullDay');
            } else {
                dateMap[d].sessionsBooked.push(session);
            }
        });

        // Determine final session status for each date
        Object.keys(dateMap).forEach(d => {
            const entry = dateMap[d];
            const hasFull = entry.sessionsBooked.includes('FullDay');
            const hasDay = entry.sessionsBooked.includes('Day');
            const hasNight = entry.sessionsBooked.includes('Night');

            if (hasFull || (hasDay && hasNight)) {
                entry.status = 'full'; // Totally booked (red)
            } else if (hasDay) {
                entry.status = 'day_booked'; // Day is booked, Night is free
            } else if (hasNight) {
                entry.status = 'night_booked'; // Night is booked, Day is free
            } else {
                entry.status = 'available';
            }
        });

        res.json({ success: true, availability: dateMap });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Get Full Dashboard Dataset
app.get('/api/admin/data', (req, res) => {
    const inquiries = readJson(DATA_FILE);
    const bookings = readJson(BOOKINGS_FILE);
    const blockedDates = readJson(BLOCKED_FILE);

    let totalRevenue = 0;
    let totalAdvance = 0;
    let totalBalanceDue = 0;

    bookings.forEach(b => {
        totalRevenue += Number(b.totalAmount) || 0;
        totalAdvance += Number(b.advancePaid) || 0;
        totalBalanceDue += Number(b.balanceDue) || 0;
    });

    res.json({
        metrics: {
            totalBookings: bookings.length,
            totalRevenue,
            totalAdvance,
            totalBalanceDue,
            totalInquiries: inquiries.length
        },
        inquiries,
        bookings,
        blockedDates
    });
});

// Create Booking Entry (Calculates Subtotal, Discount %, Net Total, and Balance)
app.post('/api/admin/bookings', (req, res) => {
    try {
        const bookings = readJson(BOOKINGS_FILE);
        const blocked = readJson(BLOCKED_FILE);

        const subtotalAmount = Number(req.body.subtotalAmount) || Number(req.body.totalAmount) || 0;
        const discountPercent = Math.max(0, Math.min(100, Number(req.body.discountPercent) || 0));
        const discountAmount = (subtotalAmount * discountPercent) / 100;
        const totalAmount = Math.max(0, subtotalAmount - discountAmount);

        const advancePaid = Number(req.body.advancePaid) || 0;
        const balanceDue = Math.max(0, totalAmount - advancePaid);
        const paymentStatus = balanceDue === 0 && totalAmount > 0 ? "Paid" : (advancePaid > 0 ? "Partial" : "Pending");

        const paymentHistory = [];
        if (advancePaid > 0) {
            paymentHistory.push({
                amount: advancePaid,
                mode: req.body.paymentMode || "UPI / Cash",
                date: new Date().toISOString().split('T')[0],
                note: "Initial Advance"
            });
        }

        const newBooking = {
            id: "BK-" + (Date.now().toString().slice(-4)),
            clientName: req.body.clientName || "VIP Client",
            clientPhone: req.body.clientPhone || "",
            clientEmail: req.body.clientEmail || "",
            venue: req.body.venue || "Main Convention Hall (25,000 Sq Ft)",
            eventType: req.body.eventType || "Grand Celebration",
            eventDate: req.body.eventDate,
            session: req.body.session || "FullDay",
            guests: Number(req.body.guests) || 0,
            subtotalAmount,
            discountPercent,
            discountAmount,
            totalAmount,
            advancePaid,
            balanceDue,
            catering: req.body.catering || "None / Self-Catering",
            decor: req.body.decor || "None / Standard Stage",
            paymentMode: req.body.paymentMode || "UPI / Cash",
            paymentStatus,
            bookingStatus: req.body.bookingStatus || "Confirmed",
            enteredBy: req.body.enteredBy || "Manager",
            notes: req.body.notes || "",
            paymentHistory,
            createdAt: new Date().toISOString()
        };

        bookings.unshift(newBooking);
        writeJson(BOOKINGS_FILE, bookings);

        if (newBooking.eventDate && !blocked.includes(newBooking.eventDate)) {
            blocked.push(newBooking.eventDate);
            writeJson(BLOCKED_FILE, blocked);
        }

        res.json({ success: true, booking: newBooking });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Update Booking Record
app.put('/api/admin/bookings/:id', (req, res) => {
    try {
        const bookings = readJson(BOOKINGS_FILE);
        const index = bookings.findIndex(b => b.id === req.params.id);

        if (index === -1) {
            return res.status(404).json({ success: false, message: "Booking not found" });
        }

        const b = bookings[index];
        const subtotalAmount = req.body.subtotalAmount !== undefined ? Number(req.body.subtotalAmount) : (b.subtotalAmount || b.totalAmount || 0);
        const discountPercent = req.body.discountPercent !== undefined ? Number(req.body.discountPercent) : (b.discountPercent || 0);
        const discountAmount = (subtotalAmount * discountPercent) / 100;
        const totalAmount = Math.max(0, subtotalAmount - discountAmount);

        const advancePaid = req.body.advancePaid !== undefined ? Number(req.body.advancePaid) : b.advancePaid;
        const balanceDue = Math.max(0, totalAmount - advancePaid);
        const paymentStatus = balanceDue === 0 && totalAmount > 0 ? "Paid" : (advancePaid > 0 ? "Partial" : "Pending");

        bookings[index] = {
            ...b,
            ...req.body,
            subtotalAmount,
            discountPercent,
            discountAmount,
            totalAmount,
            advancePaid,
            balanceDue,
            paymentStatus,
            updatedAt: new Date().toISOString()
        };

        writeJson(BOOKINGS_FILE, bookings);
        res.json({ success: true, booking: bookings[index] });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Add Partial or Remaining Payment to a Booking
app.post('/api/admin/bookings/:id/add-payment', (req, res) => {
    try {
        const bookings = readJson(BOOKINGS_FILE);
        const index = bookings.findIndex(b => b.id === req.params.id);

        if (index === -1) {
            return res.status(404).json({ success: false, message: "Booking not found" });
        }

        const b = bookings[index];
        const addedAmount = Number(req.body.amount) || 0;
        if (addedAmount <= 0) {
            return res.status(400).json({ success: false, message: "Payment amount must be greater than 0" });
        }

        const newAdvancePaid = (Number(b.advancePaid) || 0) + addedAmount;
        const newBalanceDue = Math.max(0, (Number(b.totalAmount) || 0) - newAdvancePaid);
        const newPaymentStatus = newBalanceDue === 0 ? "Paid" : "Partial";

        const history = b.paymentHistory || [];
        history.push({
            amount: addedAmount,
            mode: req.body.paymentMode || "UPI / Cash",
            date: req.body.paymentDate || new Date().toISOString().split('T')[0],
            note: req.body.note || "Remaining Balance Payment"
        });

        bookings[index] = {
            ...b,
            advancePaid: newAdvancePaid,
            balanceDue: newBalanceDue,
            paymentStatus: newPaymentStatus,
            paymentMode: req.body.paymentMode || b.paymentMode,
            paymentHistory: history,
            updatedAt: new Date().toISOString()
        };

        writeJson(BOOKINGS_FILE, bookings);
        res.json({ success: true, booking: bookings[index] });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Delete Booking Record
app.delete('/api/admin/bookings/:id', (req, res) => {
    try {
        let bookings = readJson(BOOKINGS_FILE);
        const bookingToDelete = bookings.find(b => b.id === req.params.id);
        bookings = bookings.filter(b => b.id !== req.params.id);
        writeJson(BOOKINGS_FILE, bookings);

        if (bookingToDelete && bookingToDelete.eventDate) {
            let blocked = readJson(BLOCKED_FILE);
            const hasOther = bookings.some(b => b.eventDate === bookingToDelete.eventDate);
            if (!hasOther) {
                blocked = blocked.filter(d => d !== bookingToDelete.eventDate);
                writeJson(BLOCKED_FILE, blocked);
            }
        }

        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Delete Website Inquiry Lead
app.delete('/api/admin/inquiries/:id', (req, res) => {
    try {
        let inquiries = readJson(DATA_FILE);
        inquiries = inquiries.filter(x => x.id != req.params.id);
        writeJson(DATA_FILE, inquiries);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Block Calendar Date
app.post('/api/admin/block-date', (req, res) => {
    try {
        let blocked = readJson(BLOCKED_FILE);
        if (req.body.date && !blocked.includes(req.body.date)) {
            blocked.push(req.body.date);
            writeJson(BLOCKED_FILE, blocked);
        }
        res.json({ success: true, blockedDates: blocked });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Unblock Calendar Date
app.delete('/api/admin/block-date/:date', (req, res) => {
    try {
        let blocked = readJson(BLOCKED_FILE);
        blocked = blocked.filter(d => d !== req.params.date);
        writeJson(BLOCKED_FILE, blocked);
        res.json({ success: true, blockedDates: blocked });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`ASR Convention & Resort Server active on http://localhost:${PORT}`);
    console.log(`Hidden Admin Portal active on http://localhost:${PORT}/admin`);
});
