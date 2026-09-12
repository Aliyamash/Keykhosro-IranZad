import { localized, siteCopy } from './site-copy';
import { siteMedia } from './site-media';
type ChapterProps = { fa: boolean };

export function FrameSequence({ fa }: ChapterProps) {
  const names = fa
    ? ['حضور', 'حرکت', 'مکث', 'نور', 'ردّ تصویر']
    : ['Presence', 'Movement', 'Stillness', 'Light', 'Afterimage'];
  const frames = siteMedia.sequence.map((image, index) => ({
    name: names[index],
    image,
    index,
  }));
  const visualFrames = fa ? [...frames].reverse() : frames;
  return (
    <section
      className="sequence-section"
      data-motion-direction={fa ? 'rtl' : 'ltr'}
      aria-labelledby="sequence-title"
    >
      <header className="chapter-heading">
        <span className="eyebrow">
          03 / {fa ? 'مطالعات تصویری' : 'VISUAL STUDIES'}
        </span>
        <h2 id="sequence-title">
          {fa ? 'میانِ قاب‌ها.' : 'Between the frames.'}
        </h2>
        <p>{localized(fa, siteCopy.betweenFrames)}</p>
      </header>
      <div className="sequence-viewport">
        <div className="sequence-track" dir="ltr">
          {visualFrames.map(({ name, image, index }) => (
            <figure
              className={`sequence-frame sequence-frame-${index}`}
              key={image}
            >
              <div className="sequence-image">
                <img
                  src={image}
                  alt={fa ? `مطالعه تصویری ${name}` : `Visual study: ${name}`}
                  loading="lazy"
                  width={1280}
                  height={1920}
                />
                <span className="frame-registration" aria-hidden="true">
                  +
                </span>
              </div>
              <figcaption dir={fa ? 'rtl' : 'ltr'}>
                <span>{name}</span>
                <span>KI — STUDY</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
      <div className="sequence-footer">
        <span>
          {fa ? 'یک نگاه؛ چند روایت.' : 'ONE PERSPECTIVE. MANY STORIES.'}
        </span>
        <span className="sequence-line" aria-hidden="true">
          <i />
        </span>
        <span>KI / STUDIO</span>
      </div>
    </section>
  );
}

export function MovingManifesto({ fa }: ChapterProps) {
  const words = fa
    ? ['تصویر', 'از', 'سکوت', 'آغاز', 'می‌شود.']
    : ['An', 'image', 'begins', 'in', 'silence.'];
  return (
    <section className="manifesto-section" aria-labelledby="manifesto-title">
      <span className="eyebrow">
        04 / {fa ? 'نگاه استودیو' : 'THE STUDIO’S EYE'}
      </span>
      <h2 id="manifesto-title">
        {words.map((word, i) => (
          <span className="manifesto-word" key={i}>
            {word}{' '}
          </span>
        ))}
      </h2>
      <div className="manifesto-bottom">
        <span>KEYKHOSRO IRANZAD</span>
        <p>{localized(fa, siteCopy.beginsInSilence)}</p>
      </div>
    </section>
  );
}

export function ApertureStudy({ fa }: ChapterProps) {
  return (
    <section className="aperture-section" aria-labelledby="aperture-title">
      <div className="aperture-mask">
        <img
          src={siteMedia.aperture}
          alt={
            fa
              ? 'مطالعه نور و سایه در استودیو'
              : 'A study of light and shadow in the studio'
          }
          loading="lazy"
          width={1280}
          height={1920}
        />
      </div>
      <span className="eyebrow aperture-label">
        05 / {fa ? 'نزدیک‌تر' : 'CLOSER'}
      </span>
      <h2 id="aperture-title">
        <span>{fa ? 'درون' : 'Inside'}</span>
        <em>{fa ? 'یک لحظه.' : 'a moment.'}</em>
      </h2>
      <div className="aperture-caption">
        <span>KI / STUDIO</span>
        <p>{localized(fa, siteCopy.insideMoment)}</p>
      </div>
    </section>
  );
}

export function Diptych({ fa }: ChapterProps) {
  return (
    <section className="diptych-section" aria-labelledby="diptych-title">
      <header className="chapter-heading">
        <span className="eyebrow">
          06 / {fa ? 'دو نگاه' : 'TWO PERSPECTIVES'}
        </span>
        <h2 id="diptych-title">
          {fa ? 'روایت ناتمام.' : 'An unfinished story.'}
        </h2>
        <p>{localized(fa, siteCopy.unfinishedStory)}</p>
      </header>
      <div className="diptych-images">
        <figure>
          <div className="diptych-crop">
            <img
              src={siteMedia.diptych[0]}
              alt={
                fa
                  ? 'قاب باز از فضای عکاسی'
                  : 'Wide view of the photographic space'
              }
              loading="lazy"
              width={1280}
              height={1920}
            />
          </div>
          <figcaption>{fa ? 'فضا' : 'SPACE'}</figcaption>
        </figure>
        <figure>
          <div className="diptych-crop">
            <img
              src={siteMedia.diptych[1]}
              alt={
                fa ? 'جزئیات نور در پرتره' : 'Light and detail in the portrait'
              }
              loading="lazy"
              width={1280}
              height={1920}
            />
          </div>
          <figcaption>{fa ? 'حضور' : 'PRESENCE'}</figcaption>
        </figure>
        <span className="diptych-ampersand" aria-hidden="true">
          &
        </span>
      </div>
      <div className="diptych-copy">
        <p>{localized(fa, siteCopy.space)}</p>
        <a className="text-link" href="/works">
          {fa ? 'تمام آثار' : 'ALL SELECTED WORK'} ↗
        </a>
      </div>
    </section>
  );
}

export function ContactSheet({
  fa,
  photos,
}: ChapterProps & { photos?: import('@/lib/photo-types').Photo[] }) {
  const frames =
    photos ??
    Array.from({ length: 6 }, (_, i) => ({
      id: String(i),
      url: siteMedia.sequence[i % siteMedia.sequence.length],
      title_fa: 'اتود تصویری',
      title_en: 'Photographic study',
    }));
  if (!frames.length) return null;
  return (
    <section className="contact-sheet-section" aria-labelledby="sheet-title">
      <header className="chapter-heading">
        <span className="eyebrow">KI / CONTACT SHEET</span>
        <h2 id="sheet-title">{fa ? 'پیش از انتخاب.' : 'Before the edit.'}</h2>
        <p>{localized(fa, siteCopy.beforeEdit)}</p>
      </header>
      <div className="contact-sheet" dir="ltr">
        {frames.map((frame, i) => (
          <figure key={frame.id}>
            <div
              style={
                frame.width && frame.height
                  ? { aspectRatio: `${frame.width}/${frame.height}` }
                  : undefined
              }
            >
              <img
                src={frame.url}
                alt={fa ? frame.title_fa : frame.title_en}
                loading="lazy"
                width={1280}
                height={1920}
                style={{
                  objectPosition: [
                    '50% 15%',
                    '50% 35%',
                    '50% 55%',
                    '35% 65%',
                    '70% 45%',
                    '50% 85%',
                  ][i % 6],
                }}
              />
            </div>
            <figcaption>
              <span>{fa ? frame.title_fa : frame.title_en}</span>
              <span>+ +</span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

export function StudioProcess({ fa }: ChapterProps) {
  const titles = fa
    ? ['گفت‌وگو و ایده', 'نور و اجرا', 'انتخاب و روایت']
    : ['Dialogue & concept', 'Light & execution', 'Selection & story'];
  return (
    <section className="process-section" aria-labelledby="process-title">
      <div className="process-heading">
        <span className="eyebrow">KI / THE PROCESS</span>
        <h2 id="process-title">
          {fa ? 'از ایده،' : 'From an idea,'}
          <br />
          <em>{fa ? 'تا تصویر.' : 'to an image.'}</em>
        </h2>
        <p className="process-intro">{localized(fa, siteCopy.processIntro)}</p>
        <div className="process-photo">
          <img
            src={siteMedia.process}
            alt={
              fa
                ? 'فضای خلق تصویر در استودیو'
                : 'Creating an image in the studio'
            }
            loading="lazy"
            width={1280}
            height={1920}
          />
        </div>
      </div>
      <div className="process-steps">
        {titles.map((title, i) => (
          <article className="process-step" key={i}>
            <span>0{i + 1}</span>
            <h3>{title}</h3>
            <p>{localized(fa, siteCopy.processSteps[i])}</p>
            <div className="process-rule" aria-hidden="true" />
          </article>
        ))}
      </div>
    </section>
  );
}
