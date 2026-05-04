import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Activity, User, ArrowLeft, Save, AlertCircle, HeartPulse, Droplet, Pencil, X, ClipboardList, Plus } from 'lucide-react';
import { empleadoService, saludService } from '../services/api';
import { type Employee, type HealthRecord } from '../types/types';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

export default function PerfilMedico() {
    const { documento } = useParams<{ documento: string }>();
    const navigate = useNavigate();

    const [empleado, setEmpleado] = useState<Employee | null>(null);
    const [historial, setHistorial] = useState<HealthRecord[]>([]);
    const [cargando, setCargando] = useState(true);
    const [guardando, setGuardando] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [registroEditando, setRegistroEditando] = useState<HealthRecord | null>(null);
    const [mostrandoModalNuevaToma, setMostrandoModalNuevaToma] = useState(false);

    const [diagnosticoIA, setDiagnosticoIA] = useState<string | null>(null);
    const [cargandoIA, setCargandoIA] = useState(false);

    const [nuevoRegistro, setNuevoRegistro] = useState({
        sistolica: '',
        diastolica: '',
        pulsacion: '',
        saturacion: '',
        peso: '',
        estatura: '',
    });

    const cargarDatos = async () => {
        if (!documento) return;
        try {
            setCargando(true);
            const empData = await empleadoService.buscarPorDocumento(documento);
            setEmpleado(empData);

            const histData = await saludService.obtenerHistorial(documento);
            setHistorial(histData);
        } catch (err) {
            setError('No se pudo cargar la información del empleado.');
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        cargarDatos();
    }, [documento]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNuevoRegistro({ ...nuevoRegistro, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!documento) return;
        setGuardando(true);
        try {
            const registroParseado: HealthRecord = {
                sistolica: parseInt(nuevoRegistro.sistolica),
                diastolica: parseInt(nuevoRegistro.diastolica),
                pulsacion: parseInt(nuevoRegistro.pulsacion),
                saturacion: parseInt(nuevoRegistro.saturacion),
                peso: parseFloat(nuevoRegistro.peso),
                estatura: parseFloat(nuevoRegistro.estatura),
            };

            await saludService.registrarToma(documento, registroParseado);

            setNuevoRegistro({
                sistolica: '', diastolica: '', pulsacion: '', saturacion: '', peso: '', estatura: '',
            });
            await cargarDatos();
        } catch (err) {
            setError('Error al guardar el registro médico.');
        } finally {
            setGuardando(false);
        }
    };

    const handleActualizarRegistro = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!registroEditando || !registroEditando.id || !documento) return;
        try {
            await saludService.actualizarToma(documento, registroEditando.id, registroEditando);
            setRegistroEditando(null);
            await cargarDatos();
        } catch (err) {
            alert('Error al actualizar el registro médico.');
        }
    };

    const handleGenerarDiagnostico = async () => {
        if (!documento) return;
        setCargandoIA(true);
        try {
            const analisis = await empleadoService.obtenerDiagnosticoIA(documento);
            setDiagnosticoIA(analisis);
        } catch (error) {
            alert("No se pudo contactar al Asistente IA.");
        } finally {
            setCargandoIA(false);
        }
    };

    if (cargando) return <div className='p-8 text-slate-500'>Cargando perfil médico...</div>;
    if (!empleado) return <div className='p-8 text-red-500'>Empleado no encontrado.</div>;

    const ultimoPeso = historial.length > 0 ? historial[historial.length - 1].peso : '--';
    const ultimaEstatura = historial.length > 0 ? historial[historial.length - 1].estatura : '--';

    return (
        <div className='max-w-6xl mx-auto space-y-6'>
            <div className='flex items-center justify-between mb-2'>
                <div className='flex items-center gap-4'>
                    <button onClick={() => navigate(-1)} className='cursor-pointer p-2 hover:bg-slate-200 rounded-full transition-colors'>
                        <ArrowLeft className='w-5 h-5 text-slate-600' />
                    </button>
                    <h2 className='text-2xl font-bold text-slate-800'>Expediente Médico</h2>
                </div>
                <div className='flex items-center gap-3'>
                    <button onClick={() => window.print()} className='cursor-pointer px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg flex items-center gap-2 transition-colors text-sm border border-slate-200'>
                        Exportar
                    </button>
                    <button onClick={() => setMostrandoModalNuevaToma(true)} className='cursor-pointer px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg flex items-center gap-2 transition-colors text-sm shadow-sm'>
                        <Plus className="w-4 h-4" /> Nueva Toma
                    </button>
                </div>
            </div>

            {error && (
                <div className='p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-2 border border-red-200'>
                    <AlertCircle className='w-5 h-5' /> {error}
                </div>
            )}

            <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
                <div className='lg:col-span-1 space-y-6'>
                    <div className='bg-white p-6 rounded-xl shadow-sm border border-slate-200'>
                        <div className='flex items-start gap-3 mb-4'>
                            <div className='bg-blue-100 p-3 rounded-full text-blue-600 mt-1 shrink-0'>
                                <User className='w-6 h-6' />
                            </div>
                            <div>
                                <h3 className='font-bold text-lg text-slate-800 leading-tight'>
                                    {empleado.nombres} {empleado.apellidos}
                                </h3>
                                <p className='text-sm text-slate-500 mb-2'>
                                    C.C. {empleado.numeroDocumento}
                                </p>
                                <div className='flex flex-wrap gap-2 items-center'>
                                    <div className="flex items-center gap-1 bg-red-50 text-red-700 px-2 py-1 rounded-md text-xs font-bold border border-red-200">
                                        <Droplet className="w-3.5 h-3.5 fill-red-500" />
                                        <span>RH: {empleado.rh ? empleado.rh.replace('_', ' ') : 'N/A'}</span>
                                    </div>
                                    <div className="flex items-center gap-1 bg-purple-50 text-purple-700 px-2 py-1 rounded-md text-xs font-bold border border-purple-200">
                                        <User className="w-3.5 h-3.5" />
                                        <span>{empleado.genero || 'N/A'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className='space-y-2 text-sm border-t border-slate-100 pt-4 mt-2'>
                            <p><span className='font-semibold text-slate-600'>Cargo:</span> {empleado.cargo}</p>
                            <p><span className='font-semibold text-slate-600'>Dependencia:</span> {empleado.dependencia}</p>
                            <p><span className='font-semibold text-slate-600'>Edad:</span> {empleado.edadActual} años</p>
                            <p><span className="font-semibold text-slate-600">Peso Actual:</span> {ultimoPeso} kg</p>
                            <p><span className="font-semibold text-slate-600">Estatura Actual:</span> {ultimaEstatura} m</p>
                        </div>
                    </div>
                    <div className='bg-white p-6 rounded-xl shadow-sm border border-slate-200'>
                        <div className='flex items-center gap-2 mb-4 text-slate-800 font-bold border-b pb-2'>
                            <ClipboardList className='w-5 h-5 text-blue-500' />
                            <h3>Antecedentes Clínicos</h3>
                        </div>
                        
                        <div className='space-y-4 text-sm'>
                            <div>
                                <span className='font-semibold text-slate-600'>Enfermedades Padecidas</span>
                                <p className='text-slate-800 bg-slate-50 p-2 rounded border border-slate-100 mt-1'>
                                    {empleado.enfermedadesPadecidas || 'No registra.'}
                                </p>
                            </div>
                            <div>
                                <span className='font-semibold text-slate-600'>Alergias</span>
                                <p className='text-slate-800 bg-slate-50 p-2 rounded border border-slate-100 mt-1'>
                                    {empleado.alergias || 'No registra.'}
                                </p>
                            </div>
                            <div>
                                <span className='font-semibold text-slate-600'>Cirugías / Operaciones</span>
                                <p className='text-slate-800 bg-slate-50 p-2 rounded border border-slate-100 mt-1'>
                                    {empleado.operaciones || 'No registra.'}
                                </p>
                            </div>
                            <div>
                                <span className='font-semibold text-slate-600'>Herencia Familiar</span>
                                <p className='text-slate-800 bg-slate-50 p-2 rounded border border-slate-100 mt-1'>
                                    {empleado.herenciaFamiliar || 'No registra.'}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className='bg-linear-to from-indigo-50 to-purple-50 p-6 rounded-xl shadow-sm border border-indigo-100 mt-6'>
                        <div className='flex justify-between items-center mb-4'>
                            <h3 className='font-bold text-indigo-900 flex items-center gap-2'>
                                <span className="text-xl">✨</span> Asistente Médico IA
                            </h3>
                        </div>
                        
                        {!diagnosticoIA ? (
                            <button 
                                onClick={handleGenerarDiagnostico}
                                disabled={cargandoIA || historial.length === 0}
                                className='cursor-pointer w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 text-sm'
                            >
                                {cargandoIA ? 'Analizando expediente...' : 'Generar Recomendaciones'}
                            </button>
                        ) : (
                            <div className='space-y-3'>
                                <div className='text-sm text-indigo-900 leading-relaxed whitespace-pre-wrap bg-white/70 p-4 rounded-lg border border-indigo-200 shadow-inner'>
                                    {diagnosticoIA.replace(/\*\*/g, '') /* Quitamos los asteriscos de Markdown por limpieza */}
                                </div>
                                <button 
                                    onClick={() => setDiagnosticoIA(null)}
                                    className='cursor-pointer text-xs font-bold text-indigo-600 hover:text-indigo-800'
                                >
                                    Ocultar análisis
                                </button>
                            </div>
                        )}
                        {historial.length === 0 && (
                            <p className="text-xs text-indigo-400 mt-2 text-center">Requiere al menos una toma médica.</p>
                        )}
                    </div>
                </div>
                <div className='lg:col-span-2 space-y-6'>
                    <div className='bg-white p-6 rounded-xl shadow-sm border border-slate-200 min-h-125]'>
                        <div className='flex items-center gap-2 mb-6 border-b pb-2'>
                            <HeartPulse className='w-5 h-5 text-red-500' />
                            <h3 className='font-bold text-slate-800'>Historial de Evaluaciones</h3>
                        </div>

                        {historial.length === 0 ? (
                            <div className='text-center py-10 text-slate-500'>
                                No hay registros médicos para este empleado aún.
                            </div>
                        ) : (
                            <div className='space-y-4'>
                                {[...historial].reverse().map((registro, idx) => (
                                    <div key={idx} className='p-4 border border-slate-100 bg-slate-50 rounded-lg flex flex-col md:flex-row justify-between gap-4'>
                                        <div>
                                            <div className='text-xs text-slate-500 mb-1'>
                                                {new Date(registro.fechaToma!).toLocaleString()}
                                            </div>
                                            <div className='flex gap-4 text-sm font-medium text-slate-700'>
                                                <span>
                                                    Tensión: <strong className={registro.sistolica >= 140 || registro.diastolica >= 90 ? 'text-red-600' : 'text-slate-800'}>
                                                        {registro.sistolica}/{registro.diastolica}
                                                    </strong>
                                                </span>
                                                <span>Pulso: <strong>{registro.pulsacion}</strong></span>
                                                <span>SpO2: <strong>{registro.saturacion}%</strong></span>
                                            </div>
                                        </div>
                                        <div className='flex flex-row items-center gap-4 text-sm w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-2 md:pt-0 border-slate-200'>
                                            <div className="text-right">
                                                <div>IMC: <strong>{registro.imc}</strong></div>
                                                <div className={`font-semibold ${registro.clasificacionImc === 'Normal' ? 'text-green-600' : 'text-orange-600'}`}>
                                                    {registro.clasificacionImc}
                                                </div>
                                            </div>
                                            <button onClick={() => setRegistroEditando(registro)} className="cursor-pointer p-2 text-amber-600 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors border border-amber-200" title="Corregir datos de esta toma">
                                                <Pencil className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        {historial.length > 1 ? (
                            <div className='mb-8 mt-6 p-6 pb-12 border border-slate-100 rounded-xl bg-white shadow-sm h-80'>
                                <h4 className='text-sm font-bold text-slate-500 mb-4 uppercase tracking-wider text-center'>
                                    Evolución de Tensión y Pulso
                                </h4>
                                <ResponsiveContainer width='100%' height='100%'>
                                    <LineChart
                                        data={[...historial].map((reg) => ({
                                            fecha: new Date(reg.fechaToma!).toLocaleDateString('es-CO', { day: '2-digit', month: 'short' }),
                                            Sistolica: reg.sistolica,
                                            Diastolica: reg.diastolica,
                                            Pulso: reg.pulsacion,
                                        }))}
                                        margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                                    >
                                        <CartesianGrid strokeDasharray='3 3' stroke='#f1f5f9' vertical={false} />
                                        <XAxis dataKey='fecha' stroke='#94a3b8' fontSize={12} tickLine={false} axisLine={false} />
                                        <YAxis stroke='#94a3b8' fontSize={12} tickLine={false} axisLine={false} />
                                        <Tooltip contentStyle={{ borderRadius: '0.75rem', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '14px' }} />
                                        <Legend iconType='circle' wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                                        <Line type='monotone' name='Sistólica' dataKey='Sistolica' stroke='#ef4444' strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                                        <Line type='monotone' name='Diastólica' dataKey='Diastolica' stroke='#3b82f6' strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                                        <Line type='monotone' name='F. Cardíaca' dataKey='Pulso' stroke='#10b981' strokeWidth={2} strokeDasharray='5 5' dot={false} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            historial.length === 1 && (
                                <div className='mb-8 p-4 bg-blue-50 text-blue-700 text-sm rounded-lg border border-blue-100 flex items-center justify-center'>
                                    La gráfica aparecerá cuando haya al menos 2 registros médicos para comparar la evolución.
                                </div>
                            )
                        )}
                    </div>
                </div>
            </div>
            {mostrandoModalNuevaToma && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
                        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <Activity className="w-5 h-5 text-emerald-600" />
                                Registrar Nueva Toma
                            </h3>
                            <button onClick={() => setMostrandoModalNuevaToma(false)} className="cursor-pointer text-slate-400 hover:text-slate-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className='p-6 space-y-4'>
                            <div className='grid grid-cols-2 gap-4'>
                                <div>
                                    <label className='text-sm font-semibold text-slate-600'>Sistólica (mmHg)</label>
                                    <input required type='number' name='sistolica' value={nuevoRegistro.sistolica} onChange={handleChange} className='w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-sm outline-none' placeholder='Ej: 120' />
                                </div>
                                <div>
                                    <label className='text-sm font-semibold text-slate-600'>Diastólica (mmHg)</label>
                                    <input required type='number' name='diastolica' value={nuevoRegistro.diastolica} onChange={handleChange} className='w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-sm outline-none' placeholder='Ej: 80' />
                                </div>
                                <div>
                                    <label className='text-sm font-semibold text-slate-600'>Pulso (lpm)</label>
                                    <input required type='number' name='pulsacion' value={nuevoRegistro.pulsacion} onChange={handleChange} className='w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-sm outline-none' placeholder='Ej: 75' />
                                </div>
                                <div>
                                    <label className='text-sm font-semibold text-slate-600'>SpO2 (%)</label>
                                    <input required type='number' name='saturacion' value={nuevoRegistro.saturacion} onChange={handleChange} className='w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-sm outline-none' placeholder='Ej: 98' />
                                </div>
                                <div>
                                    <label className='text-sm font-semibold text-slate-600'>Peso (kg)</label>
                                    <input required type='number' step='0.1' name='peso' value={nuevoRegistro.peso} onChange={handleChange} className='w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-sm outline-none' placeholder='Ej: 70.5' />
                                </div>
                                <div>
                                    <label className='text-sm font-semibold text-slate-600'>Altura (m)</label>
                                    <input required type='number' step='0.01' name='estatura' value={nuevoRegistro.estatura} onChange={handleChange} className='w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-sm outline-none' placeholder='Ej: 1.75' />
                                </div>
                            </div>
                            <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 mt-6">
                                <button type="button" onClick={() => setMostrandoModalNuevaToma(false)} className="cursor-pointer px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors text-sm">
                                    Cancelar
                                </button>
                                <button type='submit' disabled={guardando} className='cursor-pointer px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-colors text-sm flex items-center gap-2 disabled:opacity-50'>
                                    <Save className='w-4 h-4' /> {guardando ? 'Guardando...' : 'Guardar Registro'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {registroEditando && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
                        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <Pencil className="w-5 h-5 text-amber-500" />
                                Corregir Registro Médico
                            </h3>
                            <button onClick={() => setRegistroEditando(null)} className="cursor-pointer text-slate-400 hover:text-slate-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <form onSubmit={handleActualizarRegistro} className='p-6 space-y-4'>
                            <div className="bg-amber-50 text-amber-700 p-3 rounded-lg text-sm mb-4 border border-amber-200">
                                Estás modificando la toma del: <strong>{new Date(registroEditando.fechaToma!).toLocaleString()}</strong>
                            </div>
                            <div className='grid grid-cols-2 gap-4'>
                                <div>
                                    <label className='text-sm font-semibold text-slate-600'>Sistólica</label>
                                    <input required type='number' value={registroEditando.sistolica} onChange={(e) => setRegistroEditando({...registroEditando, sistolica: parseInt(e.target.value)})} className='w-full p-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-amber-500 text-sm' />
                                </div>
                                <div>
                                    <label className='text-sm font-semibold text-slate-600'>Diastólica</label>
                                    <input required type='number' value={registroEditando.diastolica} onChange={(e) => setRegistroEditando({...registroEditando, diastolica: parseInt(e.target.value)})} className='w-full p-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-amber-500 text-sm' />
                                </div>
                                <div>
                                    <label className='text-sm font-semibold text-slate-600'>Pulso (lpm)</label>
                                    <input required type='number' value={registroEditando.pulsacion} onChange={(e) => setRegistroEditando({...registroEditando, pulsacion: parseInt(e.target.value)})} className='w-full p-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-amber-500 text-sm' />
                                </div>
                                <div>
                                    <label className='text-sm font-semibold text-slate-600'>SpO2 (%)</label>
                                    <input required type='number' value={registroEditando.saturacion} onChange={(e) => setRegistroEditando({...registroEditando, saturacion: parseInt(e.target.value)})} className='w-full p-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-amber-500 text-sm' />
                                </div>
                                <div>
                                    <label className='text-sm font-semibold text-slate-600'>Peso (kg)</label>
                                    <input required type='number' step='0.1' value={registroEditando.peso} onChange={(e) => setRegistroEditando({...registroEditando, peso: parseFloat(e.target.value)})} className='w-full p-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-amber-500 text-sm' />
                                </div>
                                <div>
                                    <label className='text-sm font-semibold text-slate-600'>Estatura (m)</label>
                                    <input required type='number' step='0.01' value={registroEditando.estatura} onChange={(e) => setRegistroEditando({...registroEditando, estatura: parseFloat(e.target.value)})} className='w-full p-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-amber-500 text-sm' />
                                </div>
                            </div>
                            <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 mt-6">
                                <button type="button" onClick={() => setRegistroEditando(null)} className="cursor-pointer px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors text-sm">Cancelar</button>
                                <button type="submit" className="cursor-pointer px-4 py-2 bg-amber-500 text-white font-bold rounded-lg hover:bg-amber-600 transition-colors text-sm flex items-center gap-2">
                                    <Save className="w-4 h-4" /> Guardar Cambios
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}