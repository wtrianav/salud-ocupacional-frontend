import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Empleados from './pages/Empleados';
import ListaEmpleados from './pages/ListaEmpleados';
import PerfilMedico from './pages/PerfilMedico';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';

function App() {
	const [estaAutenticado, setEstaAutenticado] = useState<boolean>(false);
	const [cargando, setCargando] = useState(true);

	useEffect(() => {
		const token = localStorage.getItem('token');
		if (token) {
			setEstaAutenticado(true);
		}
		setCargando(false);
	}, []);

	if (cargando) return <div>Cargando sistema...</div>;

	if (!estaAutenticado) {
		return <Login onLoginSuccess={() => setEstaAutenticado(true)} />;
	}

	return (
		<BrowserRouter>
			<Routes>
				<Route path='/' element={<Layout />}>
					<Route index element={<Dashboard />} />
					<Route path='directorio' element={<ListaEmpleados />} />
					<Route path='empleados/nuevo' element={<Empleados />} />
					<Route path='salud/:documento' element={<PerfilMedico />} />
					<Route path='*' element={<Navigate to='/' replace />} />
				</Route>
			</Routes>
		</BrowserRouter>
	);
}

export default App;
