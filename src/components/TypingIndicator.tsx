import bitiAvatar from '@/assets/biti-avatar.png';

const TypingIndicator = () => {
  return (
    <div className="flex gap-2 items-end animate-fade-in">
      <img
        src={bitiAvatar}
        alt="Biti"
        className="w-7 h-7 rounded-full flex-shrink-0 object-cover bg-white border border-border"
      />
      <div className="bg-[hsl(var(--bubble-bot))] px-4 py-3 rounded-2xl rounded-tl-md shadow-sm">
        <div className="flex gap-1 items-center">
          <span className="w-2 h-2 rounded-full bg-[hsl(var(--muted-foreground))] animate-bounce [animation-delay:0ms]" />
          <span className="w-2 h-2 rounded-full bg-[hsl(var(--muted-foreground))] animate-bounce [animation-delay:150ms]" />
          <span className="w-2 h-2 rounded-full bg-[hsl(var(--muted-foreground))] animate-bounce [animation-delay:300ms]" />
        </div>
      </div>
      <span className="text-xs text-muted-foreground ml-1">Biti está escribiendo...</span>
    </div>
  );
};

export default TypingIndicator;
