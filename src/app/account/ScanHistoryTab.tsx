import { CompleteProfile } from './types';
import ScanHistoryCard from './ScanHistoryCard';

import { FiShield } from 'react-icons/fi'

interface ScanHistoryTabProps {
    profile: CompleteProfile
}

const ScanHistoryTab: React.FC<ScanHistoryTabProps> = ({ profile }) => (
    <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Disease Scan History</h3>
        {profile.scan_history && profile.scan_history.length > 0 ? (
            <div className="space-y-4">
                {profile.scan_history.map(
                    (scan, index) => (
                        <ScanHistoryCard key={index} scan={scan} index={index} ref={`/account/history?id=${scan.scan_id}`} />
                    )
                )
                }
            </div>
        ) : (
            <div className="text-center py-12">
                <FiShield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No scan history available</p>
                <p className="text-gray-400">Your disease scan results will appear here</p>
            </div>
        )}
    </div>
)

export default ScanHistoryTab;