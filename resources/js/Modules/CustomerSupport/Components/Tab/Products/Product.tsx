import { ProductResponse } from '@/Modules/CustomerSupport/Types/Responses/ProductResponse';

export default function Product({ product }: { product: ProductResponse }) {
    return (
        <div>
            <h3>{product.title}</h3>
            <p>{product.description}</p>
            <img src={product.image} />
        </div>
    );
}
