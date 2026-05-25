import { useState, type FC } from 'react'
import AdminVideos from './AdminVideos'
import AdminUsers from './AdminUsers'
import { BiVideo, BiUser } from 'react-icons/bi'

const AdminPanel: FC = () => {
    const [activeTab, setActiveTab] = useState<'videos' | 'users'>('videos')

    return (
        <div className="mx-auto max-w-6xl px-4 py-8">
            <div className="mb-6 flex border-b border-gray-200">
                <button
                    onClick={() => setActiveTab('videos')}
                    className={`flex items-center gap-2 border-b-2 px-6 py-3 text-sm font-bold transition-all ${
                        activeTab === 'videos'
                            ? 'border-pink-600 text-pink-600'
                            : 'border-transparent text-gray-400 hover:text-gray-600'
                    }`}
                >
                    <BiVideo className="h-5 w-5" />
                    Керування відео
                </button>
                <button
                    onClick={() => setActiveTab('users')}
                    className={`flex items-center gap-2 border-b-2 px-6 py-3 text-sm font-bold transition-all ${
                        activeTab === 'users'
                            ? 'border-pink-600 text-pink-600'
                            : 'border-transparent text-gray-400 hover:text-gray-600'
                    }`}
                >
                    <BiUser className="h-5 w-5" />
                    Користувачі
                </button>
            </div>

            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                {activeTab === 'videos' ? <AdminVideos /> : <AdminUsers />}
            </div>
        </div>
    )
}

export default AdminPanel
