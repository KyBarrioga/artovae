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

export default function UploadDialog() {
    const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
    const [image, setImage] = useState<File | null>(null)
    const [preview, setPreview] = useState<string | null>(null)

    async function handleUploadImage(event: SubmitEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!image) {
            toast.error("Please choose an image first.");
            return;
        }

        try {
            const uploadFormData = new FormData();
            uploadFormData.append("image", image);

            const presignRes = await api.post(
                "/api/upload/image",
                uploadFormData
            );

            const { upload_url, public_url } = presignRes.data as {
                upload_url: string;
                public_url?: string;
            };

            try {
                const uploadRes = await axios.put(upload_url, image, {
                    headers: {
                        "Content-Type": image.type || "application/octet-stream",
                    },
                });

                console.log("Upload complete:", uploadRes.status);
                // await axios.post("/api/upload/", {
                //     // payload
                // });
            } catch (error) {
                console.error("Upload failed or next request failed:", error);
            }

            console.log("Uploaded image URL:", public_url);
            setImage(null);
            setPreview(null);
            setIsUploadDialogOpen(false);
            toast.success("Image uploaded successfully.");
        } catch (error) {
            console.error("Image upload failed", error);
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
        <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
            <DialogTrigger asChild>
                <Button size="icon" variant="secondary">
                    <Plus />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-sm">
                <form onSubmit={handleUploadImage}>
                    <DialogHeader className="mb-3">
                        <DialogTitle>Upload Image</DialogTitle>
                    </DialogHeader>

                    <FieldGroup>
                        <Field>
                            <div className="flex flex-row gap-1">
                                <Label htmlFor="name-1">Title</Label>
                                <Label htmlFor="name-1" className="text-muted-foreground italic">
                                    (Optional)
                                </Label>
                            </div>
                            <Input id="title-1" name="title" placeholder="Title for your image" />
                        </Field>
                        <Field>
                            <div className="flex flex-row gap-1">
                                <Label htmlFor="description-1">Description</Label>
                                <Label className="text-muted-foreground italic">
                                    (Optional)
                                </Label>
                            </div>
                            <Textarea id="description-1" name="description" placeholder="Type your message here." />
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="picture-1">Image</FieldLabel>
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
                        <Button variant="submit" type="submit">Upload</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}