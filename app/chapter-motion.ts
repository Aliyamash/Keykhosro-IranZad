import gsap from 'gsap';

/** Called within the parent GSAP context; matchMedia owns breakpoint cleanup. */
export function addChapterMotion(mm: gsap.MatchMedia, lang: string) {
  const rtl = lang === 'fa';
  const inlineFrom = rtl ? 34 : -34;
  gsap.utils
    .toArray<HTMLElement>('.chapter-heading,.process-step')
    .forEach((el) => {
      gsap.from(el, {
        x: inlineFrom,
        y: 24,
        opacity: 0,
        duration: 1.1,
        ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 90%', once: true },
      });
    });
  if (document.querySelector('.manifesto-section')) {
    gsap.fromTo(
      '.manifesto-word',
      { opacity: 0.18, x: rtl ? 22 : -22, y: 10 },
      {
        opacity: 1,
        x: 0,
        y: 0,
        stagger: 0.18,
        ease: 'none',
        scrollTrigger: {
          trigger: '.manifesto-section',
          start: 'top 65%',
          end: 'bottom 75%',
          scrub: 0.6,
        },
      },
    );
  }
  gsap.utils.toArray<HTMLElement>('.diptych-images figure').forEach((el, i) => {
    gsap.from(el, {
      x: (i === 0 ? 1 : -1) * inlineFrom,
      y: 45,
      opacity: 0,
      duration: 1.4,
      ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 88%', once: true },
    });
    gsap.to(el.querySelector('img'), {
      opacity: i === 0 ? 0.82 : 0.9,
      ease: 'none',
      scrollTrigger: {
        trigger: el,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1.2,
      },
    });
  });
  gsap.utils.toArray<HTMLElement>('.contact-sheet figure').forEach((el, i) => {
    gsap.from(el, {
      x: (i % 2 === 0 ? 1 : -1) * inlineFrom * 0.55,
      y: 35,
      opacity: 0,
      rotation: (i % 2 === 0 ? -1 : 1) * (rtl ? -1 : 1) * 1.5,
      duration: 1.1,
      delay: (i % 3) * 0.1,
      ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 95%', once: true },
    });
  });
  gsap.utils.toArray<HTMLElement>('.process-rule').forEach((el) => {
    gsap.from(el, {
      scaleX: 0,
      ease: 'none',
      scrollTrigger: {
        trigger: el.parentElement,
        start: 'top 80%',
        end: 'bottom 85%',
        scrub: 0.7,
      },
    });
  });
  mm.add('(min-width: 761px)', () => {
    const sequence = document.querySelector<HTMLElement>('.sequence-section');
    const viewport = sequence?.querySelector<HTMLElement>('.sequence-viewport');
    const track = sequence?.querySelector<HTMLElement>('.sequence-track');
    if (sequence && viewport && track) {
      sequence.classList.add('is-sequence-motion');
      const distance = () =>
        Math.max(0, track.scrollWidth - viewport.clientWidth);
      gsap
        .timeline({
          scrollTrigger: {
            trigger: viewport,
            start: 'top 12%',
            end: () => `+=${Math.max(distance(), window.innerHeight * 1.8)}`,
            pin: true,
            scrub: 1.1,
            invalidateOnRefresh: true,
          },
        })
        .fromTo(
          track,
          { x: 0 },
          {
            x: () => (rtl ? distance() : -distance()),
            ease: 'none',
            duration: 1,
          },
        )
        .to(
          '.sequence-line i',
          {
            scaleX: 1,
            transformOrigin: rtl ? 'right center' : 'left center',
            ease: 'none',
            duration: 1,
          },
          0,
        );
    }
    if (document.querySelector('.aperture-section')) {
      gsap
        .timeline({
          scrollTrigger: {
            trigger: '.aperture-section',
            start: 'top top',
            end: '+=145%',
            pin: true,
            scrub: 1.2,
            invalidateOnRefresh: true,
          },
        })
        .fromTo(
          '.aperture-mask',
          { clipPath: 'inset(22% 35% 22% 35%)' },
          {
            clipPath: 'inset(0% 0% 0% 0%)',
            ease: 'power2.inOut',
            duration: 1.6,
          },
        )
        .fromTo(
          '.aperture-mask img',
          { opacity: 0.55 },
          { opacity: 1, ease: 'none', duration: 2 },
          0,
        )
        .fromTo(
          '.aperture-section h2>span',
          { xPercent: rtl ? -10 : 10 },
          { xPercent: rtl ? 5 : -5, ease: 'none', duration: 2 },
          0,
        )
        .fromTo(
          '.aperture-section h2>em',
          { xPercent: rtl ? 10 : -10 },
          { xPercent: rtl ? -5 : 5, ease: 'none', duration: 2 },
          0,
        )
        .from('.aperture-caption', { y: 30, opacity: 0, duration: 0.7 }, 1.1);
    }
    const heading = document.querySelector<HTMLElement>('.process-heading');
    const steps = document.querySelector<HTMLElement>('.process-steps');
    if (heading && steps) {
      gsap.to(heading, {
        scrollTrigger: {
          trigger: heading,
          start: 'top 12%',
          end: () =>
            `+=${Math.max(0, steps.offsetHeight - heading.offsetHeight)}`,
          pin: true,
          pinSpacing: false,
          invalidateOnRefresh: true,
        },
      });
    }
    return () => sequence?.classList.remove('is-sequence-motion');
  });
  mm.add('(max-width: 760px)', () => {
    gsap.utils.toArray<HTMLElement>('.sequence-frame').forEach((el, i) => {
      gsap.from(el, {
        x: inlineFrom * (i % 2 === 0 ? 22 : -22),
        y: 40,
        opacity: 0,
        duration: 1.1,
        ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 92%', once: true },
      });
    });
    if (document.querySelector('.aperture-section'))
      gsap.fromTo(
        '.aperture-mask',
        {
          clipPath: rtl ? 'inset(12% 6% 12% 20%)' : 'inset(12% 20% 12% 6%)',
        },
        {
          clipPath: 'inset(0% 0%)',
          ease: 'none',
          scrollTrigger: {
            trigger: '.aperture-section',
            start: 'top 80%',
            end: 'top 10%',
            scrub: 0.6,
          },
        },
      );
  });
}
