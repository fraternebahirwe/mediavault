import { ReactNode, useEffect, useLayoutEffect, useRef, useState } from "react";
import clsx from "clsx";

interface DropdownProps {
  trigger: ReactNode;
  children: (close: () => void) => ReactNode;
  align?: "left" | "right";
}

export function Dropdown({ trigger, children, align = "right" }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [openUpward, setOpenUpward] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const onClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [isOpen]);

  // Flip the menu above the trigger when there isn't enough room below -
  // otherwise, on mobile, a menu opened near the bottom of the screen ends
  // up partly covered by the fixed bottom nav bar.
  useLayoutEffect(() => {
    if (!isOpen || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const estimatedMenuHeight = 320;
    const spaceBelow = window.innerHeight - rect.bottom;
    setOpenUpward(spaceBelow < estimatedMenuHeight && rect.top > estimatedMenuHeight);
  }, [isOpen]);

  return (
    <div className="relative" ref={ref}>
      <div
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen((v) => !v);
        }}
      >
        {trigger}
      </div>
      {isOpen && (
        <div
          className={clsx(
            "absolute z-40 min-w-[180px] max-h-[70vh] overflow-y-auto card p-1 animate-fade-in",
            openUpward ? "bottom-full mb-1" : "top-full mt-1",
            align === "right" ? "right-0" : "left-0"
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {children(() => setIsOpen(false))}
        </div>
      )}
    </div>
  );
}

export function DropdownItem({
  children,
  onClick,
  danger,
}: {
  children: ReactNode;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "flex items-center gap-2 w-full px-3 py-2 text-sm rounded-lg text-left hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors",
        danger && "text-red-600 dark:text-red-400"
      )}
    >
      {children}
    </button>
  );
}
