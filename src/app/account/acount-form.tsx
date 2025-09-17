'use client'
import { useCallback, useEffect, useState } from 'react'
import { createClient } from '@/app/utils/supabase/client'
import { type User } from '@supabase/supabase-js'
import { redirect, useRouter } from 'next/navigation'
import { LOGIN_PATH } from "@/constant/common";
import Loading from '../components/Loading';
import { CompleteProfile } from './types';
import showNotification from './Notification';
import PersonalInfoTab from './PersonalInfoTab'
import LocationTab from './LocationTab'
import MedicalHistoryTab from './MedicalHistoryTab'
import ScanHistoryTab from './ScanHistoryTab'
import ProfileHeader from './ProfileHeader'
import TabNavigation from './TabNavigation'
import ActionButtons from './ActionButton'
import { useAllProfileData } from '@/hooks/useAllProfileData'
import { number } from 'framer-motion'

export default function AccountForm({ user }: { user: User | null }) {
    const [activeTab, setActiveTab] = useState('personal')
    const [saving, setSaving] = useState(false)
    const supabase = createClient()

    // Use the combined hook for all data
    const {
        profile,
        loading,
        error,
        updateAll,
        profileHook,
        locationHook,
        medicalHook,
        scanHook
    } = useAllProfileData(user)

    // Individual state for new items
    const [newDisease, setNewDisease] = useState('')
    const [newAllergy, setNewAllergy] = useState('')

    const updateProfile = async () => {
        try {
            setSaving(true)
            const success = await updateAll()

            if (success) {
                showNotification({
                    type: 'success',
                    message: 'Profile updated successfully!'
                })
            } else {
                throw new Error('Update failed')
            }
        } catch (error) {
            console.error('Error updating profile:', error)
            showNotification({
                type: 'error',
                message: 'Error updating profile. Please try again.'
            })
        } finally {
            setSaving(false)
        }
    }

    const handleLogout = async () => {
        await supabase.auth.signOut()
        Promise.resolve().then(() => window.location.href = '/login')
    }

    const addDisease = () => {
        if (newDisease.trim()) {
            medicalHook.addDisease(newDisease.trim())
            setNewDisease('')
        }
    }

    const addAllergy = () => {
        if (newAllergy.trim()) {
            medicalHook.addAllergy(newAllergy.trim())
            setNewAllergy('')
        }
    }


    const removeDisease = (item: string) => {
        medicalHook.removeDisease(item);
    }

    const removeAllergy = (item: string) => {
        medicalHook.removeAllergy(item)
    }


    const updateField = (field: keyof CompleteProfile, value: string | number | null) => {
        if (['full_name', 'username', 'age', 'gender', 'height', 'weight'].includes(field)) {
            profileHook.setProfileData(prev => ({ ...prev, [field]: value }))
        } else if (['street', 'city', 'state', 'country', 'lon', 'lat'].includes(field)) {
            locationHook.setLocationData(prev => ({ ...prev, [field]: value }))
        }
    }

    if (loading) {
        return <Loading />
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-red-50">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Profile</h2>
                    <p className="text-red-500 mb-4">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 cursor-pointer"
                    >
                        Retry
                    </button>
                </div>
            </div>
        )
    }

    const renderTabContent = () => {
        switch (activeTab) {
            case 'personal':
                return <PersonalInfoTab user={user} profile={profile} updateField={updateField} />
            case 'location':
                return <LocationTab profile={profile} updateField={updateField} />
            case 'medical':
                return (
                    <MedicalHistoryTab
                        profile={profile}
                        newDisease={newDisease}
                        setNewDisease={setNewDisease}
                        newAllergy={newAllergy}
                        setNewAllergy={setNewAllergy}
                        addDisease={addDisease}
                        removeDisease={removeDisease}
                        addAllergy={addAllergy}
                        removeAllergy={removeAllergy}
                    />
                )
            case 'scans':
                return <ScanHistoryTab profile={profile} />
            default:
                return null
        }
    }

    return (
        <div className="min-h-screen py-8 px-4">
            <div className="max-w-4xl mx-auto">
                <ProfileHeader username={profile.username} />

                <div className="bg-white rounded-2xl shadow-xl mb-8">
                    <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />

                    <div className="p-8">
                        {renderTabContent()}
                    </div>

                    <ActionButtons
                        handleLogout={handleLogout}
                        updateProfile={updateProfile}
                        saving={saving}
                    />
                </div>
            </div>
        </div>
    )
}