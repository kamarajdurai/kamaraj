import { useState, useEffect, useRef } from 'react';
import './index.css';
import TiltCard from './components/TiltCard';
import { db } from './services/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

function App() {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('frontend');
  const [isDark, setIsDark] = useState(true);
  const [typedText, setTypedText] = useState('');
  const [activeSection, setActiveSection] = useState('home');

  // Refs
  const canvasRef = useRef(null);
  const profileRef = useRef(null);
  const textRef = useRef(null);
  const navLinksRef = useRef(null);
  const timeoutRef = useRef(null);

  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const [selectedProject, setSelectedProject] = useState(null);
  const [activeModalImg, setActiveModalImg] = useState(null);

  // Contact form status notification state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formStatus, setFormStatus] = useState(null);

  // Active navigation indicator calculation
  useEffect(() => {
    const updateIndicator = () => {
      if (navLinksRef.current) {
        const activeLink = navLinksRef.current.querySelector('.active');
        if (activeLink) {
          setIndicatorStyle({
            left: activeLink.offsetLeft,
            width: activeLink.offsetWidth
          });
        }
      }
    };

    updateIndicator();
    const timeoutId = setTimeout(updateIndicator, 50);

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(updateIndicator);
    }

    window.addEventListener('resize', updateIndicator);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', updateIndicator);
    };
  }, [activeSection, isNavOpen]);

  // Toggle Nav
  const toggleNav = () => setIsNavOpen(!isNavOpen);

  // Scroll Parallax Effect
  useEffect(() => {
    let rafId;
    const handleScroll = () => {
      const y = window.scrollY;
      rafId = requestAnimationFrame(() => {
        if (profileRef.current) {
          profileRef.current.style.transform = `translateY(${y * 0.12}px)`;
        }
        if (textRef.current) {
          textRef.current.style.transform = `translateY(${y * 0.04}px)`;
        }
      });
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(rafId);
    };
  }, []);

  // Dark/Light Theme Body Class Effect
  useEffect(() => {
    if (isDark) {
      document.body.classList.remove('light-theme');
    } else {
      document.body.classList.add('light-theme');
    }
  }, [isDark]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key && e.key.toLowerCase() === 'd') {
        setIsDark(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Typed Text Effect with memory leak cleanup
  useEffect(() => {
    const phrases = ['Designing delightful experiences', 'Building responsive web apps', 'Learning full-stack development'];
    let pi = 0;
    let ci = 0;
    let typing = true;

    const tick = () => {
      const current = phrases[pi];
      if (typing) {
        ci++;
        setTypedText(current.slice(0, ci));
        if (ci >= current.length) {
          typing = false;
          timeoutRef.current = setTimeout(tick, 900);
          return;
        }
        timeoutRef.current = setTimeout(tick, 50);
      } else {
        ci--;
        setTypedText(current.slice(0, ci));
        if (ci <= 0) {
          typing = true;
          pi = (pi + 1) % phrases.length;
          timeoutRef.current = setTimeout(tick, 200);
          return;
        }
        timeoutRef.current = setTimeout(tick, 30);
      }
    };

    tick();
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // Particle Canvas with DPI Scaling
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let W, H, particles = [];
    let animationId;

    const reset = () => {
      const dpr = window.devicePixelRatio || 1;
      W = canvas.clientWidth;
      H = canvas.clientHeight;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      ctx.scale(dpr, dpr);
      particles = [];
      const particleCount = W < 768 ? 12 : 30;
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * W,
          y: Math.random() * H,
          r: Math.random() * 2 + 0.6,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3
        });
      }
    };

    const step = () => {
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
      animationId = requestAnimationFrame(step);
    };

    const timerId = setTimeout(() => {
      window.addEventListener('resize', reset);
      reset();
      step();
    }, 1000);

    return () => {
      clearTimeout(timerId);
      window.removeEventListener('resize', reset);
      cancelAnimationFrame(animationId);
    };
  }, []);

  // Intersection Observer for Section Highlighting & Fade-in
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('in-view');
          if (e.target.tagName === 'SECTION') {
            setActiveSection(e.target.id);
          }
        }
      });
    }, { threshold: 0.12 });

    const sections = document.querySelectorAll('section');
    const fadeEls = document.querySelectorAll('.fade-in');

    sections.forEach(s => observer.observe(s));
    fadeEls.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  // Body Scroll Lock & Modal State Sync
  useEffect(() => {
    if (selectedProject) {
      document.body.style.overflow = 'hidden';
      setActiveModalImg(selectedProject.img);
    } else {
      document.body.style.overflow = '';
      setActiveModalImg(null);
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [selectedProject]);

  // Close Modal on Escape Key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') setSelectedProject(null);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  // Contact Form Submission Logic
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (formStatus) setFormStatus(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormStatus(null);
    try {
      await addDoc(collection(db, "messages"), {
        ...formData,
        timestamp: serverTimestamp()
      });
      setFormStatus({ type: 'success', message: '✨ Thank you! Your message has been sent successfully.' });
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      console.error("Error submitting contact form: ", error);
      setFormStatus({ type: 'error', message: `Unable to send message: ${error.message}` });
    }
    setIsSubmitting(false);
  };

  // Projects Data
  const projects = [
    {
      id: 1,
      title: 'Travel and Tourism',
      description: 'Travel and tourism platform for viewing places in VA/AR.',
      details: 'TN-VERSE is a smart tourism platform that combines education, safety, accessibility, and sustainability using AR/VR and intelligent recommendations to enhance the overall travel experience.',
      Tech: 'Tech Stack: React, APIs (Gemini API, Google Maps API)',
      img: '/pic/vr.png',
      link: 'https://tripplanner-amber.vercel.app/',
      images: [
        '/pic/vr.png',
        '/pic/plan.png',
        '/pic/view.png',
        '/pic/ar.jpeg'
      ]
    },
    {
      id: 2,
      title: 'Herbious',
      description: 'Herbious for learning herbs with VR views of medicinal plants.',
      details: 'Developing a web application for exploring medicinal plants and promoting health literacy through 3D models and interactive botanical guides.',
      Tech: 'Tech Stack: HTML, CSS, JS, PHP, MySQL',
      img: '/pic/harb.png',
      link: 'https://herbours.netlify.app/',
      images: [
        '/pic/harb.png',
        '/pic/plant.png',
        '/pic/lotus.png',
        '/pic/3D.png'
      ]
    },
    {
      id: 3,
      title: 'EventHub',
      description: 'Smart student event registration platform for college events.',
      details: 'EventHub is a smart student event registration platform for exploring and joining technical, non-technical, and cultural college events. It provides secure online registration with auto-generated QR code digital tickets for fast and verified event entry.',
      Tech: 'Tech Stack: React.js, Node.js with Express, Firebase (Firestore)',
      img: '/pic/event 1.png',
      link: 'https://event-college.vercel.app/',
      images: [
        '/pic/event 1.png',
        '/pic/event 2.png',
        '/pic/event 3.png',
        '/pic/event 4.png'
      ]
    }
  ];

  return (
    <>
      <header className="navbar">
        <div className="logo">Kamaraj</div>
        <div className={`nav-links ${isNavOpen ? 'open' : ''}`} ref={navLinksRef} id="nav-menu">
          <div className="nav-indicator" style={{ left: `${indicatorStyle.left}px`, width: `${indicatorStyle.width}px` }}></div>
          <a href="#home" className={`nav-item ${activeSection === 'home' ? 'active' : ''}`} onClick={() => setIsNavOpen(false)}>Home</a>
          <a href="#about" className={`nav-item ${activeSection === 'about' ? 'active' : ''}`} onClick={() => setIsNavOpen(false)}>About</a>
          <a href="#achievements" className={`nav-item ${activeSection === 'achievements' ? 'active' : ''}`} onClick={() => setIsNavOpen(false)}>Achievements</a>
          <a href="#projects" className={`nav-item ${activeSection === 'projects' ? 'active' : ''}`} onClick={() => setIsNavOpen(false)}>Projects</a>
          <a href="#contact" className={`nav-item ${activeSection === 'contact' ? 'active' : ''}`} onClick={() => setIsNavOpen(false)}>Contact</a>
        </div>
        <button
          className="hamburger"
          onClick={toggleNav}
          aria-label="Toggle Menu"
          aria-expanded={isNavOpen}
          aria-controls="nav-menu"
        >
          {isNavOpen ? '✕' : '☰'}
        </button>
      </header>

      <section id="home" className="hero">
        <canvas id="particle-canvas" ref={canvasRef}></canvas>
        <div className="hero-inner">
          <div
            className="fade-in"
            ref={profileRef}
            style={{ willChange: 'transform' }}
          >
            <TiltCard className="profile">
              <img src="/pic/kamaraj.png" alt="Kamaraj Profile Picture" />
            </TiltCard>
          </div>
          <div
            className="hero-text"
            ref={textRef}
            style={{ willChange: 'transform' }}
          >
            <h2 className="fade-in">Hi, I'm <strong>Kamaraj</strong></h2>
            <p className="tagline fade-in">
              {typedText || "Designing delightful experiences & building responsive web apps."}
            </p>

            <div className="cta-row fade-in">
              <a className="btn pulse" href="/file/resume.pdf" download="Kamaraj_Resume.pdf">
                Download Resume
              </a>
              <a className="btn" href="#projects">View Projects</a>
            </div>
          </div>
        </div>
      </section>

      <main className="container">

        <section id="about">
          <h3 className="section-title">About & Education</h3>
          <div className="two-col">
            <div className="card fade-in">
              <h4>About me</h4>
              <p>I am a college student studying Information Technology. I enjoy building web apps, designing UIs and learning new technologies. I focus on writing maintainable code and creating pleasant UX.</p>
              <p style={{ marginTop: '14px' }}>Skills: HTML, CSS, JavaScript, Python, React, Responsive Design, Git</p>
            </div>
            <div className="card fade-in edu-journey">
              <h4>Education (Journey)</h4>
              <div className="edu-item">
                <div className="icon">🎓</div>
                <div>
                  <h4>B.Tech Information Technology — Knowledge Institute of Technology <small style={{ color: 'var(--text-muted)' }}>(2025 - present)</small></h4>
                  <p>Focus: Web Development, Data Structures, and Algorithms.</p>
                </div>
              </div>
              <div className="edu-item">
                <div className="icon">📜</div>
                <div>
                  <h4>Higher Secondary — Sri vidhya mandir matric hr.sec.school <small style={{ color: 'var(--text-muted)' }}>(2022 - 2024)</small></h4>
                  <p>Focus: Computer Science & Ranked top 10 in class.</p>
                </div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '32px' }}>
            <h4 className="section-title">Skills</h4>
            <div className="card">
              <div className="tabs" role="tablist" style={{ marginBottom: '14px' }}>
                <div className="indicator" style={{ transform: `translateX(${['frontend', 'backend', 'tools'].indexOf(activeTab) * 100}%)` }}></div>
                <button className={`tab ${activeTab === 'frontend' ? 'active' : ''}`} onClick={() => setActiveTab('frontend')} role="tab" aria-selected={activeTab === 'frontend'}>Frontend</button>
                <button className={`tab ${activeTab === 'backend' ? 'active' : ''}`} onClick={() => setActiveTab('backend')} role="tab" aria-selected={activeTab === 'backend'}>Backend</button>
                <button className={`tab ${activeTab === 'tools' ? 'active' : ''}`} onClick={() => setActiveTab('tools')} role="tab" aria-selected={activeTab === 'tools'}>Tools</button>
              </div>
              <div className="skill-area">
                {activeTab === 'frontend' && (
                  <div className="skill-grid" data-panel="frontend">
                    <div className="skill" title="HTML">
                      <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg" alt="HTML" style={{ width: '36px', height: '36px' }} />
                      <div className="meta"><strong>HTML</strong></div>
                    </div>
                    <div className="skill" title="CSS">
                      <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg" alt="CSS" style={{ width: '36px', height: '36px' }} />
                      <div className="meta"><strong>CSS</strong></div>
                    </div>
                    <div className="skill" title="JavaScript">
                      <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg" alt="JS" style={{ width: '36px', height: '36px' }} />
                      <div className="meta"><strong>JS</strong></div>
                    </div>
                    <div className="skill" title="React">
                      <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg" alt="React" style={{ width: '36px', height: '36px' }} />
                      <div className="meta"><strong>React</strong></div>
                    </div>
                  </div>
                )}

                {activeTab === 'backend' && (
                  <div className="skill-grid" data-panel="backend">
                    <div className="skill" title="PHP">
                      <img src="https://devicon-website.vercel.app/api/php/original.svg" alt="PHP" style={{ width: '36px', height: '36px' }} />
                      <div className="meta"><strong>PHP</strong></div>
                    </div>
                    <div className="skill" title="Node.js">
                      <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg" alt="Node.js" style={{ width: '36px', height: '36px' }} />
                      <div className="meta"><strong>Node.js</strong></div>
                    </div>
                    <div className="skill" title="MySQL">
                      <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg" alt="MySQL" style={{ width: '36px', height: '36px' }} />
                      <div className="meta"><strong>MySQL</strong></div>
                    </div>
                  </div>
                )}

                {activeTab === 'tools' && (
                  <div className="skill-grid" data-panel="tools">
                    <div className="skill" title="Git">
                      <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg" alt="Git" style={{ width: '36px', height: '36px' }} />
                      <div className="meta"><strong>Git</strong></div>
                    </div>
                    <div className="skill" title="GitHub">
                      <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg" alt="GitHub" style={{ width: '36px', height: '36px' }} />
                      <div className="meta"><strong>GitHub</strong></div>
                    </div>
                    <div className="skill" title="VS Code">
                      <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vscode/vscode-original.svg" alt="VS Code" style={{ width: '36px', height: '36px' }} />
                      <div className="meta"><strong>VS Code</strong></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <section id="achievements">
          <h3 className="section-title">My Achievements</h3>
          <div className="projects-grid">
            {[
              {
                icon: '🏆',
                title: 'KIOT Achievers Award (2023–24)',
                img: '/pic/award.png',
                desc: <>I secured first place in CodeWar 1.0 at Park Engineering College, winning a <strong className="text-highlight-orange">cash prize of ₹10,000</strong> and was honored on Achievers' Day during my first year.</>,
                btnIcon: '🎖️',
                btnText: 'Achievers Award',
                cardClass: 'achievement-card ach-orange'
              },
              {
                icon: '📜',
                title: 'BGS Certification',
                img: '/pic/bgs.jpg',
                desc: <>I participated in the National Level Hackathon <strong className="text-highlight-blue">"ADVAYA 2K25,"</strong> conducted at BGS College of Engineering & Technology, Bengaluru, on 11–12 April 2025.</>,
                btnIcon: '🟢',
                btnText: 'National Level Hackathon',
                cardClass: 'achievement-card ach-blue'
              },
              {
                icon: '🏆',
                title: 'GravitoHacks – GDG Saveetha',
                img: '/pic/google.jpg',
                desc: <>Thrilled to share that Team Pixelate secured <strong className="text-highlight-blue">2nd place</strong> at GravitoHacks, a hackathon organized by the Google Developer Group (GDG) at Saveetha School of Engineering.</>,
                imgIcon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg',
                btnText: 'Google GDG Event',
                cardClass: 'achievement-card ach-dark'
              },
              {
                icon: '🏆',
                title: 'KIOT Achievers Award (2025–26)',
                img: '/pic/2nd award.png',
                desc: <>Secured 2nd Place at Gravito Hacks – National Level Hackathon as a proud member of <strong className="text-highlight-blue">Team PIXELATE</strong>. Recognized for innovation, problem-solving, and technical excellence. Grateful to Knowledge Institute of Technology (KIOT) for the recognition.</>,
                btnIcon: '🎖️',
                btnText: 'Achievers Award',
                cardClass: 'achievement-card ach-purple'
              }
            ].map((item, index) => (
              <TiltCard key={index} className={`card-base ${item.cardClass} fade-in`}>
                <div className="ach-img-container">
                  <img src={item.img} alt={item.title} loading="lazy" />
                </div>
                <div className="ach-body">
                  <div className="ach-header">
                    <span className="ach-icon">{item.icon}</span>
                    <h4>{item.title}</h4>
                  </div>
                  <hr className="ach-divider" />
                  <p className="ach-desc">{item.desc}</p>

                  <button className="ach-btn">
                    {item.imgIcon ? (
                      <img src={item.imgIcon} alt="Icon" className="ach-btn-icon-img" />
                    ) : item.btnIcon ? (
                      <span className="ach-btn-icon">{item.btnIcon}</span>
                    ) : null}
                    {item.btnText}
                  </button>
                </div>
              </TiltCard>
            ))}
          </div>
        </section>

        <section id="projects">
          <h3 className="section-title">Projects</h3>
          <div className="projects-grid">
            {projects.map((project) => (
              <TiltCard key={project.id} className={`achievement-card fade-in ${project.id === 1 ? 'ach-blue' : project.id === 2 ? 'ach-orange' : 'ach-dark'}`}>
                <div className="ach-img-container">
                  <img src={project.img} alt={project.title} loading="lazy" />
                </div>
                <div className="ach-body">
                  <div className="ach-header">
                    <h4>{project.title}</h4>
                  </div>
                  <hr className="ach-divider" />
                  <p className="ach-desc">{project.description}</p>

                  <div style={{ display: 'flex', gap: '10px', marginTop: 'auto' }}>
                    <a className="ach-btn" href={project.link} target="_blank" rel="noopener noreferrer">
                      App ↗
                    </a>
                    <button className="ach-btn" onClick={() => setSelectedProject(project)}>
                      Details
                    </button>
                  </div>
                </div>
              </TiltCard>
            ))}
          </div>
        </section>

        <section id="contact">
          <h3 className="section-title">Contact</h3>
          <div className="card">
            <form id="contact-form" onSubmit={handleSubmit}>
              {formStatus && (
                <div className={`form-status ${formStatus.type}`}>
                  {formStatus.message}
                </div>
              )}
              <input
                type="text"
                name="name"
                placeholder="Your name"
                value={formData.name}
                onChange={handleChange}
                required
              />
              <input
                type="email"
                name="email"
                placeholder="Your email"
                value={formData.email}
                onChange={handleChange}
                required
              />
              <input
                type="text"
                name="subject"
                placeholder="Subject"
                value={formData.subject}
                onChange={handleChange}
              />
              <textarea
                name="message"
                placeholder="Your message"
                value={formData.message}
                onChange={handleChange}
                required
              ></textarea>
              <button className="btn" type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>
        </section>
      </main>

      <footer>
        <p>© 2025 Kamaraj. All rights reserved.</p>
      </footer>

      {/* Project Details Modal */}
      {selectedProject && (
        <div className="modal-overlay" onClick={() => setSelectedProject(null)} role="dialog" aria-modal="true" aria-labelledby="modal-title">
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedProject(null)} aria-label="Close modal">×</button>
            <h3 id="modal-title" style={{ marginTop: 0, marginBottom: '8px' }}>{selectedProject.title}</h3>
            <p style={{ color: 'var(--accent-cyan)', marginBottom: '8px' }}><strong>{selectedProject.description}</strong></p>
            <p style={{ marginBottom: '12px', lineHeight: '1.6' }}>{selectedProject.details}</p>
            {selectedProject.Tech && <p style={{ marginBottom: '16px', color: 'var(--text-muted)', whiteSpace: 'pre-line' }}>{selectedProject.Tech}</p>}

            {/* Main Preview Image */}
            <div className="modal-preview">
              <img src={activeModalImg || selectedProject.img} alt={`${selectedProject.title} Preview`} />
            </div>

            {/* Interactive Image Thumbnails */}
            <div className="modal-gallery">
              {selectedProject.images.map((img, idx) => (
                <div
                  key={idx}
                  className={`gallery-item ${activeModalImg === img ? 'active' : ''}`}
                  onClick={() => setActiveModalImg(img)}
                  title="Click to preview"
                >
                  <img src={img} alt={`${selectedProject.title} screenshot ${idx + 1}`} loading="lazy" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default App;
