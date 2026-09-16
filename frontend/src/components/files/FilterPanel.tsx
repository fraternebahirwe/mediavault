import { useState } from "react";
import { Filter } from "lucide-react";
import { Dropdown } from "../ui/Dropdown";

export interface FileFilters {
  minSize?: number;
  maxSize?: number;
  fromDate?: string;
  toDate?: string;
}

interface FilterPanelProps {
  filters: FileFilters;
  onApply: (filters: FileFilters) => void;
}

export function FilterPanel({ filters, onApply }: FilterPanelProps) {
  const [draft, setDraft] = useState(filters);
  const activeCount = Object.values(filters).filter(Boolean).length;

  return (
    <Dropdown
      trigger={
        <button className="btn-secondary">
          <Filter size={16} />
          Filters {activeCount > 0 && `(${activeCount})`}
        </button>
      }
    >
      {(close) => (
        <div className="p-2 w-64 flex flex-col gap-3">
          <div>
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">File size (MB)</label>
            <div className="flex items-center gap-2 mt-1">
              <input
                type="number"
                min={0}
                placeholder="Min"
                className="input"
                value={draft.minSize ?? ""}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, minSize: e.target.value ? Number(e.target.value) * 1024 * 1024 : undefined }))
                }
              />
              <input
                type="number"
                min={0}
                placeholder="Max"
                className="input"
                value={draft.maxSize ?? ""}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, maxSize: e.target.value ? Number(e.target.value) * 1024 * 1024 : undefined }))
                }
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Upload date</label>
            <div className="flex items-center gap-2 mt-1">
              <input
                type="date"
                className="input"
                value={draft.fromDate ?? ""}
                onChange={(e) => setDraft((d) => ({ ...d, fromDate: e.target.value || undefined }))}
              />
              <input
                type="date"
                className="input"
                value={draft.toDate ?? ""}
                onChange={(e) => setDraft((d) => ({ ...d, toDate: e.target.value || undefined }))}
              />
            </div>
          </div>

          <div className="flex justify-between gap-2 pt-1">
            <button
              className="btn-ghost text-sm"
              onClick={() => {
                setDraft({});
                onApply({});
                close();
              }}
            >
              Clear
            </button>
            <button
              className="btn-primary text-sm"
              onClick={() => {
                onApply(draft);
                close();
              }}
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </Dropdown>
  );
}
