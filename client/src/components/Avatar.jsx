import { motion } from 'framer-motion';
import { getInitials, getAvatarColor } from '../utils/roomUtils';

export default function Avatar({ name, size = 'md', className = '' }) {
  const initials = getInitials(name);
  const colorClass = getAvatarColor(name);

  const sizes = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-16 h-16 text-xl',
    xl: 'w-24 h-24 text-3xl',
    '2xl': 'w-32 h-32 text-4xl',
  };

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`
        ${sizes[size]} 
        bg-gradient-to-br ${colorClass}
        rounded-full flex items-center justify-center 
        font-semibold text-white select-none
        ${className}
      `}
      style={{
        boxShadow: '0 0 24px rgba(124,58,237,0.2), 0 4px 12px rgba(0,0,0,0.3)',
      }}
    >
      {initials}
    </motion.div>
  );
}
