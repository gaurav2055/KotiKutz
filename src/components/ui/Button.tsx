// Button atom — the single source of truth for all buttons on the site.
// If you want to change how buttons look globally, do it here.
//
// Usage examples:
//   <Button>Click me</Button>
//   <Button variant="outline">Learn More</Button>
//   <Button variant="ghost" onClick={handleClick}>Cancel</Button>

import { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "outline" | "ghost" | "dark";
};

export default function Button({
  variant = "primary",
  className = "",
  children,
  ...props
}: ButtonProps) {
  const base = "px-9 py-3 rounded-[10px] text-xl font-normal cursor-pointer transition-all disabled:opacity-40 disabled:cursor-not-allowed";

  const variants = {
    primary: "bg-brand-blue text-white hover:opacity-80",
    dark:    "bg-brand-dark text-brand-green hover:opacity-80",
    outline: "border border-brand-dark text-brand-dark bg-transparent hover:bg-brand-dark hover:text-white",
    ghost:   "text-brand-dark bg-transparent hover:opacity-80",
  };

  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}
