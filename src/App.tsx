import { useEffect } from 'react';
import StoryStack, { type StoryCardData } from './components/StoryStack';

const stories: StoryCardData[] = [
  {
    id: 'about',
    eyebrow: 'Computer science · Semester 07',
    title: 'Hi, I’m Fazal Wahid.',
    body: 'A computer science student and full-stack developer, turning thoughtful ideas into useful digital experiences.',
    image: '/images/fazal-wahid.jpg',
    imageAlt: 'Portrait of Fazal Wahid',
  },
  {
    id: 'frontend',
    eyebrow: '01 / The experience',
    title: 'Frontend, made with feeling.',
    body: 'I build accessible, responsive interfaces with a careful eye for interaction, typography, and detail.',
    tags: ['React', 'TypeScript', 'JavaScript', 'Tailwind CSS', 'HTML & CSS', 'Accessibility'],
  },
  {
    id: 'backend',
    eyebrow: '02 / The foundation',
    title: 'Backend, built to hold up.',
    body: 'From API design to data models, I enjoy creating the reliable systems that make great products work.',
    image:
      'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=85',
    imageAlt: 'Blue-lit server racks representing backend infrastructure',
    tags: ['Node.js', 'Express', 'REST APIs', 'SQL', 'Authentication'],
  },
  {
    id: 'ai',
    eyebrow: '03 / The next frontier',
    title: 'Curious about intelligent systems.',
    body: 'I’m exploring AI engineering: building, evaluating, and shipping useful machine-learning applications.',
    visual: 'ai',
    tags: [
      'Python · ML',
      'PyTorch · TensorFlow',
      'NLP · computer vision',
      'LLMs · transformers',
      'RAG · embeddings · vector databases',
      'Prompting · fine-tuning · agents',
      'Evaluation · responsible AI',
      'MLOps · APIs · Docker · cloud',
    ],
  },
];

const toolkit = [
  {
    number: '01',
    title: 'Frontend',
    description: 'React, TypeScript, JavaScript, HTML, CSS, Tailwind CSS, responsive UI, accessibility.',
  },
  {
    number: '02',
    title: 'Backend',
    description: 'Node.js, Express, REST APIs, authentication, server-side logic, SQL and data modeling.',
  },
  {
    number: '03',
    title: 'AI engineering',
    description:
      'Python, machine learning, deep learning, PyTorch, TensorFlow, scikit-learn, NLP, computer vision, LLMs, transformers, embeddings, vector search, RAG, prompt engineering, fine-tuning, agents, evaluation, MLOps, deployment, monitoring, and responsible AI.',
  },
];

function ArrowUpRight() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" className="h-4 w-4">
      <path d="M3.5 12.5 12 4m0 0H5m7 0v7" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}

