import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {Users, Activity, HeartPulse, Wind, AlertTriangle, CheckCircle, X, ArrowRight} from 'lucide-react';
import { dashboardService } from '../services/api';
import { type Employee, type HealthRecord } from '../types/types';
import { analizarSignosVitales } from '../utils/analizadorMedico';
import {BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend} from 'recharts';

const COLORES_IMC = {
    Normal: '#10b981',
    Sobrepeso: '#f59e0b',
    Obesidad: '#ef4444',
    'Bajo Peso': '#3b82f6',
};

interface EmpleadoEnRiesgo {
    empleado: Employee;
    alerta: { tipo: string; gravedad: 'peligro' | 'precaucion'; valor: string };
    fechaToma: string;
}

export default function Dashboard() {
    const [empleados, setEmpleados] = useState<Employee[]>([]);
    const [registrosGlobales, setRegistrosGlobales] = useState<HealthRecord[]>([]);
    const [registrosActuales, setRegistrosActuales] = useState<HealthRecord[]>([]);
    const [cargando, setCargando] = useState(true);

    const [casosRiesgo, setCasosRiesgo] = useState<EmpleadoEnRiesgo[]>([]);
    const [filtroAlerta, setFiltroAlerta] = useState<string | null>(null);

    useEffect(() => {
        const cargarDatos = async () => {
            try {
                const resumen = await dashboardService.obtenerResumen();
                
                setEmpleados(resumen.empleados || []);
                setRegistrosGlobales(new Array(resumen.totalRegistros || 0)); 
                setRegistrosActuales(resumen.ultimasTomas || []);

                const casosDetectados: EmpleadoEnRiesgo[] = [];

                (resumen.ultimasTomas || []).forEach((ultimoRegistro: HealthRecord) => {
                    if (!ultimoRegistro.empleado) return;

                    const alertas = analizarSignosVitales(ultimoRegistro);
                    alertas.forEach((alerta) => {
                        casosDetectados.push({
                            empleado: ultimoRegistro.empleado!,
                            alerta,
                            fechaToma: ultimoRegistro.fechaToma || 'Fecha no registrada',
                        });
                    });

                    if (ultimoRegistro.clasificacionImc === 'Sobrepeso' || ultimoRegistro.clasificacionImc === 'Obesidad') {
                        casosDetectados.push({
                            empleado: ultimoRegistro.empleado!,
                            alerta: {
                                tipo: 'Nutricional',
                                gravedad: ultimoRegistro.clasificacionImc === 'Obesidad' ? 'peligro' : 'precaucion',
                                valor: ultimoRegistro.clasificacionImc,
                            },
                            fechaToma: ultimoRegistro.fechaToma || 'Fecha no registrada',
                        });
                    }
                });

                setCasosRiesgo(casosDetectados);
            } catch (error) {
                console.error('Error cargando dashboard:', error);
            } finally {
                setCargando(false);
            }
        };

        cargarDatos();
    }, []);

    const contarAlertas = (tipo: string) =>
        casosRiesgo.filter((c) => c.alerta.tipo === tipo).length;

    const dependenciasCount = (empleados || []).reduce(
        (acc, emp) => {
            if (!emp.dependencia) return acc; // Seguridad extra
            acc[emp.dependencia] = (acc[emp.dependencia] || 0) + 1;
            return acc;
        },
        {} as Record<string, number>,
    );

    const datosDependencia = Object.keys(dependenciasCount).map((key) => ({
        nombre: key.replace('Secretaría de ', 'Sec. '),
        cantidad: dependenciasCount[key],
    }));

    const imcCount = (registrosActuales || []).reduce(
        (acc, reg) => {
            const clasificacion = reg.clasificacionImc || 'Desconocido';
            acc[clasificacion] = (acc[clasificacion] || 0) + 1;
            return acc;
        },
        {} as Record<string, number>,
    );

    const datosIMC = Object.keys(imcCount)
        .filter((key) => key !== 'Desconocido')
        .map((key) => ({ name: key, value: imcCount[key] }));

    if (cargando)
        return (
            <div className='p-8 text-center text-slate-500 font-medium'>
                Generando reporte integral...
            </div>
        );

    return (
        <div className='max-w-7xl mx-auto space-y-8'>
            <div>
                <h2 className='text-3xl font-bold text-slate-800 tracking-tight'>
                    Panel Gerencial de Salud
                </h2>
                <p className='text-slate-500'>
                    Visión general y alertas operativas de la Alcaldía de Puerto
                    Salgar.
                </p>
            </div>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                <div className='bg-blue-50 border border-blue-100 rounded-2xl p-5'>
                    <div className='flex justify-between items-start mb-2'>
                        <div className='bg-blue-100 p-2 rounded-lg'>
                            <Users className='w-6 h-6 text-blue-600' />
                        </div>
                        <span className='text-3xl font-bold text-blue-700'>
                            {(empleados || []).length}
                        </span>
                    </div>
                    <h3 className='font-semibold text-blue-900'>
                        Total Personal
                    </h3>
                    <p className='text-sm text-blue-600 mt-1'>
                        Funcionarios registrados
                    </p>
                </div>

                <div className='bg-emerald-50 border border-emerald-100 rounded-2xl p-5'>
                    <div className='flex justify-between items-start mb-2'>
                        <div className='bg-emerald-100 p-2 rounded-lg'>
                            <Activity className='w-6 h-6 text-emerald-600' />
                        </div>
                        <span className='text-3xl font-bold text-emerald-700'>
                            {(registrosGlobales || []).length}
                        </span>
                    </div>
                    <h3 className='font-semibold text-emerald-900'>
                        Evaluaciones
                    </h3>
                    <p className='text-sm text-emerald-600 mt-1'>
                        Registros médicos totales
                    </p>
                </div>
                <div
                    onClick={() => setFiltroAlerta('Nutricional')}
                    className='bg-orange-50 border border-orange-100 rounded-2xl p-5 cursor-pointer hover:shadow-md transition-all hover:border-orange-300'
                >
                    <div className='flex justify-between items-start mb-2'>
                        <div className='bg-orange-100 p-2 rounded-lg'>
                            <CheckCircle className='w-6 h-6 text-orange-600' />
                        </div>
                        <span className='text-3xl font-bold text-orange-700'>
                            {contarAlertas('Nutricional')}
                        </span>
                    </div>
                    <h3 className='font-semibold text-orange-900'>
                        Riesgo Nutricional
                    </h3>
                    <p className='text-sm text-orange-600 mt-1'>
                        Sobrepeso y Obesidad
                    </p>
                </div>
            </div>
            <div>
                <h3 className='text-lg font-bold text-slate-800 mb-4 flex items-center gap-2'>
                    <AlertTriangle className='w-5 h-5 text-amber-500' /> Alertas
                    Clínicas (Clic para detalles)
                </h3>
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
                    <div
                        onClick={() => setFiltroAlerta('Hipertensión')}
                        className='bg-red-50 border border-red-100 rounded-2xl p-5 cursor-pointer hover:shadow-md transition-all hover:border-red-300'
                    >
                        <div className='flex justify-between items-start mb-2'>
                            <div className='bg-red-100 p-2 rounded-lg'>
                                <Activity className='w-6 h-6 text-red-600' />
                            </div>
                            <span className='text-3xl font-bold text-red-700'>
                                {contarAlertas('Hipertensión')}
                            </span>
                        </div>
                        <h3 className='font-semibold text-red-900'>
                            Hipertensión
                        </h3>
                        <p className='text-sm text-red-600 mt-1'>
                            Presión &gt; 140/90
                        </p>
                    </div>

                    <div
                        onClick={() => setFiltroAlerta('Hipoxia')}
                        className='bg-purple-50 border border-purple-100 rounded-2xl p-5 cursor-pointer hover:shadow-md transition-all hover:border-purple-300'
                    >
                        <div className='flex justify-between items-start mb-2'>
                            <div className='bg-purple-100 p-2 rounded-lg'>
                                <Wind className='w-6 h-6 text-purple-600' />
                            </div>
                            <span className='text-3xl font-bold text-purple-700'>
                                {contarAlertas('Hipoxia')}
                            </span>
                        </div>
                        <h3 className='font-semibold text-purple-900'>
                            Hipoxia
                        </h3>
                        <p className='text-sm text-purple-600 mt-1'>
                            SpO2 &lt; 92%
                        </p>
                    </div>

                    <div
                        onClick={() => setFiltroAlerta('Taquicardia')}
                        className='bg-amber-50 border border-amber-100 rounded-2xl p-5 cursor-pointer hover:shadow-md transition-all hover:border-amber-300'
                    >
                        <div className='flex justify-between items-start mb-2'>
                            <div className='bg-amber-100 p-2 rounded-lg'>
                                <HeartPulse className='w-6 h-6 text-amber-600' />
                            </div>
                            <span className='text-3xl font-bold text-amber-700'>
                                {contarAlertas('Taquicardia')}
                            </span>
                        </div>
                        <h3 className='font-semibold text-amber-900'>
                            Taquicardia
                        </h3>
                        <p className='text-sm text-amber-600 mt-1'>
                            Pulso &gt; 100 lpm
                        </p>
                    </div>

                    <div
                        onClick={() => setFiltroAlerta('Bajos')}
                        className='bg-blue-50 border border-blue-100 rounded-2xl p-5 cursor-pointer hover:shadow-md transition-all hover:border-blue-300'
                    >
                        <div className='flex justify-between items-start mb-2'>
                            <div className='bg-blue-100 p-2 rounded-lg'>
                                <AlertTriangle className='w-6 h-6 text-blue-600' />
                            </div>
                            <span className='text-3xl font-bold text-blue-700'>
                                {contarAlertas('Hipotensión') +
                                    contarAlertas('Bradicardia')}
                            </span>
                        </div>
                        <h3 className='font-semibold text-blue-900'>
                            Signos Disminuidos
                        </h3>
                        <p className='text-sm text-blue-600 mt-1'>
                            Presión o Pulso bajo
                        </p>
                    </div>
                </div>
            </div>
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                <div className='bg-white border border-blue-100 rounded-2xl p-5 cursor-pointer hover:shadow-md transition-all hover:border-blue-300'>
                    <h3 className='text-lg font-bold text-slate-800 mb-6'>
                        Distribución de Personal por Dependencia
                    </h3>
                    <div className='h-100'>
                        <ResponsiveContainer width='100%' height='100%'>
                            <BarChart
                                data={datosDependencia}
                                margin={{
                                    top: 20,
                                    right: 30,
                                    left: 0,
                                    bottom: 5,
                                }}
                            >
                                <CartesianGrid
                                    strokeDasharray='3 3'
                                    vertical={false}
                                    stroke='#f1f5f9'
                                />
                                <XAxis
                                    dataKey='nombre'
                                    stroke='#94a3b8'
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    stroke='#94a3b8'
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    allowDecimals={false}
                                />
                                <RechartsTooltip
                                    cursor={{ fill: '#f8fafc' }}
                                    contentStyle={{
                                        borderRadius: '0.5rem',
                                        border: 'none',
                                        boxShadow:
                                            '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                    }}
                                />
                                <Bar
                                    dataKey='cantidad'
                                    fill='#3b82f6'
                                    radius={[4, 4, 0, 0]}
                                    barSize={40}
                                    name='Empleados'
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className='bg-white border border-emerald-100 rounded-2xl p-5 cursor-pointer hover:shadow-md transition-all hover:border-emerald-300'>
                    <h3 className='text-lg font-bold text-slate-800 mb-6'>
                        Estado Nutricional Histórico (IMC)
                    </h3>
                    <div className='h-100'>
                        <ResponsiveContainer width='100%' height='100%'>
                            <PieChart>
                                <Pie
                                    data={datosIMC}
                                    cx='50%'
                                    cy='50%'
                                    innerRadius={80}
                                    outerRadius={120}
                                    paddingAngle={5}
                                    dataKey='value'
                                    isAnimationActive={false}
                                    label={({ name, percent }) =>
                                        `${name} ${(percent * 100).toFixed(0)}%`
                                    }
                                    labelLine={false}
                                >
                                    {datosIMC.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={
                                                COLORES_IMC[
                                                    entry.name as keyof typeof COLORES_IMC
                                                ] || '#94a3b8'
                                            }
                                        />
                                    ))}
                                </Pie>
                                <RechartsTooltip
                                    contentStyle={{
                                        borderRadius: '0.5rem',
                                        border: 'none',
                                        boxShadow:
                                            '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                    }}
                                />
                                <Legend
                                    verticalAlign='bottom'
                                    height={26}
                                    iconType='circle'
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
            {filtroAlerta && (
                <div className='fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50'>
                    <div className='bg-white rounded-2xl shadow-xl w-full max-w-5xl overflow-hidden flex flex-col max-h-[80vh]'>
                        <div className='p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50'>
                            <div>
                                <h3 className='text-lg font-bold text-slate-800'>
                                    Casos detectados:{' '}
                                    {filtroAlerta === 'Bajos'
                                        ? 'Hipotensión y Bradicardia'
                                        : filtroAlerta === 'Nutricional'
                                            ? 'Sobrepeso y Obesidad'
                                            : filtroAlerta}
                                </h3>
                                <p className='text-sm text-slate-500'>
                                    Listado de personal que requiere seguimiento
                                    médico.
                                </p>
                            </div>
                            <button
                                onClick={() => setFiltroAlerta(null)}
                                className='text-slate-400 hover:text-slate-600 bg-slate-200 hover:bg-slate-300 rounded-full p-1 transition-colors'
                            >
                                <X className='w-5 h-5' />
                            </button>
                        </div>

                        <div className='overflow-y-auto p-0'>
                            <table className='w-full text-left border-collapse'>
                                <thead className='bg-slate-50 sticky top-0 border-b border-slate-200'>
                                    <tr>
                                        <th className='p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider'>
                                            Funcionario
                                        </th>
                                        <th className='p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider'>
                                            Dependencia
                                        </th>
                                        <th className='p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider'>
                                            Alerta Detectada
                                        </th>
                                        <th className='p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider'>
                                            Acción
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className='divide-y divide-slate-100'>
                                    {casosRiesgo
                                        .filter((c) =>
                                            filtroAlerta === 'Bajos'
                                                ? c.alerta.tipo ===
                                                        'Hipotensión' ||
                                                    c.alerta.tipo ===
                                                        'Bradicardia'
                                                : c.alerta.tipo ===
                                                    filtroAlerta,
                                        )
                                        .map((caso, i) => (
                                            <tr
                                                key={i}
                                                className='hover:bg-slate-50 transition-colors'
                                            >
                                                <td className='p-4'>
                                                    <div className='font-bold text-slate-800'>
                                                        {caso.empleado.nombres}{' '}
                                                        {
                                                            caso.empleado
                                                                .apellidos
                                                        }
                                                    </div>
                                                    <div className='text-xs text-slate-500'>
                                                        {
                                                            caso.empleado
                                                                .numeroDocumento
                                                        }
                                                    </div>
                                                </td>
                                                <td className='p-4 text-sm text-slate-600'>
                                                    {caso.empleado.dependencia}
                                                </td>
                                                <td className='p-4'>
                                                    <span
                                                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                                                            caso.alerta
                                                                .gravedad ===
                                                            'peligro'
                                                                ? 'bg-red-100 text-red-800 border-red-200'
                                                                : 'bg-amber-100 text-amber-800 border-amber-200'
                                                        }`}
                                                    >
                                                        {caso.alerta.tipo} (
                                                        {caso.alerta.valor})
                                                    </span>
                                                    <div className='text-[10px] text-slate-400 mt-1'>
                                                        Registrado el:{' '}
                                                        {caso.fechaToma}
                                                    </div>
                                                </td>
                                                <td className='p-4'>
                                                    <Link
                                                        to={`/salud/${caso.empleado.numeroDocumento}`}
                                                        className='inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-sm font-medium transition-colors cursor-pointer'
                                                    >
                                                        Ver Perfil{' '}
                                                        <ArrowRight className='w-4 h-4' />
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}