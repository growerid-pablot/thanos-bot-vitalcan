import { useState, useRef, useEffect, useCallback } from 'react';
import { Send } from 'lucide-react';
import ChatHeader from './ChatHeader';
import MessageBubble from './MessageBubble';
import QuickReplies from './QuickReplies';
import TypingIndicator from './TypingIndicator';
import ScenariosPanel from './ScenariosPanel';
import {
  type Message,
  type ConversationState,
  type ClaimData,
  type TicketInfo,
  createMessage,
  processUserInput,
  getInitialBotResponse,
} from '@/lib/chatEngine';
import { sendTicketNotification } from '@/lib/ticketNotification';

const BOT_DELAY = 800;
const BOT_MULTI_DELAY = 600;

const ChatInterface = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [state, setState] = useState<ConversationState>('initial');
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [activeQuickReplies, setActiveQuickReplies] = useState<string[] | undefined>();
  const [scenarioRunning, setScenarioRunning] = useState(false);
  const [claimData, setClaimData] = useState<ClaimData>({});
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  const addBotMessages = useCallback(
    async (texts: string[], quickReplies?: string[], nextState?: ConversationState, newClaimData?: ClaimData) => {
      setIsTyping(true);
      setActiveQuickReplies(undefined);

      for (let i = 0; i < texts.length; i++) {
        await new Promise((r) => setTimeout(r, i === 0 ? BOT_DELAY : BOT_MULTI_DELAY));
        const isLast = i === texts.length - 1;
        const msg = createMessage('bot', texts[i], isLast ? quickReplies : undefined);
        setMessages((prev) => [...prev, msg]);
        if (isLast) {
          setActiveQuickReplies(quickReplies);
        }
      }

      setIsTyping(false);
      if (nextState) setState(nextState);
      if (newClaimData !== undefined) setClaimData(newClaimData);
    },
    []
  );

  const handleSend = useCallback(
    async (text: string) => {
      if (!text.trim() || isTyping) return;
      const userMsg = createMessage('user', text.trim());
      setMessages((prev) => [...prev, userMsg]);
      setInput('');
      setActiveQuickReplies(undefined);

      const response = processUserInput(state, text.trim(), claimData);
      await addBotMessages(response.messages, response.quickReplies, response.nextState, response.claimData);

      // Send email notification when a ticket is confirmed
      if (response.ticketInfo) {
        sendTicketNotification({
          ...response.ticketInfo,
          claimData: response.claimData ?? claimData,
        });
      }
    },
    [state, isTyping, addBotMessages, claimData]
  );

  const handleReset = useCallback(() => {
    setMessages([]);
    setState('initial');
    setInput('');
    setIsTyping(false);
    setActiveQuickReplies(undefined);
    setScenarioRunning(false);
    setClaimData({});
  }, []);

  const handleRunScenario = useCallback(
    async (steps: string[]) => {
      handleReset();
      setScenarioRunning(true);
      await new Promise((r) => setTimeout(r, 200));

      let currentClaimData: ClaimData = {};

      for (const step of steps) {
        await new Promise((r) => setTimeout(r, 400));
        const userMsg = createMessage('user', step);
        setMessages((prev) => [...prev, userMsg]);

        const currentState = await new Promise<ConversationState>((resolve) => {
          setState((s) => {
            resolve(s);
            return s;
          });
        });

        const response = processUserInput(currentState, step, currentClaimData);
        if (response.claimData !== undefined) {
          currentClaimData = response.claimData;
          setClaimData(currentClaimData);
        }

        setIsTyping(true);
        setActiveQuickReplies(undefined);

        for (let i = 0; i < response.messages.length; i++) {
          await new Promise((r) => setTimeout(r, i === 0 ? 600 : 400));
          const isLast = i === response.messages.length - 1;
          const msg = createMessage('bot', response.messages[i], isLast ? response.quickReplies : undefined);
          setMessages((prev) => [...prev, msg]);
          if (isLast) setActiveQuickReplies(response.quickReplies);
        }

        setIsTyping(false);
        setState(response.nextState);
      }
      setScenarioRunning(false);
    },
    [handleReset]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(input);
    }
  };

  const showInput = !activeQuickReplies || activeQuickReplies.length === 0;

  return (
    <div className="flex flex-col h-full max-w-lg mx-auto bg-card shadow-2xl rounded-2xl overflow-hidden border border-border">
      <ChatHeader onReset={handleReset} />

      {/* Messages area */}
      <div
        className="flex-1 overflow-y-auto px-3 py-4 space-y-3"
        style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%239C92AC\' fill-opacity=\'0.03\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          backgroundColor: 'hsl(var(--chat-bg))',
        }}
      >
        {messages.length === 0 && !isTyping && (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground opacity-60 gap-2 py-20">
            <p className="text-sm">Escribí un mensaje para comenzar la conversación con Thanos</p>
          </div>
        )}

        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}

        {isTyping && <TypingIndicator />}

        {activeQuickReplies && activeQuickReplies.length > 0 && !isTyping && (
          <QuickReplies
            options={activeQuickReplies}
            onSelect={(opt) => handleSend(opt)}
            disabled={isTyping || scenarioRunning}
          />
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div className="border-t border-border bg-card px-3 py-2.5">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isTyping || scenarioRunning || (!showInput && activeQuickReplies && activeQuickReplies.length > 0)}
            placeholder={
              !showInput
                ? 'Seleccioná una opción arriba'
                : 'Escribí un mensaje...'
            }
            className="flex-1 bg-secondary text-foreground text-sm rounded-full px-4 py-2.5 outline-none placeholder:text-muted-foreground disabled:opacity-50 border border-transparent focus:border-[hsl(var(--chat-accent))] transition-colors"
          />
          <button
            onClick={() => handleSend(input)}
            disabled={!input.trim() || isTyping || scenarioRunning}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-[hsl(var(--chat-accent))] text-white hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>

      <ScenariosPanel onRunScenario={handleRunScenario} disabled={isTyping || scenarioRunning} />
    </div>
  );
};

export default ChatInterface;
