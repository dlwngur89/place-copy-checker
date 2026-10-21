# 플레이스 문구 점검기 (place-copy-checker)

네이버 플레이스(스마트플레이스) 업체 정보를 올리기 전에 대표키워드·상세설명·찾아오는길을 30초 만에 점검하는 무료 도구입니다.

**바로 쓰기: https://dlwngur89.github.io/place-copy-checker/** (설치·가입 없음, 입력 내용은 브라우저 밖으로 나가지 않습니다)

## 무엇을 잡아주나
| 칸 | 점검 |
|---|---|
| 대표키워드 | 개수(기본 5개), 쓸 수 없는 특수문자·이모지·가운뎃점, 중복, 본문에서 쓰는 게 나은 단어. **버튼 한 번으로 정리** |
| 상세설명 | 공백 포함 글자 수, 긴 대시(–, —), 보장·단정 표현, 근거가 필요한 표현, 키워드를 한 줄에 줄줄이 쌓은 블록. **문장 위에 걸린 곳을 바로 표시** |
| 찾아오는길 | 공백 포함 400자 막대, 도보·차량·내비게이션·주차 누락, **빈 양식 넣기** |
| 키워드 사용 횟수 | 대표키워드가 상세설명·찾아오는길에 몇 번 들어갔는지 |

### 업종별 프리셋
일반 / 음식점 / 병의원 / 화장품·뷰티 / 일반식품·건강식품. 업종을 고르면 그 업종에서 조심할 표현이 추가됩니다. 근거 법령(요약, 참고용):
- 병의원: 「의료법」 제56조
- 화장품·뷰티: 「화장품법」 제13조
- 일반식품·건강식품: 「식품 등의 표시·광고에 관한 법률」 제8조
- 음식점: 「농수산물의 원산지 표시 등에 관한 법률」(원산지 표현 확인)

점검 결과는 **복사 버튼**으로 텍스트 보고서를 만들어 클라이언트·팀에 바로 보낼 수 있습니다.

규칙은 실무 운영 기준(기본값)이며 네이버 공식 기준이 아닙니다. 업종별 표현은 법령을 요약한 참고용이고, 최종 판단은 법령 원문과 광고 심의 기준을 따르세요.

## 개발자용
- 브라우저: `index.html` + `checker.js` (의존성 없음)
- Node: `const c = require('./checker.js'); c.checkText('부작용 없는 시술', {}, c.withPreset('clinic'))`
- 주요 함수: `checkKeywords`, `checkText`, `checkDirections`, `keywordUsage`, `detectKeywordBlocks`, `autoFixText`, `autoFixKeywords`, `withPreset`
- 테스트: `npm test`

## 기여
규칙 추가·수정, 카카오맵 지원, 지역명 짝(행정동 → 실제 검색어) 제보를 환영합니다. 코딩을 몰라도 됩니다. [기여 안내](CONTRIBUTING.md) · [규칙 제안하기](https://github.com/dlwngur89/place-copy-checker/issues/new/choose)

---

## English
A free, dependency-free checker for Korean local business listings on Naver Place (Korea's dominant map/local search). It validates representative keywords (count, disallowed characters, emoji, one-click cleanup), description and directions copy (length, long dashes, guarantee phrases, keyword stuffing, inline highlighting), and counts keyword usage. Industry presets (clinic, cosmetics, food, restaurant) add restricted expressions based on Korean advertising laws (summarized, for reference). Try it at https://dlwngur89.github.io/place-copy-checker/ . Runs fully in the browser. MIT licensed. Contributions welcome.
