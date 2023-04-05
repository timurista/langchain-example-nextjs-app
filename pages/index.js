import { useRef, useEffect, useState, useContext } from 'react';
import { observer } from 'mobx-react-lite';
import { StoreContext } from 'mobx-react-lite';
import Head from 'next/head';
import styles from '../styles/Home.module.css';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import CircularProgress from '@mui/material/CircularProgress';
import {useStore} from '../store/rootProvider';

const Home = observer(() => {
  const { conversationStore } = useStore();
  const messageListRef = useRef(null);
  const textAreaRef = useRef(null);
  const [streamedMessage, setStreamedMessage] = useState('');

  // Auto scroll chat to bottom
  useEffect(() => {
    const messageList = messageListRef.current;
    messageList.scrollTop = messageList.scrollHeight;
  }, [conversationStore.messages]);

  // Focus on text field on load
  useEffect(() => {
    textAreaRef.current.focus();
  }, []);

  useEffect(() => {
    const source = new EventSource('/api/chat');

    source.onmessage = function (event) {
      const token = JSON.parse(event.data);
      console.log('Received token from server:', token);
      setStreamedMessage((prevStreamedMessage) => prevStreamedMessage + token.text);
    };

    source.onerror = function (error) {
      console.error('Error occurred while streaming tokens:', error);
      source.close();
    };

    return () => {
      source.close();
    };
  }, []);

  // Handle errors
  const handleError = () => {
    conversationStore.addMessage({
      message: 'Oops! There seems to be an error. Please try again.',
      type: 'apiMessage',
    });
    conversationStore.setLoading(false);
    conversationStore.setUserInput('');
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (conversationStore.userInput.trim() === '') {
      return;
    }

    conversationStore.setLoading(true);
    conversationStore.addMessage({
      message: conversationStore.userInput,
      type: 'userMessage',
    });

    // Send user question and history to API
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        question: conversationStore.userInput,
        history: conversationStore.history,
      }),
    });

    if (!response.ok) {
      handleError();
      return;
    }

    // Reset user input
    conversationStore.setUserInput('');
    const data = await response.json();

    if (data.result.error === 'Unauthorized') {
      handleError();
      return;
    }

    conversationStore.addMessage({
      message: data.result.success,
      type: 'apiMessage',
    });
    conversationStore.setLoading(false);
  };

  // Prevent blank submissions and allow for multiline input
  const handleEnter = async (e) => {
    if (e.key === 'Enter' && conversationStore.userInput) {
      if (!e.shiftKey && conversationStore.userInput) {
        handleSubmit(e);
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
    }
  };

  useEffect(() => {
    if (streamedMessage) {
      const lastMessageIndex = conversationStore.messages.length - 1;
      conversationStore.updateMessage(lastMessageIndex, {
        message: streamedMessage,
        type: 'apiMessage',
      });
      setStreamedMessage('');
    }
  }, [streamedMessage]);

  // Keep history in sync with messages
  useEffect(() => {
    if (conversationStore.messages.length >= 3) {
      conversationStore.setHistory([
        [
          conversationStore.messages[conversationStore.messages.length - 2]
            .message,
          conversationStore.messages[conversationStore.messages.length - 1]
            .message,
        ],
      ]);
    }
  }, [conversationStore.messages]);

  return (
    <>
      <Head>
        <title>LangChain Chat</title>
        <meta name="description" content="LangChain documentation chatbot" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={styles.topnav}>
        <div className={styles.navlogo}>
          <a href="/">LangChain</a>
        </div>
        <div className={styles.navlinks}>
          <a
            href="https://langchain.readthedocs.io/en/latest/"
            target="_blank"

            >
            Docs
          </a>
          <a
            href="https://github.com/zahidkhawaja/langchain-chat-nextjs"
            target="_blank"
          >
            GitHub
          </a>
        </div>
      </div>
      <main className={styles.main}>
        <div className={styles.cloud}>
          <div ref={messageListRef} className={styles.messagelist}>
            {conversationStore.messages.map((message, index) => {
              return (
                <div
                  key={index}
                  className={
                    message.type === 'userMessage' &&
                    conversationStore.loading &&
                    index === conversationStore.messages.length - 1
                      ? styles.usermessagewaiting
                      : message.type === 'apiMessage'
                      ? styles.apimessage
                      : styles.usermessage
                  }
                >
                  {message.type === 'apiMessage' ? (
                    <Image
                      src="/parroticon.png"
                      alt="AI"
                      width="30"
                      height="30"
                      className={styles.boticon}
                      priority={true}
                    />
                  ) : (
                    <Image
                      src="/usericon.png"
                      alt="Me"
                      width="30"
                      height="30"
                      className={styles.usericon}
                      priority={true}
                    />
                  )}
                  <div className={styles.markdownanswer}>
                    <ReactMarkdown linkTarget="_blank">
                      {message.message}
                    </ReactMarkdown>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className={styles.center}>
          <div className={styles.cloudform}>
            <form onSubmit={handleSubmit}>
              <textarea
                disabled={conversationStore.loading}
                onKeyDown={handleEnter}
                ref={textAreaRef}
                autoFocus={false}
                rows={1}
                maxLength={512}
                type="text"
                id="userInput"
                name="userInput"
                placeholder={
                  conversationStore.loading
                    ? 'Waiting for response...'
                    : 'Type your question...'
                }
                value={conversationStore.userInput}
                onChange={(e) => conversationStore.setUserInput(e.target.value)}
                className={styles.textarea}
              />
              <button
                type="submit"
                disabled={conversationStore.loading}
                className={styles.generatebutton}
              >
                {conversationStore.loading ? (
                  <div className={styles.loadingwheel}>
                    <CircularProgress color="inherit" size={20} />
                  </div>
                ) : (
                  <svg
                    viewBox="0 0 20 20"
                    className={styles.svgicon}
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"></path>
                  </svg>
                )}
              </button>
            </form>
          </div>
          <div className={styles.footer}>
            <p>
              Powered by{' '}
              <a href="https://github.com/hwchase17/langchain" target="_blank">
                LangChain
              </a>
              . Built by{' '}
              <a href="https://twitter.com/timurista" target="_blank">
              Tim Urista
          </a>
          .
        </p>
      </div>
    </div>
  </main>
</>
);
});

export default Home;