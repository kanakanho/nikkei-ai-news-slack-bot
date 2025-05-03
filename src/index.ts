import { Hono } from "hono";
import FetechLatesetNewsAttribute from "./FetechLatesetNewsAttribute";
import FetechLatesetNewsURL from "./FetechLatesetNewsURL";

type Bindings = {
  SLACK_WEBHOOK_URL: string;
  NIKKEI_NEWS_URL: string;
};

const app = new Hono<{ Bindings: Bindings }>();

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

app.get("/api/v1/news", async (c) => {
  const slackWebhookUrl = c.env.SLACK_WEBHOOK_URL;
  const nikkeiNewsUrl = c.env.NIKKEI_NEWS_URL;
  const resNewsURL = await FetechLatesetNewsURL(nikkeiNewsUrl)
    .then((url) => {
      console.log(`${nikkeiNewsUrl}${url}`);
      return `${nikkeiNewsUrl}${url}`;
    })
    .catch((error) => {
      console.error("Error fetching news:", error);
      return "";
    });

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

  const _ = await fetch(slackWebhookUrl, {
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

  if (!_) {
    return c.json({ message: "Error sending message to Slack" }, 500);
  }
  return c.json({ message: "Message sent to Slack successfully" });
});

export default app;
