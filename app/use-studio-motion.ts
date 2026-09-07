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
    const mm = gsap.matchMedia();
    const ctx = gsap.context(() => {
      const enter = gsap.timeline({ defaults: { ease: 'power3.out' } });
      enter.fromTo(
        '.page-curtain',
        { scaleY: 1 },
        { scaleY: 0, transformOrigin: 'top', duration: 0.95 },
      );
      enter.from('.site-header', { y: -18, opacity: 0, duration: 0.8 }, 0.35);
      if (page === 'home') {
        enter
          .from(
            '.hero-frame',
            { clipPath: 'inset(100% 0% 0% 0%)', duration: 1.5 },
            0.3,
          )
          .from('.hero-frame img', { scale: 1.18, duration: 2.1 }, 0.3)
          .from(
            '.hero-title>span',
            { y: 90, opacity: 0, stagger: 0.16, duration: 1.35 },
            0.65,
          )
          .from(
            '.hero-detail',
            { y: 50, opacity: 0, rotation: -5, duration: 1.4 },
            0.8,
          )
          .from('.hero-meta,.hero-bottom', { opacity: 0, duration: 0.8 }, 1);
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
          rotation: 6,
          scrollTrigger: {
            trigger: '.hero',
            start: 'top top',
            end: 'bottom top',
            scrub: 1.4,
          },
        });
        gsap.to('.hero-frame img', {
          yPercent: 12,
          scale: 1.1,
          scrollTrigger: {
            trigger: '.hero',
            start: 'top top',
            end: 'bottom top',
            scrub: 1,
          },
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
            y: 55,
            opacity: 0.12,
            duration: 1.2,
            ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 88%', once: true },
          });
        });
      gsap.utils.toArray<HTMLElement>('.work-card').forEach((el, i) => {
        gsap.from(el, {
          y: 70,
          opacity: 0,
          duration: 1.2,
          scrollTrigger: { trigger: el, start: 'top 94%', once: true },
        });
        gsap.fromTo(
          el.querySelector('img'),
          { scale: 1.14, yPercent: -3 },
          {
            yPercent: 5,
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
          { yPercent: -12 },
          {
            yPercent: 12,
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
            { xPercent: -35, rotation: -9, scale: 0.8 },
            { xPercent: 0, rotation: 0, scale: 1, duration: 1 },
          )
          .fromTo(
            '.stage-two',
            { xPercent: 50, yPercent: 30, rotation: 9 },
            { xPercent: 0, yPercent: 0, rotation: 0, duration: 1 },
            0,
          )
          .fromTo(
            '.stage-title>span:first-child',
            { xPercent: 25 },
            { xPercent: -12, duration: 2 },
            0,
          )
          .fromTo(
            '.stage-title>span:last-child',
            { xPercent: -25 },
            { xPercent: 12, duration: 2 },
            0,
          )
          .to('.stage-one', { yPercent: -18, duration: 1 }, 1)
          .to('.stage-two', { yPercent: 15, duration: 1 }, 1);
      });
      addChapterMotion(mm);
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
