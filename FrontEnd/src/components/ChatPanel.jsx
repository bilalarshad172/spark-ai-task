import { useEffect, useRef, useState } from "react";

export default function ChatPanel({ messages, onSend }) {
  const [text, setText] = useState("");
  const bottom = useRef(null);
  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  function submit(event) {
    event.preventDefault();
    if (!text.trim()) return;
    onSend(text.trim());
    setText("");
  }
  return (
    <section className="flex h-[500px] flex-col overflow-hidden rounded-2xl border border-emerald-950/10 bg-white shadow-[0_8px_25px_#16463710] sm:h-[590px]">
      <div className="flex justify-between border-b border-emerald-950/5 px-5 py-[18px]">
        <div>
          <h2 className="text-base font-bold">Booking assistant</h2>
          <small className="text-xs text-slate-500">Usually replies right away</small>
        </div>
        <span className="rounded-full bg-emerald-50 px-2 py-1 text-[11px] text-emerald-700">
          Online
        </span>
      </div>
      <div className="flex-1 overflow-auto bg-[#fcfdfc] p-5">
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
        <div ref={bottom} />
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
