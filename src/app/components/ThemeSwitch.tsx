'use client'

import { FiSun, FiMoon, FiMonitor } from "react-icons/fi"
import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'
import Image from "next/image"

export default function ThemeSwitch() {
    const [mounted, setMounted] = useState(false)
    const [isHovered, setIsHovered] = useState(false)
    const { setTheme, resolvedTheme } = useTheme()

    useEffect(() => setMounted(true), [])

    if (!mounted) return (
        <div className="fixed bottom-6 right-6 z-50">
            <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-3 animate-pulse">
                <Image
                    src="data:image/svg+xml;base64,PHN2ZyBzdHJva2U9IiNGRkZGRkYiIGZpbGw9IiNGRkZGRkYiIHN0cm9rZS13aWR0aD0iMCIgdmlld0JveD0iMCAwIDI0IDI0IiBoZWlnaHQ9IjIwMHB4IiB3aWR0aD0iMjAwcHgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIiB4PSIyIiB5PSIyIiBmaWxsPSJub25lIiBzdHJva2Utd2lkdGg9IjIiIHJ4PSIyIj48L3JlY3Q+PC9zdmc+Cg=="
                    width={24}
                    height={24}
                    alt="Loading"
                    className="opacity-50"
                />
            </div>
        </div>
    )

    return (
        <div className="fixed bottom-6 right-6 z-50">
            <div className="relative">
                {/* Tooltip */}
                {isHovered && (
                    <div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-gray-900 dark:bg-gray-700 text-white text-sm rounded-lg shadow-lg whitespace-nowrap animate-fadeIn">
                        {resolvedTheme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}
                        <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900 dark:border-t-gray-700"></div>
                    </div>
                )}
                
                {/* Button Container */}
                <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl shadow-lg hover:shadow-xl border border-gray-200 dark:border-gray-700 p-1">
                    <button
                        onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
                        onMouseEnter={() => setIsHovered(true)}
                        onMouseLeave={() => setIsHovered(false)}
                        className="w-full h-full p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 group"
                        aria-label="Toggle theme"
                    >
                        <div className="flex flex-col items-center gap-1">
                            {resolvedTheme === 'dark' ? (
                                <FiSun className="w-5 h-5 text-yellow-500 group-hover:text-yellow-400 transition-colors" />
                            ) : (
                                <FiMoon className="w-5 h-5 text-blue-600 dark:text-blue-400 group-hover:text-blue-500 transition-colors" />
                            )}
                        </div>
                    </button>
                </div>
            </div>
        </div>
    )
}