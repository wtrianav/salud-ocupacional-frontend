import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import toast from 'react-hot-toast';
import { Users, Search, HeartPulse, Trash2, Pencil, X, ChevronLeft, ChevronRight, Calendar, Download, Activity } from 'lucide-react';
import { empleadoService, exportacionService } from '../services/api';
import { type Employee } from '../types/types';
import { Link } from 'react-router-dom';

function PanelReportesGenerales() {
    const [fechaInicio, setFechaInicio] = useState('');
    const [fechaFin, setFechaFin] = useState('');
    const [descargando, setDescargando] = useState(false);

    const handleGenerarReporte = async () => {
        if (!fechaInicio || !fechaFin) {
            alert("Por favor selecciona ambas fechas");
            return;
        }
        if (new Date(fechaInicio) > new Date(fechaFin)) {
            alert("La fecha de inicio no puede ser mayor a la fecha de fin");
            return;
        }

        setDescargando(true);
        await exportacionService.descargarReporteRango(fechaInicio, fechaFin);
        setDescargando(false);
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
                <Calendar className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-slate-800 text-lg">Exportar Consolidado General</h3>
            </div>
            
            <p className="text-sm text-slate-500 mb-4">
                Genera un reporte en Excel con todas las tomas médicas de todos los empleados en un periodo específico.
            </p>

            <div className="flex flex-col md:flex-row items-end gap-4">
                <div className="flex flex-col w-full md:w-auto">
                    <label className="text-xs font-semibold text-slate-600 mb-1">Fecha Inicio</label>
                    <input 
                        type="date" 
                        value={fechaInicio}
                        onChange={(e) => setFechaInicio(e.target.value)}
                        className="p-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                </div>
                <div className="flex flex-col w-full md:w-auto">
                    <label className="text-xs font-semibold text-slate-600 mb-1">Fecha Fin</label>
                    <input 
                        type="date" 
                        value={fechaFin}
                        onChange={(e) => setFechaFin(e.target.value)}
                        className="p-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                </div>
                
                <button 
                    onClick={handleGenerarReporte}
                    disabled={descargando || !fechaInicio || !fechaFin}
                    className="cursor-pointer w-full md:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-colors text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {descargando ? (
                        <><Activity className="w-4 h-4 animate-spin" /> Procesando...</>
                    ) : (
                        <><Download className="w-4 h-4" /> Exportar Reporte</>
                    )}
                </button>
            </div>
        </div>
    );
}

