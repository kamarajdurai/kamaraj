import { useState, useEffect, useRef } from 'react';
import './index.css';
import TiltCard from './TiltCard';
import { db } from './firebase';
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

  // Toggle Nav
  const toggleNav = () => setIsNavOpen(!isNavOpen);

  // Optimized Scroll Parallax (No Re-renders)
  useEffect(() => {
    let rafId;
    const handleScroll = () => {
      const y = window.scrollY;
      rafId = requestAnimationFrame(() => {
        if (profileRef.current) {
          profileRef.current.style.transform = `translateY(${y * 0.15}px)`;
        }
        if (textRef.current) {
          textRef.current.style.transform = `translateY(${y * 0.05}px)`;
        }
      });
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(rafId);
    };
  }, []);

  // Dark Mode Toggle
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key && e.key.toLowerCase() === 'd') {
        setIsDark(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Typed Effect
  useEffect(() => {
    const phrases = ['Designing delightful experiences', 'Building responsive web apps', 'Learning full-stack development'];
    let pi = 0;
    let ci = 0;
    let typing = true;
    let timeoutId;

    const tick = () => {
      const current = phrases[pi];
      if (typing) {
        ci++;
        setTypedText(current.slice(0, ci));
        if (ci >= current.length) {
          typing = false;
          timeoutId = setTimeout(tick, 900);
          return;
        }
        timeoutId = setTimeout(tick, 50);
      } else {
        ci--;
        setTypedText(current.slice(0, ci));
        if (ci <= 0) {
          typing = true;
          pi = (pi + 1) % phrases.length;
          timeoutId = setTimeout(tick, 200);
          return;
        }
        timeoutId = setTimeout(tick, 30);
      }
    };

    tick();
    return () => clearTimeout(timeoutId);
  }, []);

  // Particle Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let W, H, particles = [];
    let animationId;

    const reset = () => {
      W = canvas.width = canvas.clientWidth;
      H = canvas.height = canvas.clientHeight;
      particles = [];
      // Reduced particle count for performance: 10 on mobile, 30 on desktop
      const particleCount = W < 768 ? 10 : 30;
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * W,
          y: Math.random() * H,
          r: Math.random() * 2 + 0.6,
          vx: (Math.random() - 0.5) * 0.3, // Slower movement
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

    // Defer animation start to prioritize LCP (Language Content Paint)
    const timerId = setTimeout(() => {
      window.addEventListener('resize', reset);
      reset();
      step();
    }, 1500);

    return () => {
      clearTimeout(timerId);
      window.removeEventListener('resize', reset);
      cancelAnimationFrame(animationId);
    };
  }, []);

  // Intersection Observer for Fade-in and Nav Highlight
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

  // Contact Form Logic
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "messages"), {
        ...formData,
        timestamp: serverTimestamp()
      });
      alert("Message sent successfully!");
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      console.error("Error adding document: ", error);
      alert(`Error sending message: ${error.message}`);
    }
    setIsSubmitting(false);
  };

  // Projects Data
  const projects = [
    {
      id: 1,
      title: 'Travel and Tourism',
      description: 'Travel and tourism platform for viewing places in VA/AR.',
      details: 'TN-VERSE is a smart tourism platform that combines education, safety, accessibility, and sustainability using AR/VR and intelligent recommendations to enhance the overall travel experience.  ',
      Tech: 'Tech Stack: React , APIs-Gemini api , google map api ',
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
      description: 'Herbious for learn herbs and we can see plants in VR view.',
      details: 'Developing a web application for exploring medicinal plants and promoting health literacy',
      Tech: 'Tech Stack: HTML ,CSS, JS,PHP and MySQL',
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
      title: 'Job Portal',
      description: 'Job portal for finding jobs and applying for jobs.',
      details: 'A comprehensive job search engine connecting seekers with employers. Features include resume parsing, smart matching algorithms, and real-time application tracking.',
      img: '/pic/job.png',
      link: 'https://jobbd.netlify.app/',
      images: [
        '/pic/job.png',
        '/pic/vr.png',
        '/pic/harb.png',
        '/pic/google.jpg'
      ]
    }
  ];

  const [selectedProject, setSelectedProject] = useState(null);

  // Close modal on escape key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') setSelectedProject(null);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  return (
    <>
      <header>
        <div className="nav-inner">
          <div className="brand">
            <h1>Kamaraj</h1>
          </div>
          <nav className={isNavOpen ? 'open' : ''}>
            <a href="#home" className={activeSection === 'home' ? 'active' : ''} onClick={() => setIsNavOpen(false)}>Home</a>
            <a href="#about" className={activeSection === 'about' ? 'active' : ''} onClick={() => setIsNavOpen(false)}>About</a>
            <a href="#achievements" className={activeSection === 'achievements' ? 'active' : ''} onClick={() => setIsNavOpen(false)}>Achievements</a>
            <a href="#projects" className={activeSection === 'projects' ? 'active' : ''} onClick={() => setIsNavOpen(false)}>Projects</a>
            <a href="#contact" className={activeSection === 'contact' ? 'active' : ''} onClick={() => setIsNavOpen(false)}>Contact</a>
          </nav>
          <button className="hamburger" onClick={toggleNav} aria-label="Toggle Menu">
            {isNavOpen ? '✕' : '☰'}
          </button>
        </div>
      </header>

      <main className="container">
        <section id="home" className="hero">
          <canvas id="particle-canvas" ref={canvasRef}></canvas>
          <div className="hero-inner">
            <div
              className="fade-in"
              ref={profileRef}
              style={{ willChange: 'transform' }}
            >
              <TiltCard className="profile">
                <img src="/pic/kamaraj.png" alt="Profile" />
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
                <a className="btn pulse" href="/file/resume.pdf" download>
                  Download Resume
                </a>
                <a className="btn" href="#projects">View Projects</a>
              </div>
            </div>
          </div>
        </section>

        <section id="about">
          <h3 className="section-title">About & Education</h3>
          <div className="two-col">
            <div className="card fade-in">
              <h4>About me</h4>
              <p>I am a college student studying Information Technology. I enjoy building web apps, designing UIs and learning new technologies. I focus on writing maintainable code and creating pleasant UX.</p>
              <p style={{ marginTop: '14px' }}>Skills: HTML, CSS, JavaScript, Python, React (learning), Responsive Design, Git</p>
            </div>
            <div className="card fade-in edu-journey">
              <h4>Education (Journey)</h4>
              <div className="edu-item">
                <div className="icon">🎓</div>
                <div>
                  <h4>B.Tech Information Technology - Knowledge Institute of Technology <small style={{ color: '#bfbfe6' }}>(2025 - present)</small></h4>
                  <p>Focus: Web Development, Data Structures, and Algorithms.</p>
                </div>
              </div>
              <div className="edu-item">
                <div className="icon">📜</div>
                <div>
                  <h4>Higher Secondary — Sri vidhya mandir matric hr.sec.school <small style={{ color: '#bfbfe6' }}>(2022 - 2022)</small></h4>
                  <p>Focus: Computer Science & Ranked top 10 in class.</p>
                </div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '18px' }}>
            <h4 className="section-title">Skills</h4>
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '12px', flexWrap: 'wrap' }}>
                <h4 style={{ margin: 0 }}> My Skills</h4>
              </div>
              <div className="tabs" role="tablist" style={{ marginBottom: '14px' }}>
                <div className={`tab ${activeTab === 'frontend' ? 'active' : ''}`} onClick={() => setActiveTab('frontend')} role="tab" aria-selected={activeTab === 'frontend'}>Frontend</div>
                <div className={`tab ${activeTab === 'backend' ? 'active' : ''}`} onClick={() => setActiveTab('backend')} role="tab" aria-selected={activeTab === 'backend'}>Backend</div>
                <div className={`tab ${activeTab === 'tools' ? 'active' : ''}`} onClick={() => setActiveTab('tools')} role="tab" aria-selected={activeTab === 'tools'}>Tools</div>
              </div>
              <div className="skill-area">
                {activeTab === 'frontend' && (
                  <div className="skill-grid" data-panel="frontend">
                    <div className="skill" title="HTML ">
                      <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg" alt="HTML" style={{ width: '36px', height: '36px' }} />
                      <div className="meta"><strong>HTML</strong><div style={{ fontSize: '12px', color: '#cfcfe8' }}></div></div>
                    </div>
                    <div className="skill" title="CSS ">
                      <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg" alt="CSS" style={{ width: '36px', height: '36px' }} />
                      <div className="meta"><strong>CSS</strong><div style={{ fontSize: '12px', color: '#cfcfe8' }}></div></div>
                    </div>
                    <div className="skill" title="JavaScript ">
                      <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg" alt="JS" style={{ width: '36px', height: '36px' }} />
                      <div className="meta"><strong>JS</strong><div style={{ fontSize: '12px', color: '#cfcfe8' }}></div></div>
                    </div>
                    <div className="skill" title="React">
                      <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg" alt="React" style={{ width: '36px', height: '36px' }} />
                      <div className="meta"><strong>React</strong><div style={{ fontSize: '12px', color: '#cfcfe8' }}></div></div>
                    </div>
                  </div>
                )}

                {activeTab === 'backend' && (
                  <div className="skill-grid" data-panel="backend">
                    <div className="skill" title="PHP ">
                      <img src="https://devicon-website.vercel.app/api/php/original.svg" alt="PHP" style={{ width: '36px', height: '36px' }} />
                      <div className="meta"><strong>PHP</strong><div style={{ fontSize: '12px', color: '#cfcfe8' }}></div></div>
                    </div>
                    <div className="skill" title="Node.js">
                      <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg" alt="Node.js" style={{ width: '36px', height: '36px' }} />
                      <div className="meta"><strong>Node.js</strong><div style={{ fontSize: '12px', color: '#cfcfe8' }}></div></div>
                    </div>
                    <div className="skill" title="MySQL ">
                      <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg" alt="MySQL" style={{ width: '36px', height: '36px' }} />
                      <div className="meta"><strong>MySQL</strong><div style={{ fontSize: '12px', color: '#cfcfe8' }}></div></div>
                    </div>
                  </div>
                )}

                {activeTab === 'tools' && (
                  <div className="skill-grid" data-panel="tools">
                    <div className="skill" title="Git ">
                      <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg" alt="Git" style={{ width: '36px', height: '36px' }} />
                      <div className="meta"><strong>Git</strong><div style={{ fontSize: '12px', color: '#cfcfe8' }}></div></div>
                    </div>
                    <div className="skill" title="GitHub ">
                      <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg" alt="GitHub" style={{ width: '36px', height: '36px' }} />
                      <div className="meta"><strong>GitHub</strong><div style={{ fontSize: '12px', color: '#cfcfe8' }}></div></div>
                    </div>
                    <div className="skill" title="VS Code">
                      <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vscode/vscode-original.svg" alt="VS Code" style={{ width: '36px', height: '36px' }} />
                      <div className="meta"><strong>VS Code</strong><div style={{ fontSize: '12px', color: '#cfcfe8' }}></div></div>
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
                title: 'Codewar 1.0',
                img: '/pic/award.png',
                desc: <>I secured first place in CodeWar 1.0 at Park Engineering College, winning a <strong className="text-highlight-orange">cash prize of ₹10,000</strong> and was honored on Achievers' Day during my first year.</>,
                btnIcon: '',
                btnText: '1st Year Achievement',
                cardClass: 'achievement-card ach-orange'
              },
              {
                icon: '📜',
                title: 'BGS Certification',
                img: '/pic/bgs.jpg',
                desc: <>I participated in the National Level Hackathon <strong className="text-highlight-blue">"ADVAYA 2K25,"</strong> conducted at BGS College of Engineering & Technology, Bengaluru, on 11–12 April 2025.</>,
                btnIcon: '🟢', // Simple dot representation
                btnText: 'National Level Hackathon',
                cardClass: 'achievement-card ach-blue'
              },
              {
                icon: '🏆',
                title: 'GravitoHacks – GDG Saveetha',
                img: 'pic/google.jpg',
                desc: <>Thrilled to share that Team Pixelate secured <strong className="text-highlight-blue">2nd place</strong> at GravitoHacks, a hackathon organized by the Google Developer Group (GDG) at Saveetha School of Engineering.</>,
                btnIcon: 'G', // Replace with an actual Google icon or image if available
                imgIcon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg',
                btnText: 'Google GDG Event',
                cardClass: 'achievement-card ach-dark'
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
                      <img src={item.imgIcon} alt="icon" className="ach-btn-icon-img" />
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
                      App
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
        <div className="modal-overlay" onClick={() => setSelectedProject(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedProject(null)}>×</button>
            <h3 style={{ marginTop: 0, marginBottom: '8px' }}>{selectedProject.title}</h3>
            <p style={{ color: 'var(--accent1)', marginBottom: '8px' }}><strong>{selectedProject.description}</strong></p>
            <p style={{ marginBottom: '12px', lineHeight: '1.6' }}>{selectedProject.details}</p>
            {selectedProject.Tech && <p style={{ marginBottom: '12px', color: '#cfcfe8' }}>{selectedProject.Tech}</p>}

            <div className="modal-gallery">
              {selectedProject.images.map((img, idx) => (
                <div key={idx} className="gallery-item">
                  <img src={img} alt={`${selectedProject.title} - ${idx + 1}`} loading="lazy" />
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
