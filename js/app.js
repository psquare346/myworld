/* ============================================
   App – Core site logic, animations, modals
   ============================================ */

// ---- Neural Network Canvas Background ----
(function () {
  const canvas = document.getElementById('neural-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width, height;
  const particles = [];
  const PARTICLE_COUNT = 80;
  const CONNECTION_DISTANCE = 150;

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }

  resize();
  window.addEventListener('resize', resize);

  class Particle {
    constructor() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.vx = (Math.random() - 0.5) * 0.4;
      this.vy = (Math.random() - 0.5) * 0.4;
      this.radius = Math.random() * 1.5 + 0.5;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;

      if (this.x < 0 || this.x > width) this.vx *= -1;
      if (this.y < 0 || this.y > height) this.vy *= -1;
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 240, 255, 0.4)';
      ctx.fill();
    }
  }

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push(new Particle());
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);

    // Draw connections
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < CONNECTION_DISTANCE) {
          const opacity = (1 - dist / CONNECTION_DISTANCE) * 0.12;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(139, 92, 246, ${opacity})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }

    // Update and draw particles
    particles.forEach((p) => {
      p.update();
      p.draw();
    });

    requestAnimationFrame(animate);
  }

  animate();
})();

// ---- Terminal Typing Effect ----
(function () {
  const el = document.getElementById('typing-text');
  if (!el) return;

  const lines = [
    'Building the future with AI.',
    'From SAP to full-stack.',
    'Prompt engineer. Builder.',
    'Claude & Gemini powered.',
    'Enterprise meets innovation.',
    'Meditation. Code. Repeat.',
  ];

  let lineIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let typingSpeed = 80;

  function type() {
    const currentLine = lines[lineIndex];

    if (!isDeleting) {
      el.textContent = currentLine.slice(0, charIndex + 1);
      charIndex++;

      if (charIndex === currentLine.length) {
        isDeleting = true;
        typingSpeed = 2000; // Pause at end
      } else {
        typingSpeed = 60 + Math.random() * 40;
      }
    } else {
      el.textContent = currentLine.slice(0, charIndex - 1);
      charIndex--;

      if (charIndex === 0) {
        isDeleting = false;
        lineIndex = (lineIndex + 1) % lines.length;
        typingSpeed = 400;
      } else {
        typingSpeed = 30;
      }
    }

    setTimeout(type, typingSpeed);
  }

  setTimeout(type, 800);
})();

// ---- Navbar Scroll Effect ----
(function () {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
  });
})();

// ---- Mobile Hamburger ----
(function () {
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('nav-links');
  if (!hamburger || !navLinks) return;

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navLinks.classList.toggle('active');
  });

  // Close on link click
  navLinks.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      navLinks.classList.remove('active');
    });
  });
})();

// ---- Scroll Animations (Intersection Observer) ----
(function () {
  const elements = document.querySelectorAll(
    '.project-card, .stat-card, .about-text, .about-tools, .about-seeking'
  );

  elements.forEach((el) => el.classList.add('fade-in'));

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
  );

  elements.forEach((el) => observer.observe(el));
})();

// ---- Animated Counters ----
(function () {
  const counters = document.querySelectorAll('.stat-value[data-count]');
  let started = false;

  const observer = new IntersectionObserver(
    (entries) => {
      if (started) return;
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          started = true;
          counters.forEach((counter) => {
            const target = parseInt(counter.dataset.count);
            let current = 0;
            const step = Math.max(1, Math.floor(target / 40));
            const interval = setInterval(() => {
              current += step;
              if (current >= target) {
                counter.textContent = target + '+';
                clearInterval(interval);
              } else {
                counter.textContent = current;
              }
            }, 50);
          });
        }
      });
    },
    { threshold: 0.3 }
  );

  counters.forEach((c) => observer.observe(c));
})();

