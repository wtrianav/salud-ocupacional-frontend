import axios from 'axios';
import { type Employee, type HealthRecord } from '../types/types';

const api = axios.create({
	baseURL: 'http://localhost:8080/api',
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
	obtenerTodosLosRegistros: async () => {
		const response = await api.get<HealthRecord[]>('/dashboard/registros');
		return response.data;
	},
};

export default api;
