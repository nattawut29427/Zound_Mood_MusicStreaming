"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import TextareaAutosize from "react-textarea-autosize";
import { Pencil } from "lucide-react";
import SongCover from "@/components/Songcover";

export default function EditSongButton({
    song,
}: {
    song: {
        id: number;
        name_song: string;
        description: string | null;
        picture?: string;
        song_tags: { name_tag: string }[];
    };
}) {
    const [name, setName] = useState(song.name_song);
    const [tags, setTags] = useState(song.song_tags.map((t) => t.name_tag).join(", "));
    const [description, setDescription] = useState(song.description || "");
    const [editPreviewUrl, setEditPreviewUrl] = useState(song.picture || "");
    const [editImageFile, setEditImageFile] = useState<File | null>(null);

    // ฟังก์ชันอัปโหลดรูปภาพไป R2
    const handleUploadPicture = async (file: File) => {
        try {
            const picKey = `pictures/${Date.now()}_${file.name}`;

            // ขอ signed URL
            const picUrlRes = await fetch(
                `/api/upload?key=${encodeURIComponent(
                    picKey
                )}&contentType=${encodeURIComponent(file.type)}`
            );
            if (!picUrlRes.ok) throw new Error("ขอ signed URL สำหรับรูปภาพล้มเหลว");

            const { url: picUploadUrl } = await picUrlRes.json();

            // PUT รูปไปยัง Cloudflare R2
            const picUploadRes = await fetch(picUploadUrl, {
                method: "PUT",
                headers: { "Content-Type": file.type },
                body: file,
            });
            if (!picUploadRes.ok) throw new Error("อัปโหลดรูปภาพล้มเหลว");

            return picKey; // คืนค่า key เพื่อเก็บใน DB
        } catch (err: any) {
            console.error("Upload picture failed:", err);
            throw err;
        }
    };

    const handleConfirm = async () => {
        try {
            let pictureUrl = song.picture;

            if (editImageFile) {
                pictureUrl = await handleUploadPicture(editImageFile);
            }

            const res = await fetch(`/api/song/${song.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name_song: name,
                    description,
                    picture: pictureUrl,
                    song_tags: tags.split(",").map((t) => t.trim()),
                }),
            });

            if (!res.ok) throw new Error("Update failed");

            alert("Song updated successfully!");
        } catch (err) {
            console.error(err);
            alert("Failed to update song");
        }
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button className="bg-neutral-950 mt-4 hover:bg-white hover:text-black">
                    <Pencil /> Edit Song
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Edit Song</DialogTitle>
                </DialogHeader>

                <div className="flex flex-col gap-4 mt-4">
                    {/* Preview + เลือกรูป */}
                    <div className="flex justify-center">
                        <SongCover
                            songId={song.id}
                            picture={editPreviewUrl}
                            name="editPreview"
                            onImageChange={(file) => {
                                const preview = URL.createObjectURL(file);
                                setEditPreviewUrl(preview);
                                setEditImageFile(file);
                            }}
                        />
                    </div>

                    <div>
                        <Label htmlFor="name" className="font-bold">Name song</Label>
                        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
                    </div>

                    <div>
                        <Label htmlFor="tag" className="font-bold">Tag</Label>
                        <Input id="tag" value={tags} onChange={(e) => setTags(e.target.value)} />
                    </div>

                    <div>
                        <Label htmlFor="description" className="font-bold">Description</Label>
                        <TextareaAutosize
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            minRows={3}
                            maxRows={15}
                        />
                    </div>
                </div>

                <DialogFooter className="flex justify-end gap-4 mt-4">
                    <DialogClose asChild>
                        <Button variant="secondary">Close</Button>
                    </DialogClose>
                    <Button type="button" onClick={handleConfirm}>Confirm</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
