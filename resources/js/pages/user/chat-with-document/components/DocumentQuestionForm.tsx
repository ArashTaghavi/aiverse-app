import { Send } from 'lucide-react';
import { Form, Input } from '@/components/form';
import { Button } from '@/components/ui';
import type { DocumentQuestionValues } from '@/types';
import type useDocumentQuestion from '../hooks/useDocumentQuestion';

type Props = {
    questionForm: ReturnType<typeof useDocumentQuestion>['questionForm'];
    sendQuestion: ReturnType<typeof useDocumentQuestion>['sendQuestion'];
    asking: boolean;
    isDocumentReady: boolean;
};

export default function DocumentQuestionForm({
    questionForm,
    sendQuestion,
    asking,
    isDocumentReady,
}: Props) {
    return (
        <Form
            methods={questionForm}
            onSubmit={sendQuestion}
            isPending={asking}
            className="flex shrink-0 items-end gap-3 border-t border-white/10 bg-[#191923]/95 px-4 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-[0_-8px_24px_-16px_rgba(0,0,0,0.7)] sm:px-6 [&>div]:min-w-0 [&>div]:flex-1"
        >
            <Input<DocumentQuestionValues>
                name="question"
                label="Your question"
                placeholder="Ask something about your document…"
                disabled={!isDocumentReady || asking}
                autoComplete="off"
                dir="auto"
            />
            <Button
                type="submit"
                size="icon"
                className="mb-1.5"
                aria-label="Send question"
                loading={asking}
                disabled={!isDocumentReady}
                startIcon={<Send size={16} />}
            ></Button>
        </Form>
    );
}
