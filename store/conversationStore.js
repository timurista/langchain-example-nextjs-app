// store/conversationStore.js
import { makeAutoObservable } from 'mobx';

class ConversationStore {
  userInput = '';
  history = [];
  loading = false;
  messages = [
    {
      message: 'Hi there! How can I help?',
      type: 'apiMessage',
    },
  ];
  root = null;


  constructor(root) {
    makeAutoObservable(this);
    this.root = root;
  }

  setUserInput(input) {
    this.userInput = input;
  }

  setLoading(loading) {
    this.loading = loading;
  }

  setMessages(messages) {
    this.messages = messages;
  }

  addMessage(message) {
    this.messages.push(message);
  }

  setHistory(history) {
    this.history = history;
  }
}

export default ConversationStore;