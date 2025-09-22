// PrivateRoute.js
import { Navigate, Outlet } from 'react-router-dom';
import Loader from '../component/loader/Loader';

export default function PrivateRoute({ isAuthenticated, loading }) {
  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><Loader/></div>;
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
}
