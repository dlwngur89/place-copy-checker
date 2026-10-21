// place-copy-checker v0.2 — 네이버 플레이스·지도 업체 정보 문구 점검기 (MIT)
// 브라우저와 Node 양쪽에서 동작. 외부 통신 없음.
(function (root) {
  'use strict';

  // 기본 규칙. 네이버 공식 기준이 아니라 실무 운영 기준이므로 최신 네이버 스마트플레이스 안내와 대조해서 쓴다.
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

  // 업종별 추가 표현. 법령 근거는 참고용 요약이며 최종 판단은 법령 원문·심의 기준으로 한다.
  const PRESETS = {
    general: { label: '일반', basis: '', banned: [], caution: [] },
    restaurant: {
      label: '음식점',
      basis: '원산지 표시는 「농수산물의 원산지 표시 등에 관한 법률」 기준과 실제 표시가 같아야 합니다.',
      banned: [],
      caution: ['국내산', '한우', '수입산', '직접 키운', '당일 도축', '무항생제', '유기농'],
      cautionNote: '원산지·인증 표현은 매장 원산지 표시·인증서와 일치하는지 확인',
    },
    clinic: {
      label: '병의원',
      basis: '「의료법」 제56조(의료광고의 금지 등): 치료 효과 보장, 다른 의료기관과의 비교, 근거 없는 최상급 표현 등은 금지 대상입니다.',
      banned: ['부작용 없', '통증 없', '무통', '흉터 없', '100% 만족', '확실한 효과', '재발 없', '전후 사진', '비포 애프터', '보장합니다'],
      caution: ['최상', '안전한 시술', '효과적인', '검증된', '전문의 다수', '할인', '이벤트', '무료 시술'],
      cautionNote: '의료광고 심의·가격 표기(VAT 별도 등) 기준 확인',
    },
    cosmetics: {
      label: '화장품·뷰티',
      basis: '「화장품법」 제13조(부당한 표시·광고 행위 등의 금지): 의약품으로 오인하게 하는 표현, 기능성 심사 없이 기능성으로 오인하게 하는 표현 등은 금지 대상입니다.',
      banned: ['치료', '재생', '아토피', '여드름 개선', '염증 완화', '세포 재생', '시술 효과', '피부과 시술'],
      caution: ['미백', '주름 개선', '자외선 차단', '탈모 완화', '민감 피부', '저자극', '천연', '무첨가'],
      cautionNote: '기능성 화장품 심사·보고 여부와 표현이 일치하는지 확인',
    },
    food: {
      label: '일반식품·건강식품',
      basis: '「식품 등의 표시·광고에 관한 법률」 제8조(부당한 표시 또는 광고행위의 금지): 질병 예방·치료 효능, 건강기능식품으로 오인하게 하는 표현 등은 금지 대상입니다.',
      banned: ['질병 예방', '치료', '면역력 강화', '혈당 조절', '혈압', '다이어트 효과', '피부 재생', '항암', '디톡스'],
      caution: ['면역', '피부', '다이어트', '건강', '체지방', '숙취', '피로 회복'],
      cautionNote: '일반식품은 효능 대신 맛·원료·먹는 장면 위주로. 건강기능식품은 인정받은 기능성 문구만',
    },
  };

  // 걸린 표현 바로 뒤(같은 문장, 14자 안)에 부정 표현이 오면 "부정 문맥"으로 보고 오류·주의 대신 확인으로 낮춘다.
  // 예) "치료 목적이 아닙니다", "효과를 보장하지 않습니다"
  const NEGATION_RE = /(아닙니다|아니에요|아님|아니며|아니고|않습니다|않아요|않음|않으며|않고|하지 마세요|금지)/;
  function isNegated(text, end) {
    const tail = text.slice(end, end + 14).split(/[.!?\n。]/)[0];
    return NEGATION_RE.test(tail);
  }

  const EMOJI_RE = /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/u;
  const EMOJI_RE_G = /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/gu;

  function withPreset(preset, rules = DEFAULT_RULES) {
    const p = PRESETS[preset] || PRESETS.general;
    return Object.assign({}, rules, {
      preset: preset in PRESETS ? preset : 'general',
      bannedPhrases: rules.bannedPhrases.concat(p.banned),
      cautionPhrases: rules.cautionPhrases.concat(p.caution),
    });
  }

  function countChars(text) {
    // 공백·줄바꿈 포함 글자 수 (서로게이트 쌍은 1자로)
    return Array.from(String(text).replace(/\r\n/g, '\n')).length;
  }

  // text 안에서 needle이 나오는 모든 위치 [start, end) (UTF-16 인덱스)
  function findAll(text, needle) {
    const out = [];
    if (!needle) return out;
    let i = text.indexOf(needle);
    while (i !== -1) { out.push([i, i + needle.length]); i = text.indexOf(needle, i + needle.length); }
    return out;
  }

  function splitKeywords(raw) {
    return String(raw).split(/[,\n]/).map(s => s.trim()).filter(Boolean);
  }

  function checkKeywords(list, rules = DEFAULT_RULES) {
    const issues = [];
    const items = (Array.isArray(list) ? list : splitKeywords(list)).map(s => String(s).trim()).filter(Boolean);
    if (items.length > rules.keywordMax) {
      issues.push({ level: 'error', code: 'kw-count', msg: `대표키워드가 ${items.length}개입니다. 최대 ${rules.keywordMax}개.` });
    }
    const seen = new Set();
    const perKeyword = items.map(kw => {
      const own = [];
      if (seen.has(kw)) own.push({ level: 'warn', code: 'kw-dup', msg: `"${kw}" 중복` });
      seen.add(kw);
      for (const bad of rules.keywordBannedWords) {
        if (kw.includes(bad)) own.push({ level: 'error', code: 'kw-banned', msg: `"${kw}": "${bad}"는 대표키워드로 쓰지 말고 본문에서 쓰세요` });
      }
      if (EMOJI_RE.test(kw)) own.push({ level: 'error', code: 'kw-emoji', msg: `"${kw}": 이모지 사용 불가` });
      const badChars = new Set();
      for (const ch of Array.from(kw)) {
        const isWord = /[0-9A-Za-z가-힣\s]/.test(ch);
        if (!isWord && !rules.keywordAllowedSpecial.includes(ch) && !EMOJI_RE.test(ch)) badChars.add(ch);
      }
      for (const ch of badChars) own.push({ level: 'error', code: 'kw-char', msg: `"${kw}": 허용되지 않은 문자 "${ch}"` });
      issues.push(...own);
      return { keyword: kw, ok: !own.some(i => i.level === 'error'), issues: own };
    });
    return { count: items.length, keywords: perKeyword, issues };
  }

  function checkText(text, { maxChars, field = '본문' } = {}, rules = DEFAULT_RULES) {
    text = String(text);
    const issues = [];
    const marks = [];
    const n = countChars(text);
    if (maxChars && n > maxChars) issues.push({ level: 'error', code: 'too-long', msg: `${field} ${n}자 (공백 포함). 최대 ${maxChars}자, ${n - maxChars}자 초과.` });
    for (const d of rules.longDashes) {
      const hits = findAll(text, d);
      if (hits.length) {
        issues.push({ level: 'warn', code: 'long-dash', fixable: true, msg: `${field}: 긴 대시 "${d}" ${hits.length}곳 → "-" 권장` });
        hits.forEach(r => marks.push({ range: r, level: 'warn' }));
      }
    }
    const bannedHit = [];
    const negatedNotes = [];
    for (const p of rules.bannedPhrases) {
      const all = findAll(text, p);
      const hits = all.filter(([, e]) => !isNegated(text, e));
      if (all.length > hits.length) negatedNotes.push(p);
      if (hits.length) {
        bannedHit.push(p);
        issues.push({ level: 'error', code: 'banned', phrase: p, msg: `${field}: "${p}" 금지 표현 (보장·단정·오인 표현)` });
        hits.forEach(r => marks.push({ range: r, level: 'error' }));
      }
    }
    for (const p of rules.cautionPhrases) {
      const inBanned = ([s, e]) => rules.bannedPhrases.some(b => findAll(text, b).some(([bs, be]) => s >= bs && e <= be));
      const all = findAll(text, p).filter(r => !inBanned(r));
      const hits = all.filter(([, e]) => !isNegated(text, e));
      if (all.length > hits.length) negatedNotes.push(p);
      if (hits.length) {
        issues.push({ level: 'warn', code: 'caution', phrase: p, msg: `${field}: "${p}"는 근거·인증이 있을 때만 쓰세요` });
        hits.forEach(r => marks.push({ range: r, level: 'warn' }));
      }
    }
    for (const p of [...new Set(negatedNotes)]) {
      issues.push({ level: 'info', code: 'negated', phrase: p, msg: `${field}: "${p}"는 부정 문장으로 보여 제외했습니다. 문맥만 한 번 확인하세요` });
    }
    return { chars: n, issues, marks };
  }

  function checkDirections(text, rules = DEFAULT_RULES) {
    const r = checkText(text, { maxChars: rules.directionsMaxChars, field: '찾아오는길' }, rules);
    const parts = [['도보', /도보|걸어서|출구/], ['차량', /차량|자가용|자동차|운전/], ['내비게이션', /내비|네비|navi/i], ['주차', /주차/]];
    for (const [name, re] of parts) {
      if (!re.test(text)) r.issues.push({ level: 'info', code: 'dir-missing', msg: `찾아오는길에 "${name}" 안내가 없습니다.` });
    }
    return r;
  }

  // 대표키워드가 상세설명·찾아오는길에 몇 번 나오는지 (노출 판단은 하지 않고 숫자만)
  function keywordUsage(keywords, texts) {
    const list = Array.isArray(keywords) ? keywords : splitKeywords(keywords);
    return list.map(kw => ({ keyword: kw, counts: Object.fromEntries(Object.entries(texts).map(([k, t]) => [k, findAll(String(t), kw).length])) }));
  }

  // 한 줄에 키워드를 쉼표·#으로 줄줄이 쌓은 블록 감지 (본문에 자연스럽게 녹이는 것을 권장)
  function detectKeywordBlocks(text) {
    const lines = String(text).split(/\n/);
    const out = [];
    lines.forEach((line, i) => {
      const tags = (line.match(/#[^\s#]+/g) || []).length;
      const commaItems = line.split(/[,，]/).map(s => s.trim()).filter(Boolean);
      const shortItems = commaItems.filter(s => Array.from(s).length <= 12).length;
      if (tags >= 4 || (commaItems.length >= 5 && shortItems === commaItems.length)) out.push({ line: i + 1, text: line.trim() });
    });
    return out;
  }

  // 안전한 자동 수정: 긴 대시 → "-", 대표키워드의 이모지·허용 안 되는 문자 제거
  function autoFixText(text, rules = DEFAULT_RULES) {
    let t = String(text);
    for (const d of rules.longDashes) t = t.split(d).join('-');
    return t;
  }
  function autoFixKeywords(list, rules = DEFAULT_RULES) {
    const items = Array.isArray(list) ? list : splitKeywords(list);
    const out = [];
    for (const kw of items) {
      let k = kw.replace(EMOJI_RE_G, '').replace(/[·•ㆍ]/g, ' ');
      k = Array.from(k).filter(ch => /[0-9A-Za-z가-힣\s]/.test(ch) || rules.keywordAllowedSpecial.includes(ch)).join('');
      k = k.replace(/\s+/g, ' ').trim();
      if (k && !out.includes(k)) out.push(k);
    }
    return out;
  }

  function summarize(results) {
    const all = results.flatMap(r => r.issues || []);
    return { error: all.filter(i => i.level === 'error').length, warn: all.filter(i => i.level === 'warn').length, info: all.filter(i => i.level === 'info').length };
  }

  const DIRECTIONS_TEMPLATE = '도보: (가까운 역) ○번 출구에서 ○분\n차량: (주요 도로·랜드마크 기준) 진입 방법\n내비게이션: "(검색어)" 또는 (도로명 주소)\n주차: (위치) / (무료 시간·요금)';

  const api = { isNegated, DEFAULT_RULES, PRESETS, DIRECTIONS_TEMPLATE, withPreset, countChars, findAll, splitKeywords, checkKeywords, checkText, checkDirections, keywordUsage, detectKeywordBlocks, autoFixText, autoFixKeywords, summarize };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.PlaceCopyChecker = api;
})(typeof self !== 'undefined' ? self : this);
