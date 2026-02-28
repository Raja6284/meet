import { useState, useRef, useEffect } from 'react';
// eslint-disable-next-line no-unused-vars -- motion is used via JSX member expressions
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
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="
            w-[360px] h-full
            glass-heavy rounded-2xl
            flex flex-col
            shadow-2xl shadow-black/40
            overflow-hidden
          "
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border)]">
            <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
              In-call messages
            </h3>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X size={16} className="text-[var(--color-text-secondary)]" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <MessageSquare size={40} className="text-[var(--color-text-muted)] mb-3" />
                <p className="text-sm text-[var(--color-text-secondary)]">No messages yet</p>
                <p className="text-xs text-[var(--color-text-muted)] mt-1">Say hello 👋</p>
              </div>
            ) : (
              messages.map((msg) => {
                const isOwn = msg.senderId === localSocketId;
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}
                  >
                    <span className={`text-[11px] font-medium mb-1 ${isOwn ? 'text-[var(--color-accent)]' : 'text-[var(--color-accent-light)]'}`}>
                      {isOwn ? 'You' : msg.senderName}
                    </span>
                    <div className={`
                      max-w-[85%] px-3.5 py-2 rounded-2xl text-sm
                      ${isOwn
                        ? 'bg-[var(--color-accent)]/20 text-[var(--color-text-primary)] rounded-br-sm'
                        : 'bg-white/5 text-[var(--color-text-primary)] rounded-bl-sm'
                      }
                    `}>
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
          <div className="p-4 border-t border-[var(--color-border)]">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Send a message..."
                className="
                  flex-1 px-4 py-2.5 rounded-xl
                  bg-[var(--color-surface)] border border-[var(--color-border)]
                  text-sm text-[var(--color-text-primary)]
                  placeholder-[var(--color-text-muted)]
                  focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/50
                  transition-all duration-200
                "
              />
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleSend}
                disabled={!text.trim()}
                className="
                  p-2.5 rounded-xl
                  gradient-btn text-white
                  disabled:opacity-30 disabled:cursor-not-allowed
                  transition-all duration-200
                "
              >
                <Send size={16} />
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
