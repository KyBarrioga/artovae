import axios from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/apiClient";
import { queryKeys } from "@/lib/queryKeys";
import { useUserStore } from "@/store/useUserStore";
import type { UserImage } from "@/types/media";
import { useState } from "react";

type UploadImageInput = {
    image: File;
    title?: string;
    description?: string;
};

type PresignResponse = {
    upload_url: string;
    public_url?: string;
    object_key?: string;
};

export function useUploadImage() {
    const queryClient = useQueryClient();
    const userId = useUserStore((state) => state.user?.auth_user.id) ?? "me";
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isFinalizing, setIsFinalizing] = useState(false);

    const mutation = useMutation({
        onMutate: () => {
            setUploadProgress(0);
            setIsFinalizing(false);
        },
        mutationFn: async ({
            image,
            title = "",
            description = "",
        }: UploadImageInput): Promise<UserImage> => {
            const uploadFormImage = new FormData();
            uploadFormImage.append("image", image);

            const presignRes = await api.post<PresignResponse>(
                "/api/upload/image",
                uploadFormImage
            );

            const { object_key, upload_url, public_url } = presignRes.data;

            if (!upload_url || !object_key || !public_url) {
                throw new Error("Upload service did not return the required upload details.");
            }

            await axios.put(upload_url, image, {
                headers: {
                    "Content-Type": image.type || "application/octet-stream",
                },
                onUploadProgress: (event) => {
                    if (!event.total) return;
                    const percent = Math.round((event.loaded * 100) / event.total);
                    setUploadProgress(percent);
                },

            });

            setUploadProgress(100);
            setIsFinalizing(true);

            const uploadFormDetails = new FormData();
            uploadFormDetails.append("object_key", object_key);
            uploadFormDetails.append("public_url", public_url);
            uploadFormDetails.append("kind", "image");
            uploadFormDetails.append("title", title.trim());
            uploadFormDetails.append("description", description.trim());
            uploadFormDetails.append("preview_object_key", object_key);
            uploadFormDetails.append("preview_public_url", public_url);

            const detailsRes = await api.post(
                "/api/upload/details",
                uploadFormDetails
            );

            return normalizeUploadedMedia({
                data: detailsRes.data,
                objectKey: object_key,
                publicUrl: public_url,
                title: title.trim(),
                description: description.trim(),
            });
        },
        onSuccess: (createdMedia) => {
            queryClient.setQueryData<UserImage[]>(
                queryKeys.userMedia(userId),
                (current = []) => [createdMedia, ...current.filter((item) => item.id !== createdMedia.id)]
            );
            setIsFinalizing(false);
            queryClient.invalidateQueries({
                queryKey: queryKeys.userMedia(userId),
            });
        },
        onError: () => {
            setIsFinalizing(false);
        }
    });

    function resetUploadState() {
        setUploadProgress(0);
        setIsFinalizing(false);
    }

    return {
        ...mutation,
        uploadProgress,
        isFinalizing,
        resetUploadState,
    };
}

function normalizeUploadedMedia({
    data,
    objectKey,
    publicUrl,
    title,
    description,
}: {
    data: unknown;
    objectKey: string;
    publicUrl: string;
    title: string;
    description: string;
}): UserImage {
    const responseData = isUserImage(data) ? data : null;

    return {
        id: responseData?.id || objectKey,
        user_id: responseData?.user_id || "",
        object_key: responseData?.object_key || objectKey,
        public_url: responseData?.public_url || publicUrl,
        kind: responseData?.kind || "image",
        created_at: responseData?.created_at || new Date().toISOString(),
        title: responseData?.title || title,
        description: responseData?.description || description,
        preview_object_key: responseData?.preview_object_key || objectKey,
        preview_public_url: responseData?.preview_public_url || publicUrl,
    };
}

function isUserImage(value: unknown): value is Partial<UserImage> {
    if (!value || typeof value !== "object") {
        return false;
    }

    return (
        "id" in value ||
        "object_key" in value ||
        "public_url" in value ||
        "preview_public_url" in value
    );
}
