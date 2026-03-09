import bitiAvatar from '@/assets/biti-avatar.png';
import { RotateCcw } from 'lucide-react';

interface ChatHeaderProps {
  onReset: () => void;
}

const ChatHeader = ({ onReset }: ChatHeaderProps) => {
  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-[hsl(var(--chat-header))] text-[hsl(var(--chat-header-fg))] shadow-md z-10">
      <img
        src={bitiAvatar}
        alt="Biti avatar"
        className="w-10 h-10 rounded-full border-2 border-white/20 object-cover bg-white"
      />
      <div className="flex-1 min-w-0">
        <h1 className="text-base font-semibold leading-tight">Thanos</h1>
        <p className="text-xs opacity-80 leading-tight">Asistente virtual de Vitalcan</p>
      </div>
      <button
        onClick={onReset}
        className="flex items-center gap-1.5 text-xs opacity-70 hover:opacity-100 transition-opacity bg-white/10 rounded-full px-3 py-1.5"
        title="Reiniciar demo"
      >
        <RotateCcw className="w-3.5 h-3.5" />
        Reiniciar
      </button>
    </div>
  );
};

export default ChatHeader;
