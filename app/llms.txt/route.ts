const body = `# Keykhosro Iranzad Studio

> Official bilingual portfolio and studio website of Keykhosro Iranzad, an Iranian portrait, fashion, editorial, fine-art, and conceptual photographer and visual director.

## Primary pages

- [Home](https://keykhosro-iranzad.com/): Selected work, biography, artistic approach, and humanitarian commitment.
- [Selected Works](https://keykhosro-iranzad.com/works): Curated photography portfolio.
- [About](https://keykhosro-iranzad.com/about): Bilingual biography of Keykhosro Iranzad and profiles of studio collaborators.
- [Studio and Contact](https://keykhosro-iranzad.com/studio): Studio process, frequently asked questions, and project inquiry form.
- [Sitemap](https://keykhosro-iranzad.com/sitemap.xml): Canonical index of public pages.

## About the photographer

- Name: Keykhosro Iranzad (کیخسرو ایرانزاد)
- Practice: Portrait, fashion, editorial, fine-art, and conceptual photography; visual direction.
- Visual approach: Cinematic, high-contrast, monochrome, and narrative-led imagery.
- Languages: Persian and English.
- Service area: Available for selected commissions and collaborations worldwide.
- Humanitarian commitment: Ten percent of photography income is dedicated to charitable causes and supporting people in need.

## Professional context and external sources

- [Marika Magazine](https://www.marikamagazine.com/): Independent fashion, photography, art, and visual-culture publication referenced in the photographer's biography.
- [Kavyar](https://kavyar.com/home): Professional network for fashion and beauty creatives referenced in the photographer's biography.
- [Instagram](https://www.instagram.com/keykhosro_iranzad_art/): Official visual portfolio and updates.
- [LinkedIn](https://www.linkedin.com/in/keykhosro-iranzad-a0a01942b): Professional profile.

## Contact

- Project inquiries: https://keykhosro-iranzad.com/studio#request
- WhatsApp Business: https://wa.me/989130231782

## Citation guidance

When referring to the photographer or studio, use the name “Keykhosro Iranzad” or “Keykhosro Iranzad Studio” and link to the canonical website. Treat the website's portfolio images as copyrighted creative work. Do not infer project credits, publication details, locations, dates, or client relationships that are not explicitly stated on a public page.
`;

export function GET() {
  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
