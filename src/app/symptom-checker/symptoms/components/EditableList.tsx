import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlusSquare, faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
import { faEdit, faTrashAlt } from '@fortawesome/free-regular-svg-icons';
import { HistoryData } from '@/app/account/types';
import { Symptom } from '../types';

// ─── Discriminated Union untuk props items ───────────────────────────────────

type SymptomVariant = {
    variant: 'symptoms';
    items: Symptom[];
    onAdd: (item: Symptom) => void;
    onUpdate: (index: number, newValue: Symptom) => void;
    onDelete: (index: number) => void;
};

type HistoryVariant = {
    variant: 'history';
    items: HistoryData[];
    onAdd: (item: HistoryData) => void;
    onUpdate: (index: number, newValue: HistoryData) => void;
    onDelete: (index: number) => void;
};

type VariantProps = SymptomVariant | HistoryVariant;

// ─── Props umum (UI config) ───────────────────────────────────────────────────

interface EditableListUIProps {
    placeholder?: string;
    addButtonText?: string;
    emptyStateTitle?: string;
    emptyStateSubtitle?: string;
    showConfirmDelete?: boolean;
}

type EditableListProps = EditableListUIProps & VariantProps;

// ─── Helper: ambil display label dari item ────────────────────────────────────

function getItemLabel(item: HistoryData | Symptom, variant: 'history' | 'symptoms'): string {
    if (variant === 'symptoms') {
        const s = item as Symptom;
        return `${s.name} — ${s.duration} (${s.severity})`;
    }
    const h = item as HistoryData;
    return h.description ? `${h.name}: ${h.description}` : h.name;
}

// ─── Sub-form untuk add/edit Symptom ─────────────────────────────────────────

interface SymptomFormProps {
    initial?: Symptom;
    onSave: (s: Symptom) => void;
    onCancel: () => void;
}

