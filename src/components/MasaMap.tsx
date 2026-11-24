import type { Words } from "../content/text";
import type { Point } from "../scene/mataf";
import { GREEN, MASA, SAI_PARTS, SAI_SPOTS, WALK, type SaiPart } from "../scene/masa";

export const SAI_PART_WORD: Record<SaiPart, keyof Words> = {
  safa: "partSafa",
  marwah: "partMarwah",
  green: "partGreenLight",
};

// The names sit above and below the mas'a, clear of the path line.
const NAME_AT: Record<SaiPart, Point> = {
  safa: [-42, -17],
  marwah: [41, -17],
  green: [-20, 17],
};

const HALF_X = MASA.length / 2 + 6;
const HALF_Y = 22;
const ARROWS = [-40, -20, 0, 20, 40];

const percent = ([x, y]: Point) => ({ left: `${((x + HALF_X) / (2 * HALF_X)) * 100}%`, top: `${((y + HALF_Y) / (2 * HALF_Y)) * 100}%` });

type Props = { step: number; words: Words; label: string };

// The top view of the mas'a, for a device that cannot show the 3D place. Safa is on the left, Marwah on the right.
export function MasaMap({ step, words, label }: Props) {
  const spot = SAI_SPOTS[step - 1];
  const half = MASA.width / 2;
  const turn = spot.towards === "safa" ? 180 : 0;
  return (
    <div className="map map--masa" data-still role="img" aria-label={label}>
      <svg className="map__plan" viewBox={`${-HALF_X} ${-HALF_Y} ${2 * HALF_X} ${2 * HALF_Y}`} aria-hidden="true">
        <rect className="map__hall" x={-MASA.length / 2} y={-half} width={MASA.length} height={MASA.width} />
        <path className="map__hill" d={`M${-MASA.length / 2} ${-half}A${MASA.safa.radius} ${half} 0 0 1 ${-MASA.length / 2} ${half}Z`} />
        <path className="map__hill" d={`M${MASA.length / 2} ${-half}A${MASA.marwah.radius} ${half} 0 0 0 ${MASA.length / 2} ${half}Z`} />
        {GREEN.map((x) => (
          <rect key={x} className="map__lamp" x={x - MASA.green.depth / 2} y={-half} width={MASA.green.depth} height={MASA.width} />
        ))}
        {spot.towards && (
          <>
            <line className="map__path" x1={WALK.from} y1="0" x2={WALK.to} y2="0" />
            {ARROWS.map((x) => (
              <path key={x} className="map__arrow" d="M-1.6 -1.4L1.6 0L-1.6 1.4Z" transform={`translate(${x} 0) rotate(${turn})`} />
            ))}
          </>
        )}
        {spot.names.map((part) => {
          const [fromX, fromY] = SAI_PARTS[part];
          const [toX, toY] = NAME_AT[part];
          return <line key={part} className="map__lead" x1={fromX} y1={fromY} x2={toX} y2={toY} />;
        })}
        {spot.at && <circle className="map__marker" data-marker cx={spot.at[0]} cy={spot.at[1]} r="2.2" />}
      </svg>
      {spot.names.map((part) => (
        <span key={part} className="scene__name" style={percent(NAME_AT[part])}>
          {words[SAI_PART_WORD[part]]}
        </span>
      ))}
    </div>
  );
}
