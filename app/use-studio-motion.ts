'use client';
import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { addChapterMotion } from './chapter-motion';
gsap.registerPlugin(ScrollTrigger);
export function useStudioMotion(page: string, lang: string) {
  useEffect(() => {
    const reduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    if (reduced) return;
    const rtl = lang === 'fa';
    const compact = window.matchMedia('(max-width: 760px)').matches;
    const inlineFrom = rtl ? 1 : -1;
    const mm = gsap.matchMedia();
    const ctx = gsap.context(() => {
      gsap.set('.reading-progress', {
        transformOrigin: rtl ? 'right center' : 'left center',
      });
      const enter = gsap.timeline({ defaults: { ease: 'power3.out' } });
      enter.fromTo(
        '.page-curtain',
        { scaleY: 1 },
        {
          scaleY: 0,
          transformOrigin: 'top',
          duration: compact ? 0.5 : 0.95,
        },
      );
      enter.from(
        '.site-header',
        { y: compact ? -8 : -18, opacity: 0, duration: compact ? 0.45 : 0.8 },
        compact ? 0.15 : 0.35,
      );
      if (page === 'home') {
        enter
          .from(
            '.hero-frame',
            {
              clipPath: 'inset(100% 0% 0% 0%)',
              duration: compact ? 0.75 : 1.5,
            },
            0.3,
          )
          .from('.hero-frame img', { opacity: 0.25, duration: 2.1 }, 0.3)
          .from(
            '.hero-title>span',
            {
              y: compact ? 36 : 90,
              opacity: 0,
              stagger: compact ? 0.08 : 0.16,
              duration: compact ? 0.7 : 1.35,
            },
            0.65,
          )
          .from(
            '.hero-detail',
            {
              x: compact ? 0 : inlineFrom * 36,
              y: compact ? 18 : 40,
              opacity: 0,
              rotation: compact ? 0 : inlineFrom * 5,
              duration: compact ? 0.6 : 1.4,
            },
            0.8,
          )
          .from(
            '.hero-meta,.hero-bottom',
            { opacity: 0, duration: compact ? 0.4 : 0.8 },
            compact ? 0.5 : 1,
          );
        mm.add('(min-width: 761px)', () => {
          gsap.to('.hero-title', {
            yPercent: -24,
            scrollTrigger: {
              trigger: '.hero',
              start: 'top top',
              end: 'bottom top',
              scrub: 1.2,
            },
          });
          gsap.to('.hero-detail', {
            yPercent: -55,
            rotation: inlineFrom * -6,
            scrollTrigger: {
              trigger: '.hero',
              start: 'top top',
              end: 'bottom top',
              scrub: 1.4,
            },
          });
          gsap.to('.hero-frame img', {
            filter: 'brightness(0.62)',
            scrollTrigger: {
              trigger: '.hero',
              start: 'top top',
              end: 'bottom top',
              scrub: 1,
            },
          });
        });
      } else
        enter
          .from('.reveal-title', { y: 70, opacity: 0, duration: 1.3 }, 0.35)
          .from('.heading-aside', { y: 25, opacity: 0, duration: 1 }, 0.65);
      gsap.utils
        .toArray<HTMLElement>(
          '.intro h2,.intro p,.studio-copy h2,.studio-copy p,.home-close p,.request-section>div,.big-link',
        )
        .forEach((el) => {
          gsap.from(el, {
            x: compact ? 0 : inlineFrom * 24,
            y: compact ? 24 : 55,
            opacity: 0.12,
            duration: compact ? 0.65 : 1.2,
            ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 88%', once: true },
          });
        });
      gsap.utils.toArray<HTMLElement>('.work-card').forEach((el, i) => {
        gsap.from(el, {
          x: inlineFrom * (i % 2 === 0 ? 32 : -32),
          y: 55,
          opacity: 0,
          duration: 1.2,
          scrollTrigger: { trigger: el, start: 'top 94%', once: true },
        });
        gsap.fromTo(
          el.querySelector('img'),
          { opacity: 0.72 },
          {
            opacity: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: el,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 1 + i * 0.1,
            },
          },
        );
      });
      if (page === 'studio')
        gsap.fromTo(
          '.studio-panorama img',
          { filter: 'brightness(0.55)' },
          {
            filter: 'brightness(0.75)',
            scrollTrigger: {
              trigger: '.studio-panorama',
              start: 'top bottom',
              end: 'bottom top',
              scrub: 1.2,
            },
          },
        );
      mm.add('(min-width: 761px)', () => {
        if (page !== 'home') return;

        if (rtl) {
          gsap
            .timeline({
              scrollTrigger: {
                trigger: '.editorial-stage',
                start: 'top top',
                end: '+=160%',
                pin: true,
                scrub: 1.2,
                invalidateOnRefresh: true,
              },
            })
            .fromTo(
              '.stage-one',
              {
                yPercent: 10,
                scale: 0.96,
                clipPath: 'inset(100% 0 0 0)',
              },
              {
                yPercent: 0,
                scale: 1,
                clipPath: 'inset(0% 0 0 0)',
                duration: 1.2,
                ease: 'power2.out',
              },
            )
            .fromTo(
              '.stage-two',
              {
                yPercent: -10,
                scale: 0.96,
                clipPath: 'inset(0 0 100% 0)',
              },
              {
                yPercent: 0,
                scale: 1,
                clipPath: 'inset(0 0 0% 0)',
                duration: 1.2,
                ease: 'power2.out',
              },
              0.12,
            )
            .fromTo(
              '.stage-title>span:first-child',
              { yPercent: 55, opacity: 0 },
              { yPercent: 0, opacity: 1, duration: 0.9 },
              0.18,
            )
            .fromTo(
              '.stage-title>span:last-child',
              { yPercent: 55, opacity: 0 },
              { yPercent: 0, opacity: 1, duration: 0.9 },
              0.24,
            )
            .fromTo(
              '.stage-title em',
              { opacity: 0, scale: 0.7 },
              { opacity: 1, scale: 1, duration: 0.7 },
              0.5,
            )
            .to('.stage-one', { yPercent: -8, duration: 1 }, 1.2)
            .to('.stage-two', { yPercent: 7, duration: 1 }, 1.2);
          return;
        }

        gsap
          .timeline({
            scrollTrigger: {
              trigger: '.editorial-stage',
              start: 'top top',
              end: '+=160%',
              pin: true,
              scrub: 1.2,
              invalidateOnRefresh: true,
            },
          })
          .fromTo(
            '.stage-one',
            {
              xPercent: inlineFrom * 35,
              rotation: inlineFrom * 8,
              scale: 0.86,
            },
            { xPercent: 0, rotation: 0, scale: 1, duration: 1 },
          )
          .fromTo(
            '.stage-two',
            {
              xPercent: inlineFrom * -48,
              yPercent: 24,
              rotation: inlineFrom * -8,
            },
            { xPercent: 0, yPercent: 0, rotation: 0, duration: 1 },
            0,
          )
          .fromTo(
            '.stage-title>span:first-child',
            { xPercent: inlineFrom * -25 },
            { xPercent: inlineFrom * 12, duration: 2 },
            0,
          )
          .fromTo(
            '.stage-title>span:last-child',
            { xPercent: inlineFrom * 25 },
            { xPercent: inlineFrom * -12, duration: 2 },
            0,
          )
          .to('.stage-one', { yPercent: -18, duration: 1 }, 1)
          .to('.stage-two', { yPercent: 15, duration: 1 }, 1);
      });
      mm.add('(min-width: 761px)', () => {
        const about = document.querySelector<HTMLElement>('.about-section');
        if (!about) return;
        const aboutTimeline = gsap.timeline({
          scrollTrigger: {
            trigger: about,
            start: 'top 76%',
            end: 'bottom 38%',
            scrub: 1,
            invalidateOnRefresh: true,
          },
        });
        aboutTimeline
          .from('.about-kicker', { opacity: 0, y: 24, duration: 0.35 })
          .from(
            '.about-copy h2 span,.about-copy h2 em',
            {
              x: (index) => inlineFrom * (index === 0 ? 1.6 : -1.6),
              opacity: 0,
              stagger: 0.12,
              duration: 0.75,
            },
            0.05,
          )
          .from(
            '.about-photo-main',
            {
              clipPath: rtl ? 'inset(0 0 0 100%)' : 'inset(0 100% 0 0)',
              y: 60,
              rotation: inlineFrom * 0.1,
              duration: 1,
            },
            0.12,
          )
          .from(
            '.about-photo-secondary',
            {
              clipPath: rtl ? 'inset(0 100% 0 0)' : 'inset(0 0 0 100%)',
              x: inlineFrom * -1.4,
              y: 80,
              rotation: inlineFrom * -0.12,
              duration: 1,
            },
            0.32,
          )
          .from(
            '.about-copy>p,.about-facts,.about-link',
            { opacity: 0, y: 28, stagger: 0.1, duration: 0.55 },
            0.38,
          )
          .fromTo(
            '.about-outline',
            { xPercent: rtl ? -8 : 8, opacity: 0 },
            { xPercent: rtl ? 5 : -5, opacity: 0.16, duration: 1.2 },
            0,
          );
      });
      mm.add('(max-width: 760px)', () => {
        if (!document.querySelector('.about-section')) return;
        gsap.from('.about-copy>*', {
          y: 18,
          opacity: 0,
          stagger: 0.06,
          duration: 0.55,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '.about-copy',
            start: 'top 88%',
            once: true,
          },
        });
        gsap.utils.toArray<HTMLElement>('.about-photo').forEach((photo) => {
          gsap.from(photo, {
            y: 24,
            opacity: 0,
            duration: 0.6,
            ease: 'power2.out',
            scrollTrigger: { trigger: photo, start: 'top 92%', once: true },
          });
        });
      });
      addChapterMotion(mm, lang);
      gsap.to('.reading-progress', {
        scaleX: 1,
        ease: 'none',
        scrollTrigger: { start: 0, end: 'max', scrub: 0.2 },
      });
    });
    let leaving = false;
    const click = (event: MouseEvent) => {
      const a = (event.target as Element).closest('a');
      if (
        !a ||
        a.target ||
        a.hasAttribute('download') ||
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey ||
        event.altKey ||
        event.button !== 0
      )
        return;
      const url = new URL(a.href, location.href);
      if (
        url.origin !== location.origin ||
        url.pathname === location.pathname ||
        !['/', '/works', '/studio'].includes(url.pathname)
      )
        return;
      event.preventDefault();
      if (leaving) return;
      leaving = true;
      gsap.fromTo(
        '.page-curtain',
        { scaleY: 0 },
        {
          scaleY: 1,
          transformOrigin: 'bottom',
          duration: 0.6,
          ease: 'power3.inOut',
          onComplete: () => location.assign(url.href),
        },
      );
    };
    document.addEventListener('click', click);
    const restore = () => {
      leaving = false;
      gsap.set('.page-curtain', { scaleY: 0 });
      ScrollTrigger.refresh();
    };
    window.addEventListener('pageshow', restore);
    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener('load', refresh);
    document.fonts.ready.then(refresh);
    return () => {
      document.removeEventListener('click', click);
      window.removeEventListener('pageshow', restore);
      window.removeEventListener('load', refresh);
      mm.revert();
      ctx.revert();
    };
  }, [page, lang]);
}
