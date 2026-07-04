# ngcatalogue

React + TypeScript + Vite 기반 상품 카탈로그입니다.

## Frontend Environment

프론트엔드에는 브라우저에서 사용 가능한 Supabase 값만 설정합니다.

```bash
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=
```

`CENTER_ACCESS_CODE`, `CENTER_SESSION_SECRET`, `SUPABASE_SERVICE_ROLE_KEY`는 프론트엔드 환경 파일이나 빌드 산출물에 넣지 않습니다.

## Routes

```text
/catalog
/catalog/center
/admin
```

`/catalog`는 공개 카탈로그이며 `catalog_public_products` View에서 공개 컬럼만 조회합니다. 접근 코드나 로그인 없이 동작해야 합니다.

`/catalog/center`는 센터 전용 카탈로그이며, Supabase Edge Function `catalog-center`에서 발급한 서명 세션 토큰이 있을 때만 `catalog_products`의 센터용 컬럼을 조회합니다.

GitHub Pages 배포에서는 해시 라우트를 사용합니다.

```text
#/catalog
#/catalog/center
#/admin
```

`#/admin`은 관리자 전용 진입점입니다. 상품 편집 기능은 아직 제공하지 않으며, Google 로그인과 관리자 권한 확인 후 placeholder 대시보드만 표시합니다.

## Administrator Access

관리자는 별도 테이블을 만들지 않고 기존 `workspace_members` 테이블로 판별합니다. 인증된 Supabase 사용자 UUID가 아래 조건과 일치할 때만 카탈로그 관리자입니다.

```text
workspace_id = 00000000-0000-0000-0000-000000000002
user_id = auth.users.id
role = admin
```

프론트엔드에는 관리자 이메일을 하드코딩하지 않습니다. Google Client ID와 Client Secret도 프론트엔드 환경 파일에 넣지 않고 Supabase Dashboard에만 설정합니다.

필요한 SQL은 `supabase/admin_access_setup.sql`에 정리되어 있습니다. 실행 전에 Supabase SQL Editor에서 기존 `workspace_members` 정책을 확인하고, 같은 이름이나 충돌하는 정책이 없는지 검토합니다.

SQL 파일은 다음을 포함합니다.

* `public.is_catalog_admin()` helper function
* authenticated role의 helper function 실행 권한
* `workspace_members` RLS 활성화
* 인증 사용자가 자신의 membership row만 조회할 수 있는 select policy

membership 관리는 수동 작업으로 유지합니다. 사용자가 직접 insert, update, delete 할 수 있는 정책은 추가하지 않습니다.

## Supabase Google OAuth Setup

Supabase Dashboard에서 다음 경로로 이동합니다.

```text
Authentication
Providers
Google
```

프로젝트 소유자가 Google Client ID와 Google Client Secret을 설정합니다. Google OAuth의 `redirectTo` 값에는 `#/admin` 해시를 직접 넣지 않습니다. 앱은 로그인 시작 전에 `sessionStorage`의 `catalog_post_auth_route`에 `#/admin`을 저장하고, OAuth callback 뒤 Supabase 세션이 복원되면 해당 해시 라우트로 한 번만 이동합니다.

현재 GitHub Pages 배포 단계의 Supabase Auth 설정은 아래 값을 사용합니다.

Site URL:

```text
https://mworkroom.github.io/ngcatalogue/
```

Allowed Redirect URL:

```text
https://mworkroom.github.io/ngcatalogue/
```

현재 배포 origin과 path는 다음과 같습니다.

```text
origin: https://mworkroom.github.io
path: /ngcatalogue/
```

나중에 custom domain이 연결되면 OAuth redirect 설정에 아래 도메인 기준 URL도 추가하거나 교체해야 합니다.

```text
https://catalog.nangok.app/
```

## Manual Administrator Registration

첫 관리자와 두 번째 관리자는 자동 생성하지 않습니다. 각 Google 계정이 한 번 로그인한 뒤 Supabase Dashboard에서 수동으로 membership row를 추가합니다.

1. `#/admin`을 엽니다.
2. 관리자 Google 계정으로 로그인합니다.
3. Supabase Dashboard에서 `Authentication > Users`로 이동합니다.
4. 해당 사용자의 UUID를 복사합니다.
5. `workspace_members`에 아래 row를 추가합니다.

```sql
insert into public.workspace_members (
  workspace_id,
  user_id,
  role
)
values (
  '00000000-0000-0000-0000-000000000002',
  'AUTH_USER_UUID_HERE',
  'admin'
);
```

실제 사용자 UUID는 저장소에 커밋하지 않습니다.

## Supabase Edge Function

센터 접근은 `supabase/functions/catalog-center/index.ts`에서 처리합니다.

지원 action:

```text
login
products
```

`login`은 8자리 숫자 접근 코드를 확인한 뒤 30일 동안 유효한 서명 JWT를 반환합니다. `products`는 JWT 서명, 만료 시간, `role: "center"`를 확인한 뒤 서비스 역할 키로 `catalog_products`에서 `is_visible = true`인 상품만 조회합니다.

## Required Supabase Secrets

실제 값은 Supabase Dashboard 또는 CLI에서만 설정합니다. 저장소에는 커밋하지 않습니다.

```bash
supabase secrets set CENTER_ACCESS_CODE=YOUR_8_DIGIT_CODE
supabase secrets set CENTER_SESSION_SECRET=YOUR_LONG_RANDOM_SECRET
```

`SUPABASE_URL`과 `SUPABASE_SERVICE_ROLE_KEY`가 Edge Function 환경에서 사용 가능해야 합니다. Supabase 프로젝트 기본 환경에서 제공되지 않는 경우 Dashboard의 Function secrets에서 값을 설정합니다.

## Deploy Edge Function

```bash
supabase functions deploy catalog-center
```

배포 뒤 `/catalog/center`에서 접근 코드 입력, 세션 유지, 로그아웃, 센터 상품 조회를 확인합니다.

## Local Commands

```bash
npm install
npm run dev
npm run build
```
