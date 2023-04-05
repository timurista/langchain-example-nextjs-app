import { CallbackManager } from "langchain/callbacks";
import { ChatOpenAI } from "langchain/chat_models";
import { HumanChatMessage } from "langchain/schema";

// Expects an OpenAI API key to be set in the env variable OPENAI_API_KEY
const AiModel = process.env.OPENAI_MODEL || "gpt-3.5-turbo";
const StreamMode = process.env.OPENAI_STREAM_MODE || false;

// A class which will stream responses back to the client

export default async function handler(req, res) {


    const chat = new ChatOpenAI({
        maxConcurrency: 5, maxTokens: 25, streaming: true, timeout: 5000,
        maxRetries: 10,
        callbackManager: CallbackManager.fromHandlers({
        async handleLLMNewToken(token) {
          console.log("TOKEN", token);
          res.setHeader('Content-Type', 'text/event-stream');
          res.setHeader('Cache-Control', 'no-cache');
          res.setHeader('Connection', 'keep-alive');
          res.setHeader('Access-Control-Allow-Origin', '*');

          res.write(`data: ${JSON.stringify(token)}\n\n`);
        },
      }), });
    chat.modelName = AiModel;

    console.log("using model", chat.modelName);

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');

    try {
        console.log("calling chat");

        const response = await chat.call([new HumanChatMessage(req.body.question)]);
        console.log('response', response);
        res.status(200).json(response);
      } catch (error) {
        console.error('Error occurred while streaming tokens:', error);
        res.status(500).json({ error: 'Error occurred while streaming tokens' });
      } finally {
        console.log("closing");
      res.end();
    }
}
