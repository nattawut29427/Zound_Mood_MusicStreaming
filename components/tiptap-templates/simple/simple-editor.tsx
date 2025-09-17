"use client";

import * as React from "react";
import { EditorContent, EditorContext, useEditor } from "@tiptap/react";
import { getR2KeyFromUrl } from "@/lib/getR2key";
import { useSession } from "next-auth/react";
import { StarterKit } from "@tiptap/starter-kit";
import { Image } from "@tiptap/extension-image";
import { TaskItem, TaskList } from "@tiptap/extension-list";
import { TextAlign } from "@tiptap/extension-text-align";
import { Typography } from "@tiptap/extension-typography";
import { Highlight } from "@tiptap/extension-highlight";
import { Subscript } from "@tiptap/extension-subscript";
import { Superscript } from "@tiptap/extension-superscript";
import { Selection } from "@tiptap/extensions";

import { Button } from "@/components/tiptap-ui-primitive/button";
import { Spacer } from "@/components/tiptap-ui-primitive/spacer";
import { Toolbar, ToolbarGroup, ToolbarSeparator } from "@/components/tiptap-ui-primitive/toolbar";

import { ImageUploadNode } from "@/components/tiptap-node/image-upload-node/image-upload-node-extension";
import { HorizontalRule } from "@/components/tiptap-node/horizontal-rule-node/horizontal-rule-node-extension";

import { HeadingDropdownMenu } from "@/components/tiptap-ui/heading-dropdown-menu";
import { ImageUploadButton } from "@/components/tiptap-ui/image-upload-button";
import { ListDropdownMenu } from "@/components/tiptap-ui/list-dropdown-menu";
import { BlockquoteButton } from "@/components/tiptap-ui/blockquote-button";
import { CodeBlockButton } from "@/components/tiptap-ui/code-block-button";
import { AudioUploadButton } from "@/components/tiptap-ui/song-upload-button/audio-upload-button";
import { ColorHighlightPopover, ColorHighlightPopoverButton } from "@/components/tiptap-ui/color-highlight-popover";
import { LinkPopover, LinkContent, LinkButton } from "@/components/tiptap-ui/link-popover";
import { MarkButton } from "@/components/tiptap-ui/mark-button";
import { TextAlignButton } from "@/components/tiptap-ui/text-align-button";
import { UndoRedoButton } from "@/components/tiptap-ui/undo-redo-button";

import { ArrowLeftIcon } from "@/components/tiptap-icons/arrow-left-icon";
import { HighlighterIcon } from "@/components/tiptap-icons/highlighter-icon";
import { LinkIcon } from "@/components/tiptap-icons/link-icon";

import { useIsMobile } from "@/hooks/use-mobile";
import { useWindowSize } from "@/hooks/use-window-size";
import { useCursorVisibility } from "@/hooks/use-cursor-visibility";

import { ThemeToggle } from "@/components/tiptap-templates/simple/theme-toggle";
import { handleImageUpload, MAX_FILE_SIZE } from "@/lib/tiptap-utils";

import LoadingOverlay from "@/components/Loadingoveray/page"; // 👈 overlay spinner

import "@/components/tiptap-templates/simple/simple-editor.scss";

