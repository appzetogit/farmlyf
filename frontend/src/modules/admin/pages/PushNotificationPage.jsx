import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Send, Bell, CheckCircle, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNotifications } from '../../../hooks/useNotifications.jsx';
import { API_BASE_URL } from '@/lib/apiUrl';

const API_URL = API_BASE_URL;

const PushNotificationPage = () => {
    const [searchParams] = useSearchParams();
    const activeTab = searchParams.get('tab') || 'list';
    const { notificationPermission, initNotifications } = useNotifications();

    // Push Notification State
    const [pushMessage, setPushMessage] = useState({
        heading: '',
        message: '',
        target: 'all' // all, active, cart
    });
    const [loading, setLoading] = useState(false);
    const [resendingIds, setResendingIds] = useState(new Set()); // Track which notifications are being resent
    const [history, setHistory] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(true);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        pages: 1
    });

    // Fetch notification history
    useEffect(() => {
        if (activeTab === 'list') {
            fetchHistory(pagination.page);
        }
    }, [activeTab, pagination.page]);

    const fetchHistory = async (page = 1) => {
        try {
            setHistoryLoading(true);
            const response = await fetch(`${API_URL}/notifications/history?page=${page}&limit=${pagination.limit}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('farmlyf_token')}`
                },
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();
                setHistory(data.notifications);
                setPagination(prev => ({
                    ...prev,
                    total: data.pagination.total,
                    pages: data.pagination.pages,
                    page: data.pagination.page
                }));
            } else {
                console.error('Failed to fetch notification history');
            }
        } catch (error) {
            console.error('Error fetching history:', error);
        } finally {
            setHistoryLoading(false);
        }
    };

    const handleSendPush = async () => {
        if (!pushMessage.heading || !pushMessage.message) {
            toast.error("Please enter both heading and message");
            return;
        }

        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/notifications/send`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('farmlyf_token')}`
                },
                credentials: 'include',
                body: JSON.stringify(pushMessage)
            });

            const data = await response.json();

            if (response.ok) {
                toast.success(data.message || 'Notification sent successfully!');
                setPushMessage({ heading: '', message: '', target: 'all' });
                // Refresh history
                fetchHistory();
            } else {
                toast.error(data.error || 'Failed to send notification');
            }
        } catch (error) {
            console.error('Error sending notification:', error);
            toast.error('Failed to send notification. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async (notification) => {
        try {
            const notificationId = notification._id;
            setResendingIds(prev => new Set(prev).add(notificationId));

            const response = await fetch(`${API_URL}/notifications/send`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('farmlyf_token')}`
                },
                credentials: 'include',
                body: JSON.stringify({
                    heading: notification.heading,
                    message: notification.message,
                    target: notification.target
                })
            });

            const data = await response.json();

            if (response.ok) {
                toast.success(data.message || 'Notification resent successfully!');
                fetchHistory();
            } else {
                toast.error(data.error || 'Failed to resend notification');
            }
        } catch (error) {
            console.error('Error resending notification:', error);
            toast.error('Failed to resend notification. Please try again.');
        } finally {
            setResendingIds(prev => {
                const newSet = new Set(prev);
                newSet.delete(notification._id);
                return newSet;
            });
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 60) return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        return date.toLocaleDateString();
    };

    const getTargetLabel = (target) => {
        switch (target) {
            case 'all': return 'All Users';
            case 'active': return 'Active Users';
            case 'cart': return 'Cart Users';
            default: return target;
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-[#1a1a1a] uppercase tracking-tight">Push Notifications</h1>
                    <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest">Engage with your mobile users</p>
                </div>

                <div className="flex items-center gap-3">
                    {/* Add New Button if needed, or leave empty if not requested, but I'll leave the header clean */}
                </div>
            </div>

            {/* List Tab (History) */}
            {activeTab === 'list' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-gray-100 shadow-sm min-h-[600px]">
                        <div className="space-y-4">
                            <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest px-2">History</h4>
                            {historyLoading ? (
                                <div className="flex items-center justify-center py-20">
                                    <p className="text-sm text-gray-400">Loading...</p>
                                </div>
                            ) : history.length === 0 ? (
                                <div className="flex items-center justify-center py-20">
                                    <p className="text-sm text-gray-400">No notifications sent yet</p>
                                </div>
                            ) : (
                                history.map((n, i) => (
                                    <div key={n._id || i} className="flex items-center justify-between p-5 bg-white border border-gray-100 rounded-2xl hover:shadow-md transition-all">
                                        <div className="flex-1">
                                            <p className="text-xs font-black text-gray-900 uppercase tracking-tight">{n.heading}</p>
                                            <p className="text-[10px] text-gray-700 font-bold mt-1 truncate max-w-[300px]">{n.message}</p>
                                            <p className="text-[9px] text-gray-400 font-bold mt-1">
                                                Target: {getTargetLabel(n.target)} • {n.successCount}/{n.sentCount} delivered
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => handleResend(n)}
                                                disabled={resendingIds.has(n._id)}
                                                className="p-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all disabled:opacity-50"
                                                title="Resend this notification"
                                            >
                                                <RefreshCw size={14} className={`text-gray-600 ${resendingIds.has(n._id) ? 'animate-spin' : ''}`} />
                                            </button>
                                            <div className="text-right">
                                                <span className="text-[9px] font-bold text-gray-400 uppercase">{formatDate(n.createdAt)}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}

                            {/* Pagination Controls */}
                            {!historyLoading && pagination.pages > 1 && (
                                <div className="flex items-center justify-center gap-2 pt-6">
                                    <button
                                        onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                                        disabled={pagination.page === 1}
                                        className="px-4 py-2 text-xs font-black uppercase tracking-widest border border-gray-100 rounded-xl hover:bg-gray-50 disabled:opacity-50 transition-all"
                                    >
                                        Prev
                                    </button>
                                    <div className="flex items-center gap-1">
                                        {[...Array(pagination.pages)].map((_, i) => (
                                            <button
                                                key={i}
                                                onClick={() => setPagination(prev => ({ ...prev, page: i + 1 }))}
                                                className={`w-8 h-8 flex items-center justify-center rounded-xl text-xs font-black transition-all ${
                                                    pagination.page === i + 1
                                                        ? 'bg-black text-white shadow-lg'
                                                        : 'hover:bg-gray-50 text-gray-400'
                                                }`}
                                            >
                                                {i + 1}
                                            </button>
                                        ))}
                                    </div>
                                    <button
                                        onClick={() => setPagination(prev => ({ ...prev, page: Math.min(pagination.pages, prev.page + 1) }))}
                                        disabled={pagination.page === pagination.pages}
                                        className="px-4 py-2 text-xs font-black uppercase tracking-widest border border-gray-100 rounded-xl hover:bg-gray-50 disabled:opacity-50 transition-all"
                                    >
                                        Next
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Add (Compose) Tab */}
            {activeTab === 'add' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-gray-100 shadow-sm min-h-[600px]">
                        <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-[2rem] p-8 shadow-sm max-w-2xl mx-auto">
                            <h4 className="flex items-center gap-2 text-black font-black uppercase tracking-wider mb-6 pb-4 border-b border-gray-100">
                                <Send size={18} /> Compose New Message
                            </h4>
                            <div className="space-y-5">
                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Title</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Flash Sale is Live! 🔥"
                                        value={pushMessage.heading}
                                        onChange={(e) => setPushMessage({ ...pushMessage, heading: e.target.value })}
                                        className="w-full bg-white border border-gray-100 rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:border-black transition-all shadow-sm text-gray-900"
                                        disabled={loading}
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Message</label>
                                    <textarea
                                        rows="3"
                                        placeholder="e.g. Get 50% OFF on all items valid for next 2 hours only."
                                        value={pushMessage.message}
                                        onChange={(e) => setPushMessage({ ...pushMessage, message: e.target.value })}
                                        className="w-full bg-white border border-gray-100 rounded-2xl px-5 py-4 text-sm font-medium outline-none focus:border-black transition-all shadow-sm resize-none text-gray-900"
                                        disabled={loading}
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Audience</label>
                                    <select
                                        value={pushMessage.target}
                                        onChange={(e) => setPushMessage({ ...pushMessage, target: e.target.value })}
                                        className="w-full bg-white border border-gray-100 rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:border-black transition-all shadow-sm appearance-none cursor-pointer text-gray-900"
                                        disabled={loading}
                                    >
                                        <option value="all">Send to All Users</option>
                                        <option value="active">Active Users (Last 30 Days)</option>
                                        <option value="cart">Users with Abandoned Cart</option>
                                    </select>
                                </div>
                                <button
                                    onClick={handleSendPush}
                                    disabled={loading}
                                    className="w-full py-4 bg-black text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-black/20 hover:bg-gray-900 active:scale-[0.98] transition-all text-xs flex items-center justify-center gap-2 mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Send size={16} /> {loading ? 'Sending...' : 'Send Blast'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PushNotificationPage;
