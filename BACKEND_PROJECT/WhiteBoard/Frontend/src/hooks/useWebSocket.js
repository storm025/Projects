import { useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';

export const useWebSocket = (canvasId, onCanvasUpdate) => {
  const socketRef = useRef(null);
  const updateQueueRef = useRef([]);
  const processingRef = useRef(false);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;

  // Process queued updates
  const processUpdateQueue = useCallback(() => {
    if (processingRef.current || updateQueueRef.current.length === 0) return;

    processingRef.current = true;
    const nextUpdate = updateQueueRef.current.shift();
    
    if (onCanvasUpdate) {
      onCanvasUpdate(nextUpdate);
    }

    // Schedule next update
    setTimeout(() => {
      processingRef.current = false;
      processUpdateQueue();
    }, 16); // ~60fps
  }, [onCanvasUpdate]);

  useEffect(() => {
    // Get auth token from localStorage or wherever you store it
    const token = localStorage.getItem('token');

    // Initialize socket connection with optimized settings
    socketRef.current = io('https://whiteboard-ftu8.onrender.com', {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: maxReconnectAttempts,
      reconnectionDelay: 1000,
      timeout: 20000,
      auth: {
        token // Pass the token in connection auth
      },
      extraHeaders: {
        Authorization: `Bearer ${token}`
      }
    });

    // Join canvas room
    socketRef.current.emit('joinCanvas', canvasId);
    console.log('Joining canvas:', canvasId);

    // Listen for canvas updates with queuing
    socketRef.current.on('canvasUpdated', (updatedElements) => {
      console.log('Received canvas update');
      updateQueueRef.current.push(updatedElements);
      processUpdateQueue();
    });

    // Connection event handlers
    socketRef.current.on('connect', () => {
      console.log('WebSocket connected');
      reconnectAttemptsRef.current = 0;
    });

    socketRef.current.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      reconnectAttemptsRef.current++;

      if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
        console.error('Max reconnection attempts reached');
        socketRef.current.disconnect();
        return;
      }

      // Try both WebSocket and polling
      if (socketRef.current.io.opts.transports.includes('websocket')) {
        socketRef.current.io.opts.transports = ['polling'];
      } else {
        socketRef.current.io.opts.transports = ['websocket', 'polling'];
      }
    });

    socketRef.current.on('unauthorized', (error) => {
      console.error('Unauthorized:', error);
      // Handle unauthorized access (e.g., redirect to login)
    });

    socketRef.current.on('userJoined', ({ count }) => {
      console.log(`Active users in canvas: ${count}`);
    });

    socketRef.current.on('userLeft', ({ count }) => {
      console.log(`Active users in canvas: ${count}`);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [canvasId, processUpdateQueue]);

  // Debounced emit function
  const emitCanvasUpdate = useCallback((elements) => {
    if (!socketRef.current?.connected) return;

    console.log('Emitting canvas update');
    socketRef.current.volatile.emit('canvasUpdate', {
      canvasId,
      elements
    });
  }, [canvasId]);

  return { emitCanvasUpdate };
};