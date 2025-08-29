import React from 'react';
import { StepContainer } from './CommonComponents';
import { FormData } from '../types';
import EditableList from './EditableList';
interface Step1Props {
    formData: FormData;
    setFormData: React.Dispatch<React.SetStateAction<FormData>>;
    onNext: () => void;
}

const Step1: React.FC<Step1Props> = ({
    formData,
    setFormData,
    onNext
}) => {

    return (
        <div className='flex flex-col items-center pb-20'>
            <StepContainer
                className='flex flex-col items-center max-w-7xl w-[80%]'
            >
                {/* Age + Gender section */}
                <div className="flex flex-col md:flex-row items-center justify-center pb-20 gap-10 w-full">
                    {/* Age */}
                    <div className='flex flex-col items-center w-full md:w-1/2'>
                        <label htmlFor="age" className="font-bold text-xl md:text-2xl text-gray-800 mb-4">
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
                            placeholder="Insert here"
                            className="w-full md:w-48 h-14 md:h-16 px-4 md:px-6 text-lg md:text-2xl border-2 border-gray-400 rounded-lg focus:outline-none focus:border-blue-500"
                        />
                    </div>

                    {/* Gender */}
                    <div className="flex flex-col items-center w-full md:w-1/2">
                        <label className="font-bold text-xl md:text-2xl text-gray-800 mb-4">
                            Gender
                        </label>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center w-full">
                            {/* Male */}
                            <div className='flex-1'>
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
                                    className="px-6 py-3 w-full h-14 md:h-16 border-2 font-medium text-lg md:text-2xl border-gray-400 text-gray-600 rounded-lg cursor-pointer
              peer-checked/laki:bg-blue-500 peer-checked/laki:border-blue-500
              peer-checked/laki:text-white transition flex items-center justify-center hover:bg-blue-200"
                                >
                                    Male
                                </label>
                            </div>

                            {/* Female */}
                            <div className='flex-1'>
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
                                    className="px-6 py-3 w-full h-14 md:h-16 border-2 font-medium text-lg md:text-2xl border-gray-400 text-gray-600 rounded-lg cursor-pointer
              peer-checked/perempuan:bg-blue-500 peer-checked/perempuan:border-blue-500
              peer-checked/perempuan:text-white transition flex items-center justify-center hover:bg-blue-200"
                                >
                                    Female
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            </StepContainer>

            {/* History */}
            <StepContainer
                className='flex flex-col items-center w-[90%] md:w-[80%] pb-10'
                title='Disease / Allergy History'
                titleClassName='text-xl md:text-2xl font-bold'
            >
                <EditableList
                    items={formData.histories}
                    onAdd={(item) => setFormData(prev => ({
                        ...prev,
                        histories: [...prev.histories, item]
                    }))}
                    onUpdate={(index, newValue) => setFormData(prev => ({
                        ...prev,
                        histories: prev.histories.map((hst, idx) =>
                            idx === index ? newValue : hst)
                    }))}
                    onDelete={(index) => setFormData(prev => ({
                        ...prev,
                        histories: prev.histories.filter((_, idx) => idx !== index)
                    }))}
                    placeholder="Enter disease or allergy"
                    addButtonText="Add Disease/Allergy"
                    emptyStateTitle="No medical history added yet"
                    emptyStateSubtitle="Click the button below to add your first entry"
                    showConfirmDelete={true}
                />
            </StepContainer>

            {/* Next button (fixed responsiveness OFF) */}
            <button
                type="submit"
                disabled={!formData.age || !formData.gender}
                className={`w-[80%] text-xl font-bold py-3 px-4 rounded-lg transition 
      ${formData.age && formData.gender
                        ? "bg-blue-500 text-white cursor-pointer hover:bg-blue-600 hover:scale-105 shadow-lg hover:shadow-xl"
                        : "bg-gray-400 text-white cursor-not-allowed"
                    }`}
                onClick={onNext}
            >
                Next
            </button>
        </div>

    );
};

export default Step1;