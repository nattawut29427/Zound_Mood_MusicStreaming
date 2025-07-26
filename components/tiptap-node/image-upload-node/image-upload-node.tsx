"use client";

import * as React from "react";
import type { NodeViewProps } from "@tiptap/react";
import { NodeViewWrapper } from "@tiptap/react";
import { Button } from "@/components/tiptap-ui-primitive/button";
import { CloseIcon } from "@/components/tiptap-icons/close-icon";
import "@/components/tiptap-node/image-upload-node/image-upload-node.scss";
import { isValidPosition } from "@/lib/tiptap-utils";
import { useUploadThing } from "@/lib/uploadthing";


export interface FileItem {
  id: string;
  file: File;
  progress: number;
  status: "uploading" | "success" | "error";
  url?: string;
  previewUrl?: string;
}

export interface UploadOptions {
  maxSize: number;
  limit: number;
  accept: string;
  onSuccess?: (url: string) => void;
  onError?: (error: Error) => void;
}

const CloudUploadIcon: React.FC = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    className="tiptap-image-upload-icon"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M11.1953 4.41771C10.3478 4.08499 9.43578 3.94949 8.5282 4.02147C7.62062 4.09345 6.74133 4.37102 5.95691 4.83316C5.1725 5.2953 4.50354 5.92989 4.00071 6.68886C3.49788 7.44783 3.17436 8.31128 3.05465 9.2138C2.93495 10.1163 3.0222 11.0343 3.3098 11.8981C3.5974 12.7619 4.07781 13.5489 4.71463 14.1995C5.10094 14.5942 5.09414 15.2274 4.69945 15.6137C4.30476 16 3.67163 15.9932 3.28532 15.5985C2.43622 14.731 1.79568 13.6816 1.41221 12.5299C1.02875 11.3781 0.91241 10.1542 1.07201 8.95084C1.23162 7.74748 1.66298 6.59621 2.33343 5.58425C3.00387 4.57229 3.89581 3.72617 4.9417 3.10998C5.98758 2.4938 7.15998 2.1237 8.37008 2.02773C9.58018 1.93176 10.7963 2.11243 11.9262 2.55605C13.0561 2.99968 14.0703 3.69462 14.8919 4.58825C15.5423 5.29573 16.0585 6.11304 16.4177 7.00002H17.4999C18.6799 6.99991 19.8288 7.37933 20.7766 8.08222C21.7245 8.78515 22.4212 9.7743 22.7637 10.9036C23.1062 12.0328 23.0765 13.2423 22.6788 14.3534C22.2812 15.4644 21.5367 16.4181 20.5554 17.0736C20.0962 17.3803 19.4752 17.2567 19.1684 16.7975C18.8617 16.3382 18.9853 15.7172 19.4445 15.4105C20.069 14.9934 20.5427 14.3865 20.7958 13.6794C21.0488 12.9724 21.0678 12.2027 20.8498 11.4841C20.6318 10.7655 20.1885 10.136 19.5853 9.6887C18.9821 9.24138 18.251 8.99993 17.5001 9.00002H15.71C15.2679 9.00002 14.8783 8.70973 14.7518 8.28611C14.4913 7.41374 14.0357 6.61208 13.4195 5.94186C12.8034 5.27164 12.0427 4.75043 11.1953 4.41771Z"
      fill="currentColor"
    />
    <path
      d="M11 14.4142V21C11 21.5523 11.4477 22 12 22C12.5523 22 13 21.5523 13 21V14.4142L15.2929 16.7071C15.6834 17.0976 16.3166 17.0976 16.7071 16.7071C17.0976 16.3166 17.0976 15.6834 16.7071 15.2929L12.7078 11.2936C12.7054 11.2912 12.703 11.2888 12.7005 11.2864C12.5208 11.1099 12.2746 11.0008 12.003 11L12 11L11.997 11C11.8625 11.0004 11.7343 11.0273 11.6172 11.0759C11.502 11.1236 11.3938 11.1937 11.2995 11.2864C11.297 11.2888 11.2946 11.2912 11.2922 11.2936L7.29289 15.2929C6.90237 15.6834 6.90237 16.3166 7.29289 16.7071C7.68342 17.0976 8.31658 17.0976 8.70711 16.7071L11 14.4142Z"
      fill="currentColor"
    />
  </svg>
);

