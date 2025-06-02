import { ImageIcon, SendHorizonal } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import "./ChatBotDropdown.css";

const ChatBotDropdown = () => {
    const [messages, setMessages] = useState([
        { id: 1, text: "Hi! I'm Skinthia. How can I help you today?", sender: "chatbot" },
    ]);
    const [input, setInput] = useState("");
    const messagesEndRef = useRef(null);

    const sendMessage = async () => {
        if (input.trim() === "") return;

        const userMessage = {
            id: Date.now(),
            text: input,
            sender: "user",
        };

        setMessages((prevMessages) => [...prevMessages, userMessage]);
        setInput("");

        try {
            // Send message to backend chatbot endpoint
            const response = await fetch('http://localhost:5000/api/chat/message', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: userMessage.text }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to get response from chatbot');
            }

            const data = await response.json();
            
            const botMessage = {
                id: Date.now() + 1,
                text: data.response,
                sender: "chatbot",
            };
            setMessages((prevMessages) => [...prevMessages, botMessage]);

        } catch (error) {
            console.error('Error sending message to backend:', error);
            const errorMessage = {
                id: Date.now() + 1,
                text: `Error: ${error.message}`,
                sender: "chatbot",
            };
            setMessages((prevMessages) => [...prevMessages, errorMessage]);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter") sendMessage();
    };

    useEffect(() => {
        // Only scroll the chat container, not the whole page
        if (messagesEndRef.current) {
            const chatContainer = document.querySelector('.chatbot-messages');
            if (chatContainer) {
                chatContainer.scrollTop = chatContainer.scrollHeight;
            }
        }
    }, [messages]);

    return (
        <div className="chatbot-dropdown">
            <div className="chatbot-messages">
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`chatbot-message ${msg.sender === "user" ? "user" : "bot"}`}
                    >
                        {msg.text}
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            <div className="chatbot-input">
                <button className="icon-btn">
                    <ImageIcon size={20} />
                </button>
                <input
                    type="text"
                    placeholder="Ask Skinthia..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyPress}
                />
                <button className="icon-btn" onClick={sendMessage}>
                    <SendHorizonal size={20} />
                </button>
            </div>
        </div>
    );
};

export default ChatBotDropdown;
