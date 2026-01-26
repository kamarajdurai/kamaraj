import { useState, useEffect, useRef } from 'react';
import './index.css';
import TiltCard from './TiltCard';

function App() {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('frontend');
  const [isDark, setIsDark] = useState(true);
  const [typedText, setTypedText] = useState('');
  const [activeSection, setActiveSection] = useState('home');
  const [scrollY, setScrollY] = useState(0);

  // Refs
  const canvasRef = useRef(null);
  const typedTargetRef = useRef(null);

  // Toggle Nav
  const toggleNav = () => setIsNavOpen(!isNavOpen);

  // Scroll Parallax
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Dark Mode Toggle
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key.toLowerCase() === 'd') {
        setIsDark(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (!isDark) {
      document.documentElement.style.setProperty('--bg1', '#f5f7fb');
      document.documentElement.style.setProperty('--bg2', '#efeff6');
      document.documentElement.style.setProperty('--accent1', '#6b2ff7');
      document.body.style.color = '#1b1b27';
    } else {
      document.documentElement.style.removeProperty('--bg1');
      document.documentElement.style.removeProperty('--bg2');
      document.body.style.color = '';
    }
  }, [isDark]);

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
      for (let i = 0; i < 40; i++) {
        particles.push({
          x: Math.random() * W,
          y: Math.random() * H,
          r: Math.random() * 2 + 0.6,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4
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

    window.addEventListener('resize', reset);
    reset();
    step();

    return () => {
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

  // Resume Download
  const handleDownloadResume = (e) => {
    // e.preventDefault(); // If using actual file, don't prevent default.
    // The original code generated a blob, but the HTML had a link to ./file/resume.pdf
    // I will keep the link behavior if it points to a real file, or implement the blob if requested.
    // The HTML had: <a class="btn pulse" href="./file/resume.pdf" download>
    // The JS had: logic for #download-resume button which wasn't in the HTML snippet provided (or I missed it).
    // Ah, the JS had `const resumeBtn = $('#download-resume');` but the HTML has `<a ... href="./file/resume.pdf" ...>`.
    // I will stick to the HTML link which is simpler and likely what is used.
  };

  // Contact Form
  const handleContactSubmit = (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    alert('Thanks, ' + fd.get('name') + " — message received (demo).\nI'll reply at: " + fd.get('email'));
    e.target.reset();
  };

  // Achievement Accordion


  // Projects Data
  const projects = [
    {
      id: 1,
      title: 'Travel and Tourism',
      description: 'Travel and tourism platform for viewing places in VA/AR.',
      details: 'An immersive travel experience allowing users to explore destinations through Virtual and Augmented Reality. Features include 360-degree views, interactive guides, and seamless booking integration.',
      img: '/pic/vr.png',
      link: 'https://tripplanner-amber.vercel.app/',
      images: [
        '/pic/vr.png',
        '/pic/plan.png', // Placeholder, using other project images as requested
        '/pic/view.png',
        '/pic/ar.jpeg'
      ]
    },
    {
      id: 2,
      title: 'Herbious',
      description: 'Herbious for learn herbs and we can see plants in VR view.',
      details: 'Educational platform dedicated to medicinal herbs. Users can visualize plants in 3D/VR, learn about their properties, and identify them using AI-powered image recognition.',
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
        <div className="nav-inner container">
          <div className="brand">
            <h1>Kamaraj</h1>
          </div>
          <nav className={isNavOpen ? 'open' : ''}>
            <a href="#home" className={`nav-link ${activeSection === 'home' ? 'active' : ''}`} onClick={() => setIsNavOpen(false)}>Home</a>
            <a href="#about" className={`nav-link ${activeSection === 'about' ? 'active' : ''}`} onClick={() => setIsNavOpen(false)}>About</a>
            <a href="#achievements" className={`nav-link ${activeSection === 'achievements' ? 'active' : ''}`} onClick={() => setIsNavOpen(false)}>Achievements</a>
            <a href="#projects" className={`nav-link ${activeSection === 'projects' ? 'active' : ''}`} onClick={() => setIsNavOpen(false)}>Projects</a>
            <a href="#contact" className={`nav-link ${activeSection === 'contact' ? 'active' : ''}`} onClick={() => setIsNavOpen(false)}>Contact</a>
          </nav>
          <button className="hamburger" aria-label="menu" aria-expanded={isNavOpen} onClick={toggleNav}>☰</button>
        </div>
      </header>

      <main className="container">
        <section id="home" className="hero">
          <canvas id="particle-canvas" ref={canvasRef}></canvas>
          <div className="hero-inner">
            <div
              className="fade-in"
              style={{ transform: `translateY(${scrollY * 0.15}px)` }}
            >
              <TiltCard className="profile card">
                <img src="/pic/kamaraj.jpg" alt="Profile" />
              </TiltCard>
            </div>
            <div
              className="hero-text"
              style={{ transform: `translateY(${scrollY * 0.05}px)` }}
            >
              <h2 className="fade-in">Hi — I'm <strong>Kamaraj</strong></h2>
              <p className="fade-in" style={{ color: '#cfcfe8' }}>
                {typedText || "A college student passionate about web development, UI/UX and building projects that blend design with clean code."}
              </p>

              <div className="cta-row fade-in" style={{ marginTop: '16px' }}>
                <a className="btn pulse" href="/file/resume.pdf" download>
                  <span>⬇</span> Resume </a>
                <a className="btn ghost" href="#projects">View Projects</a>
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
                desc: 'I secured first place in CodeWar 1.0 at Park Engineering College, winning a cash prize of ₹10,000, and was honored on Achievers’ Day during my first year.'
              },
              {
                icon: '📜',
                title: 'BGS Certification',
                img: '/pic/bgs.jpg',
                desc: 'I participated in the National Level Hackathon “ADVAYA 2K25,” conducted at BGS College of Engineering & Technology, Bengaluru, on 11–12 April 2025.'
              },
              {
                icon: '🏆',
                title: 'GravitoHacks – GDG Saveetha',
                img: 'pic/google.jpg',
                desc: 'Thrilled to share that Team Pixelate secured 2nd place at GravitoHacks, a hackathon organized by the Google Developer Group (GDG) at Saveetha School of Engineering.'
              }
            ].map((item, index) => (
              <TiltCard key={index} className="project-card fade-in">
                <div className="project-thumb" style={{ height: '200px', background: 'transparent' }}>
                  <img src={item.img} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div className="project-body">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '24px' }}>{item.icon}</span>
                    <h4 style={{ margin: 0 }}>{item.title}</h4>
                  </div>
                  <p>{item.desc}</p>
                </div>
              </TiltCard>
            ))}
          </div>
        </section>

        <section id="projects">
          <h3 className="section-title">Projects</h3>
          <div className="projects-grid">
            {projects.map((project) => (
              <TiltCard key={project.id} className="project-card fade-in">
                <div className="project-thumb">
                  <img src={project.img} alt={project.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div className="project-body">
                  <h4>{project.title}</h4>
                  <p>{project.description}</p>
                  <div style={{ display: 'flex', gap: '10px', marginTop: 'auto' }}>
                    <a className="btn ghost" href={project.link} target="_blank" rel="noopener noreferrer">App</a>
                    <button className="btn ghost" onClick={() => setSelectedProject(project)}>Details</button>
                  </div>
                </div>
              </TiltCard>
            ))}
          </div>
        </section>

        <section id="contact">
          <h3 className="section-title">Contact</h3>
          <div className="card">
            <form id="contact-form" onSubmit={handleContactSubmit}>
              <input type="text" name="name" placeholder="Your name" required />
              <input type="email" name="email" placeholder="Your email" required />
              <input type="text" name="subject" placeholder="Subject" />
              <textarea name="message" placeholder="Your message" required></textarea>
              <button className="btn" type="submit">Send Message</button>
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
            <h3 style={{ marginTop: 0 }}>{selectedProject.title}</h3>
            <p style={{ color: 'var(--accent1)', marginBottom: '16px' }}><strong>{selectedProject.description}</strong></p>
            <p style={{ marginBottom: '24px', lineHeight: '1.6' }}>{selectedProject.details}</p>

            <div className="modal-gallery">
              {selectedProject.images.map((img, idx) => (
                <div key={idx} className="gallery-item">
                  <img src={img} alt={`${selectedProject.title} - ${idx + 1}`} />
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
