"use client";
import React, { useState } from "react";

const Symptoms: React.FC = () => {
    const [umur, setUmur] = useState<number | "">("");
    const [gender, setGender] = useState<string>("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log({ umur, gender });
        // TODO: ganti dengan fetch/axios ke API Next.js atau backend Laravel
    };

    return (
        <div>
            <div className="flex justify-center">
                <h1 className="text-3xl font-bold m-6 text-black">Diagnosa Penyakit</h1>
            </div>
            <div className="justify-self-center text-center">
                <form id="diagnosisForm" onSubmit={handleSubmit} className="space-y-6">
                    {/* Umur */}
                    <div>
                        <label htmlFor="umur" className="block mb-2 pb-1 font-medium">
                            Umur
                        </label>
                        <input
                            type="number"
                            id="umur"
                            name="umur"
                            required
                            min={0}
                            placeholder="Masukkan umur Anda"
                            value={umur}
                            onChange={(e) => setUmur(e.target.value ? Number(e.target.value) : "")}
                            className="w-full px-4 py-2 border-2 border-black rounded-lg"
                        />
                    </div>

                    {/* Gender */}
                    <div className="py-4">
                        <label className="block text-lg font-medium mb-2">
                            Jenis Kelamin:
                        </label>

                        <div className="flex gap-4 justify-center">
                            <div>
                                <input
                                    type="radio"
                                    id="laki-laki"
                                    name="gender"
                                    value="Laki-laki"
                                    checked={gender === "Laki-laki"}
                                    onChange={(e) => setGender(e.target.value)}
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
                                    checked={gender === "Perempuan"}
                                    onChange={(e) => setGender(e.target.value)}
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
                        disabled={!umur || !gender}
                        className={`w-full font-semibold py-2 px-4 rounded-lg transition ${umur && gender
                                ? "bg-blue-500 text-white cursor-pointer hover:bg-blue-600"
                                : "bg-gray-400 text-white cursor-not-allowed"
                            }`}
                    >
                        Lanjut
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Symptoms;
