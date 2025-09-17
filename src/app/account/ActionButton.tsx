interface ActionButtonsProps {
    handleLogout: () => void
    updateProfile: () => void
    saving: boolean
}

const ActionButtons: React.FC<ActionButtonsProps> = ({ handleLogout, updateProfile, saving }) => (
    <div className="border-t px-8 py-6 bg-gray-50 rounded-b-2xl">
        <div className="flex justify-between items-center">
            <button
                onClick={handleLogout}
                type="button"
                className="cursor-pointer md:px-8 md:py-3 px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
                Sign Out
            </button>
            <button
                onClick={updateProfile}
                disabled={saving}
                className="cursor-pointer md:px-8 md:py-3 px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
                {saving ? (
                    <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Saving...</span>
                    </>
                ) : (
                    <span>Save Changes</span>
                )}
            </button>
        </div>
    </div>
)

export default ActionButtons;