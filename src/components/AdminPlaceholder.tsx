interface AdminPlaceholderProps {
  email: string;
  busy: boolean;
  onLogout: () => void;
}

export function AdminPlaceholder({
  email,
  busy,
  onLogout
}: AdminPlaceholderProps) {
  return (
    <section className="access-panel admin-panel" aria-labelledby="admin-title">
      <h1 id="admin-title">관리자 페이지</h1>
      <p className="admin-account">로그인 계정: {email || "확인되지 않음"}</p>
      <p>관리자 권한을 확인했습니다.</p>
      <p>상품 관리 기능은 다음 단계에서 추가합니다.</p>
      <div className="admin-actions">
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
