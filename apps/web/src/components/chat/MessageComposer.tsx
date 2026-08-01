import { Paperclip, Smiley, PaperPlaneTilt } from "@phosphor-icons/react";
import { useState } from "react";

export function MessageComposer({ onSend }: { onSend: (message: string) => void }) {
  const [value, setValue] = useState("");
  const submit = () => { const message = value.trim(); if (!message) return; onSend(message); setValue(""); };
  return <div className="composer-wrap"><div className="composer"><button className="icon-button" aria-label="Attach a file"><Paperclip size={19} /></button><input value={value} onChange={(event) => setValue(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); submit(); } }} placeholder="Message #engineering" aria-label="Message" /><button className="icon-button" aria-label="Add emoji"><Smiley size={19} /></button><button className="send-button" onClick={submit} aria-label="Send message"><PaperPlaneTilt size={18} weight="fill" /></button></div><span className="composer-hint"><kbd>Enter</kbd> to send <span>·</span> <kbd>Shift + Enter</kbd> for a new line</span></div>;
}
