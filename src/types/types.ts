export interface Employee {
	id?: number;
	numeroDocumento: string;
	nombres: string;
	apellidos: string;
	fechaNacimiento: string;
	genero?: string;
	rh?: string;
	cargo: string;
	dependencia: string;
	edadActual?: number;
	enfermedadesPadecidas?: string;
    alergias?: string;
    operaciones?: string;
    herenciaFamiliar?: string;
}

export interface HealthRecord {
	id?: number;
	fechaToma?: string;
	sistolica: number;
	diastolica: number;
	pulsacion: number;
	saturacion: number;
	peso: number;
	estatura: number;
	imc?: number;
	clasificacionImc?: string;
	estadoTension?: string;
	empleado?: Employee;
}
