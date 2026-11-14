'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import Link from 'next/link';

import { GraphLinkType, GraphNode, GraphNodeType, PostGraph as PostGraphData } from '@/config/types';
import { cn } from '@/lib/utils';
import {
  ArrowRight,
  CalendarDays,
  ChevronRight,
  Maximize2,
  Minus,
  Plus,
  Search,
  X,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import ForceGraph2D, { ForceGraphMethods } from 'react-force-graph-2d';

// 시뮬레이션이 좌표(x, y)와 속도(vx, vy)를 노드 객체에 직접 써 넣는다.
type SimNode = GraphNode & { x?: number; y?: number; vx?: number; vy?: number };
type SimLink = { source: string | SimNode; target: string | SimNode; type: GraphLinkType };

// 블로그의 색 체계를 그대로 쓴다 : 카테고리는 포스트 카드와 같은 분홍, 글은 무채색.
// 상위 카테고리는 점이 아니라, 속한 점들을 감싸는 무채색 영역과 그 위의 이름으로 나타낸다.
const PALETTE = {
  light: {
    post: '#4b5563',
    category: '#db2777',
    region: 'rgba(17, 24, 39, 0.04)',
    regionEdge: 'rgba(17, 24, 39, 0.18)',
    edgeLink: 'rgba(17, 24, 39, 0.28)',
    text: '#111827',
    surface: '#ffffff',
    edge: 'rgba(17, 24, 39, 0.14)',
    edgeStrong: 'rgba(17, 24, 39, 0.6)',
  },
  dark: {
    post: '#c5cec9',
    category: '#ec4899',
    region: 'rgba(232, 237, 233, 0.05)',
    regionEdge: 'rgba(232, 237, 233, 0.22)',
    edgeLink: 'rgba(232, 237, 233, 0.3)',
    text: '#e8ede9',
    surface: '#2d3933',
    edge: 'rgba(232, 237, 233, 0.16)',
    edgeStrong: 'rgba(232, 237, 233, 0.7)',
  },
};

const DIMMED_ALPHA = 0.12;
const REGION_PADDING = 30; // 영역의 가장자리와 가장 바깥 점 사이의 여백
const REGION_GAP = 22; // 영역과 영역 사이에 두는 간격. 테두리에 걸친 이름표가 들어갈 자리다
const MAX_LABEL_LENGTH = 20;
const POST_LABEL_ZOOM = 1.7; // 이 배율 이상으로 확대하면 글 제목을 표시한다
const FIT_MARGIN = 28; // 전체 보기에서 가장자리에 남기는 여백
const MAX_FOCUS_ZOOM = 2.2; // 점을 골랐을 때 이보다 크게 확대하지는 않는다
const FOCUS_MARGIN = 80; // 고른 점들 둘레에 남기는 여백. 이름표가 들어갈 자리다
const PANEL_HEIGHT_RATIO = 0.42; // 아래에 뜨는 정보 패널의 최대 높이. aside의 max-h-[42%]와 같아야 한다
const PANEL_WIDTH = 300; // 아래 aside의 w-[300px]와 같아야 한다
const WIDE_CANVAS_WIDTH = 900; // 이보다 넓으면 정보 패널이 오른쪽에, 좁으면 아래에 뜬다

const nodeIdOf = (end: string | SimNode) => (typeof end === 'string' ? end : end.id);

const EMPTY_DATA: { nodes: SimNode[]; links: SimLink[] } = { nodes: [], links: [] };

type Region = { id: string; x: number; y: number; radius: number; members: SimNode[] };

// 상위 카테고리별로 속한 점들을 감싸는 원을 구한다.
const regionsOf = (nodes: SimNode[]): Region[] => {
  const byGroup = new Map<string, SimNode[]>();
  nodes.forEach((node) => {
    if (!node.group || node.x === undefined || node.y === undefined) return;
    byGroup.set(node.group, [...(byGroup.get(node.group) ?? []), node]);
  });
  return Array.from(byGroup, ([id, members]) => {
    const x = members.reduce((sum, node) => sum + node.x!, 0) / members.length;
    const y = members.reduce((sum, node) => sum + node.y!, 0) / members.length;
    const radius = Math.max(...members.map((node) => Math.hypot(node.x! - x, node.y! - y))) + REGION_PADDING;
    return { id, x, y, radius, members };
  });
};

interface Props {
  graph: PostGraphData;
  focusId?: string; // 열릴 때 선택해 둘 점. 글 본문에서는 읽고 있는 글이다
  isActive: boolean; // 화면에 보이는 중인지
  className?: string;
}

const PostGraph = ({ graph, focusId: initialFocusId, isActive, className }: Props) => {
  const { resolvedTheme } = useTheme();
  const colors = resolvedTheme === 'dark' ? PALETTE.dark : PALETTE.light;

  const containerRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<ForceGraphMethods<SimNode, SimLink>>();
  const hasFitted = useRef(false);

  const [size, setSize] = useState({ width: 0, height: 0 });
  const [showCategory, setShowCategory] = useState(true);
  const [hovered, setHovered] = useState<SimNode | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  // 힘 설정이 끝난 뒤에 데이터를 넘겨야, 처음 그리기 전에 배치 계산을 모두 마칠 수 있다.
  const [isForceReady, setIsForceReady] = useState(false);
  // 배치와 화면 맞춤이 끝난 뒤에야 그래프를 보여 준다. 움직이는 과정은 보이지 않는다.
  const [isSettled, setIsSettled] = useState(false);

  // 노드 객체는 한 번만 만들어 재사용한다. 표시 옵션을 바꿔도 이미 잡힌 위치가 유지된다.
  const allNodes = useMemo<SimNode[]>(() => graph.nodes.map((node) => ({ ...node })), [graph]);
  const nodeOf = useMemo(() => new Map(allNodes.map((node) => [node.id, node])), [allNodes]);
  const groupLabelOf = useMemo(
    () => new Map(graph.groups.map((group) => [group.id, group.label])),
    [graph]
  );

  const isTypeVisible = useCallback(
    (type: GraphNodeType | GraphLinkType) => type === 'post' || type === 'link' || showCategory,
    [showCategory]
  );

  const visibleLinks = useMemo(
    () => graph.links.filter((link) => isTypeVisible(link.type)),
    [graph, isTypeVisible]
  );

  // 숨긴 카테고리도 배치 계산에는 계속 넣는다. 화면에만 그리지 않으므로,
  // 켜고 끌 때 글들이 흩어지지 않고 같은 카테고리끼리 모인 자리를 유지한다.
  const data = useMemo(
    () => ({ nodes: allNodes, links: graph.links.map((link): SimLink => ({ ...link })) }),
    [allNodes, graph]
  );
  const visibleNodes = useMemo(
    () => allNodes.filter((node) => isTypeVisible(node.type)),
    [allNodes, isTypeVisible]
  );

  // 화면에 보이는 선 기준의 이웃. 강조와 이름표 표시에 쓴다.
  const neighbors = useMemo(() => {
    const map = new Map<string, Set<string>>();
    const add = (from: string, to: string) => {
      if (!map.has(from)) map.set(from, new Set());
      map.get(from)!.add(to);
    };
    visibleLinks.forEach((link) => {
      add(link.source, link.target);
      add(link.target, link.source);
    });
    return map;
  }, [visibleLinks]);

  // 점의 크기 : 글은 다른 글과 링크로 많이 이어질수록, 카테고리는 속한 글이 많을수록 크다.
  const radiusOf = useMemo(() => {
    const count = new Map<string, number>();
    const add = (id: string) => count.set(id, (count.get(id) ?? 0) + 1);
    graph.links.forEach((link) => {
      if (link.type === 'link') {
        add(link.source);
        add(link.target);
      } else {
        add(link.target);
      }
    });
    return (node: GraphNode) => {
      const n = count.get(node.id) ?? 0;
      if (node.type === 'post') return 5 + Math.min(n, 4) * 1.2;
      return 8.5 + Math.min(n, 8) * 0.55;
    };
  }, [graph]);

  const matched = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return null;
    return new Set(
      visibleNodes
        .filter((node) => node.label.toLowerCase().includes(keyword))
        .map((node) => node.id)
    );
  }, [visibleNodes, query]);

  // 강조의 기준 : 마우스를 올린 점 > 선택한 점 > 검색어
  const focusId = hovered?.id ?? selectedId;
  const isHighlighted = useCallback(
    (id: string) => {
      if (focusId) return id === focusId || !!neighbors.get(focusId)?.has(id);
      return matched ? matched.has(id) : true;
    },
    [focusId, neighbors, matched]
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const observer = new ResizeObserver(([entry]) => {
      setSize({ width: entry.contentRect.width, height: entry.contentRect.height });
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  const isReady = size.width > 0;
  const isWide = size.width >= WIDE_CANVAS_WIDTH;
  // 화면 비율. 조금 달라질 때마다 배치를 다시 잡지 않도록 0.25 단위로 끊는다.
  const aspect = isReady
    ? Math.min(2.5, Math.max(0.5, Math.round((size.width / size.height) * 4) / 4))
    : 1;
  useEffect(() => {
    const fg = graphRef.current;
    if (!fg) return;
    fg.d3Force('charge')?.strength(-150).distanceMax(240);
    fg.d3Force('link')
      ?.distance((link: SimLink) => (link.type === 'link' ? 72 : 44))
      // 글 사이의 링크는 서로 다른 영역을 잇는 경우가 많다. 약하게 당겨 영역이 뒤엉키지 않게 한다.
      .strength((link: SimLink) => (link.type === 'link' ? 0.02 : 0.6));

    // 모든 점을 가운데로 약하게 당기되, 화면의 짧은 쪽 방향을 더 세게 당겨 화면 비율에 맞게 퍼지게 한다.
    const pullX = 0.05 / aspect;
    const pullY = 0.05 * aspect;
    let nodes: SimNode[] = [];
    const gravity = (alpha: number) => {
      nodes.forEach((node) => {
        node.vx = (node.vx ?? 0) - (node.x ?? 0) * pullX * alpha;
        node.vy = (node.vy ?? 0) - (node.y ?? 0) * pullY * alpha;
      });

      // 같은 상위 카테고리의 점은 한데 모으고, 서로 다른 영역은 겹치지 않게 밀어낸다.
      const regions = regionsOf(nodes);
      regions.forEach((region) => {
        region.members.forEach((node) => {
          node.vx = (node.vx ?? 0) + (region.x - node.x!) * 0.1 * alpha;
          node.vy = (node.vy ?? 0) + (region.y - node.y!) * 0.1 * alpha;
        });
      });
      regions.forEach((a, index) => {
        regions.slice(index + 1).forEach((b) => {
          const distance = Math.hypot(b.x - a.x, b.y - a.y) || 1;
          const overlap = a.radius + b.radius + REGION_GAP - distance;
          if (overlap <= 0) return;
          const pushX = ((b.x - a.x) / distance) * overlap * 0.9 * alpha;
          const pushY = ((b.y - a.y) / distance) * overlap * 0.9 * alpha;
          a.members.forEach((node) => {
            node.vx = (node.vx ?? 0) - pushX;
            node.vy = (node.vy ?? 0) - pushY;
          });
          b.members.forEach((node) => {
            node.vx = (node.vx ?? 0) + pushX;
            node.vy = (node.vy ?? 0) + pushY;
          });
        });
      });
    };
    gravity.initialize = (initialNodes: SimNode[]) => {
      nodes = initialNodes;
    };
    fg.d3Force('gravity', gravity as never);
    setIsForceReady(true);
  }, [isReady, aspect]);

  const select = useCallback(
    (id: string | null, duration = 500) => {
      setSelectedId(id);
      const node = id ? nodeOf.get(id) : undefined;
      if (!node) return;
      if (node.type === 'category') setShowCategory(true);
      const fg = graphRef.current;
      if (!fg || node.x === undefined || node.y === undefined) return;
      // 고른 점과 이어진 점들이 정보 패널에 가려지지 않는 영역에 모두 들어오도록 옮기고 확대한다.
      // 패널은 넓은 화면에서 오른쪽, 좁은 화면에서 아래에 뜬다.
      const shown = [node, ...Array.from(neighbors.get(node.id) ?? [], (other) => nodeOf.get(other))]
        .filter((item): item is SimNode => item?.x !== undefined && item?.y !== undefined);
      const xs = shown.map((item) => item.x!);
      const ys = shown.map((item) => item.y!);
      const [left, right, top, bottom] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
      const freeWidth = size.width - (isWide ? PANEL_WIDTH : 0) - FOCUS_MARGIN * 2;
      const freeHeight = size.height * (isWide ? 1 : 1 - PANEL_HEIGHT_RATIO) - FOCUS_MARGIN * 2;
      const zoom = Math.min(
        MAX_FOCUS_ZOOM,
        freeWidth / Math.max(right - left, 1),
        freeHeight / Math.max(bottom - top, 1)
      );
      const shiftX = isWide ? PANEL_WIDTH / 2 / zoom : 0;
      const shiftY = isWide ? 0 : (size.height * PANEL_HEIGHT_RATIO) / 2 / zoom;
      fg.centerAt((left + right) / 2 + shiftX, (top + bottom) / 2 + shiftY, duration);
      fg.zoom(zoom, duration);
    },
    [nodeOf, neighbors, size, isWide]
  );

  // 열릴 때마다 읽고 있는 글을 선택해 보여 준다. 처음 열 때는 배치가 끝난 뒤(onEngineStop)에 처리한다.
  useEffect(() => {
    if (isActive && initialFocusId && hasFitted.current) select(initialFocusId);
    // 다시 열렸을 때만 실행한다. select가 바뀔 때마다 선택을 되돌리면 안 된다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive, initialFocusId]);

  const drawNode = useCallback(
    (node: SimNode, ctx: CanvasRenderingContext2D, globalScale: number) => {
      if (node.x === undefined || node.y === undefined || !isTypeVisible(node.type)) return;
      const radius = radiusOf(node);

      ctx.globalAlpha = isHighlighted(node.id) ? 1 : DIMMED_ALPHA;

      // 겹친 점이 구분되도록 배경색 테두리를 두른다.
      ctx.beginPath();
      ctx.arc(node.x, node.y, radius + 1.5 / globalScale, 0, 2 * Math.PI);
      ctx.fillStyle = colors.surface;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI);
      ctx.fillStyle = colors[node.type];
      ctx.fill();

      if (node.id === selectedId) {
        ctx.beginPath();
        ctx.arc(node.x, node.y, radius + 3.5 / globalScale, 0, 2 * Math.PI);
        ctx.lineWidth = 1.5 / globalScale;
        ctx.strokeStyle = colors.text;
        ctx.stroke();
      }

      ctx.globalAlpha = 1;
    },
    [colors, isHighlighted, isTypeVisible, radiusOf, selectedId]
  );

  // 상위 카테고리에 속한 점들을 옅은 원으로 감싸, 흩어진 묶음이 한 덩어리로 읽히게 한다.
  const drawRegions = useCallback(
    (ctx: CanvasRenderingContext2D, globalScale: number) => {
      if (!showCategory) return;
      regionsOf(allNodes).forEach((region) => {
        const isDimmed = !!focusId && !region.members.some((node) => isHighlighted(node.id));
        ctx.globalAlpha = isDimmed ? 0.3 : 1;
        ctx.beginPath();
        ctx.arc(region.x, region.y, region.radius, 0, 2 * Math.PI);
        ctx.fillStyle = colors.region;
        ctx.fill();
        ctx.lineWidth = 1 / globalScale;
        ctx.strokeStyle = colors.regionEdge;
        ctx.stroke();

        ctx.globalAlpha = 1;
      });
    },
    [allNodes, colors, focusId, isHighlighted, showCategory]
  );

  // 이름표는 모든 점을 그린 뒤 한꺼번에 그린다. 중요한 것부터 자리를 잡고,
  // 이미 그려진 이름표나 다른 점과 겹치는 이름표는 건너뛰어 글자가 겹치지 않게 한다.
  const drawLabels = useCallback(
    (ctx: CanvasRenderingContext2D, globalScale: number) => {
      type Box = { left: number; top: number; right: number; bottom: number; owner?: string };
      const overlaps = (a: Box, b: Box) =>
        a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;

      const placed = visibleNodes.filter((node) => node.x !== undefined && node.y !== undefined);
      // 강조 중인 점 > 카테고리와 태그 > 큰 글(연결이 많은 글) 순으로 자리를 준다.
      const rankOf = (node: SimNode) =>
        node.id === focusId ? 0 : node.type === 'post' ? 100 - radiusOf(node) : 1;
      // 글 제목은 평소에는 숨긴다. 점을 고르거나 검색하거나 확대했을 때만 보여 화면을 단순하게 유지한다.
      const showsPostLabels = !!focusId || !!matched || globalScale >= POST_LABEL_ZOOM;
      const candidates = placed
        .filter((node) => isHighlighted(node.id) && (node.type !== 'post' || showsPostLabels))
        .sort((a, b) => rankOf(a) - rankOf(b));

      // 점 자체도 이름표가 피해야 할 자리다. 강조 중일 때 흐려진 점은 가려도 되므로 뺀다.
      const taken: Box[] = placed
        .filter((node) => isHighlighted(node.id))
        .map((node) => {
        const r = radiusOf(node);
        return {
          left: node.x! - r,
          top: node.y! - r,
          right: node.x! + r,
          bottom: node.y! + r,
          owner: node.id,
        };
      });

      // 상위 카테고리의 이름은 영역 위쪽 테두리에 걸친 이름표로 그린다. 선과 점 위에 놓여 가려지지 않는다.
      if (showCategory) {
        const fontSize = 13 / globalScale;
        const paddingX = 9 / globalScale;
        const height = fontSize + 9 / globalScale;
        ctx.font = `700 ${fontSize}px Pretendard, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        regionsOf(allNodes).forEach((region) => {
          const label = groupLabelOf.get(region.id);
          if (!label) return;
          const halfWidth = ctx.measureText(label).width / 2 + paddingX;
          const centerY = region.y - region.radius;
          const isDimmed = !!focusId && !region.members.some((node) => isHighlighted(node.id));

          ctx.globalAlpha = isDimmed ? 0.3 : 1;
          ctx.beginPath();
          ctx.roundRect(region.x - halfWidth, centerY - height / 2, halfWidth * 2, height, height / 2);
          ctx.fillStyle = colors.text;
          ctx.fill();
          ctx.fillStyle = colors.surface;
          ctx.fillText(label, region.x, centerY + 0.5 / globalScale);
          ctx.globalAlpha = 1;

          taken.push({
            left: region.x - halfWidth,
            top: centerY - height / 2,
            right: region.x + halfWidth,
            bottom: centerY + height / 2,
          });
        });
      }

      const gap = 3 / globalScale;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.lineJoin = 'round';
      ctx.lineWidth = 3 / globalScale;

      candidates.forEach((node) => {
        const isFocus = node.id === focusId;
        const label =
          isFocus || node.label.length <= MAX_LABEL_LENGTH
            ? node.label
            : `${node.label.slice(0, MAX_LABEL_LENGTH)}…`;
        const fontSize = (node.type === 'post' ? 12.5 : 13.5) / globalScale;
        ctx.font = `${node.type === 'post' && !isFocus ? 500 : 700} ${fontSize}px Pretendard, sans-serif`;

        const halfWidth = ctx.measureText(label).width / 2 + gap;
        const height = fontSize * 1.25;
        const radius = radiusOf(node);
        // 점 아래에 먼저 놓아 보고, 자리가 없으면 점 위에 놓는다.
        const tops = [node.y! + radius + gap, node.y! - radius - gap - height];
        const boxes = tops.map((top) => ({
          left: node.x! - halfWidth,
          top,
          right: node.x! + halfWidth,
          bottom: top + height,
        }));
        const isFree = (box: Box) =>
          taken.every((other) => other.owner === node.id || !overlaps(box, other));
        // 강조 중인 점과 카테고리의 이름은 자리가 없어도 반드시 표시한다.
        const box = boxes.find(isFree) ?? (isFocus || node.type === 'category' ? boxes[0] : undefined);
        if (!box) return;
        taken.push(box);

        // 선 위에서도 읽히도록 글자 뒤에 배경색 외곽선을 깐다.
        ctx.strokeStyle = colors.surface;
        ctx.strokeText(label, node.x!, box.top);
        ctx.fillStyle = colors.text;
        ctx.fillText(label, node.x!, box.top);
      });
    },
    [allNodes, groupLabelOf, colors, visibleNodes, focusId, matched, isHighlighted, radiusOf, showCategory]
  );

  // 실제 점보다 넓은 영역에서 마우스와 터치를 인식하도록 한다.
  const paintPointerArea = useCallback(
    (node: SimNode, color: string, ctx: CanvasRenderingContext2D) => {
      if (node.x === undefined || node.y === undefined || !isTypeVisible(node.type)) return;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(node.x, node.y, radiusOf(node) + 5, 0, 2 * Math.PI);
      ctx.fill();
    },
    [radiusOf, isTypeVisible]
  );

  const isLinkHighlighted = useCallback(
    (link: SimLink) => {
      const source = nodeIdOf(link.source);
      const target = nodeIdOf(link.target);
      if (focusId) return source === focusId || target === focusId;
      return matched ? matched.has(source) && matched.has(target) : true;
    },
    [focusId, matched]
  );

  // 가장자리의 이름표가 잘리지 않도록 여백을 두고 전체가 보이게 맞춘다.
  // 전체가 화면에 꽉 차게 맞춘다. 점뿐 아니라 영역의 원과 위쪽 이름표까지 들어오도록 직접 계산한다.
  const fitView = (duration = 400) => {
    const fg = graphRef.current;
    const placed = visibleNodes.filter((node) => node.x !== undefined && node.y !== undefined);
    if (!fg || placed.length === 0) return;
    const boxes = showCategory
      ? regionsOf(allNodes).map((region) => ({
          left: region.x - region.radius,
          right: region.x + region.radius,
          top: region.y - region.radius,
          bottom: region.y + region.radius,
        }))
      : placed.map((node) => ({ left: node.x!, right: node.x!, top: node.y!, bottom: node.y! }));
    const left = Math.min(...boxes.map((box) => box.left));
    const right = Math.max(...boxes.map((box) => box.right));
    const top = Math.min(...boxes.map((box) => box.top));
    const bottom = Math.max(...boxes.map((box) => box.bottom));
    const zoom = Math.min(
      (size.width - FIT_MARGIN * 2) / Math.max(right - left, 1),
      (size.height - FIT_MARGIN * 2) / Math.max(bottom - top, 1)
    );
    fg.centerAt((left + right) / 2, (top + bottom) / 2, duration);
    fg.zoom(zoom, duration);
  };

  const zoomBy = (ratio: number) => {
    const fg = graphRef.current;
    if (fg) fg.zoom(fg.zoom() * ratio, 250);
  };

  const selected = selectedId ? nodeOf.get(selectedId) : undefined;

  // 선택한 점과 이어진 점. 글이면 링크 방향별로, 카테고리와 태그면 속한 글 전체다.
  const linkedNodes = (type: GraphLinkType, from: 'source' | 'target') => {
    const to = from === 'source' ? 'target' : 'source';
    return graph.links
      .filter((link) => link.type === type && link[from] === selectedId)
      .map((link) => nodeOf.get(link[to]))
      .filter((node): node is SimNode => !!node);
  };

  const controlClass =
    'flex size-8 items-center justify-center text-muted-foreground transition-colors hover:bg-muted hover:text-foreground';

  const renderNodeList = (title: string, nodes: SimNode[]) =>
    nodes.length > 0 && (
      <div className='mt-4 border-t pt-3 dark:border-slate-700'>
        <h3 className='flex items-center gap-1.5 text-[13px] font-bold'>
          {title}
          <span className='font-medium text-muted-foreground'>{nodes.length}</span>
        </h3>
        <ul className='-mx-2 mt-1'>
          {nodes.map((node) => (
            <li key={node.id}>
              <button
                type='button'
                onClick={() => select(node.id)}
                className='group flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-[13px] font-medium leading-snug transition-colors hover:bg-muted'
              >
                <span className='min-w-0 flex-1'>{node.label}</span>
                <ChevronRight className='size-3.5 shrink-0 text-muted-foreground opacity-40 transition-opacity group-hover:opacity-100' />
              </button>
            </li>
          ))}
        </ul>
      </div>
    );

  const readButtonClass =
    'mt-3 flex h-8 items-center justify-center gap-1 rounded-md bg-primary text-[13px] font-semibold text-primary-foreground transition-opacity hover:opacity-90';

  return (
    <div className={cn('flex flex-col bg-card', className)}>
      {/* 조작 도구. 오른쪽은 패널을 닫는 버튼 자리로 비워 둔다. */}
        <div className='flex flex-wrap items-center gap-2 border-b p-3 pr-14 dark:border-slate-700'>
          <label className='flex h-8 w-full items-center gap-2 rounded-md border bg-card px-2.5 dark:border-slate-700 sm:w-56'>
            <Search className='size-3.5 shrink-0 text-muted-foreground' />
            <input
              value={query}
              onChange={(e) => {
                // 선택한 점이 있으면 검색 결과가 가려지므로 선택을 푼다.
                setSelectedId(null);
                setQuery(e.target.value);
              }}
              onKeyDown={(e) => {
                const first = matched && visibleNodes.find((node) => matched.has(node.id));
                if (e.key === 'Enter' && first) select(first.id);
              }}
              placeholder='Filter posts...'
              aria-label='Filter posts'
              className='min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground'
            />
            {query && (
              <button type='button' aria-label='Clear filter' onClick={() => setQuery('')}>
                <X className='size-3.5 text-muted-foreground' />
              </button>
            )}
          </label>

          <div className='flex overflow-hidden rounded-md border bg-card dark:border-slate-700'>
            <button type='button' aria-label='Zoom in' onClick={() => zoomBy(1.4)} className={controlClass}>
              <Plus className='size-4' />
            </button>
            <button
              type='button'
              aria-label='Zoom out'
              onClick={() => zoomBy(1 / 1.4)}
              className={cn(controlClass, 'border-x dark:border-slate-700')}
            >
              <Minus className='size-4' />
            </button>
            <button
            type='button'
            aria-label='Fit to screen'
            onClick={() => fitView()}
            className={controlClass}
          >
              <Maximize2 className='size-3.5' />
            </button>
          </div>

          {/* 켜짐/꺼짐이 한눈에 보이도록 스위치로 표시한다. */}
          <button
            type='button'
            role='switch'
            aria-checked={showCategory}
            onClick={() => setShowCategory(!showCategory)}
            className='flex h-8 items-center gap-2 rounded-md border bg-card pl-2.5 pr-2 text-xs font-medium transition-colors hover:bg-muted dark:border-slate-700'
          >
            카테고리
            <span
              className={cn(
                'relative h-[18px] w-8 rounded-full transition-colors',
                showCategory ? 'bg-pink-600 dark:bg-pink-500' : 'bg-muted-foreground/40'
              )}
            >
              <span
                className={cn(
                  'absolute left-0.5 top-0.5 size-3.5 rounded-full bg-white shadow transition-transform',
                  showCategory && 'translate-x-3.5'
                )}
              />
            </span>
          </button>
        </div>

      <div ref={containerRef} className='relative min-h-0 flex-1 overflow-hidden'>
        {isReady && (
          <div className={cn('transition-opacity duration-200', !isSettled && 'opacity-0')}>
          <ForceGraph2D
            ref={graphRef}
            width={size.width}
            height={size.height}
            graphData={isForceReady ? data : EMPTY_DATA}
            backgroundColor='rgba(0,0,0,0)'
            nodeLabel={() => ''}
            nodeCanvasObject={drawNode}
            nodePointerAreaPaint={paintPointerArea}
            onRenderFramePre={drawRegions}
            onRenderFramePost={drawLabels}
            linkColor={(link: SimLink) => {
              if (!isLinkHighlighted(link)) return 'rgba(128, 128, 128, 0.05)';
              // 글 사이의 링크는 평소에는 옅게 두고, 점을 골랐을 때만 진하게 보여 준다.
              if (focusId) return colors.edgeStrong;
              return link.type === 'link' ? colors.edgeLink : colors.edge;
            }}
            linkWidth={(link: SimLink) => (link.type === 'link' ? 1 : 0.6)}
            linkDirectionalArrowLength={(link: SimLink) => (link.type === 'link' ? 3.5 : 0)}
            linkDirectionalArrowRelPos={1}
            linkVisibility={(link: SimLink) => isTypeVisible(link.type)}
            onNodeHover={(node: SimNode | null) => setHovered(node)}
            onNodeClick={(node: SimNode) => select(node.id)}
            onBackgroundClick={() => setSelectedId(null)}
            // 그리기 전에 배치 계산을 끝내고, 화면에서는 더 움직이지 않게 한다.
            warmupTicks={400}
            cooldownTicks={0}
            onEngineStop={() => {
              if (!isForceReady || hasFitted.current) return;
              hasFitted.current = true;
              if (initialFocusId) select(initialFocusId, 0);
              else fitView(0);
              setIsSettled(true);
            }}
          />
          </div>
        )}

        {selected && (
          <aside
            className={cn(
              'absolute overflow-y-auto rounded-md border bg-card p-4 shadow-xl dark:border-slate-700',
              isWide
                ? 'right-3 top-3 max-h-[calc(100%-24px)] w-[300px]'
                : 'inset-x-3 bottom-3 max-h-[42%]'
            )}
          >
            <button
              type='button'
              aria-label='Close'
              onClick={() => setSelectedId(null)}
              className='absolute right-2.5 top-2.5 rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground'
            >
              <X className='size-4' />
            </button>

            {selected.type === 'post' ? (
              <>
                <div className='text-xs font-semibold text-pink-600 dark:text-pink-400'>
                  {selected.sub}
                </div>
                <h2 className='mt-1 pr-6 text-base font-bold leading-snug'>{selected.label}</h2>
                <p className='mt-2 text-[13px] leading-relaxed text-muted-foreground'>{selected.desc}</p>
                <div className='mt-2.5 flex flex-wrap gap-x-2 gap-y-0.5'>
                  {selected.tags?.map((tag) => (
                    <span key={tag} className='text-xs font-medium text-sky-700 dark:text-sky-400'>
                      #{tag}
                    </span>
                  ))}
                </div>
                <div className='mt-2.5 flex items-center gap-1 text-xs text-muted-foreground'>
                  <CalendarDays className='w-3.5' />
                  {selected.dateString}
                </div>
                {/* 지금 읽고 있는 글에는 이동 버튼이 필요 없다. */}
                {selected.id !== initialFocusId && (
                  <Link href={selected.url} className={readButtonClass}>
                    글 읽기
                    <ArrowRight className='size-3.5' />
                  </Link>
                )}
                {renderNodeList('Links', linkedNodes('link', 'source'))}
                {renderNodeList('Backlinks', linkedNodes('link', 'target'))}
              </>
            ) : (
              <>
                <div className='text-xs font-semibold text-pink-600 dark:text-pink-400'>Category</div>
                <h2 className='mt-1 pr-6 text-base font-bold leading-snug'>{selected.label}</h2>
                <Link href={selected.url} className={readButtonClass}>
                  글 목록
                  <ArrowRight className='size-3.5' />
                </Link>
                {renderNodeList('Posts', linkedNodes('category', 'target'))}
              </>
            )}
          </aside>
        )}
      </div>
    </div>
  );
};

export default PostGraph;
