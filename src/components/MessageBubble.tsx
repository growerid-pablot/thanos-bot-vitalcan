import { cn } from '@/lib/utils';
import type { Message } from '@/lib/chatEngine';
import bitiAvatar from '@/assets/biti-avatar.png';

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble = ({ message }: MessageBubbleProps) => {
  const isBot = message.sender === 'bot';
  const time = message.timestamp.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });

  return (
    <div
      className={cn(
        'flex gap-2 animate-fade-in',
        isBot ? 'justify-start' : 'justify-end'
      )}
    >
      {isBot && (
        <img
          src={bitiAvatar}
          alt="Biti"
          className="w-7 h-7 rounded-full mt-1 flex-shrink-0 object-cover bg-white border border-border"
        />
      )}
      <div
        className={cn(
          'max-w-[80%] px-3.5 py-2 rounded-2xl text-sm leading-relaxed shadow-sm',
          isBot
            ? 'bg-[hsl(var(--bubble-bot))] text-[hsl(var(--bubble-bot-fg))] rounded-tl-md'
            : 'bg-[hsl(var(--bubble-user))] text-[hsl(var(--bubble-user-fg))] rounded-tr-md'
        )}
      >
        <p className="whitespace-pre-wrap">{message.text}</p>
        <span className={cn(
          'block text-[10px] mt-1 text-right',
          isBot ? 'opacity-50' : 'opacity-60'
        )}>
          {time}
        </span>
      </div>
    </div>
  );
};

export default MessageBubble;
