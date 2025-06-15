'use client'

import React from 'react';

export default function Modal({ children, titulo }) {
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
            <div className="bg-stone-800 p-8 rounded-lg shadow-lg w-full max-w-md">
                <h2 className="text-2xl font-bold mb-4 text-orange-400">{titulo}</h2>
                {children}
            </div>
        </div>
    );
};

