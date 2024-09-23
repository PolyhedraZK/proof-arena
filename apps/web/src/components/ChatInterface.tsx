import 'react-chat-elements/dist/main.css';
import 'katex/dist/katex.min.css'; // For math rendering

import { Button, Input, Spin } from 'antd';
import React, { useEffect, useState } from 'react';
import { MessageList } from 'react-chat-elements';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import rehypeKatex from 'rehype-katex';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';

import { getChatCompletion } from '@/services/llm/openaiClient';

// Add a style for the chat container
const chatContainerStyle = {
  maxHeight: '80vh', // Set a max height
  overflowY: 'auto', // Enable vertical scrolling
  padding: '10px', // Add some padding
};

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<
    Array<{ position: string; text: string; date: Date }>
  >([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false); // Add loading state

  useEffect(() => {
    const initialMessages = [
      {
        position: 'left',
        text: 'Hello, this is Proof Arena AI assistant for answering questions about Proof Arena. How can I help you?',
        date: new Date(),
      },
    ];
    setMessages(initialMessages);
  }, []);

  const handleSend = async () => {
    if (input.trim() === '') return;

    const newUserMessage = { position: 'right', text: input, date: new Date() };
    setMessages([...messages, newUserMessage]);
    setInput('');
    setLoading(true); // Set loading to true before making the API call

    const response = await getChatCompletion([
      ...messages,
      { role: 'user', content: input },
    ]);
    const cleanedContent = response.content.replace(/【\d+:\d+†source】/g, '');
    const newAssistantMessage = {
      position: 'left',
      text: cleanedContent,
      date: new Date(),
    };
    setMessages(prevMessages => [...prevMessages, newAssistantMessage]);
    setLoading(false); // Set loading to false after receiving the response
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
      setInput(''); // Clear the text box afterwards
    }
  };

  return (
    <div style={chatContainerStyle}>
      <MessageList
        className="message-list"
        lockable={true}
        toBottomHeight={'100%'}
        dataSource={messages.map(msg => ({
          position: msg.position,
          type: 'text',
          text:
            msg.position === 'left' ? (
              <ReactMarkdown
                children={msg.text}
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[rehypeHighlight, rehypeKatex]}
              />
            ) : (
              msg.text
            ),
          date: msg.date,
        }))}
      />
      <div style={{ display: 'flex', marginTop: '10px' }}>
        <Input.TextArea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          style={{ flexGrow: 1 }}
        />
        <Button onClick={handleSend} style={{ marginLeft: '10px' }}>
          Send
        </Button>
      </div>
      {loading && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            marginTop: '10px',
          }}
        >
          <Spin size="large" />
        </div>
      )}
    </div>
  );
};

export default ChatInterface;
