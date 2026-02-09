# Cloudflare Pages + D1 + R2 배포 가이드

이 프로젝트는 **Hono** 프레임워크를 사용한 Cloudflare Pages 애플리케이션입니다. **D1**(데이터베이스)과 **R2**(이미지 스토리지)가 연동되어 있습니다.

## 1. 프로젝트 구조
*   `functions/[[path]].ts`: 백엔드 로직 (API). 이미지 업로드 및 조회 처리.
*   `public/index.html`: 프론트엔드 테스트 페이지.
*   `wrangler.toml`: Cloudflare 리소스 바인딩 설정.
*   `schema.sql`: D1 데이터베이스 테이블 생성 쿼리.

## 2. GitHub에 배포하기
1.  GitHub에 새로운 저장소(Repository)를 생성합니다.
2.  현재 폴더의 코드를 푸시합니다.
    ```bash
    git init
    git add .
    git commit -m "Initial commit"
    git branch -M main
    git remote add origin <당신의_GITHUB_REPO_URL>
    git push -u origin main
    ```
3.  **Cloudflare Dashboard > Workers & Pages > Create Application > Pages > Connect to Git**으로 이동합니다.
4.  방금 만든 저장소를 선택하고 설정을 그대로 둔 채 **Save and Deploy**를 클릭합니다.

## 3. D1 데이터베이스 테이블 생성
배포 후, 데이터베이스 테이블을 만들어야 합니다. 두 가지 방법이 있습니다.

### 방법 A: 로컬에서 Wrangler 사용 (추천)
API 토큰이 설정된 환경에서 아래 명령어를 실행합니다:
```bash
npx wrangler d1 execute toprekr-d1 --remote --file=./schema.sql
```

### 방법 B: 브라우저에서 초기화 (간편)
배포된 사이트 주소 뒤에 `/api/setup`을 붙여 접속하면 테이블이 자동 생성되도록 코드를 포함시켜 두었습니다.
예: `https://<your-project>.pages.dev/api/setup`

## 4. 환경 변수 및 바인딩 확인
Cloudflare 대시보드에서 `Settings > Functions` 메뉴로 이동하여 다음 바인딩이 잘 연결되었는지 확인합니다.
(wrangler.toml 덕분에 자동 설정되지만, 확인차)
*   **D1 Database Bindings**: `DB` -> `toprekr-d1`
*   **R2 Bucket Bindings**: `BUCKET` -> `toprekr-images`

## 5. 테스트
배포된 URL에 접속하면 이미지를 업로드하고 리스트를 볼 수 있는 간단한 UI가 뜹니다.
