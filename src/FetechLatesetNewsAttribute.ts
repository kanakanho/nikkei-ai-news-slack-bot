import { parse } from "node-html-parser";

type NewsAttribute = {
  title: string;
  articles: {
    title: string;
  }[];
  imageUrl: string;
};

export default async function FetechLatesetNewsAttribute(newsURL: string): Promise<NewsAttribute> {
  try {
    const response = await fetch(newsURL);
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const res = await response.text();
    const root = parse(res);

    // Extract the title, date, and image URL
    const head = root.getElementsByTagName("head")[0];
    const titleElement = head.querySelector("title");
    const title = titleElement ? titleElement.textContent : "No title found";
    // og:image から画像URLを取得
    const ogImageElement = head.querySelector("meta[property='og:image']");
    const imageUrl = ogImageElement
      ? (ogImageElement.getAttribute("content") ?? "No image found")
      : "No image found";
    // Extract articles and ensure they match the expected structure
    const articles = root.querySelectorAll(".overrideStyle_o1ee5p6o").map((article) => {
      const titleElement = article.querySelector("a");
      const title = titleElement ? titleElement.textContent : "No title found";
      return { title }; // Return an object with a title property
    });

    return { title, articles, imageUrl };
  } catch (error) {
    console.error("There was a problem with the fetch operation:", error);
    throw error;
  }
}
