import React from 'react';
import { Plus, Search, Edit, Trash2, FileText, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useBlogs, useDeleteBlog } from '../../../hooks/useContent';

const BlogListPage = () => {
    const { data: blogs = [], isLoading } = useBlogs();
    const deleteBlogMutation = useDeleteBlog();

    const handleDelete = (id) => {
        if (window.confirm("Are you sure you want to delete this blog?")) {
            deleteBlogMutation.mutate(id);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-[#1a1a1a] uppercase tracking-tight">Blog Management</h1>
                    <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest">Create and manage your content</p>
                </div>
                <Link
                    to="/admin/blogs/add"
                    className="bg-black text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-gray-800 transition-all shadow-lg active:scale-95 w-fit"
                >
                    <Plus size={16} /> Create New Blog
                </Link>
            </div>

            {/* Filters & Search */}
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search blogs..."
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-xl text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-black/5"
                    />
                </div>
                <div className="flex gap-2">
                    <select className="px-4 py-3 bg-gray-50 rounded-xl text-sm font-bold text-gray-600 outline-none cursor-pointer">
                        <option>All Categories</option>
                        <option>Health</option>
                        <option>Recipes</option>
                    </select>
                </div>
            </div>

            {/* Blog List Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {blogs.map(blog => (
                    <div key={blog._id} className="bg-white rounded-[2rem] border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all group">
                        {/* Image */}
                        <div className="h-40 overflow-hidden relative">
                            <img
                                src={blog.image}
                                alt={blog.title}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            />
                            <div className="absolute top-4 right-4">
                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider backdrop-blur-md ${blog.status === 'Published' ? 'bg-green-500/90 text-white' : 'bg-gray-500/90 text-white'}`}>
                                    {blog.status}
                                </span>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-4">
                            <div className="flex items-center gap-2 mb-3">
                                <span className="px-2 py-1 bg-amber-50 text-amber-700 rounded-lg text-[10px] font-black uppercase tracking-wider">
                                    {blog.category}
                                </span>
                                <span className="flex items-center gap-1 text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                                    <Calendar size={10} /> {new Date(blog.date).toLocaleDateString()}
                                </span>
                            </div>

                            <h3 className="text-sm font-black text-gray-900 leading-tight mb-2 line-clamp-2">
                                {blog.title}
                            </h3>

                            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-50">
                                <Link
                                    to={`/admin/blogs/edit/${blog._id}`}
                                    className="flex-1 py-1.5 text-center rounded-xl bg-gray-50 hover:bg-black hover:text-white text-[10px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2"
                                >
                                    <Edit size={12} /> Edit
                                </Link>
                                <button
                                    onClick={() => handleDelete(blog._id)}
                                    className="p-1.5 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {blogs.length === 0 && (
                <div className="text-center py-20 bg-gray-50 rounded-[2.5rem] border border-dashed border-gray-200">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                        <FileText size={32} />
                    </div>
                    <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">No Blogs Found</h3>
                    <p className="text-gray-400 font-medium text-sm mt-1">Start by creating your first blog post</p>
                </div>
            )}
        </div>
    );
};

export default BlogListPage;
