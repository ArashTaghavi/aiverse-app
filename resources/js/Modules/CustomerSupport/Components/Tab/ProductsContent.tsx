import { useEffect } from 'react';
import { router, usePage } from '@inertiajs/react';

type ProductsPageProps = {
    products?: { id: number; title: string }[];
};

export default function ProductsContent() {
    const { products } = usePage<ProductsPageProps>().props;
    console.log(products);
    useEffect(() => {
        router.reload({ only: ['products'] });
    }, []);

    return (
        <div>
            {!products ? (
                <p className="animate-pulse">Loading products...</p>
            ) : (
                <ul>
                    {products.map((product) => (
                        <li key={product.id}>{product.title}</li>
                    ))}
                </ul>
            )}
        </div>
    );
}
