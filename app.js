/* F1 Speedway Telemetry & Physics Controller - K. Vijay Kumar */

document.addEventListener('DOMContentLoaded', () => {
    // -----------------------------------------------------------------
    // 1. SYSTEM TIME & LAPS LOGGER
    // -----------------------------------------------------------------
    const pingReadout = document.getElementById('drs-indicator');
    const systemTimeHUD = document.getElementById('live-speed-hud');

    // DRS Fluctuation indicator
    setInterval(() => {
        if (pingReadout) {
            const active = Math.random() < 0.6;
            if (active) {
                pingReadout.textContent = "ENABLED";
                pingReadout.className = "hud-val green-text";
                const drsFlag = document.getElementById('drs-flag-ui');
                if (drsFlag) drsFlag.classList.add('active');
            } else {
                pingReadout.textContent = "AVAILABLE";
                pingReadout.className = "hud-val";
                const drsFlag = document.getElementById('drs-flag-ui');
                if (drsFlag) drsFlag.classList.remove('active');
            }
        }
    }, 5000);


    // -----------------------------------------------------------------
    // 2. MOBILE NAVIGATION DRAWER
    // -----------------------------------------------------------------
    const mobileMenuBtn = document.getElementById('mobile-menu');
    const mobileNavDrawer = document.getElementById('mobile-nav-drawer');
    const mobileLinks = document.querySelectorAll('.mobile-link');

    if (mobileMenuBtn && mobileNavDrawer) {
        mobileMenuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            mobileNavDrawer.classList.toggle('open');
            const icon = mobileMenuBtn.querySelector('i');
            if (icon) {
                icon.classList.toggle('fa-bars');
                icon.classList.toggle('fa-xmark');
            }
        });

        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileNavDrawer.classList.remove('open');
                const icon = mobileMenuBtn.querySelector('i');
                if (icon) {
                    icon.className = 'fas fa-bars';
                }
            });
        });

        document.addEventListener('click', (e) => {
            if (!mobileNavDrawer.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
                mobileNavDrawer.classList.remove('open');
                const icon = mobileMenuBtn.querySelector('i');
                if (icon) {
                    icon.className = 'fas fa-bars';
                }
            }
        });
    }


    // -----------------------------------------------------------------
    // 3. INTERSECTION OBSERVER - SCROLL REVEAL & NAVIGATION
    // -----------------------------------------------------------------
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-links a');
    const revealElements = document.querySelectorAll('.scroll-reveal');

    // Reveal scroll entries
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, { threshold: 0.12 });

    revealElements.forEach(el => revealObserver.observe(el));

    // Nav bar active highlights
    const navObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }, { threshold: 0.25 });

    sections.forEach(sec => navObserver.observe(sec));


    // -----------------------------------------------------------------
    // 4. PIT DIAGNOSTIC TYPING SEQUENCE
    // -----------------------------------------------------------------
    const typedTextElement = document.getElementById('typed-text');
    const telemetryLogs = [
        "python3 race_engine_telemetry.py --map-mode=DRS_SECTORS",
        "wazuh-agent --status : SHIELD_DEFENSE_OPERATIONAL",
        "mqtt.connect('pit-lane-ecu-01', port=1883) ... SUCCESS",
        "import tensorflow as tf; cnn = tf.keras.models.load_model('aero_classifier.h5')",
        "driver.sync_biometrics(heart_rate=142, core_temp=37.6C)",
        "gemini.optimize_defending_strategy(threat='C2 Beaconing (MITRE T1071)')",
        "pi@raspberrypi:~ $ python3 edge_driver_anti_spoof.py --driver-id=KVK-P1"
    ];

    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typingSpeed = 60;

    function typeTelemetryDiagnostics() {
        if (!typedTextElement) return;

        const currentPhrase = telemetryLogs[phraseIndex];

        if (isDeleting) {
            typedTextElement.textContent = currentPhrase.substring(0, charIndex - 1);
            charIndex--;
            typingSpeed = 25; // erase fast
        } else {
            typedTextElement.textContent = currentPhrase.substring(0, charIndex + 1);
            charIndex++;
            typingSpeed = 50;
        }

        if (!isDeleting && charIndex === currentPhrase.length) {
            isDeleting = true;
            typingSpeed = 2500; // Pause at end
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            phraseIndex = (phraseIndex + 1) % telemetryLogs.length;
            typingSpeed = 500;
        }

        setTimeout(typeTelemetryDiagnostics, typingSpeed);
    }
    
    setTimeout(typeTelemetryDiagnostics, 1000);


    // -----------------------------------------------------------------
    // 5. INTERACTIVE F1 SPEEDWAY CANVAS RACETRACK
    // -----------------------------------------------------------------
    const canvas = document.getElementById('racetrackCanvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        
        let trackPoints = [];
        let cars = [];
        let smokeParticles = [];
        let mouse = { x: null, y: null, radius: 100, clickRing: 0, clickX: null, clickY: null };
        const numPoints = 600; // Granularity of track points

        // Setup Racetrack spline points
        function generateSplineTrack() {
            trackPoints = [];
            const width = canvas.width;
            const height = canvas.height;

            // 8 Control Points shaping a custom Grand Prix circuit (loop)
            const controlPoints = [
                { x: width * 0.12, y: height * 0.45 },
                { x: width * 0.28, y: height * 0.15 },
                { x: width * 0.60, y: height * 0.25 },
                { x: width * 0.88, y: height * 0.18 },
                { x: width * 0.85, y: height * 0.75 },
                { x: width * 0.55, y: height * 0.60 },
                { x: width * 0.35, y: height * 0.85 },
                { x: width * 0.18, y: height * 0.70 }
            ];

            // Interpolate smoothly using Catmull-Rom spline curves
            for (let i = 0; i < controlPoints.length; i++) {
                const p0 = controlPoints[(i - 1 + controlPoints.length) % controlPoints.length];
                const p1 = controlPoints[i];
                const p2 = controlPoints[(i + 1) % controlPoints.length];
                const p3 = controlPoints[(i + 2) % controlPoints.length];

                for (let j = 0; j < numPoints / controlPoints.length; j++) {
                    const t = j / (numPoints / controlPoints.length);
                    const pt = getCatmullRomPoint(p0, p1, p2, p3, t);
                    trackPoints.push(pt);
                }
            }
        }

        function getCatmullRomPoint(p0, p1, p2, p3, t) {
            const t2 = t * t;
            const t3 = t2 * t;
            
            const x = 0.5 * (
                (2 * p1.x) +
                (-p0.x + p2.x) * t +
                (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 +
                (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3
            );
            const y = 0.5 * (
                (2 * p1.y) +
                (-p0.y + p2.y) * t +
                (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 +
                (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3
            );
            
            return { x, y };
        }

        // Resize Canvas
        function resizeCanvas() {
            const rect = canvas.parentElement.getBoundingClientRect();
            canvas.width = rect.width;
            canvas.height = rect.height;
            generateSplineTrack();
            initCars();
        }

        window.addEventListener('resize', resizeCanvas);

        // Track Mouse Coordinates
        window.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            mouse.x = e.clientX - rect.left;
            mouse.y = e.clientY - rect.top;
        });

        window.addEventListener('mouseleave', () => {
            mouse.x = null;
            mouse.y = null;
        });

        // Click adds Turbo speed grids
        canvas.addEventListener('click', (e) => {
            const rect = canvas.getBoundingClientRect();
            mouse.clickX = e.clientX - rect.left;
            mouse.clickY = e.clientY - rect.top;
            mouse.clickRing = 1;

            addLogFeed("<span class='red-text'>&gt; Pit Radio: DRS zones recalibrated on spline.</span>");
        });

        // F1 Car Constructor
        class F1Car {
            constructor(color, speedFactor, label) {
                this.color = color;
                this.speedFactor = speedFactor; // speed baseline
                this.label = label;
                this.progress = Math.random() * numPoints; // start at random index
                this.speed = 0;
                this.angle = 0;
                this.driftAngle = 0;
                this.turbo = 0;
                this.laps = Math.floor(Math.random() * 3) + 2;
                this.gForce = 1.0;
                this.rpm = 9000;
            }

            update() {
                const prevIndex = Math.floor(this.progress) % trackPoints.length;
                
                // Calculate dynamic speed based on curvature
                // Find control coordinates around this car position
                const nextIndex = (prevIndex + 1) % trackPoints.length;
                const nextNextIndex = (prevIndex + 12) % trackPoints.length; // look ahead for bend radius

                const pCurr = trackPoints[prevIndex];
                const pNext = trackPoints[nextIndex];
                const pLookAhead = trackPoints[nextNextIndex];

                // Compute angle delta (curvature)
                const headingCurr = Math.atan2(pNext.y - pCurr.y, pNext.x - pCurr.x);
                const headingLookAhead = Math.atan2(pLookAhead.y - pNext.y, pLookAhead.x - pNext.x);
                let turnDelta = Math.abs(headingLookAhead - headingCurr);
                if (turnDelta > Math.PI) turnDelta = Math.PI * 2 - turnDelta;

                // Slow down for sharp corners, speed up on straights
                const targetSpeed = Math.max(1.2, 4.2 - (turnDelta * 5.0)) * this.speedFactor;
                
                // Smooth throttle transitions
                this.speed += (targetSpeed - this.speed) * 0.08;

                // Handle cursor turbo boost
                if (mouse.x !== null && mouse.y !== null) {
                    const dx = pCurr.x - mouse.x;
                    const dy = pCurr.y - mouse.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < mouse.radius) {
                        this.turbo = Math.min(this.turbo + 0.15, 2.5); // Charge booster
                        this.speed += this.turbo;
                        // Spawn speed sparks
                        if (Math.random() < 0.4) {
                            smokeParticles.push(new SmokeParticle(pCurr.x, pCurr.y, 'rgba(255, 24, 62, 0.8)', 2, (Math.random() - 0.5) * 1.5, (Math.random() - 0.5) * 1.5));
                        }
                    } else {
                        this.turbo = Math.max(0, this.turbo - 0.05);
                    }
                } else {
                    this.turbo = Math.max(0, this.turbo - 0.05);
                }

                // If close to click ripple, get launch boost
                if (mouse.clickX !== null) {
                    const dx = pCurr.x - mouse.clickX;
                    const dy = pCurr.y - mouse.clickY;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < mouse.clickRing + 20 && dist > mouse.clickRing - 20) {
                        this.speed += 2.0;
                    }
                }

                // Increment progress along spline path array
                this.progress += this.speed;
                const newIndex = Math.floor(this.progress);
                
                // Lap count triggers
                if (newIndex >= trackPoints.length) {
                    this.progress = 0;
                    this.laps++;
                    if (this.label === "KVK-P1") {
                        addLogFeed(`&gt; Lap ${this.laps} registered. Pit wall confirms timings.`);
                    }
                }

                // Smoothly orient heading direction
                const idx = newIndex % trackPoints.length;
                const pt = trackPoints[idx];
                const ptNext = trackPoints[(idx + 1) % trackPoints.length];
                const targetAngle = Math.atan2(ptNext.y - pt.y, ptNext.x - pt.x);

                // Angular drift simulation on high speed bends
                const angleDiff = targetAngle - this.angle;
                this.angle = targetAngle;
                
                // Drift lag angle
                this.driftAngle = angleDiff * this.speed * 2.2;
                // Clamp drift visual skew
                this.driftAngle = Math.max(-0.4, Math.min(0.4, this.driftAngle));

                // Spawn tire smoke trails when turning fast
                if (Math.abs(this.driftAngle) > 0.08 && Math.random() < 0.6) {
                    smokeParticles.push(new SmokeParticle(pt.x, pt.y, 'rgba(255,255,255,0.15)', 4)); // grey drift smoke
                    smokeParticles.push(new SmokeParticle(pt.x, pt.y, 'rgba(0,0,0,0.4)', 2.5)); // black tyre skid marks
                }

                // Telemetry mapping variables
                this.gForce = Math.max(0.6, parseFloat((1.0 + (Math.abs(turnDelta) * this.speed * 1.2)).toFixed(1)));
                this.rpm = Math.floor(6000 + (this.speed * 2400) + (Math.random() * 400));
                if (this.rpm > 12500) this.rpm = 12500;
            }

            draw() {
                const idx = Math.floor(this.progress) % trackPoints.length;
                const pt = trackPoints[idx];

                ctx.save();
                ctx.translate(pt.x, pt.y);
                ctx.rotate(this.angle + this.driftAngle);

                // Draw F1 Car profile box
                ctx.fillStyle = this.color;
                ctx.shadowBlur = this.turbo > 0 ? 8 : 0;
                ctx.shadowColor = varPrimaryGlow;
                
                // Rear wing
                ctx.fillRect(-10, -5, 2, 10);
                // Chassis arms
                ctx.strokeStyle = '#222';
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.moveTo(-6, -4); ctx.lineTo(-6, 4);
                ctx.moveTo(6, -4); ctx.lineTo(6, 4);
                ctx.stroke();

                // Tyres
                ctx.fillStyle = '#111';
                ctx.fillRect(-8, -6, 4, 3);
                ctx.fillRect(-8, 3, 4, 3);
                ctx.fillRect(4, -5.5, 3.5, 2.5);
                ctx.fillRect(4, 3, 3.5, 2.5);

                // Nosecone body
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.moveTo(-6, -3);
                ctx.lineTo(8, -2);
                ctx.lineTo(8, 2);
                ctx.lineTo(-6, 3);
                ctx.closePath();
                ctx.fill();

                // Front wing spoiler
                ctx.fillStyle = '#222';
                ctx.fillRect(7, -6, 2, 12);

                // Driver helmet indicator
                ctx.beginPath();
                ctx.arc(0, 0, 2, 0, Math.PI * 2);
                ctx.fillStyle = '#fff';
                ctx.fill();

                // Label tag
                ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
                ctx.font = '6px Space Grotesk';
                ctx.fillText(this.label, -10, -8);

                ctx.restore();
            }
        }

        // Drifting smoke & track marks
        class SmokeParticle {
            constructor(x, y, color, size, vx, vy) {
                this.x = x;
                this.y = y;
                this.color = color;
                this.size = size;
                this.vx = vx || (Math.random() - 0.5) * 0.4;
                this.vy = vy || (Math.random() - 0.5) * 0.4;
                this.alpha = 1.0;
            }

            update() {
                this.x += this.vx;
                this.y += this.vy;
                this.alpha -= 0.02;
            }

            draw() {
                ctx.save();
                ctx.globalAlpha = Math.max(0, this.alpha);
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }
        }

        const varPrimaryGlow = '#ff183e';

        function initCars() {
            cars = [];
            // Spawn 3 competitive F1 teams
            cars.push(new F1Car('#ff183e', 1.0, "KVK-P1")); // Driver red
            cars.push(new F1Car('#ffcc00', 0.95, "TEAM_GOLD")); // Yellow opponent
            cars.push(new F1Car('#00E5FF', 0.92, "TEAM_CYAN")); // Blue opponent
        }

        // Loop animation
        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // 1. Draw circuit curbs & asphalt path bounds
            ctx.beginPath();
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
            ctx.lineWidth = 32;
            ctx.setLineDash([]);
            trackPoints.forEach((pt, i) => {
                if (i === 0) ctx.moveTo(pt.x, pt.y);
                else ctx.lineTo(pt.x, pt.y);
            });
            ctx.closePath();
            ctx.stroke();

            // Inner Red/White racing kerbs boundary
            ctx.save();
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 22;
            ctx.setLineDash([8, 8]);
            ctx.beginPath();
            trackPoints.forEach((pt, i) => {
                if (i === 0) ctx.moveTo(pt.x, pt.y);
                else ctx.lineTo(pt.x, pt.y);
            });
            ctx.closePath();
            ctx.stroke();
            
            // Alternate curb stripes (red)
            ctx.strokeStyle = '#ff183e';
            ctx.setLineDash([0, 8, 8, 0]);
            ctx.stroke();
            ctx.restore();

            // Core racing line path (Asphalt center track)
            ctx.save();
            ctx.strokeStyle = '#12141c';
            ctx.lineWidth = 18;
            ctx.beginPath();
            trackPoints.forEach((pt, i) => {
                if (i === 0) ctx.moveTo(pt.x, pt.y);
                else ctx.lineTo(pt.x, pt.y);
            });
            ctx.closePath();
            ctx.stroke();
            ctx.restore();

            // Draw click wave rings
            if (mouse.clickRing > 0 && mouse.clickX !== null) {
                mouse.clickRing += 3.0;
                ctx.beginPath();
                ctx.arc(mouse.clickX, mouse.clickY, mouse.clickRing, 0, Math.PI * 2);
                ctx.strokeStyle = `rgba(255, 24, 62, ${Math.max(0, 1 - (mouse.clickRing / 100))})`;
                ctx.lineWidth = 2;
                ctx.stroke();

                if (mouse.clickRing > 100) {
                    mouse.clickRing = 0;
                    mouse.clickX = null;
                }
            }

            // 2. Draw tyre smoke particles skids
            smokeParticles.forEach((sp, i) => {
                sp.update();
                sp.draw();
                if (sp.alpha <= 0) {
                    smokeParticles.splice(i, 1);
                }
            });

            // 3. Update & Draw racing cars
            cars.forEach(car => {
                car.update();
                car.draw();
            });

            // 4. Update HUD values from leading car KVK-P1
            updateHUDTelemetry(cars[0]);

            requestAnimationFrame(animate);
        }

        // HUD panel selectors
        const liveSpeedHUD = document.getElementById('live-speed-hud');
        const dialSpeedVal = document.getElementById('hud-speed');
        const speedPointer = document.getElementById('speed-pointer');
        const hudLap = document.getElementById('hud-lap');
        const hudGforce = document.getElementById('hud-gforce');
        const hudRpm = document.getElementById('hud-rpm');

        function updateHUDTelemetry(leadCar) {
            if (!leadCar) return;

            // Convert velocity progress steps to KM/H metrics (arbitrary scale)
            const speedKmh = Math.floor(leadCar.speed * 74);
            
            if (liveSpeedHUD) liveSpeedHUD.textContent = `${speedKmh} KM/H`;
            if (dialSpeedVal) dialSpeedVal.textContent = speedKmh;

            // Rotate dial needle indicator pointer (-90deg to +90deg range)
            if (speedPointer) {
                const angleDeg = -90 + (speedKmh / 360) * 180;
                speedPointer.style.transform = `rotate(${angleDeg}deg)`;
            }

            if (hudLap) hudLap.textContent = `${leadCar.laps} / 57`;
            if (hudGforce) hudGforce.textContent = `${leadCar.gForce} G`;
            if (hudRpm) hudRpm.textContent = leadCar.rpm.toLocaleString();
        }

        // Start
        resizeCanvas();
        animate();
    }


    // -----------------------------------------------------------------
    // 6. REAL-TIME WIDGETS LOG FEED
    // -----------------------------------------------------------------
    const logFeed = document.getElementById('telemetry-log-feed');
    const journalEntries = [
        "Transmitting radio packets via UDP socket... SUCCESS",
        "ECU logs check: Water temp 98.4C, Gear 5 selected",
        "Driver DRS flap activated. Downforce profile: REDUCED",
        "Race control SIEM firewall: Ports scanning filtered",
        "Pit telemetry socket packet: Handshake complete",
        "Driver recognition scans: Bounding box anti-spoof check",
        "Wazuh SIEM daemon: Ingesting telemetry data...",
        "Pit Radio: BOX BOX BOX for soft compound tyre swap."
    ];

    function addLogFeed(msg) {
        if (!logFeed) return;
        const p = document.createElement('p');
        p.innerHTML = msg;
        logFeed.appendChild(p);

        if (logFeed.children.length > 4) {
            logFeed.removeChild(logFeed.firstChild);
        }
        logFeed.scrollTop = logFeed.scrollHeight;
    }

    setInterval(() => {
        const randEntry = journalEntries[Math.floor(Math.random() * journalEntries.length)];
        addLogFeed(`&gt; ${randEntry}`);
    }, 4500);


    // -----------------------------------------------------------------
    // 7. PROJECT WIDGETS SIMULATIONS
    // -----------------------------------------------------------------
    
    // A. AI Cyber Defence (ACDS) console alerts
    const acdsConsole = document.getElementById('acds-console');
    const threatLogs = [
        { type: 'danger', msg: '[CRITICAL] FIREWALL COLLISION AT SECTOR 2 IP: 10.0.1.25' },
        { type: 'log', msg: '> Vulnerability: MITRE T1071 C2 command beacons.' },
        { type: 'log', msg: '> Requesting Gemini 2.0 AI incident responder...' },
        { type: 'success', msg: '> Gemini Playbook: Reroute traffic via secure proxy.' },
        { type: 'log', msg: '> Node isolated. Threat neutralized. Sector 2: SECURE.' },
        { type: 'log', msg: '> Parsing Filebeat pipeline logs...' },
        { type: 'danger', msg: '[WARNING] BRUTE-FORCE INTRUSION DETECTED AT PIT RECEPTOR' }
    ];
    let threatLogIdx = 0;

    setInterval(() => {
        if (!acdsConsole) return;
        
        const log = threatLogs[threatLogIdx];
        let elementStr = '';
        
        if (log.type === 'danger') {
            elementStr = `<div class="sec-alert danger-alert"><span class="blink">${log.msg.split(' ')[0]}</span> ${log.msg.substring(log.msg.indexOf(' ') + 1)}</div>`;
        } else if (log.type === 'success') {
            elementStr = `<div class="sec-alert success-alert">${log.msg}</div>`;
        } else {
            elementStr = `<div class="console-log">${log.msg}</div>`;
        }

        acdsConsole.innerHTML += elementStr;
        if (acdsConsole.children.length > 5) {
            acdsConsole.removeChild(acdsConsole.firstChild);
        }
        acdsConsole.scrollTop = acdsConsole.scrollHeight;

        threatLogIdx = (threatLogIdx + 1) % threatLogs.length;
    }, 5000);

    // B. Driver Scanner ID Identification
    const scannerStatusTag = document.getElementById('scanner-status-tag');
    const scannerBboxLabel = document.getElementById('scanner-bbox-label');
    const browPath = document.getElementById('face-brow');
    
    const faceIdentities = [
        { name: "VIJAY_KUMAR // DRIVER_P1", spoof: "OK", logged: "DRIVER LOGGED" },
        { name: "UNKNOWN_BIOMETRIC", spoof: "WARNING", logged: "PIT ACCESS DENIED" },
        { name: "SPOOF_BYPASS_ATTEMPT", spoof: "SPOOF DETECTED", logged: "ALERT INCIDENT" }
    ];
    let faceIdx = 0;

    setInterval(() => {
        if (!scannerBboxLabel || !scannerStatusTag) return;
        
        faceIdx = (faceIdx + 1) % faceIdentities.length;
        const identity = faceIdentities[faceIdx];

        scannerBboxLabel.textContent = identity.name;
        
        if (identity.spoof === "OK") {
            scannerStatusTag.textContent = identity.logged;
            scannerStatusTag.className = "tag green";
            scannerBboxLabel.style.background = "#10B981";
            if (browPath) browPath.setAttribute('stroke', '#10B981');
        } else {
            scannerStatusTag.textContent = identity.spoof;
            scannerStatusTag.className = "tag";
            scannerStatusTag.style.borderColor = "var(--primary)";
            scannerStatusTag.style.color = "var(--primary)";
            scannerStatusTag.style.background = "rgba(255, 24, 62, 0.08)";
            scannerBboxLabel.style.background = "var(--primary)";
            if (browPath) browPath.setAttribute('stroke', '#ff183e');
        }
    }, 6000);


    // -----------------------------------------------------------------
    // 8. CONTACT FORM BROADCASTER
    // -----------------------------------------------------------------
    const contactForm = document.getElementById('contact-form');
    const submitBtn = document.getElementById('form-submit-btn');
    const statusMsg = document.getElementById('transmission-status-msg');

    if (contactForm && submitBtn && statusMsg) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const name = document.getElementById('form-name').value;
            submitBtn.disabled = true;
            submitBtn.innerHTML = 'TRANSMITTING RADIO... <i class="fas fa-spinner fa-spin"></i>';
            statusMsg.className = 'transmission-status text-muted';
            
            let consoleLines = [
                `[INFO] Packetizing audio feed payload from: ${name}...`,
                `[INFO] Handshaking pit receptor on frequency 868.4MHz...`,
                `[INFO] Encrypting packet via RSA keys... OK`,
                `[SUCCESS] Dispatch logged. ACK 200 received. Radio link operational.`
            ];

            let lineIdx = 0;
            statusMsg.innerHTML = '';

            function printConsoleLog() {
                if (lineIdx < consoleLines.length) {
                    const p = document.createElement('div');
                    p.textContent = consoleLines[lineIdx];
                    p.className = consoleLines[lineIdx].includes('[SUCCESS]') ? 'green-text' : 'text-muted';
                    statusMsg.appendChild(p);
                    lineIdx++;
                    setTimeout(printConsoleLog, 600);
                } else {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = 'TRANSMIT_DISPATCH() <i class="fas fa-paper-plane"></i>';
                    contactForm.reset();
                    addLogFeed(`\`&gt; Radio packet logged from Team Call Sign: ${name}.\``);
                }
            }

            setTimeout(printConsoleLog, 300);
        });
    }
});
