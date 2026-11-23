type Props = { label: string; text: string; open?: boolean };

// A ruling of another school. It stays closed until the person taps it.
export function Note({ label, text, open }: Props) {
  return (
    <details className="vh-note" open={open}>
      <summary>
        {label}
        <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </summary>
      <p>{text}</p>
    </details>
  );
}
