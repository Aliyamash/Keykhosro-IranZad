import { requireChatGPTUser } from '../chatgpt-auth';
import { adminIdentity } from '@/lib/admin';
import AdminPanel from './panel';
import './admin.css';
export const dynamic = 'force-dynamic';
export const metadata = {
  title: 'مدیریت درخواست‌ها',
  robots: { index: false, follow: false },
};
export default async function Admin() {
  await requireChatGPTUser('/admin');
  const admin = await adminIdentity();
  if (!admin)
    return (
      <main className="admin-denied">
        <span>KI / STUDIO</span>
        <h1>دسترسی مدیریت فعال نیست</h1>
        <p>
          این حساب اجازه مشاهده درخواست‌ها را ندارد. ایمیل مدیر باید در تنظیمات
          سرور ثبت شود.
        </p>
        <a href="/">بازگشت به سایت ↗</a>
      </main>
    );
  return <AdminPanel email={admin.email} />;
}