const FileIcon: React.FC = () => (
  <svg
    width="43"
    height="57"
    viewBox="0 0 43 57"
    fill="currentColor"
    className="tiptap-image-upload-dropzone-rect-primary"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M0.75 10.75C0.75 5.64137 4.89137 1.5 10 1.5H32.3431C33.2051 1.5 34.0317 1.84241 34.6412 2.4519L40.2981 8.10876C40.9076 8.71825 41.25 9.5449 41.25 10.4069V46.75C41.25 51.8586 37.1086 56 32 56H10C4.89137 56 0.75 51.8586 0.75 46.75V10.75Z"
      fill="currentColor"
      fillOpacity="0.11"
      stroke="currentColor"
      strokeWidth="1.5"
    />
  </svg>
);

const FileCornerIcon: React.FC = () => (
  <svg
    width="10"
    height="10"
    className="tiptap-image-upload-dropzone-rect-secondary"
    viewBox="0 0 10 10"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M0 0.75H0.343146C1.40401 0.75 2.42143 1.17143 3.17157 1.92157L8.82843 7.57843C9.57857 8.32857 10 9.34599 10 10.4069V10.75H4C1.79086 10.75 0 8.95914 0 6.75V0.75Z"
      fill="currentColor"
    />
  </svg>
);

interface ImageUploadDragAreaProps {
  onFile: (files: File[]) => void;
  children?: React.ReactNode;
}

const ImageUploadDragArea: React.FC<ImageUploadDragAreaProps> = ({
  onFile,
  children,
}) => {
  const [isDragOver, setIsDragOver] = React.useState(false);
  const [isDragActive, setIsDragActive] = React.useState(false);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragActive(false);
      setIsDragOver(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      onFile(files);
    }
  };

  return (
    <div
      className={`tiptap-image-upload-drag-area ${
        isDragActive ? "drag-active" : ""
      } ${isDragOver ? "drag-over" : ""}`}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {children}
    </div>
  );
};

interface ImageUploadPreviewProps {
  fileItem: FileItem;
  onRemove: () => void;
}

const ImageUploadPreview: React.FC<ImageUploadPreviewProps> = ({
  fileItem,
  onRemove,
}) => {
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  const previewUrl = fileItem.previewUrl || fileItem.url;

  return (
    <div className="tiptap-image-upload-preview">
      {fileItem.previewUrl && (
        <div className="tiptap-image-upload-preview-image">
          <img
            src={fileItem.previewUrl}
            alt={fileItem.file.name}
            className="preview-thumbnail"
          />
        </div>
      )}

      {fileItem.status === "uploading" && (
        <div
          className="tiptap-image-upload-progress"
          style={{ width: `${fileItem.progress}%` }}
        />
      )}

      <div className="tiptap-image-upload-preview-content">
        <div className="tiptap-image-upload-file-info">
          <div className="tiptap-image-upload-file-icon">
            <CloudUploadIcon />
          </div>
          <div className="tiptap-image-upload-details">
            <span className="tiptap-image-upload-text">
              {fileItem.file.name}
            </span>
            <span className="tiptap-image-upload-subtext">
              {formatFileSize(fileItem.file.size)}
            </span>
          </div>
        </div>
        <div className="tiptap-image-upload-actions">
          {fileItem.status === "uploading" && (
            <span className="tiptap-image-upload-progress-text">
              {fileItem.progress}%
            </span>
          )}
          <Button
            type="button"
            data-style="ghost"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
          >
            <CloseIcon className="tiptap-button-icon" />
          </Button>
        </div>
      </div>
    </div>
  );
};

