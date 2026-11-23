type Props = { title: string; hint: string };

export function LoadingCard({ title, hint }: Props) {
  return (
    <div className="vh-card vh-cloth scene__load" role="status">
      <p className="vh-question">{title}</p>
      <div className="vh-beads vh-beads--cloth vh-beads--busy" aria-hidden="true">
        {Array.from({ length: 7 }, (_, bead) => (
          <span key={bead} className="vh-bead" />
        ))}
      </div>
      <p className="vh-muted">{hint}</p>
    </div>
  );
}
