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
import { Pencil, X } from "lucide-react";
import SongCover from "@/components/Songcover";
import { Badge } from "@/components/ui/badge";

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
    const [tags, setTags] = useState<string[]>(
        song.song_tags.map((t) => t.name_tag)
    );
    const [tagInput, setTagInput] = useState("");
    const [description, setDescription] = useState(song.description || "");
    const [editPreviewUrl, setEditPreviewUrl] = useState(song.picture || "");
    const [editImageFile, setEditImageFile] = useState<File | null>(null);

    // ฟังก์ชันอัปโหลดรูปภาพไป R2
    const handleUploadPicture = async (file: File) => {
        try {
            const picKey = `pictures/${Date.now()}_${file.name}`;

            const picUrlRes = await fetch(
                `/api/upload?key=${encodeURIComponent(
                    picKey
                )}&contentType=${encodeURIComponent(file.type)}`
            );
            if (!picUrlRes.ok) throw new Error("ขอ signed URL สำหรับรูปภาพล้มเหลว");

            const { url: picUploadUrl } = await picUrlRes.json();

            const picUploadRes = await fetch(picUploadUrl, {
                method: "PUT",
                headers: { "Content-Type": file.type },
                body: file,
            });
            if (!picUploadRes.ok) throw new Error("อัปโหลดรูปภาพล้มเหลว");

            return picKey;
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
                    song_tags: tags,
                }),
            });

            if (!res.ok) throw new Error("Update failed");

            alert("Song updated successfully!");
        } catch (err) {
            console.error(err);
            alert("Failed to update song");
        }
    };

    // ✅ เพิ่มแท็กด้วย Enter/Space
    const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if ((e.key === "Enter" || e.key === " ") && tagInput.trim() !== "") {
            e.preventDefault();
            if (!tags.includes(tagInput.trim())) {
                setTags([...tags, tagInput.trim()]);
            }
            setTagInput("");
        }

        // Backspace ลบ tag ล่าสุด
        if (e.key === "Backspace" && tagInput === "" && tags.length > 0) {
            e.preventDefault();
            const newTags = [...tags];
            const lastTag = newTags.pop();
            setTags(newTags);
            if (lastTag) setTagInput(lastTag);
        }
    };

    const removeTag = (tag: string) => {
        setTags(tags.filter((t) => t !== tag));
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
                        <Label htmlFor="name" className="font-bold mb-2">Name song</Label>
                        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
                    </div>


                    <div>
                        <Label htmlFor="tag" className="font-bold mb-2">Tags</Label>
                        <div className="flex flex-wrap items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
                            {tags.map((tag, i) => (
                                <Badge
                                    key={i}
                                    variant="secondary"
                                    className="flex items-center gap-1 px-3 py-1 rounded-full"
                                >
                                    {tag}
                                    <X
                                        size={14}
                                        className="cursor-pointer hover:text-red-400"
                                        onClick={() => removeTag(tag)}
                                    />
                                </Badge>
                            ))}
                            <input
                                id="tag"
                                type="text"
                                placeholder="Type and press space/enter..."
                                className="flex-1 bg-transparent outline-none text-black placeholder-gray-400 min-w-[100px]"
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                onKeyDown={handleTagKeyDown}
                            />
                        </div>
                    </div>


                    <div>
                        <Label htmlFor="description" className="font-bold mb-2">Description</Label>
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
