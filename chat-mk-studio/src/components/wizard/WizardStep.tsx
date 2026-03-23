import { WizardQuestion, WizardAnswers } from "./types";
import { q, ph } from "./wizardConfig";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface WizardStepProps {
  question: WizardQuestion;
  answers: WizardAnswers;
  value: string | string[];
  onChange: (value: string | string[]) => void;
}

const WizardStep = ({ question, answers, value, onChange }: WizardStepProps) => {
  const questionText = q(question.question, answers);
  const subtitleText = question.subtitle
    ? typeof question.subtitle === "function"
      ? question.subtitle(answers)
      : question.subtitle
    : null;
  const placeholderText = ph(question.placeholder, answers);

  const strValue = typeof value === "string" ? value : "";
  const arrValue = Array.isArray(value) ? value : [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display font-bold text-2xl text-foreground">
          {questionText}
        </h2>
        {subtitleText && (
          <p className="text-muted-foreground mt-2">{subtitleText}</p>
        )}
      </div>

      {question.type === "text" && (
        <Input
          value={strValue}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholderText}
          className="text-base h-12"
          autoFocus
        />
      )}

      {question.type === "textarea" && (
        <Textarea
          value={strValue}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholderText}
          className="text-base min-h-[120px] resize-none"
          autoFocus
        />
      )}

      {question.type === "radio" && question.options && (
        <RadioGroup
          value={strValue}
          onValueChange={(v) => onChange(v)}
          className="space-y-3"
        >
          {question.options.map((opt) => (
            <label
              key={opt.value}
              className={cn(
                "flex items-start gap-4 rounded-xl border-2 p-4 cursor-pointer transition-all hover:border-primary/40",
                strValue === opt.value
                  ? "border-primary bg-primary/5 shadow-sm"
                  : "border-border"
              )}
            >
              <RadioGroupItem value={opt.value} className="mt-0.5 shrink-0" />
              <div>
                <span className="font-medium text-foreground">{opt.label}</span>
                {opt.description && (
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {opt.description}
                  </p>
                )}
              </div>
            </label>
          ))}
        </RadioGroup>
      )}

      {question.type === "checkbox" && question.options && (
        <div className="space-y-3">
          {question.options.map((opt) => {
            const checked = arrValue.includes(opt.value);
            return (
              <label
                key={opt.value}
                className={cn(
                  "flex items-start gap-4 rounded-xl border-2 p-4 cursor-pointer transition-all hover:border-primary/40",
                  checked
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-border"
                )}
              >
                <Checkbox
                  checked={checked}
                  onCheckedChange={(isChecked) => {
                    if (opt.value === "none") {
                      onChange(isChecked ? ["none"] : []);
                      return;
                    }
                    if (isChecked) {
                      onChange([...arrValue.filter((v) => v !== "none"), opt.value]);
                    } else {
                      onChange(arrValue.filter((v) => v !== opt.value));
                    }
                  }}
                  className="mt-0.5 shrink-0"
                />
                <div>
                  <span className="font-medium text-foreground">{opt.label}</span>
                  {opt.description && (
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {opt.description}
                    </p>
                  )}
                </div>
              </label>
            );
          })}
        </div>
      )}

      {question.type === "select" && question.options && (
        <Select value={strValue} onValueChange={(v) => onChange(v)}>
          <SelectTrigger className="text-base h-12">
            <SelectValue placeholder="Изберете..." />
          </SelectTrigger>
          <SelectContent>
            {question.options.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
};

export default WizardStep;
