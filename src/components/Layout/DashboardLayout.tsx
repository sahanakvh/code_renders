import React, { useState } from 'react';
import { Bell, Calendar, Users, Settings, LogOut, Menu, X, UserCheck, Stethoscope } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface DashboardLayoutProps {
  children: React.ReactNode;
  currentUser?: any; // Keep for backward compatibility
  notifications?: number;
  userType?: 'patient' | 'therapist';
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  currentUser,
  notifications = 0,
  userType
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();
  
  // Use auth context user if available, fallback to passed currentUser
  const activeUser = user || currentUser;
  const activeUserType = userType || user?.role || 'patient';

  const handleLogout = () => {
    logout();
  };

  const navigationItems = [
    { name: 'Dashboard', href: '/dashboard', icon: Calendar, current: true },
    { name: 'Schedule', href: '/schedule', icon: Calendar, current: false },
    { name: 'Patients', href: '/patients', icon: Users, current: false },
    { name: 'Therapists', href: '/therapists', icon: Users, current: false },
    { name: 'Reports', href: '/reports', icon: Calendar, current: false },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
        <div className="fixed left-0 top-0 h-full w-64 bg-card border-r">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-xl font-bold text-primary">AyurSutra</h2>
            <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>
          <nav className="p-4 space-y-2">
            {navigationItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  item.current
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                }`}
              >
                <item.icon className="h-5 w-5 mr-3" />
                {item.name}
              </a>
            ))}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow border-r bg-card">
          <div className="flex items-center h-16 px-4 border-b">
            <h2 className="text-xl font-bold text-primary">AyurSutra</h2>
          </div>
          <nav className="flex-1 p-4 space-y-2">
            {navigationItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  item.current
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                }`}
              >
                <item.icon className="h-5 w-5 mr-3" />
                {item.name}
              </a>
            ))}
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top navigation */}
        <div className="sticky top-0 z-40 bg-card border-b">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>

            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {notifications > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs">
                    {notifications}
                  </Badge>
                )}
              </Button>

              {/* User menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={activeUser?.avatar} alt={activeUser?.fullName || activeUser?.full_name} />
                      <AvatarFallback>
                        {(activeUser?.fullName || activeUser?.full_name)?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">{activeUser?.fullName || activeUser?.full_name}</p>
                      <p className="w-[200px] truncate text-sm text-muted-foreground">
                        {activeUser?.email}
                      </p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to={activeUserType === 'patient' ? '/doctors' : '/patient'}>
                      {activeUserType === 'patient' ? (
                        <>
                          <Stethoscope className="mr-2 h-4 w-4" />
                          <span>Switch to Therapist Portal</span>
                        </>
                      ) : (
                        <>
                          <UserCheck className="mr-2 h-4 w-4" />
                          <span>Switch to Patient Portal</span>
                        </>
                      )}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;