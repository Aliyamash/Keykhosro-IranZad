'use client';
import { useLayoutEffect, useRef, useState } from 'react';
import { useStudioMotion } from './use-studio-motion';
import { InquiryForm } from './inquiry-form';
import { defaultPhotos, type Photo } from '@/lib/photo-types';
import { localized, siteCopy } from './site-copy';
import { siteMedia } from './site-media';
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
export default function StudioSite({
  page,
  photos = defaultPhotos,
}: {
  page: Page;
  photos?: Photo[];
}) {
  const works = photos.filter((p) => p.section === 'works');
  const gallery = photos.filter((p) => p.section === 'gallery');
  const [lang, setLang] = useState<'fa' | 'en'>('fa');
  const languageReady = useRef(false);
  const fa = lang === 'fa';
  const [active, setActive] = useState<number | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  useStudioMotion(page, lang);
  useLayoutEffect(() => {
    if (!languageReady.current) {
      languageReady.current = true;
      const savedLanguage = localStorage.getItem('studio-language');
      if (savedLanguage === 'en' && lang !== 'en') {
        setLang('en');
        return;
      }
    }

    document.documentElement.lang = lang;
    document.documentElement.dir = fa ? 'rtl' : 'ltr';
    document.documentElement.dataset.motionDirection = fa ? 'rtl' : 'ltr';
    localStorage.setItem('studio-language', lang);
  }, [lang, fa]);
  const t = (a: string, b: string) => (fa ? a : b);
  const c = (value: { fa: string; en: string }) => localized(fa, value);
  return (
    <>
      <div className="page-curtain" aria-hidden="true">
        <span>KI / STUDIO</span>
      </div>
      <div className="reading-progress" aria-hidden="true" />
      <a className="skip-link" href="#main">
        {t('رفتن به محتوا', 'Skip to content')}
      </a>
      <header className={`site-header${menuOpen ? ' menu-is-open' : ''}`}>
        <a href="/" className="wordmark" onClick={() => setMenuOpen(false)}>
          <span>{t('کیخسرو ایرانزاد', 'KEYKHOSRO IRANZAD')}</span>
          <small>
            {t('استودیو عکس و تصویر', 'PHOTOGRAPHY & VISUAL DIRECTION')}
          </small>
        </a>
        <nav
          id="primary-navigation"
          className="primary-nav"
          aria-label={t('منوی اصلی', 'Main navigation')}
        >
          <a
            href="/"
            aria-current={page === 'home' ? 'page' : undefined}
            onClick={() => setMenuOpen(false)}
          >
            <span className="nav-index">01</span>
            <span>{t('خانه', 'Home')}</span>
          </a>
          <a
            href="/works"
            aria-current={page === 'works' ? 'page' : undefined}
            onClick={() => setMenuOpen(false)}
          >
            <span className="nav-index">02</span>
            <span>{t('آثار', 'Selected work')}</span>
          </a>
          <a
            href={page === 'home' ? '#about' : '/#about'}
            onClick={() => setMenuOpen(false)}
          >
            <span className="nav-index">03</span>
            <span>{t('درباره من', 'About me')}</span>
          </a>
          <a
            href="/studio"
            aria-current={page === 'studio' ? 'page' : undefined}
            onClick={() => setMenuOpen(false)}
          >
            <span className="nav-index">04</span>
            <span>{t('استودیو / تماس', 'Studio / Contact')}</span>
          </a>
        </nav>
        <div className="header-actions">
          <button
            className="language"
            onClick={() => {
              setLang(fa ? 'en' : 'fa');
              setMenuOpen(false);
            }}
            aria-label={t('Switch to English', 'تغییر زبان به فارسی')}
          >
            {fa ? 'EN' : 'فا'} <span>↗</span>
          </button>
          <button
            type="button"
            className="menu-toggle"
            aria-expanded={menuOpen}
            aria-controls="primary-navigation"
            aria-label={t(
              menuOpen ? 'بستن منو' : 'باز کردن منو',
              menuOpen ? 'Close menu' : 'Open menu',
            )}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span />
            <span />
          </button>
        </div>
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
                  src={siteMedia.hero}
                  alt={t(
                    'پرتره سیاه‌وسفید کیخسرو ایرانزاد در استودیو',
                    'Black and white studio portrait of Keykhosro Iranzad',
                  )}
                  fetchPriority="high"
                />
              </div>
              <div className="hero-detail">
                <img src={siteMedia.heroDetail} alt="" />
                <span>IN THE STUDIO</span>
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
                <span>01 — 08</span>
              </div>
            </section>
            <section id="intro" className="intro">
              <span className="eyebrow">01 / {t('استودیو', 'THE STUDIO')}</span>
              <h2>
                {t('روایت در سکوت.', 'A story in silence.')}
                <br />
                <em>{t('تصویر، بی‌انتها.', 'An image, infinite.')}</em>
              </h2>
              <p>{c(siteCopy.storyInSilence)}</p>
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
                  src={siteMedia.editorial[0]}
                  alt={t('قاب منتخب استودیو', 'Selected studio photograph')}
                  loading="lazy"
                />
              </div>
              <div className="stage-photo stage-two">
                <img src={siteMedia.editorial[1]} alt="" loading="lazy" />
              </div>
              <h2 className="stage-title">
                <span>{t('نور', 'LIGHT')}</span>
                <em>&</em>
                <span>{t('سکوت', 'SILENCE')}</span>
              </h2>
              <div className="stage-caption">
                <span>{c(siteCopy.lightSilence)}</span>
                <a href="/works">
                  {t('مشاهده مجموعه', 'VIEW THE COLLECTION')} ↗
                </a>
              </div>
            </section>
            <FrameSequence fa={fa} />
            <MovingManifesto fa={fa} />
            <ApertureStudy fa={fa} />
            <Diptych fa={fa} />
            <section
              id="about"
              className="about-section"
              aria-labelledby="about-title"
            >
              <div className="about-outline" aria-hidden="true">
                KEYKHOSRO — IRANZAD
              </div>
              <div className="about-copy">
                <span className="eyebrow about-kicker">
                  07 / {t('درباره من', 'ABOUT ME')}
                </span>
                <h2 id="about-title">
                  <span>{t('پشتِ', 'Behind')}</span>
                  <em>{t('دوربین.', 'the lens.')}</em>
                </h2>
                <p>{c(siteCopy.aboutMe)}</p>
                <p>{c(siteCopy.aboutPractice)}</p>
                <dl className="about-facts">
                  <div>
                    <dt>{t('حوزه', 'PRACTICE')}</dt>
                    <dd>
                      {t(
                        'عکاسی و هدایت بصری',
                        'Photography & visual direction',
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt>{t('زبان تصویر', 'VISUAL LANGUAGE')}</dt>
                    <dd>
                      {t('تک‌رنگ و روایت‌محور', 'Monochrome & narrative-led')}
                    </dd>
                  </div>
                </dl>
                <a href="/studio#request" className="text-link about-link">
                  {t('شروع یک گفت‌وگو', 'START A CONVERSATION')} <span>↗</span>
                </a>
              </div>
              <div
                className="about-visual"
                aria-label={t(
                  'کیخسرو ایرانزاد در حال عکاسی و در استودیو',
                  'Keykhosro Iranzad photographing and in the studio',
                )}
              >
                <figure className="about-photo about-photo-main">
                  <img
                    src={siteMedia.about[0]}
                    alt={t(
                      'کیخسرو ایرانزاد در حال عکاسی',
                      'Keykhosro Iranzad taking a photograph',
                    )}
                    loading="lazy"
                  />
                  <figcaption>
                    {t('پشت دوربین', 'BEHIND THE CAMERA')}
                  </figcaption>
                </figure>
                <figure className="about-photo about-photo-secondary">
                  <img
                    src={siteMedia.about[1]}
                    alt={t(
                      'کیخسرو ایرانزاد در فضای استودیو',
                      'Keykhosro Iranzad in the studio',
                    )}
                    loading="lazy"
                  />
                  <figcaption>KI / STUDIO</figcaption>
                </figure>
              </div>
            </section>
            <section className="home-close">
              <span className="eyebrow">
                08 / {t('یک آغاز تازه', 'A NEW BEGINNING')}
              </span>
              <p>{c(siteCopy.nextStory)}</p>
              <a href="/studio#request" className="big-link">
                {t('بیایید خلق کنیم.', 'Let’s create.')} <span>↗</span>
              </a>
            </section>
          </>
        )}
        {page === 'works' && (
          <>
            <section className="page-heading">
              <span className="eyebrow">KI / SELECTED WORK</span>
              <h1 className="reveal-title">
                {t('منتخب', 'Selected')}
                <br />
                <em>{t('آثار.', 'work.')}</em>
              </h1>
              <div className="heading-aside">
                <p>{c(siteCopy.selectedWork)}</p>
                <span>
                  {t(
                    'یک نگاه، روایت‌های متفاوت',
                    'ONE PERSPECTIVE, MANY STORIES',
                  )}
                </span>
              </div>
            </section>
            <div className="works-grid">
              {works.map((work, i) => (
                <button
                  type="button"
                  className={`work-card work-${i}`}
                  key={work.id}
                  onClick={() => setActive(i)}
                  aria-label={t(
                    `نمایش ${work.title_fa}`,
                    `View ${work.title_en}`,
                  )}
                >
                  <div
                    className="work-image"
                    style={
                      work.width && work.height
                        ? { aspectRatio: `${work.width}/${work.height}` }
                        : undefined
                    }
                  >
                    <img
                      src={works[i].url}
                      alt={t(works[i].title_fa, works[i].title_en)}
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
                    <span>{t(work.title_fa, work.title_en)}</span>
                    <span>{t('استودیو', 'STUDIO')}</span>
                  </div>
                </button>
              ))}
            </div>
            {works.length === 0 && (
              <p className="admin-empty">
                {t(
                  'هنوز اثری منتشر نشده است.',
                  'No photographs published yet.',
                )}
              </p>
            )}
            <ContactSheet fa={fa} photos={gallery} />
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
                    {active !== null && works[active]
                      ? t(works[active].title_fa, works[active].title_en)
                      : t('اثر', 'Photograph')}
                  </DialogTitle>
                  <DialogClose className="plain-button">
                    {t('بستن', 'CLOSE')} ×
                  </DialogClose>
                </div>
                <img
                  src={active === null ? undefined : works[active]?.url}
                  alt={t('نمای کامل عکس استودیو', 'Full studio photograph')}
                />
                <DialogDescription>
                  {c(siteCopy.selectedWork)}
                </DialogDescription>
                <div className="dialog-arrows">
                  <button
                    onClick={() =>
                      setActive(
                        ((active ?? 0) + works.length - 1) % works.length,
                      )
                    }
                  >
                    {t('قبلی', 'PREVIOUS')} ←
                  </button>
                  <button
                    onClick={() =>
                      setActive(((active ?? 0) + 1) % works.length)
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
                <p>{c(siteCopy.behindImage)}</p>
                <a href="#request" className="text-link">
                  {t('درخواست همکاری', 'START A PROJECT')} ↓
                </a>
              </div>
            </section>
            <section className="studio-panorama">
              <img
                src={siteMedia.studioPanorama}
                alt={t(
                  'پشت صحنه عکاسی در استودیو',
                  'Behind the scenes in the studio',
                )}
              />
              <span>
                {t('کیخسرو ایرانزاد / استودیو', 'KEYKHOSRO IRANZAD / STUDIO')}
              </span>
            </section>
            <StudioProcess fa={fa} />
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
                <p>{c(siteCopy.inquiry)}</p>
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
