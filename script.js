const CORRECT_PIN = "150136";
let currentInput = "";

function pressKey(key) {
    startMusic();
    if (key === 'C') {
        currentInput = "";
    } else if (key === '⌫') {
        currentInput = currentInput.slice(0, -1);
    } else {
        if (currentInput.length < CORRECT_PIN.length) {
            currentInput += key;
        }
    }
    
    updateDots();

    if (currentInput.length === CORRECT_PIN.length) {
        setTimeout(checkPin, 250);
    }
}

function updateDots() {
    const dots = document.querySelectorAll('.dot');
    dots.forEach((dot, index) => {
        if (index < currentInput.length) {
            dot.classList.add('active');
            dot.classList.remove('error');
        } else {
            dot.classList.remove('active');
            dot.classList.remove('error');
        }
    });
}

function checkPin() {
    if (currentInput === CORRECT_PIN) {
        // Éxito: Animación del candado y revelación
        const lockWrapper = document.getElementById('lockWrapper');
        const lockIcon = document.getElementById('lockIcon');
        const lockScreen = document.getElementById('lockScreen');
        const contentScreen = document.getElementById('contentScreen');

        lockWrapper.classList.add('unlock');
        // Cambiar el icono del candado a abierto dinámicamente
        lockIcon.innerHTML = '<path d="M12 17c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm6-9h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6-5c1.71 0 3.1 1.39 3.1 3.1v2H8.9V6c0-1.71 1.39-3.1 3.1-3.1z"/>';

        // Lanzar lluvia de corazones continua
        const heartInterval = setInterval(createHeart, 150);

        setTimeout(() => {
            lockScreen.classList.add('fade-out');
            setTimeout(() => {
                lockScreen.style.display = 'none';
                showScreen(contentScreen);
            }, 800);
        }, 600);

    } else {
        // Error: Animación visual de fallo
        const dots = document.querySelectorAll('.dot');
        dots.forEach(dot => {
            dot.classList.remove('active');
            dot.classList.add('error');
        });
        
        // Vibración simulada en dispositivos móviles
        if (navigator.vibrate) {
            navigator.vibrate(200);
        }

        // Limpiar después del parpadeo de error
        setTimeout(() => {
            currentInput = "";
            updateDots();
        }, 600);
    }
}

function createHeart() {
    const heart = document.createElement('div');
    heart.classList.add('heart-particle');
    heart.innerHTML = ['❤️', '💖', '💕', '💗'][Math.floor(Math.random() * 4)];
    heart.style.left = Math.random() * 100 + 'vw';
    heart.style.setProperty('--randomX', (Math.random() * 200 - 100) + 'px');
    
    // Variación de tamaño y velocidad
    const size = Math.random() * 15 + 15;
    heart.style.fontSize = size + 'px';
    heart.style.animationDuration = (Math.random() * 1.5 + 2) + 's';
    
    document.body.appendChild(heart);

    setTimeout(() => {
        heart.remove();
    }, 3500);
}


/* ---------- Navegación entre pantallas ---------- */
function showScreen(el) {
    el.style.display = 'block';
    void el.offsetWidth; // fuerza el reflow para que la transición se vea
    el.classList.add('fade-in');
    if (el.id === 'galleryScreen') layoutPhotos();
    if (el.id === 'finalScreen') startFireworks();
}

function goTo(fromId, toId) {
    const from = document.getElementById(fromId);
    const to = document.getElementById(toId);
    from.classList.remove('fade-in');
    setTimeout(() => {
        from.style.display = 'none';
        showScreen(to);
    }, 500);
}

/* ---------- Galería 3D ---------- */
// Poné acá los nombres de tus fotos de la carpeta "multimedia".
// Ejemplo: ['multimedia/foto1.jpg', 'multimedia/foto2.jpg']
// Si la lista está vacía se muestran tarjetas de ejemplo.
const FOTOS = Array.from({ length: 32 }, (_, i) => `multimedia/a${i + 1}.jpg`);

const stage = document.getElementById('stage');
const counter = document.getElementById('counter');
let photos = [];
let current = 0;
let zoomed = false;

function buildGallery() {
    const lista = FOTOS.length ? FOTOS : ['💖', '💕', '💗', '🔒', '🌹', '✨'];
    lista.forEach((src, i) => {
        const card = document.createElement('div');
        card.className = 'photo';
        if (FOTOS.length) {
            const img = document.createElement('img');
            img.src = src;
            img.alt = 'Foto ' + (i + 1);
            img.draggable = false;
            card.appendChild(img);
        } else {
            const ph = document.createElement('div');
            ph.className = 'ph';
            ph.style.background = 'linear-gradient(135deg, #ff4d79, #6a1b9a)';
            ph.textContent = src;
            card.appendChild(ph);
        }
        card.addEventListener('click', () => {
            if (dragged) return;
            if (i === current) { zoomed = !zoomed; } else { current = i; zoomed = false; }
            layoutPhotos();
        });
        stage.appendChild(card);
        photos.push(card);
    });
}

function layoutPhotos() {
    const gap = 160 * 0.42;
    photos.forEach((el, i) => {
        const o = i - current;
        const a = Math.abs(o);
        const side = Math.sign(o);
        const scale = (o === 0 && zoomed) ? 1.45 : 1;
        el.style.transform =
            `translate(-50%, -50%) translateX(${o * gap}px) translateZ(${-a * 80 + (scale > 1 ? 120 : 0)}px) rotateY(${-side * Math.min(a, 2) * 40}deg) scale(${scale})`;
        el.style.zIndex = (o === 0 && zoomed) ? 50 : 20 - a;
        el.style.opacity = a > 3 ? 0 : (a === 0 ? 1 : Math.max(0.3, 0.9 - a * 0.25));
        el.style.filter = a === 0 ? 'none' : 'brightness(0.75)';
        el.style.pointerEvents = a > 3 ? 'none' : 'auto';
        el.classList.toggle('active', o === 0);
    });
    counter.textContent = (current + 1) + ' / ' + photos.length;
}

