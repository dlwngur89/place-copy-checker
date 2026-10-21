# 기여 안내 (How to contribute)

코딩을 몰라도 기여할 수 있습니다. 네이버 플레이스·카카오맵을 운영해 본 사장님, 마케터의 실무 지식이 가장 큰 도움이 됩니다.

## 1. 코딩 없이 (이슈로 제안)
- 이 저장소의 [Issues](https://github.com/dlwngur89/place-copy-checker/issues) 탭 → **New issue** → "규칙 제안" 양식을 고르고 아래를 적어 주세요.
  - 어떤 규칙인지 (예: "광안동"보다 "광안리"로 검색됨)
  - 근거 (공식 안내 링크, 실제 사례 캡처 등)
- 규칙 표현이 틀렸거나 오래된 경우도 이슈로 알려 주세요.

## 2. 깃허브 화면에서 바로 고치기 (설치 없이)
1. 고치고 싶은 파일(예: `checker.js`)을 열고 연필 아이콘(Edit)을 누릅니다.
2. 내용을 고친 뒤 **Commit changes** → "Create a new branch… and start a pull request"를 고르면 PR(수정 제안)이 만들어집니다.
3. 규칙은 `checker.js` 맨 위 `DEFAULT_RULES`에 모여 있습니다. 예) 금지 표현 추가 = `bannedPhrases` 목록에 한 줄 추가.

## 3. 내 컴퓨터에서 (개발자)
```bash
git clone https://github.com/dlwngur89/place-copy-checker.git
cd place-copy-checker
npm test   # Node 18+ 필요, 설치할 패키지 없음
```
- 새 규칙에는 `test/checker.test.js`에 테스트 한 줄을 같이 넣어 주세요.
- PR을 올리면 자동 테스트(GitHub Actions)가 돌아갑니다.

## 지켜 주세요
- 규칙에는 근거를 붙여 주세요. 법령 관련(의료광고·식품 표시광고 등)은 조문 번호를 적어 주세요.
- 특정 업체를 비방하거나 개인정보가 담긴 예시는 올리지 마세요.
- 기여한 내용은 MIT 라이선스로 공개됩니다.

---

## English
No coding needed: open an issue with the "Rule proposal" template, describing the rule and its source. To edit directly, open a file on GitHub, click the pencil icon, and choose "Create a new branch and start a pull request". Developers: `npm test` (Node 18+, no dependencies) and add a test line for each new rule. Contributions are released under the MIT License.
