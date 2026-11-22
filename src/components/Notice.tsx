export function Notice({ children }: { children: string }) {
  return (
    <p className="vh-notice">
      <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 11v5" />
        <path d="M12 7.5v.5" />
      </svg>
      <span>{children}</span>
    </p>
  );
}
