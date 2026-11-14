import { BaseDataResponse } from '@/Modules/Base/Types/Responses/BaseDataResponse';

export type ProductResponse = {
    id: number;
    title: string;
    description: string | null;
    price: number;
    stock: number;
    product_category: BaseDataResponse;
    image: string;
};
