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
                <div className="flex flex-col md:flex-col items-center justify-center pb-20 gap-10 w-full">
                    {/* Age */}
                    <div className="flex flex-row md:gap-20">
                        <div className='flex flex-col items-center w-full md:w-70'>
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
                                className="w-full md:w-56 h-14 md:h-16 px-4 md:px-6 text-lg md:text-2xl border-2 border-gray-400 rounded-lg focus:outline-none focus:border-blue-500"
                            />
                        </div>
                        {/* Gender */}
                        <div className="flex flex-col items-center w-full md:w-70">
                            <label className="font-bold text-xl md:text-2xl text-gray-800 mb-4">
                                Gender
                            </label>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center w-full">
                                {/* Male */}
                                <div className='flex-1'>
                                    <input
                                        type="radio"
                                        id="male"
                                        name="gender"
                                        value="Male"
                                        checked={formData.gender === "Male"}
                                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                        className="hidden peer/male"
                                        required
                                    />
                                    <label
                                        htmlFor="male"
                                        className="px-6 py-3 w-full h-14 md:h-16 border-2 font-medium text-lg md:text-2xl border-gray-400 text-gray-600 rounded-lg cursor-pointer
                                      peer-checked/male:bg-blue-500 peer-checked/male:border-blue-500
                                      peer-checked/male:text-white transition flex items-center justify-center hover:bg-blue-200"
                                    >
                                        Male
                                    </label>
                                </div>
                                {/* Female */}
                                <div className='flex-1'>
                                    <input
                                        type="radio"
                                        id="female"
                                        name="gender"
                                        value="Female"
                                        checked={formData.gender === "Female"}
                                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                        className="hidden peer/female"
                                        required
                                    />
                                    <label
                                        htmlFor="female"
                                        className="px-6 py-3 w-full h-14 md:h-16 border-2 font-medium text-lg md:text-2xl border-gray-400 text-gray-600 rounded-lg cursor-pointer
                                      peer-checked/female:bg-blue-500 peer-checked/female:border-blue-500
                                      peer-checked/female:text-white transition flex items-center justify-center hover:bg-blue-200"
                                    >
                                        Female
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-row md:gap-20">
                        <div className='flex flex-col items-center w-full md:w-70'>
                            <label htmlFor="weight" className="font-bold text-xl md:text-2xl text-gray-800 mb-4">
                                Weight
                            </label>
                            <div className="flex items-center gap-3">
                                <input
                                    type="number"
                                    id="weight"
                                    name="weight"
                                    required={true}
                                    value={formData.weight}
                                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                                    min={0}
                                    placeholder="Insert here"
                                    className="w-full md:w-56 h-14 md:h-16 px-4 md:px-6 text-lg md:text-2xl border-2 border-gray-400 rounded-lg focus:outline-none focus:border-blue-500"
                                />
                                <span className='font-bold text-xl md:text-2xl text-gray-800'>kg</span>
                            </div>
                        </div>
                        <div className='flex flex-col items-center w-full md:w-70'>
                            <label htmlFor="height" className="font-bold text-xl md:text-2xl text-gray-800 mb-4">
                                Height
                            </label>
                            <div className="flex items-center gap-3">
                                <input
                                    type="number"
                                    id="height"
                                    name="height"
                                    required={true}
                                    value={formData.height}
                                    onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                                    min={0}
                                    placeholder="Insert here"
                                    className="w-full md:w-56 h-14 md:h-16 px-4 md:px-6 text-lg md:text-2xl border-2 border-gray-400 rounded-lg focus:outline-none focus:border-blue-500"
                                />
                                <span className='font-bold text-xl md:text-2xl text-gray-800'>cm</span>
                            </div>
                        </div>
                    </div>
                </div>
            </StepContainer>

            <StepContainer
                className='flex flex-col items-center w-[90%] md:w-[80%] pb-10'
                title='Disease History'
                titleClassName='text-xl md:text-2xl font-bold'
            >
                <EditableList
                    items={formData.histories.diseases || []}
                    onAdd={(item) => setFormData(prev => ({
                        ...prev,
                        histories: {
                            ...prev.histories,
                            diseases: [...(prev.histories.diseases || []), item]
                        }
                    }))}
                    onUpdate={(index, newValue) => setFormData(prev => ({
                        ...prev,
                        histories: {
                            ...prev.histories,
                            diseases: (prev.histories.diseases || []).map((hst, idx) =>
                                idx === index ? newValue : hst)
                        }
                    }))}
                    onDelete={(index) => setFormData(prev => ({
                        ...prev,
                        histories: {
                            ...prev.histories,
                            diseases: (prev.histories.diseases || []).filter((_, idx) => idx !== index)
                        }
                    }))}
                    placeholder="Enter disease"
                    addButtonText="Add Disease"
                    emptyStateTitle="No disease history added yet"
                    emptyStateSubtitle="Click the button below to add your first entry"
                    showConfirmDelete={true}
                />
            </StepContainer>

            <StepContainer
                className='flex flex-col items-center w-[90%] md:w-[80%] pb-10'
                title='Allergy History'
                titleClassName='text-xl md:text-2xl font-bold'
            >
                <EditableList
                    items={formData.histories.allergies || []}
                    onAdd={(item) => setFormData(prev => ({
                        ...prev,
                        histories: {
                            ...prev.histories,
                            allergies: [...(prev.histories.allergies || []), item]
                        }
                    }))}
                    onUpdate={(index, newValue) => setFormData(prev => ({
                        ...prev,
                        histories: {
                            ...prev.histories,
                            allergies: (prev.histories.allergies || []).map((hst, idx) =>
                                idx === index ? newValue : hst)
                        }
                    }))}
                    onDelete={(index) => setFormData(prev => ({
                        ...prev,
                        histories: {
                            ...prev.histories,
                            allergies: (prev.histories.allergies || []).filter((_, idx) => idx !== index)
                        }
                    }))}
                    placeholder="Enter allergy"
                    addButtonText="Add Allergy"
                    emptyStateTitle="No allergy history added yet"
                    emptyStateSubtitle="Click the button below to add your first entry"
                    showConfirmDelete={true}
                />
            </StepContainer>

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