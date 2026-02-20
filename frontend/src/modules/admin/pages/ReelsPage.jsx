import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Video, ExternalLink, Play } from 'lucide-react';
import toast from 'react-hot-toast';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { API_BASE_URL } from '@/lib/apiUrl';

const API_URL = API_BASE_URL;

const ReelsPage = () => {
    const queryClient = useQueryClient();
    const [localReels, setLocalReels] = useState([]);
    const [isDirty, setIsDirty] = useState(false);
    const [deletedReelIds, setDeletedReelIds] = useState([]);

    // Fetch Reels
    const { data: serverReels = [] } = useQuery({
        queryKey: ['reels'],
        queryFn: async () => {
             const res = await fetch(`${API_URL}/reels`);
             if (!res.ok) throw new Error('Failed to fetch reels');
             return res.json();
        }
    });

    // Validates if it's a fresh load to reset local state
    useEffect(() => {
        if (serverReels && !isDirty) {
            setLocalReels(JSON.parse(JSON.stringify(serverReels)));
            setDeletedReelIds([]);
        }
    }, [serverReels, isDirty]);

    const createMutation = useMutation({
        mutationFn: async (reel) => {
            const res = await fetch(`${API_URL}/reels`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(reel)
            });
            return res.json();
        }
    });

    const updateMutation = useMutation({
        mutationFn: async (reel) => {
            const res = await fetch(`${API_URL}/reels/${reel._id || reel.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(reel)
            });
            return res.json();
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async (id) => {
            await fetch(`${API_URL}/reels/${id}`, { method: 'DELETE' });
        }
    });

    const handleAddReel = () => {
        setLocalReels([
            ...localReels,
            { id: null, video: '', link: '', title: '' } // Uses 'id: null' to mark new
        ]);
        setIsDirty(true);
    };

    const handleRemoveReel = (index) => {
        const reelToRemove = localReels[index];
        if (reelToRemove._id || reelToRemove.id) {
            setDeletedReelIds([...deletedReelIds, reelToRemove._id || reelToRemove.id]);
        }
        const newReels = [...localReels];
        newReels.splice(index, 1);
        setLocalReels(newReels);
        setIsDirty(true);
    };

    const handleUpdateReel = (index, field, value) => {
        const newReels = [...localReels];
        newReels[index][field] = value;
        setLocalReels(newReels);
        setIsDirty(true);
    };

    const handleVideoUpload = (index, e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                handleUpdateReel(index, 'video', reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSaveClick = async () => {
        const toastId = toast.loading('Saving changes...');
        try {
            // 1. Delete removed reels
            await Promise.all(deletedReelIds.map(id => deleteMutation.mutateAsync(id)));

            // 2. Create/Update reels
            await Promise.all(localReels.map(reel => {
                if (reel._id || reel.id) {
                    return updateMutation.mutateAsync(reel);
                } else {
                    return createMutation.mutateAsync(reel);
                }
            }));

            toast.success('Reels updated successfully!', { id: toastId });
            setIsDirty(false);
            setDeletedReelIds([]);
            queryClient.invalidateQueries(['reels']);
        } catch (error) {
            console.error(error);
            toast.error('Failed to save changes', { id: toastId });
        }
    };
    
    // Unused in this refactor but kept to avoid destructuring error if old code references it
    const [viewReel, setViewReel] = useState(null);

    return (
        <div className="p-6 md:p-8 space-y-8 min-h-screen bg-gray-50/50">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Reels Management</h1>
                    <p className="text-gray-500 mt-2 font-medium">Manage video content and product links</p>
                </div>
                <div className="flex items-center gap-4">
                    {isDirty && (
                        <span className="text-xs font-bold text-amber-500 uppercase tracking-wide animate-pulse">
                            Unsaved Changes
                        </span>
                    )}
                    <button
                        onClick={handleSaveClick}
                        className="flex items-center gap-2 bg-footerBg text-white px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg hover:shadow-black/20 active:scale-95"
                    >
                        Save Reels
                    </button>
                </div>
            </div>

            {/* Table View */}
            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-50 bg-gray-50/50">
                                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] w-32">Video</th>
                                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Title / Caption</th>
                                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Product Link</th>
                                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {localReels.map((reel, index) => (
                                <tr key={index} className="group hover:bg-gray-50/50 transition-all">
                                    <td className="px-6 py-4">
                                        <div className="w-16 aspect-[9/16] bg-gray-100 rounded-lg overflow-hidden border border-gray-200 relative group/video cursor-pointer" onClick={() => document.getElementById(`video-upload-${index}`).click()}>
                                            {reel.video ? (
                                                <video src={reel.video} className="w-full h-full object-cover" muted />
                                            ) : (
                                                <div className="absolute inset-0 flex items-center justify-center text-gray-300">
                                                    <Video size={16} />
                                                </div>
                                            )}
                                            <input
                                                id={`video-upload-${index}`}
                                                type="file"
                                                accept="video/*"
                                                className="hidden"
                                                onChange={(e) => handleVideoUpload(index, e)}
                                            />
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/video:opacity-100 transition-opacity">
                                                <Plus size={16} className="text-white" />
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <input
                                            type="text"
                                            value={reel.title || ''}
                                            onChange={(e) => handleUpdateReel(index, 'title', e.target.value)}
                                            placeholder="Enter caption..."
                                            className="w-full bg-transparent border-none p-0 font-bold text-gray-700 placeholder:text-gray-300 focus:ring-0 text-sm"
                                        />
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg border border-transparent focus-within:border-primary/20 focus-within:bg-white transition-all max-w-sm">
                                            <ExternalLink size={14} className="text-gray-400 flex-shrink-0" />
                                            <input
                                                type="text"
                                                value={reel.link || ''}
                                                onChange={(e) => handleUpdateReel(index, 'link', e.target.value)}
                                                placeholder="/product/..."
                                                className="w-full bg-transparent border-none p-0 text-xs font-medium text-gray-600 focus:ring-0"
                                            />
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => setViewReel(reel)}
                                                className="p-2 text-gray-400 hover:text-primary hover:bg-white rounded-lg border border-transparent hover:border-gray-100 transition-all"
                                                title="View Details"
                                            >
                                                <Play size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleRemoveReel(index)}
                                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-white rounded-lg border border-transparent hover:border-gray-100 transition-all"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {/* Add Row Button */}
                            <tr>
                                <td colSpan={4} className="px-6 py-4">
                                    <button
                                        onClick={handleAddReel}
                                        className="flex items-center gap-2 text-xs font-black text-primary uppercase tracking-widest hover:bg-primary/5 px-4 py-3 rounded-xl transition-all w-full justify-center border border-dashed border-primary/20 hover:border-primary"
                                    >
                                        <Plus size={14} /> Add New Reel
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* View Modal */}
            {viewReel && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setViewReel(null)} />
                    <div className="relative bg-black rounded-[2rem] w-full max-w-4xl h-[80vh] flex overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                        {/* Video Side */}
                        <div className="flex-1 bg-black flex items-center justify-center relative">
                            {viewReel.video ? (
                                <video
                                    src={viewReel.video}
                                    className="w-full h-full object-contain"
                                    controls
                                    autoPlay
                                />
                            ) : (
                                <div className="text-white/30 flex flex-col items-center">
                                    <Video size={48} />
                                    <p className="mt-4 font-medium">No Video Source</p>
                                </div>
                            )}
                        </div>

                        {/* Info Side */}
                        <div className="w-80 bg-white p-8 flex flex-col relative z-10">
                            <button onClick={() => setViewReel(null)} className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full text-gray-500">
                                <Plus size={24} className="rotate-45" />
                            </button>

                            <h2 className="text-xl font-black text-gray-900 mt-8 mb-2">Reel Details</h2>
                            <div className="space-y-6 flex-1">
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Caption</label>
                                    <p className="text-sm font-medium text-gray-800">{viewReel.title || 'No Caption'}</p>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Linked Product</label>
                                    <div className="flex items-center gap-2 text-primary text-sm font-bold bg-primary/5 p-3 rounded-xl">
                                        <ExternalLink size={16} />
                                        <span className="truncate">{viewReel.link || 'No Link'}</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Video Source</label>
                                    <p className="text-xs text-gray-500 break-all font-mono bg-gray-50 p-3 rounded-xl border border-gray-100">
                                        {viewReel.video ? (viewReel.video.length > 50 ? viewReel.video.substring(0, 50) + '...' : viewReel.video) : 'Empty'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReelsPage;
