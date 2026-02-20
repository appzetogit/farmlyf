import React, { useState, useEffect } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { Save, ArrowLeft, Image as ImageIcon, X, Loader2 } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useBlogs, useAddBlog, useUpdateBlog } from '../../../hooks/useContent';
import { API_BASE_URL } from '@/lib/apiUrl';

const API_URL = API_BASE_URL;

const BlogFormPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = !!id;

    const { data: blogs = [], isLoading: isLoadingBlogs } = useBlogs();
    const addBlogMutation = useAddBlog();
    const updateBlogMutation = useUpdateBlog();

    // Form State
    const [title, setTitle] = useState("");
    const [category, setCategory] = useState("");
    const [content, setContent] = useState("");
    const [excerpt, setExcerpt] = useState("");
    const [image, setImage] = useState(null);
    const [publicId, setPublicId] = useState("");
    const [status, setStatus] = useState("Published");
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        if (isEditMode && blogs.length > 0) {
            const blog = blogs.find(b => b._id === id);
            if (blog) {
                setTitle(blog.title);
                setCategory(blog.category);
                setContent(blog.content);
                setExcerpt(blog.excerpt);
                setImage(blog.image);
                setPublicId(blog.publicId || "");
                setStatus(blog.status || "Published");
            }
        }
    }, [isEditMode, id, blogs]);

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append('image', file);

        try {
            const res = await fetch(`${API_URL}/upload`, {
                method: 'POST',
                body: formData,
            });

            if (!res.ok) throw new Error('Upload failed');

            const data = await res.json();
            setImage(data.url);
            setPublicId(data.publicId);
            toast.success('Image uploaded successfully');
        } catch (error) {
            toast.error(error.message);
        } finally {
            setIsUploading(false);
        }
    };

    const handleSave = () => {
        if (!title || !category || !content || !image || !excerpt) {
            toast.error("Please fill all required fields, including image and excerpt");
            return;
        }

        const blogData = {
            title,
            category,
            content,
            excerpt,
            image,
            publicId,
            status
        };

        if (isEditMode) {
            updateBlogMutation.mutate({ id, data: blogData }, {
                onSuccess: () => navigate('/admin/blogs')
            });
        } else {
            addBlogMutation.mutate(blogData, {
                onSuccess: () => navigate('/admin/blogs')
            });
        }
    };

    if (isEditMode && isLoadingBlogs) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link to="/admin/blogs" className="p-3 bg-white rounded-xl border border-gray-100 text-gray-400 hover:text-black hover:border-black transition-all">
                    <ArrowLeft size={20} />
                </Link>
                <div>
                    <h1 className="text-2xl font-black text-[#1a1a1a] uppercase tracking-tight">
                        {isEditMode ? 'Edit Blog' : 'Create New Blog'}
                    </h1>
                    <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest">
                        {isEditMode ? 'Update existing content' : 'Share your knowledge with the world'}
                    </p>
                </div>
                <div className="ml-auto">
                    <button
                        onClick={handleSave}
                        disabled={addBlogMutation.isPending || updateBlogMutation.isPending || isUploading}
                        className="bg-black text-white px-8 py-3 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-gray-800 transition-all shadow-lg active:scale-95 disabled:opacity-50"
                    >
                        {(addBlogMutation.isPending || updateBlogMutation.isPending) ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />} 
                        {isEditMode ? 'Update Details' : 'Publish Blog'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

                {/* Main Content Form */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Title */}
                    <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm space-y-4">
                        <div>
                            <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Blog Title</label>
                            <input
                                type="text"
                                placeholder="Enter an engaging title..."
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full mt-2 bg-white border border-gray-200 rounded-2xl px-6 py-4 text-xl font-bold text-gray-900 placeholder:text-gray-400 outline-none focus:border-black focus:ring-4 focus:ring-black/5 transition-all shadow-sm"
                            />
                        </div>
                    </div>

                    {/* Excerpt */}
                    <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm space-y-4">
                        <div>
                            <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Short Excerpt</label>
                            <textarea
                                placeholder="Enter a brief summary..."
                                value={excerpt}
                                onChange={(e) => setExcerpt(e.target.value)}
                                rows={3}
                                className="w-full mt-2 bg-white border border-gray-200 rounded-2xl px-6 py-4 text-sm font-bold text-gray-900 placeholder:text-gray-400 outline-none focus:border-black focus:ring-4 focus:ring-black/5 transition-all shadow-sm resize-none"
                            />
                        </div>
                    </div>

                    {/* Rich Text Editor */}
                    <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm space-y-4">
                        <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Content</label>
                        <div className="prose-editor">
                            <ReactQuill
                                theme="snow"
                                value={content}
                                onChange={setContent}
                                className="h-[400px] mb-12"
                                modules={{
                                    toolbar: [
                                        [{ 'header': [1, 2, 3, false] }],
                                        ['bold', 'italic', 'underline', 'strike'],
                                        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                                        ['link', 'image'],
                                        ['clean']
                                    ],
                                }}
                            />
                        </div>
                    </div>
                </div>

                {/* Sidebar (Meta & Image) */}
                <div className="space-y-6">
                    {/* Category */}
                    <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm space-y-4">
                        <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Category</label>
                        <input
                            type="text"
                            placeholder="e.g. Health, Recipes"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-900 placeholder:text-gray-400 outline-none focus:border-black focus:ring-2 focus:ring-black/5 transition-all shadow-sm"
                        />
                    </div>

                    {/* Status */}
                    <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm space-y-4">
                        <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Status</label>
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-900 outline-none focus:border-black focus:ring-2 focus:ring-black/5 transition-all shadow-sm"
                        >
                            <option value="Published">Published</option>
                            <option value="Draft">Draft</option>
                        </select>
                    </div>

                    {/* Cover Image */}
                    <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm space-y-4">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Cover Image</label>

                        {image ? (
                            <div className="relative rounded-2xl overflow-hidden group">
                                <img src={image} alt="Cover" className="w-full h-48 object-cover" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <button
                                        onClick={() => { setImage(null); setPublicId(""); }}
                                        className="p-2 bg-white text-red-500 rounded-full hover:bg-red-50"
                                    >
                                        <X size={18} />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="border-2 border-dashed border-gray-200 rounded-2xl h-48 flex flex-col items-center justify-center text-gray-400 hover:border-black/20 hover:bg-gray-50 transition-all cursor-pointer relative">
                                {isUploading ? (
                                    <Loader2 className="animate-spin" size={32} />
                                ) : (
                                    <>
                                        <ImageIcon size={32} className="mb-2" />
                                        <span className="text-xs font-bold uppercase tracking-wide">Upload Image</span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                        />
                                    </>
                                )}
                            </div>
                        )}
                        <p className="text-[10px] text-gray-400 font-medium px-1">Recommended size: 1200x630px</p>
                    </div>
                </div>
            </div>

            {/* Custom Quill Styles */}
            <style>{`
                .ql-toolbar {
                    border-top-left-radius: 1rem !important;
                    border-top-right-radius: 1rem !important;
                    border-color: #e5e7eb !important;
                    background-color: #ffffff;
                    padding: 12px 16px !important;
                    border-bottom: 1px solid #f3f4f6 !important;
                }
                .ql-container {
                    border-bottom-left-radius: 1rem !important;
                    border-bottom-right-radius: 1rem !important;
                    border-color: #e5e7eb !important;
                    font-family: 'Plus Jakarta Sans', sans-serif;
                    font-size: 1rem;
                    background-color: #ffffff;
                    color: #111827; /* Gray 900 */
                }
                .ql-editor {
                    min-height: 400px;
                    padding: 24px;
                    font-weight: 500;
                    line-height: 1.8;
                }
                .ql-editor.ql-blank::before {
                    color: #9ca3af;
                    font-style: normal;
                    font-weight: 500;
                }
            `}</style>
        </div>
    );
};

export default BlogFormPage;
