// Dropdown_in_profile_page

import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useSidebar } from "@/app/context/SidebarContext";
import { Ellipsis } from "lucide-react";
import DelPF from "@/components/button/Profile/DelsgPF"

export default function ProfileSongDropdown({
    songId,
    picture,
}: {
    songId: number;
    picture: string;
}) {
    const { setView } = useSidebar();



    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button
                    className="text-white p-2 rounded-full hover:bg-black/55 transition cursor-pointer"
                    onClick={(e) => e.stopPropagation()} // ป้องกัน bubble จาก trigger
                >
                    <Ellipsis className="w-5 h-5" />
                </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
                sideOffset={5}
                className="w-40"
                onClick={(e) => e.stopPropagation()} // ป้องกัน bubble จาก content
            >
                <DropdownMenuItem
                    onSelect={(e) => {
                        e.preventDefault(); // ป้องกัน default Radix behavior
                        e.stopPropagation(); // ป้องกัน bubble
                        setView("createPlaylist", { id: songId, picture });
                    }}
                >
                    Add to Playlist
                </DropdownMenuItem>



                <DropdownMenuItem
                    onSelect={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        alert("Add to queue");
                    }}
                >
                    Like
                </DropdownMenuItem>

                <DropdownMenuSeparator />
               

                
                <DropdownMenuItem

                    onSelect={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        alert("Add to queue");
                    }}
                >
                    Report
                </DropdownMenuItem>
                    {/* <DelPF songId={songId} songName={songId}/> */}
               


            </DropdownMenuContent>
        </DropdownMenu>

    );
}
