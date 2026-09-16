import { adminIdentity } from '@/lib/admin';
import AdminLogin from './login-form';
import AdminPanel from './panel';
import './admin.css';
export const dynamic = 'force-dynamic';
export const metadata = {
  title: 'مدیریت استودیو',
  robots: { index: false, follow: false },
};
export default async function Admin() {
  const authenticated = await adminIdentity();
  return authenticated ? <AdminPanel /> : <AdminLogin />;
}
