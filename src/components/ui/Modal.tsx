type ModalProps = {
  onClose:     () => void;
  theme?:      "dark" | "light";
  width?:      string;
  scrollable?: boolean;
  children:    React.ReactNode;
};

const THEME = {
  dark:  { backdrop: "bg-black/70", panel: "bg-[#111] rounded-[14px] shadow-2xl" },
  light: { backdrop: "bg-black/40", panel: "bg-white rounded-[10px] shadow-xl"   },
};

export default function Modal({
  onClose,
  theme      = "dark",
  width      = "w-[480px]",
  scrollable = false,
  children,
}: ModalProps) {
  const t = THEME[theme];

  return (
    <>
      <div className={`fixed inset-0 ${t.backdrop} z-40`} onClick={onClose} />
      <div
        className={`fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 ${t.panel} ${width} p-8 ${
          scrollable ? "max-h-[90vh] overflow-y-auto" : ""
        }`}
      >
        {children}
      </div>
    </>
  );
}
