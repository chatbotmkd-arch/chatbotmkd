import { Chatbot } from "../models/Chatbot";
import { Types } from "mongoose";

export class WidgetService {
  static async getConfig(chatbotId: string) {
    const chatbot = await Chatbot.findOne({
      _id: new Types.ObjectId(chatbotId),
      status: "active",
    }).select("appearance config.language name");

    if (!chatbot) return null;

    return {
      chatbotId: chatbot._id,
      name: chatbot.name,
      language: chatbot.config.language,
      appearance: chatbot.appearance,
    };
  }

  static generateEmbedCode(chatbotId: string, apiBase: string): string {
    return `<script>
  (function() {
    var s = document.createElement('script');
    s.src = '${apiBase}/widget.js';
    s.setAttribute('data-chatbot-id', '${chatbotId}');
    s.async = true;
    document.head.appendChild(s);
  })();
</script>`;
  }
}
