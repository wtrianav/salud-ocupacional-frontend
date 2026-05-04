import React, { useState } from 'react';
import { Save, UserPlus, AlertCircle, CheckCircle2 } from 'lucide-react';
import { empleadoService } from '../services/api';
import { type Employee } from '../types/types';

export default function Empleados() {
	const [formData, setFormData] = useState<Employee>({
		numeroDocumento: '',
		nombres: '',
		apellidos: '',
		fechaNacimiento: '',
		cargo: '',
		dependencia: '',
		rh: '',
	});

	const [loading, setLoading] = useState(false);
	const [mensaje, setMensaje] = useState<{
		tipo: 'exito' | 'error';
		texto: string;
	} | null>(null);

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
	) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setMensaje(null);

		try {
			const empleadoGuardado = await empleadoService.registrar(formData);

			setMensaje({
				tipo: 'exito',
				texto: `¡Empleado ${empleadoGuardado.nombres} guardado correctamente con ID: ${empleadoGuardado.id}!`,
			});

			setFormData({
				numeroDocumento: '',
				nombres: '',
				apellidos: '',
				fechaNacimiento: '',
				cargo: '',
				dependencia: '',
				rh: '',
			});
		} catch (error: any) {
			setMensaje({
				tipo: 'error',
				texto:
					error.response?.data?.message ||
					'Error al guardar el empleado. Verifica que el documento no exista ya.',
			});
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className='max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-slate-200'>
			<div className='flex items-center gap-3 mb-6 border-b pb-4'>
				<UserPlus className='text-blue-600 w-6 h-6' />
				<h2 className='text-2xl font-bold text-slate-800'>
					Registrar Nuevo Empleado
				</h2>
			</div>

			{mensaje && (
				<div
					className={`p-4 rounded-lg mb-6 flex items-center gap-2 ${mensaje.tipo === 'exito' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}
				>
					{mensaje.tipo === 'exito' ? (
						<CheckCircle2 className='w-5 h-5' />
					) : (
						<AlertCircle className='w-5 h-5' />
					)}
					{mensaje.texto}
				</div>
			)}

			<form
				onSubmit={handleSubmit}
				className='grid grid-cols-1 md:grid-cols-2 gap-6'
			>
				<div className='space-y-2'>
					<label className='text-sm font-semibold text-slate-600'>
						Número de Documento
					</label>
					<input
						required
						type='text'
						name='numeroDocumento'
						value={formData.numeroDocumento}
						onChange={handleChange}
						className='w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none'
						placeholder='Ej: 1054321876'
					/>
				</div>

				<div className='space-y-2'>
					<label className='text-sm font-semibold text-slate-600'>
						Fecha de Nacimiento
					</label>
					<input
						required
						type='date'
						name='fechaNacimiento'
						value={formData.fechaNacimiento}
						onChange={handleChange}
						className='w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none'
					/>
				</div>

				<div className='space-y-2'>
					<label className='text-sm font-semibold text-slate-600'>
						Nombres
					</label>
					<input
						required
						type='text'
						name='nombres'
						value={formData.nombres}
						onChange={handleChange}
						className='w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none'
					/>
				</div>

				<div className='space-y-2'>
					<label className='text-sm font-semibold text-slate-600'>
						Apellidos
					</label>
					<input
						required
						type='text'
						name='apellidos'
						value={formData.apellidos}
						onChange={handleChange}
						className='w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none'
					/>
				</div>

				<div className='space-y-2'>
					<label className='text-sm font-semibold text-slate-600'>
						Cargo
					</label>
					<input
						required
						type='text'
						name='cargo'
						value={formData.cargo}
						onChange={handleChange}
						className='w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none'
						placeholder='Ej: Inspector'
					/>
				</div>
				<div>
					<label className='text-sm font-semibold text-slate-600'>Tipo de Sangre (RH)</label>
					<select
						name='rh'
						value={formData.rh} 
						onChange={handleChange}
						className='w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none'
					>
						<option value="">Seleccione una opción...</option>
						<option value="O_POSITIVO">O Positivo (O+)</option>
						<option value="O_NEGATIVO">O Negativo (O-)</option>
						<option value="A_POSITIVO">A Positivo (A+)</option>
						<option value="A_NEGATIVO">A Negativo (A-)</option>
						<option value="B_POSITIVO">B Positivo (B+)</option>
						<option value="B_NEGATIVO">B Negativo (B-)</option>
						<option value="AB_POSITIVO">AB Positivo (AB+)</option>
						<option value="AB_NEGATIVO">AB Negativo (AB-)</option>
					</select>
				</div>
				<div className='space-y-2'>
					<label className='text-sm font-semibold text-slate-600'>
						Dependencia
					</label>
					<select
						required
						name='dependencia'
						value={formData.dependencia}
						onChange={handleChange}
						className='w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none'
					>
						<option value=''>Seleccione una opción...</option>
						<option value='Secretaría de General y de Gobierno'>
							Secretaría de General y de Gobierno
						</option>
						<option value='Secretaría de Infraestructura y Obras Públicas'>
							Secretaría de Infraestructura y Obras Públicas
						</option>
						<option value='Secretaría de Desarrollo Económico y Social'>
							Secretaría de Desarrollo Económico y Social
						</option>
						<option value='Secretaría de Hacienda Y Finanzas Públicas'>
							Secretaría de Hacienda Y Finanzas Públicas
						</option>
					</select>
				</div>

				<div className='md:col-span-2 pt-4'>
					<button
						type='submit'
						disabled={loading}
						className='w-full md:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50'
					>
						<Save className='w-5 h-5' />
						{loading
							? 'Guardando en Base de Datos...'
							: 'Guardar Empleado'}
					</button>
				</div>
			</form>
		</div>
	);
}
