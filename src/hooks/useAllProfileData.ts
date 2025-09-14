import { useProfileData } from './useProfileData'
import { useLocationData } from './useLocationData'
import { useMedicalHistoryData } from './useMedicalHistoryData'
import { useScanHistoryData } from './useScanHistoryData'
import { type User } from '@supabase/supabase-js'
import { CompleteProfile } from '../app/account/types'

export const useAllProfileData = (user: User | null) => {
    const profileHook = useProfileData(user)
    const locationHook = useLocationData(user)
    const medicalHook = useMedicalHistoryData(user)
    const scanHook = useScanHistoryData(user)

    const combinedLoading = profileHook.loading || locationHook.loading || medicalHook.loading || scanHook.loading
    const combinedError = profileHook.error || locationHook.error || medicalHook.error || scanHook.error

    const combinedProfile: CompleteProfile = {
        ...profileHook.profileData,
        ...locationHook.locationData,
        ...medicalHook.medicalData,
        scan_history: scanHook.scanHistory || []
    }

    const updateAllProfile = async () => {
        const updatePromises = [
            profileHook.updateProfileData(profileHook.profileData)
        ]

        if (locationHook.locationData) {
            updatePromises.push(locationHook.updateLocationData(locationHook.locationData))
        }

        const results = await Promise.allSettled(updatePromises)

        const allSuccessful = results.every(result =>
            result.status === 'fulfilled' && result.value === true
        )

        return allSuccessful
    }

    const refetchAllData = () => {
        profileHook.refetch()
        locationHook.refetch()
        medicalHook.refetch()
        scanHook.refetch()
    }

    return {
        profile: combinedProfile,
        loading: combinedLoading,
        error: combinedError,
        refetchAll: refetchAllData,
        updateAll: updateAllProfile,
        // Individual hooks for specific operations
        profileHook,
        locationHook,
        medicalHook,
        scanHook
    }
}