"use client";

import { useEffect, useRef, useState } from "react";
import { feature } from "topojson-client";
import type { GeometryCollection, Topology } from "topojson-specification";
import { geoGraticule10, geoNaturalEarth1, geoPath, type GeoPermissibleObjects } from "d3-geo";
import worldTopo from "world-atlas/countries-110m.json";
import { ISO_NUMERIC_TO_ALPHA2, COUNTRIES, type Country } from "@/lib/countries";
import { CONTINENT_META } from "@/lib/constants";

const W = 960;
const H = 500;
const MIN_K = 1;
const MAX_K = 14;

interface LandPiece {
  cca2: string | null;
  d: string;
  key: string;
}

interface Marker {
  cca2: string;
  x: number;
  y: number;
}

const topo = worldTopo as unknown as Topology;
const allFeatures = feature(
  topo,
  topo.objects.countries as unknown as GeometryCollection<null>,
).features;

const fitted = geoNaturalEarth1().fitSize(
  [W, H],
  { type: "FeatureCollection", features: allFeatures } as unknown as GeoPermissibleObjects,
);
const pathGen = geoPath(fitted);

const LAND: LandPiece[] = allFeatures.map((f, i) => {
  const id = String(f.id ?? "");
  return {
    cca2: ISO_NUMERIC_TO_ALPHA2[id] ?? null,
    d: pathGen(f as unknown as GeoPermissibleObjects) ?? "",
    key: id || `x-${i}`,
  };
});

const GRATICULE = pathGen(geoGraticule10() as unknown as GeoPermissibleObjects) ?? "";

const MARKERS: Marker[] = [];
for (const c of COUNTRIES) {
  if (c.hasPolygon) continue;
  const p = fitted([c.latlng[1], c.latlng[0]] as [number, number]);
  if (p) MARKERS.push({ cca2: c.cca2, x: p[0], y: p[1] });
}

const byCca2 = new Map<string, Country>();
for (const c of COUNTRIES) byCca2.set(c.cca2, c);

export interface FlashState {
  cca2: string;
  ok: boolean;
  token: number;
}

