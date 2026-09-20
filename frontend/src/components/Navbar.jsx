import { Link, useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { Button } from './ui/button.jsx';
import { Logo } from './Logo.jsx';
import { ThemeToggle } from './ThemeToggle.jsx';

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((part) => part[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : '';

  return (
    <nav className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
        <Link
          to="/"
          aria-label="DevHire home"
          className="group rounded-md transition-transform hover:scale-[1.02]"
        >
          <Logo />
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />

          {user && (
            <>
              <div className="hidden h-6 w-px bg-border sm:block" aria-hidden="true" />
              <div className="flex items-center gap-2.5">
                <span
                  className="flex size-8 items-center justify-center rounded-full bg-muted text-xs font-semibold text-foreground ring-1 ring-border"
                  aria-hidden="true"
                >
                  {initials}
                </span>
                <span className="hidden text-sm font-medium text-foreground sm:inline">
                  {user.name}
                </span>
              </div>
              <Button variant="secondary" size="sm" onClick={handleLogout}>
                <LogOut className="size-4" aria-hidden="true" />
                <span className="hidden sm:inline">Log out</span>
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
