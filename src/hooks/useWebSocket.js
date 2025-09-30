import { useState, useEffect, useRef, useCallback } from 'react';
import { createWebSocket } from '../lib/api';

export const useWebSocket = (conversationId) => {
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const ws = useRef(null);

  const connect = useCallback(() => {
    if (!conversationId) return;

    ws.current = createWebSocket(conversationId);

    ws.current.onopen = () => {
      console.log('WebSocket connected');
      setIsConnected(true);
    };

    ws.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        switch (data.type) {
          case 'typing':
            setIsTyping(data.status);
            break;
          
          case 'message':
            setMessages(prev => [...prev, {
              id: Date.now(),
              role: 'assistant',
              content: data.content,
              timestamp: new Date().toISOString()
            }]);
            break;
          
          default:
            console.log('Unknown message type:', data.type);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    ws.current.onclose = (event) => {
      console.log('WebSocket disconnected:', event.code, event.reason);
      setIsConnected(false);
      
      if (event.code !== 1000) { 
        setTimeout(() => {
          if (conversationId) {
            connect();
          }
        }, 3000);
      }
    };

    ws.current.onerror = (error) => {
      console.error('WebSocket error:', error);
      setIsConnected(false);
    };
  }, [conversationId]);

  const sendMessage = useCallback((message) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ message }));
      return true;
    }
    return false;
  }, []);

  const sendTypingIndicator = useCallback((isTyping) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ 
        type: 'typing', 
        status: isTyping 
      }));
      return true;
    }
    return false;
  }, []);

  const disconnect = useCallback(() => {
    if (ws.current) {
      ws.current.close(1000, 'User initiated disconnect');
    }
  }, []);

  useEffect(() => {
    if (conversationId) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [conversationId, connect, disconnect]);

  return {
    isConnected, messages, isTyping, sendMessage, sendTypingIndicator, disconnect
  };
};