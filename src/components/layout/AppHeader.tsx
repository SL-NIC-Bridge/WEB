import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Moon, Sun, LogOut, User, Settings } from 'lucide-react';

const AppHeader: React.FC = () => {
  const { state: authState, logout } = useAuth();
  const { theme, setTheme, actualTheme } = useTheme();
  const { user } = authState;

  const toggleTheme = () => {
    setTheme(actualTheme === 'dark' ? 'light' : 'dark');
  };

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleBadgeVariant = (role: string) => {
    return role === 'DS' ? 'default' : 'secondary';
  };

  const getRoleDisplayName = (role: string) => {
    return role === 'DS' ? 'Divisional Secretariat' : 'Grama Niladhari';
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo and Title */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center">
              <span className="text-white font-bold text-sm">EC</span>
            </div>
            <div>
              <h1 className="text-lg font-semibold">E-Certification Portal</h1>
              <p className="text-xs text-muted-foreground hidden sm:block">
                Document Verification System
              </p>
            </div>
          </div>
          
          {/* Navigation */}
          {user && (
            <nav className="hidden md:flex items-center space-x-6 ml-8">
              {user.role === 'DS' ? (
                <>
                  <Link to="/ds" className="text-sm font-medium hover:text-primary transition-colors">
                    Dashboard
                  </Link>
                  {/* <Link to="/ds#review" className="text-sm font-medium hover:text-primary transition-colors">
                    Review Queue
                  </Link> */}
                  <Link to="/ds/gn-management" className="text-sm font-medium hover:text-primary transition-colors">
                    GN Management
                  </Link>
                  <Link to="/ds/create-division" className="text-sm font-medium hover:text-primary transition-colors">
                    Create Division
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/gn" className="text-sm font-medium hover:text-primary transition-colors">
                    Dashboard
                  </Link>
                  <Link to="/gn/applications" className="text-sm font-medium hover:text-primary transition-colors">
                    Applications
                  </Link>
                </>
              )}
            </nav>
          )}
        </div>

        {/* User Actions */}
        <div className="flex items-center space-x-4">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="w-9 px-0"
          >
            {actualTheme === 'dark' ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
            <span className="sr-only">Toggle theme</span>
          </Button>

          {/* User Menu */}
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {getUserInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64" align="end" forceMount>
                <div className="flex items-start justify-between p-2">
                  <div className="space-y-1 flex-1">
                    <p className="text-sm font-medium leading-none">{user.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                    <div className="flex items-center space-x-2 mt-2">
                      <Badge variant={getRoleBadgeVariant(user.role)} className="text-xs">
                        {getRoleDisplayName(user.role)}
                      </Badge>
                      {user.gnDivisionName && (
                        <Badge variant="outline" className="text-xs">
                          {user.gnDivisionName}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to={user.role === 'DS' ? '/ds/profile' : '/gn/profile'}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to={user.role === 'DS' ? '/ds/settings' : '/gn/settings'}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
};

export default AppHeader;