const MainToolbarContent = ({
  onHighlighterClick,
  onLinkClick,
  isMobile,
  onMusicSelect,
}: {
  onHighlighterClick: () => void;
  onLinkClick: () => void;
  isMobile: boolean;
  onMusicSelect: (data: any) => void;
}) => {
  return (
    <>
      <Spacer />
      <ToolbarGroup>
        <UndoRedoButton action="undo" />
        <UndoRedoButton action="redo" />
      </ToolbarGroup>
      <ToolbarSeparator />
      <ToolbarGroup>
        <HeadingDropdownMenu levels={[1, 2, 3, 4]} portal={isMobile} />
        <ListDropdownMenu types={["bulletList", "orderedList", "taskList"]} portal={isMobile} />
        <BlockquoteButton />
        <CodeBlockButton />
      </ToolbarGroup>
      <ToolbarSeparator />
      <ToolbarGroup>
        <MarkButton type="bold" />
        <MarkButton type="italic" />
        <MarkButton type="strike" />
        <MarkButton type="code" />
        <MarkButton type="underline" />
        {!isMobile ? <ColorHighlightPopover /> : <ColorHighlightPopoverButton onClick={onHighlighterClick} />}
        {!isMobile ? <LinkPopover /> : <LinkButton onClick={onLinkClick} />}
      </ToolbarGroup>
      <ToolbarSeparator />
      <ToolbarGroup>
        <MarkButton type="superscript" />
        <MarkButton type="subscript" />
      </ToolbarGroup>
      <ToolbarSeparator />
      <ToolbarGroup>
        <TextAlignButton align="left" />
        <TextAlignButton align="center" />
        <TextAlignButton align="right" />
        <TextAlignButton align="justify" />
      </ToolbarGroup>
      <ToolbarSeparator />
      <ToolbarGroup>
        <ImageUploadButton text="Add" />
        <AudioUploadButton text="Add" onMusicSelect={onMusicSelect} />
      </ToolbarGroup>
      <Spacer />
      {isMobile && <ToolbarSeparator />}
      <ToolbarGroup>
        <ThemeToggle />
      </ToolbarGroup>
    </>
  );
};

const MobileToolbarContent = ({
  type,
  onBack,
}: {
  type: "highlighter" | "link";
  onBack: () => void;
}) => (
  <>
    <ToolbarGroup>
      <Button data-style="ghost" onClick={onBack}>
        <ArrowLeftIcon className="tiptap-button-icon" />
        {type === "highlighter" ? (
          <HighlighterIcon className="tiptap-button-icon" />
        ) : (
          <LinkIcon className="tiptap-button-icon" />
        )}
      </Button>
    </ToolbarGroup>
    <ToolbarSeparator />
    {type === "highlighter" ? <ColorHighlightPopover /> : <LinkContent />}
  </>
);