function movePhoto(step) {
    current = (current + step + photos.length) % photos.length;
    zoomed = false;
    layoutPhotos();
}

document.getElementById('prevBtn').addEventListener('click', () => movePhoto(-1));
document.getElementById('nextPhotoBtn').addEventListener('click', () => movePhoto(1));

// Deslizar con el dedo o el mouse
let startX = null;
let dragged = false;
stage.addEventListener('pointerdown', e => { startX = e.clientX; dragged = false; });
stage.addEventListener('pointermove', e => {
    if (startX !== null && Math.abs(e.clientX - startX) > 10) dragged = true;
});
stage.addEventListener('pointerup', e => {
    if (startX === null) return;
    const dx = e.clientX - startX;
    startX = null;
    if (Math.abs(dx) > 40) movePhoto(dx < 0 ? 1 : -1);
    setTimeout(() => { dragged = false; }, 0);
});
stage.addEventListener('pointerleave', () => { startX = null; });

// Flechas del teclado
document.addEventListener('keydown', e => {
    if (!document.getElementById('galleryScreen').classList.contains('fade-in')) return;
    if (e.key === 'ArrowLeft') movePhoto(-1);
    if (e.key === 'ArrowRight') movePhoto(1);
});

buildGallery();
layoutPhotos();


/* ---------- Fuegos artificiales ---------- */
const fwCanvas = document.getElementById('fireworks');
const fwCtx = fwCanvas.getContext('2d');
let rockets = [];
let sparks = [];
let fwRunning = false;
let lastLaunch = 0;
const FW_COLORS = [0, 18, 45, 330, 300, 200, 120];

function resizeFw() {
    fwCanvas.width = window.innerWidth;
    fwCanvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeFw);

function launchRocket() {
    rockets.push({
        x: Math.random() * fwCanvas.width * 0.8 + fwCanvas.width * 0.1,
        y: fwCanvas.height,
        ty: Math.random() * fwCanvas.height * 0.4 + fwCanvas.height * 0.08,
        vy: -(Math.random() * 3 + 9),
        hue: FW_COLORS[Math.floor(Math.random() * FW_COLORS.length)]
    });
}

function explode(x, y, hue) {
    const n = 70 + Math.floor(Math.random() * 40);
    for (let i = 0; i < n; i++) {
        const ang = (Math.PI * 2 * i) / n;
        const speed = Math.random() * 4 + 1.5;
        sparks.push({
            x, y,
            vx: Math.cos(ang) * speed,
            vy: Math.sin(ang) * speed,
            life: 1,
            decay: Math.random() * 0.012 + 0.008,
            hue: hue + Math.random() * 30 - 15
        });
    }
}

function fwLoop(t) {
    if (!fwRunning) return;
    // estela: borra poco a poco en vez de limpiar del todo
    fwCtx.globalCompositeOperation = 'destination-out';
    fwCtx.fillStyle = 'rgba(0, 0, 0, 0.18)';
    fwCtx.fillRect(0, 0, fwCanvas.width, fwCanvas.height);
    fwCtx.globalCompositeOperation = 'lighter';

    if (t - lastLaunch > 650) {
        launchRocket();
        if (Math.random() < 0.35) launchRocket();
        lastLaunch = t;
    }

    rockets = rockets.filter(r => {
        r.y += r.vy;
        r.vy += 0.08;
        fwCtx.beginPath();
        fwCtx.arc(r.x, r.y, 2.2, 0, Math.PI * 2);
        fwCtx.fillStyle = `hsl(${r.hue}, 100%, 75%)`;
        fwCtx.fill();
        if (r.y <= r.ty || r.vy >= 0) {
            explode(r.x, r.y, r.hue);
            return false;
        }
        return true;
    });

    sparks = sparks.filter(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.985;
        p.vy = p.vy * 0.985 + 0.045;
        p.life -= p.decay;
        if (p.life <= 0) return false;
        fwCtx.beginPath();
        fwCtx.arc(p.x, p.y, 2, 0, Math.PI * 2);
        fwCtx.fillStyle = `hsla(${p.hue}, 100%, 62%, ${p.life})`;
        fwCtx.fill();
        return true;
    });

    requestAnimationFrame(fwLoop);
}

function startFireworks() {
    if (fwRunning) return;
    resizeFw();
    fwRunning = true;
    fwCanvas.classList.add('on');
    requestAnimationFrame(fwLoop);
}


/* ---------- Música de fondo ---------- */
const bgm = document.getElementById('bgm');
const musicBtn = document.getElementById('musicBtn');
let musicStarted = false;

// Los navegadores no dejan sonar música sin un toque del usuario,
// por eso arranca con la primera tecla que se presiona.
function startMusic() {
    if (musicStarted) return;
    musicStarted = true;
    bgm.loop = true;
    bgm.volume = 0.6;
    bgm.play().then(() => {
        musicBtn.classList.add('show');
    }).catch(() => {
        musicStarted = false; // si falló, se reintenta en el próximo toque
    });
}

// Por si alguna vez se corta, que vuelva a empezar
bgm.addEventListener('ended', () => {
    bgm.currentTime = 0;
    bgm.play();
});

musicBtn.addEventListener('click', () => {
    bgm.muted = !bgm.muted;
    musicBtn.textContent = bgm.muted ? '🔇' : '🔊';
});
