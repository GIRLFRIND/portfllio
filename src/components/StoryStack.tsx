import { useEffect, useRef } from 'react';

export interface StoryCardData {
  id: string;
  title: string;
  body?: string;
  eyebrow?: string;
  image?: string;
  imageAlt?: string;
  tags?: string[];
  visual?: 'ai';
}

interface StoryStackProps {
  cards: StoryCardData[];
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

// Tweak 14px for stack spacing, 0.04 for the scale step, and 500vh for runway length.
export default function StoryStack({ cards }: StoryStackProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const cardRefs = useRef<Array<HTMLElement | null>>([]);
  const stepRefs = useRef<Array<HTMLButtonElement | null>>([]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || cards.length === 0) return;

    // Step 5: reduced-motion users keep the CSS-defined stack and skip scroll listeners.
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (reducedMotion.matches) return;

    let ticking = false;
    let animationFrame = 0;

    // Step 3: map the section's scroll distance to one card-to-card progress value.
    const updateCards = () => {
      const viewportHeight = window.innerHeight;
      const runway = Math.max(section.offsetHeight - viewportHeight, 1);
      const distance = clamp(-section.getBoundingClientRect().top, 0, runway);
      const progress = (distance / runway) * (cards.length - 1);
      const frameHeight = cardRefs.current[0]?.parentElement?.clientHeight ?? viewportHeight * 0.62;
      const counter = document.getElementById('story-count');
      const activeIndex = Math.min(Math.floor(progress), cards.length - 1);
      if (counter) {
        counter.textContent = String(activeIndex + 1).padStart(2, '0');
      }
      stepRefs.current.forEach((step, index) => {
        if (!step) return;
        if (index === activeIndex) step.setAttribute('aria-current', 'step');
        else step.removeAttribute('aria-current');
      });

      // Step 4: JavaScript writes animation values as CSS custom properties.
      cardRefs.current.forEach((card, index) => {
        if (!card) return;
        const distanceFromFront = index - progress;
        const offset = distanceFromFront < 0 ? clamp(-distanceFromFront, 0, 1) : 0;
        const depth = distanceFromFront > 0 ? Math.min(distanceFromFront, 3) : 0;
        const ramp = clamp(offset / 0.2, 0, 1);
        const easedRamp = ramp * ramp * (3 - 2 * ramp);
        const nextEdgeDistance =
          (1 - offset) * easedRamp * (14 + frameHeight * 0.04);

        card.style.setProperty('--offset', String(offset));
        card.style.setProperty('--stack', String(depth * 14));
        card.style.setProperty('--scale', String(1 - depth * 0.04));
        card.style.setProperty('--clip', String(offset * 100));
        card.style.setProperty('--nd', String(nextEdgeDistance));
        card.style.setProperty('--shade', String(offset * 0.22));
      });
    };

    // Step 5: batch scroll work into one animation frame; resize recalculates the runway.
    const scheduleUpdate = () => {
      if (ticking) return;
      ticking = true;
      animationFrame = window.requestAnimationFrame(() => {
        updateCards();
        ticking = false;
      });
    };

    updateCards();
    const stepHandlers = stepRefs.current.map((step, index) => {
      if (!step) return null;
      const handler = () => {
        const runway = Math.max(section.offsetHeight - window.innerHeight, 1);
        const target =
          window.scrollY +
          section.getBoundingClientRect().top +
          runway * (index / Math.max(cards.length - 1, 1));
        window.scrollTo({ top: target, behavior: 'smooth' });
      };
      step.addEventListener('click', handler);
      return handler;
    });
    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate);

