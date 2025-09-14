import { CompleteProfile } from "./types"

interface LocationTabProps {
    profile: CompleteProfile
    updateField: (field: keyof CompleteProfile, value: string | number | null) => void
}

const LocationTab: React.FC<LocationTabProps> = ({ profile, updateField }) => (
    <div className="space-y-6">
        <div>
            <label htmlFor="street" className="block text-sm font-medium text-gray-700 mb-2">
                Street Address
            </label>
            <textarea
                id="street"
                rows={3}
                value={profile.street || ''}
                onChange={(e) => updateField('street', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
                placeholder="Enter your street address"
            />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
            <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                    City
                </label>
                <input
                    id="city"
                    type="text"
                    value={profile.city || ''}
                    onChange={(e) => updateField('city', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="City"
                />
            </div>
            <div>
                <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-2">
                    State/Province
                </label>
                <input
                    id="state"
                    type="text"
                    value={profile.state || ''}
                    onChange={(e) => updateField('state', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="State"
                />
            </div>
            <div>
                <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
                    Country
                </label>
                <input
                    id="country"
                    type="text"
                    value={profile.country || ''}
                    onChange={(e) => updateField('country', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="Country"
                />
            </div>
        </div>

    </div>
)

export default LocationTab;