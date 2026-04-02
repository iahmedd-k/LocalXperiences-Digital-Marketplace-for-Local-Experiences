import { useState } from "react";
import Button from "../common/Button.jsx";

export default function ReviewForm({ onSuccess }) {
  const [text, setText] = useState("");

  return (
    <div className="rounded-2xl border border-emerald-100 bg-white p-5">
      <h4 className="mb-2 text-base font-bold text-slate-800">Share your experience</h4>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="min-h-24 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-400"
        placeholder="Write a short review"
      />
      <div className="mt-3">
        <Button
          onClick={() => {
            setText("");
            onSuccess?.();
          }}
          disabled={!text.trim()}
          size="sm"
        >
          Submit Review
        </Button>
      </div>
    </div>
  );
}
