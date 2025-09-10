'use client'
import { useCallback, useEffect, useState } from 'react'
import { createClient } from '@/app/utils/supabase/client'
import { type User } from '@supabase/supabase-js'
import { FiUser, FiMapPin, FiHeart, FiShield, FiPlus, FiTrash2 } from 'react-icons/fi'
import { redirect, useRouter } from 'next/navigation'
import { LOGIN_PATH } from "@/constant/common";
interface ProfileData {
    full_name: string | null
    username: string | null
    phone: string | null
    address: string | null
    city: string | null
    state: string | null
    postal_code: string | null
    country: string | null
    medical_history: string[]
    allergies: string[]
    emergency_contact_name: string | null
    emergency_contact_phone: string | null
}

export default function AccountForm({ user }: { user: User | null }) {
    const router = useRouter();
    const supabase = createClient()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [activeTab, setActiveTab] = useState('personal')

    // Profile states
    const [profile, setProfile] = useState<ProfileData>({
        full_name: '',
        username: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        postal_code: '',
        country: '',
        medical_history: [],
        allergies: [],
        emergency_contact_name: '',
        emergency_contact_phone: ''
    })

    const [newMedicalCondition, setNewMedicalCondition] = useState('')
    const [newAllergy, setNewAllergy] = useState('')

    const getProfile = useCallback(async () => {
        try {
            setLoading(true)

            const { data, error, status } = await supabase
                .from('profiles')
                .select(`*`)
                .eq('id', user?.id)
                .single()

            if (error && status !== 406) {
                console.log(error)
                throw error
            }

            if (data) {
                setProfile({
                    full_name: data.full_name || '',
                    username: data.username || '',
                    phone: data.phone || '',
                    address: data.address || '',
                    city: data.city || '',
                    state: data.state || '',
                    postal_code: data.postal_code || '',
                    country: data.country || '',
                    medical_history: data.medical_history || [],
                    allergies: data.allergies || [],
                    emergency_contact_name: data.emergency_contact_name || '',
                    emergency_contact_phone: data.emergency_contact_phone || ''
                })
            }
        } catch (error) {
            console.error('Error loading user data:', error)
            redirect('/login')
        } finally {
            setLoading(false)
        }
    }, [user, supabase])

    useEffect(() => {
        getProfile()
    }, [user, getProfile])

    const updateProfile = async () => {
        try {
            setSaving(true)

            const { error } = await supabase.from('profiles').upsert({
                id: user?.id as string,
                ...profile,
                updated_at: new Date().toISOString(),
            })

            if (error) throw error

            // Success notification
            const notification = document.createElement('div')
            notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fadeIn'
            notification.textContent = 'Profile updated successfully!'
            document.body.appendChild(notification)
            setTimeout(() => notification.remove(), 3000)

        } catch (error) {
            console.error('Error updating profile:', error)
            const notification = document.createElement('div')
            notification.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fadeIn'
            notification.textContent = 'Error updating profile. Please try again.'
            document.body.appendChild(notification)
            setTimeout(() => notification.remove(), 3000)
        } finally {
            setSaving(false)
        }
    }

    const addMedicalCondition = () => {
        if (newMedicalCondition.trim()) {
            setProfile(prev => ({
                ...prev,
                medical_history: [...prev.medical_history, newMedicalCondition.trim()]
            }))
            setNewMedicalCondition('')
        }
    }

    const removeMedicalCondition = (index: number) => {
        setProfile(prev => ({
            ...prev,
            medical_history: prev.medical_history.filter((_, i) => i !== index)
        }))
    }

    const addAllergy = () => {
        if (newAllergy.trim()) {
            setProfile(prev => ({
                ...prev,
                allergies: [...prev.allergies, newAllergy.trim()]
            }))
            setNewAllergy('')
        }
    }

    const removeAllergy = (index: number) => {
        setProfile(prev => ({
            ...prev,
            allergies: prev.allergies.filter((_, i) => i !== index)
        }))
    }

    const updateField = (field: keyof ProfileData, value: string) => {
        setProfile(prev => ({ ...prev, [field]: value }))
    }

    const handleLogout = async () => {
        await supabase.auth.signOut();
        Promise.resolve().then(() => window.location.href = '/login');
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
                <div className="bg-white p-8 rounded-2xl shadow-xl">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-600 mt-4 text-center">Loading your profile...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br py-8 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
                    <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
                            <FiUser className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 font-montserrat">Hello {profile.username}!</h1>
                            <p className="text-gray-600 mt-1">Manage your account information and medical history</p>
                        </div>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="bg-white rounded-2xl shadow-xl mb-8">
                    <div className="border-b border-gray-200">
                        <nav className="flex space-x-8 px-8">
                            <button
                                onClick={() => setActiveTab('personal')}
                                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'personal'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                <FiUser className="w-5 h-5 inline mr-2" />
                                Personal Info
                            </button>
                            <button
                                onClick={() => setActiveTab('location')}
                                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'location'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                <FiMapPin className="w-5 h-5 inline mr-2" />
                                Location
                            </button>
                            <button
                                onClick={() => setActiveTab('medical')}
                                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'medical'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                <FiHeart className="w-5 h-5 inline mr-2" />
                                Medical History
                            </button>
                        </nav>
                    </div>

                    <div className="p-8">
                        {/* Personal Information Tab */}
                        {activeTab === 'personal' && (
                            <div className="space-y-6 animate-fadeIn">
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
                                    <div>
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
                                    <div>
                                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                                            Phone Number
                                        </label>
                                        <input
                                            id="phone"
                                            type="tel"
                                            value={profile.phone || ''}
                                            onChange={(e) => updateField('phone', e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                            placeholder="Enter your phone number"
                                        />
                                    </div>
                                </div>

                                {/* Emergency Contact */}
                                <div className="border-t pt-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                        <FiShield className="w-5 h-5 mr-2 text-red-500" />
                                        Emergency Contact
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label htmlFor="emergencyName" className="block text-sm font-medium text-gray-700 mb-2">
                                                Contact Name
                                            </label>
                                            <input
                                                id="emergencyName"
                                                type="text"
                                                value={profile.emergency_contact_name || ''}
                                                onChange={(e) => updateField('emergency_contact_name', e.target.value)}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                                placeholder="Emergency contact name"
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="emergencyPhone" className="block text-sm font-medium text-gray-700 mb-2">
                                                Contact Phone
                                            </label>
                                            <input
                                                id="emergencyPhone"
                                                type="tel"
                                                value={profile.emergency_contact_phone || ''}
                                                onChange={(e) => updateField('emergency_contact_phone', e.target.value)}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                                placeholder="Emergency contact phone"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Location Tab */}
                        {activeTab === 'location' && (
                            <div className="space-y-6 animate-fadeIn">
                                <div>
                                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                                        Street Address
                                    </label>
                                    <textarea
                                        id="address"
                                        rows={3}
                                        value={profile.address || ''}
                                        onChange={(e) => updateField('address', e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
                                        placeholder="Enter your street address"
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                                        <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-2">
                                            Postal Code
                                        </label>
                                        <input
                                            id="postalCode"
                                            type="text"
                                            value={profile.postal_code || ''}
                                            onChange={(e) => updateField('postal_code', e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                            placeholder="Postal Code"
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
                        )}

                        {/* Medical History Tab */}
                        {activeTab === 'medical' && (
                            <div className="space-y-8 animate-fadeIn">
                                {/* Medical Conditions */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Medical Conditions</h3>
                                    <div className="space-y-4">
                                        <div className="flex space-x-3">
                                            <input
                                                type="text"
                                                value={newMedicalCondition}
                                                onChange={(e) => setNewMedicalCondition(e.target.value)}
                                                onKeyPress={(e) => e.key === 'Enter' && addMedicalCondition()}
                                                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                                placeholder="Add a medical condition (e.g., Diabetes, Hypertension)"
                                            />
                                            <button
                                                type="button"
                                                onClick={addMedicalCondition}
                                                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                                            >
                                                <FiPlus className="w-5 h-5" />
                                                <span>Add</span>
                                            </button>
                                        </div>
                                        {profile.medical_history.length > 0 && (
                                            <div className="space-y-2">
                                                {profile.medical_history.map((condition, index) => (
                                                    <div key={index} className="flex items-center justify-between bg-blue-50 px-4 py-3 rounded-lg">
                                                        <span className="text-gray-800">{condition}</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeMedicalCondition(index)}
                                                            className="text-red-600 hover:text-red-800 transition-colors"
                                                        >
                                                            <FiTrash2 className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Allergies */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Allergies</h3>
                                    <div className="space-y-4">
                                        <div className="flex space-x-3">
                                            <input
                                                type="text"
                                                value={newAllergy}
                                                onChange={(e) => setNewAllergy(e.target.value)}
                                                onKeyPress={(e) => e.key === 'Enter' && addAllergy()}
                                                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                                placeholder="Add an allergy (e.g., Penicillin, Peanuts)"
                                            />
                                            <button
                                                type="button"
                                                onClick={addAllergy}
                                                className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
                                            >
                                                <FiPlus className="w-5 h-5" />
                                                <span>Add</span>
                                            </button>
                                        </div>
                                        {profile.allergies.length > 0 && (
                                            <div className="space-y-2">
                                                {profile.allergies.map((allergy, index) => (
                                                    <div key={index} className="flex items-center justify-between bg-red-50 px-4 py-3 rounded-lg">
                                                        <span className="text-gray-800">{allergy}</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeAllergy(index)}
                                                            className="text-red-600 hover:text-red-800 transition-colors"
                                                        >
                                                            <FiTrash2 className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="border-t px-8 py-6 bg-gray-50 rounded-b-2xl">
                        <div className="flex justify-between items-center">

                            <button
                                onClick={handleLogout}
                                type="submit"
                                className="px-6 py-3 border bg-red-600 border-gray-300 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                            >
                                Sign Out
                            </button>
                            <button
                                onClick={updateProfile}
                                disabled={saving}
                                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                            >
                                {saving ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                        <span>Saving...</span>
                                    </>
                                ) : (
                                    <span>Save Changes</span>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}