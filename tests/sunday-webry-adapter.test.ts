import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { parseSundayWebryEpisode } from "../src/adapters/sunday-webry.js";

async function fixture(name: string): Promise<string> {
  return readFile(resolve("tests/fixtures/sunday-webry", `${name}.html`), "utf8");
}

describe("parseSundayWebryEpisode", () => {
  it("parses a normal episode", async () => {
    const result = parseSundayWebryEpisode(
      await fixture("normal"),
      "https://www.sunday-webry.com/episode/12207421984160920209",
    );

    expect(result).toEqual({
      sourceEpisodeKey: "sunday-webry:12207421984160920209",
      title: "第42話 あれもよう",
      episodeLabel: "第42話",
      episodeNumbers: [42],
      publishedAt: "2026-08-31",
      officialUrl: "https://www.sunday-webry.com/episode/12207421984160920209",
      seriesTitle: "ふたりバス",
      authorName: "豊林サカネ",
      isPromotional: false,
      isClosed: false,
    });
  });

  it("keeps combined episode labels and extracts all episode numbers", async () => {
    const result = parseSundayWebryEpisode(
      await fixture("combined"),
      "https://www.sunday-webry.com/episode/2551460909779976003",
    );

    expect(result?.episodeLabel).toBe("第1話 / 第2話 / 第3話");
    expect(result?.episodeNumbers).toEqual([1, 2, 3]);
  });

  it("preserves closed episodes as non-promotional records", async () => {
    const result = parseSundayWebryEpisode(
      await fixture("closed"),
      "https://www.sunday-webry.com/episode/12207421984068363548",
    );

    expect(result?.isClosed).toBe(true);
    expect(result?.isPromotional).toBe(false);
  });

  it("excludes book promotion pages", async () => {
    const result = parseSundayWebryEpisode(
      await fixture("promo"),
      "https://www.sunday-webry.com/episode/12207421983399374698",
    );

    expect(result).toBeNull();
  });
});
