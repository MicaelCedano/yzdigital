'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  Package,
  Layers,
  User as UserIcon,
  LogOut,
  ShieldCheck,
  Menu,
  X,
  LogIn,
  PhoneCall,
  User,
  Users,
} from 'lucide-react';

export function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (pathname === '/login') {
    return null;
  }

  const isActive = (path: string) => {
    if (path === '/lista-precios' && (pathname === '/' || pathname.startsWith('/lista-precios'))) {
      return true;
    }
    return pathname.startsWith(path);
  };

  const navLinks = [
    { href: '/lista-precios', label: 'Catálogo de Precios', icon: Layers },
    ...(user ? [{ href: '/perfil', label: 'Mi Cuenta', icon: UserIcon }] : []),
  ];

  const adminLinks = [
    { href: '/admin/productos', label: 'Gestión de Productos', icon: Package },
    { href: '/admin/usuarios', label: 'Clientes & Solicitudes', icon: Users },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-sky-200/80 shadow-sm print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <Link href="/lista-precios" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl overflow-hidden border border-sky-200 bg-white p-0.5 shadow-sm group-hover:scale-105 transition-transform flex items-center justify-center flex-shrink-0">
                <img
                  src="/logo.png"
                  alt="YZ DIGITAL"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-black text-base text-slate-900 tracking-tight leading-none">
                  YZ DIGITAL
                </span>
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                  Lista de Precios Mayorista
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1.5">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    active
                      ? 'bg-sky-50 text-sky-700 border border-sky-200'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${active ? 'text-sky-600' : 'text-slate-400'}`} />
                  <span>{link.label}</span>
                </Link>
              );
            })}

            {/* Admin Links */}
            {isAdmin && (
              <div className="flex items-center gap-1.5 ml-2 pl-3 border-l border-slate-200">
                {adminLinks.map((link) => {
                  const Icon = link.icon;
                  const active = pathname.startsWith(link.href);
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        active
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : 'text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 text-amber-600" />
                      <span>{link.label}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </nav>

          {/* User / Login on Desktop */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
                <div className="flex flex-col text-right">
                  <span className="text-xs font-bold text-slate-900 truncate max-w-[150px]">
                    {user.name}
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">
                    {isAdmin ? 'Administrador' : user.companyName || `@${user.username}`}
                  </span>
                </div>

                <button
                  onClick={logout}
                  title="Cerrar sesión"
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs font-medium transition-colors shadow-sm"
                >
                  <LogIn className="w-3.5 h-3.5 text-slate-600" />
                  <span>Iniciar Sesión</span>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-3 shadow-lg">
          {user ? (
            <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-900">{user.name}</p>
                <p className="text-[11px] text-slate-500">{user.email}</p>
              </div>
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-sky-100 text-sky-700">
                {user.role}
              </span>
            </div>
          ) : (
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-sky-600 text-white rounded-lg text-xs font-bold shadow-sm"
            >
              <LogIn className="w-4 h-4" />
              <span>Iniciar Sesión</span>
            </Link>
          )}

          <div className="space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold ${
                    active ? 'bg-sky-50 text-sky-700' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 text-sky-600" />
                    <span>{link.label}</span>
                  </div>
                </Link>
              );
            })}
          </div>

          {isAdmin && (
            <div className="pt-2 border-t border-slate-100 space-y-1">
              <p className="text-[10px] font-bold text-amber-700 uppercase px-3">Administración</p>
              {adminLinks.map((link) => {
                const Icon = link.icon;
                const active = pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold ${
                      active ? 'bg-amber-50 text-amber-800' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className="w-4 h-4 text-amber-600" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </div>
          )}

          {user && (
            <div className="pt-2 border-t border-slate-100">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg text-xs font-bold transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Cerrar Sesión</span>
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
