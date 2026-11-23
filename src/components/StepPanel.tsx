type Props = { title: string; text: string };

export function StepPanel({ title, text }: Props) {
  return (
    <article className="vh-panel vh-cloth">
      <div className="vh-panel__body">
        <h1 className="vh-title">{title}</h1>
        <p className="vh-text">{text}</p>
      </div>
    </article>
  );
}
