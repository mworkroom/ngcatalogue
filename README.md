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
```

`/catalog`는 공개 카탈로그이며 `catalog_public_products` View에서 공개 컬럼만 조회합니다. 접근 코드나 로그인 없이 동작해야 합니다.

`/catalog/center`는 센터 전용 카탈로그이며, Supabase Edge Function `catalog-center`에서 발급한 서명 세션 토큰이 있을 때만 `catalog_products`의 센터용 컬럼을 조회합니다.

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
