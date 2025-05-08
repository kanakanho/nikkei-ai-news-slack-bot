import { parse } from "node-html-parser";

type AttentionNewsAttribute = {
  title: string;
  href: string;
};

export default async function FetechAttentionNewsAttribute(nikkeiNewsUrl: string): Promise<AttentionNewsAttribute[]> {
  try {
    const response = await fetch(`${nikkeiNewsUrl}/topics/1ZCZ6300`);
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const res = await response.text();
    const root = parse(res);

    const newsList = root.querySelectorAll(".default_d1sacw3a");

    if (newsList.length === 0) {
      console.error("No news items found");
      return [];
    }

    // newsList.firstElementChild が div の場合は無視する
    const latestNewsList = newsList.filter((news) => {
      const firstChild = news.firstElementChild;
      if (firstChild && firstChild.tagName === "DIV") {
        return false;
      }
      return true;
    });

    // 前5件を取得
    latestNewsList.splice(5);

    const attentionNewsAttributes = latestNewsList
      .map((news) => {
        // .defaultCard_ddwn7el の fristChild の aタグから href を取得
        const aTag = news.querySelector(".defaultCard_ddwn7el")?.firstElementChild?.getElementsByTagName("a")[0];
        if (!aTag) {
          console.error("No a tag found");
          return { title: "No title found", href: "" };
        }
        // href 属性を取得
        const href = aTag?.getAttribute("href");
        if (!href) {
          console.error("No href found");
          return { title: "No title found", href: "" };
        }
        const title = aTag?.textContent;
        if (!title) {
          console.error("No title found");
          return { title: "No title found", href: "" };
        }
        return { title, href };
      })
      .filter((title) => title.title !== "No title found" && title.href !== "");

    return attentionNewsAttributes;
  } catch (error) {
    console.error("There was a problem with the fetch operation:", error);
    return [];
  }
}
