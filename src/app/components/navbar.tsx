"use client";

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faTimes } from '@fortawesome/free-solid-svg-icons';
import { motion, AnimatePresence } from 'framer-motion';
import Logo from "../../../public/assets/Logo.png";

interface NavLink {
    href: string;
    label: string;
}

interface NavigationProps {
    linkTo: string;
    text: string;
    isMobile?: boolean;
    onClick?: () => void;
}

const navLinks: NavLink[] = [
    { href: "/", label: "Home" },
    { href: "/symptom-checker", label: "Symptom Checker" },
    { href: "/hospital", label: "Hospital" },
    { href: "/article", label: "Article" },
];

const mobileMenuVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 120 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.2 } },
};

const Navigation: React.FC<NavigationProps> = ({ linkTo, text, isMobile = false, onClick }) => {
    const pathname = usePathname();
    const isActive = pathname === linkTo;

    return (
        <Link
            href={linkTo}
            onClick={onClick}
            className={`px-5 py-4 rounded-xl transition-colors duration-200 block 
                ${isMobile ? 'py-2 px-4 w-full' : ''
                } ${isActive
                    ? 'bg-[#217BFF] text-white font-bold after:scale-x-100'
                    : 'hover:text-gray-500'
                }
            ${isActive ? 'after:scale-x-100' : 'hover:after:scale-x-100'
                }`}
        >
            {text}
        </Link>
    );
};

const Navbar: React.FC = () => {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const navbarRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (isOpen && navbarRef.current && !navbarRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const toggleMenu = () => setIsOpen(!isOpen);
    const closeMenu = () => setIsOpen(false);

    return (
        <div ref={navbarRef} className='sticky top-0 w-full z-50 bg-white shadow-md'>
            <nav className="text-black px-4 sm:px-10 py-4">
                <div className="container mx-auto flex justify-between items-center">
                    {/* Logo */}
                    <Link href="/" className="flex flex-col items-center gap-2">
                        <Image
                            src={Logo}
                            alt="Logo Mediscan"
                            width={37}
                            height={37}
                            priority
                        />
                        <span className="font-josefin font-bold text-[#496687]">mediScan</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex ">
                        <ul className="flex flex-row items-center space-x-7">
                            {navLinks.map((link) => (
                                <li key={link.href}>
                                    <Navigation linkTo={link.href} text={link.label} />
                                </li>
                            ))}
                        </ul>
                    </div>
                    <Link
                        href="/login"
                        className="hidden md:flex bg-[#496687] text-white px-5 py-4 rounded-xl hover:bg-[#3a526c] transition-colors duration-200 font-semibold"
                    >
                        Login
                    </Link>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden">
                        <button
                            onClick={toggleMenu}
                            className="p-2 rounded-md hover:bg-gray-100 transition-colors"
                            aria-label="Toggle mobile menu"
                            aria-expanded={isOpen}
                        >
                            <FontAwesomeIcon
                                icon={isOpen ? faTimes : faBars}
                                className="text-2xl text-gray-700"
                            />
                        </button>
                    </div>
                </div>
            </nav>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Overlay */}
                        <motion.div
                            className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={closeMenu}
                        />

                        {/* Menu Content */}
                        <motion.div
                            className="md:hidden bg-white shadow-lg absolute w-full z-50"
                            variants={mobileMenuVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                        >
                            <ul className="flex flex-col items-center py-4 space-y-2">
                                {navLinks.map((link) => (
                                    <li key={link.href} className="w-full text-center">
                                        <Navigation
                                            linkTo={link.href}
                                            text={link.label}
                                            isMobile={true}
                                            onClick={closeMenu}
                                        />
                                    </li>
                                ))}
                                <li className="w-full text-center">
                                    <Navigation
                                        linkTo='/login'
                                        text='Login'
                                        isMobile={true}
                                        onClick={closeMenu}
                                    />
                                </li>
                            </ul>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Navbar;