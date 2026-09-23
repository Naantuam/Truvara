import { useLocation, Link } from 'react-router-dom';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Squares2X2Icon } from '@heroicons/react/24/solid';
import { FileText, CheckSquare, Users, ListChecks, DollarSign, BarChart3, Settings as SettingsIcon } from 'lucide-react';
import BrandMark from './BrandMark';
import SunMoonToggle from './SunMoonToggle';
import useTheme from './useTheme';
import { hasModuleAccess } from '../moduleAccess';

function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
}

const NAV_GROUPS = [
    {
        section: null,
        items: [
            { name: 'Dashboard', href: '/dashboard', icon: Squares2X2Icon, app: 'dashboard' },
        ],
    },
    {
        section: 'Governance',
        items: [
            { name: 'Decisions', href: '/decisions', icon: FileText, app: 'decisions' },
            { name: 'Approvals', href: '/approvals', icon: CheckSquare, app: 'approvals' },
        ],
    },
    {
        section: 'Operations',
        items: [
            { name: 'Responsibilities', href: '/responsibilities', icon: Users, app: 'responsibilities' },
            { name: 'Actions', href: '/actions', icon: ListChecks, app: 'actions' },
        ],
    },
    {
        section: 'Finance',
        items: [
            { name: 'Expenses', href: '/expenses', icon: DollarSign, app: 'expenses' },
        ],
    },
    {
        section: null,
        items: [
            { name: 'Reports', href: '/reports', icon: BarChart3, app: 'reports' },
            { name: 'Settings', href: '/settings', icon: SettingsIcon, app: 'settings' },
        ],
    },
];

export default function Sidebar({ sidebarOpen, setSidebarOpen, user }) {
    const location = useLocation();
    const { theme, toggleTheme } = useTheme();

    // Superuser fallback kept only for the AUTH_DISABLED test-user path
    // (see Layout.jsx TEST_USER); real users are gated purely by
    // hasModuleAccess, since the Owner role's seed already grants every
    // permission -- no separate admin bypass is needed for it.
    const isTestSuperuser = Boolean(user && !user.permissions && (user.superuser || user.is_superuser || user.is_staff));

    const allowedGroups = NAV_GROUPS
        .map(group => ({
            ...group,
            items: group.items.filter(item => isTestSuperuser || hasModuleAccess(user, item.app)),
        }))
        .filter(group => group.items.length > 0);

    return (
        <div className="flex relative font-sans h-screen">
            <div
                className={`fixed top-0 left-0 h-screen w-55 bg-white dark:bg-gray-900 transform transition-transform duration-300 ease-in-out shadow-md z-50 flex flex-col ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
                    }`}
            >
                {/* Container for content with internal padding */}
                <div className="px-3 pt-2 pb-6 h-full overflow-y-auto relative">

                    {/* Close button - Visible on Mobile AND Desktop now */}
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="absolute top-2 right-2 p-1 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-100 transition-colors z-50"
                        title="Close Sidebar"
                    >
                        <XMarkIcon className="h-6 w-6" />
                    </button>

                    {/* Header with brand mark */}
                    <div className="flex flex-col items-center gap-2 pt-1 pb-3">
                        <SunMoonToggle theme={theme} onToggle={toggleTheme} />
                        <BrandMark variant={theme} className="w-32 h-auto" />
                    </div>

                    {/* Navigation links */}
                    <nav className="space-y-4">
                        {allowedGroups.map((group, index) => (
                            <div key={group.section || `root-${index}`} className="space-y-1">
                                {group.section && (
                                    <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                                        {group.section}
                                    </p>
                                )}
                                {group.items.map((item) => {
                                    const isActive = location.pathname.startsWith(item.href);
                                    return (
                                        <Link
                                            key={item.name}
                                            to={item.href}
                                            className={classNames(
                                                isActive
                                                    ? "bg-brand-600 text-white shadow-sm"
                                                    : "text-gray-600 hover:bg-brand-50 hover:text-brand-700 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gold-400",
                                                "group flex items-center gap-3 px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200"
                                            )}
                                        >
                                            <item.icon
                                                className={classNames(
                                                    isActive ? "text-white" : "text-gray-400 group-hover:text-brand-700 dark:text-gray-500 dark:group-hover:text-gold-400",
                                                    "h-5 w-5 flex-shrink-0"
                                                )}
                                            />
                                            {item.name}
                                        </Link>
                                    );
                                })}
                            </div>
                        ))}
                    </nav>
                </div>
            </div>
        </div>
    )
}
