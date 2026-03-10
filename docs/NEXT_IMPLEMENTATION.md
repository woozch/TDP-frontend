# TDP – 추가 구현 진행 목록

현재 구현 상태를 기준으로, 우선순위와 난이도를 나누어 정리한 작업 목록입니다.

---

## 1. API / Contract 정합성

| 작업 | 설명 | 우선순위 |
|------|------|----------|
| **OpenAPI에 DELETE 세션 추가** | `DELETE /api/sessions/{id}` 가 이미 구현되어 있으나 `contracts/openapi.yaml` 에 없음. 스펙에 추가해 프론트·백엔드·문서 일치시키기 | 중 |
| **Contract ↔ 구현 동기화** | `contracts/types.ts` 의 `TabKey` 등이 실제 UI 탭(chat, answer, evidence, graph, pharma)과 일치하는지 확인하고, 필요 시 OpenAPI/타입 정리 | 낮 |

---

## 2. 인증 / 보안

| 작업 | 설명 | 우선순위 |
|------|------|----------|
| **세션 API 인증 검증** | Next.js API routes에서 `getOrCreateDevSession()` 대신 실제 `auth()` 사용 시 비인증 요청 401 반환 (프로덕션 준비) | 중 |
| **환경 변수 문서화** | `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, (선택) `GOOGLE_*` 등 필요한 env를 README 또는 `.env.example` 에 정리 | 중 |
| **프로덕션 auth 옵션** | Credentials mock 외에 Google 등 실제 provider 사용 시 설정 가이드 | 낮 |

---

## 3. UX / UI

| 작업 | 설명 | 우선순위 |
|------|------|----------|
| **세션 목록 로딩/에러 상태** | Report History 로딩 중 스켈레톤/스피너, list API 실패 시 재시도 또는 에러 메시지 표시 | 높 |
| **세션 상세 로딩** | 첫 세션 또는 탭 전환 시 GET `/api/sessions/:id` 로딩 중 표시 (빈 화면 대신) | 높 |
| **삭제 확인** | Report 삭제 전 확인 다이얼로그(모달 또는 confirm)로 실수 방지 | 중 |
| **키보드/접근성** | 포커스 관리, 스크린 리더 라벨, 탭/버튼에 적절한 aria 속성 추가 | 중 |
| **빈 상태(Empty state)** | 세션이 하나도 없을 때 “New report” 유도 문구·버튼 강조 | 낮 |

---

## 4. 데이터 / 백엔드

| 작업 | 설명 | 우선순위 |
|------|------|----------|
| **세션 저장소 영속화** | 현재 in-memory Map → DB(예: SQLite/Postgres) 또는 파일 기반 저장으로 재시작 후에도 유지 | 높 |
| **실제 백엔드 연동** | Mock 대신 실제 타겟 디스커버리/스트리밍 API URL·인증 설정 및 환경별(base URL) 분리 | 높 |
| **에러/재시도 정책** | fetch 실패 시 재시도, 타임아웃, 사용자에게 “다시 시도” 버튼 제공 | 중 |

---

## 5. 테스트

| 작업 | 설명 | 우선순위 |
|------|------|----------|
| **단위 테스트** | `session-repository`, 스트리밍 파서(`streaming/client`), 타입/유틸 함수 | 중 |
| **API 라우트 테스트** | GET/POST/DELETE sessions, GET session by id, POST chat/stream (Next.js route handlers 또는 fetch 기반) | 중 |
| **E2E(선택)** | Playwright 등으로 signin → 채팅 전송 → 탭 전환 → 삭제 시나리오 | 낮 |

---

## 6. 운영 / 배포

| 작업 | 설명 | 우선순위 |
|------|------|----------|
| **헬스/라이브니스** | `/api/health` 또는 `/api/auth/session` 기반 헬스 체크로 배포·오케스트레이션 대응 | 낮 |
| **로깅** | API 라우트에서 요청/에러 로그 구조화(선택 시 요청 ID 등) | 낮 |
| **Docker 프로덕션 빌드** | `Dockerfile` multi-stage로 `next build` + `next start` 최적화 | 낮 |

---

## 7. 문서 / 코드 품질

| 작업 | 설명 | 우선순위 |
|------|------|----------|
| **README 업데이트** | FSD 레이어 설명을 `src/screens` 등 실제 구조에 맞게 수정, “Implemented MVP” 항목을 현재 기능(테마, 탭 이름, 세션 삭제 유지 등)으로 갱신 | 낮 |
| **주요 플로우 주석** | 세션 로드/스트리밍/탭 상태 흐름 등 핵심 로직에 짧은 주석 추가 | 낮 |

---

## 권장 진행 순서 (MVP 강화)

1. **세션 목록/상세 로딩·에러 상태** (3. UX) – 사용자가 “멈춤”처럼 보이는 구간 제거  
2. **삭제 확인** (3. UX) – 실수 삭제 방지  
3. **세션 영속화** (4. 데이터) – 재시작 후에도 Report History 유지  
4. **OpenAPI에 DELETE 반영** (1. Contract) – 스펙과 구현 일치  
5. **단위/API 테스트** (5. 테스트) – 리팩터링·배포 시 회귀 방지  

이후 실제 백엔드 연동·프로덕션 인증·E2E는 백엔드 일정에 맞춰 진행하면 됩니다.
