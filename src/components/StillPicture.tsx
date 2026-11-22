// The same fixed view as the 3D place, drawn flat. It follows light and dark through the tokens in app.css.
export function StillPicture({ label }: { label: string }) {
  return (
    <svg className="scene__view" data-still role="img" aria-label={label} viewBox="0 0 400 320" preserveAspectRatio="xMidYMid slice">
      <rect className="scene__sky" x="-400" y="-200" width="1200" height="325" />
      <rect className="scene__floor" x="-400" y="125" width="1200" height="425" />
      <rect className="scene__rim" x="-400" y="115" width="1200" height="10" />
      <path className="scene__joint" d="M-400 133H800 M-400 145H800 M-400 163H800 M-400 189H800 M-400 227H800 M-400 283H800" />
      <path className="scene__joint" d="M200 125L-572 330 M200 125L-379 330 M200 125L-186 330 M200 125L7 330 M200 125L200 330 M200 125L393 330 M200 125L586 330 M200 125L779 330 M200 125L972 330" />
      <polygon className="scene__shade" points="215,210 310,189 366,198 264,223" />
      <polygon className="scene__face" points="95,67 215,45 215,210 95,187" />
      <polygon className="scene__face scene__face--far" points="215,45 310,65 310,189 215,210" />
      <polygon className="scene__band" points="95,91 215,78 215,94.5 95,103" />
      <polygon className="scene__band" points="215,78 310,89.8 310,102.2 215,94.5" />
      <polygon className="scene__door" points="109.4,133.3 133.4,133.9 133.4,178.2 109.4,174.7" />
      <polygon className="scene__foot" points="95,182.2 215,203.4 215,210 95,187" />
      <polygon className="scene__foot" points="215,203.4 310,184 310,189 215,210" />
    </svg>
  );
}
