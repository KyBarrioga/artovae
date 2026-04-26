import { useState, SubmitEvent, ChangeEvent } from "react";
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea";
import { api } from "lib/apiClient";
import { toast } from "sonner"
import axios from "axios";

export default function EditProfileDialog() {
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [image, setImage] = useState<File | null>(null)
    const [preview, setPreview] = useState<string | null>(null)

    async function handleUploadImage(event: SubmitEvent<HTMLFormElement>) {
        event.preventDefault();

        const formData = new FormData(event.target);

        const titleEntry = formData.get("title");
        const descriptionEntry = formData.get("description");
        const title = typeof titleEntry === "string" ? titleEntry.trim() : "";
        const description = typeof descriptionEntry === "string" ? descriptionEntry.trim() : "";

        if (!image) {
            toast.error("Please choose an image first.");
            return;
        }

        try {
            const uploadFormImage = new FormData();
            uploadFormImage.append("image", image);

            const presignRes = await api.post(
                "/api/upload/image",
                uploadFormImage
            );

            const { object_key, upload_url, public_url } = presignRes.data as {
                upload_url: string;
                public_url?: string;
                object_key?: string;
            };

            if (!upload_url || !object_key || !public_url) {
                throw new Error("Upload service did not return the required upload details.");
            }

            const uploadRes = await axios.put(upload_url, image, {
                headers: {
                    "Content-Type": image.type || "application/octet-stream",
                },
            });
            console.log("Upload complete:", uploadRes.status);

            const uploadFormDetails = new FormData();
            uploadFormDetails.append("object_key", object_key);
            uploadFormDetails.append("public_url", public_url);
            uploadFormDetails.append("kind", "image");
            uploadFormDetails.append("title", title);
            uploadFormDetails.append("description", description);
            uploadFormDetails.append("preview_object_key", object_key);
            uploadFormDetails.append("preview_public_url", public_url);

            await api.post("/api/upload/details", uploadFormDetails);

            console.log("Uploaded image URL:", public_url);
            setImage(null);
            setPreview(null);
            setIsEditDialogOpen(false);
            toast.success("Image uploaded successfully.");
        } catch (error) {
            console.error("Image upload failed", error);
            if (axios.isAxiosError(error)) {
                const apiError = error.response?.data;
                const detail =
                    typeof apiError?.detail === "string"
                        ? apiError.detail
                        : typeof apiError?.error === "string"
                            ? apiError.error
                            : "Image upload failed.";

                toast.error(detail);
                return;
            }

            if (error instanceof Error) {
                toast.error(error.message);
                return;
            }

            toast.error("Image upload failed.");
        }
    }

    function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
        const selectedImage = event.target.files?.[0]
        if (!selectedImage) return

        setImage(selectedImage)
        setPreview(URL.createObjectURL(selectedImage))
    }

    return (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogTrigger asChild>
                    <Button
                        variant="secondary"
                    >
                        Edit Profile
                    </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-sm">
            {/* handleUploadImage */}
                <form onSubmit={()=>{toast.warning("Unavailable, edit profile feature still in progress.")}}>
                    <DialogHeader className="mb-3">
                        <DialogTitle>Edit Profile</DialogTitle>
                    </DialogHeader>

                    <FieldGroup>
                        <Field>
                            <div className="flex flex-row gap-1">
                                <Label htmlFor="name-1">Display Name</Label>
                            </div>
                            <Input id="displayname-1" name="displayname" placeholder="" />
                        </Field>
                        <Field>
                            <div className="flex flex-row gap-1">
                                <Label htmlFor="description-1">Description</Label>
                            </div>
                            <Textarea id="description-1" name="description" placeholder="" />
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="picture-1">Display Image</FieldLabel>
                            <Input id="picture-1" type="file" accept="image/png, image/jpeg" onChange={handleImageChange} />
                            {preview && (
                                <img
                                    src={preview}
                                    alt="Preview"
                                    className="mt-2 w-32 h-32 object-cover rounded-md border"
                                />
                            )}
                        </Field>
                    </FieldGroup>

                    <DialogFooter className="mt-3">
                        <DialogClose asChild>
                            <Button variant="ghost">Cancel</Button>
                        </DialogClose>
                        <Button variant="submit" type="submit">Save</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
