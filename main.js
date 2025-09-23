document.addEventListener('DOMContentLoaded', () => {
  const $ = s => document.querySelector(s);
  const $$ = s => document.querySelectorAll(s);

  // Smooth scroll
  document.querySelectorAll('a.nav-link').forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      const id = a.getAttribute('href').slice(1);
      const target = document.getElementById(id);
      if (target) target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    })
  });

  // Hamburger menu
  const ham = $('.hamburger');
  const nav = $('nav');
  if (ham && nav) {
    ham.addEventListener('click', () => {
      nav.classList.toggle('open');
      const expanded = ham.getAttribute('aria-expanded') === 'true';
      ham.setAttribute('aria-expanded', String(!expanded));
    });
  }

  // Typed effect
  (function() {
    const el = $('#typed-target');
    if (!el) return;
    const phrases = ['Designing delightful experiences', 'Building responsive web apps', 'Learning full-stack development'];
    let pi = 0,
      ci = 0,
      typing = true;

    function tick() {
      const current = phrases[pi];
      if (typing) {
        ci++;
        el.textContent = current.slice(0, ci);
        if (ci >= current.length) {
          typing = false;
          setTimeout(tick, 900);
          return;
        }
        setTimeout(tick, 50);
      } else {
        ci--;
        el.textContent = current.slice(0, ci);
        if (ci <= 0) {
          typing = true;
          pi = (pi + 1) % phrases.length;
          setTimeout(tick, 200);
          return;
        }
        setTimeout(tick, 30);
      }
    }
    // tick(); // Commented out as #typed-target is not in the HTML
  })();

  // Fade-in observer
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) e.target.classList.add('in-view');
      })
    }, {
      threshold: 0.12
    });
    $$('.fade-in').forEach(el => io.observe(el));
  } else {
    $$('.fade-in').forEach(el => el.classList.add('in-view'));
  }

  // Skill tabs
  $$('.tab').forEach(t => t.addEventListener('click', () => {
    $$('.tab').forEach(x => x.classList.remove('active'));
    t.classList.add('active');
    const sel = t.dataset.tab;
    $$('[data-panel]').forEach(p => {
      p.style.display = (p.dataset.panel === sel) ? 'grid' : 'none';
    });
  }));

  // ========== START: ACHIEVEMENTS ACCORDION LOGIC ==========
  $$('.achievement-bar').forEach(bar => {
    bar.addEventListener('click', () => {
      bar.classList.toggle('open');
      const toggle = bar.querySelector('.toggle');
      if (bar.classList.contains('open')) {
        toggle.textContent = '−'; // Use a minus sign when open
      } else {
        toggle.textContent = '+';
      }
    });
  });
  // ========== END: ACHIEVEMENTS ACCORDION LOGIC ==========

  // Contact form demo
  const contactForm = $('#contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', e => {
      e.preventDefault();
      const fd = new FormData(e.target);
      alert('Thanks, ' + fd.get('name') + " — message received (demo).\nI'll reply at: " + fd.get('email'));
      e.target.reset();
    });
  }

  // Resume download
  const resumeBtn = $('#download-resume');
  if (resumeBtn) {
    resumeBtn.addEventListener('click', () => {
      const resumeText = `Student Name\nComputer Science — XYZ College\n\nSkills:\n- HTML/CSS/JS\n- Python\n- Git\n\nProjects:\n- Quiz App\n- Portfolio Site\n- Task Manager\n\nReplace this demo with your real PDF.`;
      const blob = new Blob([resumeText], {
        type: 'text/plain'
      });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'StudentName_Resume.txt';
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 5000);
    });
  }

  // Dark/light toggle
  let dark = true;
  window.addEventListener('keydown', e => {
    if (e.key.toLowerCase() === 'd') {
      dark = !dark;
      if (!dark) {
        document.documentElement.style.setProperty('--bg1', '#f5f7fb');
        document.documentElement.style.setProperty('--bg2', '#efeff6');
        document.documentElement.style.setProperty('--accent1', '#6b2ff7');
        document.body.style.color = '#1b1b27';
      } else {
        document.documentElement.style.removeProperty('--bg1');
        document.documentElement.style.removeProperty('--bg2');
        document.body.style.color = '';
      }
    }
  });

  // Particle canvas
  (function() {
    const canvas = $('#particle-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let W, H, particles = [];

    function reset() {
      W = canvas.width = canvas.clientWidth;
      H = canvas.height = canvas.clientHeight;
      particles = [];
      for (let i = 0; i < 40; i++) {
        particles.push({
          x: Math.random() * W,
          y: Math.random() * H,
          r: Math.random() * 2 + 0.6,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4
        })
      }
    }

    function step() {
      ctx.clearRect(0, 0, W, H);
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = W;
        if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H;
        if (p.y > H) p.y = 0;
        ctx.beginPath();
        ctx.fillStyle = 'rgba(255,255,255,0.06)';
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      requestAnimationFrame(step);
    }
    window.addEventListener('resize', reset);
    reset();
    step();
  })();

  // Highlight nav on scroll
  const sections = $$('main section');
  const navlinks = $$('.nav-link');
  if ('IntersectionObserver' in window && sections.length) {
    const obs2 = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (en.isIntersecting) {
          navlinks.forEach(l => l.classList.remove('active'));
          const id = en.target.id;
          const link = document.querySelector('.nav-link[href="#' + id + '"]');
          if (link) link.classList.add('active');
        }
      })
    }, {
      threshold: 0.45
    });
    sections.forEach(s => obs2.observe(s));
  }
});