export function WorldMap({
  discovered,
  selected,
  findTarget,
  flash,
  onSelect,
}: {
  discovered: Set<string>;
  selected: string | null;
  findTarget: string | null;
  flash: FlashState | null;
  onSelect: (cca2: string) => void;
}) {
  const [tx, setTx] = useState(0);
  const [ty, setTy] = useState(0);
  const [k, setK] = useState(1);
  const [tooltip, setTooltip] = useState<{ cca2: string; x: number; y: number } | null>(null);
  const dragRef = useRef<{
    startX: number;
    startY: number;
    tx0: number;
    ty0: number;
    moved: boolean;
    active: boolean;
  } | null>(null);

  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey) return;
      e.preventDefault();
      const rect = svg.getBoundingClientRect();
      const ux = (e.clientX - rect.left) * (W / rect.width);
      const uy = (e.clientY - rect.top) * (H / rect.height);
      const factor = e.deltaY < 0 ? 1.18 : 1 / 1.18;
      setK((prev) => {
        const k2 = Math.min(MAX_K, Math.max(MIN_K, prev * factor));
        const ratio = k2 / prev;
        setTx((t) => ux - (ux - t) * ratio);
        setTy((t) => uy - (uy - t) * ratio);
        return k2;
      });
    };
    svg.addEventListener("wheel", onWheel, { passive: false });
    return () => svg.removeEventListener("wheel", onWheel);
  }, []);

  const onPointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      tx0: tx,
      ty0: ty,
      moved: false,
      active: true,
    };
  };

  const onPointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const drag = dragRef.current;
    const rect = e.currentTarget.getBoundingClientRect();
    if (drag?.active) {
      const dx = (e.clientX - drag.startX) * (W / rect.width);
      const dy = (e.clientY - drag.startY) * (H / rect.height);
      if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
        drag.moved = true;
        e.currentTarget.setPointerCapture(e.pointerId);
      }
      if (drag.moved) {
        setTx(drag.tx0 + dx);
        setTy(drag.ty0 + dy);
      }
      return;
    }
  };

  const onPointerUp = () => {
    if (dragRef.current) dragRef.current.active = false;
  };

  const zoom = (factor: number) => {
    setK((prev) => {
      const k2 = Math.min(MAX_K, Math.max(MIN_K, prev * factor));
      const ratio = k2 / prev;
      setTx((t) => W / 2 - (W / 2 - t) * ratio);
      setTy((t) => H / 2 - (H / 2 - t) * ratio);
      return k2;
    });
  };

  const resetView = () => {
    setK(1);
    setTx(0);
    setTy(0);
  };

  const inFindMode = findTarget !== null;

  const handleCountryPointer = (cca2: string, e: React.PointerEvent) => {
    if (inFindMode) {
      setTooltip(null);
      return;
    }
    const rect = (e.currentTarget as SVGElement).closest("svg")!.getBoundingClientRect();
    setTooltip({ cca2, x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleMarkerPointer = (cca2: string, e: React.PointerEvent) => {
    if (inFindMode) {
      setTooltip(null);
      return;
    }
    const rect = (e.currentTarget as SVGElement).closest("svg")!.getBoundingClientRect();
    setTooltip({ cca2, x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const country = (cca2: string) => byCca2.get(cca2);
  const tooltipC = tooltip ? country(tooltip.cca2) : null;

  const fillFor = (cca2: string | null): string => {
    if (!cca2) return "#16202c";
    const c = byCca2.get(cca2);
    const base = c ? CONTINENT_META[c.continent].hex : "#1c2733";
    if (discovered.has(cca2)) return base;
    return "#2a3a4d";
  };

  const strokeFor = (cca2: string): string => (
    selected === cca2 ? "#fcd34d" : "rgba(255,255,255,0.14)"
  );

  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-white/10 bg-[#08101c]">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className={`block w-full select-none ${findTarget ? "cursor-crosshair" : ""}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={() => {
          setTooltip(null);
          if (dragRef.current) dragRef.current.active = false;
        }}
        style={{ touchAction: "none" }}
      >
        <defs>
          <radialGradient id="ocean-glow" cx="50%" cy="42%" r="70%">
            <stop offset="0%" stopColor="#0b1626" />
            <stop offset="100%" stopColor="#060b14" />
          </radialGradient>
        </defs>
        <rect width={W} height={H} fill="url(#ocean-glow)" />

        <g transform={`translate(${tx},${ty}) scale(${k})`}>
          <rect width={W} height={H} fill="transparent" />
          <path d={GRATICULE} fill="none" stroke="rgba(120,160,220,0.10)" strokeWidth={0.6} />

          {LAND.map((piece) => {
            if (piece.cca2) return null;
            return (
              <path
                key={piece.key}
                d={piece.d}
                fill="#1b2735"
                stroke="rgba(255,255,255,0.06)"
                strokeWidth={0.5}
                pointerEvents="none"
              />
            );
          })}

          {LAND.map((piece) => {
            if (!piece.cca2) return null;
            const cca2 = piece.cca2;
            const isFlash = flash?.cca2 === cca2;
            return (
              <path
                key={piece.key}
                d={piece.d}
                fill={fillFor(cca2)}
                stroke={strokeFor(cca2)}
                strokeWidth={selected === cca2 ? 1.6 : 0.7}
                className={[
                  "atlas-country",
                  isFlash ? (flash.ok ? "anim-flash-ok" : "anim-flash-bad") : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                style={{ transition: "fill 0.25s ease, stroke 0.25s ease" }}
                onPointerEnter={(e) => handleCountryPointer(cca2, e)}
                onPointerMove={(e) => handleCountryPointer(cca2, e)}
                onPointerLeave={() => setTooltip(null)}
                onClick={() => {
                  if (!dragRef.current?.moved) onSelect(cca2);
                }}
              />
            );
          })}

          {MARKERS.map((m) => {
            const cca2 = m.cca2;
            const c = country(cca2);
            const r = discovered.has(cca2) ? 3.4 : 2.6;
            const isFlash = flash?.cca2 === cca2;
            return (
              <g
                key={m.cca2}
                transform={`translate(${m.x},${m.y})`}
                className={[
                  "atlas-marker",
                  isFlash ? (flash.ok ? "anim-flash-ok" : "anim-flash-bad") : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                style={{
                  fill: discovered.has(cca2) ? "#fcd34d" : "#d6e2f0",
                  cursor: "pointer",
                }}
                onPointerEnter={(e) => handleMarkerPointer(cca2, e)}
                onPointerMove={(e) => handleMarkerPointer(cca2, e)}
                onPointerLeave={() => setTooltip(null)}
                onClick={() => {
                  if (!dragRef.current?.moved) onSelect(cca2);
                }}
              >
                <circle r={r + 2.2} fill="transparent" stroke="rgba(255,255,255,0.25)" strokeWidth={0.6} />
                {!inFindMode && (c?.nameES ?? "").length < 14 && (
                  <text
                    y={r + 6}
                    textAnchor="middle"
                    fontSize={3.2}
                    fill="rgba(255,255,255,0.6)"
                    pointerEvents="none"
                  >
                    {c?.nameES}
                  </text>
                )}
                <circle r={r} />
</g>
          );
        })}
        </g>
      </svg>

      {tooltipC && tooltip && (
        <div
          className="pointer-events-none absolute z-30 flex items-center gap-2 rounded-lg border border-white/15 bg-[#0c1522]/95 px-2.5 py-1.5 text-xs shadow-xl backdrop-blur"
          style={{ left: tooltip.x, top: tooltip.y + 12, transform: "translate(-50%, 0)" }}
        >
          <img src={`/flags/${tooltipC.cca2.toLowerCase()}.svg`} alt="" className="h-4 w-6 rounded-[2px] object-cover" />
          <span className="font-semibold text-zinc-100">{tooltipC.nameES}</span>
        </div>
      )}

      <div className="absolute right-2 top-2 z-20 flex flex-col gap-1.5">
        <button onClick={() => zoom(1.4)} className="btn-press grid h-8 w-8 place-items-center rounded-lg border border-white/15 bg-white/5 text-sm font-bold text-white hover:bg-white/10" title="Acercar">
          +
        </button>
        <button onClick={() => zoom(1 / 1.4)} className="btn-press grid h-8 w-8 place-items-center rounded-lg border border-white/15 bg-white/5 text-sm font-bold text-white hover:bg-white/10" title="Alejar">
          −
        </button>
        <button onClick={resetView} className="btn-press grid h-8 w-8 place-items-center rounded-lg border border-white/15 bg-white/5 text-xs text-white hover:bg-white/10" title="Ver todo">
          ⟳
        </button>
      </div>
    </div>
  );
}