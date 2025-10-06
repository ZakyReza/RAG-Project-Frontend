import React, { useState, useRef, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent } from '../ui/card';
import { Send, MessageSquare } from 'lucide-react';
import { conversationApi } from '../../lib/api';
import { formatDate } from '../../lib/utils';
import { useWebSocket } from '../../hooks/useWebSocket';

const ChatInterface = ({ conversation, onNewConversation }) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([]); // Single source of truth
  const messagesEndRef = useRef(null);
  
  // Use WebSocket hook
  const { 
    messages: wsMessages, 
    isTyping, 
    sendMessage: sendWsMessage,
    sendTypingIndicator,
    isConnected 
  } = useWebSocket(conversation?.id);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Load messages when conversation changes
  useEffect(() => {
    if (conversation) {
      loadMessages();
    } else {
      setMessages([]);
    }
  }, [conversation]);

  // Merge WebSocket messages into main messages array
  useEffect(() => {
    if (wsMessages.length > 0) {
      setMessages(prev => {
        // Create a map of existing message IDs
        const existingIds = new Set(prev.map(m => m.id));
        
        // Filter out messages that already exist
        const newMessages = wsMessages.filter(m => !existingIds.has(m.id));
        
        if (newMessages.length === 0) return prev;
        
        // Merge and sort by timestamp
        const merged = [...prev, ...newMessages].sort((a, b) => 
          new Date(a.timestamp) - new Date(b.timestamp)
        );
        
        return merged;
      });
    }
  }, [wsMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const loadMessages = async () => {
    if (!conversation) return;
    
    try {
      const response = await conversationApi.getMessages(conversation.id);
      setMessages(response.data);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || !conversation || isLoading) return;

    const messageContent = input.trim();
    const userMessage = {
      id: `temp-${Date.now()}`, // Temporary ID
      role: 'user',
      content: messageContent,
      timestamp: new Date().toISOString(),
    };

    // Add user message immediately for better UX
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Try WebSocket first
      if (isConnected) {
        const sent = sendWsMessage(messageContent);
        if (sent) {
          console.log('✅ Message sent via WebSocket');
          // WebSocket will handle adding the AI response
          setIsLoading(false);
          return;
        }
      }

      // Fallback to HTTP if WebSocket not connected
      console.log('⚠️ Falling back to HTTP API');
      const response = await conversationApi.sendMessage(conversation.id, {
        content: messageContent,
      });

      // Replace temporary message with real one from server
      setMessages(prev => {
        const filtered = prev.filter(m => m.id !== userMessage.id);
        return [...filtered, 
          {
            id: response.data.message.id,
            role: 'user',
            content: messageContent,
            timestamp: response.data.message.timestamp
          },
          {
            id: response.data.message.id + 1,
            role: 'assistant',
            content: response.data.answer,
            timestamp: new Date().toISOString()
          }
        ];
      });
      
    } catch (error) {
      console.error('❌ Error sending message:', error);
      
      // Add error message
      setMessages(prev => [...prev, {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date().toISOString(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-muted/20">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="p-6 text-center">
            <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Conversation Selected</h3>
            <p className="text-muted-foreground mb-4">
              Start a new conversation or select an existing one from the sidebar.
            </p>
            <Button onClick={onNewConversation} className="w-full">
              Start New Conversation
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Chat Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold">{conversation.title}</h2>
            <p className="text-sm text-muted-foreground">
              Last updated: {formatDate(conversation.updated_at)}
            </p>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
            <span className="text-muted-foreground">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                Start a conversation by typing a message below
              </p>
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] rounded-lg px-4 py-2 ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
                <span className="text-xs opacity-70 block mt-1">
                  {formatDate(message.timestamp)}
                </span>
              </div>
            </div>
          ))
        )}
        
        {/* Typing indicator */}
        {(isLoading || isTyping) && (
          <div className="flex justify-start">
            <div className="max-w-[70%] rounded-lg px-4 py-2 bg-muted">
              <div className="flex space-x-2">
                <div className="w-2 h-2 rounded-full bg-current animate-bounce"></div>
                <div className="w-2 h-2 rounded-full bg-current animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 rounded-full bg-current animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t p-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex space-x-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button 
            onClick={sendMessage} 
            disabled={isLoading || !input.trim()}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        {!isConnected && (
          <p className="text-xs text-yellow-600 mt-2">
            WebSocket disconnected. Using HTTP fallback.
          </p>
        )}
      </div>
    </div>
  );
};

export default ChatInterface;