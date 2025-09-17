"use client";
import { useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";

export default function DeletePlaylistButton({ playlistId, playlistName }: { playlistId: number, playlistName: string }) {
    const [open, setOpen] = useState(false);
    const [inputName, setInputName] = useState("");
    const [loading, setLoading] = useState(false);

    const handleDelete = async () => {
        if (inputName !== playlistName) {
            alert("ชื่อ Playlist ไม่ตรงกัน");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`/api/playlist/${playlistId}`, {
                method: "DELETE",
            });

            if (res.ok) {
                alert("Playlist deleted successfully!");
                window.location.href = "/"; // กลับหน้าแรก
            } else {
                const data = await res.json();
                alert(data.error || "Failed to delete playlist.");
            }
        } catch (err) {
            alert("Error deleting playlist.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className="px-4 py-2 rounded-md hover:bg-red-700 text-white cursor-pointer"
            >
                <p className="font-bold">

                    Delete Playlist
                </p>
            </button>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogTitle>Confirm Delete Playlist</DialogTitle>
                    <DialogDescription>
                        พิมพ์ชื่อ {playlistName} เพื่อยืนยันการลบ
                    </DialogDescription>
                    <input
                        type="text"
                        value={inputName}
                        onChange={(e) => setInputName(e.target.value)}
                        placeholder="พิมพ์ชื่อ Playlist"
                        className="w-full mt-2 p-2 border rounded"
                    />
                    <div className="flex justify-end gap-2 mt-4">
                        <button
                            onClick={() => setOpen(false)}
                            className="px-4 py-2 rounded-md bg-gray-300"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleDelete}
                            disabled={loading}
                            className="px-4 py-2 rounded-md bg-red-600 text-white"
                        >
                            {loading ? "Deleting..." : "Delete"}
                        </button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
