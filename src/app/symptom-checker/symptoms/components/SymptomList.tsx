// SymptomList.tsx
import React, { useState } from 'react';
import { FormData } from '../types';

interface SymptomListProps {
    formData: FormData;
    setFormData: React.Dispatch<React.SetStateAction<FormData>>;
}

const SymptomList: React.FC<SymptomListProps> = ({ formData, setFormData }) => {
    const [symptomInput, setSymptomInput] = useState("");
    const [showAddSymptom, setShowAddSymptom] = useState(false);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [editValue, setEditValue] = useState("");

    const addSymptoms = () => {
        if (symptomInput.trim() === "") return;

        setFormData(prev => ({
            ...prev,
            result_validate: {
                ...prev.result_validate,
                symptoms: [...prev.result_validate.symptoms, symptomInput]
            }
        }));

        setSymptomInput("");
        setShowAddSymptom(false);
    };

    const updateSymptom = (index: number, newValue: string) => {
        setFormData(prev => ({
            ...prev,
            result_validate: {
                ...prev.result_validate,
                symptoms: prev.result_validate.symptoms.map((sym, idx) =>
                    idx === index ? newValue : sym
                )
            }
        }));
        setEditingIndex(null);
    };

    const deleteSymptom = (index: number) => {
        setFormData(prev => ({
            ...prev,
            result_validate: {
                ...prev.result_validate,
                symptoms: prev.result_validate.symptoms.filter((_, idx) => idx !== index)
            }
        }));
    };

    return (
        <div className="mt-4">
            <h3>Daftar Gejala:</h3>
            <ul>
                {formData.result_validate.symptoms.map((s, i) => (
                    <li key={i} className="flex items-center gap-2">
                        {editingIndex === i ? (
                            <>
                                <input
                                    type="text"
                                    value={editValue}
                                    onChange={(e) => setEditValue(e.target.value)}
                                    className="border p-1 rounded"
                                />
                                <button
                                    onClick={() => updateSymptom(i, editValue)}
                                    className="border px-2 rounded"
                                >
                                    Save
                                </button>
                                <button
                                    onClick={() => setEditingIndex(null)}
                                    className="border px-2 rounded"
                                >
                                    Cancel
                                </button>
                            </>
                        ) : (
                            <>
                                <span>{s}</span>
                                <button
                                    onClick={() => {
                                        setEditingIndex(i);
                                        setEditValue(s);
                                    }}
                                    className="border px-2 rounded"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => deleteSymptom(i)}
                                    className="border px-2 rounded"
                                >
                                    Delete
                                </button>
                            </>
                        )}
                    </li>
                ))}
            </ul>

            {!showAddSymptom && (
                <button
                    onClick={() => setShowAddSymptom(true)}
                    className="border px-3 py-1 rounded"
                >
                    Add Symptom +
                </button>
            )}

            {showAddSymptom && (
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        addSymptoms();
                    }}
                    className="flex flex-col gap-2 mt-2"
                >
                    <input
                        placeholder="Type the symptom..."
                        value={symptomInput}
                        onChange={(e) => setSymptomInput(e.target.value)}
                        className="w-full p-2 mb-3 border rounded"
                    />
                    <div className="flex flex-row justify-between">
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-500 text-white cursor-pointer rounded"
                        >
                            OK
                        </button>
                        <button
                            onClick={() => setShowAddSymptom(false)}
                            className="px-4 py-2 bg-red-500 text-white cursor-pointer rounded"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
};

export default SymptomList;