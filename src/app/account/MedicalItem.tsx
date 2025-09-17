import { FiTrash2 } from 'react-icons/fi'

interface MedicalItemProps {
    item: string
    index: number
    onRemove: (item: string) => void
    bgColor: string
}

const MedicalItem: React.FC<MedicalItemProps> = ({ item, onRemove, bgColor }) => (
    <div className={`flex items-center justify-between ${bgColor} px-4 py-3 rounded-lg`}>
        <span className="text-gray-800">{item}</span>
        <button
            type="button"
            onClick={() => onRemove(item)}
            className="cursor-pointer text-red-600 hover:text-red-800 transition-colors"
        >
            <FiTrash2 className="w-5 h-5" />
        </button>
    </div>
)

export default MedicalItem;