export function SimpleEditor() {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const [isPrivate, setIsPrivate] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false); // 👈 overlay state

  const isMobile = useIsMobile();
  const windowSize = useWindowSize();
  const [mobileView, setMobileView] = React.useState<"main" | "highlighter" | "link">("main");
  const toolbarRef = React.useRef<HTMLDivElement>(null);
  const [selectedMusic, setSelectedMusic] = React.useState<{
    song_id: number;
    audioUrl: string;
    start: number;
    duration: number;
  } | null>(null);

  const editor = useEditor({
    immediatelyRender: false,
    shouldRerenderOnTransaction: false,
    editorProps: {
      attributes: {
        autocomplete: "off",
        autocorrect: "off",
        autocapitalize: "off",
        "aria-label": "Main content area, start typing to enter text.",
        class: "simple-editor",
      },
    },
    extensions: [
      StarterKit.configure({
        horizontalRule: false,
        link: { openOnClick: false, enableClickSelection: true },
      }),
      HorizontalRule,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Highlight.configure({ multicolor: true }),
      Image,
      Typography,
      Superscript,
      Subscript,
      Selection,
      ImageUploadNode.configure({
        accept: "image/*",
        maxSize: MAX_FILE_SIZE,
        limit: 3,
        upload: handleImageUpload,
        onError: (error) => console.error("Upload failed:", error),
      }),
    ],
  });

  const bodyRect = useCursorVisibility({
    editor,
    overlayHeight: toolbarRef.current?.getBoundingClientRect().height ?? 0,
  });

  const getTitleFromEditor = () => {
    if (!editor) return "";
    const json = editor.getJSON();
    const h1Node = json.content?.find((node: any) => node.type === "heading" && node.attrs?.level === 1);
    return h1Node?.content?.filter((child: any) => child.type === "text")?.map((child: any) => child.text)?.join("")?.trim() ?? "";
  };

  const handleMusicSelected = (data: { song_id: number; audioUrl: string; start: number; duration: number }) => {
    setSelectedMusic(data);
  };

  const handleSubmit = async () => {
    if (!editor || !userId) return;

    const title = getTitleFromEditor();
    if (!title) { alert("❌ กรุณาใส่หัวข้อ H1 เป็นชื่อไดอารี่"); return; }
    if (!selectedMusic) { alert("❌ กรุณาเลือกเพลงและช่วงเวลาตัด"); return; }

    try {
      setIsSaving(true); // 🔥 overlay start

      const res = await fetch("/api/process-r2-audio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          r2Key: getR2KeyFromUrl(selectedMusic.audioUrl),
          start: selectedMusic.start,
          duration: selectedMusic.duration,
        }),
      });
      const data = await res.json();
      if (!res.ok) { alert("❌ ตัดเพลงไม่สำเร็จ: " + data.message); return; }

      const trimmedAudioUrl = data.url;
      const saveRes = await fetch("/api/dairy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name_diary: title,
          content: editor.getHTML(),
          trimmed_audio_url: trimmedAudioUrl,
          song_id: selectedMusic.song_id,
          is_private: isPrivate,
          user_id: userId,
        }),
      });

      if (saveRes.ok) {
        alert("✅ บันทึกสำเร็จ");
        editor.commands.clearContent();
        setSelectedMusic(null);
      } else {
        alert("❌ เกิดข้อผิดพลาดขณะบันทึกไดอารี่");
      }
    } catch (error) {
      alert("❌ เกิดข้อผิดพลาด: " + String(error));
    } finally {
      setIsSaving(false); 
    }
  };

  React.useEffect(() => {
    if (!isMobile && mobileView !== "main") setMobileView("main");
  }, [isMobile, mobileView]);

  return (
    <div className="simple-editor-wrapper relative h-[550px] flex flex-col">
      {/* Overlay Loading */}
      <LoadingOverlay show={isSaving} />

      <EditorContext.Provider value={{ editor }}>
        <Toolbar
          ref={toolbarRef}
          style={isMobile ? { bottom: `calc(100% - ${windowSize.height - bodyRect.y}px)` } : {}}
        >
          {mobileView === "main" ? (
            <MainToolbarContent
              onHighlighterClick={() => setMobileView("highlighter")}
              onLinkClick={() => setMobileView("link")}
              isMobile={isMobile}
              onMusicSelect={handleMusicSelected}
            />
          ) : (
            <MobileToolbarContent
              type={mobileView === "highlighter" ? "highlighter" : "link"}
              onBack={() => setMobileView("main")}
            />
          )}
        </Toolbar>

        <div className="flex-1 overflow-y-auto p-4">
          <EditorContent editor={editor} role="presentation" className="simple-editor-content min-h-[300px]" />
        </div>
      </EditorContext.Provider>

      <div className="p-4 border-t border-zinc-700 flex justify-between items-center">
        <div
          onClick={() => setIsPrivate(!isPrivate)}
          className={`w-14 h-7 flex items-center rounded-full p-1 cursor-pointer transition ${isPrivate ? "bg-indigo-600" : "bg-gray-500"}`}
        >
          <div className={`bg-white w-5 h-5 rounded-full shadow-md transform transition ${isPrivate ? "translate-x-7" : "translate-x-0"}`}></div>
        </div>
        <span className="text-white">{isPrivate ? "Private (ส่วนตัว)" : "Public (สาธารณะ)"}</span>
        <button
          onClick={handleSubmit}
          className="py-3 px-6 cursor-pointer rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition"
          type="button"
        >
          {isSaving ? "กำลังบันทึก..." : "บันทึกไดอารี่"}
        </button>
      </div>
    </div>
  );
}
