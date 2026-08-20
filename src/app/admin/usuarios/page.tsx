'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useRouter } from 'next/navigation';
import {
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  MessageCircle,
  Search,
  RefreshCw,
  Activity,
  Shield,
  Store,
  MapPin,
  Phone,
  Calendar,
  Eye,
  AlertCircle,
  Smartphone,
  Lock,
  Unlock,
  UserPlus,
  X,
  Save,
} from 'lucide-react';

interface UserData {
  id: string;
  username: string;
  email: string;
  name: string;
  role: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  companyName: string | null;
  city: string | null;
  phone: string | null;
  isActive: boolean;
  isOnline: boolean;
  lastLoginAt: string | null;
  lastActiveAt: string | null;
  loginCount: number;
  lockedDevice: string | null;
  lockedIp: string | null;
  lastDeviceChangeAt: string | null;
  createdAt: string;
}

interface AccessLogItem {
  id: string;
  userId: string;
  username: string;
  name: string;
  role: string;
  action: string;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
}

interface StatsData {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  onlineNow: number;
}

export default function AdminUsuariosPage() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const { success, error: toastError } = useToast();
  const router = useRouter();

  const [users, setUsers] = useState<UserData[]>([]);
  const [stats, setStats] = useState<StatsData>({ total: 0, pending: 0, approved: 0, rejected: 0, onlineNow: 0 });
  const [accessLogs, setAccessLogs] = useState<AccessLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [activeTab, setActiveTab] = useState<'pending' | 'online' | 'all' | 'logs'>('pending');
  const [search, setSearch] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [adminForm, setAdminForm] = useState({ name: '', username: '', email: '', password: '' });
  const [adminSaving, setAdminSaving] = useState(false);

  const fetchUsers = useCallback(async (isSilent = false) => {
    if (!isSilent) setRefreshing(true);
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      if (res.ok) {
        setUsers(data.users || []);
        if (data.stats) setStats(data.stats);
        if (data.recentAccessLogs) setAccessLogs(data.recentAccessLogs);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.push('/lista-precios');
      return;
    }
    if (isAdmin) {
      fetchUsers();
      // Auto refrescar cada 15 segundos para monitoreo en vivo
      const interval = setInterval(() => {
        fetchUsers(true);
      }, 15000);
      return () => clearInterval(interval);
    }
  }, [isAdmin, authLoading, router, fetchUsers]);

  // Cambiar estado de usuario (Aprobar / Rechazar)
  const handleUpdateStatus = async (userId: string, newStatus: 'APPROVED' | 'REJECTED' | 'PENDING', userName: string) => {
    setUpdatingId(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();
      if (res.ok) {
        success(
          newStatus === 'APPROVED' ? 'Cliente Aprobado' : 'Estado Actualizado',
          `La cuenta de ${userName} ahora está ${newStatus === 'APPROVED' ? 'habilitada para entrar' : 'rechazada'}.`
        );
        fetchUsers(true);
      } else {
        toastError('Error', data.error || 'No se pudo actualizar el estado.');
      }
    } catch (err) {
      toastError('Error de red', 'Intenta nuevamente.');
    } finally {
      setUpdatingId(null);
    }
  };

  // Resetear y desvincular dispositivo bloqueado (24h cooldown reset)
  const handleResetDevice = async (userId: string, userName: string) => {
    setUpdatingId(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}/reset-device`, {
        method: 'POST',
      });

      const data = await res.json();
      if (res.ok) {
        success('Dispositivo Desvinculado', `Se ha reseteado el bloqueo de 24h para ${userName}. Ya puede entrar desde otro dispositivo de inmediato.`);
        fetchUsers(true);
      } else {
        toastError('Error', data.error || 'No se pudo desvincular el dispositivo.');
      }
    } catch (err) {
      toastError('Error de red', 'Intenta nuevamente.');
    } finally {
      setUpdatingId(null);
    }
  };

  const openCreateAdmin = () => {
    setEditingUser(null);
    setAdminForm({ name: '', username: '', email: '', password: '' });
    setAdminModalOpen(true);
  };

  const openEditUser = (target: UserData) => {
    setEditingUser(target);
    setAdminForm({ name: target.name, username: target.username, email: target.email, password: '' });
    setAdminModalOpen(true);
  };

  const saveAdmin = async (event: React.FormEvent) => {
    event.preventDefault();
    setAdminSaving(true);
    try {
      const url = editingUser ? `/api/admin/users/${editingUser.id}` : '/api/admin/users';
      const body = editingUser
        ? { name: adminForm.name, email: adminForm.email, ...(adminForm.password ? { password: adminForm.password } : {}) }
        : adminForm;
      const res = await fetch(url, {
        method: editingUser ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        toastError('No se pudo guardar', data.error || 'Revisa los datos e intenta nuevamente.');
        return;
      }
      success(editingUser ? 'Usuario actualizado' : 'Administrador creado', editingUser ? 'Los cambios fueron guardados.' : 'Ya puede iniciar sesión con su nueva cuenta.');
      setAdminModalOpen(false);
      fetchUsers(true);
    } catch {
      toastError('Error de red', 'Intenta nuevamente.');
    } finally {
      setAdminSaving(false);
    }
  };

  // Filtrado de usuarios según búsqueda y pestaña activa
  const filteredUsers = users.filter((u) => {
    const term = search.toLowerCase().trim();
    const matchesSearch =
      !term ||
      u.name.toLowerCase().includes(term) ||
      u.username.toLowerCase().includes(term) ||
      (u.companyName && u.companyName.toLowerCase().includes(term)) ||
      (u.phone && u.phone.toLowerCase().includes(term)) ||
      (u.city && u.city.toLowerCase().includes(term));

    if (!matchesSearch) return false;

    if (activeTab === 'pending') return u.status === 'PENDING';
    if (activeTab === 'online') return u.isOnline;
    return true; // 'all'
  });

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Nunca';
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('es-DO', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  };

  if (authLoading || (loading && users.length === 0)) {
    return (
      <div className="min-h-screen bg-[#F0F9FF] flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 text-sky-600 animate-spin" />
          <p className="text-sm font-bold text-slate-700">Cargando panel de clientes y monitoreo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F0F9FF] text-slate-900 font-sans pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">

        {/* Cabecera Principal */}
        <div className="bg-white rounded-2xl border border-sky-200/80 p-5 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-sky-100 text-sky-700">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                    Solicitudes de Acceso & Monitoreo en Vivo
                  </h1>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Acepta nuevos clientes mayoristas, protege contra cuentas compartidas (Bloqueo 24H) y monitorea conexiones en tiempo real.
                  </p>
                </div>
              </div>
            </div>

            {/* Botón Refrescar */}
            <div className="flex items-center gap-2 self-start md:self-auto">
              <button
                onClick={openCreateAdmin}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-700 text-white text-xs font-bold transition-all shadow-sm"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Crear administrador</span>
              </button>
              <button
                onClick={() => fetchUsers()}
                disabled={refreshing}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 text-xs font-bold transition-all shadow-sm disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
                <span>Actualizar Ahora</span>
              </button>
            </div>
          </div>

          {/* Tarjetas de Métricas Rápidas */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 pt-5">
            {/* Clientes En Línea */}
            <div
              onClick={() => setActiveTab('online')}
              className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                activeTab === 'online'
                  ? 'border-emerald-400 bg-emerald-50/80 shadow-md ring-2 ring-emerald-300'
                  : 'border-slate-200 bg-slate-50/60 hover:bg-emerald-50/40'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase">En Línea Ahora</span>
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
              </div>
              <div className="text-2xl font-black text-emerald-600 mt-1">
                {stats.onlineNow}
              </div>
              <div className="text-[10px] text-emerald-700 font-semibold mt-0.5">
                Viendo la web en vivo
              </div>
            </div>

            {/* Solicitudes Pendientes */}
            <div
              onClick={() => setActiveTab('pending')}
              className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                activeTab === 'pending'
                  ? 'border-amber-400 bg-amber-50/80 shadow-md ring-2 ring-amber-300'
                  : 'border-slate-200 bg-slate-50/60 hover:bg-amber-50/40'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase">Por Aprobar</span>
                <Clock className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-2xl font-black text-amber-600 mt-1">
                {stats.pending}
              </div>
              <div className="text-[10px] text-amber-700 font-semibold mt-0.5">
                {stats.pending > 0 ? '¡Requiere tu aprobación!' : 'Al día, sin pendientes'}
              </div>
            </div>

            {/* Clientes Activos */}
            <div
              onClick={() => setActiveTab('all')}
              className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                activeTab === 'all'
                  ? 'border-sky-400 bg-sky-50/80 shadow-md ring-2 ring-sky-300'
                  : 'border-slate-200 bg-slate-50/60 hover:bg-sky-50/40'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase">Aprobados</span>
                <CheckCircle2 className="w-4 h-4 text-sky-500" />
              </div>
              <div className="text-2xl font-black text-sky-600 mt-1">
                {stats.approved}
              </div>
              <div className="text-[10px] text-sky-700 font-semibold mt-0.5">
                Cuentas activas
              </div>
            </div>

            {/* Total Registrados */}
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase">Total Registros</span>
                <Shield className="w-4 h-4 text-slate-400" />
              </div>
              <div className="text-2xl font-black text-slate-800 mt-1">
                {stats.total}
              </div>
              <div className="text-[10px] text-slate-500 font-semibold mt-0.5">
                Directorio general
              </div>
            </div>
          </div>
        </div>

        {/* Barra de Pestañas y Búsqueda */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
          {/* Pestañas */}
          <div className="flex items-center gap-1 overflow-x-auto">
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'pending'
                  ? 'bg-amber-500 text-white shadow-md shadow-amber-500/30'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Solicitudes Pendientes</span>
              {stats.pending > 0 && (
                <span className="px-1.5 py-0.2 text-[10px] bg-white text-amber-700 rounded-full font-black">
                  {stats.pending}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('online')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'online'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
              </span>
              <span>En Línea ({stats.onlineNow})</span>
            </button>

            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'all'
                  ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Todos los Clientes</span>
            </button>

            <button
              onClick={() => setActiveTab('logs')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'logs'
                  ? 'bg-slate-800 text-white shadow-md shadow-slate-800/30'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Historial de Logins</span>
            </button>
          </div>

          {/* Buscador */}
          {activeTab !== 'logs' && (
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar cliente, tienda o teléfono..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all"
              />
            </div>
          )}
        </div>

        {/* Contenido de la Pestaña: Solicitudes y Clientes */}
        {activeTab !== 'logs' ? (
          <div>
            {filteredUsers.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
                <div className="w-14 h-14 bg-slate-100 rounded-full mx-auto flex items-center justify-center text-slate-400">
                  {activeTab === 'pending' ? <CheckCircle2 className="w-8 h-8 text-emerald-500" /> : <Users className="w-8 h-8" />}
                </div>
                <h3 className="text-base font-bold text-slate-800">
                  {activeTab === 'pending'
                    ? '¡No hay solicitudes pendientes!'
                    : activeTab === 'online'
                    ? 'No hay clientes conectados en este instante'
                    : 'No se encontraron clientes'}
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  {activeTab === 'pending'
                    ? 'Todas las cuentas solicitadas han sido procesadas.'
                    : 'El listado se actualizará automáticamente cuando haya actividad.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredUsers.map((u) => {
                  const isPending = u.status === 'PENDING';
                  const isRejected = u.status === 'REJECTED';
                  const isApproved = u.status === 'APPROVED';

                  return (
                    <div
                      key={u.id}
                      className={`bg-white rounded-2xl border p-4 shadow-sm space-y-3 transition-all ${
                        isPending
                          ? 'border-amber-300 ring-1 ring-amber-200'
                          : u.isOnline
                          ? 'border-emerald-300 ring-1 ring-emerald-200'
                          : 'border-slate-200/90 hover:border-sky-300'
                      }`}
                    >
                      {/* Cabecera de la Tarjeta */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-black text-sm text-slate-900 truncate">
                              {u.name}
                            </h3>
                            {u.isOnline && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.2 rounded-full flex-shrink-0 animate-pulse">
                                🟢 En Línea
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-sky-700 font-bold mt-0.5 truncate">
                            <Store className="w-3.5 h-3.5 flex-shrink-0 text-sky-600" />
                            <span>{u.companyName || 'Tienda Mayorista'}</span>
                          </div>
                        </div>

                        {/* Badge de Estado */}
                        <div className="flex-shrink-0">
                          {isPending && (
                            <span className="px-2.5 py-1 text-[10px] font-black uppercase rounded-lg bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>Pendiente</span>
                            </span>
                          )}
                          {isApproved && (
                            <span className="px-2.5 py-1 text-[10px] font-black uppercase rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Aprobado</span>
                            </span>
                          )}
                          {isRejected && (
                            <span className="px-2.5 py-1 text-[10px] font-black uppercase rounded-lg bg-rose-100 text-rose-800 border border-rose-300 flex items-center gap-1">
                              <XCircle className="w-3 h-3" />
                              <span>Rechazado</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Detalles del Cliente */}
                      <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/80 space-y-1.5 text-xs text-slate-700">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400 font-semibold">Usuario:</span>
                          <span className="font-mono font-bold text-slate-900">{u.username}</span>
                        </div>

                        {u.phone && (
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400 font-semibold flex items-center gap-1">
                              <Phone className="w-3 h-3 text-slate-400" /> WhatsApp:
                            </span>
                            <span className="font-bold text-slate-900">{u.phone}</span>
                          </div>
                        )}

                        {u.city && (
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400 font-semibold flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-slate-400" /> Ciudad:
                            </span>
                            <span className="font-semibold text-slate-800">{u.city}</span>
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-1 border-t border-slate-200 text-[11px]">
                          <span className="text-slate-400 font-semibold">Última Entrada:</span>
                          <span className="font-bold text-slate-800">{formatDate(u.lastLoginAt)}</span>
                        </div>

                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-400 font-semibold">Visitas / Logins:</span>
                          <span className="font-bold text-sky-700">{u.loginCount} veces</span>
                        </div>

                        {/* Estado de Dispositivo Vinculado (Bloqueo 24H) */}
                        <div className="flex items-center justify-between pt-1 border-t border-slate-200 text-[11px]">
                          <span className="text-slate-400 font-semibold flex items-center gap-1">
                            <Smartphone className="w-3 h-3 text-slate-400" /> Dispositivo:
                          </span>
                          {u.lockedDevice ? (
                            <span className="font-bold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200 text-[10px]">
                              🔒 Vinculado a su red
                            </span>
                          ) : (
                            <span className="font-medium text-slate-400 text-[10px]">
                              🔓 Libre (1er inicio)
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Botones de Acción */}
                      <div className="space-y-2 pt-1">
                        {isPending && (
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              onClick={() => handleUpdateStatus(u.id, 'APPROVED', u.name)}
                              disabled={updatingId === u.id}
                              className="py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 disabled:opacity-50"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Aprobar</span>
                            </button>

                            <button
                              onClick={() => handleUpdateStatus(u.id, 'REJECTED', u.name)}
                              disabled={updatingId === u.id}
                              className="py-2 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Rechazar</span>
                            </button>
                          </div>
                        )}

                        {isApproved && (
                          <div className="flex items-center justify-between gap-1.5 flex-wrap">
                          <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => openEditUser(u)}
                                disabled={updatingId === u.id}
                                className="py-1.5 px-2.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 text-[11px] font-bold transition-all"
                              >
                                Editar
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(u.id, 'REJECTED', u.name)}
                                disabled={updatingId === u.id}
                                className="py-1.5 px-2.5 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-600 text-[11px] font-bold transition-all"
                              >
                                Suspender
                              </button>

                              {/* Botón Resetear Dispositivo 24H */}
                              {u.lockedDevice && (
                                <button
                                  onClick={() => handleResetDevice(u.id, u.name)}
                                  disabled={updatingId === u.id}
                                  className="py-1.5 px-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-[11px] font-bold transition-all flex items-center gap-1"
                                  title="Permite que el cliente entre de inmediato desde otro teléfono o red sin esperar 24 horas"
                                >
                                  <Unlock className="w-3 h-3 text-amber-600" />
                                  <span>Reset 24h</span>
                                </button>
                              )}
                            </div>

                            {u.phone && (
                              <a
                                href={`https://wa.me/${u.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                                  `Hola ${u.name}, te escribimos de YZ DIGITAL. Tu cuenta mayorista está activa. Puedes acceder con tu usuario "${u.username}" en http://localhost:3000/login`
                                )}`}
                                target="_blank"
                                rel="noreferrer"
                                className="py-1.5 px-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-[11px] font-bold transition-all flex items-center gap-1"
                              >
                                <MessageCircle className="w-3.5 h-3.5" />
                                <span>WhatsApp</span>
                              </a>
                            )}
                          </div>
                        )}

                        {isRejected && (
                          <button
                            onClick={() => handleUpdateStatus(u.id, 'APPROVED', u.name)}
                            disabled={updatingId === u.id}
                            className="w-full py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition-all"
                          >
                            Reactivar y Aprobar
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          /* Pestaña: Historial Reciente de Logins / Conexiones */
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-black text-sm text-slate-900">Historial de Accesos Recientes</h3>
                <p className="text-xs text-slate-500">Registro cronológico de las últimas 20 entradas al sistema con IP y dispositivo.</p>
              </div>
            </div>

            {accessLogs.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs font-semibold">
                No hay registros de acceso todavía.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {accessLogs.map((log) => (
                  <div key={log.id} className="p-3.5 flex items-center justify-between hover:bg-slate-50 text-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-sky-100 text-sky-700 font-black flex items-center justify-center text-xs">
                        {log.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">
                          {log.name}{' '}
                          <span className="text-slate-400 font-normal">(@{log.username})</span>
                        </div>
                        <div className="text-[11px] text-slate-400 truncate max-w-xs sm:max-w-md">
                          {log.ipAddress ? `IP: ${log.ipAddress} • ` : ''}{log.userAgent || 'Navegador Web'}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-bold text-slate-800 block">{formatDate(log.createdAt)}</span>
                      <span className="inline-block text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.2 rounded border border-emerald-200 mt-0.5">
                        {log.action}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {adminModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-3xl bg-white border border-slate-200 shadow-2xl p-6">
            <button
              type="button"
              onClick={() => setAdminModalOpen(false)}
              className="absolute right-4 top-4 w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center"
              aria-label="Cerrar"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="mb-5 pr-8">
              <div className="flex items-center gap-2 text-slate-900">
                <Shield className="w-5 h-5 text-sky-600" />
                <h2 className="text-lg font-black">{editingUser ? 'Editar usuario' : 'Crear administrador'}</h2>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {editingUser ? 'Puedes cambiar nombre, correo o contraseña.' : 'Esta cuenta tendrá acceso completo al panel administrativo.'}
              </p>
            </div>
            <form onSubmit={saveAdmin} className="space-y-3">
              <input
                required
                value={adminForm.name}
                onChange={(e) => setAdminForm({ ...adminForm, name: e.target.value })}
                placeholder="Nombre completo"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
              {!editingUser && (
                <input
                  required
                  value={adminForm.username}
                  onChange={(e) => setAdminForm({ ...adminForm, username: e.target.value })}
                  placeholder="Usuario de acceso"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              )}
              <input
                required
                type="email"
                value={adminForm.email}
                onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
                placeholder="Correo electrónico"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
              <input
                required={!editingUser}
                minLength={8}
                type="password"
                value={adminForm.password}
                onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })}
                placeholder={editingUser ? 'Nueva contraseña (opcional)' : 'Contraseña (mínimo 8 caracteres)'}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
              <button
                type="submit"
                disabled={adminSaving}
                className="w-full py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-sm font-black flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {adminSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {editingUser ? 'Guardar cambios' : 'Crear administrador'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
