interface ErrorStateProps {
  message: string;
  detail?: string;
}

export function ErrorState({ message, detail }: ErrorStateProps) {
  return (
    <span className="status-error">
      {detail ? `${message} (${detail})` : message}
    </span>
  );
}
