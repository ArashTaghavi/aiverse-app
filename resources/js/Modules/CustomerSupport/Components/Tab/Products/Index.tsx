import { useEffect } from 'react';
import { router, usePage } from '@inertiajs/react';
import { ProductResponse } from '@/Modules/CustomerSupport/Types/Responses/ProductResponse';
import Product from './Product';

type PropsType = {
    products: ProductResponse[];
};

export default function Products() {
    const { products } = usePage<PropsType>().props;
    useEffect(() => {
        router.reload({ only: ['products'] });
    }, []);

    return (
        <div>
            {!products ? (
                <p className="animate-pulse">Loading products...</p>
            ) : (
                <div className="flex">
                    {products.map((product) => (
                        <Product product={product} key={product.id} />
                    ))}
                </div>
            )}
        </div>
    );
}
