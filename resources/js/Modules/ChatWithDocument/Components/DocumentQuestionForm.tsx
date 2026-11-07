import { ChatQuestionForm } from '@/Modules/Base/Components/Chat';
import type useDocumentQuestion from '../Hooks/useDocumentQuestion';

type Props = {
    questionForm: ReturnType<typeof useDocumentQuestion>['questionForm'];
    sendQuestion: ReturnType<typeof useDocumentQuestion>['sendQuestion'];
    asking: boolean;
    isDocumentReady: boolean;
};

export default function DocumentQuestionForm({
    isDocumentReady,
    ...props
}: Props) {
    return (
        <ChatQuestionForm
            {...props}
            isReady={isDocumentReady}
            placeholder="Ask something about your document?"
        />
    );
}
