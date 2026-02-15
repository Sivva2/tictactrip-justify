/*
  Counts the number of words in a text string.
 */
export function countWords(text: string): number {
  const trimmed = text.trim();
  if (trimmed.length === 0) return 0;
  return trimmed.split(/\s+/).length;
}

/*
  Justifies a single line by distributing spaces evenly between words.
 
 */
function justifyLine(words: string[], maxWidth: number): string {
  if (words.length === 1) {
    return words[0];
  }

  const totalChars = words.reduce((sum, word) => sum + word.length, 0);
  const totalSpaces = maxWidth - totalChars;
  const gaps = words.length - 1;
  const baseSpaces = Math.floor(totalSpaces / gaps);
  const extraSpaces = totalSpaces % gaps;

  let line = "";
  for (let i = 0; i < words.length; i++) {
    line += words[i];
    if (i < gaps) {
      const spaces = baseSpaces + (i < extraSpaces ? 1 : 0);
      line += " ".repeat(spaces);
    }
  }

  return line;
}

/*
  Splits words into lines using a "greedy algorithm".
  Each line contains as many words as possible without exceeding maxWidth.
 */
function buildLines(words: string[], maxWidth: number): string[][] {
  const lines: string[][] = [];
  let currentLine: string[] = [];
  let currentLength = 0;

  for (const word of words) {
    const wouldBe =
      currentLength + (currentLine.length > 0 ? 1 : 0) + word.length;

    if (currentLine.length > 0 && wouldBe > maxWidth) {
      lines.push(currentLine);
      currentLine = [word];
      currentLength = word.length;
    } else {
      currentLine.push(word);
      currentLength += (currentLine.length > 1 ? 1 : 0) + word.length;
    }
  }

  if (currentLine.length > 0) {
    lines.push(currentLine);
  }

  return lines;
}

/*
  Justifies a single paragraph of text.
  The last line is left-aligned
 */
function justifyParagraph(paragraph: string, maxWidth: number): string {
  const words = paragraph.split(/\s+/).filter((w) => w.length > 0);

  if (words.length === 0) return "";

  const lines = buildLines(words, maxWidth);
  const justifiedLines: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const isLastLine = i === lines.length - 1;

    if (isLastLine || lines[i].length === 1) {
      justifiedLines.push(lines[i].join(" "));
    } else {
      justifiedLines.push(justifyLine(lines[i], maxWidth));
    }
  }

  return justifiedLines.join("\n");
}

/**
 * Main justification function.
 * Handles multiple paragraphs separated by empty lines.
 */
export function justify(text: string, maxWidth: number = 80): string {
  const normalized = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const paragraphs = normalized.split(/\n\s*\n/);

  const justifiedParagraphs = paragraphs.map((p) => {
    const trimmed = p.trim();
    if (trimmed.length === 0) return "";
    return justifyParagraph(trimmed, maxWidth);
  });

  return justifiedParagraphs.join("\n\n");
}
