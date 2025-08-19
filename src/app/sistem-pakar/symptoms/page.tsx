"use client"
import { useState } from "react"

export default function DiagnosisFlow() {
    const [step, setStep] = useState(1)
    const [formData, setFormData] = useState({
        name: "",
        age: "",
        symptoms: "",
        result: null,
    })

    const nextStep = () => setStep((prev) => prev + 1)
    const prevStep = () => setStep((prev) => prev - 1)

    // --- Step 1: Input Data Pengguna ---
    const Step1 = () => (
        <div className="p-6 max-w-md mx-auto">
            <h1 className="text-xl font-bold mb-4">Data Pengguna</h1>
            <input
                type="text"
                placeholder="Nama"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-2 mb-3 border rounded"
            />
            <input
                type="number"
                placeholder="Umur"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                className="w-full p-2 mb-3 border rounded"
            />
            <button onClick={nextStep} className="cursor-pointer px-4 py-2 bg-blue-500 text-white rounded">
                Lanjut
            </button>
        </div>
    )

    // --- Step 2: Input Gejala ---
    const Step2 = () => (
        <div className="p-6 max-w-md mx-auto">
            <h1 className="text-xl font-bold mb-4">Input Gejala</h1>
            <textarea
                placeholder="Tuliskan gejala..."
                value={formData.symptoms}
                onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
                className="w-full p-2 mb-3 border rounded min-h-[150px]"
            />
            <div className="flex justify-between">
                <button onClick={prevStep} className="px-4 py-2 bg-gray-300 rounded cursor-pointer">Kembali</button>
                <button onClick={nextStep} className="px-4 py-2 bg-green-500 text-white rounded cursor-pointer">Lanjut</button>
            </div>
        </div>
    )

    // --- Step 3: Hasil Diagnosis ---
    const Step3 = () => (
        <div className="p-6 max-w-md mx-auto">
            <h1 className="text-xl font-bold mb-4">Hasil Diagnosis</h1>
            <p><b>Nama:</b> {formData.name}</p>
            <p><b>Umur:</b> {formData.age}</p>
            <p><b>Gejala:</b> {formData.symptoms}</p>
            <p className="mt-4 text-green-600 font-semibold">
                Hasil prediksi: Flu Ringan 🤧 (dummy data)
            </p>
            <div className="flex justify-between mt-4">
                <button onClick={prevStep} className="px-4 py-2 bg-gray-300 rounded cursor-pointer">Kembali</button>
                <button onClick={nextStep} className="px-4 py-2 bg-indigo-500 text-white rounded cursor-pointer">Lanjut</button>
            </div>
        </div>
    )

    // --- Step 4: Artikel ---
    const Step4 = () => (
        <div className="p-6 max-w-md mx-auto">
            <h1 className="text-xl font-bold mb-4">Artikel Kesehatan</h1>
            <p className="mb-4">
                Banyak istirahat, minum air putih, dan konsumsi vitamin C dapat membantu pemulihan.
            </p>
            <div className="flex justify-between">
                <button onClick={prevStep} className="px-4 py-2 bg-gray-300 rounded cursor-pointer">Kembali</button>
                <button onClick={nextStep} className="px-4 py-2 bg-purple-500 text-white rounded cursor-pointer">Lanjut</button>
            </div>
        </div>
    )

    // --- Step 5: Daftar Rumah Sakit ---
    const Step5 = () => (
        <div className="p-6 max-w-md mx-auto">
            <h1 className="text-xl font-bold mb-4">Rumah Sakit Terdekat</h1>
            <ul className="list-disc pl-6">
                <li>RSUD Kota Malang</li>
                <li>RS Saiful Anwar</li>
                <li>RS Hermina</li>
            </ul>
            <button onClick={prevStep} className="mt-4 px-4 py-2 bg-gray-300 rounded cursor-pointer">Kembali</button>
        </div>
    )

    return (
        <>
            {step === 1 && <Step1 />}
            {step === 2 && <Step2 />}
            {step === 3 && <Step3 />}
            {step === 4 && <Step4 />}
            {step === 5 && <Step5 />}
        </>
    )
}
