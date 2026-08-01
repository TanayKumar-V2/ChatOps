import { Paperclip, PaperPlaneTilt, X } from "@phosphor-icons/react";
import { useRef, useState } from "react";
import { imageMessagePlaceholder } from "@chatops/contracts";

type Attachment = { name: string; dataUrl: string };

function prepareImage(file: File) {
  return new Promise<string>((resolve, reject) => {
    if (!file.type.startsWith("image/")) return reject(new Error("Please choose an image file"));
    if (file.size > 10 * 1024 * 1024) return reject(new Error("Images must be smaller than 10 MB"));
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Unable to read this image"));
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => reject(new Error("Unable to process this image"));
      image.onload = () => {
        const maxDimension = 1600;
        const scale = Math.min(1, maxDimension / Math.max(image.naturalWidth, image.naturalHeight));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
        canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
        const context = canvas.getContext("2d");
        if (!context) return reject(new Error("Unable to process this image"));
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          if (!blob) return reject(new Error("Unable to compress this image"));
          const output = new FileReader();
          output.onerror = () => reject(new Error("Unable to prepare this image"));
          output.onload = () => {
            const dataUrl = String(output.result);
            if (dataUrl.length > 3_000_000) return reject(new Error("This image is still too large after compression"));
            resolve(dataUrl);
          };
          output.readAsDataURL(blob);
        }, "image/jpeg", 0.82);
      };
      image.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

export function MessageComposer({ roomName, onSend }: { roomName: string; onSend: (message: string, imageUrl?: string) => void }) {
  const [value, setValue] = useState("");
  const [attachment, setAttachment] = useState<Attachment | null>(null);
  const [attachmentError, setAttachmentError] = useState("");
  const [attachmentLoading, setAttachmentLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const submit = () => { const message = value.trim(); if (!message && !attachment) return; onSend(message || imageMessagePlaceholder, attachment?.dataUrl); setValue(""); setAttachment(null); setAttachmentError(""); };
  const chooseFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setAttachmentError(""); setAttachmentLoading(true);
    try { setAttachment({ name: file.name, dataUrl: await prepareImage(file) }); }
    catch (cause) { setAttachmentError(cause instanceof Error ? cause.message : "Unable to attach this image"); }
    finally { setAttachmentLoading(false); }
  };
  return <div className="composer-wrap">{attachment && <div className="composer-attachment"><img src={attachment.dataUrl} alt="Selected attachment preview" /><div><strong>{attachment.name}</strong><small>Image ready to send</small></div><button className="icon-button" onClick={() => setAttachment(null)} aria-label="Remove image attachment"><X size={16} /></button></div>}{attachmentError && <div className="composer-attachment-error" role="alert">{attachmentError}</div>}<div className="composer"><input ref={fileInputRef} className="file-input" type="file" accept="image/*" onChange={chooseFile} /><button className="icon-button" onClick={() => fileInputRef.current?.click()} aria-label="Attach an image" disabled={attachmentLoading}>{attachmentLoading ? "…" : <Paperclip size={19} />}</button><input value={value} onChange={(event) => setValue(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); submit(); } }} placeholder={`Message #${roomName}`} aria-label={`Message in ${roomName}`} /><button className="send-button" onClick={submit} aria-label="Send message" disabled={attachmentLoading}><PaperPlaneTilt size={18} weight="fill" /></button></div><span className="composer-hint"><kbd>Enter</kbd> to send <span>·</span> <kbd>Shift + Enter</kbd> for a new line</span></div>;
}
