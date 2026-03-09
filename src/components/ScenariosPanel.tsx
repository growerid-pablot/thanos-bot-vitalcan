import { ChevronDown, ChevronUp, Zap } from 'lucide-react';
import { useState } from 'react';
import { DEMO_SCENARIOS } from '@/lib/chatEngine';

interface ScenariosPanelProps {
  onRunScenario: (steps: string[]) => void;
  disabled?: boolean;
}

const ScenariosPanel = ({ onRunScenario, disabled }: ScenariosPanelProps) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-t border-border bg-card">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <span className="flex items-center gap-2">
          <Zap className="w-4 h-4" />
          Escenarios de prueba
        </span>
        {open ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
      </button>
      {open && (
        <div className="px-4 pb-3 grid grid-cols-2 gap-2 animate-fade-in">
          {DEMO_SCENARIOS.map((scenario) => (
            <button
              key={scenario.label}
              onClick={() => onRunScenario(scenario.steps)}
              disabled={disabled}
              className="text-xs px-3 py-2 rounded-lg bg-secondary text-secondary-foreground hover:bg-accent transition-colors text-left disabled:opacity-40"
            >
              {scenario.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ScenariosPanel;
