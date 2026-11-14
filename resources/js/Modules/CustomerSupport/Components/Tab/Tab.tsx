import { useId, useState } from 'react';
import { Headset, ShoppingBag, Package } from 'lucide-react';
import Button from '@/Modules/Base/Components/UI/Buttons/Button';
import SupportContent from './Support/Index';
import OrdersContent from './Orders/Index';
import ProductsContent from './Products/Index';

const tabs = [
    {
        id: 'orders',
        label: 'Orders',
        Content: OrdersContent,
        icon: ShoppingBag,
    },
    {
        id: 'products',
        label: 'Products',
        Content: ProductsContent,
        icon: Package,
    },
    { id: 'support', label: 'Support', Content: SupportContent, icon: Headset },
];

export default function Tab() {
    const [activeTab, setActiveTab] = useState('orders');
    const id = useId();

    return (
        <div className="flex min-h-0 min-w-0 w-full flex-1 flex-col gap-5 overflow-hidden">
            <div className="flex shrink-0 gap-3 rounded-2xl border border-white/20 bg-linear-to-br from-white/15 via-white/5 to-violet-300/5 p-1.5 shadow-[0_8px_32px_rgba(0,0,0,0.16),inset_0_1px_0_rgba(255,255,255,0.2)] backdrop-blur-2xl backdrop-saturate-150">
                {tabs.map((tab) => (
                    <Button
                        key={tab.id}
                        id={`${id}-${tab.id}-tab`}
                        type="button"
                        variant="tab"
                        aria-selected={activeTab === tab.id}
                        startIcon={<tab.icon size={18} aria-hidden="true" />}
                        onClick={() => setActiveTab(tab.id)}
                        className="flex-1 backdrop-blur-md duration-200 hover:border-white/15 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.15)] aria-selected:border-white/10 aria-selected:bg-linear-to-br aria-selected:from-white/5 aria-selected:to-violet-300/3 aria-selected:shadow-[0_4px_16px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.08)]"
                    >
                        {tab.label}
                    </Button>
                ))}
            </div>

            {tabs.map((tab) => (
                <div
                    key={tab.id}
                    id={`${id}-${tab.id}-panel`}
                    hidden={activeTab !== tab.id}
                    tabIndex={0}
                    className="min-h-0 min-w-0 flex-1 overflow-hidden rounded-2xl border border-white/15 bg-linear-to-br from-white/10 via-white/3 to-violet-300/5 p-6 text-sm text-ui-secondary shadow-[0_12px_40px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.15)] backdrop-blur-2xl backdrop-saturate-150 focus-visible:outline-2 focus-visible:outline-violet-400"
                >
                    {activeTab === tab.id && <tab.Content />}
                </div>
            ))}
        </div>
    );
}
