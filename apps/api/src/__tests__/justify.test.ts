import { justify, countWords } from "../utils/justify";

describe("countWords", () => {
  it("should count words correctly", () => {
    expect(countWords("hello world")).toBe(2);
    expect(countWords("one")).toBe(1);
    expect(countWords("  spaces   between   words  ")).toBe(3);
  });

  it("should return 0 for empty or whitespace-only strings", () => {
    expect(countWords("")).toBe(0);
    expect(countWords("   ")).toBe(0);
    expect(countWords("\n\n")).toBe(0);
  });

  it("should handle text with various whitespace", () => {
    expect(countWords("hello\nworld\tfoo")).toBe(3);
  });
});

describe("justify", () => {
  const WIDTH = 80;

  it("should return empty string for empty input", () => {
    expect(justify("", WIDTH)).toBe("");
  });

  it("should not modify a single word", () => {
    expect(justify("hello", WIDTH)).toBe("hello");
  });

  it("should justify lines to exactly 80 characters", () => {
    const input =
      "Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua";
    const result = justify(input, WIDTH);
    const lines = result.split("\n");

    for (let i = 0; i < lines.length - 1; i++) {
      expect(lines[i].length).toBe(WIDTH);
    }

    expect(lines[lines.length - 1].length).toBeLessThanOrEqual(WIDTH);
  });

  it("should preserve paragraph breaks", () => {
    const input =
      "First paragraph with some words here.\n\nSecond paragraph with different words.";
    const result = justify(input, WIDTH);
    expect(result).toContain("\n\n");
  });

  it("should left-align the last line of each paragraph", () => {
    const input =
      "The quick brown fox jumps over the lazy dog and then continues running through the forest to find food";
    const result = justify(input, WIDTH);
    const lines = result.split("\n");
    const lastLine = lines[lines.length - 1];

    expect(lastLine).not.toMatch(/\S {2,}\S/);
  });

  it("should handle a single word longer than maxWidth", () => {
    const longWord = "a".repeat(100);
    const result = justify(longWord, WIDTH);
    expect(result).toBe(longWord);
  });

  it("should handle windows-style line endings", () => {
    const input = "First paragraph.\r\n\r\nSecond paragraph.";
    const result = justify(input, WIDTH);
    expect(result).toContain("\n\n");
    expect(result).not.toContain("\r");
  });

  it("should handle text that fits in a single line", () => {
    expect(justify("Short text.", WIDTH)).toBe("Short text.");
  });

  it("should produce consistent output for the same input", () => {
    const input =
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.";
    const result1 = justify(input, WIDTH);
    const result2 = justify(input, WIDTH);
    expect(result1).toBe(result2);
  });
});
