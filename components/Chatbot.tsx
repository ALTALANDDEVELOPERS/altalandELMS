
import React, { useState, useRef, useEffect } from 'react';
import { geminiService } from '../services/geminiService';
import type { ChatMessage } from '../types';
import { Bot, Send, X } from './Icons';
import { Spinner } from './common/Spinner';
import type { Content } from '@google/genai';

export const Chatbot: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if(isOpen && messages.length === 0) {
             setMessages([{
                id: `ai-init-${Date.now()}`,
                text: "Hello! I'm the Altaland leave policy assistant. How can I help you today?",
                sender: 'ai',
            }]);
        }
        scrollToBottom();
    }, [isOpen, messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedInput = inputValue.trim();
        if (!trimmedInput) return;

        const userMessage: ChatMessage = {
            id: `user-${Date.now()}`,
            text: trimmedInput,
            sender: 'user',
        };
        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsLoading(true);

        try {
            // FIX: Type the history payload to match the expected Content[] type for the Gemini API.
            const historyForApi: Content[] = messages.map(msg => ({
                role: msg.sender === 'user' ? ('user' as const) : ('model' as const),
                parts: [{ text: msg.text }]
            }));

            const aiResponseText = await geminiService.getChatbotResponse(historyForApi, trimmedInput);
            
            const aiMessage: ChatMessage = {
                id: `ai-${Date.now()}`,
                text: aiResponseText,
                sender: 'ai',
            };
            setMessages(prev => [...prev, aiMessage]);

        } catch (error) {
            console.error("Chatbot error:", error);
            const errorMessage: ChatMessage = {
                id: `error-${Date.now()}`,
                text: "Sorry, something went wrong. Please try again.",
                sender: 'ai',
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };
    
    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-transform transform hover:scale-110"
                aria-label="Open Chatbot"
            >
                <Bot className="w-6 h-6" />
            </button>
        );
    }

    return (
        <div className="fixed bottom-24 right-6 w-full max-w-sm h-[60vh] bg-white dark:bg-gray-800 rounded-lg shadow-2xl flex flex-col z-50 transition-all">
            <header className="flex items-center justify-between p-4 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 rounded-t-lg flex-shrink-0">
                <div className="flex items-center">
                    <Bot className="w-6 h-6 text-blue-500 mr-2" />
                    <h3 className="font-bold text-lg">Leave Policy Assistant</h3>
                </div>
                <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white">
                    <X className="w-6 h-6" />
                </button>
            </header>

            <main className="flex-1 p-4 overflow-y-auto space-y-4">
                {messages.map((message) => (
                    <div key={message.id} className={`flex items-start gap-3 ${message.sender === 'user' ? 'justify-end' : ''}`}>
                        {message.sender === 'ai' && <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0"><Bot className="w-5 h-5 text-white" /></div>}
                        <div className={`max-w-xs px-4 py-2 rounded-lg ${message.sender === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 rounded-bl-none'}`}>
                            <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                        </div>
                    </div>
                ))}
                 {isLoading && (
                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0"><Bot className="w-5 h-5 text-white" /></div>
                        <div className="max-w-xs px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                           <Spinner size="sm" />
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </main>

            <footer className="p-4 border-t dark:border-gray-700 flex-shrink-0">
                <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Ask about leave policy..."
                        className="flex-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        disabled={isLoading}
                        onKeyPress={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                handleSendMessage(e);
                            }
                        }}
                    />
                    <button type="submit" className="p-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed" disabled={isLoading || !inputValue.trim()}>
                        <Send className="w-5 h-5" />
                    </button>
                </form>
            </footer>
        </div>
    );
};
