import FetechAttentionNewsAttribute from "./FetechAttentionNewsAttribute";
import type { Bindings } from "./index";

export default async function NotificationSlackBot(bindings: Bindings): Promise<boolean> {
  console.log(bindings.NIKKEI_NEWS_URL);

  const slackWebhookUrl = bindings.SLACK_WEBHOOK_URL;
  const nikkeiNewsUrl = bindings.NIKKEI_NEWS_URL;

  const resAttentionNewsAttribute = await FetechAttentionNewsAttribute(nikkeiNewsUrl);

  const fields = resAttentionNewsAttribute.map((news) => {
    return {
      title: news.title,
      value: `${nikkeiNewsUrl}${news.href}`,
      short: false,
    };
  });


  // text に所定のフォーマットで日時を入れる
  // `${month}月${day}日 ${hour} の注目ニュース`
  const date = new Date();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = date.getHours() + 9;
  const title = `*${month}月${day}日 ${hour}時の注目ニュース*`;

  const res = await fetch(slackWebhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text: title,
      attachments: [
        {
          fields,
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
