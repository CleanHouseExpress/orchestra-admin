import * as React from "react";

import { cn } from "./utils";

const defaultButtonStyle: React.CSSProperties = {
  background: "linear-gradient(135deg, rgb(99, 102, 241), rgb(67, 56, 202))",
  backgroundClip: "padding-box",
  border: 0,
  fontSize: "13px",
  color: "rgb(255, 255, 255)",
  fontFamily: "'Inter', sans-serif",
  fontWeight: 500,
};

function DefaultButton({ className, style, ...props }: React.ComponentProps<"button">) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 overflow-hidden rounded-xl px-4 py-2 transition-all duration-200 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60",
        className,
      )}
      style={{ ...defaultButtonStyle, ...style }}
      {...props}
    />
  );
}

export { DefaultButton, defaultButtonStyle };
