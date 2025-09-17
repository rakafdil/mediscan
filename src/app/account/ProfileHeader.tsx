import { FiUser } from 'react-icons/fi'

interface HeaderProps {
    username: string | null
}

const ProfileHeader: React.FC<HeaderProps> = ({ username }) => (
    <div className="rounded-2xl shadow-xl p-4 sm:p-6 md:p-8 mb-8 bg-white/30 backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
                <FiUser className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            </div>
            <div className="text-center sm:text-left">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">
                    Hello {username || 'User'}!
                </h1>
                <p className="text-md sm:text-lg text-gray-600 mt-1">
                    Manage your account information and medical history
                </p>
            </div>
        </div>
    </div>
)

export default ProfileHeader;