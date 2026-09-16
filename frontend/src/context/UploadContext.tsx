import { createContext, ReactNode, useContext, useState } from "react";

interface UploadContextValue {
  isOpen: boolean;
  targetFolderId?: string;
  openUpload: (folderId?: string) => void;
  closeUpload: () => void;
}

const UploadContext = createContext<UploadContextValue | undefined>(undefined);

export function UploadProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [targetFolderId, setTargetFolderId] = useState<string | undefined>(undefined);

  const openUpload = (folderId?: string) => {
    setTargetFolderId(folderId);
    setIsOpen(true);
  };
  const closeUpload = () => setIsOpen(false);

  return (
    <UploadContext.Provider value={{ isOpen, targetFolderId, openUpload, closeUpload }}>
      {children}
    </UploadContext.Provider>
  );
}

export function useUploadContext() {
  const ctx = useContext(UploadContext);
  if (!ctx) throw new Error("useUploadContext must be used within UploadProvider");
  return ctx;
}
