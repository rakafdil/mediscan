"use client"

import { type User } from '@supabase/supabase-js'
import React, { useEffect, useState } from "react"
import { useSearchParams } from 'next/navigation'
import { useScanHistoryDetail } from '@/hooks/useScanHistoryDetail'
import { useScanHistoryData } from '@/hooks/useScanHistoryData'
import { faTrashCan } from '@fortawesome/free-regular-svg-icons'
import { faPrint, faArrowLeft, faPlus, faCheckCircle } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import 'dayjs/locale/en'
import Link from 'next/link'

dayjs.extend(utc)
dayjs.extend(timezone)

const HistoryPageDetail = ({ user }: { user: User | null }) => {
    const searchParams = useSearchParams()
    const id = searchParams.get("id")
    const [isClient, setIsClient] = useState(false)
    const [userTimezone, setUserTimezone] = useState('UTC')

    const {
        scanDetail,
        loading,
        error,
        fetchScanDetail
    } = useScanHistoryDetail(user)

    const {
        removeScanResult
    } = useScanHistoryData(user)

    useEffect(() => {
        setIsClient(true)
        setUserTimezone(dayjs.tz.guess())
    }, [])

    useEffect(() => {
        if (id) {
            fetchScanDetail(id)
        }
        console.log(scanDetail)
    }, [id, fetchScanDetail])

    const handleDelete = async () => {
        if (confirm("Are you sure you want to delete this history record?")) {
            if (id) {
                const success = await removeScanResult(id)
                if (success) {
                    window.location.href = '/account'
                }
            }
        }
    }

    const handlePrintArea = () => {
        const printContents = document.getElementById('print-area')?.innerHTML;
        if (!printContents) return;
        const originalContents = document.body.innerHTML;
        document.body.innerHTML = printContents;
        window.print();
        document.body.innerHTML = originalContents;
    };

    return (
        <div className="px-4 md:px-8 lg:px-20 py-8">
            <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
                {/* Header */}
                <div className="bg-gray-50 border-b border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <Link
                                href="/account"
                                className="mr-4 text-gray-700 hover:text-blue-600 transition-colors duration-200"
                            >
                                <FontAwesomeIcon icon={faArrowLeft} />
                            </Link>
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                                Scan History
                            </h1>
                        </div>
                        <div className="flex items-center gap-5 text-2xl">
                            <button onClick={handlePrintArea} className="hover:text-blue-600 cursor-pointer">
                                <FontAwesomeIcon icon={faPrint} />
                            </button>

                            <button
                                onClick={handleDelete}
                                className="hover:text-red-600 cursor-pointer"
                            >
                                <FontAwesomeIcon icon={faTrashCan} />
                            </button>
                        </div>
                    </div>
                </div>

                <div id='print-area'>
                    {/* Date and time */}
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex flex-col md:flex-row md:items-center justify-between">
                            <div>
                                <span className="text-sm text-gray-500">Scan Date & Time</span>
                                <p className="text-lg font-medium text-gray-800">
                                    {isClient && scanDetail?.scan_timestamp
                                        ? dayjs(scanDetail.scan_timestamp).tz(userTimezone).locale('en').format('dddd, DD MMMM YYYY - HH:mm:ss')
                                        : 'Loading...'
                                    }
                                </p>
                            </div>
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                                Scan History #{scanDetail?.scan_id}
                            </span>
                        </div>
                        <div className="flex flex-col md:flex-col mt-3">
                            <div>
                                <span className="text-sm text-gray-500">Age & Gender</span>
                                <p className="text-lg font-medium text-gray-800">
                                    {scanDetail?.age} Years Old | {scanDetail?.gender}
                                </p>
                            </div>
                            <div>
                                <span className="text-sm text-gray-500">Height & Weight</span>
                                <p className="text-lg font-medium text-gray-800">
                                    {scanDetail?.height} cm | {scanDetail?.weight} kg
                                </p>
                            </div>
                        </div>
                    </div>
                    {/* Symptoms & Diagnosis */}
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Symptoms */}
                            <div>
                                <h2 className="text-xl font-semibold text-gray-800 mb-4">Symptoms Experienced</h2>
                                <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                                    <ul className="space-y-3">
                                        {scanDetail?.scan_history_symptoms?.map((s, index) => (
                                            <li key={index} className="flex items-start">
                                                <span className="h-5 w-5 rounded-full text-blue-500 flex items-center justify-center">
                                                    <FontAwesomeIcon icon={faCheckCircle} className='text-2xl' />
                                                </span>
                                                <span className="ml-3 text-gray-700">{s.symptom.symptom_name}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                            {/* Diagnosis */}
                            <div>
                                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                                    Possible Diseases
                                </h2>
                                <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                                    <ul className="space-y-4">
                                        {scanDetail?.diseases?.map((result, i) => (
                                            <li key={i} className="flex justify-between">
                                                <span className="font-medium">{result.disease_name}</span>
                                                <span>{(result.probability * 100).toFixed(2)}%</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <div className="mt-8 border-t border-gray-200 pt-6">
                            <h2 className="text-xl font-semibold text-gray-800 mb-4">Disease Details</h2>
                            {scanDetail?.diseases?.map(
                                (result, i) =>
                                    result.probability > 0 && (
                                        <div key={i} className="mb-4 p-4 border rounded-lg bg-gray-50">
                                            <h3 className="font-bold text-lg">{result.disease_name}</h3>
                                            <div className="mt-2">
                                                <h4 className="font-semibold text-gray-700 mb-2">Precautions:</h4>
                                                <ul className="list-disc ml-6 text-sm text-gray-700">
                                                    {result.precaution?.split(";").map((precaution, idx) => (
                                                        <li key={idx}>{precaution}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    )
                            )}
                        </div>
                        {/* Disclaimer */}
                        <div className="mt-8 border-t border-gray-200 pt-6">
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                                <p className="text-sm text-yellow-700">
                                    <span className="font-medium">Notice:</span> This system only provides
                                    initial estimates and does not replace professional medical diagnosis.
                                </p>
                            </div>
                            <div className="flex flex-col md:flex-row md:justify-between items-center">
                                <Link href="/symptom-checker/symptoms" className="text-blue-600 hover:text-blue-800">
                                    <FontAwesomeIcon icon={faPlus} /> Create New Scan
                                </Link>
                                <a href="/hospitals">
                                    <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded cursor-pointer">
                                        Find Nearby Hospitals
                                    </button>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default HistoryPageDetail