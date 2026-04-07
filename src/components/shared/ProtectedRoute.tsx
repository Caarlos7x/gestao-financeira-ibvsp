import { useAuthContext } from '@/context/AuthContext';
import { UI_MESSAGES_PT_BR } from '@/constants/uiMessagesPtBR';
import { ROUTES } from '@/constants/routes';
import { Navigate, Outlet } from 'react-router-dom';

export function ProtectedRoute() {
  const { state } = useAuthContext();

  if (state.status === 'loading') {
    return <p className="state-message">{UI_MESSAGES_PT_BR.sessionLoading}</p>;
  }

  if (state.status === 'config_error' || state.status === 'signed_out') {
    return <Navigate to={ROUTES.login} replace />;
  }

  return <Outlet />;
}
