interface AdminUnauthorizedProps {
  email: string;
  busy: boolean;
  onLoginWithDifferentAccount: () => void;
  onLogout: () => void;
}

export function AdminUnauthorized({
  email,
  busy,
  onLoginWithDifferentAccount,
  onLogout
}: AdminUnauthorizedProps) {
  return (
    <section className="access-panel admin-panel" aria-labelledby="admin-title">
      <h1 id="admin-title">관리자 권한이 없는 계정입니다</h1>
      <p className="admin-account">로그인 계정: {email || "확인되지 않음"}</p>
      <div className="admin-actions">
        <button
          className="admin-button admin-button-primary"
          type="button"
          disabled={busy}
          onClick={onLoginWithDifferentAccount}
        >
          다른 계정으로 로그인
        </button>
        <button
          className="admin-button admin-button-secondary"
          type="button"
          disabled={busy}
          onClick={onLogout}
        >
          로그아웃
        </button>
      </div>
    </section>
  );
}
