import { FiPlus } from 'react-icons/fi'

interface MedicalInputProps {
    value: string
    onChange: (value: string) => void
    onAdd: () => void
    placeholder: string
    buttonColor: string
    buttonHoverColor: string
}

const MedicalInput: React.FC<MedicalInputProps> = ({
    value,
    onChange,
    onAdd,
    placeholder,
    buttonColor,
    buttonHoverColor
}) => (
    <div className="flex flex-col sm:flex-row gap-3">
        <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && onAdd()}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            placeholder={placeholder}
        />
        <button
            type="button"
            onClick={onAdd}
            className={`w-full sm:w-auto px-6 py-3 ${buttonColor} text-white rounded-lg ${buttonHoverColor} transition-colors flex items-center justify-center space-x-2`}
        >
            <FiPlus className="w-5 h-5" />
            <span>Add</span>
        </button>
    </div>
)

export default MedicalInput;