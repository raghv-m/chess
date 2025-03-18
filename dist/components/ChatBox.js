"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatBox = ChatBox;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
function ChatBox({ messages, onSendMessage }) {
    const [input, setInput] = (0, react_1.useState)('');
    const messagesEndRef = (0, react_1.useRef)(null);
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };
    (0, react_1.useEffect)(() => {
        scrollToBottom();
    }, [messages]);
    const handleSubmit = (e) => {
        e.preventDefault();
        if (input.trim()) {
            onSendMessage(input.trim());
            setInput('');
        }
    };
    const formatTime = (timestamp) => {
        return new Date(timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
        });
    };
    return ((0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col h-full bg-gray-800", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex-1 overflow-y-auto p-4 space-y-4", children: [messages.map((message) => ((0, jsx_runtime_1.jsx)("div", { className: `flex flex-col ${message.userId === 'system'
                            ? 'items-center'
                            : message.userId === 'move'
                                ? 'items-start'
                                : 'items-end'}`, children: (0, jsx_runtime_1.jsxs)("div", { className: `max-w-[80%] rounded-lg px-4 py-2 ${message.userId === 'system'
                                ? 'bg-gray-700 text-gray-300'
                                : message.userId === 'move'
                                    ? 'bg-gray-700 text-blue-300'
                                    : 'bg-blue-600 text-white'}`, children: [message.userId !== 'system' && message.userId !== 'move' && ((0, jsx_runtime_1.jsx)("div", { className: "text-sm font-semibold mb-1", children: message.username })), (0, jsx_runtime_1.jsx)("div", { className: "break-words", children: message.message }), (0, jsx_runtime_1.jsx)("div", { className: "text-xs opacity-75 mt-1", children: formatTime(message.timestamp) })] }) }, message.id))), (0, jsx_runtime_1.jsx)("div", { ref: messagesEndRef })] }), (0, jsx_runtime_1.jsx)("form", { onSubmit: handleSubmit, className: "p-4 border-t border-gray-700", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex space-x-2", children: [(0, jsx_runtime_1.jsx)("input", { type: "text", value: input, onChange: (e) => setInput(e.target.value), placeholder: "Type a message...", className: "flex-1 bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" }), (0, jsx_runtime_1.jsx)("button", { type: "submit", disabled: !input.trim(), className: "px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors", children: "Send" })] }) })] }));
}
//# sourceMappingURL=ChatBox.js.map