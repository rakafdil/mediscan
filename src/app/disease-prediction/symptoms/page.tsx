"use client"
import { useState } from "react"

export default function DiagnosisFlow() {
    const [step, setStep] = useState(1)
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        gender: "",
        age: "",
        symptoms: "",
        result: null,
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            const res = await fetch("/api/symptoms/validate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    gender: formData.gender,
                    age: formData.age,
                    symptoms: formData.symptoms
                }),
            })
            const data = await res.json()
            setFormData((prev) => ({ ...prev, result: data }))
            setStep(3) // loncat ke hasil diagnosis
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const nextStep = () => setStep((prev) => prev + 1)
    const prevStep = () => setStep((prev) => prev - 1)

    // --- Step 4: Artikel ---
    const Step4 = () => (
        <div className="p-6 max-w-md mx-auto">
            <h1 className="text-xl font-bold mb-4">Artikel Kesehatan</h1>
            <p className="mb-4">
                Banyak istirahat, minum air putih, dan konsumsi vitamin C dapat membantu
                pemulihan.
            </p>
            <div className="flex justify-between">
                <button
                    onClick={prevStep}
                    className="px-4 py-2 bg-gray-300 rounded cursor-pointer"
                >
                    Kembali
                </button>
                <button
                    onClick={nextStep}
                    className="px-4 py-2 bg-purple-500 text-white rounded cursor-pointer"
                >
                    Lanjut
                </button>
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
            <button
                onClick={prevStep}
                className="mt-4 px-4 py-2 bg-gray-300 rounded cursor-pointer"
            >
                Kembali
            </button>
        </div>
    )

    return (
        <>
            {step === 1 &&
                <div className="p-6 max-w-md mx-auto">
                    <h1 className="text-xl font-bold mb-4">Data Pengguna</h1>
                    <div>
                        <label htmlFor="age" className="block mb-2 pb-1 font-medium">
                            Age
                        </label>
                        <input
                            type="number"
                            id="age"
                            name="age"
                            required={true}
                            value={formData.age}
                            onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                            min={0}
                            placeholder="Insert your age"

                            className="w-full px-4 py-2 border-2 border-black rounded-lg"
                        />
                    </div>

                    {/* Gender */}
                    <div className="py-4">
                        <label className="block text-lg font-medium mb-2">
                            Gender:
                        </label>

                        <div className="flex gap-4 justify-center">
                            <div>
                                <input
                                    type="radio"
                                    id="laki-laki"
                                    name="gender"
                                    value="Laki-laki"
                                    checked={formData.gender === "Laki-laki"}
                                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                    className="hidden peer/laki"
                                    required
                                />
                                <label
                                    htmlFor="laki-laki"
                                    className="px-6 py-2 border-2 border-gray-400 text-gray-600 rounded-lg cursor-pointer
                             peer-checked/laki:bg-blue-500 peer-checked/laki:border-blue-500
                             peer-checked/laki:text-white transition"
                                >
                                    Laki-laki
                                </label>
                            </div>

                            <div>
                                <input
                                    type="radio"
                                    id="perempuan"
                                    name="gender"
                                    value="Perempuan"
                                    checked={formData.gender === "Perempuan"}
                                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                    className="hidden peer/perempuan"
                                    required
                                />
                                <label
                                    htmlFor="perempuan"
                                    className="px-6 py-2 border-2 border-gray-400 text-gray-600 rounded-lg cursor-pointer
                             peer-checked/perempuan:bg-blue-500 peer-checked/perempuan:border-blue-500
                             peer-checked/perempuan:text-white transition"
                                >
                                    Perempuan
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={!formData.age || !formData.gender}
                        className={`w-full font-semibold py-2 px-4 rounded-lg transition ${formData.age && formData.gender
                            ? "bg-blue-500 text-white cursor-pointer hover:bg-blue-600"
                            : "bg-gray-400 text-white cursor-not-allowed"
                            }`}
                        onClick={nextStep}
                    >
                        Lanjut
                    </button>
                </div>
            }
            {step === 2 &&
                <div className="p-6 max-w-md mx-auto">
                    <h1 className="text-xl font-bold mb-4">Input Gejala</h1>
                    <textarea
                        placeholder="Tuliskan gejala..."
                        value={formData.symptoms}
                        onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
                        className="w-full p-2 mb-3 border rounded min-h-[150px]"
                    />
                    <div className="flex justify-between">
                        <button
                            onClick={prevStep}
                            className="px-4 py-2 bg-gray-300 rounded cursor-pointer"
                        >
                            Kembali
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="px-4 py-2 bg-green-500 text-white rounded cursor-pointer"
                        >
                            {loading ? "Menganalisa..." : "Analisa"}
                        </button>
                    </div>
                </div>
            }
            {step === 3 &&
                <div className="p-6 max-w-md mx-auto">
                    <h1 className="text-xl font-bold mb-4">Hasil Diagnosis</h1>
                    <p>
                        <b>Gender:</b> {formData.gender}
                    </p>
                    <p>
                        <b>Age:</b> {formData.age}
                    </p>
                    <p>
                        <b>Gejala:</b> {formData.symptoms}
                    </p>

                    {formData.result ? (
                        <pre className="bg-gray-100 p-3 mt-4 rounded text-sm whitespace-pre-wrap">
                            {JSON.stringify(formData.result, null, 2)}
                        </pre>
                    ) : (
                        <p className="mt-4 text-red-500">Tidak ada hasil</p>
                    )}

                    <div className="flex justify-between mt-4">
                        <button
                            onClick={prevStep}
                            className="px-4 py-2 bg-gray-300 rounded cursor-pointer"
                        >
                            Kembali
                        </button>
                        <button
                            onClick={nextStep}
                            className="px-4 py-2 bg-indigo-500 text-white rounded cursor-pointer"
                        >
                            Lanjut
                        </button>
                    </div>
                </div>
            }
            {step === 4 && <Step4 />}
            {step === 5 && <Step5 />}
        </>
    )
}
