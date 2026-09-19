'use client';

import { useEffect, useState, type CSSProperties } from 'react';
import { ArrowDown, HeartHandshake, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';

const STORAGE_KEY = 'ki-impact-pledge-seen-v1';
const UNLOCK_DELAY = 3200;

export function ImpactWelcome({ fa }: { fa: boolean }) {
  const [open, setOpen] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let seen = false;
    try {
      seen = localStorage.getItem(STORAGE_KEY) === '1';
    } catch {
      // Storage can be unavailable in strict privacy modes. The dialog still works.
    }
    if (seen) return;
    const reveal = window.setTimeout(() => setOpen(true), 650);
    return () => window.clearTimeout(reveal);
  }, []);

  useEffect(() => {
    if (!open || unlocked) return;
    const startedAt = performance.now();
    const ticker = window.setInterval(() => {
      const next = Math.min((performance.now() - startedAt) / UNLOCK_DELAY, 1);
      setProgress(next);
      if (next >= 1) {
        window.clearInterval(ticker);
        setUnlocked(true);
      }
    }, 80);
    return () => window.clearInterval(ticker);
  }, [open, unlocked]);

  function rememberAndClose() {
    if (!unlocked) return;
    try {
      localStorage.setItem(STORAGE_KEY, '1');
    } catch {
      // Closing must remain possible even when browser storage is disabled.
    }
    setOpen(false);
  }

  function continueToPledge() {
    rememberAndClose();
    window.setTimeout(() => {
      if (window.location.pathname === '/') {
        document.getElementById('impact')?.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.location.assign('/#impact');
      }
    }, 180);
  }

  const progressStyle = {
    '--impact-progress': `${progress * 360}deg`,
  } as CSSProperties;

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (nextOpen) setOpen(true);
        else rememberAndClose();
      }}
    >
      <DialogContent
        className="impact-welcome-dialog"
        showCloseButton={false}
        aria-describedby="impact-welcome-description"
      >
        <div className="impact-welcome-media" aria-hidden="true">
          <img src="/images/vision-with-impact.jpg" alt="" />
          <div className="impact-welcome-number">
            <span>10</span>
            <small>%</small>
          </div>
          <span className="impact-welcome-photo-label">ART / HUMANITY</span>
        </div>

        <div className="impact-welcome-copy">
          <div className="impact-welcome-kicker">
            <HeartHandshake aria-hidden="true" />
            <span>{fa ? 'هنر با مسئولیت' : 'ART WITH PURPOSE'}</span>
          </div>
          <DialogTitle className="impact-welcome-title">
            <span>{fa ? 'هر قاب،' : 'Every frame,'}</span>
            <em>{fa ? 'سهمی از امید.' : 'a share of hope.'}</em>
          </DialogTitle>
          <DialogDescription
            id="impact-welcome-description"
            className="impact-welcome-description"
          >
            {fa
              ? 'برای ما عکاسی فقط ثبت زیبایی نیست. ده درصد از درآمد هر پروژه به امور بشردوستانه و حمایت از افرادی اختصاص می‌یابد که به فرصتی دوباره نیاز دارند. با انتخاب این استودیو، شما نیز بخشی از مسیری می‌شوید که هنر را به اثری واقعی در زندگی انسان‌ها تبدیل می‌کند.'
              : 'Photography, for us, is more than preserving beauty. Ten percent of every project is dedicated to humanitarian causes and people in need of another chance. By choosing this studio, you become part of a journey that turns art into a real and lasting impact on human lives.'}
          </DialogDescription>
          <p className="impact-welcome-quote">
            {fa
              ? 'یک تصویر می‌تواند ماندگار باشد؛ یک انتخاب می‌تواند زندگی را تغییر دهد.'
              : 'An image can endure; a choice can change a life.'}
          </p>

          <div className="impact-welcome-actions">
            {!unlocked ? (
              <div className="impact-welcome-wait" role="status" aria-live="polite">
                <span className="impact-welcome-progress" style={progressStyle}>
                  <span>{Math.max(1, Math.ceil((1 - progress) * 3))}</span>
                </span>
                <span>
                  {fa
                    ? 'امکان ادامه تا چند لحظه دیگر'
                    : 'Continue in a moment'}
                </span>
              </div>
            ) : (
              <>
                <button
                  type="button"
                  className="impact-welcome-primary"
                  onClick={continueToPledge}
                >
                  <span>{fa ? 'داستان این تعهد' : 'DISCOVER THE PLEDGE'}</span>
                  <ArrowDown aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className="impact-welcome-close"
                  onClick={rememberAndClose}
                >
                  <X aria-hidden="true" />
                  <span>{fa ? 'ورود به سایت' : 'ENTER THE SITE'}</span>
                </button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
