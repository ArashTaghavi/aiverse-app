import { useState } from "react";
import { router } from "@inertiajs/react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { upload } from "@/actions/App/Modules/ChatWithDocument/Controllers/ChatWithDocumentController";
import { NewChatSchema } from "../Schemas/NewChatSchema";
import { EmbeddableFileResponse } from "@/Modules/Base/Types/Responses/EmbeddableFileResponse";
import { NewChatFormValues } from "@/Modules/DatabaseAnalyst/Types";

export default function useDocumentUpload(isAsking: () => boolean) {
    const [uploadFormKey, setUploadFormKey] = useState(0);
    const [uploading, setUploading] = useState(false);
    const [uploadAttempt, setUploadAttempt] = useState(0);
    const [showUploadProgress, setShowUploadProgress] = useState(false);
    const [uploadedRecord, setUploadedRecord] =
        useState<EmbeddableFileResponse | null>(null);
    const uploadForm = useForm<NewChatFormValues>({
        resolver: zodResolver(NewChatSchema),
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
                setUploadedRecord(null);
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
        uploadDocument,
        resetUploadForm,
        closeUploadProgress,
    };
}
