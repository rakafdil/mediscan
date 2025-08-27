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
        className="px-4 py-2 bg-purple-500 text-white rounded cursor-pointer"
    >
        Next
    </Button>
);

export const BackButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
    <Button
        onClick={onClick}
        className="flex-1 max-w-xs px-4 py-2 bg-gray-300 rounded cursor-pointer"
    >
        Kembali
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