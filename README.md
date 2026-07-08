# ngcatalogue

React + TypeScript + Vite 기반 상품 카탈로그입니다.

## Frontend Environment

프론트엔드에는 브라우저에서 사용 가능한 Supabase 값만 설정합니다.

```bash
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=
```

`BUSINESS_ACCESS_CODE`, `BUSINESS_SESSION_SECRET`, `CENTER_ACCESS_CODE`, `CENTER_SESSION_SECRET`, `SUPABASE_SERVICE_ROLE_KEY`는 프론트엔드 환경 파일이나 빌드 산출물에 넣지 않습니다.

## Routes

custom domain 배포에서 사용자에게 공유하는 주소는 실제 HTML 문서 경로를 사용합니다.

```text
사업자: /
센터: /center/
관리자: /admin/
```

사업자 카탈로그는 Supabase Edge Function `catalog-business`에서 발급한 서명 세션 토큰이 있을 때만 사업자용 상품 컬럼을 조회합니다. 기존 공개 View 직접 조회 방식은 더 이상 사용하지 않습니다.

`/center/`는 센터 전용 카탈로그이며, Supabase Edge Function `catalog-center`에서 발급한 서명 세션 토큰이 있을 때만 센터용 상품 컬럼을 조회합니다.

`/admin/`은 관리자 전용 진입점입니다. Google 로그인과 관리자 권한 확인 후 상품 생성, 수정, 숨김, 복구 화면을 표시합니다.

기존 해시 라우트는 호환용으로만 처리합니다.

```text
#/catalog
#/catalog/center
#/admin
```

iPhone 홈 화면 추가는 해시 뒤 경로를 별도 문서로 보지 않을 수 있으므로, 홈 화면에 추가할 주소는 반드시 `/center/`, `/admin/` 같은 실제 문서 경로를 사용합니다.

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

프로젝트 소유자가 Google Client ID와 Google Client Secret을 설정합니다. Google OAuth의 `redirectTo` 값에는 `#/admin` 해시를 직접 넣지 않습니다. 앱은 로그인 시작 전에 `sessionStorage`의 `catalog_post_auth_route`에 `/admin/` 실제 경로를 저장하고, OAuth callback 뒤 Supabase 세션이 복원되면 해당 실제 경로로 돌아갑니다.

custom domain 배포 단계의 Supabase Auth 설정은 아래 값을 사용합니다.

Site URL:

```text
https://price.nangok.app/
```

Allowed Redirect URL:

```text
https://price.nangok.app/admin/
```

루트 주소만 허용하면 Supabase OAuth callback이 `/admin/` 대신 `/`로 돌아올 수 있습니다. 이 경우 iPhone Safari가 관리자 홈 화면 아이콘을 다시 루트 문서로 저장할 수 있으므로 `/admin/`을 별도로 허용해야 합니다.

GitHub Pages 원본 주소를 계속 사용할 경우 아래 주소도 추가합니다.

```text
https://mworkroom.github.io/ngcatalogue/admin/
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

사업자 접근은 `supabase/functions/catalog-business/index.ts`에서 처리하고, 센터 접근은 `supabase/functions/catalog-center/index.ts`에서 처리합니다. 두 접근 레벨은 서로 다른 8자리 접근 코드, 세션 secret, localStorage key를 사용합니다.

두 함수가 지원하는 action:

```text
login
products
```

`login`은 8자리 숫자 접근 코드를 timing-safe 비교로 확인한 뒤 30일 동안 유효한 서명 JWT를 반환합니다. `products`는 JWT 서명, 만료 시간, 역할을 확인한 뒤 서비스 역할 키로 `catalog_products`에서 `is_visible = true`인 상품만 조회합니다.

사업자 함수는 다음 컬럼만 반환합니다.

```text
id
name_ko
name_pt
business_price
consumer_price
brazil_price
is_set
pack_quantity
```

센터 함수는 다음 컬럼만 반환합니다.

```text
id
name_ko
name_pt
handling_fee
business_price
consumer_price
brazil_price
brazil_pv
is_set
pack_quantity
```

## Required Supabase Secrets

실제 값은 Supabase Dashboard에서만 설정합니다. 저장소에는 커밋하지 않습니다.

```text
BUSINESS_ACCESS_CODE
BUSINESS_SESSION_SECRET
CENTER_ACCESS_CODE
CENTER_SESSION_SECRET
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
```

`SUPABASE_URL`과 `SUPABASE_SERVICE_ROLE_KEY`는 Edge Function 안에서만 사용합니다. 프론트엔드에는 `VITE_SUPABASE_URL`과 `VITE_SUPABASE_PUBLISHABLE_KEY`만 설정합니다.

## Deploy Edge Functions

이 프로젝트의 Edge Function은 Supabase CLI가 아니라 Supabase Dashboard에서 수동으로 생성하거나 갱신합니다.

1. Supabase Dashboard에서 `Edge Functions`로 이동합니다.
2. `catalog-business` 함수를 만들고 `supabase/functions/catalog-business/index.ts` 내용을 반영합니다.
3. `catalog-center` 함수를 열고 `supabase/functions/catalog-center/index.ts` 내용을 반영합니다.
4. Dashboard의 Function secrets에서 위 필수 secret이 모두 설정되어 있는지 확인합니다.
5. 프론트엔드를 배포한 뒤 `/catalog`와 `/catalog/center`를 각각 테스트합니다.

사업자 카탈로그가 `catalog-business`를 통해 정상 조회되는 것을 확인한 뒤 마지막 보안 단계로 아래 SQL을 Supabase SQL Editor에서 수동 실행합니다.

```sql
revoke select
on public.catalog_public_products
from anon, authenticated;
```

이 revoke 이후에도 `catalog-business`와 `catalog-center`는 서비스 역할 키를 함수 내부에서 사용하므로 계속 동작해야 합니다. SQL 실행 뒤 `/catalog` 사업자 접근을 다시 테스트합니다.

## Local Commands

```bash
npm install
npm run dev
npm run build
```
