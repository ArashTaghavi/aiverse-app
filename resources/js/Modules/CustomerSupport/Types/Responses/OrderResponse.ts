export type OrderStatus =
    | 'PENDING'
    | 'PROCESSING'
    | 'SHIPPED'
    | 'DELIVERED'
    | 'CANCELLED';
export type PaymentStatus = 'UNPAID' | 'PAID' | 'FAILED' | 'REFUNDED';

export type OrderResponse = {
    id: number;
    order_number: string;
    total_amount: number;
    order_status: OrderStatus;
    payment_status: PaymentStatus;
    tracking_code: string | null;
    shipping_address: string;
    created_at: string | null;
    paid_at: string | null;
    shipped_at: string | null;
    delivered_at: string | null;
    cancelled_at: string | null;
    cancellation_reason: string | null;
    items: {
        id: number;
        title: string;
        image: string | null;
        quantity: number;
        unit_price: number;
        total_price: number;
    }[];
    payments: {
        id: number;
        amount: number;
        status: PaymentStatus;
        method: string;
        paid_at: string | null;
    }[];
};
