import React from 'react';
import ProductDetailBananaLab from '@Tailwind/ProductDetails/ProductDetailBananaLab';

export default function ProductDetail({ item }) {
    return (
        <div className="min-h-screen bg-gray-100">
            <div className="container mx-auto py-8">
                <h1 className="text-3xl font-bold mb-8">Test Product Detail</h1>
                <ProductDetailBananaLab item={item} />
            </div>
        </div>
    );
}
