/**
 * ASR CONVENTION & RESORT - CONTEMPORARY LUXURY ENGINE
 * Subtle WebGL Atmosphere, 3D Perspective Tilt, Interactive Venue Showcase,
 * Clean Budget Estimator & Gallery Lightbox.
 */

(function () {
    'use strict';

    // --- 1. SUBTLE 3D WEBGL HERO CANVAS ---
    class WebGLHeroAtmosphere {
        constructor(canvasId = 'webgl-hero-canvas') {
            this.canvas = document.getElementById(canvasId);
            if (!this.canvas || typeof THREE === 'undefined') return;

            this.scene = null;
            this.camera = null;
            this.renderer = null;
            this.particleMesh = null;
            this.mouseX = 0;
            this.mouseY = 0;
            this.targetMouseX = 0;
            this.targetMouseY = 0;
            this.clock = new THREE.Clock();

            this.init();
        }

        init() {
            const width = this.canvas.clientWidth || window.innerWidth;
            const height = this.canvas.clientHeight || (window.innerHeight * 0.9);

            this.scene = new THREE.Scene();
            this.camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
            this.camera.position.z = 75;

            this.renderer = new THREE.WebGLRenderer({
                canvas: this.canvas,
                alpha: true,
                antialias: true,
                powerPreference: 'high-performance'
            });
            this.renderer.setSize(width, height);
            this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

            // Soft neutral champagne particles
            const particleCount = window.innerWidth < 768 ? 600 : 1400;
            const geometry = new THREE.BufferGeometry();
            const positions = new Float32Array(particleCount * 3);

            for (let i = 0; i < particleCount; i++) {
                const i3 = i * 3;
                positions[i3] = (Math.random() - 0.5) * 160;
                positions[i3 + 1] = (Math.random() - 0.5) * 90;
                positions[i3 + 2] = (Math.random() - 0.5) * 90;
            }

            geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

            const canvas = document.createElement('canvas');
            canvas.width = 32;
            canvas.height = 32;
            const ctx = canvas.getContext('2d');
            const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
            gradient.addColorStop(0, 'rgba(235, 225, 205, 0.8)');
            gradient.addColorStop(0.5, 'rgba(215, 195, 160, 0.3)');
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, 32, 32);

            const texture = new THREE.Texture(canvas);
            texture.needsUpdate = true;

            const material = new THREE.PointsMaterial({
                size: 2.0,
                map: texture,
                transparent: true,
                depthWrite: false,
                opacity: 0.65
            });

            this.particleMesh = new THREE.Points(geometry, material);
            this.scene.add(this.particleMesh);

            window.addEventListener('resize', () => this.onResize());
            window.addEventListener('mousemove', (e) => this.onMouseMove(e));

            this.animate();
        }

        onResize() {
            if (!this.canvas || !this.renderer || !this.camera) return;
            const width = this.canvas.clientWidth || window.innerWidth;
            const height = this.canvas.clientHeight || (window.innerHeight * 0.9);

            this.camera.aspect = width / height;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(width, height);
        }

        onMouseMove(e) {
            this.targetMouseX = (e.clientX / window.innerWidth - 0.5) * 20;
            this.targetMouseY = (e.clientY / window.innerHeight - 0.5) * 20;
        }

        animate() {
            requestAnimationFrame(() => this.animate());
            const elapsedTime = this.clock.getElapsedTime();

            this.mouseX += (this.targetMouseX - this.mouseX) * 0.04;
            this.mouseY += (this.targetMouseY - this.mouseY) * 0.04;

            if (this.particleMesh) {
                const positions = this.particleMesh.geometry.attributes.position.array;
                for (let i = 0; i < positions.length; i += 3) {
                    const x = positions[i];
                    positions[i + 1] += Math.sin(elapsedTime * 0.5 + x * 0.04) * 0.02;
                }
                this.particleMesh.geometry.attributes.position.needsUpdate = true;
                this.particleMesh.rotation.y = elapsedTime * 0.02 + this.mouseX * 0.01;
            }

            this.camera.position.x += (this.mouseX - this.camera.position.x) * 0.03;
            this.camera.position.y += (-this.mouseY - this.camera.position.y) * 0.03;
            this.camera.lookAt(this.scene.position);

            this.renderer.render(this.scene, this.camera);
        }
    }

    // --- 2. 3D CARD PERSPECTIVE TILT ---
    class Card3DTiltEngine {
        constructor() {
            this.cards = document.querySelectorAll('.tilt-3d, .feature-card, .event-card, .venue-display-panel, .quote-wrapper, .blog-post-card');
            this.init();
        }

        init() {
            this.cards.forEach(card => {
                card.addEventListener('mousemove', (e) => this.handleMouseMove(e, card));
                card.addEventListener('mouseleave', () => this.handleMouseLeave(card));
            });
        }

        handleMouseMove(e, card) {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = ((y - centerY) / centerY) * -5;
            const rotateY = ((x - centerX) / centerX) * 5;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
        }

        handleMouseLeave(card) {
            card.style.transition = 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
            card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)';
        }
    }

    // --- 3. INTERACTIVE VENUE SHOWCASE ---
    class VenueExplorer {
        constructor() {
            this.tabs = document.querySelectorAll('.venue-nav-tab');
            this.panels = document.querySelectorAll('.venue-display-panel');
            this.init();
        }

        init() {
            if (!this.tabs.length) return;

            this.tabs.forEach(tab => {
                tab.addEventListener('click', () => {
                    const targetId = tab.getAttribute('data-venue');
                    this.tabs.forEach(t => t.classList.remove('active'));
                    this.panels.forEach(p => p.classList.remove('active'));

                    tab.classList.add('active');
                    const targetPanel = document.getElementById(`venue-${targetId}`);
                    if (targetPanel) {
                        targetPanel.classList.add('active');
                    }
                });
            });
        }
    }

    // --- 4. CLEAN QUOTE & BUDGET ESTIMATOR WITH LIVE SESSION AVAILABILITY ---
    class QuoteEstimator {
        constructor() {
            this.form = document.getElementById('quoteForm');
            this.categorySelect = document.getElementById('mainCategory');
            this.guestsInput = document.getElementById('guests');
            this.eventTypeSelect = document.getElementById('eventType');
            this.dateInput = document.getElementById('eventDate');
            this.sessionSelect = document.getElementById('session');
            this.availabilityNote = document.getElementById('dateAvailabilityNote');
            this.summaryGuests = document.getElementById('est-guests-val');
            this.summaryVenue = document.getElementById('est-venue-val');
            this.summaryEstimate = document.getElementById('est-total-val');
            this.addons = document.querySelectorAll('.addon-checkbox');

            this.availabilityMap = {};
            this.fpInstance = null;

            this.init();
        }

        async init() {
            if (!this.form) return;

            const self = this;

            // Initialize Flatpickr with visual day/night booking indicators
            if (typeof flatpickr !== 'undefined' && this.dateInput) {
                this.fpInstance = flatpickr(this.dateInput, {
                    disableMobile: "true",
                    minDate: "today",
                    dateFormat: "Y-m-d",
                    onDayCreate: (dObj, dStr, fp, dayElem) => {
                        self.styleSingleDayElem(dayElem, fp);
                    },
                    onOpen: () => {
                        self.applyAvailabilityStyles();
                    },
                    onChange: (selectedDates, dateStr) => {
                        self.handleDateSelected(dateStr);
                    },
                    onMonthChange: () => {
                        setTimeout(() => self.applyAvailabilityStyles(), 20);
                    },
                    onYearChange: () => {
                        setTimeout(() => self.applyAvailabilityStyles(), 20);
                    }
                });
            }

            // Load live booked dates and sessions from server & apply styles
            await this.loadAvailability();

            // Re-fetch fresh availability whenever user focuses date field
            if (this.dateInput) {
                this.dateInput.addEventListener('focus', () => {
                    this.loadAvailability();
                    this.applyAvailabilityStyles();
                });
                this.dateInput.addEventListener('change', (e) => this.handleDateSelected(e.target.value));
            }

            if (this.categorySelect) {
                this.categorySelect.addEventListener('change', () => {
                    this.updateEventDropdown();
                    this.recalculateLiveEstimate();
                });
            }

            if (this.guestsInput) {
                this.guestsInput.addEventListener('input', () => this.recalculateLiveEstimate());
            }

            if (this.sessionSelect) {
                this.sessionSelect.addEventListener('change', () => this.recalculateLiveEstimate());
            }

            if (this.eventTypeSelect) {
                this.eventTypeSelect.addEventListener('change', () => this.recalculateLiveEstimate());
            }

            this.addons.forEach(checkbox => {
                checkbox.addEventListener('change', () => this.recalculateLiveEstimate());
            });

            this.form.addEventListener('submit', (e) => this.handleSubmit(e));

            // Initial population of event types
            this.updateEventDropdown();
        }

        async loadAvailability() {
            try {
                const res = await fetch('/api/public/availability?t=' + Date.now());
                const data = await res.json();
                if (data.success && data.availability) {
                    this.availabilityMap = data.availability;
                    this.applyAvailabilityStyles();
                    if (this.dateInput && this.dateInput.value) {
                        this.handleDateSelected(this.dateInput.value);
                    }
                }
            } catch (err) {
                console.error('Availability load error:', err);
            }
        }

        styleSingleDayElem(dayElem, fp) {
            if (!dayElem || !dayElem.dateObj) return;
            const formatter = fp || this.fpInstance;
            const dateStr = formatter ? formatter.formatDate(dayElem.dateObj, "Y-m-d") : `${dayElem.dateObj.getFullYear()}-${String(dayElem.dateObj.getMonth() + 1).padStart(2, '0')}-${String(dayElem.dateObj.getDate()).padStart(2, '0')}`;
            const info = this.availabilityMap[dateStr];

            dayElem.classList.remove('fp-fully-booked', 'fp-day-booked', 'fp-night-booked');

            if (info) {
                if (info.status === 'full') {
                    dayElem.classList.add('fp-fully-booked');
                    dayElem.setAttribute('title', '🔴 FULLY BOOKED (Day & Night)');
                    dayElem.style.setProperty('background-color', '#fee2e2', 'important');
                    dayElem.style.setProperty('color', '#991b1b', 'important');
                    dayElem.style.setProperty('border', '1.5px solid #dc2626', 'important');
                    dayElem.style.setProperty('font-weight', '900', 'important');
                } else if (info.status === 'day_booked') {
                    dayElem.classList.add('fp-day-booked');
                    dayElem.setAttribute('title', '☀️ Day Booked (Night Free)');
                    dayElem.style.setProperty('background-color', '#fef3c7', 'important');
                    dayElem.style.setProperty('color', '#92400e', 'important');
                    dayElem.style.setProperty('border', '1.5px solid #f59e0b', 'important');
                    dayElem.style.setProperty('font-weight', '900', 'important');
                } else if (info.status === 'night_booked') {
                    dayElem.classList.add('fp-night-booked');
                    dayElem.setAttribute('title', '🌙 Night Booked (Day Free)');
                    dayElem.style.setProperty('background-color', '#ede9fe', 'important');
                    dayElem.style.setProperty('color', '#5b21b6', 'important');
                    dayElem.style.setProperty('border', '1.5px solid #8b5cf6', 'important');
                    dayElem.style.setProperty('font-weight', '900', 'important');
                }
            }
        }

        applyAvailabilityStyles() {
            if (!this.fpInstance || !this.fpInstance.calendarContainer) return;
            const dayElems = this.fpInstance.calendarContainer.querySelectorAll('.flatpickr-day');
            dayElems.forEach(dayElem => {
                this.styleSingleDayElem(dayElem, this.fpInstance);
            });
        }

        handleDateSelected(dateStr) {
            if (!this.availabilityNote || !this.sessionSelect) return;
            const info = this.availabilityMap[dateStr];

            // Re-apply visual styles to Flatpickr
            this.applyAvailabilityStyles();

            // Reset session options
            const optDay = this.sessionSelect.querySelector('option[value="Day"]');
            const optNight = this.sessionSelect.querySelector('option[value="Night"]');
            const optFull = this.sessionSelect.querySelector('option[value="FullDay"]');

            if (optDay) optDay.disabled = false;
            if (optNight) optNight.disabled = false;
            if (optFull) optFull.disabled = false;

            if (optDay) optDay.textContent = 'Day Session (Morning/Afternoon)';
            if (optNight) optNight.textContent = 'Evening / Night Session';
            if (optFull) optFull.textContent = 'Full 24-Hour Package';

            this.availabilityNote.style.display = 'block';

            if (!info || info.status === 'available') {
                this.availabilityNote.innerHTML = `<div style="background:#e6f7ec; border:1px solid #bbf7d0; color:#166534; padding:8px 12px; border-radius:6px; font-weight:700;"><i class="fas fa-check-circle"></i> 🟢 Date Available: Both Day and Night sessions are open!</div>`;
            } else if (info.status === 'full') {
                this.availabilityNote.innerHTML = `<div style="background:#fee2e2; border:1.5px solid #dc2626; color:#991b1b; padding:10px 14px; border-radius:8px; font-weight:800;"><i class="fas fa-times-circle" style="color:#dc2626;"></i> 🔴 FULLY BOOKED: Both Day and Night slots are booked on ${dateStr}. Please pick another date.</div>`;
                if (optDay) { optDay.disabled = true; optDay.textContent = 'Day Session (BOOKED)'; }
                if (optNight) { optNight.disabled = true; optNight.textContent = 'Night Session (BOOKED)'; }
                if (optFull) { optFull.disabled = true; optFull.textContent = 'Full Day (UNAVAILABLE)'; }
                this.sessionSelect.value = '';
            } else if (info.status === 'day_booked') {
                this.availabilityNote.innerHTML = `<div style="background:#fef3c7; border:1.5px solid #f59e0b; color:#92400e; padding:10px 14px; border-radius:8px; font-weight:800;"><i class="fas fa-sun" style="color:#d97706;"></i> ☀️ Day Slot is Booked. 🌙 Night Session is AVAILABLE!</div>`;
                if (optDay) { optDay.disabled = true; optDay.textContent = 'Day Session (BOOKED - Unavailable)'; }
                if (optFull) { optFull.disabled = true; optFull.textContent = 'Full 24-Hour (Unavailable)'; }
                if (optNight) { optNight.disabled = false; optNight.textContent = 'Evening / Night Session (Available)'; }
                this.sessionSelect.value = 'Night';
            } else if (info.status === 'night_booked') {
                this.availabilityNote.innerHTML = `<div style="background:#ede9fe; border:1.5px solid #8b5cf6; color:#5b21b6; padding:10px 14px; border-radius:8px; font-weight:800;"><i class="fas fa-moon" style="color:#7c3aed;"></i> 🌙 Night Slot is Booked. ☀️ Day Session is AVAILABLE!</div>`;
                if (optNight) { optNight.disabled = true; optNight.textContent = 'Night Session (BOOKED - Unavailable)'; }
                if (optFull) { optFull.disabled = true; optFull.textContent = 'Full 24-Hour (Unavailable)'; }
                if (optDay) { optDay.disabled = false; optDay.textContent = 'Day Session (Available)'; }
                this.sessionSelect.value = 'Day';
            }
        }

        updateEventDropdown() {
            if (!this.eventTypeSelect) return;
            this.eventTypeSelect.innerHTML = '<option value="">Select Event Type...</option>';

            // Individual event options listed one by one (No combined "&")
            const individualEvents = [
                "Wedding",
                "Reception",
                "Engagement",
                "Birthday Party",
                "Sangeet",
                "Mehendi Ceremony",
                "Haldi Ceremony",
                "Corporate Meeting",
                "Conference / Seminar",
                "Product Launch",
                "Award Ceremony",
                "Family Get-Together",
                "Pool Party",
                "Anniversary Celebration",
                "Other Event"
            ];

            individualEvents.forEach(evt => {
                const opt = document.createElement('option');
                opt.value = evt;
                opt.textContent = evt;
                this.eventTypeSelect.appendChild(opt);
            });
        }

        recalculateLiveEstimate() {
            const category = this.categorySelect ? this.categorySelect.value : '';
            const guests = parseInt(this.guestsInput ? this.guestsInput.value : 0) || 0;

            if (this.summaryGuests) {
                this.summaryGuests.textContent = guests > 0 ? `${guests} Guests` : '—';
            }
            if (this.summaryVenue) {
                let venueName = '—';
                if (category === 'convention') venueName = 'Main Convention Hall (25k Sq Ft)';
                else if (category === 'mini_hall') venueName = 'Mini Banquet Hall (10k Sq Ft)';
                else if (category === 'resort') venueName = 'Resort & Poolside';
                this.summaryVenue.textContent = venueName;
            }

            if (this.summaryEstimate) {
                if (guests > 0 && category) {
                    this.summaryEstimate.textContent = 'Custom Package Prepared';
                } else {
                    this.summaryEstimate.textContent = 'Awaiting Details';
                }
            }
        }

        async handleSubmit(e) {
            e.preventDefault();

            const name = document.getElementById('name') ? document.getElementById('name').value : '';
            const phone = document.getElementById('phone') ? document.getElementById('phone').value : '';
            const email = document.getElementById('email') ? document.getElementById('email').value : '';
            const category = this.categorySelect ? this.categorySelect.value : '';
            const eventType = this.eventTypeSelect ? this.eventTypeSelect.value : '';
            const date = this.dateInput ? this.dateInput.value : '';
            const session = this.sessionSelect ? this.sessionSelect.value : '';
            const catering = document.getElementById('cateringOption') ? document.getElementById('cateringOption').value : 'None / Self-Catering';
            const decor = document.getElementById('decorOption') ? document.getElementById('decorOption').value : 'None / Standard Stage';
            const guests = this.guestsInput ? this.guestsInput.value : '';

            // Check if selected date is fully booked
            const info = this.availabilityMap[date];
            if (info && info.status === 'full') {
                alert(`Note: The selected date (${date}) is currently fully booked for all sessions. Our team will contact you with nearby available dates.`);
            }

            const selectedAddons = [];
            this.addons.forEach(box => {
                if (box.checked) selectedAddons.push(box.value);
            });

            const formData = {
                id: Date.now(),
                name,
                phone,
                email,
                category,
                eventType,
                eventDate: date,
                session,
                guests,
                catering,
                decor,
                addons: selectedAddons,
                submittedAt: new Date().toISOString()
            };

            try {
                fetch('/submit-quote', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                }).catch(err => console.log('Quote sync note:', err));
            } catch (err) {}

            let venueTitle = 'Main Convention Hall (25,000 Sq Ft)';
            if (category === 'mini_hall') venueTitle = 'Mini Convention & Banquet Hall (10,000 Sq Ft)';
            else if (category === 'resort') venueTitle = 'Oasis Pool & Resort Stay';

            const lines = [
                "🏛️ ASR CONVENTION & RESORT - QUOTATION REQUEST",
                "----------------------------------------",
                `👤 Client Name: ${name}`,
                `📞 Phone Number: ${phone}`,
                `✉️ Email Address: ${email}`,
                `📍 Preferred Venue: ${venueTitle}`,
                `🎉 Event Type: ${eventType}`,
                `📅 Preferred Date: ${date}`,
                `⏰ Session: ${session}`,
                `👥 Expected Guests: ${guests}`,
                `🍽️ Catering Package: ${catering}`,
                `✨ Stage & Decor Theme: ${decor}`,
                (selectedAddons.length ? `🌟 Requested Add-ons: ${selectedAddons.join(', ')}` : ''),
                "----------------------------------------",
                "Please share official quotation package and confirm date availability."
            ].filter(Boolean);

            const fullText = lines.join("\n");
            const whatsappURL = `https://api.whatsapp.com/send/?phone=919949400123&text=${encodeURIComponent(fullText)}`;

            // Copy to clipboard for 100% reliable paste on desktop apps
            try {
                if (navigator.clipboard) {
                    navigator.clipboard.writeText(fullText);
                }
            } catch (err) {}

            const modal = document.getElementById('successModal');
            if (modal) {
                const modalContent = modal.querySelector('.modal-card');
                if (modalContent) {
                    modalContent.innerHTML = `
                        <i class="fab fa-whatsapp" style="font-size: 48px; color: #25D366; margin-bottom: 14px;"></i>
                        <h3 style="font-size: 1.5rem; color: var(--brand-charcoal); margin-bottom: 6px;">Quotation Request Prepared</h3>
                        <p style="color: var(--text-charcoal-70); font-size: 0.9rem; margin-bottom: 16px;">
                            Your inquiry has been recorded and copied to clipboard.
                        </p>
                        <div style="background: #faf6ea; border: 1px solid rgba(216,148,46,0.3); border-radius: 8px; padding: 12px; font-size: 0.82rem; text-align: left; max-height: 120px; overflow-y: auto; white-space: pre-line; margin-bottom: 18px; color: #05292c;">
                            ${fullText}
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 10px;">
                            <a href="${whatsappURL}" target="_blank" class="btn-quote-gold" style="width: 100%; height: 46px; font-size: 0.92rem; text-decoration: none;">
                                <i class="fab fa-whatsapp"></i> Open WhatsApp Now
                            </a>
                            <button onclick="document.getElementById('successModal').style.display='none'" class="btn-call" style="width: 100%; height: 38px; color: var(--brand-charcoal) !important; border-color: var(--brand-charcoal);">
                                Close
                            </button>
                        </div>
                    `;
                }
                modal.style.display = 'flex';
            }

            setTimeout(() => {
                window.open(whatsappURL, '_blank');
            }, 600);
        }
    }

    // --- 5. GALLERY LIGHTBOX ---
    class GalleryLightbox {
        constructor() {
            this.items = document.querySelectorAll('.gallery-item');
            this.lightbox = document.getElementById('luxuryLightbox');
            this.lightboxImg = document.getElementById('lightboxImg');
            this.lightboxCaption = document.getElementById('lightboxCaption');
            this.closeBtn = document.getElementById('lightboxClose');
            this.filters = document.querySelectorAll('.gallery-filter-btn');

            this.init();
        }

        init() {
            if (!this.items.length) return;

            this.items.forEach(item => {
                item.addEventListener('click', () => {
                    const img = item.querySelector('img');
                    const caption = item.querySelector('.gallery-overlay span') || { textContent: 'ASR Convention' };
                    if (img && this.lightbox && this.lightboxImg) {
                        this.lightboxImg.src = img.src;
                        if (this.lightboxCaption) this.lightboxCaption.textContent = caption.textContent;
                        this.lightbox.classList.add('active');
                    }
                });
            });

            if (this.closeBtn && this.lightbox) {
                this.closeBtn.addEventListener('click', () => this.lightbox.classList.remove('active'));
                this.lightbox.addEventListener('click', (e) => {
                    if (e.target === this.lightbox) this.lightbox.classList.remove('active');
                });
            }

            this.filters.forEach(btn => {
                btn.addEventListener('click', () => {
                    const cat = btn.getAttribute('data-filter');
                    this.filters.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');

                    this.items.forEach(item => {
                        const itemCat = item.getAttribute('data-category');
                        if (cat === 'all' || itemCat === cat) {
                            item.style.display = 'block';
                            setTimeout(() => { item.style.opacity = '1'; }, 20);
                        } else {
                            item.style.opacity = '0';
                            setTimeout(() => { item.style.display = 'none'; }, 250);
                        }
                    });
                });
            });
        }
    }

    // --- 6. SCROLL REVEAL & STATS COUNTER ---
    class ScrollEffects {
        constructor() {
            this.revealElements = document.querySelectorAll('.feature-card, .event-card, .stat-item');
            this.counters = document.querySelectorAll('.stat-counter');
            this.countersAnimated = false;
            this.init();
        }

        init() {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        if (!this.countersAnimated && entry.target.closest('.stats-ribbon')) {
                            this.animateCounters();
                            this.countersAnimated = true;
                        }
                    }
                });
            }, { threshold: 0.15 });

            this.revealElements.forEach(el => observer.observe(el));

            const header = document.querySelector('.main-header');
            window.addEventListener('scroll', () => {
                if (!header) return;
                if (window.scrollY > 40) {
                    header.classList.add('scrolled');
                } else {
                    header.classList.remove('scrolled');
                }
            });
        }

        animateCounters() {
            this.counters.forEach(counter => {
                const target = parseInt(counter.getAttribute('data-target')) || 0;
                let current = 0;
                const increment = target / 40;
                const updateCounter = () => {
                    current += increment;
                    if (current < target) {
                        counter.textContent = Math.ceil(current).toLocaleString();
                        requestAnimationFrame(updateCounter);
                    } else {
                        counter.textContent = target.toLocaleString() + (counter.getAttribute('data-suffix') || '');
                    }
                };
                updateCounter();
            });
        }
    }

    // --- 7. MOBILE NAVIGATION ENGINE ---
    // --- 7. MOBILE NAVIGATION ENGINE ---
    class Navigation {
        constructor() {
            this.menuBtn = document.getElementById('mobile-menu');
            this.navList = document.getElementById('nav-list');
            this.init();
        }

        init() {
            if (!this.menuBtn || !this.navList) return;

            // Create mobile backdrop if not present
            let backdrop = document.getElementById('nav-backdrop');
            if (!backdrop) {
                backdrop = document.createElement('div');
                backdrop.id = 'nav-backdrop';
                backdrop.className = 'mobile-menu-backdrop';
                document.body.appendChild(backdrop);
            }
            this.backdrop = backdrop;

            // Toggle drawer
            const toggleMenu = (e) => {
                if (e) {
                    e.preventDefault();
                    e.stopPropagation();
                }
                const isOpen = this.navList.classList.contains('active');
                if (isOpen) {
                    this.closeMenu();
                } else {
                    this.openMenu();
                }
            };

            this.menuBtn.addEventListener('click', toggleMenu);
            this.backdrop.addEventListener('click', () => this.closeMenu());

            // Close when clicking any nav link
            this.navList.querySelectorAll('a').forEach(link => {
                link.addEventListener('click', () => this.closeMenu());
            });

            // Close on ESC key
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && this.navList.classList.contains('active')) {
                    this.closeMenu();
                }
            });
        }

        openMenu() {
            this.navList.classList.add('active');
            this.menuBtn.classList.add('active');
            if (this.backdrop) this.backdrop.classList.add('active');
            document.body.style.overflow = 'hidden';
        }

        closeMenu() {
            this.navList.classList.remove('active');
            this.menuBtn.classList.remove('active');
            if (this.backdrop) this.backdrop.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    // --- INITIALIZATION ---
    document.addEventListener('DOMContentLoaded', () => {
        window.webglAtmosphere = new WebGLHeroAtmosphere('webgl-hero-canvas');
        window.card3DTilt = new Card3DTiltEngine();
        window.venueExplorer = new VenueExplorer();
        window.quoteEstimator = new QuoteEstimator();
        window.galleryLightbox = new GalleryLightbox();
        window.scrollEffects = new ScrollEffects();
        window.navigation = new Navigation();

        console.log('ASR Convention & Resort: Contemporary Neutral Luxury Engine Online.');
    });

})();
