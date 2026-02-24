interface LetterDisplayProps {
  content: string;
}

const GREETING_PREFIXES = [
  // Chinese
  '亲爱的', '最亲爱的', '挚爱的', '宝贝', '我最爱的', '我的', '致',
  '亲', '心爱的', '想念的',
  // English fallback
  'dear', 'my', 'to', 'dearest', 'beloved', 'darling',
];

const CLOSING_KEYWORDS = [
  // Chinese
  '爱你的', '永远爱你的', '永远爱你', '你的', '想你的', '深爱你的',
  '此致', '敬上', '爱你', '挚爱', '永远的', '思念你的',
  '最爱你的', '你永远的', '深深爱你的',
  // English fallback
  'love,', 'yours,', 'forever,', 'always,', 'with love,',
];

const PS_PREFIXES = ['附言', '附：', 'p.s.', 'ps.', 'ps:', 'p.s'];

function parseLetterContent(content: string) {
  const lines = content.split('\n');
  let greeting = '';
  let bodyLines: string[] = [];
  let closingLines: string[] = [];
  let psLines: string[] = [];

  // Find greeting (first non-empty line if it matches a greeting prefix)
  let startIdx = 0;
  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    if (trimmed) {
      const lower = trimmed.toLowerCase();
      if (GREETING_PREFIXES.some((prefix) => lower.startsWith(prefix.toLowerCase()) || trimmed.startsWith(prefix))) {
        greeting = trimmed;
        startIdx = i + 1;
      }
      break;
    }
    startIdx = i + 1;
  }

  // Find P.S. / 附言 section (from the end)
  const remainingLines = lines.slice(startIdx);
  let psStartIdx = -1;
  for (let i = remainingLines.length - 1; i >= 0; i--) {
    const trimmed = remainingLines[i].trim();
    const lower = trimmed.toLowerCase();
    if (PS_PREFIXES.some((prefix) => lower.startsWith(prefix) || trimmed.startsWith(prefix))) {
      psStartIdx = i;
      break;
    }
    if (trimmed && !PS_PREFIXES.some((prefix) => lower.startsWith(prefix) || trimmed.startsWith(prefix))) {
      break;
    }
  }

  const beforePs = psStartIdx >= 0 ? remainingLines.slice(0, psStartIdx) : remainingLines;
  if (psStartIdx >= 0) {
    psLines = remainingLines.slice(psStartIdx);
  }

  // Find closing (scan from end of beforePs for closing keywords)
  let closingStartIdx = -1;
  for (let i = beforePs.length - 1; i >= 0; i--) {
    const trimmed = beforePs[i].trim();
    const lower = trimmed.toLowerCase();
    if (CLOSING_KEYWORDS.some((kw) => lower.startsWith(kw.toLowerCase()) || trimmed.startsWith(kw))) {
      closingStartIdx = i;
      break;
    }
    // Non-empty line that isn't a closing keyword — might be name/signature after closing
    if (trimmed && closingStartIdx === -1) {
      closingLines.unshift(trimmed);
      continue;
    }
    if (trimmed) {
      break;
    }
  }

  if (closingStartIdx >= 0) {
    bodyLines = beforePs.slice(0, closingStartIdx);
    closingLines = beforePs.slice(closingStartIdx);
  } else {
    bodyLines = beforePs;
    closingLines = [];
  }

  // Build body paragraphs (split by empty lines)
  const bodyText = bodyLines.join('\n').trim();
  const paragraphs = bodyText
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  return {
    greeting,
    paragraphs,
    closing: closingLines.map((l) => l.trim()).filter(Boolean).join('\n'),
    ps: psLines.map((l) => l.trim()).filter(Boolean).join('\n'),
  };
}

function parseDateLine(line: string): string {
  const match = line.trim().match(/^(\d{4})(\d{2})(\d{2})$/);
  if (match) {
    const year = parseInt(match[1], 10);
    const month = parseInt(match[2], 10);
    const day = parseInt(match[3], 10);
    return `${year}年${month}月${day}日`;
  }
  return line.trim();
}

export function LetterDisplay({ content }: LetterDisplayProps) {
  const allLines = content.split('\n');

  // First line = date (yyyyMMdd format)
  let dateStr = '';
  let startLine = 0;
  for (let i = 0; i < allLines.length; i++) {
    const trimmed = allLines[i].trim();
    if (trimmed) {
      dateStr = parseDateLine(trimmed);
      startLine = i + 1;
      break;
    }
    startLine = i + 1;
  }

  // Last non-empty line = seal character
  let sealChar = '爱';
  let endLine = allLines.length;
  for (let i = allLines.length - 1; i >= startLine; i--) {
    const trimmed = allLines[i].trim();
    if (trimmed) {
      sealChar = trimmed;
      endLine = i;
      break;
    }
  }

  const contentForParsing = allLines.slice(startLine, endLine).join('\n');
  const { greeting, paragraphs, closing, ps } = parseLetterContent(contentForParsing);

  return (
    <div className="letter-paper">
      <div className="letter-date">{dateStr}</div>

      {greeting && <div className="letter-greeting">{greeting}</div>}

      <div className="letter-body">
        {paragraphs.map((paragraph, i) => (
          <p key={i}>{paragraph}</p>
        ))}
      </div>

      {closing && (
        <>
          <hr className="letter-flourish" />
          <div className="letter-closing">
            {closing.split('\n').map((line, i) => (
              <div key={i}>{line}</div>
            ))}
          </div>
        </>
      )}

      {ps && <div className="letter-ps">{ps}</div>}

      <div className="letter-seal">{sealChar}</div>
    </div>
  );
}