export default function ListaEmpleados() {
    const [empleados, setEmpleados] = useState<Employee[]>([]);
    const [cargando, setCargando] = useState(true);
    const [busqueda, setBusqueda] = useState('');
    const [empleadoEditando, setEmpleadoEditando] = useState<Employee | null>(null);

    const [paginaActual, setPaginaActual] = useState(1);
    const empleadosPorPagina = 10;

    const cargarEmpleados = async () => {
        try {
            const data = await empleadoService.obtenerTodos();
            setEmpleados(data);
        } catch (error) {
            console.error('Error cargando empleados', error);
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        cargarEmpleados();
    }, []);

    useEffect(() => {
        setPaginaActual(1);
    }, [busqueda]);

    const handleEliminar = async (id: number, nombre: string) => {
        const result = await Swal.fire({
            title: '¿Estás completamente seguro?',
            text: `Vas a eliminar a ${nombre} y todo su historial médico. Esta acción no se puede deshacer.`,
            icon: 'error',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#94a3b8',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            try {
                await empleadoService.eliminar(id);
                setEmpleados(empleados.filter((emp) => emp.id !== id));
                toast.success(`El empleado ${nombre} fue eliminado.`);
            } catch (error) {
                toast.error('Hubo un error al intentar eliminar el registro.');
            }
        }
    };

    const handleGuardarEdicion = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!empleadoEditando || !empleadoEditando.id) return;

        try {
            await empleadoService.actualizar(
                empleadoEditando.id,
                empleadoEditando,
            );
            setEmpleadoEditando(null);
            cargarEmpleados();
            toast.success('Datos actualizados correctamente');
        } catch (error) {
            toast.error('Error al actualizar los datos.');
        }
    };

    const empleadosFiltrados = empleados.filter(
        (emp) =>
            emp.numeroDocumento.includes(busqueda) ||
            emp.nombres.toLowerCase().includes(busqueda.toLowerCase()) ||
            emp.apellidos.toLowerCase().includes(busqueda.toLowerCase()),
    );

    const indiceUltimoEmpleado = paginaActual * empleadosPorPagina;
    const indicePrimerEmpleado = indiceUltimoEmpleado - empleadosPorPagina;
    const empleadosActuales = empleadosFiltrados.slice(indicePrimerEmpleado, indiceUltimoEmpleado);
    const totalPaginas = Math.ceil(empleadosFiltrados.length / empleadosPorPagina);

    const paginaSiguiente = () => {
        if (paginaActual < totalPaginas) setPaginaActual(paginaActual + 1);
    };

    const paginaAnterior = () => {
        if (paginaActual > 1) setPaginaActual(paginaActual - 1);
    };

    if (cargando)
        return (
            <div className='p-8 text-center text-slate-500 font-medium'>
                Cargando directorio...
            </div>
        );

    return (
        <div className='max-w-6xl mx-auto space-y-6'>
            <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4'>
                <div>
                    <h2 className='text-2xl font-bold text-slate-800 flex items-center gap-2'>
                        <Users className='text-blue-600' />
                        Directorio de Personal
                    </h2>
                    <p className='text-slate-500 text-sm mt-1'>
                        Gestiona los funcionarios y accede a sus perfiles
                        médicos
                    </p>
                </div>

                <div className='flex items-center gap-4 w-full md:w-auto'>
                    <div className='relative w-full md:w-72'>
                        <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                            <Search className='h-5 w-5 text-slate-400' />
                        </div>
                        <input
                            type='text'
                            className='pl-10 w-full p-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none shadow-sm transition-all text-sm'
                            placeholder='Buscar por nombre o cédula...'
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <PanelReportesGenerales />

            <div className='bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col'>
                <div className='overflow-x-auto'>
                    <table className='w-full text-left border-collapse'>
                        <thead>
                            <tr className='bg-slate-50 border-b border-slate-200 text-slate-500 text-sm'>
                                <th className='p-4 font-semibold'>Documento</th>
                                <th className='p-4 font-semibold'>
                                    Funcionario
                                </th>
                                <th className='p-4 font-semibold'>
                                    Dependencia
                                </th>
                                <th className='p-4 font-semibold'>Cargo</th>
                                <th className='p-4 font-semibold text-center'>
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody className='divide-y divide-slate-100'>
                            {empleadosActuales.map((empleado) => (
                                <tr
                                    key={empleado.id}
                                    className='hover:bg-slate-50 transition-colors group'
                                >
                                    <td className='p-4 text-sm font-medium text-slate-600'>
                                        {empleado.numeroDocumento}
                                    </td>
                                    <td className='p-4'>
                                        <div className='font-semibold text-slate-800'>
                                            {empleado.nombres}{' '}
                                            {empleado.apellidos}
                                        </div>
                                        <div className='text-xs text-slate-500'>
                                            {empleado.edadActual} años
                                        </div>
                                    </td>
                                    <td className='p-4 text-sm text-slate-600'>
                                        {empleado.dependencia}
                                    </td>
                                    <td className='p-4 text-sm text-slate-600'>
                                        {empleado.cargo}
                                    </td>
                                    <td className='p-4 flex items-center justify-center gap-2'>
                                        <Link
                                            to={`/salud/${empleado.numeroDocumento}`}
                                            className='p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors'
                                            title='Historia Clínica'
                                        >
                                            <HeartPulse className='w-5 h-5' />
                                        </Link>
                                        <button
                                            onClick={() =>setEmpleadoEditando(empleado)}
                                            className='cursor-pointer p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors'
                                            title='Editar Datos'
                                        >
                                            <Pencil className='w-5 h-5' />
                                        </button>
                                        <button
                                            onClick={() =>handleEliminar(empleado.id!, empleado.nombres,)}
                                            className='cursor-pointer p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors'
                                            title='Eliminar Personal'
                                        >
                                            <Trash2 className='w-5 h-5' />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {empleadosFiltrados.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={5}
                                        className='p-8 text-center text-slate-500'
                                    >
                                        No se encontraron funcionarios.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {empleadosFiltrados.length > 0 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50 mt-auto">
                        <div className="text-sm text-slate-500">
                            Mostrando <span className="font-semibold text-slate-700">{indicePrimerEmpleado + 1}</span> a <span className="font-semibold text-slate-700">{Math.min(indiceUltimoEmpleado, empleadosFiltrados.length)}</span> de <span className="font-semibold text-slate-700">{empleadosFiltrados.length}</span> funcionarios
                        </div>
                        <div className="flex items-center gap-2">
                            <button 
                                onClick={paginaAnterior}
                                disabled={paginaActual === 1}
                                className="cursor-pointer p-2 rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <span className="text-sm font-medium text-slate-700 px-2">
                                {paginaActual} / {totalPaginas}
                            </span>
                            <button 
                                onClick={paginaSiguiente}
                                disabled={paginaActual === totalPaginas}
                                className="cursor-pointer p-2 rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
            {empleadoEditando && (
                <div className='fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50'>
                    <div className='bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden'>
                        <div className='pt-6 px-6 border-b border-slate-100 flex justify-between items-center bg-slate-50'>
                            <h3 className='text-lg font-bold text-slate-800 flex items-center gap-2'>
                                <Pencil className='w-5 h-5 text-amber-500' />
                                Editar Datos de Funcionario
                            </h3>
                            <button
                                onClick={() => setEmpleadoEditando(null)}
                                className='cursor-pointer text-slate-400 hover:text-slate-600'
                            >
                                <X className='w-6 h-6' />
                            </button>
                        </div>

                        <form
                            onSubmit={handleGuardarEdicion}
                            className='p-6 space-y-4'
                        >
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                <div>
                                    <label className='block text-sm font-semibold text-slate-600 mb-1'>
                                        Nombres
                                    </label>
                                    <input
                                        required
                                        type='text'
                                        value={empleadoEditando.nombres}
                                        onChange={(e) =>
                                            setEmpleadoEditando({
                                                ...empleadoEditando,
                                                nombres: e.target.value,
                                            })
                                        }
                                        className='w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none'
                                    />
                                </div>
                                <div>
                                    <label className='block text-sm font-semibold text-slate-600 mb-1'>
                                        Apellidos
                                    </label>
                                    <input
                                        required
                                        type='text'
                                        value={empleadoEditando.apellidos}
                                        onChange={(e) =>
                                            setEmpleadoEditando({
                                                ...empleadoEditando,
                                                apellidos: e.target.value,
                                            })
                                        }
                                        className='w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none'
                                    />
                                </div>
                                <div>
                                    <label className='block text-sm font-semibold text-slate-600 mb-1'>
                                        Cargo
                                    </label>
                                    <input
                                        required
                                        type='text'
                                        value={empleadoEditando.cargo}
                                        onChange={(e) =>
                                            setEmpleadoEditando({
                                                ...empleadoEditando,
                                                cargo: e.target.value,
                                            })
                                        }
                                        className='w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none'
                                    />
                                </div>
                                <div>
                                    <label className='block text-sm font-semibold text-slate-600 mb-1'>
                                        Dependencia
                                    </label>
                                    <select
                                        required
                                        value={empleadoEditando.dependencia}
                                        onChange={(e) =>
                                            setEmpleadoEditando({
                                                ...empleadoEditando,
                                                dependencia: e.target.value,
                                            })
                                        }
                                        className='w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white'
                                    >
                                        <option value='Secretaría General y de Gobierno'>
                                            Secretaría General y de Gobierno 
                                        </option>
                                        <option value='Secretaría de Desarrollo Económico y Social'>
                                            Secretaría de Desarrollo Económico y Social
                                        </option>
                                        <option value='Secretaría de Infraestructura y Obras Públicas'>
                                            Secretaría de Infraestructura y Obras Públicas
                                        </option>
                                        <option value='Secretaría de Hacienda Y Finanzas Públicas'>
                                            Secretaría de Hacienda Y Finanzas Públicas
                                        </option>
                                    </select>
                                </div>
                                <div>
                                    <label className='block text-sm font-semibold text-slate-600 mb-1'>
                                        Fecha de Nacimiento
                                    </label>
                                    <input
                                        required
                                        type='date'
                                        value={empleadoEditando.fechaNacimiento.toString()}
                                        onChange={(e) =>
                                            setEmpleadoEditando({
                                                ...empleadoEditando,
                                                fechaNacimiento: e.target
                                                    .value as any,
                                            })
                                        }
                                        className='w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none'
                                    />
                                </div>
                                <div>
                                    <label className='block text-sm font-semibold text-slate-600 mb-1'>Género</label>
                                    <select required value={empleadoEditando.genero || ''} onChange={(e) => setEmpleadoEditando({...empleadoEditando, genero: e.target.value})} className='w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white'>
                                        <option value=''>Seleccione...</option>
                                        <option value='MASCULINO'>Masculino</option>
                                        <option value='FEMENINO'>Femenino</option>
                                        <option value='OTRO'>Otro</option>
                                    </select>
                                </div>
                            </div>
                            <div className="col-span-1 md:col-span-2 pt-4 mt-2 border-t border-slate-100">
                                <h4 className="font-bold text-slate-700 mb-3">Antecedentes Médicos</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className='block text-sm font-semibold text-slate-600 mb-1'>Enfermedades Padecidas</label>
                                        <textarea rows={2} value={empleadoEditando.enfermedadesPadecidas || ''} onChange={(e) => setEmpleadoEditando({...empleadoEditando, enfermedadesPadecidas: e.target.value})} placeholder="Ej: Asma, Hipertensión..." className='w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none' />
                                    </div>
                                    <div>
                                        <label className='block text-sm font-semibold text-slate-600 mb-1'>Alergias (Medicamentos/Otros)</label>
                                        <textarea rows={2} value={empleadoEditando.alergias || ''} onChange={(e) => setEmpleadoEditando({...empleadoEditando, alergias: e.target.value})} placeholder="Ej: Penicilina, Polvo, Ninguna..." className='w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none' />
                                    </div>
                                    <div>
                                        <label className='block text-sm font-semibold text-slate-600 mb-1'>Cirugías / Operaciones previas</label>
                                        <textarea rows={2} value={empleadoEditando.operaciones || ''} onChange={(e) => setEmpleadoEditando({...empleadoEditando, operaciones: e.target.value})} placeholder="Ej: Apendicectomía (2015), Ninguna..." className='w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none' />
                                    </div>
                                    <div>
                                        <label className='block text-sm font-semibold text-slate-600 mb-1'>Herencia Familiar</label>
                                        <textarea rows={2} value={empleadoEditando.herenciaFamiliar || ''} onChange={(e) => setEmpleadoEditando({...empleadoEditando, herenciaFamiliar: e.target.value})} placeholder="Ej: Madre diabética, Padre con antecedente cardíaco..." className='w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none' />
                                    </div>
                                </div>
                            </div>

                            <div className='flex justify-end gap-3 border-t border-slate-100'>
                                <button
                                    type='button'
                                    onClick={() => setEmpleadoEditando(null)}
                                    className='cursor-pointer px-5 py-2.5 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors'
                                >
                                    Cancelar
                                </button>
                                <button
                                    type='submit'
                                    className='cursor-pointer px-5 py-2.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors'
                                >
                                    Guardar Cambios
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}