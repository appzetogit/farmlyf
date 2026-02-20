import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Save,
    RotateCcw,
    Plus,
    Trash2,
    Edit2,
    Check,
    X,
    HelpCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

const DEFAULT_QUESTIONS = [
    {
        id: 1,
        question: "How do I place an order?",
        answer: "You can place an order by browsing our products, adding items to your cart, and proceeding to checkout."
    },
    {
        id: 2,
        question: "What payment methods do you accept?",
        answer: "We accept all major credit cards, debit cards, UPI, and net banking."
    },
    {
        id: 3,
        question: "Do you offer international shipping?",
        answer: "Currently, we only ship within India. We are working on expanding our delivery network."
    }
];

import { useFAQs, useAddFAQ, useUpdateFAQ, useDeleteFAQ } from '../../../hooks/useContent';

const FAQSectionPage = () => {
    const navigate = useNavigate();
    const { data: faqs = [], isLoading: loading } = useFAQs();
    const addFAQMutation = useAddFAQ();
    const updateFAQMutation = useUpdateFAQ();
    const deleteFAQMutation = useDeleteFAQ();

    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({ question: '', answer: '' });
    const [isAdding, setIsAdding] = useState(false);

    const handleReset = () => {
        if (confirm('Are you sure you want to reset all FAQs to default?')) {
            // This would require a special reset API or just manual cleanup
            toast.error('Resetting to default is not supported for server-side data yet.');
        }
    };

    const handleDelete = (id) => {
        if (confirm('Delete this FAQ?')) {
            deleteFAQMutation.mutate(id);
        }
    };

    const startEdit = (faq) => {
        setEditingId(faq._id || faq.id);
        setEditForm({ question: faq.question, answer: faq.answer });
        setIsAdding(false);
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditForm({ question: '', answer: '' });
        setIsAdding(false);
    };

    const saveEdit = async () => {
        if (!editForm.question.trim() || !editForm.answer.trim()) {
            toast.error('Question and Answer are required');
            return;
        }

        try {
            if (isAdding) {
                await addFAQMutation.mutateAsync({
                    ...editForm,
                    order: faqs.length
                });
            } else {
                await updateFAQMutation.mutateAsync({
                    id: editingId,
                    data: editForm
                });
            }
            cancelEdit();
        } catch (error) { }
    };

    const startAdd = () => {
        setIsAdding(true);
        setEditingId(null);
        setEditForm({ question: '', answer: '' });
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="space-y-8 font-['Inter'] pb-32">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-3 bg-white text-footerBg rounded-2xl border border-gray-100 shadow-sm hover:bg-gray-50 transition-all group"
                    >
                        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <div>
                        <h1 className="text-xl font-black text-[#1a1a1a] uppercase tracking-tight">FAQ Section</h1>
                        <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-[0.2em]">Manage frequently asked questions</p>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={handleReset}
                        className="px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-600 text-xs font-bold hover:bg-gray-50 flex items-center gap-2"
                    >
                        <RotateCcw size={16} />
                        Reset Default
                    </button>
                    {!isAdding && !editingId && (
                        <button
                            onClick={startAdd}
                            className="px-6 py-2.5 rounded-xl bg-black text-white text-xs font-bold hover:bg-gray-800 transition-all flex items-center gap-2 shadow-lg shadow-gray-200"
                        >
                            <Plus size={16} />
                            Add New FAQ
                        </button>
                    )}
                </div>
            </div>

            <div className="max-w-4xl mx-auto space-y-6">

                {/* Add/Edit Form */}
                {(isAdding || editingId) && (
                    <div className="bg-white rounded-3xl border-2 border-primary/20 shadow-lg p-6 animate-in slide-in-from-top-4 duration-200">
                        <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-2">
                            <h3 className="font-bold text-gray-900 text-sm">
                                {isAdding ? 'Add New Question' : 'Edit Question'}
                            </h3>
                            <button onClick={cancelEdit} className="text-gray-400 hover:text-gray-600">
                                <X size={18} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] font-bold text-gray-500 uppercase mb-1.5 block">Question</label>
                                <input
                                    type="text"
                                    value={editForm.question}
                                    onChange={(e) => setEditForm(prev => ({ ...prev, question: e.target.value }))}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-bold text-sm outline-none focus:bg-white focus:border-primary transition-all"
                                    placeholder="e.g. What is the return policy?"
                                    autoFocus
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-gray-500 uppercase mb-1.5 block">Answer</label>
                                <textarea
                                    rows="4"
                                    value={editForm.answer}
                                    onChange={(e) => setEditForm(prev => ({ ...prev, answer: e.target.value }))}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:bg-white focus:border-primary transition-all resize-none"
                                    placeholder="Enter the detailed answer here..."
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={cancelEdit}
                                className="px-5 py-2.5 rounded-xl border border-gray-200 font-bold text-gray-500 hover:bg-gray-50 transition-all text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={saveEdit}
                                className="px-6 py-2.5 rounded-xl bg-primary text-white font-bold hover:bg-primaryDeep shadow-lg shadow-primary/20 transition-all text-sm flex items-center gap-2"
                            >
                                <Save size={16} />
                                {isAdding ? 'Add Question' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                )}

                {/* FAQ List */}
                <div className="space-y-3">
                    {faqs.map((faq, index) => (
                        <div
                            key={faq._id || faq.id}
                            className={`bg-white rounded-2xl border p-5 transition-all
                                ${editingId === (faq._id || faq.id) ? 'border-primary ring-1 ring-primary shadow-md opacity-50 pointer-events-none' : 'border-gray-100 hover:border-gray-200 hover:shadow-sm'}
                            `}
                        >
                            <div className="flex items-start gap-4">
                                <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center shrink-0 text-gray-400 font-bold text-xs">
                                    {index + 1}
                                </div>
                                <div className="flex-1 space-y-1">
                                    <h3 className="font-bold text-gray-900 text-sm">{faq.question}</h3>
                                    <p className="text-sm text-gray-500 leading-relaxed">{faq.answer}</p>
                                </div>
                                <div className="flex gap-2 shrink-0">
                                    <button
                                        onClick={() => startEdit(faq)}
                                        className="p-2 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
                                        title="Edit"
                                        disabled={editingId !== null}
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(faq._id || faq.id)}
                                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Delete"
                                        disabled={editingId !== null}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}

                    {faqs.length === 0 && (
                        <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                            <HelpCircle size={48} className="mx-auto text-gray-300 mb-3" />
                            <h3 className="text-gray-900 font-bold">No FAQs added yet</h3>
                            <p className="text-gray-500 text-xs mt-1">Click "Add New FAQ" to get started</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FAQSectionPage;
