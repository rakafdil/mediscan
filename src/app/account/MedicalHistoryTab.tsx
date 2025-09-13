import { CompleteProfile } from "./types"
import MedicalInput from "./MedicalInput"
import MedicalItem from "./MedicalItem"

interface MedicalHistoryTabProps {
    profile: CompleteProfile
    newDisease: string
    setNewDisease: (value: string) => void
    newAllergy: string
    setNewAllergy: (value: string) => void
    addDisease: () => void
    removeDisease: (index: number) => void
    addAllergy: () => void
    removeAllergy: (index: number) => void
}

const MedicalHistoryTab: React.FC<MedicalHistoryTabProps> = ({
    profile,
    newDisease,
    setNewDisease,
    newAllergy,
    setNewAllergy,
    addDisease,
    removeDisease,
    addAllergy,
    removeAllergy
}) => (
    <div className="space-y-8">
        {/* Diseases */}
        <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Medical Conditions / Diseases</h3>
            <div className="space-y-4">
                <MedicalInput
                    value={newDisease}
                    onChange={setNewDisease}
                    onAdd={addDisease}
                    placeholder="Add a medical condition (e.g., Diabetes, Hypertension)"
                    buttonColor="bg-blue-600"
                    buttonHoverColor="hover:bg-blue-700"
                />
                {profile.diseases.length > 0 && (
                    <div className="space-y-2">
                        {profile.diseases.map((disease, index) => (
                            <MedicalItem
                                key={index}
                                item={disease}
                                index={index}
                                onRemove={removeDisease}
                                bgColor="bg-blue-50"
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>

        {/* Allergies */}
        <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Allergies</h3>
            <div className="space-y-4">
                <MedicalInput
                    value={newAllergy}
                    onChange={setNewAllergy}
                    onAdd={addAllergy}
                    placeholder="Add an allergy (e.g., Penicillin, Peanuts)"
                    buttonColor="bg-red-600"
                    buttonHoverColor="hover:bg-red-700"
                />
                {profile.allergies.length > 0 && (
                    <div className="space-y-2">
                        {profile.allergies.map((allergy, index) => (
                            <MedicalItem
                                key={index}
                                item={allergy}
                                index={index}
                                onRemove={removeAllergy}
                                bgColor="bg-red-50"
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    </div>
)

export default MedicalHistoryTab;