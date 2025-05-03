import FetechLatesetNewsAttribute from "./FetechLatesetNewsAttribute";
import FetechLatesetNewsURL from "./FetechLatesetNewsURL";
import type { Bindings } from "./index";

export default async function NotificationSlackBot(bindings: Bindings): Promise<boolean> {
  console.log(bindings.NIKKEI_NEWS_URL);

  const slackWebhookUrl = bindings.SLACK_WEBHOOK_URL;
  const nikkeiNewsUrl = bindings.NIKKEI_NEWS_URL;
  const resNewsURL = await FetechLatesetNewsURL(nikkeiNewsUrl)
    .then((url) => {
      console.log(`${nikkeiNewsUrl}${url}`);
      return `${nikkeiNewsUrl}${url}`;
    })
    .catch((error) => {
      console.error("Error fetching news:", error);
      return "";
    });

  console.log("resNewsURL", resNewsURL);

  const resNewsAttribute = await FetechLatesetNewsAttribute(resNewsURL)
    .then((attribute) => {
      return attribute;
    })
    .catch((error) => {
      console.error("Error fetching news attribute:", error);
      return {
        title: "No title found",
        articles: [{ title: "No articles found" }],
        imageUrl: "No image found",
      };
    });

  const value = resNewsAttribute.articles
    .map((article) => {
      return `・ ${article.title}`;
    })
    .join("\n");

  const res = await fetch(slackWebhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text: "",
      attachments: [
        {
          fields: [
            {
              title: resNewsAttribute.title,
              value: `${value}\n${resNewsURL}`,
            },
          ],
          image_url: resNewsAttribute.imageUrl,
        },
      ],
    }),
  }).catch((error) => {
    console.error("Error sending message to Slack:", error);
  });

  if (!res) {
    return false;
  }
  return true;
}
