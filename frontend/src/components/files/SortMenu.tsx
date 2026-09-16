import { ArrowDownAZ, ArrowUpAZ, Check } from "lucide-react";
import { Dropdown, DropdownItem } from "../ui/Dropdown";
import { SortBy, SortOrder } from "../../types";

const OPTIONS: { value: SortBy; label: string }[] = [
  { value: "date", label: "Date" },
  { value: "name", label: "Name" },
  { value: "size", label: "Size" },
  { value: "type", label: "Type" },
];

interface SortMenuProps {
  sortBy: SortBy;
  sortOrder: SortOrder;
  onChange: (sortBy: SortBy, sortOrder: SortOrder) => void;
}

export function SortMenu({ sortBy, sortOrder, onChange }: SortMenuProps) {
  return (
    <Dropdown
      trigger={
        <button className="btn-secondary">
          {sortOrder === "asc" ? <ArrowUpAZ size={16} /> : <ArrowDownAZ size={16} />}
          Sort: {OPTIONS.find((o) => o.value === sortBy)?.label}
        </button>
      }
    >
      {(close) => (
        <>
          {OPTIONS.map((opt) => (
            <DropdownItem
              key={opt.value}
              onClick={() => {
                onChange(opt.value, sortBy === opt.value && sortOrder === "asc" ? "desc" : "asc");
                close();
              }}
            >
              {opt.label}
              {sortBy === opt.value && <Check size={14} className="ml-auto" />}
            </DropdownItem>
          ))}
        </>
      )}
    </Dropdown>
  );
}
