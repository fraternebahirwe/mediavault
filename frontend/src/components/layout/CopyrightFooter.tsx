import clsx from "clsx";

export function CopyrightFooter({ className }: { className?: string }) {
  return (
    <p className={clsx("text-xs text-gray-400 dark:text-gray-500 text-center", className)}>
      &copy; {new Date().getFullYear()} Fraterne Bahirwe. All rights reserved.
    </p>
  );
}
