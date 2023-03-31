import { ChatOpenAI } from "langchain/chat_models";

// Expects an OpenAI API key to be set in the env variable OPENAI_API_KEY
const model = new ChatOpenAI({ temperature: 0.9 });