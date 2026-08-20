import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { ToastProvider } from '@/context/ToastContext';
import { CartProvider } from '@/context/CartContext';
import { Navbar } from '@/components/layout/Navbar';
import { CartDrawer } from '@/components/cart/CartDrawer';

export const metadata: Metadata = {
  title: 'Catálogo de Precios Mayorista',
  description: 'Lista oficial de precios de distribución mayorista.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-[#eef2f6] text-slate-900 font-sans">
        <ToastProvider>
          <AuthProvider>
            <CartProvider>
              <Navbar />
              <main className="w-full">
                {children}
              </main>
              <CartDrawer />
            </CartProvider>
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
