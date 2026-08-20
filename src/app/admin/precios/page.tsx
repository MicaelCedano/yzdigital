import { redirect } from 'next/navigation';

export default function AdminPreciosRedirect() {
  redirect('/admin/productos');
}
