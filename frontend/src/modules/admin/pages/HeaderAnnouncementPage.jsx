import React, { useState, useEffect, useRef } from 'react';
import { LayoutTemplate, Save, Megaphone, Trash2, Plus, Edit2, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAnnouncements, useAddAnnouncement, useUpdateAnnouncement, useDeleteAnnouncement } from '../../../hooks/useContent';

const HeaderAnnouncementPage = () => {
    const { data: allAnnouncements = [], isLoading: loading } = useAnnouncements();
    const addAnnouncementMutation = useAddAnnouncement();
    const updateAnnouncementMutation = useUpdateAnnouncement();
    const deleteAnnouncementMutation = useDeleteAnnouncement();

    const topBarAnnouncement = allAnnouncements.find(a => a.position === 'topbar');
    const marqueeAnnouncements = allAnnouncements.filter(a => a.position === 'marquee');

    const [topBarText, setTopBarText] = useState('');
    const [newLine, setNewLine] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editingText, setEditingText] = useState('');

    useEffect(() => {
        if (topBarAnnouncement) setTopBarText(topBarAnnouncement.text);
    }, [topBarAnnouncement]);

    const scrollRef = useRef(null);
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [marqueeAnnouncements.length]);

    // Handlers
    const handleSaveTopBar = async () => {
        try {
            if (topBarAnnouncement) {
                await updateAnnouncementMutation.mutateAsync({
                    id: topBarAnnouncement._id,
                    data: { text: topBarText }
                });
            } else {
                await addAnnouncementMutation.mutateAsync({
                    text: topBarText,
                    position: 'topbar'
                });
            }
        } catch (error) {}
    };

    const handleAddMarqueeLine = async () => {
        if (!newLine.trim()) return;
        try {
            await addAnnouncementMutation.mutateAsync({
                text: newLine,
                position: 'marquee'
            });
            setNewLine('');
        } catch (error) {}
    };

    const handleRemoveMarqueeLine = async (id) => {
        if (confirm('Remove this announcement?')) {
            try {
                await deleteAnnouncementMutation.mutateAsync(id);
            } catch (error) {}
        }
    };

    const handleStartEdit = (a) => {
        setEditingId(a._id);
        setEditingText(a.text);
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditingText('');
    };

    const handleUpdateMarqueeLine = async (id) => {
        if (!editingText.trim()) return;
        try {
            await updateAnnouncementMutation.mutateAsync({
                id,
                data: { text: editingText }
            });
            handleCancelEdit();
        } catch (error) {}
    };

    // handleSaveMarquee is no longer needed if we add one by one, 
    // but the UI has a "Save Announcements" button. 
    // I'll repurpose it or remove if confusing.
    const handleSaveMarquee = () => {
        toast.success('Announcements are saved automatically when added/removed.');
    };

    if (loading) {
        return <div className="p-10 text-center">Loading announcements...</div>;
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-[#1a1a1a] uppercase tracking-tight">Header & Announcements</h1>
                    <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest">Manage top bar and moving announcements</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* SECTION 1: Top Bar Text */}
                <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                            <LayoutTemplate size={20} />
                        </div>
                        <h2 className="text-lg font-black text-gray-900 uppercase tracking-tight">Top Bar Text</h2>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Display Text</label>
                            <div className="relative mt-1">
                                <input
                                    type="text"
                                    value={topBarText}
                                    onChange={(e) => setTopBarText(e.target.value)}
                                    placeholder="e.g. Free Shipping On Orders Above ₹1499/-"
                                    className="w-full bg-gray-50 border-none rounded-2xl pl-5 pr-4 py-4 text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-black/5 transition-all"
                                />
                            </div>
                            <p className="text-[10px] text-gray-400 font-medium mt-2 ml-1">
                                This text appears at the very top of the website (black/dark strip).
                            </p>
                        </div>

                        <button
                            onClick={handleSaveTopBar}
                            disabled={updateAnnouncementMutation.isPending}
                            className="bg-black text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-gray-900 transition-all w-full mt-4"
                        >
                            <Save size={16} /> {updateAnnouncementMutation.isPending ? 'Saving...' : 'Save Text'}
                        </button>
                    </div>
                </div>

                {/* SECTION 2: Marquee Announcements */}
                <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                        <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                            <Megaphone size={20} />
                        </div>
                        <h2 className="text-lg font-black text-gray-900 uppercase tracking-tight">Scrolling Announcements</h2>
                    </div>

                    <div className="space-y-6">
                        {/* List of active lines */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Active Lines</label>
                                {marqueeAnnouncements.length === 0 ? (
                                    <div className="text-center py-6 bg-gray-50 rounded-2xl text-gray-400 text-xs font-bold">
                                        No announcements added yet.
                                    </div>
                                ) : (
                                    <div 
                                        ref={scrollRef}
                                        className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar transition-all"
                                    >
                                        {marqueeAnnouncements.map((a, idx) => (
                                            <div key={a._id || idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100 min-h-[52px]">
                                                {editingId === a._id ? (
                                                    <div className="flex-1 flex gap-2">
                                                        <input
                                                            type="text"
                                                            value={editingText}
                                                            onChange={(e) => setEditingText(e.target.value)}
                                                            className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-1 text-xs font-bold outline-none focus:border-black"
                                                            autoFocus
                                                        />
                                                        <button onClick={() => handleUpdateMarqueeLine(a._id)} className="p-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600">
                                                            <Check size={14} />
                                                        </button>
                                                        <button onClick={handleCancelEdit} className="p-1.5 bg-gray-200 text-gray-500 rounded-lg hover:bg-gray-300">
                                                            <X size={14} />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <span className="text-xs font-bold text-gray-700 break-words flex-1 leading-relaxed flex items-center gap-3">
                                                            <span className="text-gray-300 font-light text-[10px]">|</span>
                                                            {a.text}
                                                            <span className="text-gray-300 font-light text-[10px]">|</span>
                                                        </span>
                                                        <div className="flex gap-2 ml-2">
                                                            <button
                                                                onClick={() => handleStartEdit(a)}
                                                                className="p-1.5 bg-white text-gray-400 rounded-lg hover:text-black hover:border-black border border-transparent transition-all"
                                                            >
                                                                <Edit2 size={14} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleRemoveMarqueeLine(a._id)}
                                                                className="p-1.5 bg-white text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                        </div>

                        {/* Add New Line */}
                        <div className="pt-4 border-t border-gray-100">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Add New Line</label>
                            <div className="flex gap-2 mt-1">
                                <input
                                    type="text"
                                    value={newLine}
                                    onChange={(e) => setNewLine(e.target.value)}
                                    placeholder="Type announcement here..."
                                    className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:border-black transition-all"
                                    onKeyDown={(e) => e.key === 'Enter' && handleAddMarqueeLine()}
                                />
                                <button
                                    onClick={handleAddMarqueeLine}
                                    className="bg-gray-900 text-white px-4 rounded-xl hover:bg-black transition-colors"
                                >
                                    <Plus size={18} />
                                </button>
                            </div>
                        </div>

                        {/* The redundant save button has been removed as adding/editing/deleting are atomic operations */}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HeaderAnnouncementPage;
