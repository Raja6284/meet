import { motion } from 'framer-motion';
import { Wifi, WifiOff, Loader } from 'lucide-react';

export default function ConnectionStatus({ state }) {
  const configs = {
    connected: {
      color: 'bg-[var(--color-success)]',
      text: 'Connected',
      icon: <Wifi size={12} />,
      textColor: 'text-[var(--color-success)]',
    },
    connecting: {
      color: 'bg-yellow-500',
      text: 'Reconnecting...',
      icon: <Loader size={12} className="animate-spin" />,
      textColor: 'text-yellow-500',
    },
    disconnected: {
      color: 'bg-[var(--color-danger)]',
      text: 'Disconnected',
      icon: <WifiOff size={12} />,
      textColor: 'text-[var(--color-danger)]',
    },
  };

  const config = configs[state] || configs.connecting;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="
        glass rounded-full px-3 py-1.5
        flex items-center gap-2
        text-xs font-medium
      "
    >
      <span className={`w-2 h-2 rounded-full ${config.color} ${state === 'connecting' ? 'animate-pulse' : ''}`} />
      <span className={config.textColor}>{config.text}</span>
    </motion.div>
  );
}
