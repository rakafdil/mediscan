import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlusSquare, faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
import { faEdit, faTrashAlt } from '@fortawesome/free-regular-svg-icons';

interface EditableListProps {
    items: string[];
    onAdd: (item: string) => void;
    onUpdate: (index: number, newValue: string) => void;
    onDelete: (index: number) => void;
    placeholder?: string;
    addButtonText?: string;
    emptyStateTitle?: string;
    emptyStateSubtitle?: string;
    showConfirmDelete?: boolean;
}

const EditableList: React.FC<EditableListProps> = ({
    items,
    onAdd,
    onUpdate,
    onDelete,
    placeholder = "Enter item",
    addButtonText = "Add Item",
    emptyStateTitle = "No items added yet",
    emptyStateSubtitle = "Click the button below to add your first entry",
    showConfirmDelete = true
}) => {
    const [input, setInput] = useState("");
    const [showAdd, setShowAdd] = useState(false);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [editValue, setEditValue] = useState("");

    const handleAdd = () => {
        if (input.trim() === "") return;
        onAdd(input);
        setInput("");
        setShowAdd(false);
    };

    const handleUpdate = (index: number, newValue: string) => {
        onUpdate(index, newValue);
        setEditingIndex(null);
    };

    const handleDelete = (index: number) => {
        if (showConfirmDelete) {
            const confirmed = window.confirm(
                `Are you sure you want to delete "${items[index]}"?`
            );
            if (!confirmed) return;
        }
        onDelete(index);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAdd();
        }
    };

    const handleEditKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleUpdate(index, editValue);
        }
    };

    return (
        <div className='flex flex-col items-center bg-gradient-to-bl from-slate-200 to-sky-50 w-full h-120 rounded-2xl p-10 gap-10 border border-blue-200'>
            <div className='flex-1 overflow-y-auto max-h-80 px-4 w-full py-5'>
                <ul className='space-y-4'>
                    {items
                        .filter(item => item.trim() !== "")
                        .map((item, i) => (
                            <li
                                key={i}
                                className='w-[100%] transform transition-all duration-300 hover:scale-[1.02]'
                                style={{ animationDelay: `${i * 0.1}s` }}
                            >
                                {(editingIndex === i) ? (
                                    <div className='flex md:flex-row flex-col items-center justify-between bg-white rounded-xl shadow-lg border-2 border-blue-200 p-4 gap-4'>
                                        <input
                                            type="text"
                                            value={editValue}
                                            onChange={(e) => setEditValue(e.target.value)}
                                            onKeyDown={(e) => handleEditKeyDown(e, i)}
                                            className="flex-1 text-lg px-4 py-3 border-2 border-gray-200 rounded-lg outline-none transition-all duration-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 w-full"
                                            placeholder={placeholder}
                                            autoFocus
                                        />
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleUpdate(i, editValue)}
                                                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all duration-300 flex items-center gap-2 shadow-md hover:shadow-lg transform hover:scale-105 cursor-pointer"
                                            >
                                                <FontAwesomeIcon icon={faCheck} size="sm" />
                                                <span className="font-medium">Save</span>
                                            </button>
                                            <button
                                                onClick={() => setEditingIndex(null)}
                                                className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition-all duration-300 flex items-center gap-2 shadow-md hover:shadow-lg transform hover:scale-105 cursor-pointer"
                                            >
                                                <FontAwesomeIcon icon={faTimes} size="sm" />
                                                <span className="font-medium">Cancel</span>
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className='flex items-center justify-between bg-white rounded-xl shadow-md border border-gray-100 p-4 transition-all duration-300 hover:shadow-lg hover:border-blue-200 group'>
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                            <div className="w-3 h-3 bg-blue-500 rounded-full flex-shrink-0"></div>
                                            <span className="text-lg font-medium text-gray-700 group-hover:text-gray-900 transition-colors duration-300 truncate">
                                                {item}
                                            </span>
                                        </div>
                                        <div className='flex md:gap-3 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity duration-300'>
                                            <button
                                                className='p-2 rounded-lg hover:bg-blue-50 transition-all duration-200 transform hover:scale-110 cursor-pointer'
                                                onClick={() => {
                                                    setEditingIndex(i);
                                                    setEditValue(item);
                                                }}
                                                title="Edit"
                                            >
                                                <FontAwesomeIcon
                                                    icon={faEdit}
                                                    size='lg'
                                                    className="text-blue-500 hover:text-blue-600"
                                                />
                                            </button>
                                            <button
                                                className='p-2 rounded-lg hover:bg-red-50 transition-all duration-200 transform hover:scale-110 cursor-pointer'
                                                onClick={() => handleDelete(i)}
                                                title="Delete"
                                            >
                                                <FontAwesomeIcon
                                                    icon={faTrashAlt}
                                                    size='lg'
                                                    className="text-red-500 hover:text-red-600"
                                                />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </li>
                        ))}
                </ul>

                {items.filter(item => item.trim() !== "").length === 0 && (
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
                    className='bg-[#628EF7] hover:bg-blue-600 text-white font-bold lg:w-[40%] w-full p-5 cursor-pointer rounded-2xl flex justify-center gap-3 items-center transform transition-all duration-300 ease-in-out hover:scale-110'
                    onClick={() => setShowAdd(true)}
                >
                    <span className='md:text-xl text-sm'>{addButtonText}</span>
                    <FontAwesomeIcon icon={faPlusSquare} size='lg' />
                </button>
            ) : (
                <div className='flex md:flex-row flex-col justify-between rounded-2xl border-b-2 p-5 w-full bg-white gap-2 transform transition-all duration-300 ease-in-out hover:shadow-md'>
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="w-full outline-none transition-all duration-300 focus:border-blue-500"
                        placeholder={placeholder}
                    />
                    <div className="flex gap-3 justify-center md:justify-between">
                        <button
                            onClick={handleAdd}
                            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all duration-300 flex items-center gap-2 shadow-md hover:shadow-lg transform hover:scale-105 cursor-pointer"
                        >
                            <FontAwesomeIcon icon={faCheck} size="1x" />
                            Save
                        </button>
                        <button
                            onClick={() => {
                                setShowAdd(false);
                                setInput("");
                            }}
                            className="px-4 py-2 bg-red-400 text-white rounded-lg hover:bg-gray-500 transition-all duration-300 flex items-center gap-2 shadow-md hover:shadow-lg transform hover:scale-105 cursor-pointer"
                        >
                            <FontAwesomeIcon icon={faTimes} size="1x" />
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EditableList;