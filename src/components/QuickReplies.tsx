interface QuickRepliesProps {
  options: string[];
  onSelect: (option: string) => void;
  disabled?: boolean;
}

const QuickReplies = ({ options, onSelect, disabled }: QuickRepliesProps) => {
  return (
    <div className="flex flex-wrap gap-2 px-2 py-1 animate-fade-in">
      {options.map((option) => (
        <button
          key={option}
          onClick={() => onSelect(option)}
          disabled={disabled}
          className="px-4 py-2 text-sm font-medium rounded-full border border-[hsl(var(--chat-accent))] text-[hsl(var(--chat-accent))] bg-[hsl(var(--chat-accent)/0.08)] hover:bg-[hsl(var(--chat-accent)/0.18)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
        >
          {option}
        </button>
      ))}
    </div>
  );
};

export default QuickReplies;
