import React from 'react'

interface NotificationProps {
    type: 'success' | 'error'
    message: string
}

const showNotification = ({ type, message }: NotificationProps) => {
    const notification = document.createElement('div')
    notification.className = `fixed top-4 right-4 ${type === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fadeIn`
    notification.textContent = message
    document.body.appendChild(notification)
    setTimeout(() => notification.remove(), 3000)
}

export default showNotification;