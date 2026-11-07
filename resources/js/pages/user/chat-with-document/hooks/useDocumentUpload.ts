import { useState } from "react";
import { router } from "@inertiajs/react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { upload } from "@/actions/App/Modules/ChatWithDocument/Controllers/ChatWithDocumentController";
import type { DocumentResponse, NewChatFormValues } from "@/types";
import { newChatSchema } from "../schemas/new-chat.schema";

export default function useDocumentUpload(isAsking: () => boolean) {
    const [uploadFormKey, setUploadFormKey] = useState(0);
    const [uploading, setUploading] = useState(false);
    const [uploadAttempt, setUploadAttempt] = useState(0);
    const [showUploadProgress, setShowUploadProgress] = useState(false);
    const [uploadedDocument, setUploadedDocument] =
        useState<DocumentResponse | null>(null);
    const uploadForm = useForm<NewChatFormValues>({
        resolver: zodResolver(newChatSchema),
        defaultValues: { file: null, title: "" },
    });

    function resetUploadForm() {
        uploadForm.reset();
        setUploadFormKey((value) => value + 1);
    }

    function closeUploadProgress() {
        setShowUploadProgress(false);
    }

    const uploadDocument: SubmitHandler<NewChatFormValues> = (data) => {
        if (uploading || isAsking() || !data.file) return;
        router.post(upload().url, data, {
            onStart: () => {
                setUploadAttempt((attempt) => attempt + 1);
                setShowUploadProgress(true);
                setUploading(true);
                setUploadedDocument(null);
            },
            onFinish: () => setUploading(false),
            onError: (errors) => {
                closeUploadProgress();
                for (const field of ["title", "file"] as const) {
                    if (errors[field]) {
                        uploadForm.setError(field, {
                            type: "server",
                            message: errors[field],
                        });
                    }
                }
            },
            onSuccess: (page) => {
                setUploadedDocument(
                    page.props.uploadedDocument as DocumentResponse | null,
                );
                resetUploadForm();
            },
        });
    };

    return {
        uploadForm,
        uploadedDocument,
        uploadFormKey,
        uploading,
        uploadAttempt,
        showUploadProgress,
        uploadDocument,
        resetUploadForm,
        closeUploadProgress,
    };
}
