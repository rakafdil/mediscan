// Step1.tsx
import React from 'react';
import { StepContainer } from './CommonComponents';
import { FormData } from '../types';

interface Step1Props {
    formData: FormData;
    setFormData: React.Dispatch<React.SetStateAction<FormData>>;
    onNext: () => void;
}

const Step1: React.FC<Step1Props> = ({ formData, setFormData, onNext }) => {
    return (
        <StepContainer title="Data Pengguna">
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

            <button
                type="submit"
                disabled={!formData.age || !formData.gender}
                className={`w-full font-semibold py-2 px-4 rounded-lg transition ${formData.age && formData.gender
                    ? "bg-blue-500 text-white cursor-pointer hover:bg-blue-600"
                    : "bg-gray-400 text-white cursor-not-allowed"
                    }`}
                onClick={onNext}
            >
                Lanjut
            </button>
        </StepContainer>
    );
};

export default Step1;