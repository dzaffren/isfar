import type { Words } from "../content/text";
import type { Point } from "../scene/mataf";
import { BARRIER, EXIT, GREEN, MASA, SAI_PARTS, SAI_SPOTS, laneLine, type SaiPart, type SaiSpot } from "../scene/masa";

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

// The map reaches past the exit behind Marwah, and keeps the strip three times as wide as it is high.
const HALF_X = MASA.length / 2 + EXIT.depth + 2;
const HALF_Y = HALF_X / 3;
const ARROWS = [-40, -20, 0, 20, 40];

const percent = ([x, y]: Point) => ({ left: `${((x + HALF_X) / (2 * HALF_X)) * 100}%`, top: `${((y + HALF_Y) / (2 * HALF_Y)) * 100}%` });
// The plan has y to the left of a person who faces Marwah, and the map has y down, so plan points flip to sit as seen from above.
const flip = ([x, y]: Point): Point => [x, -y];

type Props = { step: number; words: Words; label: string; showNames?: boolean; spots?: SaiSpot[] };

// The top view of the mas'a, for a device that cannot show the 3D place. Safa is on the left, Marwah on the right.
// The lane to Marwah is the lower lane, and the lane to Safa the upper one. Tahallul passes its own spots.
export function MasaMap({ step, words, label, showNames = true, spots = SAI_SPOTS }: Props) {
  const spot = spots[step - 1];
  const names = showNames ? spot.names : [];
  const half = MASA.width / 2;
  const turn = spot.towards === "safa" ? 180 : 0;
  const path = spot.towards && laneLine(spot.towards).map(flip);
  return (
    <div className="map map--masa" data-still role="img" aria-label={label}>
      <svg className="map__plan" viewBox={`${-HALF_X} ${-HALF_Y} ${2 * HALF_X} ${2 * HALF_Y}`} aria-hidden="true">
        <rect className="map__hall" x={-MASA.length / 2} y={-half} width={MASA.length} height={MASA.width} />
        <path className="map__hill" d={`M${-MASA.length / 2} ${-half}A${MASA.safa.radius} ${half} 0 0 1 ${-MASA.length / 2} ${half}Z`} />
        <rect className="map__hall" x={MASA.length / 2} y={-EXIT.width / 2} width={EXIT.depth} height={EXIT.width} />
        <path className="map__hill" d={`M${MASA.length / 2} ${-half}A${MASA.marwah.radius} ${half} 0 0 0 ${MASA.length / 2} ${half}Z`} />
        <line className="map__bay" x1={MASA.length / 2} y1={-EXIT.width / 2} x2={MASA.length / 2} y2={EXIT.width / 2} />
        {GREEN.map((x) => (
          <rect key={x} className="map__lamp" x={x - MASA.green.depth / 2} y={-half} width={MASA.green.depth} height={MASA.width} />
        ))}
        <line className="map__barrier" x1={BARRIER.from} y1="0" x2={BARRIER.to} y2="0" />
        {path && (
          <>
            <polyline className="map__path" data-path points={path.map((point) => point.join(" ")).join(" ")} />
            {ARROWS.map((x) => (
              <path key={x} className="map__arrow" d="M-1.6 -1.4L1.6 0L-1.6 1.4Z" transform={`translate(${x} ${path[1][1]}) rotate(${turn})`} />
            ))}
          </>
        )}
        {names.map((part) => {
          const [fromX, fromY] = SAI_PARTS[part];
          const [toX, toY] = NAME_AT[part];
          return <line key={part} className="map__lead" x1={fromX} y1={fromY} x2={toX} y2={toY} />;
        })}
        {spot.at && <circle className="map__marker" data-marker cx={spot.at[0]} cy={-spot.at[1]} r="2.2" />}
      </svg>
      {names.map((part) => (
        <span key={part} className="scene__name" style={percent(NAME_AT[part])}>
          {words[SAI_PART_WORD[part]]}
        </span>
      ))}
    </div>
  );
}
