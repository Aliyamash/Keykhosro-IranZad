export type Photo = {
  id: string;
  section: 'works' | 'gallery';
  title_fa: string;
  title_en: string;
  url: string;
  width?: number;
  height?: number;
};
export const defaultPhotos: Photo[] = [
  ['outdoor-balance', 'works', 'تعادل', 'Balance', '/images/portfolio/outdoor-balance.webp', 2624, 3936],
  ['portrait-wind', 'works', 'روشنایی', 'Luminescence', '/images/portfolio/portrait-wind.webp', 2362, 2953],
  ['ins-03524', 'works', 'تأمل', 'Contemplation', '/images/portfolio/telegram/ins-03524.webp', 2139, 3936],
  ['landscape-dress', 'works', 'افق خاموش', 'Silent horizon', '/images/portfolio/landscape-dress.webp', 2550, 3300],
  ['outdoor-lean', 'works', 'امتداد', 'Extension', '/images/portfolio/outdoor-lean.webp', 2569, 3936],
  ['outdoor-low-angle', 'works', 'زاویه حضور', 'Angle of presence', '/images/portfolio/outdoor-low-angle.webp', 4000, 6000],
  ['outdoor-motion', 'works', 'حرکت', 'Movement', '/images/portfolio/outdoor-motion.webp', 4000, 6000],
  ['outdoor-still', 'works', 'مکث', 'Stillness', '/images/portfolio/outdoor-still.webp', 2624, 3936],
  ['portrait-curls', 'works', 'پرتره روشن', 'Luminous portrait', '/images/portfolio/portrait-curls.webp', 2550, 3300],
  ['portrait-glasses', 'works', 'نگاه پوشیده', 'Veiled gaze', '/images/portfolio/portrait-glasses.webp', 2550, 3300],
  ['portrait-hand', 'works', 'اشاره', 'Gesture', '/images/portfolio/portrait-hand.webp', 2550, 3300],
  ['portrait-seated', 'works', 'قرار', 'Poise', '/images/portfolio/portrait-seated.webp', 2550, 3300],
  ['portrait-sunglasses', 'works', 'بی‌واسطه', 'Unfiltered', '/images/portfolio/portrait-sunglasses.webp', 2550, 3300],
  ['studio-dark-portrait', 'works', 'سایه‌روشن', 'Chiaroscuro', '/images/portfolio/studio-dark-portrait.webp', 4480, 6720],
  ['mg-7729', 'works', 'نزدیک', 'Close', '/images/portfolio/telegram/mg-7729.webp', 4443, 2415],
  ['mg-7721', 'works', 'دود و سکوت', 'Smoke and silence', '/images/portfolio/telegram/mg-7721.webp', 3456, 5184],
  ['mg-7701', 'works', 'خط نفس', 'Breath line', '/images/portfolio/telegram/mg-7701.webp', 3357, 3456],
  ['73a-9860', 'works', 'راه روشن', 'Bright path', '/images/portfolio/telegram/73a-9860.webp', 3360, 5040],
  ['73a-9070', 'works', 'میان واژه‌ها', 'Between words', '/images/portfolio/telegram/73a-9070.webp', 2976, 4464],
  ['ins-07864', 'works', 'جشن نور', 'A celebration of light', '/images/portfolio/telegram/ins-07864.webp', 4000, 6000],
  ['73a-6557', 'gallery', 'فکر', 'Thought', '/images/portfolio/telegram/73a-6557.webp', 4480, 6720],
  ['73a-6563', 'gallery', 'فاصله', 'Distance', '/images/portfolio/telegram/73a-6563.webp', 6720, 4480],
  ['73a-6567', 'gallery', 'آرامش', 'Rest', '/images/portfolio/telegram/73a-6567.webp', 4480, 6720],
  ['73a-6568', 'gallery', 'خواب کوتاه', 'A brief sleep', '/images/portfolio/telegram/73a-6568.webp', 4480, 6720],
  ['73a-6569', 'gallery', 'پشت کتاب', 'Behind the book', '/images/portfolio/telegram/73a-6569.webp', 4480, 6720],
  ['73a-6576', 'gallery', 'رو به نور', 'Facing light', '/images/portfolio/telegram/73a-6576.webp', 4480, 6720],
  ['73a-6579', 'gallery', 'جزئیات', 'Detail', '/images/portfolio/telegram/73a-6579.webp', 4480, 6720],
  ['73a-6581', 'gallery', 'فضای خالی', 'Negative space', '/images/portfolio/telegram/73a-6581.webp', 4480, 6720],
  ['ins-03397', 'gallery', 'نشانه‌ها', 'Signifiers', '/images/portfolio/telegram/ins-03397.webp', 3936, 2624],
  ['ins-03460', 'gallery', 'حضور', 'Presence', '/images/portfolio/telegram/ins-03460.webp', 3631, 5447],
  ['ins-03586', 'gallery', 'زیر آفتاب', 'Under the sun', '/images/portfolio/telegram/ins-03586.webp', 4000, 6000],
  ['ins-03648', 'gallery', 'شتاب', 'Velocity', '/images/portfolio/telegram/ins-03648.webp', 4000, 6000],
  ['ins-03664', 'gallery', 'خط سایه', 'Shadow line', '/images/portfolio/telegram/ins-03664.webp', 4000, 6000],
  ['jewel-profile', 'gallery', 'درخشش', 'Gleam', '/images/portfolio/telegram/jewel-profile.webp', 1638, 2480],
  ['studio-frame', 'gallery', 'در استودیو', 'In the studio', '/images/studio.webp', 4480, 6720],
].map(([id, section, title_fa, title_en, url, width, height]) => ({
  id: `default-${id}`,
  section: section as Photo['section'],
  title_fa: title_fa as string,
  title_en: title_en as string,
  url: url as string,
  width: width as number,
  height: height as number,
}));
