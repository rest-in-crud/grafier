import { useState } from 'react';
import type { ReactNode } from 'react';
import type { LayerNode, LayerType, IconProps } from '../types';
import {
  IFolder,
  ISquare,
  ICircle,
  ITextLayer,
  IStar,
  IChev,
  IEye,
  ILock,
  IPlus,
  ITrash,
} from '../icons';

const initialLayers: LayerNode[] = [
  {
    id: 'g1',
    name: 'Hero composition',
    type: 'group',
    open: true,
    visible: true,
    children: [
      { id: 'l1', name: 'Background fill', type: 'rect', visible: true },
      {
        id: 'g2',
        name: 'Logo lockup',
        type: 'group',
        open: true,
        children: [
          { id: 'l2', name: 'Mark · circle', type: 'circle', visible: true },
          { id: 'l3', name: 'GRAFIER', type: 'text', visible: true },
        ],
      },
      { id: 'l4', name: 'Tagline', type: 'text', visible: true },
    ],
  },
  {
    id: 'g3',
    name: 'Decorations',
    type: 'group',
    open: false,
    visible: true,
    children: [
      { id: 'l5', name: 'Polygon · 6', type: 'shape', visible: true },
      { id: 'l6', name: 'Anchor points', type: 'shape', visible: false, locked: true },
    ],
  },
  { id: 'l7', name: 'Reference grid', type: 'rect', visible: false, locked: true },
];

const LAYER_ICON: Record<LayerType, (p: IconProps) => ReactNode> = {
  group: IFolder,
  rect: ISquare,
  circle: ICircle,
  text: ITextLayer,
  shape: IStar,
};

type TreeRowProps = {
  node: LayerNode;
  depth: number;
  selected: string;
  setSelected: (id: string) => void;
  toggle: (id: string) => void;
};

function TreeRow({ node, depth, selected, setSelected, toggle }: TreeRowProps) {
  const Icon = LAYER_ICON[node.type] ?? ISquare;
  const hasKids = node.children !== undefined && node.children.length > 0;
  const isSelected = selected === node.id;
  const paddingLeft = 10 + depth * 14;

  return (
    <>
      <div
        className={[
          'group/row relative flex cursor-pointer select-none items-center gap-1.5 border-l-2 py-1.25 pr-3',
          isSelected
            ? 'border-l-foreground bg-white/8'
            : 'border-l-transparent hover:bg-field-hover',
        ].join(' ')}
        style={{ paddingLeft }}
        onClick={() => setSelected(node.id)}
      >
        <span
          className={[
            'flex h-3 w-3 shrink-0 items-center justify-center text-muted-foreground transition-transform duration-150',
            !hasKids ? 'opacity-0' : '',
            node.open ? 'rotate-90' : '',
          ]
            .filter(Boolean)
            .join(' ')}
          onClick={(e) => {
            e.stopPropagation();
            if (hasKids) toggle(node.id);
          }}
        >
          {hasKids && <IChev size={10} />}
        </span>
        <span
          className={[
            'flex shrink-0 items-center',
            isSelected ? 'text-foreground' : 'text-muted-foreground',
          ].join(' ')}
        >
          <Icon size={13} />
        </span>
        <span
          className={[
            'flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-xs',
            isSelected ? 'text-foreground' : 'text-foreground',
          ].join(' ')}
        >
          {node.name}
        </span>
        <span
          className={[
            'flex items-center gap-1 transition-opacity duration-100 group-hover/row:opacity-100',
            isSelected ? 'opacity-100' : 'opacity-0',
          ].join(' ')}
        >
          <button
            className="flex h-4.5 w-4.5 cursor-pointer items-center justify-center border border-transparent bg-transparent text-muted-foreground transition-all hover:border-hairline-strong hover:text-foreground"
            title="Visibility"
          >
            <IEye size={11} />
          </button>
          {node.locked && (
            <button className="flex h-4.5 w-4.5 cursor-pointer items-center justify-center border border-transparent bg-transparent text-muted-foreground transition-all hover:border-hairline-strong hover:text-foreground">
              <ILock size={11} />
            </button>
          )}
        </span>
      </div>
      {node.open &&
        hasKids &&
        node.children!.map((c) => (
          <TreeRow
            key={c.id}
            node={c}
            depth={depth + 1}
            selected={selected}
            setSelected={setSelected}
            toggle={toggle}
          />
        ))}
    </>
  );
}

export function LayersPanel({
  className,
  selected,
  setSelected,
}: {
  className?: string;
  selected: string;
  setSelected: (id: string) => void;
}) {
  const [tree, setTree] = useState(initialLayers);

  function toggle(id: string) {
    function walk(nodes: LayerNode[]): LayerNode[] {
      return nodes.map((n) =>
        n.id === id
          ? { ...n, open: !n.open }
          : n.children
            ? { ...n, children: walk(n.children) }
            : n,
      );
    }
    setTree(walk(tree));
  }

  return (
    <div className={['flex flex-col overflow-hidden', className].filter(Boolean).join(' ')}>
      <div className="font-mono flex items-center justify-between border-b border-hairline bg-background px-3 py-2 text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
        <span className="text-foreground">LAYERS</span>
        <span className="flex gap-1">
          <button
            className="flex h-5.5 w-5.5 cursor-pointer items-center justify-center border border-transparent bg-transparent text-muted-foreground transition-all hover:border-hairline-strong hover:text-foreground"
            title="New group"
          >
            <IFolder size={11} />
          </button>
          <button
            className="flex h-5.5 w-5.5 cursor-pointer items-center justify-center border border-transparent bg-transparent text-muted-foreground transition-all hover:border-hairline-strong hover:text-foreground"
            title="New layer"
          >
            <IPlus size={11} />
          </button>
          <button
            className="flex h-5.5 w-5.5 cursor-pointer items-center justify-center border border-transparent bg-transparent text-muted-foreground transition-all hover:border-hairline-strong hover:text-foreground"
            title="Delete"
          >
            <ITrash size={11} />
          </button>
        </span>
      </div>
      <div className="flex-1 overflow-y-auto py-1.5">
        <div className="text-xs">
          {tree.map((n) => (
            <TreeRow
              key={n.id}
              node={n}
              depth={0}
              selected={selected}
              setSelected={setSelected}
              toggle={toggle}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