    return () => {
      window.removeEventListener('scroll', scheduleUpdate);
      window.removeEventListener('resize', scheduleUpdate);
      window.cancelAnimationFrame(animationFrame);
      stepRefs.current.forEach((step, index) => {
        const handler = stepHandlers[index];
        if (step && handler) step.removeEventListener('click', handler);
      });
    };
  }, [cards.length]);

  return (
    <>
      <style>{`
        /* Step 1: the tall section is the scroll runway. */
        .stories {
          height: 500vh;
          position: relative;
          background: #0d0d0d;
          color: #f3ecdc;
        }

        /* Step 2: one pinned stage holds the frame and its overlapping cards. */
        .story-stage {
          height: 100vh;
          position: sticky;
          top: 0;
          display: grid;
          place-items: center;
          overflow: hidden;
        }

        .story-heading {
          position: absolute;
          top: clamp(32px, 7vh, 68px);
          left: max(7vw, calc((100vw - 1200px) / 2));
          right: max(7vw, calc((100vw - 1200px) / 2));
          z-index: 10;
          display: flex;
          align-items: end;
          justify-content: space-between;
          gap: 20px;
        }

        .story-heading h2 {
          max-width: 470px;
          margin: 10px 0 0;
          color: #f3ecdc;
          font: 400 clamp(30px, 4.2vw, 52px)/1.04 Georgia, serif;
          letter-spacing: -0.045em;
        }

        .story-heading .story-heading-note {
          margin: 0 0 5px;
          color: #a39e92;
          font-size: 11px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          white-space: nowrap;
        }

        .story-kicker {
          display: block;
          color: #c4f06a;
          font: 600 10px/1.3 Inter, Arial, sans-serif;
          letter-spacing: 0.18em;
          text-transform: uppercase;
        }

        .story-frame {
          position: relative;
          width: min(1000px, 90vw);
          height: min(480px, 62vh);
          margin-top: 46px;
          isolation: isolate;
        }

        .story-frame::before {
          position: absolute;
          z-index: -1;
          inset: -10%;
          border-radius: 50%;
          background: radial-gradient(ellipse, rgba(156, 140, 255, 0.07), transparent 68%);
          filter: blur(20px);
          content: '';
          pointer-events: none;
        }

        .story-card {
          --offset: 0;
          --stack: 0;
          --scale: 1;
          --clip: 0;
          --nd: 0;
          --shade: 0;
          position: absolute;
          inset: 0;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: clamp(22px, 4vw, 34px);
          border: 1px solid rgba(37, 34, 28, 0.16);
          border-radius: 18px;
          background: #f3ecdc;
          color: #181713;
          box-shadow: 0 32px 80px rgba(0, 0, 0, 0.38);
          transform: translate3d(0, calc(var(--offset) * -100% + var(--stack) * 1px), 0) scale(var(--scale));
          transform-origin: center top;
          clip-path: inset(calc(var(--clip) * 1% + var(--nd) * 1px) -80px -80px -80px);
          will-change: transform;
          transition: box-shadow 350ms ease, border-color 350ms ease;
        }

        .story-card::after {
          position: absolute;
          z-index: 3;
          inset: 0;
          background: rgba(13, 13, 13, 0.3);
          content: '';
          opacity: var(--shade);
          pointer-events: none;
        }

        .story-card:hover {
          border-color: rgba(196, 240, 106, 0.4);
          box-shadow: 0 40px 100px rgba(0, 0, 0, 0.56), 0 0 45px rgba(196, 240, 106, 0.07);
        }

        .story-card:nth-child(1) { z-index: 4; }
        .story-card:nth-child(2) { z-index: 3; --stack: 14; --scale: 0.96; }
        .story-card:nth-child(3) { z-index: 2; --stack: 28; --scale: 0.92; }
        .story-card:nth-child(4) { z-index: 1; --stack: 42; --scale: 0.88; }

        .story-card-header {
          position: relative;
          z-index: 2;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        .story-card-number {
          font: 600 10px/1 Inter, Arial, sans-serif;
          letter-spacing: 0.18em;
        }

        .story-card-eyebrow {
          color: #6d6a60;
          font: 600 9px/1 Inter, Arial, sans-serif;
          letter-spacing: 0.16em;
          text-align: right;
          text-transform: uppercase;
        }

        .story-copy {
          position: relative;
          z-index: 2;
          max-width: 100%;
        }

        .story-copy h3 {
          max-width: 430px;
          margin: 0 0 10px;
          font: 400 clamp(31px, 5vw, 52px)/0.98 Georgia, serif;
          letter-spacing: -0.055em;
        }

        .story-copy p {
          max-width: 390px;
          margin: 0;
          color: #57544d;
          font: 400 12px/1.6 Inter, Arial, sans-serif;
        }

        .story-tags {
          position: relative;
          z-index: 2;
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          max-width: 100%;
          margin-top: 15px;
        }

        .story-tag {
          padding: 6px 9px;
          border: 1px solid rgba(24, 23, 19, 0.15);
          border-radius: 999px;
          color: #333129;
          font: 500 9px/1.1 Inter, Arial, sans-serif;
          letter-spacing: 0.01em;
        }

        .story-card--portrait .story-copy,
        .story-card--server .story-copy {
          width: 61%;
        }

        .story-card--portrait.story-card--featured {
          justify-content: center;
        }

        .story-card--featured .story-card-header {
          position: absolute;
          inset: 30px 34px auto;
          align-items: center;
        }

        .story-card--featured .story-card-number {
          display: grid;
          width: 34px;
          height: 34px;
          place-items: center;
          border: 1px solid rgba(24, 23, 19, 0.17);
          border-radius: 50%;
          background: rgba(13, 13, 13, 0.4);
          color: #fff;
        }

        .story-card--featured .story-card-eyebrow {
          color: #57544d;
        }

        .story-card--featured .story-copy {
          width: 54%;
          margin-left: 44%;
        }

        .story-card--featured .story-copy h3 {
          font-size: clamp(36px, 5vw, 61px);
        }

        .story-card--featured .story-copy p {
          font-size: 13px;
        }

        .story-image {
          position: absolute;
          top: 0;
          right: 0;
          bottom: 0;
          width: 38%;
          object-fit: cover;
        }

        .story-card--portrait .story-image {
          right: auto;
          left: 0;
          width: 42%;
          object-position: center 35%;
        }

        .story-card--featured::before {
          position: absolute;
          z-index: 1;
          inset: 0 58% 0 0;
          background: linear-gradient(0deg, rgba(0, 0, 0, 0.73), transparent 62%),
            linear-gradient(90deg, transparent 72%, rgba(0, 0, 0, 0.12));
          content: '';
        }

        .story-image-caption {
          position: absolute;
          z-index: 2;
          bottom: 30px;
          left: 30px;
          width: calc(42% - 48px);
          color: #fff;
          font: 600 9px/1.7 Inter, Arial, sans-serif;
          letter-spacing: 0.16em;
          text-shadow: 0 1px 12px #000;
          text-transform: uppercase;
        }

        .story-image-caption strong {
          display: block;
          font: 400 clamp(18px, 2.4vw, 27px)/1.1 Georgia, serif;
          letter-spacing: -0.02em;
          text-transform: none;
        }

        .story-card--server .story-image {
          object-position: center;
          filter: saturate(0.65);
        }

        .story-card--portrait::after,
        .story-card--server::after {
          position: absolute;
          inset: 0 34% 0 auto;
          width: 12%;
          background: linear-gradient(90deg, #f3ecdc, rgba(243, 236, 220, 0));
          content: '';
          pointer-events: none;
        }

        .story-card--ai {
          background:
            radial-gradient(ellipse at 86% 16%, rgba(196, 240, 106, 0.22), transparent 34%),
            #f3ecdc;
        }

        .story-card--ai .story-copy h3 {
          max-width: 450px;
          font-size: clamp(29px, 4.7vw, 46px);
        }

        .story-card--ai .story-tags {
          max-width: 485px;
        }

        .story-ai-mark {
          position: absolute;
          top: 58px;
          right: 34px;
          display: grid;
          width: 60px;
          aspect-ratio: 1;
          place-items: center;
          border: 1px solid rgba(24, 23, 19, 0.17);
          border-radius: 50%;
          color: #25291c;
          font: 400 24px/1 Georgia, serif;
        }

        .story-ai-mark::before,
        .story-ai-mark::after {
          position: absolute;
          inset: -8px;
          border: 1px solid rgba(24, 23, 19, 0.11);
          border-radius: 50%;
          content: '';
        }

        .story-ai-mark::after {
          inset: -17px;
        }

        .story-hint {
          position: absolute;
          bottom: 28px;
          color: #a39e92;
          font: 500 9px/1.4 Inter, Arial, sans-serif;
          letter-spacing: 0.15em;
          text-transform: uppercase;
        }

        .story-navigation {
          position: absolute;
          z-index: 8;
          bottom: 42px;
          left: 50%;
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 6px;
          border: 1px solid rgba(243, 236, 220, 0.13);
          border-radius: 999px;
          background: rgba(17, 17, 14, 0.74);
          backdrop-filter: blur(12px);
          transform: translateX(-50%);
        }

        .story-step {
          display: grid;
          width: 34px;
          height: 28px;
          place-items: center;
          padding: 0;
          border: 0;
          border-radius: 999px;
          background: transparent;
          color: #a39e92;
          cursor: pointer;
          font: 600 9px/1 Inter, Arial, sans-serif;
          letter-spacing: 0.1em;
          transition: color 200ms ease, background 200ms ease, transform 200ms ease;
        }

        .story-step:hover {
          color: #f3ecdc;
          transform: translateY(-2px);
        }

        .story-step[aria-current='step'] {
          background: #c4f06a;
          color: #0d0d0d;
        }

        .story-count {
          position: absolute;
          right: max(5vw, calc((100vw - 1200px) / 2));
          bottom: 20px;
          color: #f3ecdc;
          font: 400 12px/1 Georgia, serif;
          letter-spacing: 0.08em;
        }

        .story-count span {
          color: #a39e92;
        }

        @media (max-width: 600px) {
          .story-heading {
            top: 32px;
            left: 7vw;
            right: 7vw;
            align-items: start;
          }

          .story-heading h2 {
            max-width: 270px;
            font-size: 34px;
          }

          .story-heading .story-heading-note {
            display: none;
          }

          .story-navigation {
            bottom: 40px;
          }

          .story-count {
            bottom: 17px;
          }

          .story-frame {
            width: 90vw;
            height: min(430px, 60vh);
            margin-top: 46px;
          }

          .story-card {
            padding: 20px;
            border-radius: 14px;
          }

          .story-image {
            width: 38%;
          }

          .story-card--featured .story-card-header {
            inset: 20px 20px auto;
          }

          .story-card--featured .story-copy {
            width: 54%;
            margin-left: 44%;
          }

          .story-card--featured .story-copy h3 {
            font-size: clamp(30px, 8vw, 42px);
          }

          .story-card--featured .story-copy p {
            font-size: 11px;
          }

          .story-card--portrait .story-image {
            width: 42%;
          }

          .story-image-caption {
            bottom: 20px;
            left: 18px;
            width: calc(42% - 36px);
            font-size: 7px;
          }

          .story-image-caption strong {
            font-size: 18px;
          }

          .story-card--portrait::after,
          .story-card--server::after {
            right: 31%;
          }

          .story-ai-mark {
            top: 50px;
            right: 23px;
            width: 45px;
          }

          .story-hint {
            bottom: 20px;
            font-size: 8px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .stories {
            height: 100vh;
          }

          .story-navigation {
            display: none;
          }
        }
      `}</style>

      <section
        ref={sectionRef}
        className="stories"
        id="story-stack"
        aria-label="A little about my work"
      >
        <div className="story-stage">
          <div className="story-heading">
            <div>
              <span className="story-kicker">A little about my work</span>
              <h2>One idea at a time, built from every layer.</h2>
            </div>
            <p className="story-heading-note">
              Scroll to explore · <span id="story-count" aria-hidden="true">01</span> /{' '}
              {String(cards.length).padStart(2, '0')}
            </p>
          </div>

          <div className="story-frame">
            {cards.map((card, index) => (
              <article
                key={card.id}
                ref={(element) => {
                  cardRefs.current[index] = element;
                }}
                className={[
                  'story-card',
                  card.image === '/images/fazal-wahid.jpg' ? 'story-card--portrait' : '',
                  card.image === '/images/fazal-wahid.jpg' ? 'story-card--featured' : '',
                  card.image && card.image !== '/images/fazal-wahid.jpg' ? 'story-card--server' : '',
                  card.visual === 'ai' ? 'story-card--ai' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                <header className="story-card-header">
                  <span className="story-card-number">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  {card.eyebrow && <span className="story-card-eyebrow">{card.eyebrow}</span>}
                </header>

                {card.image && (
                  <img className="story-image" src={card.image} alt={card.imageAlt ?? ''} />
                )}
                {card.image === '/images/fazal-wahid.jpg' && (
                  <div className="story-image-caption">
                    <strong>Fazal Wahid</strong>
                    Curious mind · Full-stack developer
                  </div>
                )}
                {card.visual === 'ai' && (
                  <span className="story-ai-mark" aria-hidden="true">
                    AI
                  </span>
                )}

                <div className="story-copy">
                  <h3>{card.title}</h3>
                  {card.body && <p>{card.body}</p>}
                  {card.tags && (
                    <div className="story-tags">
                      {card.tags.map((tag) => (
                        <span className="story-tag" key={tag}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>

          <p className="story-hint">Scroll to move through the stack ↓</p>
          <nav className="story-navigation" aria-label="Choose a story card">
            {cards.map((card, index) => (
              <button
                key={card.id}
                ref={(element) => {
                  stepRefs.current[index] = element;
                }}
                className="story-step"
                type="button"
                aria-label={`Show story ${index + 1}`}
                aria-current={index === 0 ? 'step' : undefined}
              >
                {String(index + 1).padStart(2, '0')}
              </button>
            ))}
          </nav>
          <p className="story-count">
            <span id="story-count">01</span>
            <span> / {String(cards.length).padStart(2, '0')}</span>
          </p>
        </div>
      </section>
    </>
  );
}
