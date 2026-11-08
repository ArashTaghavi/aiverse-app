import { FileChatConfig } from '@/Modules/Base/Types/FileChat';
import { FileText, Upload } from 'lucide-react';
import { FileInput, Form, Input } from '@/Modules/Base/Components/Form';
import { Button } from '@/Modules/Base/Components/UI';
import type { FileUploadValues } from '@/Modules/Base/Types/FileChat';
import type useFileUpload from '@/Modules/Base/Hooks/useFileUpload';
import FileUploadProgress from './FileUploadProgress';

type Props = {
    config: FileChatConfig;
    userId?: number;
    uploadState: ReturnType<typeof useFileUpload>;
};

export default function FileUploadPanel({
    config,
    userId,
    uploadState,
}: Props) {
    const {
        uploadForm,
        uploadFile,
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
                onSubmit={uploadFile}
                isPending={uploading}
                className={
                    showUploadProgress
                        ? 'hidden'
                        : 'm-auto w-full max-w-lg space-y-5 py-6'
                }
            >
                <div className="space-y-2 text-center">
                    <FileText size={40} className="mx-auto text-violet-300" />
                    <h2 className="text-xl font-semibold">{config.title}</h2>
                    <p className="text-sm text-ui-secondary">
                        Upload once, then ask questions about its contents.
                    </p>
                </div>
                <Input<FileUploadValues>
                    name="title"
                    label="Conversation name (required)"
                    placeholder="Give this conversation a name"
                    disabled={uploading}
                    dir="auto"
                />
                <FileInput<FileUploadValues>
                    key={uploadFormKey}
                    name="file"
                    label={config.file.label}
                    accept={config.file.accept}
                    disabled={uploading}
                    hint={`One ${config.file.extension} file per conversation.`}
                />
                <Button
                    type="submit"
                    loading={uploading}
                    startIcon={<Upload size={16} />}
                >
                    Upload file
                </Button>
                {uploading && (
                    <p role="status" className="text-sm text-ui-secondary">
                        Uploading and preparing your file…
                    </p>
                )}
            </Form>
            {userId !== undefined && (
                <div
                    className={
                        showUploadProgress
                            ? 'm-auto w-full max-w-lg py-6'
                            : 'hidden'
                    }
                >
                    <FileUploadProgress
                        config={config}
                        file={uploadState.uploadedRecord}
                        userId={userId}
                        uploadAttempt={uploadAttempt}
                        onClose={closeUploadProgress}
                    />
                </div>
            )}
        </div>
    );
}
