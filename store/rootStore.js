// store/rootStore.js
import ConversationStore from './conversationStore';

class RootStore {
  constructor() {
    this.conversationStore = new ConversationStore(this);
  }
}

export default RootStore;