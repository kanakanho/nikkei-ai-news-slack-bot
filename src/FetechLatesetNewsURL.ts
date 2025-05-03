import { parse } from "node-html-parser";

export default async function FetechLatesetNewsURL(nikkeiNewsUrl: string): Promise<string> {
  try {
    const response = await fetch(`${nikkeiNewsUrl}/topics/19102801`);
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const res = await response.text();
    const root = parse(res);

    const newsList = root
      .querySelectorAll(".textArea_t1fwm3c8")
      .filter((news) => news.textContent.includes("AIニュース"));

    if (newsList.length === 0) {
      console.error("No AIニュース found");
      return "";
    }

    const href = newsList[0].firstElementChild?.getAttribute("href");
    if (!href) {
      console.error("No href found for the first AIニュース");
      return "";
    }

    return href;
  } catch (error) {
    console.error("There was a problem with the fetch operation:", error);
    return "";
  }
}
