"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function DeleteShortSongButton({
  shortSongId,
  songName,
}: {
  shortSongId: number;   // shortSong ใช้ number
  songName: string;
}) {
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState("");
  const router = useRouter();

  async function handleDelete() {
    setLoading(true);
    try {
      const res = await fetch(`/api/short-song`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: shortSongId }), 
      });

      if (res.ok) {
        alert("Short song deleted successfully!");
        router.refresh(); // โหลดข้อมูลใหม่แทน push("/")
      } else {
        const data = await res.json();
        alert(data.error || data.message || "Failed to delete short song.");
      }
    } catch (err) {
      alert("Error deleting short song.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="p-2 mt-4 rounded-md hover:bg-red-700 transition-colors flex gap-2 items-center cursor-pointer">
          <Trash2 className="w-5 h-5" />
          
        </button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogDescription>
            Please type the short song name <b>{songName}</b> to confirm deletion.
          </DialogDescription>
        </DialogHeader>

        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type song name here..."
          className="w-full border rounded-md px-3 py-2 mt-4"
        />

        <DialogFooter className="flex justify-end gap-2 mt-4">
          <Button
            variant="outline"
            onClick={() => setInput("")}
          >
            Cancel
          </Button>
          <Button
            className="bg-red-600 hover:bg-red-700 text-white"
            disabled={input !== songName || loading}
            onClick={handleDelete}
          >
            {loading ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
