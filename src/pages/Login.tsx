import React, { useEffect, useState } from 'react';
import { Eye, HeartPulse, Lock, User, AlertCircle, LogIn, EyeOff } from 'lucide-react';
import { authService } from '../services/api';

interface LoginProps {
	onLoginSuccess: () => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
	const [verPassword, setVerPassword] = useState(false);
	const [credenciales, setCredenciales] = useState({username: '', password: ''});
	const [error, setError] = useState<string | null>(null);
	const [cargando, setCargando] = useState(false);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setCredenciales({ ...credenciales, [e.target.name]: e.target.value });
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);
		setCargando(true);

		try {
			const data = await authService.login(credenciales);

			localStorage.setItem('token', data.token);
			localStorage.setItem('username', data.username);

			onLoginSuccess();
		} catch (err) {
			setError(
				'Credenciales incorrectas. Verifica tu usuario y contraseña.',
			);
		} finally {
			setCargando(false);
		}
	};

	useEffect(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
    }, []);

	return (
		<div className='min-h-screen bg-slate-900 flex items-center justify-center p-4'>
			<div className='max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden'>
				<div className='bg-slate-50 p-8 text-center border-b border-slate-100'>
					<div className='mx-auto bg-blue-100 w-16 h-16 flex items-center justify-center rounded-full mb-4 ring-4 ring-blue-50'>
						<HeartPulse className='w-8 h-8 text-red-500' />
					</div>
					<h2 className='text-2xl font-bold text-slate-800'>
						Salgar Vital
					</h2>
					<p className='text-sm text-slate-500 mt-1'>
						Portal de Salud Ocupacional
					</p>
				</div>
				<div className='p-8'>
					{error && (
						<div className='mb-6 p-3 bg-red-50 text-red-700 text-sm rounded-lg flex items-center gap-2 border border-red-200'>
							<AlertCircle className='w-5 h-5 flex-shrink-0' />
							<p>{error}</p>
						</div>
					)}
					<form onSubmit={handleSubmit} className='space-y-5'>
						<div className='space-y-1'>
							<label className='text-sm font-semibold text-slate-600'>
								Usuario Funcionario
							</label>
							<div className='relative'>
								<div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
									<User className='h-5 w-5 text-slate-400' />
								</div>
								<input
									required
									type='text'
									name='username'
									value={credenciales.username}
									onChange={handleChange}
									className='pl-10 w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all'
									placeholder='Ej: admin_salud'
								/>
							</div>
						</div>
						<div className='space-y-1'>
							<label className='text-sm font-semibold text-slate-600'>
								Contraseña
							</label>
							<div className='relative'>
								<div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
									<Lock className='h-5 w-5 text-slate-400' />
								</div>
								<input
									required
									type={verPassword ? "text" : "password"}
									name='password'
									value={credenciales.password}
									onChange={handleChange}
									className='pl-10 w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all'
									placeholder='••••••••'
								/>
								<button 
									type="button"
									onClick={() => setVerPassword(!verPassword)}
									className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 transition-colors"
								>
									{verPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
								</button>
							</div>
						</div>

						<button
							type='submit'
							disabled={cargando}
							className='w-full py-3 mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg flex justify-center items-center gap-2 transition-colors disabled:opacity-70'
						>
							{cargando ? (
								'Verificando...'
							) : (
								<>
									<LogIn className='w-5 h-5' /> Iniciar Sesión
								</>
							)}
						</button>
					</form>
				</div>
			</div>
		</div>
	);
}
