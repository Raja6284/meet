import { motion } from 'framer-motion';
import { Wifi, WifiOff, Loader } from 'lucide-react';

export default function ConnectionStatus({ state }) {
  const configs = {
    connected: {
      color: '#22c55e',
      text: 'Connected',
      icon: <Wifi size={12} />,
    },
    connecting: {
      color: '#eab308',
      text: 'Reconnecting...',
      icon: <Loader size={12} className="animate-spin" />,
    },
    disconnected: {
      color: '#ef4444',
      text: 'Disconnected',
      icon: <WifiOff size={12} />,
    },
  };

  const config = configs[state] || configs.connecting;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-full px-3 py-1.5 flex items-center gap-2 text-xs font-medium"
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <span
        className={`w-2 h-2 rounded-full ${state === 'connecting' ? 'animate-pulse' : 'pulse-ring'}`}
        style={{ background: config.color, boxShadow: `0 0 8px ${config.color}60` }}
      />
      <span style={{ color: config.color }}>{config.text}</span>
    </motion.div>
  );
}
