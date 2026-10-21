// place-copy-checker — 네이버 플레이스·지도 업체 정보 문구 점검기 (MIT)
// 브라우저와 Node 양쪽에서 동작. 외부 통신 없음.
(function (root) {
  'use strict';

  // 기본 규칙. 네이버 공식 기준이 아니라 실무 운영 기준이므로 반드시 최신 네이버 고객센터 안내와 대조해서 쓴다.
  const DEFAULT_RULES = {
    keywordMax: 5,
    keywordAllowedSpecial: "-_():&![],.%+~@*^'/?²℃※<>",
    keywordBannedWords: ['맛집'],
    directionsMaxChars: 400,
    // 보장·단정 표현: 쓰면 안 되는 문구(오류)
    bannedPhrases: ['무조건 상위노출', '상위노출 보장', '부작용 없음', '효과 보장', '효과 100%', '완치'],
    // 근거가 있어야 쓸 수 있는 표현(경고): 객관적 근거·출처 없이 쓰면 과장광고 위험
    cautionPhrases: ['최고', '유일', '1위', '100%', '최초', '독보적'],
    longDashes: ['–', '—'],
  };

  const EMOJI_RE = /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/u;

  function countChars(text) {
    // 공백·줄바꿈 포함 글자 수 (서로게이트 쌍은 1자로)
    return Array.from(text.replace(/\r\n/g, '\n')).length;
  }

  function checkKeywords(list, rules = DEFAULT_RULES) {
    const issues = [];
    const items = list.map(s => s.trim()).filter(Boolean);
    if (items.length > rules.keywordMax) {
      issues.push({ level: 'error', msg: `대표키워드가 ${items.length}개입니다. 최대 ${rules.keywordMax}개.` });
    }
    const seen = new Set();
    for (const kw of items) {
      if (seen.has(kw)) issues.push({ level: 'warn', msg: `"${kw}" 중복` });
      seen.add(kw);
      for (const bad of rules.keywordBannedWords) {
        if (kw.includes(bad)) issues.push({ level: 'error', msg: `"${kw}": "${bad}"는 대표키워드로 쓰지 말고 본문에서 쓰세요` });
      }
      if (EMOJI_RE.test(kw)) issues.push({ level: 'error', msg: `"${kw}": 이모지 사용 불가` });
      for (const ch of Array.from(kw)) {
        const isWord = /[0-9A-Za-z가-힣\s]/.test(ch);
        if (!isWord && !rules.keywordAllowedSpecial.includes(ch) && !EMOJI_RE.test(ch)) {
          issues.push({ level: 'error', msg: `"${kw}": 허용되지 않은 문자 "${ch}"` });
        }
      }
    }
    return { count: items.length, issues };
  }

  function checkText(text, { maxChars, field = '본문' } = {}, rules = DEFAULT_RULES) {
    const issues = [];
    const n = countChars(text);
    if (maxChars && n > maxChars) issues.push({ level: 'error', msg: `${field} ${n}자 (공백 포함). 최대 ${maxChars}자, ${n - maxChars}자 초과.` });
    for (const d of rules.longDashes) {
      if (text.includes(d)) issues.push({ level: 'warn', msg: `${field}: 긴 대시 "${d}" 대신 "-" 권장` });
    }
    for (const p of rules.bannedPhrases) {
      if (text.includes(p)) issues.push({ level: 'error', msg: `${field}: 보장·단정 표현 "${p}" (과장광고·의료광고 위험)` });
    }
    for (const p of rules.cautionPhrases) {
      if (text.includes(p) && !rules.bannedPhrases.some(b => b.includes(p) && text.includes(b))) {
        issues.push({ level: 'warn', msg: `${field}: "${p}"는 객관적 근거가 있을 때만 쓰세요` });
      }
    }
    return { chars: n, issues };
  }

  function checkDirections(text, rules = DEFAULT_RULES) {
    const r = checkText(text, { maxChars: rules.directionsMaxChars, field: '찾아오는길' }, rules);
    for (const part of ['도보', '차량', '내비', '주차']) {
      if (!text.includes(part)) r.issues.push({ level: 'info', msg: `찾아오는길에 "${part === '내비' ? '내비게이션' : part}" 안내가 없습니다.` });
    }
    return r;
  }

  const api = { DEFAULT_RULES, countChars, checkKeywords, checkText, checkDirections };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.PlaceCopyChecker = api;
})(typeof self !== 'undefined' ? self : this);