export default function App() {
  useEffect(() => {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.15 },
    );
    document.querySelectorAll('.reveal').forEach((element) => revealObserver.observe(element));

    let ticking = false;
    const updateProgress = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        const range = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
        document.documentElement.style.setProperty(
          '--page-progress',
          String(window.scrollY / range),
        );
        ticking = false;
      });
    };

    updateProgress();
    window.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('resize', updateProgress);
    return () => {
      revealObserver.disconnect();
      window.removeEventListener('scroll', updateProgress);
      window.removeEventListener('resize', updateProgress);
    };
  }, []);

  return (
    <main className="min-h-screen bg-ink text-paper">
      <div className="page-progress" aria-hidden="true">
        <span />
      </div>
      <div className="ambient-grid" aria-hidden="true" />
      <header className="site-header mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-6 md:px-12">
        <a
          href="#home"
          className="font-serif text-lg tracking-tight text-paper"
          aria-label="Fazal Wahid, home"
        >
          FW<span className="text-lime">.</span>
        </a>
        <nav aria-label="Main navigation" className="flex items-center gap-5 sm:gap-9">
          <a className="nav-link" href="#story-stack">
            About
          </a>
          <a className="nav-link" href="#toolkit">
            Toolkit
          </a>
          <a className="nav-contact" href="#contact">
            Let’s talk <ArrowUpRight />
          </a>
        </nav>
      </header>

      <section
        id="home"
        className="hero mx-auto grid min-h-[calc(100svh-76px)] w-full max-w-7xl items-center gap-12 px-6 pb-20 pt-10 md:grid-cols-[1.25fr_0.75fr] md:px-12"
      >
        <div className="hero-copy">
          <p className="eyebrow mb-7 flex items-center gap-3">
            <span className="status-dot" />
            Hello, welcome to my portfolio
          </p>
          <h1 className="max-w-4xl font-serif text-[clamp(3.5rem,9vw,8.5rem)] leading-[0.88] tracking-[-0.075em]">
            Fazal
            <br />
            <span className="text-lime">Wahid.</span>
          </h1>
          <p className="hero-role">Computer Science Student · Full-stack Developer</p>
          <div className="mt-9 flex max-w-xl flex-col gap-7 sm:flex-row sm:items-end sm:justify-between">
            <p className="max-w-sm text-sm leading-7 text-muted">
              I’m in my seventh semester of computer science, learning and building across the
              frontend and backend. I care about creating useful digital experiences and am
              excited to explore the possibilities of AI engineering.
            </p>
            <div className="hero-actions">
              <a className="round-link" href="#story-stack" aria-label="Explore my portfolio">
                Explore portfolio <span aria-hidden="true">↓</span>
              </a>
              <a className="hero-contact-link" href="#contact">Get in touch ↗</a>
            </div>
          </div>
        </div>

        <div
          className="hero-panel"
          aria-label="Frontend and backend development with an interest in AI engineering"
        >
          <div className="hero-panel-top">
            <span className="hero-panel-status">Learning and building</span>
            <span>Portfolio · 2026</span>
          </div>
          <div className="hero-panel-art" aria-hidden="true">
            <div className="hero-orbit hero-orbit--one" />
            <div className="hero-orbit hero-orbit--two" />
            <div className="hero-orbit hero-orbit--three" />
            <span className="hero-panel-mark">FW</span>
          </div>
          <div>
            <p className="hero-panel-title">Curiosity meets code.</p>
            <div className="hero-panel-tags">
              <span>Frontend</span>
              <span>Backend</span>
              <span>AI engineering</span>
              <span>Computer science</span>
            </div>
          </div>
          <div className="hero-panel-bottom">
            <span>Building a little better every day</span>
            <span>01 — 04</span>
          </div>
        </div>

        <div className="hero-bottom">
          <span>Based in Pakistan</span>
          <span>Curious by nature. Builder by practice.</span>
          <a href="#toolkit">Scroll to discover ↓</a>
        </div>
        <a className="scroll-cue" href="#story-stack" aria-label="Scroll to explore my story" />
      </section>

      <StoryStack cards={stories} />

      <section id="toolkit" className="toolkit-section section-wrap">
        <div className="section-intro">
          <p className="eyebrow">What I’m learning & building</p>
          <h2 className="section-title">
            A growing toolkit,
            <br />
            <span className="text-muted">a curious mind.</span>
          </h2>
        </div>

        <div className="toolkit-list">
          {toolkit.map((item) => (
            <article className="toolkit-item reveal" key={item.number}>
              <span className="toolkit-number">{item.number}</span>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
              <span className="toolkit-plus" aria-hidden="true">
                +
              </span>
            </article>
          ))}
        </div>
      </section>

      <section id="contact" className="contact-section section-wrap">
        <p className="eyebrow">Have an idea in mind?</p>
        <div className="contact-row reveal">
          <h2 className="section-title">
            Let’s make
            <br />
            something <span className="text-lime">matter.</span>
          </h2>
          <a className="contact-link" href="mailto:">
            Start a conversation <ArrowUpRight />
          </a>
        </div>
      </section>

      <footer className="site-footer mx-auto flex w-full max-w-7xl flex-col gap-3 px-6 py-7 text-xs text-muted sm:flex-row sm:items-center sm:justify-between md:px-12">
        <span>© {new Date().getFullYear()} Fazal Wahid</span>
        <span>Designed with curiosity. Built for the web.</span>
        <a className="footer-top" href="#home">
          Back to top ↑
        </a>
      </footer>
    </main>
  );
}
