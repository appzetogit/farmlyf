import React, { useState, useEffect } from 'react';
import { AlertTriangle, Plus, Save, Trash2 } from 'lucide-react';
import { useSetting, useUpdateSetting } from '../../../hooks/useSettings';

const MarqueeSettings = () => {
    const { data: marqueeSetting, isLoading } = useSetting('marquee_text');
    const updateMutation = useUpdateSetting();
    const [localItems, setLocalItems] = useState([]);

    useEffect(() => {
        if (marqueeSetting?.value) {
            setLocalItems(marqueeSetting.value);
        } else {
            setLocalItems([
                "✨ REPUBLIC DAY SALE: UP TO 60% OFF ✨",
                "PREMIUM DRY FRUITS FOR YOUR FAMILY",
                "🥜 EXTRA 10% OFF ON JUMBO NUTS 🥜",
                "100% ORGANIC & FRESH"
            ]);
        }
    }, [marqueeSetting]);

    const handleUpdate = () => {
        updateMutation.mutate(
            { key: 'marquee_text', value: localItems.filter(i => i.trim() !== '') }
        );
    };

    const addItem = () => setLocalItems([...localItems, '']);
    const removeItem = (idx) => setLocalItems(localItems.filter((_, i) => i !== idx));
    const updateItem = (idx, val) => {
        const newItems = [...localItems];
        newItems[idx] = val;
        setLocalItems(newItems);
    };

    if (isLoading) return <div className="animate-pulse bg-gray-100 h-64 rounded-[2.5rem]" />;

    return (
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm text-left">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h4 className="text-xl font-black text-footerBg uppercase tracking-tight">Homepage Announcements</h4>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Control the scrolling marquee text on the homepage</p>
                </div>
                <button 
                    onClick={handleUpdate}
                    disabled={updateMutation.isPending}
                    className="bg-primary text-white text-[10px] font-black uppercase tracking-widest px-6 py-3 rounded-xl transition-all hover:shadow-lg disabled:opacity-50 flex items-center gap-2"
                >
                    <Save size={14} />
                    {updateMutation.isPending ? 'Saving...' : 'Save All Changes'}
                </button>
            </div>

            <div className="space-y-4">
                {localItems.map((item, idx) => (
                    <div key={idx} className="flex gap-3 group">
                        <div className="flex-1 relative">
                            <input 
                                type="text" 
                                value={item}
                                onChange={(e) => updateItem(idx, e.target.value)}
                                className="w-full bg-gray-50 border border-transparent rounded-2xl px-5 py-3.5 text-xs font-bold outline-none focus:bg-white focus:border-primary transition-all pr-12"
                                placeholder="Enter announcement text..."
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-300 pointer-events-none uppercase">
                                Strip #{idx + 1}
                            </div>
                        </div>
                        <button 
                            onClick={() => removeItem(idx)}
                            className="p-3 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                            title="Remove item"
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>
                ))}
            </div>

            <button 
                onClick={addItem}
                className="mt-6 w-full py-4 border-2 border-dashed border-gray-100 rounded-2xl text-[10px] font-black text-gray-400 uppercase tracking-widest hover:border-primary hover:text-primary transition-all flex items-center justify-center gap-2"
            >
                <Plus size={16} /> Add New Message Item
            </button>

            {/* Live Preview Tip */}
            <div className="mt-8 p-4 bg-amber-50 rounded-2xl border border-amber-100 flex items-start gap-4">
                <div className="p-2 bg-white rounded-lg text-amber-600 shadow-sm">
                    <AlertTriangle size={16} />
                </div>
                <div>
                    <p className="text-[10px] font-black text-amber-900 uppercase tracking-tighter">Pro Tip: Keep it Concise</p>
                    <p className="text-[10px] text-amber-700 font-medium leading-relaxed mt-0.5">Short, punchy messages perform better on mobile devices and maintain a smooth scrolling speed.</p>
                </div>
            </div>
        </div>
    );
};

export default MarqueeSettings;
