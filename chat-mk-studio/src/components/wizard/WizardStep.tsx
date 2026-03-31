import { WizardQuestion, WizardAnswers } from "./types";
import { q, ph } from "./wizardConfig";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
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
  /** When true, renders with a smaller heading for grouped display */
  compact?: boolean;
  lang?: "en" | "mk";
}

const WizardStep = ({ question, answers, value, onChange, compact = false, lang = "mk" }: WizardStepProps) => {
  const isEn = lang === "en";
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
    <div className={compact ? "space-y-3" : "space-y-6"}>
      <div>
        {compact ? (
          <label className="font-medium text-sm text-foreground">
            {questionText}
            {!question.required && (
              <span className="text-muted-foreground font-normal ml-1">{isEn ? "(optional)" : "(опционално)"}</span>
            )}
          </label>
        ) : (
          <h2 className="font-display font-bold text-2xl text-foreground">
            {questionText}
          </h2>
        )}
        {subtitleText && (
          <p className={cn(
            "text-muted-foreground",
            compact ? "text-xs mt-1" : "mt-2"
          )}>
            {subtitleText}
          </p>
        )}
      </div>

      {question.type === "text" && (
        <Input
          value={strValue}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholderText}
          className={compact ? "text-sm h-10" : "text-base h-12"}
        />
      )}

      {question.type === "textarea" && (
        <Textarea
          value={strValue}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholderText}
          className={cn(
            "resize-none",
            compact ? "text-sm min-h-[80px]" : "text-base min-h-[120px]"
          )}
        />
      )}

      {question.type === "radio" && question.options && (
        <RadioGroup
          value={strValue}
          onValueChange={(v) => onChange(v)}
          className={compact ? "space-y-2" : "space-y-3"}
        >
          {question.options.map((opt) => (
            <label
              key={opt.value}
              className={cn(
                "flex items-start gap-3 rounded-xl border-2 cursor-pointer transition-all hover:border-primary/40",
                compact ? "p-3" : "p-4 gap-4",
                strValue === opt.value
                  ? "border-primary bg-primary/5 shadow-sm"
                  : "border-border"
              )}
            >
              <RadioGroupItem value={opt.value} className="mt-0.5 shrink-0" />
              <div>
                <span className={cn("font-medium text-foreground", compact && "text-sm")}>
                  {opt.label}
                </span>
                {opt.description && (
                  <p className={cn("text-muted-foreground", compact ? "text-xs mt-0.5" : "text-sm mt-0.5")}>
                    {opt.description}
                  </p>
                )}
              </div>
            </label>
          ))}
        </RadioGroup>
      )}

      {question.type === "checkbox" && question.options && (
        <div className={compact ? "space-y-2" : "space-y-3"}>
          {question.options.map((opt) => {
            const checked = arrValue.includes(opt.value);
            return (
              <label
                key={opt.value}
                className={cn(
                  "flex items-start gap-3 rounded-xl border-2 cursor-pointer transition-all hover:border-primary/40",
                  compact ? "p-3" : "p-4 gap-4",
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
                  <span className={cn("font-medium text-foreground", compact && "text-sm")}>
                    {opt.label}
                  </span>
                  {opt.description && (
                    <p className={cn("text-muted-foreground", compact ? "text-xs mt-0.5" : "text-sm mt-0.5")}>
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
          <SelectTrigger className={compact ? "text-sm h-10" : "text-base h-12"}>
            <SelectValue placeholder={isEn ? "Select..." : "Изберете..."} />
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
