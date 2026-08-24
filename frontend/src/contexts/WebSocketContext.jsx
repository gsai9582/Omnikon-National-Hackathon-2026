import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useAuth } from './AuthContext';

const WebSocketContext = createContext(null);

export function WebSocketProvider({ children }) {
    const { token } = useAuth();
    const [connected, setConnected] = useState(false);
    const clientRef = useRef(null);

    useEffect(() => {
        if (!token) {
            if (clientRef.current) {
                clientRef.current.deactivate();
            }
            setConnected(false);
            return;
        }

        const client = new Client({
            // Note: Since we need to pass Authorization headers in CONNECT frame, StompJS supports it.
            // But SockJS doesn't support custom HTTP headers in the initial handshake.
            // STOMP over SockJS allows passing headers in the CONNECT frame payload.
            webSocketFactory: () => {
                const wsUrl = import.meta.env.VITE_WS_URL || (window.location.origin + '/ws');
                // Fallback for local dev without Nginx
                const finalUrl = wsUrl.includes('localhost:5173') ? 'http://localhost:8080/ws' : wsUrl;
                return new SockJS(finalUrl);
            },
            connectHeaders: {
                Authorization: `Bearer ${token}`
            },
            debug: (str) => {
                // console.log(str); // Uncomment for debugging
            },
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
        });

        client.onConnect = () => {
            setConnected(true);
        };

        client.onStompError = (frame) => {
            console.error('Broker reported error: ' + frame.headers['message']);
            console.error('Additional details: ' + frame.body);
        };

        client.onWebSocketClose = () => {
            setConnected(false);
        };

        client.activate();
        clientRef.current = client;

        return () => {
            if (clientRef.current) {
                clientRef.current.deactivate();
            }
        };
    }, [token]);

    const subscribe = (destination, callback) => {
        if (!clientRef.current || !clientRef.current.connected) return null;
        return clientRef.current.subscribe(destination, (message) => {
            callback(message.body);
        });
    };

    return (
        <WebSocketContext.Provider value={{ connected, subscribe, client: clientRef.current }}>
            {children}
        </WebSocketContext.Provider>
    );
}

export function useWebSocket() {
    return useContext(WebSocketContext);
}
