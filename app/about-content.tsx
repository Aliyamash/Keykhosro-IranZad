import { ArrowUpRight, Globe2, Sparkles, UserRound } from 'lucide-react';
import type { TeamMember } from '@/lib/team';

export default function AboutContent({
  fa,
  members,
}: {
  fa: boolean;
  members: TeamMember[];
}) {
  const primary = members.find((member) => member.isPrimary) ?? members[0];
  const collaborators = members.filter((member) => member.id !== primary?.id);
  const t = (persian: string, english: string) => (fa ? persian : english);

  if (!primary) return null;

  const socials = (member: TeamMember) =>
    [
      member.instagram && {
        href: member.instagram,
        label: 'Instagram',
        kind: 'instagram',
      },
      member.linkedin && {
        href: member.linkedin,
        label: 'LinkedIn',
        kind: 'linkedin',
      },
      member.website && {
        href: member.website,
        label: t('وب‌سایت', 'Website'),
        kind: 'website',
      },
    ].filter(Boolean) as { href: string; label: string; kind: string }[];

  const SocialIcon = ({ kind }: { kind: string }) => {
    if (kind === 'website') return <Globe2 aria-hidden="true" />;
    if (kind === 'instagram')
      return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect x="3" y="3" width="18" height="18" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
        </svg>
      );
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="7.4" cy="8" r="1" fill="currentColor" stroke="none" />
        <path d="M7.4 11v6M11 17v-6m0 2.5c.8-1.7 5-2.2 5 1V17" />
      </svg>
    );
  };

  return (
    <>
      <section className="about-page-hero">
        <div className="about-page-heading">
          <span className="eyebrow icon-label">
            <UserRound aria-hidden="true" /> {t('درباره من', 'ABOUT')}
          </span>
          <h1 className="reveal-title">
            {t('آدم‌ها،', 'People,')}
            <br />
            <em>{t('پشتِ تصویر.', 'behind the image.')}</em>
          </h1>
        </div>
        <p>
          {t(
            'هر تصویر، نتیجه نگاه‌ها و تجربه‌هایی است که پیش از فشردن شاتر شکل گرفته‌اند.',
            'Every image begins with the people, perspectives, and lived experience behind the shutter.',
          )}
        </p>
      </section>

      <section
        className="about-page-primary"
        aria-labelledby="primary-profile-name"
      >
        <figure className="about-page-primary-image">
          <img
            src={primary.imageUrl}
            alt={fa ? primary.nameFa : primary.nameEn}
            fetchPriority="high"
          />
          <figcaption>
            01 — {t('بنیان‌گذار و مدیر هنری', 'FOUNDER & VISUAL DIRECTOR')}
          </figcaption>
        </figure>
        <div className="about-page-primary-copy">
          <span className="about-page-index">KI / PROFILE</span>
          <h2 id="primary-profile-name">
            {fa ? primary.nameFa : primary.nameEn}
          </h2>
          <h3>{fa ? primary.roleFa : primary.roleEn}</h3>
          <div className="about-page-bio">
            {(fa ? primary.bioFa : primary.bioEn)
              .split(/\n\s*\n/)
              .filter(Boolean)
              .map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
          </div>
          {socials(primary).length > 0 && (
            <div
              className="about-page-socials"
              aria-label={t('شبکه‌های اجتماعی', 'Social links')}
            >
              {socials(primary).map(({ href, label, kind }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <SocialIcon kind={kind} /> {label}{' '}
                  <ArrowUpRight aria-hidden="true" />
                </a>
              ))}
            </div>
          )}
        </div>
      </section>

      {collaborators.length > 0 && (
        <section className="about-page-team" aria-labelledby="team-title">
          <header>
            <span className="eyebrow icon-label">
              <Sparkles aria-hidden="true" /> {t('همکاران', 'COLLABORATORS')}
            </span>
            <h2 id="team-title">{t('نگاه‌های همراه.', 'Creative company.')}</h2>
            <p>
              {t(
                'افرادی که با تخصص و نگاه خود، روایت هر پروژه را کامل می‌کنند.',
                'The people whose craft and perspective help each story find its final form.',
              )}
            </p>
          </header>
          <div className="about-page-team-grid">
            {collaborators.map((member, index) => (
              <article className="about-page-person" key={member.id}>
                <figure>
                  {member.imageUrl ? (
                    <img
                      src={member.imageUrl}
                      alt={fa ? member.nameFa : member.nameEn}
                      loading="lazy"
                    />
                  ) : (
                    <UserRound aria-hidden="true" />
                  )}
                  <figcaption>{String(index + 2).padStart(2, '0')}</figcaption>
                </figure>
                <div>
                  <h3>{fa ? member.nameFa : member.nameEn}</h3>
                  <span>{fa ? member.roleFa : member.roleEn}</span>
                  <div className="about-page-bio">
                    {(fa ? member.bioFa : member.bioEn)
                      .split(/\n\s*\n/)
                      .filter(Boolean)
                      .map((paragraph, paragraphIndex) => (
                        <p key={paragraphIndex}>{paragraph}</p>
                      ))}
                  </div>
                  {socials(member).length > 0 && (
                    <div className="about-page-socials compact">
                      {socials(member).map(({ href, label, kind }) => (
                        <a
                          key={label}
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`${label} — ${fa ? member.nameFa : member.nameEn}`}
                        >
                          <SocialIcon kind={kind} />
                          <span>{label}</span>
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      <section className="about-page-close">
        <span>KI — STUDIO</span>
        <p>
          {t(
            'یک نگاه مشترک، برای ساختن تصویری که ماندگار شود.',
            'A shared vision, shaped into images that endure.',
          )}
        </p>
        <a href="/studio#request">
          {t('شروع یک همکاری', 'START A COLLABORATION')}{' '}
          <ArrowUpRight aria-hidden="true" />
        </a>
      </section>
    </>
  );
}
