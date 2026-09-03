import { load } from "cheerio";

export type SundayWebryEpisode = {
  sourceEpisodeKey: string;
  title: string;
  episodeLabel: string | null;
  episodeNumbers: number[];
  publishedAt: string;
  officialUrl: string;
  seriesTitle: string;
  authorName: string;
  isPromotional: boolean;
  isClosed: boolean;
};

const PROMOTIONAL_WORDS = /単行本|PR|キャンペーン|投票|お知らせ/i;
const EPISODE_NUMBER = /第\s*(\d+)\s*話/g;

export function parseSundayWebryEpisode(
  html: string,
  officialUrl: string,
): SundayWebryEpisode | null {
  const episodeId = officialUrl.match(/\/episode\/(\d+)/)?.[1];
  if (!episodeId) return null;

  const $ = load(html);
  const title = $(".episode-title").first().text().trim();
  if (!title || PROMOTIONAL_WORDS.test(title)) return null;

  const episodeNumbers = [...title.matchAll(EPISODE_NUMBER)].map((match) =>
    Number(match[1]),
  );
  const episodeLabel = episodeNumbers.length
    ? episodeNumbers.map((number) => `第${number}話`).join(" / ")
    : null;
  const publishedAt = $("time[datetime]").first().attr("datetime")?.trim() ?? "";

  return {
    sourceEpisodeKey: `sunday-webry:${episodeId}`,
    title,
    episodeLabel,
    episodeNumbers,
    publishedAt,
    officialUrl,
    seriesTitle: $(".series-title").first().text().trim(),
    authorName: $(".author-name").first().text().trim(),
    isPromotional: false,
    isClosed: $("main").text().includes("公開は終了しました"),
  };
}
