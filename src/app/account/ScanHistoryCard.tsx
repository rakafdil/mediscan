import { ScanHistory } from "./types"

interface ScanHistoryCardProps {
    scan: ScanHistory
    index: number
}

const ScanHistoryCard: React.FC<ScanHistoryCardProps> = ({ scan, index }) => (
    <div key={index} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
        <div className="flex justify-between items-start mb-4">
            <h4 className="text-xl font-semibold text-gray-900">{scan.disease}</h4>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${scan.probability >= 0.7 ? 'bg-red-100 text-red-800' :
                scan.probability >= 0.4 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                }`}>
                {(scan.probability * 100).toFixed(1)}% probability
            </span>
        </div>
        <div>
            <h5 className="font-medium text-gray-900 mb-2">Recommended Precautions:</h5>
            {Array.isArray(scan.precautions) ? (
                <ul className="list-disc list-inside space-y-1">
                    {scan.precautions.map((precaution, precIndex) => (
                        <li key={precIndex} className="text-gray-700">{precaution}</li>
                    ))}
                </ul>
            ) : (
                <p className="text-gray-700">{scan.precautions}</p>
            )}
        </div>
    </div>
)

export default ScanHistoryCard;