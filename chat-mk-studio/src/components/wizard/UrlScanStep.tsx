import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Globe, Facebook, Loader2, ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";
import { api } from "@/lib/api";

export interface ScrapedBusinessInfo {
  businessName?: string;
  industry?: string;
  businessDescription?: string;
  phone?: string;
  location?: string;
  workingHours?: string;
  tone?: string;
  suggestedPurpose?: string;
  suggestedGreeting?: string;
}

interface UrlScanStepProps {
  onScanComplete: (scannedInfo: ScrapedBusinessInfo) => void;
  onSkip: () => void;
}

export default function UrlScanStep({ onScanComplete, onSkip }: UrlScanStepProps) {
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [facebookUrl, setFacebookUrl] = useState("");
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<ScrapedBusinessInfo | null>(null);

  const normalizeUrl = (input: string) =>
    input.startsWith("http") ? input : `https://${input}`;

  const isValidUrl = (input: string) => {
    if (!input.trim()) return true; // empty is fine — it's optional
    try {
      const parsed = new URL(normalizeUrl(input));
      return ["http:", "https:"].includes(parsed.protocol);
    } catch {
      return false;
    }
  };

  const hasAnyUrl = websiteUrl.trim() || facebookUrl.trim();

  const handleScan = async () => {
    const website = websiteUrl.trim() ? normalizeUrl(websiteUrl.trim()) : "";
    const facebook = facebookUrl.trim() ? normalizeUrl(facebookUrl.trim()) : "";

    if (website && !isValidUrl(websiteUrl)) {
      setError("Невалиден линк за веб-страница.");
      return;
    }
    if (facebook && !isValidUrl(facebookUrl)) {
      setError("Невалиден линк за Facebook страница.");
      return;
    }
    if (!website && !facebook) return;

    setScanning(true);
    setError("");
    setResult(null);

    try {
      // Scrape both if provided, merge results (Facebook structured data + website AI analysis)
      let websiteResult: ScrapedBusinessInfo = {};
      let facebookResult: ScrapedBusinessInfo = {};

      if (facebook) {
        try {
          facebookResult = await api.post<ScrapedBusinessInfo>("/scrape", { url: facebook });
        } catch (err) {
          // If only Facebook was provided, propagate the error
          if (!website) {
            throw err;
          }
          // Otherwise, continue with just the website
          console.warn("Facebook scrape failed, continuing with website only");
        }
      }

      if (website) {
        try {
          websiteResult = await api.post<ScrapedBusinessInfo>("/scrape", { url: website });
        } catch (err) {
          // If only website was provided, propagate the error
          if (!facebook || !Object.keys(facebookResult).length) {
            throw err;
          }
          console.warn("Website scrape failed, continuing with Facebook only");
        }
      }

      // Merge: Facebook structured data takes priority, website fills gaps
      const merged: ScrapedBusinessInfo = {
        ...websiteResult,
        ...facebookResult,
        // Prefer longer description
        businessDescription:
          (facebookResult.businessDescription?.length || 0) >= (websiteResult.businessDescription?.length || 0)
            ? facebookResult.businessDescription || websiteResult.businessDescription
            : websiteResult.businessDescription || facebookResult.businessDescription,
        // Prefer website greeting since AI generates better ones
        suggestedGreeting: websiteResult.suggestedGreeting || facebookResult.suggestedGreeting,
      };

      if (!Object.values(merged).some(Boolean)) {
        setError("Не успеав да извлечам информации. Пробајте со друг линк или прескокнете.");
        return;
      }

      setResult(merged);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Грешка при скенирање. Пробајте повторно.");
    } finally {
      setScanning(false);
    }
  };

  const handleUseResults = () => {
    if (!result) return;
    onScanComplete(result);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display font-bold text-2xl text-foreground">
          Брзо поставување
        </h2>
        <p className="text-muted-foreground mt-2">
          Внесете го линкот на вашиот веб-сајт и/или Facebook страница за автоматски
          да ги пополниме основните информации. Двете полиња се опционални.
        </p>
      </div>

      {/* URL Inputs */}
      <div className="space-y-4">
        {/* Website URL */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground flex items-center gap-2">
            <Globe className="w-4 h-4 text-muted-foreground" />
            Веб-страница
            <span className="text-xs text-muted-foreground font-normal">(опционално)</span>
          </label>
          <Input
            value={websiteUrl}
            onChange={(e) => {
              setWebsiteUrl(e.target.value);
              setError("");
              setResult(null);
            }}
            placeholder="нпр. https://vasiot-biznis.mk"
            className="text-base h-11"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !scanning) {
                e.preventDefault();
                handleScan();
              }
            }}
            disabled={scanning}
            autoFocus
          />
        </div>

        {/* Facebook URL */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground flex items-center gap-2">
            <Facebook className="w-4 h-4 text-blue-500" />
            Facebook страница
            <span className="text-xs text-muted-foreground font-normal">(опционално)</span>
          </label>
          <Input
            value={facebookUrl}
            onChange={(e) => {
              setFacebookUrl(e.target.value);
              setError("");
              setResult(null);
            }}
            placeholder="нпр. https://facebook.com/VasaStrana"
            className="text-base h-11"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !scanning) {
                e.preventDefault();
                handleScan();
              }
            }}
            disabled={scanning}
          />
        </div>

        <Button
          onClick={handleScan}
          disabled={!hasAnyUrl || scanning}
          className="w-full gap-2 bg-gradient-accent text-white hover:opacity-90 h-11"
        >
          {scanning ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Анализирам...
            </>
          ) : (
            <>
              <Globe className="w-4 h-4" />
              Скенирај
            </>
          )}
        </Button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 bg-destructive/10 text-destructive text-sm rounded-lg px-4 py-3">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Results Preview */}
      {result && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-center gap-2 text-primary font-medium">
              <CheckCircle2 className="w-5 h-5" />
              Успешно скенирано!
            </div>

            <div className="space-y-3">
              {result.businessName && (
                <InfoRow label="Бизнис" value={result.businessName} />
              )}
              {result.industry && (
                <InfoRow label="Индустрија" value={industryLabel(result.industry)} />
              )}
              {result.businessDescription && (
                <InfoRow label="Опис" value={result.businessDescription} />
              )}
              {result.phone && <InfoRow label="Телефон" value={result.phone} />}
              {result.location && <InfoRow label="Локација" value={result.location} />}
              {result.workingHours && (
                <InfoRow label="Работно време" value={result.workingHours} />
              )}
            </div>

            <p className="text-xs text-muted-foreground">
              Овие информации ќе бидат пополнети во визардот. Можете да ги промените во секој чекор.
            </p>

            <Button
              onClick={handleUseResults}
              className="w-full gap-2 bg-gradient-accent text-white hover:opacity-90"
              size="lg"
            >
              <ArrowRight className="w-4 h-4" />
              Користи ги овие информации
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Skip */}
      <div className="text-center pt-2">
        <button
          onClick={onSkip}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4"
        >
          Прескокни — ќе ги внесам информациите рачно
        </button>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-3">
      <span className="text-xs font-medium text-muted-foreground min-w-[110px] shrink-0 uppercase tracking-wide">
        {label}
      </span>
      <span className="text-sm text-foreground">{value}</span>
    </div>
  );
}

const industryLabels: Record<string, string> = {
  retail: "Малопродажба / Е-трговија",
  hospitality: "Угостителство / Хотелиерство",
  healthcare: "Здравство / Медицина",
  education: "Образование",
  realestate: "Недвижности",
  finance: "Финансии / Осигурување",
  beauty: "Убавина / Козметика",
  automotive: "Автоиндустрија",
  legal: "Правни услуги",
  it_services: "ИТ / Технологија",
  food: "Храна / Ресторани / Достава",
  other: "Друго",
};

function industryLabel(key: string): string {
  return industryLabels[key] || key;
}
