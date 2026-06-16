import axios from 'axios';
import { type Employee, type HealthRecord } from '../types/types';

const api = axios.create({
	baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
	headers: {
		'Content-Type': 'application/json',
	},
});

api.interceptors.request.use((config) => {
	const token = localStorage.getItem('token');
	console.log("Interceptor Axios - Token actual:", token);
	if (token) {
		config.headers.Authorization = `Bearer ${token}`;
	}
	return config;
});

api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response) {
            if (error.response.status === 401 || error.response.status === 403) {
                console.warn("Seguridad: Token inválido o expirado. Cerrando sesión automáticamente...");
                
                localStorage.removeItem('token');
                localStorage.removeItem('username');
                
                if (window.location.pathname !== '/login') {
                    window.location.href = '/login'; 
                }
            }
        }
        return Promise.reject(error);
    }
);

export const authService = {
	login: async (credenciales: any) => {
		const response = await api.post('/auth/login', credenciales);
		return response.data;
	},
	logout: () => {
		localStorage.removeItem('token');
		localStorage.removeItem('username');
		window.location.href = '/login';
	},
};

export const empleadoService = {
	registrar: async (empleado: Employee) => {
		const response = await api.post<Employee>('/empleados', empleado);
		return response.data;
	},
	buscarPorDocumento: async (documento: string) => {
		const response = await api.get<Employee>(`/empleados/${documento}`);
		return response.data;
	},
	obtenerTodos: async () => {
		const response = await api.get<Employee[]>('/empleados');
		return response.data;
	},
	actualizar: async (id: number, empleado: Partial<Employee>) => {
		const response = await api.put<Employee>(`/empleados/${id}`, empleado);
		return response.data;
	},

	eliminar: async (id: number) => {
		await api.delete(`/empleados/${id}`);
	},

	obtenerDiagnosticoIA: async (documento: string) => {
        const response = await api.get<{diagnostico: string}>(`/empleados/${documento}/diagnostico-ia`);
        return response.data.diagnostico;
    },
};

export const saludService = {
	registrarToma: async (documento: string, registro: HealthRecord) => {
		const response = await api.post<HealthRecord>(
			`/empleados/${documento}/registros`,
			registro,
		);
		return response.data;
	},
	obtenerHistorial: async (documento: string) => {
		const response = await api.get<HealthRecord[]>(
			`/empleados/${documento}/registros`,
		);
		return response.data;
	},
	actualizarToma: async (
		documento: string,
		idRecord: number,
		registro: Partial<HealthRecord>,
	) => {
		const response = await api.put<HealthRecord>(
			`/empleados/${documento}/registros/${idRecord}`,
			registro,
		);
		return response.data;
	},
};

export const dashboardService = {
	obtenerResumen: async () => {
		const response = await api.get('/dashboard/resumen');
		return response.data;
	},
};

export const exportacionService = {
    descargarReporteDiario: async (fecha: string) => {
        try {
            const response = await api.get(`/exportar/diario?fecha=${fecha}`, {
                responseType: 'blob', // MUY IMPORTANTE
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Reporte_Diario_${fecha}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        } catch (error) {
            console.error("Error al descargar el archivo diario", error);
            alert("Hubo un error al generar el reporte diario.");
        }
    },

    descargarExpediente: async (documento: string) => {
        try {
            const response = await api.get(`/exportar/expediente/${documento}`, {
                responseType: 'blob',
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Expediente_Medico_${documento}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        } catch (error) {
            console.error("Error al descargar el expediente", error);
            alert("Hubo un error al generar el expediente médico.");
        }
    },

	descargarReporteRango: async (fechaInicio: string, fechaFin: string) => {
        try {
            const response = await api.get(`/exportar/rango?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`, {
                responseType: 'blob',
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Consolidado_${fechaInicio}_al_${fechaFin}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        } catch (error) {
            console.error("Error al descargar el reporte por rango", error);
            alert("Hubo un error al generar el reporte.");
        }
    }
};

export default api;