const SymptomForm: React.FC<SymptomFormProps> = ({
    initial = { name: '', duration: '', severity: '', description: '' },
    onSave,
    onCancel,
}) => {
    const [form, setForm] = useState<Symptom>(initial);

    const handleChange = (field: keyof Symptom, value: string) =>
        setForm(prev => ({ ...prev, [field]: value }));

    const isValid = form.name.trim() !== '' && form.duration.trim() !== '' && form.severity.trim() !== '';

    const durationString = form.duration || "";
    const [currentNum, currentUnit] = durationString.split(" ");

    return (
        <div className="flex flex-col gap-3 bg-white rounded-xl shadow-lg border-2 border-blue-200 p-4 w-full">
            <input
                type="text"
                placeholder="Symptom name"
                value={form.name}
                onChange={e => handleChange('name', e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg outline-none focus:border-blue-500"
            />
            <div className='flex gap-2'>
                <input
                    type="number"
                    placeholder="Exact or estimated duration"
                    value={currentNum || ""}
                    onChange={e => {
                        const newNum = e.target.value;
                        handleChange('duration', `${newNum} ${currentUnit || ''}`.trim());
                    }}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg outline-none focus:border-blue-500"
                />

                <select
                    value={currentUnit || ""}
                    onChange={e => {
                        const newUnit = e.target.value;
                        handleChange('duration', `${currentNum || ''} ${newUnit}`.trim());
                    }}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg outline-none focus:border-blue-500 bg-white"
                >
                    <option value="">Select type of time</option>
                    <option value="Hours">Hours</option>
                    <option value="Days">Days</option>
                    <option value="Weeks">Weeks</option>
                    <option value="Months">Months</option>
                    <option value="Years">Years</option>
                </select>
            </div>

            <select
                value={form.severity}
                onChange={e => handleChange('severity', e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg outline-none focus:border-blue-500 bg-white"
            >
                <option value="">Select severity</option>
                <option value="Mild">Mild</option>
                <option value="Moderate">Moderate</option>
                <option value="Severe">Severe</option>
            </select>

            <textarea
                placeholder="Additional description (optional) — e.g. 'worse at night', 'triggered by cold air'"
                value={form.description}
                onChange={e => handleChange('description', e.target.value)}
                rows={2}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg outline-none focus:border-blue-500 resize-none text-sm"
            />

            <div className="flex gap-2 justify-end">
                <button
                    onClick={() => isValid && onSave(form)}
                    disabled={!isValid}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
                >
                    <FontAwesomeIcon icon={faCheck} size="sm" />
                    Save
                </button>
                <button
                    onClick={onCancel}
                    className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 flex items-center gap-2 cursor-pointer"
                >
                    <FontAwesomeIcon icon={faTimes} size="sm" />
                    Cancel
                </button>
            </div>
        </div>
    );
};

// ─── Sub-form untuk add/edit History ─────────────────────────────────────────

interface HistoryFormProps {
    initial?: HistoryData;
    placeholder?: string;
    onSave: (h: HistoryData) => void;
    onCancel: () => void;
}

const HistoryForm: React.FC<HistoryFormProps> = ({
    initial = { name: '', description: '' },
    placeholder = 'Enter item',
    onSave,
    onCancel,
}) => {
    const [form, setForm] = useState<HistoryData>(initial);

    const isValid = form.name.trim() !== '';

    return (
        <div className="flex md:flex-row flex-col justify-between rounded-2xl border-b-2 p-5 w-full bg-white gap-2">
            <div className="flex flex-col gap-2 flex-1">
                <input
                    type="text"
                    value={form.name}
                    onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                    onKeyDown={e => e.key === 'Enter' && isValid && onSave(form)}
                    className="w-full outline-none border-b border-gray-200 pb-1 focus:border-blue-500"
                    placeholder={placeholder}
                    autoFocus
                />
                <input
                    type="text"
                    value={form.description}
                    onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full outline-none border-b border-gray-200 pb-1 text-sm text-gray-500 focus:border-blue-500"
                    placeholder="Description (optional)"
                />
            </div>
            <div className="flex gap-3 justify-center md:justify-between">
                <button
                    onClick={() => isValid && onSave(form)}
                    disabled={!isValid}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                >
                    <FontAwesomeIcon icon={faCheck} size="1x" />
                    Save
                </button>
                <button
                    onClick={onCancel}
                    className="px-4 py-2 bg-red-400 text-white rounded-lg hover:bg-gray-500 flex items-center gap-2 cursor-pointer"
                >
                    <FontAwesomeIcon icon={faTimes} size="1x" />
                    Cancel
                </button>
            </div>
        </div>
    );
};

// ─── Komponen utama ───────────────────────────────────────────────────────────

const EditableList: React.FC<EditableListProps> = ({
    items,
    onAdd,
    onUpdate,
    onDelete,
    variant,
    placeholder = 'Enter item',
    addButtonText = 'Add Item',
    emptyStateTitle = 'No items added yet',
    emptyStateSubtitle = 'Click the button below to add your first entry',
    showConfirmDelete = true,
}) => {
    const [showAdd, setShowAdd] = useState(false);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);

    const safeItems = Array.isArray(items) ? items : [];

    const handleDelete = (index: number) => {
        if (showConfirmDelete) {
            const label = getItemLabel(safeItems[index], variant);
            const confirmed = window.confirm(`Are you sure you want to delete "${label}"?`);
            if (!confirmed) return;
        }
        onDelete(index);
    };

    return (
        <div className="flex flex-col items-center bg-gradient-to-bl from-slate-200 to-sky-50 w-full h-120 rounded-2xl p-10 gap-10 border border-blue-200">
            <div className="flex-1 overflow-y-auto max-h-80 px-4 w-full py-5">
                <ul className="space-y-4">
                    {safeItems.map((item, i) => (
                        <li
                            key={i}
                            className="w-full transform transition-all duration-300 hover:scale-[1.02]"
                            style={{ animationDelay: `${i * 0.1}s` }}
                        >
                            {editingIndex === i ? (
                                variant === 'symptoms' ? (
                                    <SymptomForm
                                        initial={item as Symptom}
                                        onSave={newVal => {
                                            (onUpdate as SymptomVariant['onUpdate'])(i, newVal);
                                            setEditingIndex(null);
                                        }}
                                        onCancel={() => setEditingIndex(null)}
                                    />
                                ) : (
                                    <HistoryForm
                                        initial={item as HistoryData}
                                        placeholder={placeholder}
                                        onSave={newVal => {
                                            (onUpdate as HistoryVariant['onUpdate'])(i, newVal);
                                            setEditingIndex(null);
                                        }}
                                        onCancel={() => setEditingIndex(null)}
                                    />
                                )
                            ) : (
                                <div className="flex items-center justify-between bg-white rounded-xl shadow-md border border-gray-100 p-4 transition-all duration-300 hover:shadow-lg hover:border-blue-200 group">
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <div className="w-3 h-3 bg-blue-500 rounded-full flex-shrink-0" />
                                        <div className="flex flex-col min-w-0">
                                            <span className="text-lg font-medium text-gray-700 group-hover:text-gray-900 truncate">
                                                {variant === 'symptoms'
                                                    ? (item as Symptom).name
                                                    : (item as HistoryData).name}
                                            </span>
                                            {variant === 'symptoms' && (
                                                <span className="text-sm text-gray-400">
                                                    {(item as Symptom).duration} · {(item as Symptom).severity}
                                                    {(item as Symptom).description && (
                                                        <span className="text-xs text-gray-400 truncate italic">
                                                            {(item as Symptom).description}
                                                        </span>
                                                    )}
                                                </span>
                                            )}
                                            {variant === 'history' && (item as HistoryData).description && (
                                                <span className="text-sm text-gray-400 truncate">
                                                    {(item as HistoryData).description}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex md:gap-3 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <button
                                            className="p-2 rounded-lg hover:bg-blue-50 transition-all duration-200 transform hover:scale-110 cursor-pointer"
                                            onClick={() => setEditingIndex(i)}
                                            title="Edit"
                                        >
                                            <FontAwesomeIcon icon={faEdit} size="lg" className="text-blue-500 hover:text-blue-600" />
                                        </button>
                                        <button
                                            className="p-2 rounded-lg hover:bg-red-50 transition-all duration-200 transform hover:scale-110 cursor-pointer"
                                            onClick={() => handleDelete(i)}
                                            title="Delete"
                                        >
                                            <FontAwesomeIcon icon={faTrashAlt} size="lg" className="text-red-500 hover:text-red-600" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </li>
                    ))}
                </ul>

                {safeItems.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <FontAwesomeIcon icon={faPlusSquare} size="2x" className="text-gray-400" />
                        </div>
                        <p className="text-gray-500 text-lg">{emptyStateTitle}</p>
                        <p className="text-gray-400 text-sm mt-1">{emptyStateSubtitle}</p>
                    </div>
                )}
            </div>

            {!showAdd ? (
                <button
                    className="bg-[#628EF7] hover:bg-blue-600 text-white font-bold lg:w-[40%] w-full p-5 cursor-pointer rounded-2xl flex justify-center gap-3 items-center transform transition-all duration-300 ease-in-out hover:scale-110"
                    onClick={() => setShowAdd(true)}
                >
                    <span className="md:text-xl text-sm">{addButtonText}</span>
                    <FontAwesomeIcon icon={faPlusSquare} size="lg" />
                </button>
            ) : variant === 'symptoms' ? (
                <SymptomForm
                    onSave={newVal => {
                        (onAdd as SymptomVariant['onAdd'])(newVal);
                        setShowAdd(false);
                    }}
                    onCancel={() => setShowAdd(false)}
                />
            ) : (
                <HistoryForm
                    placeholder={placeholder}
                    onSave={newVal => {
                        (onAdd as HistoryVariant['onAdd'])(newVal);
                        setShowAdd(false);
                    }}
                    onCancel={() => setShowAdd(false)}
                />
            )}
        </div>
    );
};

export default EditableList;