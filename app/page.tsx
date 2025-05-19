import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { AuroraText } from "@/components/magicui/aurora-text";
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  Repeat,
  Shuffle
} from "lucide-react";

export default function Home() {
  return (
    <div className="bg-black h-screen flex flex-col justify-between">
      {/* Header */}
      <header className="bg-black p-6 h-16 w-full sticky top-0 z-10 mb-4 flex items-center justify-between">
        <div className="text-white font-bold text-2xl "><AuroraText>Logo</AuroraText></div>
        <div className="flex-1 max-w-lg pt-2.5">
          <input
            type="text"
            placeholder="Type your song..."
            className="w-full h-12 px-4  rounded-full bg-white text-black placeholder-gray-400 focus:outline-none"
          />
        </div>
        <div className="flex items-center space-x-4">
          <Button className="rounded-4xl cursor-pointer">Feed</Button>
          <div className="bg-white h-10 rounded-full w-1 bg-gradient-to-b from-red-500 to-pink-400">

          </div>
          <Button className="btn btn-primary ">Upload</Button>
          <Avatar>
            <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex justify-between m-auto space-x-2 ">
        <div className="w-25 bg-gradient-to-t from-black from-[10%] to-[#252525] shadow-xl flex flex-col justify-between">
          <div className=""></div>
        </div>
        <div className="w-260   bg-gradient-to-t from-black from-[10%] to-[#252525]  shadow-lg flex flex-col justify-between">
          <div className="p-10">
            <h1 className="text-white font-bold text-4xl">Topic</h1>
          </div>
        </div>
        <div className="w-82    bg-gradient-to-t from-black from-[10%] to-[#252525]  shadow-lg flex flex-col justify-between">
          <div className="">3</div>
        </div>
      </main>
      {/* Footer */}
      <footer className="bg-white flex items-center justify-between shadow-2xl p-4 h-20 w-full">
  {/* Left side */}
  <div className="flex items-center space-x-4 w-1/3 pl-4">
    <Image src="/audio/song.jpg" alt="cover" width={48} height={48} className="rounded-md" />
    <div className="text-black">
      <p className="font-semibold">Song name</p>
      <p className="text-xs text-gray-600">Artist name</p>
    </div>
  </div>

  {/* Center controls */}
  <div className="flex items-center justify-center space-x-4 w-1/3">
    <Shuffle className="w-5 h-5 text-black hover:text-blue-500 cursor-pointer" />
    <SkipBack className="w-6 h-6 text-black hover:text-blue-500 cursor-pointer" />
    <Play className="w-8 h-8 text-black hover:text-blue-500 cursor-pointer" />
    {/* ถ้าเล่นอยู่ให้ใช้ <Pause /> แทน */}
    <SkipForward className="w-6 h-6 text-black hover:text-blue-500 cursor-pointer" />
    <Repeat className="w-5 h-5 text-black hover:text-blue-500 cursor-pointer" />
  </div>

  {/* Right volume */}
  <div className="flex items-center justify-end space-x-2 w-1/3 pr-4">
    <Volume2 className="w-5 h-5 text-black" />
    <input
      type="range"
      min={0}
      max={100}
      defaultValue={70}
      className="w-24 h-1 bg-gray-300 rounded-lg appearance-none cursor-pointer"
    />
  </div>
</footer>
    </div>
  );
}
