import { type HealthRecord } from '../types/types';

export interface AlertaMedica {
	tipo:
		| 'Hipertensión'
		| 'Hipotensión'
		| 'Taquicardia'
		| 'Bradicardia'
		| 'Hipoxia';
	gravedad: 'peligro' | 'precaucion';
	valor: string;
	empleadoId?: number;
	documento?: string;
}

export const analizarSignosVitales = (
	registro: HealthRecord,
): AlertaMedica[] => {
	const alertas: AlertaMedica[] = [];

	if (registro.sistolica >= 140 || registro.diastolica >= 90) {
		alertas.push({
			tipo: 'Hipertensión',
			gravedad: 'peligro',
			valor: `${registro.sistolica}/${registro.diastolica} mmHg`,
		});
	} else if (registro.sistolica <= 90 || registro.diastolica <= 60) {
		alertas.push({
			tipo: 'Hipotensión',
			gravedad: 'precaucion',
			valor: `${registro.sistolica}/${registro.diastolica} mmHg`,
		});
	}

	if (registro.pulsacion > 100) {
		alertas.push({
			tipo: 'Taquicardia',
			gravedad: 'precaucion',
			valor: `${registro.pulsacion} lpm`,
		});
	} else if (registro.pulsacion < 60) {
		alertas.push({
			tipo: 'Bradicardia',
			gravedad: 'precaucion',
			valor: `${registro.pulsacion} lpm`,
		});
	}

	if (registro.saturacion < 92) {
		alertas.push({
			tipo: 'Hipoxia',
			gravedad: 'peligro',
			valor: `${registro.saturacion}%`,
		});
	}

	return alertas;
};
