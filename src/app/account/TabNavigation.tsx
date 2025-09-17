import { FiUser, FiMapPin, FiHeart, FiShield } from 'react-icons/fi'

interface TabNavigationProps {
    activeTab: string
    setActiveTab: (tab: string) => void
}

const TabNavigation: React.FC<TabNavigationProps> = ({ activeTab, setActiveTab }) => {
    const tabs = [
        { id: 'personal', label: 'Personal Info', icon: FiUser },
        { id: 'location', label: 'Location', icon: FiMapPin },
        { id: 'medical', label: 'Medical History', icon: FiHeart },
        { id: 'scans', label: 'Scan History', icon: FiShield },
    ]

    return (
        <div className="border-b border-gray-200">
            <nav className="flex overflow-x-auto md:overflow-visible space-x-4 md:space-x-8 px-2 md:px-8 scrollbar-hide">
                {tabs.map(({ id, label, icon: Icon }) => (
                    <button
                        key={id}
                        onClick={() => setActiveTab(id)}
                        className={`flex items-center py-3 px-4 md:py-4 md:px-1 border-b-2 font-medium text-xs md:text-sm transition-colors whitespace-nowrap
                            ${activeTab === id
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                    >
                        <Icon className="w-5 h-5 inline mr-2" />
                        {label}
                    </button>
                ))}
            </nav>
        </div>
    )
}

export default TabNavigation;