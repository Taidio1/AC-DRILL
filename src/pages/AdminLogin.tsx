import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { API } from '@/lib/api';
import logo from '@/img/acdrilllogo.png';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [login, setLogin]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState<string | null>(null);
  const [loading, setLoading]   = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch(API.login, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login, password }),
      });
      const data = await res.json();

      if (data.success) {
        navigate('/admin', { replace: true });
      } else {
        setError(data.message ?? 'Błąd logowania.');
      }
    } catch {
      setError('Błąd połączenia z serwerem.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="bg-white border border-border rounded-2xl p-10 shadow-lg">
          {/* Logo */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <img src={logo} alt="AC Drill" className="h-10 w-auto" />
            <span className="font-extrabold text-2xl text-foreground">Drill</span>
          </div>

          <h1 className="text-lg font-bold text-foreground text-center mb-1">
            Panel administracyjny
          </h1>
          <p className="text-sm text-muted-foreground text-center mb-8">
            Zaloguj się, aby zarządzać galerią
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                Login
              </label>
              <Input
                type="text"
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                required
                autoComplete="username"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                Hasło
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>

            {error && (
              <p className="text-sm text-destructive text-center">{error}</p>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 font-bold shadow-md hover:shadow-lg"
            >
              {loading ? 'Logowanie...' : 'Zaloguj się →'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
