import { Button } from '@/Modules/Base/Components/UI';

type PropsType = {
    pending: { message: string };
    processing: boolean;
    confirming: boolean;
    onConfirm: (confirmed: boolean) => Promise<void>;
};

export default function ConfirmCancelOrder({
    pending,
    processing,
    confirming,
    onConfirm,
}: PropsType) {
    return (
        <section
            dir="rtl"
            aria-label="تأیید لغو سفارش"
            aria-live="polite"
            className="mt-4 space-y-4 rounded-xl border border-ui-border p-4"
        >
            <p className="whitespace-pre-wrap">{pending.message}</p>
            <div className="flex flex-wrap gap-2">
                <Button
                    variant="danger"
                    disabled={processing}
                    loading={confirming}
                    onClick={() => void onConfirm(true)}
                >
                    OK
                </Button>
                <Button
                    variant="secondary"
                    disabled={processing}
                    onClick={() => void onConfirm(false)}
                >
                    Cancel
                </Button>
            </div>
        </section>
    );
}
