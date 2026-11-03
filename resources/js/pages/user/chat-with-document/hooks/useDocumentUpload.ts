import { useState } from "react";
import { router } from "@inertiajs/react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { upload } from "@/actions/App/Modules/ChatWithDocument/Controllers/ChatWithDocumentController";
import type { NewChatFormValues } from "@/types";
import { newChatSchema } from "../schemas/new-chat.schema";

export default function useDocumentUpload(isAsking: () => boolean) {
    const [uploadFormKey, setUploadFormKey] = useState(0);
    const [uploading, setUploading] = useState(false);
    const [uploadAttempt, setUploadAttempt] = useState(0);
    const [showUploadProgress, setShowUploadProgress] = useState(false);
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
            },
            onFinish: () => setUploading(false),
            onError: closeUploadProgress,
            onSuccess: resetUploadForm,
        });
    };

    return {
        uploadForm,
        uploadFormKey,
        uploading,
        uploadAttempt,
        showUploadProgress,
        uploadDocument,
        resetUploadForm,
        closeUploadProgress,
    };
}
