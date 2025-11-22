    import React, { useEffect, useRef, useState } from "react";
    import { io } from "socket.io-client";

    export default function App() {
        const [input, setInput] = useState("");
        const [conversation, setConversation] = useState([
            { id: 1, sender: "bot", text: "👋 Hello! I'm your AI assistant. How can I help you today?", time: Date.now() },
        ]);
        const [isTyping, setIsTyping] = useState(false);
        const messagesEndRef = useRef(null);
        const socketRef = useRef(null);

        useEffect(() => {

            socketRef.current = io("https://ai-chatbot-backend-c0t3.onrender.com")

            socketRef.current.on("ai-response", ({ result }) => {
                setIsTyping(false);
                const botMsg = {
                    id: Date.now(),
                    sender: "bot",
                    text: result,
                    time: Date.now(),
                };
                setConversation((prev) => [...prev, botMsg]);
            });

            socketRef.current.on("ai-error", (err) => {
                setIsTyping(false);
                console.error(err);
            });

            return () => socketRef.current.disconnect();
        }, []);

        useEffect(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, [conversation, isTyping]);

        const formatMessage = (text) => {
            // Bold text
            text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
            // Italic text
            text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
            // Code blocks
            text = text.replace(/`(.*?)`/g, '<code>$1</code>');
            // Line breaks
            text = text.replace(/\n/g, '<br/>');
            return text;
        };

        const sendMessage = () => {
            const text = input.trim();
            if (!text) return;

            const userMsg = {
                id: Date.now(),
                sender: "user",
                text,
                time: Date.now(),
            };
            setConversation((prev) => [...prev, userMsg]);
            socketRef.current.emit("ai-res", text);
            setInput("");
            setIsTyping(true);
        };

        const handleKeyPress = (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        };

        return (
            <div style={styles.container}>
                <div style={styles.chatApp}>
                    <div style={styles.header}>
                        <div style={styles.headerContent}>
                            <div style={styles.avatar}>AI</div>
                            <div>
                                <div style={styles.headerTitle}>Personal AI Assistant</div>
                                <div style={styles.headerStatus}>● Online</div>
                            </div>
                        </div>
                    </div>

                    <div style={styles.messages}>
                        {conversation.map((m) => (
                            <div key={m.id} style={m.sender === "user" ? styles.messageOutgoing : styles.messageIncoming}>
                                {m.sender === "bot" && <div style={styles.botAvatar}>AI</div>}
                                <div style={styles.messageContent}>
                                    <div style={m.sender === "user" ? styles.bubbleUser : styles.bubbleBot}>
                                        <div dangerouslySetInnerHTML={{ __html: formatMessage(m.text) }} />
                                    </div>
                                    <div style={styles.time}>{new Date(m.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                </div>
                            </div>
                        ))}
                        {isTyping && (
                            <div style={styles.messageIncoming}>
                                <div style={styles.botAvatar}>AI</div>
                                <div style={styles.messageContent}>
                                    <div style={styles.typingIndicator}>
                                        <span style={styles.dot}></span>
                                        <span style={{...styles.dot, animationDelay: '0.2s'}}></span>
                                        <span style={{...styles.dot, animationDelay: '0.4s'}}></span>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <div style={styles.composer}>
                        <input
                            type="text"
                            placeholder="Type your message..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                            style={styles.input}
                        />
                        <button 
                            onClick={sendMessage}
                            disabled={!input.trim()} 
                            style={{
                                ...styles.sendBtn,
                                opacity: input.trim() ? 1 : 0.4,
                                cursor: input.trim() ? 'pointer' : 'not-allowed'
                            }}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const styles = {
        container: {
            width: '100vw',
            height: '100vh',
            background: 'linear-gradient(to bottom right, #0f172a, #1e293b)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        },
        chatApp: {
            width: '100%',
            maxWidth: '900px',
            height: '95vh',
            background: '#ffffff',
            borderRadius: '20px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
        },
        header: {
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            padding: '20px 24px',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
        },
        headerContent: {
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
        },
        avatar: {
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: '700',
            color: 'white',
            fontSize: '16px',
        },
        headerTitle: {
            color: 'white',
            fontSize: '18px',
            fontWeight: '600',
        },
        headerStatus: {
            color: 'rgba(255,255,255,0.8)',
            fontSize: '13px',
            marginTop: '2px',
        },
        messages: {
            flex: 1,
            overflowY: 'auto',
            padding: '24px',
            background: '#f8fafc',
        },
        messageIncoming: {
            display: 'flex',
            gap: '12px',
            marginBottom: '20px',
        },
        messageOutgoing: {
            display: 'flex',
            justifyContent: 'flex-end',
            marginBottom: '20px',
        },
        messageContent: {
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            maxWidth: '70%',
        },
        botAvatar: {
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: '600',
            color: 'white',
            fontSize: '12px',
            flexShrink: 0,
        },
        bubbleBot: {
            background: 'white',
            padding: '14px 18px',
            borderRadius: '18px 18px 18px 4px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            color: '#1e293b',
            lineHeight: '1.5',
        },
        bubbleUser: {
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            padding: '14px 18px',
            borderRadius: '18px 18px 4px 18px',
            color: 'white',
            lineHeight: '1.5',
            boxShadow: '0 4px 12px rgba(99,102,241,0.3)',
        },
        time: {
            fontSize: '11px',
            color: '#94a3b8',
            paddingLeft: '8px',
            paddingRight: '8px',
        },
        composer: {
            padding: '20px 24px',
            background: 'white',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            gap: '12px',
        },
        input: {
            flex: 1,
            padding: '14px 20px',
            border: '2px solid #e2e8f0',
            borderRadius: '12px',
            fontSize: '15px',
            outline: 'none',
            transition: 'all 0.2s',
            background: '#f8fafc',
        },
        sendBtn: {
            width: '50px',
            height: '50px',
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s',
        },
        typingIndicator: {
            background: 'white',
            padding: '16px 20px',
            borderRadius: '18px 18px 18px 4px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            display: 'flex',
            gap: '4px',
        },
        dot: {
            width: '8px',
            height: '8px',
            background: '#94a3b8',
            borderRadius: '50%',
            display: 'inline-block',
            animation: 'bounce 1.4s infinite',
        }
    };

    // Inject CSS animations
    const styleSheet = document.createElement("style");
    styleSheet.innerText = `
    @keyframes bounce {
        0%, 60%, 100% { transform: translateY(0); }
        30% { transform: translateY(-8px); }
    }

    code {
        background: #f1f5f9;
        padding: 2px 6px;
        border-radius: 4px;
        font-family: 'Courier New', monospace;
        font-size: 13px;
        color: #be123c;
    }

    strong {
        font-weight: 700;
        color: inherit;
    }

    em {
        font-style: italic;
        color: inherit;
    }

    input:focus {
        border-color: #6366f1 !important;
        background: white !important;
    }

    button:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 8px 20px rgba(99,102,241,0.4) !important;
    }
    `;
    document.head.appendChild(styleSheet);