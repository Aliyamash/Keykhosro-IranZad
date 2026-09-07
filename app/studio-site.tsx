'use client';
import { useEffect, useState } from 'react';
import { useStudioMotion } from './use-studio-motion';
import { InquiryForm } from './inquiry-form';
import {
  FrameSequence,
  MovingManifesto,
  ApertureStudy,
  Diptych,
  ContactSheet,
  StudioProcess,
} from './visual-chapters';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';
type Page = 'home' | 'works' | 'studio';
export const photo = '/images/studio.webp';
const workNumbers = Array.from(
  { length: 8 },
  (_, i) => `NO. ${String(i + 1).padStart(3, '0')}`,
);
export const faLorem =
  'لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ، و با استفاده از طراحان گرافیک است. چاپگرها و متون بلکه روزنامه و مجله در ستون و سطرآنچنان که لازم است.';
export const enLorem =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.';
export default function StudioSite({ page }: { page: Page }) {
  const [lang, setLang] = useState<'fa' | 'en'>('fa');
  const fa = lang === 'fa';
  const [active, setActive] = useState<number | null>(null);
  useStudioMotion(page, lang);
  useEffect(() => {
    const l = localStorage.getItem('studio-language');
    if (l === 'en') setLang('en');
  }, []);
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = fa ? 'rtl' : 'ltr';
    localStorage.setItem('studio-language', lang);
  }, [lang, fa]);
  const t = (a: string, b: string) => (fa ? a : b);
  return (
    <>
      <div className="page-curtain" aria-hidden="true">
        <span>KI / STUDIO</span>
      </div>
      <div className="reading-progress" aria-hidden="true" />
      <a className="skip-link" href="#main">
        {t('رفتن به محتوا', 'Skip to content')}
      </a>
      <header className="site-header">
        <a href="/" className="wordmark">
          <span>{t('کیخسرو ایرانزاد', 'KEYKHOSRO IRANZAD')}</span>
          <small>
            {t('استودیو عکس و تصویر', 'PHOTOGRAPHY & VISUAL DIRECTION')}
          </small>
        </a>
        <nav aria-label={t('منوی اصلی', 'Main navigation')}>
          <a href="/" aria-current={page === 'home' ? 'page' : undefined}>
            {t('خانه', 'Home')}
          </a>
          <a href="/works" aria-current={page === 'works' ? 'page' : undefined}>
            {t('آثار', 'Selected work')}
          </a>
          <a
            href="/studio"
            aria-current={page === 'studio' ? 'page' : undefined}
          >
            {t('استودیو / تماس', 'Studio / Contact')}
          </a>
        </nav>
        <button
          className="language"
          onClick={() => setLang(fa ? 'en' : 'fa')}
          aria-label={t('Switch to English', 'تغییر زبان به فارسی')}
        >
          {fa ? 'EN' : 'فا'} <span>↗</span>
        </button>
      </header>
      <main id="main">
        {page === 'home' && (
          <>
            <section className="hero">
              <div className="hero-meta">
                <span>KI — STUDIO</span>
                <span>
                  {t('عکاسی · مد · روایت', 'PHOTOGRAPHY · FASHION · STORIES')}
                </span>
              </div>
              <div className="hero-frame">
                <img
                  src={photo}
                  alt={t(
                    'عکس سیاه‌وسفید مدل در فضای استودیو',
                    'Black and white model portrait in a photography studio',
                  )}
                  fetchPriority="high"
                />
              </div>
              <div className="hero-detail">
                <img src={photo} alt="" />
                <span>FIG. 001 / IN THE STUDIO</span>
              </div>
              <h1 className="hero-title">
                <span>{t('کیخسرو', 'KEYKHOSRO')}</span>
                <span>
                  {t('ایرانزاد', 'IRANZAD')}
                  <i>— KI</i>
                </span>
              </h1>
              <div className="hero-bottom">
                <span>{t('فراتر از قاب', 'BEYOND THE FRAME')}</span>
                <a href="#intro">
                  {t('برای کشف، اسکرول کنید', 'SCROLL TO EXPLORE')}{' '}
                  <span>↓</span>
                </a>
                <span>01 — 07</span>
              </div>
            </section>
            <section id="intro" className="intro">
              <span className="eyebrow">01 / {t('استودیو', 'THE STUDIO')}</span>
              <h2>
                {t('روایت در سکوت.', 'A story in silence.')}
                <br />
                <em>{t('تصویر، بی‌انتها.', 'An image, infinite.')}</em>
              </h2>
              <p>{fa ? faLorem : enLorem}</p>
              <a href="/works" className="text-link">
                {t('منتخب آثار', 'EXPLORE SELECTED WORK')} <span>↗</span>
              </a>
            </section>
            <section className="editorial-stage">
              <span className="eyebrow stage-label">
                02 / {t('منتخب آثار', 'SELECTED WORK')}
              </span>
              <div className="stage-photo stage-one">
                <img
                  src={photo}
                  alt={t('قاب منتخب استودیو', 'Selected studio photograph')}
                  loading="lazy"
                />
              </div>
              <div className="stage-photo stage-two">
                <img src={photo} alt="" loading="lazy" />
              </div>
              <h2 className="stage-title">
                <span>{t('نور', 'LIGHT')}</span>
                <em>&</em>
                <span>{t('سکوت', 'SILENCE')}</span>
              </h2>
              <div className="stage-caption">
                <span>STUDY / 001</span>
                <a href="/works">
                  {t('مشاهده مجموعه', 'VIEW THE COLLECTION')} ↗
                </a>
              </div>
            </section>
            <FrameSequence fa={fa} />
            <MovingManifesto fa={fa} />
            <ApertureStudy fa={fa} />
            <Diptych fa={fa} />
            <section className="home-close">
              <span className="eyebrow">
                07 / {t('یک آغاز تازه', 'A NEW BEGINNING')}
              </span>
              <p>{fa ? faLorem : enLorem}</p>
              <a href="/studio#request" className="big-link">
                {t('بیایید خلق کنیم.', 'Let’s create.')} <span>↗</span>
              </a>
            </section>
          </>
        )}
        {page === 'works' && (
          <>
            <section className="page-heading">
              <span className="eyebrow">KI / SELECTED WORK — 01–08</span>
              <h1 className="reveal-title">
                {t('منتخب', 'Selected')}
                <br />
                <em>{t('آثار.', 'work.')}</em>
              </h1>
              <div className="heading-aside">
                <p>{fa ? faLorem : enLorem}</p>
                <span>
                  {t('هشت قاب، یک نگاه', 'EIGHT FRAMES, ONE PERSPECTIVE')}
                </span>
              </div>
            </section>
            <div className="works-grid">
              {workNumbers.map((number, i) => (
                <button
                  type="button"
                  className={`work-card work-${i}`}
                  key={number}
                  onClick={() => setActive(i)}
                  aria-label={t(
                    `نمایش اثر ${i + 1}`,
                    `View photograph ${i + 1}`,
                  )}
                >
                  <div className="work-image">
                    <img
                      src={photo}
                      alt={t(
                        `مطالعه تصویری استودیو، قاب ${i + 1}`,
                        `Studio visual study, frame ${i + 1}`,
                      )}
                      loading="lazy"
                      style={{
                        objectPosition: [
                          '50% 45%',
                          '30% 65%',
                          '70% 30%',
                          '50% 90%',
                        ][i % 4],
                      }}
                    />
                    <span className="image-open">↗</span>
                  </div>
                  <div className="work-caption">
                    <span>
                      {number} / {t('لورم ایپسوم', 'LOREM IPSUM')}
                    </span>
                    <span>{t('استودیو', 'STUDIO')}</span>
                  </div>
                </button>
              ))}
            </div>
            <ContactSheet fa={fa} />
            <section className="home-close">
              <span className="eyebrow">{t('فصل بعدی', 'NEXT CHAPTER')}</span>
              <a href="/studio#request" className="big-link">
                {t('پروژه بعدی، با شما.', 'Your story, next.')} <span>↗</span>
              </a>
            </section>
            <Dialog
              open={active !== null}
              onOpenChange={(open) => {
                if (!open) setActive(null);
              }}
            >
              <DialogContent className="photo-dialog" showCloseButton={false}>
                <div className="photo-dialog-top">
                  <DialogTitle>
                    {t('قاب', 'FRAME')}{' '}
                    {String((active ?? 0) + 1).padStart(3, '0')}
                  </DialogTitle>
                  <DialogClose className="plain-button">
                    {t('بستن', 'CLOSE')} ×
                  </DialogClose>
                </div>
                <img
                  src={photo}
                  alt={t('نمای کامل عکس استودیو', 'Full studio photograph')}
                />
                <DialogDescription>{fa ? faLorem : enLorem}</DialogDescription>
                <div className="dialog-arrows">
                  <button
                    onClick={() =>
                      setActive(
                        ((active ?? 0) + workNumbers.length - 1) %
                          workNumbers.length,
                      )
                    }
                  >
                    {t('قبلی', 'PREVIOUS')} ←
                  </button>
                  <button
                    onClick={() =>
                      setActive(((active ?? 0) + 1) % workNumbers.length)
                    }
                  >
                    → {t('بعدی', 'NEXT')}
                  </button>
                </div>
              </DialogContent>
            </Dialog>
          </>
        )}
        {page === 'studio' && (
          <>
            <section className="page-heading studio-heading">
              <span className="eyebrow">KI / THE STUDIO</span>
              <h1 className="reveal-title">
                {t('پشت', 'Behind')}
                <br />
                <em>{t('تصویر.', 'the image.')}</em>
              </h1>
              <div className="heading-aside">
                <p>{fa ? faLorem : enLorem}</p>
                <a href="#request" className="text-link">
                  {t('درخواست همکاری', 'START A PROJECT')} ↓
                </a>
              </div>
            </section>
            <section className="studio-panorama">
              <img
                src={photo}
                alt={t(
                  'پشت صحنه عکاسی در استودیو',
                  'Behind the scenes in the studio',
                )}
              />
              <span>
                {t('کیخسرو ایرانزاد / استودیو', 'KEYKHOSRO IRANZAD / STUDIO')}
              </span>
            </section>
            <section className="studio-copy">
              <span className="eyebrow">{t('نگاه ما', 'OUR PERSPECTIVE')}</span>
              <h2>
                {t('لورم ایپسوم', 'Lorem ipsum')}
                <br />
                <em>{t('متن ساختگی.', 'dolor sit amet.')}</em>
              </h2>
              <p>
                {fa ? faLorem : enLorem} {fa ? faLorem : enLorem}
              </p>
            </section>
            <StudioProcess fa={fa} />
            <ContactSheet fa={fa} />
            <section id="request" className="request-section">
              <div>
                <span className="eyebrow">
                  {t('یک گفت‌وگو، یک شروع', 'A CONVERSATION, A BEGINNING')}
                </span>
                <h2>
                  {t('ایده شما،', 'Your vision,')}
                  <br />
                  <em>{t('قاب بعدی.', 'our next frame.')}</em>
                </h2>
                <p>{fa ? faLorem : enLorem}</p>
              </div>
              <InquiryForm lang={lang} />
            </section>
          </>
        )}
      </main>
      <footer className="site-footer">
        <span>{t('کیخسرو ایرانزاد', 'KEYKHOSRO IRANZAD')}</span>
        <span>© {new Date().getFullYear()}</span>
        <a href="/studio">{t('شروع یک همکاری', 'START A CONVERSATION')} ↗</a>
      </footer>
    </>
  );
}
