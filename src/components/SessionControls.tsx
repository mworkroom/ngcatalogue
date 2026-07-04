interface SessionControlsProps {
  label: string;
  onLogout: () => void;
}

export function SessionControls({ label, onLogout }: SessionControlsProps) {
  return (
    <button type="button" className="logout-button" onClick={onLogout}>
      {label}
    </button>
  );
}
