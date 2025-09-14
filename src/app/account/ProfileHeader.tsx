import { FiUser } from 'react-icons/fi'

interface HeaderProps {
    username: string | null
}

const ProfileHeader: React.FC<HeaderProps> = ({ username }) => (
    <div className="rounded-2xl shadow-xl p-8 mb-8 bg-white/30 backdrop-blur-sm">
        <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
                <FiUser className="w-8 h-8 text-white" />
            </div>
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Hello {username || 'User'}!</h1>
                <p className="text-gray-600 mt-1">Manage your account information and medical history</p>
            </div>
        </div>
    </div>
)

export default ProfileHeader;