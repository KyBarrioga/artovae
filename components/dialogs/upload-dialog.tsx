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
import { toast } from "sonner"
import { useUploadImage } from "@/hooks/use-user-upload";
import { Progress } from "@/components/ui/progress";

export default function UploadDialog() {
    const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
    const [image, setImage] = useState<File | null>(null)
    const [preview, setPreview] = useState<string | null>(null)
    const uploadImage = useUploadImage()

    function resetDialogState() {
        setImage(null);
        setPreview(null);
        uploadImage.resetUploadState();
    }

    function handleDialogOpenChange(isOpen: boolean) {
        if (uploadImage.isPending) {
            return;
        }

        setIsUploadDialogOpen(isOpen);

        if (!isOpen) {
            resetDialogState();
        }
    }

    async function handleUploadImage(event: SubmitEvent<HTMLFormElement>) {
        event.preventDefault();

        const formData = new FormData(event.currentTarget);

        const titleEntry = formData.get("title");
        const descriptionEntry = formData.get("description");
        const title = typeof titleEntry === "string" ? titleEntry.trim() : "";
        const description = typeof descriptionEntry === "string" ? descriptionEntry.trim() : "";

        if (!image) {
            toast.error("Please choose an image first.");
            return;
        }

        try {
            await uploadImage.mutateAsync({
                image,
                title,
                description
            })

            resetDialogState();
            setIsUploadDialogOpen(false);
            toast.success("Image uploaded successfully.");
        } catch (error) {
            uploadImage.resetUploadState();
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
        <Dialog open={isUploadDialogOpen} onOpenChange={handleDialogOpenChange}>
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

                    {uploadImage.isPending ? (
                        <div className="mt-4 space-y-2">
                            <div className="flex items-center justify-between text-sm text-stone-300">
                                <span>
                                    {uploadImage.isFinalizing ? "Finalizing upload..." : "Uploading to storage..."}
                                </span>
                                <span>{uploadImage.uploadProgress}%</span>
                            </div>
                            <Progress value={uploadImage.uploadProgress} className="h-2 rounded-full" />
                        </div>
                    ) : null}

                    <DialogFooter className="mt-3">
                        <DialogClose asChild>
                            <Button variant="ghost" disabled={uploadImage.isPending}>Cancel</Button>
                        </DialogClose>
                        <Button variant="submit" type="submit" disabled={uploadImage.isPending}>
                            {uploadImage.isFinalizing ? "Finalizing..." : uploadImage.isPending ? "Uploading..." : "Upload"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
