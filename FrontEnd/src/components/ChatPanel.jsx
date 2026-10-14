import { useEffect, useRef, useState } from "react";

export default function ChatPanel({ messages, onSend }) {
  const [text, setText] = useState("");
  const messageList = useRef(null);
  useEffect(() => {
    const container = messageList.current;
    if (container) container.scrollTop = container.scrollHeight;
  }, [messages]);
  function submit(event) {
    event.preventDefault();
    if (!text.trim()) return;
    onSend(text.trim());
    setText("");
  }
  return (
    <section className="flex h-[min(440px,calc(100dvh-17rem))] min-h-[320px] flex-col overflow-hidden rounded-2xl border border-emerald-950/10 bg-white shadow-[0_8px_25px_#16463710] sm:h-[min(480px,calc(100dvh-16rem))]">
      <div className="flex justify-between border-b border-emerald-950/5 px-5 py-[18px]">
        <div>
          <h2 className="text-base font-bold">sparkAI task</h2>
          <small className="text-xs text-slate-500">Your booking assistant</small>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700">
          <span className="relative flex size-2" aria-hidden="true">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]" />
          </span>
          Active
        </span>
      </div>
      <div ref={messageList} className="flex-1 overflow-auto bg-[#fcfdfc] p-5">
        {messages.map((message, index) => (
          <div
            className={"mb-3 flex " + (message.role === "user" ? "justify-end" : "")}
            key={index}
          >
            <div
              className={
                "max-w-[78%] px-[13px] py-[11px] text-sm leading-relaxed " +
                (message.role === "user"
                  ? "rounded-[14px_4px_14px_14px] bg-emerald-800 text-white"
                  : "rounded-[4px_14px_14px] bg-emerald-50 text-emerald-950")
              }
            >
              {message.content}
            </div>
          </div>
        ))}
      </div>
      <form className="flex gap-2 border-t border-emerald-950/5 p-3.5" onSubmit={submit}>
        <input
          className="min-w-0 flex-1 border-0 outline-none"
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="e.g. I need a consultation tomorrow at 3pm"
        />
        <button
          className="rounded-full bg-emerald-800 px-3 text-sm font-semibold text-white"
          aria-label="Send message"
        >
          Send
        </button>
      </form>
    </section>
  );
}
