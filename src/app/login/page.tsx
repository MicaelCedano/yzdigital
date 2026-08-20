'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { ShieldCheck, UserCheck, Loader2 } from 'lucide-react';

function LoginFormContent() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Estados para el Modal de Solicitar Acceso
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState('');
  const [registerSuccess, setRegisterSuccess] = useState(false);
  const [regForm, setRegForm] = useState({
    name: '',
    companyName: '',
    phone: '',
    city: '',
    username: '',
    password: '',
  });

  const { login } = useAuth();
  const { success } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/lista-precios';


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    const result = await login(identifier, password);
    if (result.success) {
      success('Sesión iniciada correctamente', '¡Bienvenido a YZ DIGITAL!');
      router.push(callbackUrl);
      router.refresh();
    } else {
      setErrorMessage(result.error || 'Credenciales inválidas');
      setLoading(false);
    }
  };

  const fillCredentials = (user: string, pass: string) => {
    setIdentifier(user);
    setPassword(pass);
    setErrorMessage('');
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    setRegLoading(true);

    try {
      const res = await fetch('/api/auth/register-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(regForm),
      });

      const data = await res.json();
      if (!res.ok) {
        setRegError(data.error || 'Error al enviar solicitud');
        setRegLoading(false);
        return;
      }

      setRegisterSuccess(true);
      setRegLoading(false);
    } catch (err) {
      setRegError('Ocurrió un error de red. Intenta nuevamente.');
      setRegLoading(false);
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden select-none">

      {/* Contenedor Login con Glassmorphism */}
      <div className="absolute top-[36%] sm:top-[38%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-[90%] max-w-[380px] p-6 sm:p-7 bg-slate-950/75 backdrop-blur-xl rounded-[24px] border border-white/20 shadow-2xl shadow-black/60 text-white transition-all duration-300 hover:shadow-cyan-500/20">

        {/* Cabecera del Login */}
        <div className="text-center mb-4">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-[#38bdf8] to-[#0284c7] rounded-2xl mb-2 shadow-lg shadow-sky-500/40 p-1 border border-white/30 overflow-hidden">
            <img
              src="/logo.png"
              alt="YZ DIGITAL"
              className="w-full h-full object-contain drop-shadow-md"
              onError={(e) => {
                // Fallback icon si aún no carga
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>
          <h2 className="text-lg sm:text-xl font-black tracking-tight text-white">
            Iniciar sesión
          </h2>
          <p className="text-[11px] text-sky-200 font-semibold mt-0.5">
            YZ DIGITAL
          </p>
        </div>

        {/* Mensaje de Error */}
        {errorMessage && (
          <div className="mb-3.5 p-2.5 rounded-xl bg-rose-500/20 border border-rose-400/40 text-rose-200 text-xs font-semibold text-center animate-fade-in">
            {errorMessage}
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-3.5 text-left">
          {/* Campo Usuario */}
          <div>
            <label className="block text-[11px] font-bold text-sky-100 uppercase tracking-wider mb-1">
              Usuario
            </label>
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="Ingresa tu usuario"
              required
              className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-white/15 rounded-xl text-white text-xs outline-none focus:bg-slate-800 focus:border-[#38bdf8] focus:ring-2 focus:ring-sky-400/30 transition-all placeholder:text-slate-400 select-text"
            />
          </div>

          {/* Campo Contraseña */}
          <div>
            <label className="block text-[11px] font-bold text-sky-100 uppercase tracking-wider mb-1">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              required
              className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-white/15 rounded-xl text-white text-xs outline-none focus:bg-slate-800 focus:border-[#38bdf8] focus:ring-2 focus:ring-sky-400/30 transition-all placeholder:text-slate-400 select-text"
            />
          </div>

          {/* Acciones Recordar / Olvido */}
          <div className="flex items-center justify-between text-[11px] text-sky-200 pt-0.5">
            <label className="flex items-center gap-1.5 cursor-pointer hover:text-white transition-colors">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-white/20 bg-slate-800 text-sky-500 focus:ring-0 cursor-pointer"
              />
              <span>Recordarme</span>
            </label>
            <a
              href="https://wa.me/18294636244?text=Hola,%20olvidé%20mi%20contraseña%20de%20acceso%20a%20YZ%20Digital"
              target="_blank"
              rel="noreferrer"
              className="text-sky-300 hover:text-white hover:underline transition-colors font-semibold"
            >
              ¿Olvidaste tu contraseña?
            </a>
          </div>

          {/* Botón Entrar */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-[#38bdf8] to-[#0284c7] hover:from-[#7dd3fc] hover:to-[#0369a1] text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-sky-600/40 hover:shadow-sky-400/50 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Autenticando...</span>
              </>
            ) : (
              <span>Entrar al sistema</span>
            )}
          </button>
        </form>

        {/* Enlace Solicitar Acceso */}
        <div className="mt-3.5 text-center text-xs text-sky-200">
          ¿No tienes cuenta?{' '}
          <button
            type="button"
            onClick={() => {
              setErrorMessage('');
              setRegisterSuccess(false);
              setRegisterModalOpen(true);
            }}
            className="text-sky-300 font-bold hover:text-white hover:underline transition-colors"
          >
            Solicitar Acceso Mayorista
          </button>
        </div>

        {/* Acceso Rápido de Demostración */}
        <div className="mt-4 pt-3 border-t border-white/10 text-center">
          <p className="text-[10px] text-sky-200/80 uppercase font-bold tracking-wider mb-2">
            Accesos Rápidos de Prueba
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => fillCredentials('admin', 'admin123')}
              className="py-1.5 px-2 bg-white/10 hover:bg-white/20 border border-white/15 rounded-lg text-[10px] font-bold text-amber-300 transition-colors flex items-center justify-center gap-1"
            >
              <ShieldCheck className="w-3 h-3 text-amber-400" />
              <span>Admin</span>
            </button>
            <button
              type="button"
              onClick={() => fillCredentials('mayorista', 'mayorista123')}
              className="py-1.5 px-2 bg-white/10 hover:bg-white/20 border border-white/15 rounded-lg text-[10px] font-bold text-sky-300 transition-colors flex items-center justify-center gap-1"
            >
              <UserCheck className="w-3 h-3 text-sky-400" />
              <span>Mayorista</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modal Solicitar Acceso Mayorista */}
      {registerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div
            className="fixed inset-0"
            onClick={() => setRegisterModalOpen(false)}
          />
          <div className="relative w-full max-w-md bg-slate-900/95 border border-white/20 rounded-3xl p-6 sm:p-7 shadow-2xl text-white z-10 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setRegisterModalOpen(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-white text-sm font-bold bg-white/10 w-7 h-7 rounded-full flex items-center justify-center"
            >
              ✕
            </button>

            {registerSuccess ? (
              <div className="text-center py-4 space-y-4">
                <div className="w-16 h-16 bg-emerald-500/20 border border-emerald-400/40 rounded-full mx-auto flex items-center justify-center text-3xl text-emerald-400 shadow-lg shadow-emerald-500/20">
                  ✓
                </div>
                <h3 className="text-xl font-black text-white">
                  ¡Solicitud Enviada con Éxito!
                </h3>
                <p className="text-xs text-sky-200 leading-relaxed">
                  Tu solicitud ha sido recibida. El administrador de <strong>YZ DIGITAL</strong> revisará los datos de tu negocio y activará tu cuenta en breve.
                </p>
                <div className="p-3.5 bg-slate-800/80 border border-slate-700 rounded-2xl text-left space-y-1 text-xs">
                  <div className="text-slate-400 text-[11px] font-bold uppercase">Usuario Registrado:</div>
                  <div className="font-mono font-bold text-sky-300">{regForm.username}</div>
                  <div className="text-slate-400 text-[11px] font-bold uppercase pt-1">Negocio:</div>
                  <div className="font-bold text-white">{regForm.companyName || 'Mayorista'}</div>
                </div>

                <a
                  href={`https://wa.me/18294636244?text=${encodeURIComponent(
                    `Hola YZ DIGITAL, acabo de solicitar acceso mayorista para mi negocio "${regForm.companyName || regForm.name}" con el usuario "${regForm.username}". Por favor activar mi cuenta.`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all block"
                >
                  <span>Avisar al Administrador por WhatsApp</span>
                </a>

                <button
                  type="button"
                  onClick={() => setRegisterModalOpen(false)}
                  className="w-full py-2.5 bg-white/10 hover:bg-white/20 text-slate-300 text-xs font-semibold rounded-xl transition-colors"
                >
                  Volver al Inicio de Sesión
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-center">
                  <h3 className="text-lg sm:text-xl font-black text-white">
                    Solicitar Acceso Mayorista
                  </h3>
                  <p className="text-xs text-sky-200 mt-1">
                    Completa tus datos comerciales para que activemos tu cuenta de distribución.
                  </p>
                </div>

                {regError && (
                  <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-400/40 text-rose-200 text-xs font-semibold text-center">
                    {regError}
                  </div>
                )}

                <form onSubmit={handleRegisterSubmit} className="space-y-3 text-left">
                  <div>
                    <label className="block text-[11px] font-bold text-sky-100 uppercase tracking-wider mb-1">
                      Nombre Completo / Contacto *
                    </label>
                    <input
                      type="text"
                      required
                      value={regForm.name}
                      onChange={(e) => setRegForm({ ...regForm, name: e.target.value })}
                      placeholder="Ej: Juan Pérez"
                      className="w-full px-3.5 py-2.5 bg-slate-800 border border-white/15 rounded-xl text-white text-xs outline-none focus:border-[#38bdf8] focus:ring-2 focus:ring-sky-400/30 transition-all placeholder:text-slate-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-sky-100 uppercase tracking-wider mb-1">
                      Nombre de la Tienda o Negocio *
                    </label>
                    <input
                      type="text"
                      required
                      value={regForm.companyName}
                      onChange={(e) => setRegForm({ ...regForm, companyName: e.target.value })}
                      placeholder="Ej: Celulares Pérez / Tienda Móvil"
                      className="w-full px-3.5 py-2.5 bg-slate-800 border border-white/15 rounded-xl text-white text-xs outline-none focus:border-[#38bdf8] focus:ring-2 focus:ring-sky-400/30 transition-all placeholder:text-slate-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-sky-100 uppercase tracking-wider mb-1">
                        WhatsApp / Teléfono *
                      </label>
                      <input
                        type="tel"
                        required
                        value={regForm.phone}
                        onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })}
                        placeholder="Ej: 829-463-6244"
                        className="w-full px-3.5 py-2.5 bg-slate-800 border border-white/15 rounded-xl text-white text-xs outline-none focus:border-[#38bdf8] focus:ring-2 focus:ring-sky-400/30 transition-all placeholder:text-slate-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-sky-100 uppercase tracking-wider mb-1">
                        Ciudad / Ubicación
                      </label>
                      <input
                        type="text"
                        value={regForm.city}
                        onChange={(e) => setRegForm({ ...regForm, city: e.target.value })}
                        placeholder="Ej: Santo Domingo"
                        className="w-full px-3.5 py-2.5 bg-slate-800 border border-white/15 rounded-xl text-white text-xs outline-none focus:border-[#38bdf8] focus:ring-2 focus:ring-sky-400/30 transition-all placeholder:text-slate-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-sky-100 uppercase tracking-wider mb-1">
                        Usuario Deseado *
                      </label>
                      <input
                        type="text"
                        required
                        value={regForm.username}
                        onChange={(e) => setRegForm({ ...regForm, username: e.target.value })}
                        placeholder="Ej: juanperez"
                        className="w-full px-3.5 py-2.5 bg-slate-800 border border-white/15 rounded-xl text-white text-xs outline-none focus:border-[#38bdf8] focus:ring-2 focus:ring-sky-400/30 transition-all placeholder:text-slate-500 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-sky-100 uppercase tracking-wider mb-1">
                        Contraseña Deseada *
                      </label>
                      <input
                        type="password"
                        required
                        value={regForm.password}
                        onChange={(e) => setRegForm({ ...regForm, password: e.target.value })}
                        placeholder="••••••••••••"
                        className="w-full px-3.5 py-2.5 bg-slate-800 border border-white/15 rounded-xl text-white text-xs outline-none focus:border-[#38bdf8] focus:ring-2 focus:ring-sky-400/30 transition-all placeholder:text-slate-500"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={regLoading}
                      className="w-full py-3 bg-gradient-to-r from-[#38bdf8] to-[#0284c7] hover:from-[#7dd3fc] hover:to-[#0369a1] text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-sky-600/40 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                    >
                      {regLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Enviando Solicitud...</span>
                        </>
                      ) : (
                        <span>Enviar Solicitud de Acceso</span>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#0284c7] text-white">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      }
    >
      <LoginFormContent />
    </Suspense>
  );
}
