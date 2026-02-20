import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ currentPage, totalPages, onPageChange, totalItems, itemsPerPage }) => {
    if (totalPages <= 1) return null;

    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    return (
        <div className="flex items-center justify-between px-8 py-4 bg-gray-50/50 border-t border-gray-100">
            <div className="flex items-center gap-4">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    Showing <span className="text-footerBg">{startItem}-{endItem}</span> of <span className="text-footerBg">{totalItems}</span>
                </p>
            </div>
            <div className="flex items-center gap-2">
                <button
                    disabled={currentPage === 1}
                    onClick={() => onPageChange(currentPage - 1)}
                    className="p-2 rounded-lg border border-gray-200 bg-white text-gray-400 hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                    <ChevronLeft size={16} />
                </button>

                <div className="flex items-center gap-1">
                    {[...Array(totalPages)].map((_, i) => (
                        <button
                            key={i + 1}
                            onClick={() => onPageChange(i + 1)}
                            className={`w-8 h-8 rounded-lg text-[10px] font-black transition-all ${currentPage === i + 1
                                    ? 'bg-footerBg text-white shadow-md'
                                    : 'bg-white border border-gray-200 text-gray-400 hover:border-primary hover:text-primary'
                                }`}
                        >
                            {i + 1}
                        </button>
                    ))}
                </div>

                <button
                    disabled={currentPage === totalPages}
                    onClick={() => onPageChange(currentPage + 1)}
                    className="p-2 rounded-lg border border-gray-200 bg-white text-gray-400 hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                    <ChevronRight size={16} />
                </button>
            </div>
        </div>
    );
};

export default Pagination;