const DropZoneContent: React.FC<{ maxSize: number; limit: number }> = ({
  maxSize,
  limit,
}) => (
  <>
    <div className="tiptap-image-upload-dropzone">
      <FileIcon />
      <FileCornerIcon />
      <div className="tiptap-image-upload-icon-container">
        <CloudUploadIcon />
      </div>
    </div>

    <div className="tiptap-image-upload-content">
      <span className="tiptap-image-upload-text">
        <em>Click to upload</em> or drag and drop
      </span>
      <span className="tiptap-image-upload-subtext">
        Maximum {limit} file{limit === 1 ? "" : "s"}, {maxSize / 1024 / 1024}MB
        each.
      </span>
    </div>
  </>
);

export const ImageUploadNode: React.FC<NodeViewProps> = (props) => {
  const { accept, limit, maxSize } = props.node.attrs;
  const inputRef = React.useRef<HTMLInputElement>(null);
  const extension = props.extension;
  
  // State สำหรับจัดการสถานะอัปโหลด
  const [fileItems, setFileItems] = React.useState<FileItem[]>([]);
  const [isUploading, setIsUploading] = React.useState(false);

  // ใช้ UploadThing สำหรับการอัปโหลด
  const { startUpload } = useUploadThing("imageUploader", {
    onClientUploadComplete: (res) => {
      setIsUploading(false);
      if (res) {
        handleUploadSuccess(res);
      }
    },
    onUploadError: (error) => {
      setIsUploading(false);
      extension.options.onError?.(error);
      setFileItems(prev => prev.map(item => 
        item.status === "uploading" 
          ? { ...item, status: "error", progress: 0 } 
          : item
      ));
    },
    onUploadProgress: (progress) => {
      // แก้ไข: ใช้ progress อย่างเดียวโดยไม่ใช้ filename
      // เนื่องจาก UploadThing ไม่ส่ง filename ใน progress callback
      setFileItems(prev => prev.map(item => 
        item.status === "uploading"
          ? { ...item, progress }
          : item
      ));
    },
    onUploadBegin: () => {
      setFileItems(prev => prev.map(item => 
        item.status === "uploading" 
          ? { ...item, progress: 10 } 
          : item
      ));
    },
  });

  const handleUploadSuccess = (uploadResults: { url: string; name: string }[]) => {
    // แทรกภาพใน editor
    const pos = props.getPos();
    if (isValidPosition(pos)) {
      const imageNodes = uploadResults.map((result) => {
        const fileItem = fileItems.find(item => item.file.name === result.name);
        const filename = fileItem?.file.name.replace(/\.[^/.]+$/, "") || "unknown";
        
        return {
          type: "image",
          attrs: {
            src: result.url,
            alt: filename,
            title: filename,
            utKey: result.url,
          },
        };
      });

      props.editor
        .chain()
        .focus()
        .deleteRange({ from: pos, to: pos + 1 })
        .insertContentAt(pos, imageNodes)
        .run();
      
      // ล้าง fileItems หลังจากแทรกโหนดภาพ
      fileItems.forEach(item => {
        if (item.previewUrl) {
          URL.revokeObjectURL(item.previewUrl);
        }
      });
      setFileItems([]);
    }
  };

  const validateFiles = (files: File[]): boolean => {
    // ตรวจสอบจำนวนไฟล์
    if (limit && files.length > limit) {
      extension.options.onError?.(
        new Error(`Maximum ${limit} file${limit === 1 ? "" : "s"} allowed`)
      );
      return false;
    }

    // ตรวจสอบขนาดไฟล์
    for (const file of files) {
      if (file.size > maxSize) {
        extension.options.onError?.(
          new Error(`File size exceeds maximum allowed (${maxSize / 1024 / 1024}MB)`)
        );
        return false;
      }
    }

    // ตรวจสอบประเภทไฟล์โดยใช้ accept string
    if (accept) {
      const acceptTypes = accept.split(',').map(type => type.trim());
      const isValid = files.every(file => {
        return acceptTypes.some(type => {
          if (type.startsWith('.')) {
            // Extension: e.g., .jpg
            const ext = type.toLowerCase();
            return file.name.toLowerCase().endsWith(ext);
          } else {
            // MIME type: e.g., image/jpeg or image/*
            if (type.endsWith('/*')) {
              const category = type.split('/')[0];
              return file.type.startsWith(`${category}/`);
            } else {
              return file.type === type;
            }
          }
        });
      });

      if (!isValid) {
        extension.options.onError?.(
          new Error(`File type not allowed. Allowed types: ${accept}`)
        );
        return false;
      }
    }

    return true;
  };

  const handleUpload = async (files: File[]) => {
    if (!files || files.length === 0) return;
    
    // ตรวจสอบไฟล์
    if (!validateFiles(files)) return;
    
    // สร้าง fileItems สำหรับแสดงพรีวิว
    const newFileItems: FileItem[] = files.map(file => ({
      id: crypto.randomUUID(),
      file,
      progress: 0,
      status: "uploading",
      previewUrl: URL.createObjectURL(file),
    }));
    
    setFileItems(newFileItems);
    setIsUploading(true);
    
    try {
      // เริ่มกระบวนการอัปโหลดด้วย UploadThing
      await startUpload(files);
    } catch (error) {
      console.error("Upload error:", error);
      extension.options.onError?.(
        error instanceof Error ? error : new Error("Upload failed")
      );
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) {
      return;
    }
    handleUpload(Array.from(files));
  };

  const handleClick = () => {
    if (inputRef.current && fileItems.length === 0) {
      inputRef.current.value = "";
      inputRef.current.click();
    }
  };

  const handleRemoveFile = (fileId: string) => {
    setFileItems(prev => {
      const newItems = prev.filter(item => item.id !== fileId);
      const removedItem = prev.find(item => item.id === fileId);
      
      if (removedItem?.previewUrl) {
        URL.revokeObjectURL(removedItem.previewUrl);
      }
      
      return newItems;
    });
  };

  return (
    <NodeViewWrapper
      className="tiptap-image-upload"
      tabIndex={0}
      onClick={handleClick}
    >
      {/* แสดงส่วนอัปโหลด */}
      {fileItems.length === 0 && !props.node.attrs.utKey && (
        <ImageUploadDragArea onFile={handleUpload}>
          <DropZoneContent maxSize={maxSize} limit={limit} />
        </ImageUploadDragArea>
      )}

      {/* แสดงสถานะอัปโหลด */}
      {fileItems.length > 0 && (
        <div className="tiptap-image-upload-previews">
          {fileItems.length > 1 && (
            <div className="tiptap-image-upload-header">
              <span>Uploading {fileItems.length} files</span>
              <Button
                type="button"
                data-style="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  fileItems.forEach(item => {
                    if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
                  });
                  setFileItems([]);
                  setIsUploading(false);
                }}
                disabled={isUploading}
              >
                Clear All
              </Button>
            </div>
          )}
          
          {fileItems.map((fileItem) => (
            <ImageUploadPreview
              key={fileItem.id}
              fileItem={fileItem}
              onRemove={() => handleRemoveFile(fileItem.id)}
            />
          ))}
        </div>
      )}

      {/* แสดงภาพหลังอัปโหลด */}
      {props.node.attrs.utKey && (
        <div className="tiptap-image-preview">
          <img
            src={props.node.attrs.src}
            alt={props.node.attrs.alt || "Uploaded image"}
            title={props.node.attrs.title || ""}
            className="uploaded-image"
          />
        </div>
      )}

      <input
        ref={inputRef}
        name="file"
        accept={accept}
        type="file"
        multiple={limit > 1}
        onChange={handleChange}
        onClick={(e) => e.stopPropagation()}
        disabled={isUploading}
      />
    </NodeViewWrapper>
  );
};