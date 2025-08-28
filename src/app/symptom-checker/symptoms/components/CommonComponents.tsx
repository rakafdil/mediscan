import React from 'react';

interface ButtonProps {
    onClick: () => void;
    children: React.ReactNode;
    className?: string;
    disabled?: boolean;
    type?: "button" | "submit" | "reset";
}

export const Button: React.FC<ButtonProps> = ({
    onClick,
    children,
    className = "",
    disabled = false,
    type = "button"
}) => (
    <button
        type={type}
        onClick={onClick}
        disabled={disabled}
        className={className}
    >
        {children}
    </button>
);

export const NextButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
    <Button
        onClick={onClick}
        className="w-[30%] text-xl font-bold py-3 px-4 rounded-lg transition cursor-pointer bg-blue-500 text-white hover:bg-blue-600 hover:scale-105 shadow-lg hover:shadow-xl"
    >
        Next
    </Button>
);

export const BackButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
    <Button
        onClick={onClick}
        className="w-[30%] text-xl font-bold py-3 px-4 rounded-lg transition cursor-pointer bg-blue-500 text-white hover:bg-blue-600 hover:scale-105 shadow-lg hover:shadow-xl"
    >
        Back
    </Button>
);

interface ContainerProps {
    children: React.ReactNode;
    title?: string;
    className?: string;
    titleClassName?: string;
    containerClassName?: string;
}

export const StepContainer: React.FC<ContainerProps> = ({
    children,
    title,
    className = "",
    titleClassName = "",
    containerClassName = ""
}) => (
    <div className={`${containerClassName} ${className}`}>
        <h1 className={`${titleClassName} text-gray-800 mb-4`}>{title}</h1>
        {children}
    </div>
);