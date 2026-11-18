import React, { useState, useEffect, useCallback } from 'react';
import { ChatMessageItem } from './types';
import { askAnalyticsQuestion, checkBackendHealth } from './services/api';
import { Header } from './components/Header';
import { ChatWindow } from './components/ChatWindow';
import { SuggestedQuestions } from './components/SuggestedQuestions';
import { QuestionInput } from './components/QuestionInput';
import './App.css';

export const App: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessageItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isBackendHealthy, setIsBackendHealthy] = useState<boolean>(false);

  // Check backend health on initial load
  const pingHealth = useCallback(async () => {
    try {
      const health = await checkBackendHealth();
      setIsBackendHealthy(health.status === 'ok');
    } catch (err) {
      setIsBackendHealthy(false);
      console.warn('Backend health check warning:', err);
    }
  }, []);

  useEffect(() => {
    pingHealth();
    const interval = setInterval(pingHealth, 15000);
    return () => clearInterval(interval);
  }, [pingHealth]);

  const handleSendQuestion = async (questionText: string) => {
    const trimmed = questionText.trim();
    if (!trimmed || isLoading) return;

    const userMessage: ChatMessageItem = {
      id: `user-${Date.now()}`,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      content: trimmed,
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await askAnalyticsQuestion(trimmed);

      const assistantMessage: ChatMessageItem = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        content: response.answer || (response.error ?? 'Analytics request processed.'),
        response: response.success ? response : undefined,
        error: !response.success ? response.error : undefined,
        supportedIntents: response.supported_intents,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      const networkErrorMessage: ChatMessageItem = {
        id: `error-${Date.now()}`,
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        content: '',
        error: (err as Error).message || 'Network failure: Unable to communicate with the banking backend.',
      };
      setMessages((prev) => [...prev, networkErrorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetChat = () => {
    setMessages([]);
  };

  return (
    <div className="bank-app-root">
      <Header
        isBackendHealthy={isBackendHealthy}
        onResetChat={handleResetChat}
        messageCount={messages.length}
      />

      <main className="bank-main-layout">
        <div className="bank-chat-card-container">
          <ChatWindow
            messages={messages}
            isLoading={isLoading}
            onSelectSuggestedQuestion={handleSendQuestion}
          />

          <footer className="bank-chat-footer">
            <SuggestedQuestions
              onSelectQuestion={handleSendQuestion}
              isLoading={isLoading}
            />

            <QuestionInput
              onSubmit={handleSendQuestion}
              isLoading={isLoading}
            />
          </footer>
        </div>
      </main>
    </div>
  );
};

export default App;
