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

const strings = {
  en: {
    title: "Quick Setup",
    subtitle: "Enter your website and/or Facebook page URL to automatically fill in basic information. Both fields are optional.",
    websiteLabel: "Website",
    facebookLabel: "Facebook Page",
    optional: "(optional)",
    websitePlaceholder: "e.g. https://your-business.com",
    facebookPlaceholder: "e.g. https://facebook.com/YourPage",
    scanning: "Analyzing...",
    scan: "Scan",
    invalidWebsite: "Invalid website URL.",
    invalidFacebook: "Invalid Facebook page URL.",
    noResults: "Could not extract information. Try a different URL or skip.",
    scanError: "Error while scanning. Please try again.",
    scanSuccess: "Successfully scanned!",
    business: "Business",
    industry: "Industry",
    description: "Description",
    phone: "Phone",
    location: "Location",
    workingHours: "Working hours",
    prefillNote: "This information will be pre-filled in the wizard. You can change it at any step.",
    useResults: "Use this information",
    skip: "Skip — I'll enter the information manually",
  },
  mk: {
    title: "Брзо поставување",
    subtitle: "Внесете го линкот на вашиот веб-сајт и/или Facebook страница за автоматски да ги пополниме основните информации. Двете полиња се опционални.",
    websiteLabel: "Веб-страница",
    facebookLabel: "Facebook страница",
    optional: "(опционално)",
    websitePlaceholder: "нпр. https://vasiot-biznis.mk",
    facebookPlaceholder: "нпр. https://facebook.com/VasaStrana",
    scanning: "Анализирам...",
    scan: "Скенирај",
    invalidWebsite: "Невалиден линк за веб-страница.",
    invalidFacebook: "Невалиден линк за Facebook страница.",
    noResults: "Не успеав да извлечам информации. Пробајте со друг линк или прескокнете.",
    scanError: "Грешка при скенирање. Пробајте повторно.",
    scanSuccess: "Успешно скенирано!",
    business: "Бизнис",
    industry: "Индустрија",
    description: "Опис",
    phone: "Телефон",
    location: "Локација",
    workingHours: "Работно време",
    prefillNote: "Овие информации ќе бидат пополнети во визардот. Можете да ги промените во секој чекор.",
    useResults: "Користи ги овие информации",
    skip: "Прескокни — ќе ги внесам информациите рачно",
  },
};

const industryLabelsI18n = {
  en: {
    retail: "Retail / E-commerce",
    hospitality: "Hospitality / Hotels",
    healthcare: "Healthcare / Medicine",
    education: "Education",
    realestate: "Real Estate",
    finance: "Finance / Insurance",
    beauty: "Beauty / Cosmetics",
    automotive: "Automotive",
    legal: "Legal Services",
    it_services: "IT / Technology",
    food: "Food / Restaurants / Delivery",
    other: "Other",
  } as Record<string, string>,
  mk: {
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
  } as Record<string, string>,
};

interface UrlScanStepProps {
  onScanComplete: (scannedInfo: ScrapedBusinessInfo) => void;
  onSkip: () => void;
  lang?: "en" | "mk";
}

export default function UrlScanStep({ onScanComplete, onSkip, lang = "mk" }: UrlScanStepProps) {
  const c = strings[lang];
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
      setError(c.invalidWebsite);
      return;
    }
    if (facebook && !isValidUrl(facebookUrl)) {
      setError(c.invalidFacebook);
      return;
    }
    if (!website && !facebook) return;

    setScanning(true);
    setError("");
    setResult(null);

    try {
      let websiteResult: ScrapedBusinessInfo = {};
      let facebookResult: ScrapedBusinessInfo = {};

      if (facebook) {
        try {
          facebookResult = await api.post<ScrapedBusinessInfo>("/scrape", { url: facebook });
        } catch (err) {
          if (!website) {
            throw err;
          }
          console.warn("Facebook scrape failed, continuing with website only");
        }
      }

      if (website) {
        try {
          websiteResult = await api.post<ScrapedBusinessInfo>("/scrape", { url: website });
        } catch (err) {
          if (!facebook || !Object.keys(facebookResult).length) {
            throw err;
          }
          console.warn("Website scrape failed, continuing with Facebook only");
        }
      }

      const merged: ScrapedBusinessInfo = {
        ...websiteResult,
        ...facebookResult,
        businessDescription:
          (facebookResult.businessDescription?.length || 0) >= (websiteResult.businessDescription?.length || 0)
            ? facebookResult.businessDescription || websiteResult.businessDescription
            : websiteResult.businessDescription || facebookResult.businessDescription,
        suggestedGreeting: websiteResult.suggestedGreeting || facebookResult.suggestedGreeting,
      };

      if (!Object.values(merged).some(Boolean)) {
        setError(c.noResults);
        return;
      }

      setResult(merged);
    } catch (err) {
      setError(err instanceof Error ? err.message : c.scanError);
    } finally {
      setScanning(false);
    }
  };

  const handleUseResults = () => {
    if (!result) return;
    onScanComplete(result);
  };

  const industryLabels = industryLabelsI18n[lang];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display font-bold text-2xl text-foreground">
          {c.title}
        </h2>
        <p className="text-muted-foreground mt-2">
          {c.subtitle}
        </p>
      </div>

      {/* URL Inputs */}
      <div className="space-y-4">
        {/* Website URL */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground flex items-center gap-2">
            <Globe className="w-4 h-4 text-muted-foreground" />
            {c.websiteLabel}
            <span className="text-xs text-muted-foreground font-normal">{c.optional}</span>
          </label>
          <Input
            value={websiteUrl}
            onChange={(e) => {
              setWebsiteUrl(e.target.value);
              setError("");
              setResult(null);
            }}
            placeholder={c.websitePlaceholder}
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
            {c.facebookLabel}
            <span className="text-xs text-muted-foreground font-normal">{c.optional}</span>
          </label>
          <Input
            value={facebookUrl}
            onChange={(e) => {
              setFacebookUrl(e.target.value);
              setError("");
              setResult(null);
            }}
            placeholder={c.facebookPlaceholder}
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
              {c.scanning}
            </>
          ) : (
            <>
              <Globe className="w-4 h-4" />
              {c.scan}
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
              {c.scanSuccess}
            </div>

            <div className="space-y-3">
              {result.businessName && (
                <InfoRow label={c.business} value={result.businessName} />
              )}
              {result.industry && (
                <InfoRow label={c.industry} value={industryLabels[result.industry] || result.industry} />
              )}
              {result.businessDescription && (
                <InfoRow label={c.description} value={result.businessDescription} />
              )}
              {result.phone && <InfoRow label={c.phone} value={result.phone} />}
              {result.location && <InfoRow label={c.location} value={result.location} />}
              {result.workingHours && (
                <InfoRow label={c.workingHours} value={result.workingHours} />
              )}
            </div>

            <p className="text-xs text-muted-foreground">
              {c.prefillNote}
            </p>

            <Button
              onClick={handleUseResults}
              className="w-full gap-2 bg-gradient-accent text-white hover:opacity-90"
              size="lg"
            >
              <ArrowRight className="w-4 h-4" />
              {c.useResults}
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
          {c.skip}
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
