import React from 'react';

/**
 * A standard Table Container that handles overflow and width.
 */
export const AdminTable = ({ children, className = '' }) => {
    return (
        <div
            className={`overflow-x-auto pb-4 ${className} [&::-webkit-scrollbar]:hidden`}
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
            <table className="w-full text-left border-collapse min-w-[1000px]">
                {children}
            </table>
        </div>
    );
};

/**
 * Table Header Group
 */
export const AdminTableHeader = ({ children }) => {
    return (
        <thead>
            <tr className="border-b border-gray-200 bg-gray-100 text-left">
                {children}
            </tr>
        </thead>
    );
};

/**
 * Individual Header Cell
 */
export const AdminTableHead = ({ children, className = '', width }) => {
    return (
        <th
            className={`px-4 py-3 text-xs font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap ${className}`}
            style={width ? { width } : {}}
        >
            {children}
        </th>
    );
};

/**
 * Table Body Group
 */
export const AdminTableBody = ({ children }) => {
    return (
        <tbody className="divide-y divide-gray-100">
            {children}
        </tbody>
    );
};

/**
 * Individual Data Row
 */
export const AdminTableRow = ({ children, className = '', onClick }) => {
    return (
        <tr
            className={`group border-b border-gray-50 transition-colors hover:bg-gray-50/50 ${className}`}
            onClick={onClick}
        >
            {children}
        </tr>
    );
};

/**
 * Individual Data Cell
 */
export const AdminTableCell = ({ children, className = '', onClick }) => {
    return (
        <td
            className={`px-4 py-2.5 whitespace-nowrap ${className}`}
            onClick={onClick}
        >
            {children}
        </td>
    );
};
