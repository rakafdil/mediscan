import { ScanHistory } from "./types"
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import 'dayjs/locale/id';
import Link from "next/link";

dayjs.extend(utc);
dayjs.extend(timezone);
interface ScanHistoryCardProps {
    scan: ScanHistory
    index: number
    ref: string
}

const ScanHistoryCard: React.FC<ScanHistoryCardProps> = ({ scan, index, ref }) => {
    const userTimezone = dayjs.tz.guess()
    return (
        <div key={index} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
            <div className="flex justify-between items-start mb-4">
                <h4 className="text-xl font-semibold text-gray-900">
                    {dayjs(scan.scan_timestamp).tz(userTimezone).locale('id').format('dddd, DD MMMM YYYY - HH:mm:ss')}
                </h4>
                <Link
                    href={ref}
                    className={`px-3 py-1 rounded-full text-sm font-medium text-blue-500 underline`}
                >
                    {"View more >"}
                </Link>
            </div>
            <div>
                <h5 className="font-medium text-gray-900 mb-2">Diseases:</h5>
                {Array.isArray(scan.diseases) ? (
                    <ul className="flex flex-row gap-3">
                        {scan.diseases?.map((disease, discIndex) => (
                            <li key={discIndex} className="text-gray-700 bg-blue-200 px-5 py-1 rounded-3xl">{disease?.disease_name}</li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-gray-700">{scan.diseases}</p>
                )}
            </div>
        </div>
    )
}

export default ScanHistoryCard;