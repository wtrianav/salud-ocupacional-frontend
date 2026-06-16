import { Link, Outlet, useLocation } from 'react-router-dom';
import Swal from 'sweetalert2';
import { Users, HeartPulse, UserPlus, PieChart, LogOut } from 'lucide-react';
import { authService } from '../services/api';

export default function Layout() {
    const location = useLocation();

    const isActive = (path: string) => location.pathname === path;

    const handleLogout = () => {
        Swal.fire({
            title: '¿Deseas cerrar sesión?',
            text: "Tendrás que volver a ingresar tus credenciales.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3b82f6',
            cancelButtonColor: '#94a3b8',
            confirmButtonText: 'Sí, salir',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                authService.logout();
            }
        });
    };

    return (
        <div className='flex h-screen bg-gray-100 font-sans'>
            <aside className='w-64 bg-slate-900 text-white flex flex-col'>
                <div className='p-6 flex items-center gap-3 border-b border-slate-700'>
                    <HeartPulse className='text-red-500 w-8 h-8' />
                    <div>
                        <h1 className='font-bold text-lg leading-tight'>
                            Salud Ocupacional
                        </h1>
                        <p className='text-xs text-slate-400'>
                            Alcaldía Puerto Salgar
                        </p>
                    </div>
                </div>

                <nav className='flex-1 p-4 space-y-2'>
                    <Link
                        to='/'
                        className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${isActive('/') ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 text-slate-300'}`}
                    >
                        <PieChart className='w-5 h-5' />
                        <span>Panel Gerencial</span>
                    </Link>
                    <Link
                        to='/directorio'
                        className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${isActive('/directorio') ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 text-slate-300'}`}
                    >
                        <Users className='w-5 h-5' />
                        <span>Directorio Médico</span>
                    </Link>
                    <Link
                        to='/empleados/nuevo'
                        className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${isActive('/empleados/nuevo') ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 text-slate-300'}`}
                    >
                        <UserPlus className='w-5 h-5' />
                        <span>Registrar Personal</span>
                    </Link>
                    <button 
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full p-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors font-medium mt-auto"
                    >
                        <LogOut className="w-5 h-5" />
                        Cerrar Sesión
                    </button>
                </nav>
            </aside>
            <main className='flex-1 overflow-y-auto p-8'>
                <Outlet />
            </main>
        </div>
    );
}