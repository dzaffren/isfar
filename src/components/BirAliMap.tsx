import type { Words } from "../content/text";
import type { Point } from "../scene/mataf";
import { BIRALI, IHRAM_PARTS, IHRAM_SPOTS, type IhramPart } from "../scene/birali";

export const IHRAM_PART_WORD: Record<IhramPart, keyof Words> = {
  hall: "partHall",
  minaret: "partMinaret",
  washrooms: "partWashrooms",
  busPark: "partBusPark",
};

// Where each name sits on the map, clear of the marker and the other names.
const NAME_AT: Record<IhramPart, Point> = {
  hall: [0, -28],
  minaret: [6, 25],
  washrooms: [-51, 18],
  busPark: [-28, 42],
};

const CENTRE: Point = [-6.5, 7];
const HALF = 52;
const BAYS = [-36, -24, -12, 0, 12, 24, 36];

// The map draws y down, and the plan has y up.
const flip = ([x, y]: Point): Point => [x, -y];
const percent = ([x, y]: Point) => ({ left: `${((x - CENTRE[0] + HALF) / (2 * HALF)) * 100}%`, top: `${((CENTRE[1] - y + HALF) / (2 * HALF)) * 100}%` });

// A rectangle of the plan, by its middle and its sizes, as the map draws it.
const box = ([x, y]: number[], width: number, depth: number) => ({ x: x - width / 2, y: -y - depth / 2, width, height: depth });

type Props = { step: number; words: Words; label: string; showNames?: boolean };

// The top view of Bir Ali, for a device that cannot show the 3D place. North is up, and the bus park is on the north side.
export function BirAliMap({ step, words, label, showNames = true }: Props) {
  const spot = IHRAM_SPOTS[step - 1];
  const names = showNames ? spot.names : [];
  const { mosque, court, minaret, washrooms, busPark } = BIRALI;
  const park = box(busPark.at, busPark.width, busPark.depth);
  return (
    <div className="map" data-still role="img" aria-label={label}>
      <svg className="map__plan" viewBox={`${CENTRE[0] - HALF} ${-CENTRE[1] - HALF} ${2 * HALF} ${2 * HALF}`} aria-hidden="true">
        <rect className="map__park" {...park} />
        {BAYS.map((x) => (
          <line key={x} className="map__bay" x1={x} y1={park.y} x2={x} y2={park.y + park.height / 2} />
        ))}
        <rect className="map__block" {...box(washrooms.at, washrooms.width, washrooms.depth)} />
        <rect className="map__hall" {...box(mosque.at, mosque.size, mosque.size)} />
        <rect className="map__court" {...box(court.at, court.size, court.size)} />
        <rect className="map__minaret" {...box(minaret.at, minaret.size, minaret.size)} />
        {names.map((part) => {
          const [fromX, fromY] = flip(IHRAM_PARTS[part]);
          const [toX, toY] = flip(NAME_AT[part]);
          return <line key={part} className="map__lead" x1={fromX} y1={fromY} x2={toX} y2={toY} />;
        })}
        {spot.at && <circle className="map__marker" data-marker cx={spot.at[0]} cy={-spot.at[1]} r="2.2" />}
      </svg>
      {names.map((part) => (
        <span key={part} className="scene__name" style={percent(NAME_AT[part])}>
          {words[IHRAM_PART_WORD[part]]}
        </span>
      ))}
    </div>
  );
}
