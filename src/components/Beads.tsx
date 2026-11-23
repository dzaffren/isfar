type Props = { done: number; now: number | null; label: string };

// Seven counter beads. Each bead is one circuit.
export function Beads({ done, now, label }: Props) {
  return (
    <div className="vh-beads" role="img" aria-label={label}>
      {Array.from({ length: 7 }, (_, bead) => {
        const circuit = bead + 1;
        const state = circuit <= done ? " vh-bead--done" : circuit === now ? " vh-bead--now" : "";
        return <span key={bead} className={`vh-bead${state}`} />;
      })}
    </div>
  );
}
