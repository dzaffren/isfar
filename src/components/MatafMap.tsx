import type { Words } from "../content/text";
import { DOOR, GREEN_LIGHT, HAJAR_ASWAD, HIJR, KAABAH, MAQAM, PARTS, RING, SPOTS, onPath, type Part, type Point } from "../scene/mataf";

export const PART_WORD: Record<Part, keyof Words> = {
  hajarAswad: "partHajarAswad",
  door: "partDoor",
  hijr: "partHijr",
  yamani: "partYamani",
  maqam: "partMaqam",
  greenLight: "partGreenLight",
};

// Where each name sits on the map, clear of the path, the guide line and the other names.
const NAME_AT: Record<Part, Point> = {
  hajarAswad: [4, 25],
  door: [-23.5, 7.5],
  hijr: [0, -25],
  yamani: [22, 16],
  maqam: [-22, -6],
  greenLight: [-23.5, 31],
};

const EDGE = RING + 4;
const ARROWS = [20, 80, 150, 210, 250, 290, 330];

// The map draws y down, and the plan has y up.
const flip = ([x, y]: Point): Point => [x, -y];
const percent = ([x, y]: Point) => ({ left: `${((x + EDGE) / (2 * EDGE)) * 100}%`, top: `${((EDGE - y) / (2 * EDGE)) * 100}%` });

function arrow(degrees: number): string {
  const [x, y] = flip(onPath(degrees));
  const [nextX, nextY] = flip(onPath(degrees + 1));
  const turn = (Math.atan2(nextY - y, nextX - x) * 180) / Math.PI;
  return `translate(${x} ${y}) rotate(${turn})`;
}

type Props = { step: number; words: Words; label: string; showNames?: boolean };

// The top view of the mataf, for a device that cannot show the 3D place. The marker stands at the spot of the step.
export function MatafMap({ step, words, label, showNames = true }: Props) {
  const spot = SPOTS[step - 1];
  // The check hides the names until the person answers, because a name can give the answer away.
  const names = showNames ? spot.names : [];
  const path = Array.from({ length: 73 }, (_, index) => flip(onPath(index * 5)).join(",")).join(" ");
  const [lineX, lineY] = flip(GREEN_LIGHT);
  const [cornerX, cornerY] = flip(HAJAR_ASWAD);
  return (
    <div className="map" data-still role="img" aria-label={label}>
      <svg className="map__plan" viewBox={`${-EDGE} ${-EDGE} ${2 * EDGE} ${2 * EDGE}`} aria-hidden="true">
        <circle className="map__arcade" r={RING + 1.5} />
        <circle className="map__rim" r={RING} />
        <circle className="map__rim" r={RING + 3} />
        <line className="map__guide" x1={cornerX} y1={cornerY} x2={lineX} y2={lineY} />
        <circle className="map__lamp" cx={lineX} cy={lineY} r="1.3" />
        {spot.path && (
          <>
            <polyline className="map__path" points={path} />
            {ARROWS.map((degrees) => (
              <path key={degrees} className="map__arrow" d="M-1.1 -1L1.1 0L-1.1 1Z" transform={arrow(degrees)} />
            ))}
          </>
        )}
        <path
          className="map__hijr"
          d={`M${-HIJR.across} ${-HIJR.centre[1]}A${HIJR.across} ${HIJR.out} 0 0 0 ${HIJR.across} ${-HIJR.centre[1]}`}
        />
        <rect className="map__kaabah" x={-KAABAH.width / 2} y={-KAABAH.depth / 2} width={KAABAH.width} height={KAABAH.depth} />
        <rect className="map__band" x={-KAABAH.width / 2 + 1} y={-KAABAH.depth / 2 + 1} width={KAABAH.width - 2} height={KAABAH.depth - 2} />
        <rect className="map__door" x={DOOR[0] - 0.5} y={-DOOR[1] - 0.95} width="1" height="1.9" />
        <circle className="map__stone" cx={cornerX} cy={cornerY} r="0.9" />
        <rect className="map__door" x={MAQAM[0] - 0.9} y={-MAQAM[1] - 0.9} width="1.8" height="1.8" />
        {names.map((part) => {
          const [fromX, fromY] = flip(PARTS[part]);
          const [toX, toY] = flip(NAME_AT[part]);
          return <line key={part} className="map__lead" x1={fromX} y1={fromY} x2={toX} y2={toY} />;
        })}
        {spot.at && <circle className="map__marker" data-marker cx={spot.at[0]} cy={-spot.at[1]} r="1.7" />}
      </svg>
      {names.map((part) => (
        <span key={part} className="scene__name" style={percent(NAME_AT[part])}>
          {words[PART_WORD[part]]}
        </span>
      ))}
    </div>
  );
}
