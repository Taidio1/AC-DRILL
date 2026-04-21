import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API } from '@/lib/api';

interface AuthState {
  loading: boolean;
  authenticated: boolean;
}

export function useAdminAuth(): AuthState {
  const [state, setState] = useState<AuthState>({ loading: true, authenticated: false });
  const navigate = useNavigate();

  useEffect(() => {
    fetch(API.authCheck, { credentials: 'include' })
      .then((r) => r.json())
      .then((data) => {
        if (!data.authenticated) {
          navigate('/admin/login', { replace: true });
        } else {
          setState({ loading: false, authenticated: true });
        }
      })
      .catch(() => navigate('/admin/login', { replace: true }));
  }, [navigate]);

  return state;
}
