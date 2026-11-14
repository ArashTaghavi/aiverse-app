import { FileChatConfig } from '@/Modules/Base/Types/FileChat';
import { useState } from 'react';
import { router } from '@inertiajs/react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createFileUploadSchema } from '../Schemas/FileUploadSchema';
import { EmbeddableFileResponse } from '@/Modules/Base/Types/Responses/EmbeddableFileResponse';
import { FileUploadValues } from '@/Modules/Base/Types/FileChat';

export default function useFileUpload(config: FileChatConfig) {
    const [uploadFormKey, setUploadFormKey] = useState(0);
    const [uploading, setUploading] = useState(false);
    const [uploadAttempt, setUploadAttempt] = useState(0);
    const [showUploadProgress, setShowUploadProgress] = useState(false);
    const [uploadedRecord, setUploadedRecord] =
        useState<EmbeddableFileResponse | null>(null);
    const uploadForm = useForm<FileUploadValues>({
        resolver: zodResolver(createFileUploadSchema(config.file.extension)),
        defaultValues: { file: null, title: '' },
    });

    function resetUploadForm() {
        uploadForm.reset();
        setUploadFormKey((value) => value + 1);
    }

    function closeUploadProgress() {
        setShowUploadProgress(false);
    }

    const uploadFile: SubmitHandler<FileUploadValues> = (data) => {
        if (uploading || !data.file) return;
        router.post(config.routes.upload().url, data, {
            onStart: () => {
                setUploadAttempt((attempt) => attempt + 1);
                setShowUploadProgress(true);
                setUploading(true);
                setUploadedRecord(null);
            },
            onFinish: () => setUploading(false),
            onError: (errors) => {
                closeUploadProgress();
                for (const field of ['title', 'file'] as const) {
                    if (errors[field]) {
                        uploadForm.setError(field, {
                            type: 'server',
                            message: errors[field],
                        });
                    }
                }
            },
            onSuccess: (page) => {
                setUploadedRecord(
                    page.props.uploadedRecord as EmbeddableFileResponse | null,
                );
                resetUploadForm();
            },
        });
    };

    return {
        uploadForm,
        uploadedRecord,
        uploadFormKey,
        uploading,
        uploadAttempt,
        showUploadProgress,
        uploadFile,
        resetUploadForm,
        closeUploadProgress,
    };
}
