import { type User } from '@supabase/supabase-js'
import { CompleteProfile } from './types'

interface PersonalInfoTabProps {
    user: User | null
    profile: CompleteProfile
    updateField: (field: keyof CompleteProfile, value: string | number | null) => void
}

const PersonalInfoTab: React.FC<PersonalInfoTabProps> = ({ user, profile, updateField }) => (
    <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                </label>
                <input
                    id="email"
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed focus:outline-none"
                />
            </div>
            <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                    Username
                </label>
                <input
                    id="username"
                    type="text"
                    value={profile.username || ''}
                    onChange={(e) => updateField('username', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="Enter your username"
                />
            </div>
            <div className="md:col-span-2">
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                </label>
                <input
                    id="fullName"
                    type="text"
                    value={profile.full_name || ''}
                    onChange={(e) => updateField('full_name', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="Enter your full name"
                />
            </div>
        </div>
    </div>
)

export default PersonalInfoTab;