// ---- Project Modal ----
const projectData = {
  quantbot: {
    icon: '📈',
    ai: 'claude',
    title: 'QuantBot ML Trading System',
    body: `
      <p>A comprehensive machine learning trading system built entirely through AI-assisted development with Claude.</p>
      <h4>Key Features</h4>
      <ul>
        <li>CNN-based price prediction model with temporal validation</li>
        <li>ATR Chandelier Exit risk management framework</li>
        <li>Regime-adaptive position sizing (R1–R4 scalars)</li>
        <li>Portfolio optimization with cross-sectional ranking</li>
        <li>Live execution against Alpaca Markets API</li>
        <li>Walk-forward backtesting with Optuna hyperparameter sweeps</li>
        <li>GUI dashboard for real-time monitoring</li>
        <li>ML performance tracking with SQLite database</li>
      </ul>
      <h4>AI's Role</h4>
      <p>Claude architected the entire system — from the ML pipeline and risk framework to the execution engine and GUI. Every module was built through iterative prompt engineering and code review.</p>
    `,
    tech: ['Python', 'TensorFlow', 'Alpaca API', 'SQLite', 'Optuna', 'Pandas', 'TA-Lib'],
  },
  qrforge: {
    icon: '⚡',
    ai: 'claude',
    title: 'QRForge – Free QR Code Generator',
    body: `
      <p>A professional QR code generator hosted on GitHub Pages, built entirely client-side with no backend.</p>
      <h4>Key Features</h4>
      <ul>
        <li>8+ QR code types: URL, text, WiFi, vCard, email, phone, SMS, calendar</li>
        <li>Full customization: colors, dot styles, corner shapes, center logos</li>
        <li>Bulk generation with CSV upload and ZIP download</li>
        <li>Export as PNG, SVG, or PDF</li>
        <li>SEO-optimized with structured data, meta tags, and sitemap</li>
        <li>100% client-side — no data leaves the browser</li>
      </ul>
      <h4>AI's Role</h4>
      <p>Claude designed the entire UI/UX, implemented all 8 QR types, and built the SEO strategy including JSON-LD markup and Open Graph tags.</p>
    `,
    tech: ['HTML', 'CSS', 'JavaScript', 'QR Code Styling', 'jsPDF', 'JSZip'],
  },
  bsgrocery: {
    icon: '🛒',
    ai: 'claude',
    title: "B's Grocery Online Ordering",
    body: `
      <p>A full-stack online ordering system for a local grocery store, bridging web orders to in-store thermal receipt printers.</p>
      <h4>Key Features</h4>
      <ul>
        <li>Customer-facing order form hosted on GitHub Pages</li>
        <li>Google Sheets as the database via Google Apps Script</li>
        <li>Local Node.js print bridge for automatic receipt printing</li>
        <li>Unified PDF architecture supporting both thermal and standard printers</li>
        <li>Dynamic receipt height optimization to eliminate paper waste</li>
        <li>Multi-machine deployment across store locations</li>
        <li>Silent printing with SumatraPDF integration</li>
      </ul>
      <h4>AI's Role</h4>
      <p>Claude architected the entire GitHub Pages → Google Sheets → Local Print Bridge pipeline, including the critical pivot from ESC/POS to PDF-only printing.</p>
    `,
    tech: ['Node.js', 'PDFKit', 'Google Apps Script', 'GitHub Pages', 'SumatraPDF'],
  },
  htfscanner: {
    icon: '🔍',
    ai: 'claude',
    title: 'HTF Scanner',
    body: `
      <p>A higher-timeframe stock scanner that identifies trading setups across multiple signal types and delivers alerts to Discord.</p>
      <h4>Key Features</h4>
      <ul>
        <li>Multi-signal engine: trend, momentum, volume, volatility</li>
        <li>Daily scanning with configurable universe filters</li>
        <li>Discord webhook for real-time trade alerts</li>
        <li>Backtesting framework for signal validation</li>
        <li>Weekly performance reports and P&L tracking</li>
        <li>ThinkorSwim ThinkScript companion indicator</li>
      </ul>
      <h4>AI's Role</h4>
      <p>Claude built the signal engine, backtesting framework, and Discord integration from scratch through iterative development sessions.</p>
    `,
    tech: ['Python', 'yfinance', 'Discord Webhooks', 'Pandas', 'ThinkScript'],
  },
  sapbtp: {
    icon: '🏢',
    ai: 'gemini',
    title: 'SAP BTP Application',
    body: `
      <p>An enterprise web application built on SAP Business Technology Platform with Next.js, showcasing modern frontend patterns for business workflows.</p>
      <h4>Key Features</h4>
      <ul>
        <li>Next.js with TypeScript and middleware layer</li>
        <li>SAP BTP service integration</li>
        <li>Modern, responsive UI for enterprise data</li>
        <li>Authentication and authorization middleware</li>
        <li>Presentation deck generator for SAP data</li>
      </ul>
      <h4>AI's Role</h4>
      <p>Gemini assisted with the Next.js architecture, TypeScript configuration, and SAP BTP integration patterns — bridging my SAP domain knowledge with modern web frameworks.</p>
    `,
    tech: ['Next.js', 'TypeScript', 'SAP BTP', 'Tailwind CSS', 'ESLint'],
  },
  optiflow: {
    icon: '⚙️',
    ai: 'gemini',
    title: 'OptiFlow Optimizer',
    body: `
      <p>A desktop supply chain optimization application built with Tauri (Rust backend) and React frontend.</p>
      <h4>Key Features</h4>
      <ul>
        <li>Time-series constraint optimizer with solver engine</li>
        <li>Time fence enforcement and planned receipts</li>
        <li>Max stock constraints and HashMap-based variable indexing</li>
        <li>Interactive data visualization dashboard</li>
        <li>Native desktop performance via Tauri/Rust backend</li>
        <li>Demo data generator for testing scenarios</li>
      </ul>
      <h4>AI's Role</h4>
      <p>Gemini helped architect the Rust-based solver engine and React UI, translating my IBP supply planning expertise into a standalone optimization tool.</p>
    `,
    tech: ['Tauri', 'Rust', 'React', 'TypeScript', 'Vite'],
  },
  discordtrader: {
    icon: '🤖',
    ai: 'claude',
    title: 'Discord Signal Trader',
    body: `
      <p>An automated pipeline that monitors Discord channels for trading signals and executes trades through ThinkorSwim.</p>
      <h4>Key Features</h4>
      <ul>
        <li>Real-time Discord message monitoring and signal parsing</li>
        <li>Natural language signal extraction using pattern matching</li>
        <li>ThinkorSwim integration for automated order execution</li>
        <li>Risk management with position sizing rules</li>
        <li>Signal logging and performance tracking</li>
        <li>Frontend dashboard for monitoring active signals</li>
      </ul>
      <h4>AI's Role</h4>
      <p>Claude built the signal parsing engine, Discord bot integration, and ThinkorSwim execution bridge through conversational development.</p>
    `,
    tech: ['Python', 'Discord.py', 'ThinkorSwim API', 'asyncio'],
  },
  nqbacktest: {
    icon: '📊',
    ai: 'claude',
    title: 'NQ Futures Backtester',
    body: `
      <p>A standalone backtesting engine for NQ (Nasdaq 100) futures morning scalping strategies.</p>
      <h4>Key Features</h4>
      <ul>
        <li>5 research-backed strategies: ORB, VWAP Mean Reversion, Gap Fill, Initial Balance Breakout, Keltner Channel</li>
        <li>QQQ 1-minute bars as NQ proxy with conversion factors</li>
        <li>Extensive parameter sweeps across all strategy dimensions</li>
        <li>Regime-specific analysis for high/low volatility environments</li>
        <li>Walk-forward validation framework</li>
        <li>Approximate NQ P&L conversion</li>
      </ul>
      <h4>AI's Role</h4>
      <p>Claude designed the modular strategy framework, parameter sweep engine, and regime analysis components from research papers and trading concepts.</p>
    `,
    tech: ['Python', 'Pandas', 'NumPy', 'Optuna', 'Matplotlib'],
  },
};

function openModal(projectId) {
  const data = projectData[projectId];
  if (!data) return;

  const overlay = document.getElementById('modal-overlay');
  const icon = document.getElementById('modal-icon');
  const badge = document.getElementById('modal-badge');
  const title = document.getElementById('modal-title');
  const body = document.getElementById('modal-body');
  const tech = document.getElementById('modal-tech');

  icon.textContent = data.icon;
  badge.textContent = data.ai === 'claude' ? 'Claude' : 'Gemini';
  badge.className = 'modal-badge card-ai-badge ' + data.ai;
  title.textContent = data.title;
  body.innerHTML = data.body;
  tech.innerHTML = data.tech.map((t) => `<span>${t}</span>`).join('');

  overlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  const overlay = document.getElementById('modal-overlay');
  overlay.classList.remove('active');
  document.body.style.overflow = '';
}

// Close on overlay click
document.getElementById('modal-overlay')?.addEventListener('click', (e) => {
  if (e.target === e.currentTarget) closeModal();
});

// Close on Escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
});
