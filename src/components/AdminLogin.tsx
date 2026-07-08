interface AdminLoginProps {
  busy: boolean;
  error: string | null;
  onLogin: () => void;
}

export function AdminLogin({ busy, error, onLogin }: AdminLoginProps) {
  return (
    <section className="access-panel admin-panel" aria-labelledby="admin-title">
      <h1 id="admin-title">애터미 가격표 관리자 전용</h1>
      <p>Google 계정으로 로그인하세요.</p>
      <button
        className="admin-button admin-button-primary"
        type="button"
        disabled={busy}
        onClick={onLogin}
      >
        {busy ? "로그인 요청 중..." : "Google 계정으로 로그인"}
      </button>
      {error ? (
        <p className="access-message" role="alert">
          {error}
        </p>
      ) : null}
    </section>
  );
}
