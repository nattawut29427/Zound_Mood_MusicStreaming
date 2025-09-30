"use client";
import React, { useState, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { mutate } from "swr";
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
import { Pencil } from "lucide-react";
import { useSignedImage } from "@/lib/hooks/useSignedImage";

export default function EditUserButton({
    user,
}: {
    user: {
        id: string;
        name: string;
        image?: string; // Google avatar หรือ URL อื่น
        bg_image?: string; // R2 key
    };
}) {
    const [name, setName] = useState(user.name);

    // Avatar
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const avatarInputRef = useRef<HTMLInputElement>(null);
    const signedAvatarUrl = user.image && !user.image.startsWith("http")
        ? useSignedImage(user.image)
        : null;

    const handleUploadFile = async (file: File) => {
        const key = `pictures/${Date.now()}_${file.name}`;
        const res = await fetch(
            `/api/upload?key=${encodeURIComponent(key)}&contentType=${encodeURIComponent(file.type)}`
        );
        if (!res.ok) throw new Error("Failed to get signed URL");
        const { url: uploadUrl } = await res.json();

        const uploadRes = await fetch(uploadUrl, {
            method: "PUT",
            headers: { "Content-Type": file.type },
            body: file,
        });
        if (!uploadRes.ok) throw new Error("Failed to upload file");
        return key;
    };

    const handleConfirm = async () => {
        try {
            let imageKey = user.image;
            if (avatarFile) imageKey = await handleUploadFile(avatarFile);

            const res = await fetch(`/api/user/${user.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, image: imageKey }),
            });
            if (!res.ok) throw new Error("Update failed");


            await mutate("/api/auth/session"); // reload session ใหม่

            alert("User updated successfully!");
        } catch (err) {
            if (name == "") {
                alert("กรุณาใส่ชื่อผู้ใช้");
            } else {
                alert("Update failed")
            }
        }
    };

    const avatarSrc = avatarPreview || user.image || "/default-avatar.jpg";

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button className="bg-neutral-950 mt-4 hover:bg-white hover:text-black">
                    <Pencil /> Edit Profile
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Edit Profile</DialogTitle>
                </DialogHeader>

                <div className="flex flex-col gap-4 ">
                    {/* Avatar */}
                    <div className="flex justify-center relative mt-8">
                        <div className="relative w-[110px] h-[110px]">
                            <Image
                                src={avatarPreview || signedAvatarUrl || user.image || "/default-avatar.jpg"}
                                alt="avatar"
                                width={110}
                                height={110}
                                className="rounded-full cursor-pointer hover:opacity-80 duration-300"
                                onClick={() => avatarInputRef.current?.click()}
                            />

                        </div>
                        <input
                            type="file"
                            accept="image/*"
                            ref={avatarInputRef}
                            className="hidden"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                    setAvatarFile(file);
                                    setAvatarPreview(URL.createObjectURL(file));
                                }
                            }}
                        />
                    </div>


                    {/* Name & Email */}
                    <div>
                        <Label htmlFor="name" className="font-bold pb-2">Name</Label>
                        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
                    </div>
                    {/* <div>
                        <Label htmlFor="email" className="font-bold">Email</Label>
                        <Input id="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div> */}
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
