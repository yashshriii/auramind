import React from 'react';

interface FormattedMarkdownProps {
  content: string;
  className?: string;
}

export const FormattedMarkdown: React.FC<FormattedMarkdownProps> = ({ content, className = '' }) => {
  if (!content) return null;

  // Render inline formatting (**bold**, *italic*, `code`, [link](url))
  const renderFormattedInline = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`|\[.*?\]\(.*?\))/g);
    return parts.map((part, idx) => {
      if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
        return (
          <strong key={idx} className="font-semibold text-neutral-900 dark:text-neutral-100">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith('*') && part.endsWith('*') && !part.startsWith('**') && part.length >= 2) {
        return (
          <em key={idx} className="italic text-neutral-800 dark:text-neutral-200">
            {part.slice(1, -1)}
          </em>
        );
      }
      if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
        return (
          <code key={idx} className="px-1.5 py-0.5 rounded bg-neutral-200/70 dark:bg-neutral-800 font-mono text-[0.85em] text-neutral-900 dark:text-neutral-100">
            {part.slice(1, -1)}
          </code>
        );
      }
      if (part.startsWith('[') && part.includes('](') && part.endsWith(')')) {
        const match = part.match(/\[(.*?)\]\((.*?)\)/);
        if (match) {
          const [, label, url] = match;
          return (
            <a
              key={idx}
              href={url}
              onClick={(e) => {
                if (url === '#about' || url.includes('about')) {
                  e.preventDefault();
                  window.dispatchEvent(new CustomEvent('open-about-modal'));
                }
              }}
              className="text-neutral-900 dark:text-neutral-100 underline decoration-neutral-400 dark:decoration-neutral-600 underline-offset-3 hover:decoration-neutral-900 dark:hover:decoration-neutral-100 font-medium transition-colors cursor-pointer"
            >
              {label}
            </a>
          );
        }
      }
      return part;
    });
  };

  const lines = content.split('\n');
  const blocks: React.ReactNode[] = [];

  let i = 0;
  while (i < lines.length) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    // Empty space
    if (!trimmed) {
      blocks.push(<div key={`space-${i}`} className="h-1" />);
      i++;
      continue;
    }

    // Ignore raw ASCII box border lines like `+--------------------+` or `+===+`
    if (/^\+[-+=]+\+$/.test(trimmed) || /^[-+=]{5,}$/.test(trimmed)) {
      i++;
      continue;
    }

    // Handle Table Rows (lines that start with '|' and end with '|')
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      const tableRows: string[] = [];
      while (i < lines.length) {
        const tLine = lines[i].trim();
        // Skip interior ASCII divider lines inside tables
        if (/^\+[-+=]+\+$/.test(tLine) || /^[-+=]{5,}$/.test(tLine)) {
          i++;
          continue;
        }
        if (tLine.startsWith('|') && tLine.endsWith('|')) {
          tableRows.push(tLine);
          i++;
        } else {
          break;
        }
      }

      if (tableRows.length > 0) {
        const parsedRows = tableRows
          .filter((r) => !/^\|[\s\-:|]+\|$/.test(r)) // remove header separator row |---|---|
          .map((r) => {
            const inner = r.slice(1, -1);
            return inner.split('|').map((cell) => cell.trim());
          });

        if (parsedRows.length > 0) {
          const hasHeader = tableRows.some((r) => /^\|[\s\-:|]+\|$/.test(r));
          const headerRow = hasHeader ? parsedRows[0] : null;
          const bodyRows = hasHeader ? parsedRows.slice(1) : parsedRows;

          blocks.push(
            <div
              key={`table-${i}`}
              className="my-3 overflow-x-auto rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-xs bg-white/70 dark:bg-[#1a1a1e]/80 backdrop-blur-xs"
            >
              <table className="w-full text-left text-xs sm:text-sm border-collapse">
                {headerRow && (
                  <thead>
                    <tr className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-100/90 dark:bg-neutral-800/90 font-semibold text-neutral-900 dark:text-neutral-100">
                      {headerRow.map((col, cIdx) => (
                        <th key={cIdx} className="px-3.5 py-2.5 font-mono text-[11px] uppercase tracking-wider">
                          {renderFormattedInline(col)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                )}
                <tbody className="divide-y divide-neutral-200/60 dark:divide-neutral-800/60">
                  {bodyRows.map((r, rIdx) => (
                    <tr key={rIdx} className="hover:bg-neutral-500/5 transition-colors">
                      {r.map((cell, cIdx) => (
                        <td key={cIdx} className="px-3.5 py-2.5 text-neutral-800 dark:text-neutral-200 leading-relaxed font-sans">
                          {renderFormattedInline(cell)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
          continue;
        }
      }
    }

    // Horizontal Rule
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
      blocks.push(<hr key={`hr-${i}`} className="my-4 border-neutral-200 dark:border-neutral-800/80" />);
      i++;
      continue;
    }

    // Heading 1
    if (trimmed.startsWith('# ')) {
      blocks.push(
        <h1 key={`h1-${i}`} className="text-lg sm:text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 mt-5 mb-2 pb-1 border-b border-neutral-200 dark:border-neutral-800">
          {renderFormattedInline(trimmed.replace(/^#\s+/, ''))}
        </h1>
      );
      i++;
      continue;
    }

    // Heading 2
    if (trimmed.startsWith('## ')) {
      blocks.push(
        <h2 key={`h2-${i}`} className="text-base sm:text-lg font-bold tracking-tight text-neutral-900 dark:text-neutral-100 mt-4 mb-1.5">
          {renderFormattedInline(trimmed.replace(/^##\s+/, ''))}
        </h2>
      );
      i++;
      continue;
    }

    // Heading 3
    if (trimmed.startsWith('### ')) {
      blocks.push(
        <h3 key={`h3-${i}`} className="text-sm sm:text-base font-bold text-neutral-900 dark:text-neutral-100 mt-3 mb-1">
          {renderFormattedInline(trimmed.replace(/^###\s+/, ''))}
        </h3>
      );
      i++;
      continue;
    }

    // Heading 4
    if (trimmed.startsWith('#### ')) {
      blocks.push(
        <h4 key={`h4-${i}`} className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mt-2.5 mb-1">
          {renderFormattedInline(trimmed.replace(/^####\s+/, ''))}
        </h4>
      );
      i++;
      continue;
    }

    // Blockquote
    if (trimmed.startsWith('> ')) {
      blocks.push(
        <blockquote key={`bq-${i}`} className="border-l-2 border-neutral-400 dark:border-neutral-600 pl-3 my-2 text-neutral-600 dark:text-neutral-400 italic">
          {renderFormattedInline(trimmed.replace(/^>\s+/, ''))}
        </blockquote>
      );
      i++;
      continue;
    }

    // Bullet list item
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      blocks.push(
        <div key={`li-${i}`} className="flex items-start gap-2.5 pl-1 my-1">
          <span className="w-1.5 h-1.5 rounded-full bg-neutral-600 dark:bg-neutral-400 mt-2 shrink-0 opacity-80" />
          <div className="flex-1 text-xs sm:text-sm text-neutral-800 dark:text-neutral-200 leading-relaxed">
            {renderFormattedInline(trimmed.replace(/^[-*]\s+/, ''))}
          </div>
        </div>
      );
      i++;
      continue;
    }

    // Numbered list item
    const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
    if (numMatch) {
      blocks.push(
        <div key={`num-${i}`} className="flex items-start gap-2 pl-1 my-1">
          <span className="font-mono text-neutral-600 dark:text-neutral-400 font-semibold shrink-0 text-xs mt-0.5">{numMatch[1]}.</span>
          <div className="flex-1 text-xs sm:text-sm text-neutral-800 dark:text-neutral-200 leading-relaxed">
            {renderFormattedInline(numMatch[2])}
          </div>
        </div>
      );
      i++;
      continue;
    }

    // Regular paragraph
    blocks.push(
      <p key={`p-${i}`} className="text-xs sm:text-sm text-neutral-800 dark:text-neutral-200 leading-relaxed">
        {renderFormattedInline(trimmed)}
      </p>
    );
    i++;
  }

  return (
    <div className={`space-y-2.5 leading-relaxed text-neutral-800 dark:text-neutral-200 font-sans ${className}`}>
      {blocks}
    </div>
  );
};
