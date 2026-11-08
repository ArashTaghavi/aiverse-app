import { FileText, Upload } from "lucide-react";
import { FileInput, Form, Input } from "@/Modules/Base/Components/Form";
import { Button } from "@/Modules/Base/Components/UI";
import type { NewChatFormValues } from "@/Modules/ChatWithDocument/Types";
import type useDocumentUpload from "../Hooks/useDocumentUpload";
import PreparingUpload from "./PreparingUpload";

type Props = {
    userId?: number;
    uploadState: ReturnType<typeof useDocumentUpload>;
};

export default function DocumentUploadPanel({ userId, uploadState }: Props) {
    const {
        uploadForm,
        uploadDocument,
        uploading,
        showUploadProgress,
        uploadFormKey,
        uploadAttempt,
        closeUploadProgress,
    } = uploadState;
    return (
        <div className="flex min-h-0 flex-1 overflow-y-auto overscroll-contain p-5 sm:p-8">
            <Form
                methods={uploadForm}
                onSubmit={uploadDocument}
                isPending={uploading}
                className={
                    showUploadProgress
                        ? "hidden"
                        : "m-auto w-full max-w-lg space-y-5 py-6"
                }
            >
                <div className="space-y-2 text-center">
                    <FileText size={40} className="mx-auto text-violet-300" />
                    <h2 className="text-xl font-semibold">
                        Chat with your document
                    </h2>
                    <p className="text-sm text-ui-secondary">
                        Upload once, then ask questions about its contents.
                    </p>
                </div>
                <Input<NewChatFormValues>
                    name="title"
                    label="Document name (required)"
                    placeholder="Give this conversation a name"
                    disabled={uploading}
                    dir="auto"
                />
                <FileInput<NewChatFormValues>
                    key={uploadFormKey}
                    name="file"
                    label="Word document"
                    accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    disabled={uploading}
                    hint="One .docx file per conversation. The document cannot be replaced after upload."
                />
                <Button
                    type="submit"
                    loading={uploading}
                    startIcon={<Upload size={16} />}
                >
                    Upload document
                </Button>
                {uploading && (
                    <p role="status" className="text-sm text-ui-secondary">
                        Uploading and preparing your document…
                    </p>
                )}
            </Form>
            {userId !== undefined && (
                <div
                    className={
                        showUploadProgress
                            ? "m-auto w-full max-w-lg py-6"
                            : "hidden"
                    }
                >
                    <PreparingUpload
                        document={uploadState.uploadedRecord}
                        userId={userId}
                        uploadAttempt={uploadAttempt}
                        onClose={closeUploadProgress}
                    />
                </div>
            )}
        </div>
    );
}
