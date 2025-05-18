import Image from "next/image";

export default function Home() {
  return (
    <div className="bg-gradient-to-b from-black from-[58%] to-white min-h-screen flex flex-col justify-between">
      {/* Header */}
      <header className="bg-[#252525] p-6 h-16 w-full sticky top-0 z-10 mb-4 flex items-center justify-between">
        <div>Logo</div>
        <div className="flex-1 max-w-lg">
          <input
            type="text"
            placeholder="Type your song..."
            className="w-full h-12 px-4 rounded-full bg-white text-black placeholder-gray-400 focus:outline-none"
          />
        </div>
        <div className="flex items-center space-x-4">
          <h1>Feed</h1>
          <h2>|</h2>
          <button className="btn btn-primary ">
            Upload
          </button>
          <div className="avatar">
            <div className="w-10 rounded-full">
              <img src="https://img.daisyui.com/images/profile/demo/yellingcat@192.webp"/>
            </div>
            <button className="btn"></button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex justify-between m-auto space-x-2 ">
        <div className="w-25   bg-[#252525] shadow-lg flex flex-col justify-between">
          <div className="">1</div>
        </div>
        <div className="w-260   bg-[#252525]  shadow-lg flex flex-col justify-between">
          <div className="">2</div>
        </div>
        <div className="w-82    bg-[#252525]  shadow-lg flex flex-col justify-between">
          <div className="">3</div>
        </div>
      </main>
      {/* Footer */}
      <footer className="bg-[#252525] p-6 h-16 w-full mt-6">
        
      </footer>
    </div>
  );
}
