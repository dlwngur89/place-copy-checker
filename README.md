# 플레이스 문구 점검기 (place-copy-checker)

네이버 플레이스(스마트플레이스) 업체 정보를 올리기 전에 대표키워드·상세설명·찾아오는길 문구를 점검하는 작은 도구입니다. 바로 쓰기: https://dlwngur89.github.io/place-copy-checker/ (또는 `index.html`을 내려받아 열기). 입력 내용은 외부로 전송되지 않습니다.

## 점검 항목
- 대표키워드: 개수(기본 5개), 허용되지 않은 특수문자·이모지·가운뎃점, 중복, 본문에 쓰는 것이 나은 단어
- 상세설명: 공백 포함 글자 수, 긴 대시(–, —), 보장·단정 표현(오류: 상위노출 보장, 부작용 없음, 효과 보장 등 / 경고: 최고, 1위, 100% 등 근거가 필요한 표현)
- 찾아오는길: 공백 포함 400자, 도보·차량·내비게이션·주차 안내 누락

규칙은 실무 운영 기준(기본값)이며 네이버 공식 기준이 아닙니다. 최신 기준은 네이버 스마트플레이스 고객센터에서 확인하고, 필요하면 `DEFAULT_RULES`를 바꿔 쓰세요.

## 사용
- 웹: `index.html` 열기
- Node: `const c = require('./checker.js'); c.checkKeywords(['광안리 오마카세'])`
- 테스트: `npm test`

## 기여
규칙 추가·수정, 다른 지도 플랫폼(카카오맵 등) 지원, 버그 제보 모두 환영합니다. 이슈나 PR로 보내 주세요.

---

## English
A tiny, dependency-free checker for Korean local business listings on Naver Place (Korea's dominant map/local search). It validates representative keywords (count, disallowed characters, emoji), description length and risky guarantee phrases, and the 400-character directions field. Try it at https://dlwngur89.github.io/place-copy-checker/ . Runs fully in the browser; nothing leaves the page. Rules are practitioner defaults, not official Naver policy. MIT licensed. Contributions welcome.
