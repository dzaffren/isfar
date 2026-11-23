type Props = { message: string; retry?: { label: string; onRetry: () => void } };

export function MessageCard({ message, retry }: Props) {
  return (
    <div className="vh-card vh-cloth" aria-live="polite">
      <p className="vh-text">{message}</p>
      {retry && (
        <button type="button" className="vh-button" onClick={retry.onRetry}>
          {retry.label}
        </button>
      )}
    </div>
  );
}
