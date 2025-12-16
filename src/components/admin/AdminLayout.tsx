import { Link, useNavigate, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  DollarSign,
  HelpCircle,
  Star,
  Users,
  LogOut,
  Wrench,
  Gift,
  MessageCircle,
  ImageIcon,
  Bell,
  Lock,
  Plane
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function AdminLayout() {
  const { user, userProfile, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const menuItems = [
    { path: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/admin/hero-slides', icon: ImageIcon, label: 'Hero Slideshow' },
    { path: '/admin/content', icon: FileText, label: 'MNW Daten' },
    { path: '/admin/page-texts', icon: FileText, label: 'Inhalt' },
    { path: '/admin/prices', icon: DollarSign, label: 'Artikel' },
    { path: '/admin/faq', icon: HelpCircle, label: 'FAQ' },
    { path: '/admin/google', icon: Star, label: 'Google' },
    { path: '/admin/vouchers', icon: Gift, label: 'Gutscheine' },
    { path: '/admin/pop', icon: Bell, label: 'Pop' },
    { path: '/admin/vacation', icon: Plane, label: 'Urlaubs-Modus' },
    { path: '/admin/legal-config', icon: Lock, label: 'Rechtliche Texte' },
  ];

  if (isAdmin) {
    menuItems.push({ path: '/admin/users', icon: Users, label: 'Benutzer' });
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 fixed w-full z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-gray-900">MNW Admin</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                Hallo <span className="font-semibold">{userProfile?.vorname || user?.email?.split('@')[0] || 'Admin'}</span>
              </span>
              <button
                onClick={handleSignOut}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <LogOut className="h-5 w-5" />
                <span>Abmelden</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex pt-16">
        <aside className="w-64 bg-white border-r border-gray-200 fixed h-full overflow-y-auto">
          <nav className="mt-5 px-2">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="group flex items-center px-2 py-2 text-base font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900 mb-1 transition-colors"
              >
                <item.icon className="mr-4 h-6 w-6" />
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>

        <main className="flex-1 ml-64 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
