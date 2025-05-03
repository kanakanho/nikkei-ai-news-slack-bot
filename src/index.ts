import { Hono } from "hono";
import type { Context } from "hono";
import type { BlankInput } from "hono/types";
import NotificationSlackBot from "./NotificationSlackBot";

export type Bindings = {
  SLACK_WEBHOOK_URL: string;
  NIKKEI_NEWS_URL: string;
};

export type C = Context<
  {
    Bindings: Bindings;
  },
  "/api/v1/news",
  BlankInput
>;

const app = new Hono<{ Bindings: Bindings }>();

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

app.get("/api/v1/news", async (c) => {
  const isSuccess = await NotificationSlackBot({
    SLACK_WEBHOOK_URL: c.env.SLACK_WEBHOOK_URL,
    NIKKEI_NEWS_URL: c.env.NIKKEI_NEWS_URL,
  });

  if (!isSuccess) {
    return c.json({ message: "Error sending message to Slack" }, 500);
  }
  return c.json({ message: "Message sent to Slack successfully" });
});

const scheduled = async (event: ScheduledEvent, env: Bindings) => {
  const isSuccess = await NotificationSlackBot({
    SLACK_WEBHOOK_URL: env.SLACK_WEBHOOK_URL,
    NIKKEI_NEWS_URL: env.NIKKEI_NEWS_URL,
  });

  if (!isSuccess) {
    console.error("Error sending message to Slack");
  } else {
    console.log("Message sent to Slack successfully");
  }
};

export default {
  fetch: app.fetch,
  scheduled,
};
