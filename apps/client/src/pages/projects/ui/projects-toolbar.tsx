import type { ChangeEvent } from 'react';
import { Input } from '@/shared/ui/input';

export type SortOrder = 'recent' | 'oldest' | 'alpha';

type ProjectsToolbarProps = {
  query: string;
  onQueryChange: (value: string) => void;
  sort: SortOrder;
  onSortChange: (value: SortOrder) => void;
};

const SORT_OPTIONS: { value: SortOrder; label: string }[] = [
  { value: 'recent', label: 'Recently edited' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'alpha', label: 'Name A-Z' },
];

const isSortOrder = (value: string): value is SortOrder =>
  value === 'recent' || value === 'oldest' || value === 'alpha';

const ProjectsToolbar = ({ query, onQueryChange, sort, onSortChange }: ProjectsToolbarProps) => (
  <div className="mb-6 flex flex-wrap items-center gap-3">
    <Input
      type="search"
      placeholder="Search projects"
      value={query}
      onChange={(e: ChangeEvent<HTMLInputElement>) => onQueryChange(e.target.value)}
      className="max-w-[280px] flex-1"
    />
    <select
      value={sort}
      onChange={(e) => {
        const next = e.target.value;
        if (isSortOrder(next)) onSortChange(next);
      }}
      className="border border-hairline-strong bg-background px-2 py-1.5 font-mono text-[11px] text-foreground outline-none focus:border-foreground"
    >
      {SORT_OPTIONS.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  </div>
);

export { ProjectsToolbar };
