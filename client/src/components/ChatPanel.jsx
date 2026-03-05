import { useState, useRef, useEffect } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, MessageSquare } from 'lucide-react';
import { formatTime } from '../utils/formatTime';

export default function ChatPanel({ isOpen, onClose, messages, onSend, localSocketId }) {
  const [text, setText] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setText('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: 360, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 360, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 350, damping: 30 }}
          className="w-full sm:w-[340px] md:w-[360px] h-full flex flex-col overflow-hidden rounded-2xl"
          style={{
            background: 'rgba(12,12,20,0.85)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(255,255,255,0.06)',
            boxShadow: '0 25px 50px rgba(0,0,0,0.5), 0 0 0 1px rgba(124,58,237,0.06)',
          }}
        >
          {/* Top shine line */}
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <h3 className="text-sm font-semibold text-[var(--color-text-primary)] tracking-tight">
              In-call messages
            </h3>
            <button
              onClick={onClose}
              className="control-btn p-1.5 text-[var(--color-text-secondary)] hover:text-white"
            >
              <X size={16} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0 custom-scrollbar">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                  style={{ background: 'rgba(124,58,237,0.08)' }}
                >
                  <MessageSquare size={28} className="text-purple-400/50" />
                </div>
                <p className="text-sm text-[var(--color-text-secondary)]">No messages yet</p>
                <p className="text-xs text-[var(--color-text-muted)] mt-1">Say hello</p>
              </div>
            ) : (
              messages.map((msg) => {
                const isOwn = msg.senderId === localSocketId;
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}
                  >
                    <span className={`text-[11px] font-medium mb-1 ${isOwn ? 'text-purple-400' : 'text-purple-300'}`}>
                      {isOwn ? 'You' : msg.senderName}
                    </span>
                    <div
                      className={`max-w-[85%] px-3.5 py-2.5 text-sm leading-relaxed ${
                        isOwn ? 'rounded-2xl rounded-br-sm' : 'rounded-2xl rounded-bl-sm'
                      }`}
                      style={
                        isOwn
                          ? {
                              background: 'linear-gradient(135deg, rgba(124,58,237,0.3), rgba(99,102,241,0.2))',
                              border: '1px solid rgba(124,58,237,0.15)',
                              color: 'var(--color-text-primary)',
                            }
                          : {
                              background: 'rgba(255,255,255,0.04)',
                              border: '1px solid rgba(255,255,255,0.06)',
                              color: 'var(--color-text-primary)',
                            }
                      }
                    >
                      {msg.message}
                    </div>
                    <span className="text-[10px] text-[var(--color-text-muted)] mt-1">
                      {formatTime(msg.timestamp)}
                    </span>
                  </motion.div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Send a message..."
                className="flex-1 px-4 py-2.5 rounded-xl input-sunken text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none"
              />
              <button
                onClick={handleSend}
                disabled={!text.trim()}
                className="control-btn p-2.5 text-white disabled:opacity-30 disabled:cursor-not-allowed"
                style={{
                  background: text.trim() ? 'linear-gradient(135deg, #7c3aed, #6366f1)' : 'rgba(255,255,255,0.06)',
                  boxShadow: text.trim() ? '0 0 16px rgba(124,58,237,0.3)' : 'none',
                }}
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
