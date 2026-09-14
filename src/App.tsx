import { type FormEvent, type ReactNode, useEffect, useState } from "react";
import {
  QueryClient,
  QueryClientProvider,
  useQueryClient,
} from "@tanstack/react-query";
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Bell,
  Bot,
  Camera,
  HelpCircle,
  MapPin,
  MessageCircle,
  Mic,
  PhoneCall,
  Settings,
  Volume2,
  Check,
  CheckCircle2,
  ChevronRight,
  CalendarDays,
  Clock3,
  Coins,
  CloudOff,
  Droplets,
  FileCheck2,
  Home,
  IndianRupee,
  Languages,
  Leaf,
  LocateFixed,
  Menu,
  PackageCheck,
  Phone,
  Timer,
  RefreshCw,
  ScanLine,
  Search,
  ShieldCheck,
  Sprout,
  Truck,
  UserRound,
  Users,
  Wheat,
  X,
} from "lucide-react";
import {
  getGetFarmerDashboardQueryKey,
  getGetFarmerPaymentsQueryKey,
  getGetOfficialDashboardQueryKey,
  getGetQueueTokenQueryKey,
  getHealthCheckQueryKey,
  getListCenterQueueQueryKey,
  getListAvailableSlotsQueryKey,
  getListProcurementCentersQueryKey,
  useCreateBooking,
  useCreateProcurementRecord,
  useGetFarmerDashboard,
  useGetFarmerPayments,
  useGetOfficialDashboard,
  useGetQueueToken,
  useHealthCheck,
  useListAvailableSlots,
  useListCenterQueue,
  useListProcurementCenters,
  useUpdateQueueTokenStatus,
} from "@/api-client";
import { localApiRequest } from "@/data/demo-state";
import type {
  ProcurementInputQualityGrade,
  QueueStatusInputStatus,
} from "@/api-client";
import { ErrorBoundary } from "@/components/error-boundary";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider, languages, useLanguage } from "@/lib/i18n";
import NotFound from "@/pages/not-found";
import {
  Link,
  Route,
  Router as WouterRouter,
  Switch,
  useLocation,
  useParams,
} from "wouter";
import "./index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
      staleTime: 30_000,
    },
  },
});
const DEMO_FARMER_ID = "farmer-001";
const DEMO_CENTER_ID = "center-churu-01";

type Tone = "yellow" | "green" | "blue" | "red" | "ink";

function cn(...parts: Array<string | false | undefined>) {
  return parts.filter(Boolean).join(" ");
}

function Button({
  children,
  className,
  variant = "primary",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "soft" | "outline" | "ghost" | "danger";
}) {
  return (
    <button
      className={cn(
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition-transform duration-200 active:scale-[.98] disabled:pointer-events-none disabled:opacity-45",
        variant === "primary" &&
          "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-[0_8px_20px_hsl(205_46%_29%/.15)] hover:-translate-y-0.5",
        variant === "soft" &&
          "bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))] hover:-translate-y-0.5",
        variant === "outline" &&
          "border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--foreground))] hover:border-[hsl(var(--primary))]",
        variant === "ghost" &&
          "text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]",
        variant === "danger" &&
          "bg-[hsl(var(--destructive))] text-[hsl(var(--destructive-foreground))]",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

function Card({
  children,
  className = "",
  accent,
}: {
  children: ReactNode;
  className?: string;
  accent?: Tone;
}) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-[hsl(var(--card-border))] bg-[hsl(var(--card))] shadow-[0_12px_30px_hsl(205_46%_29%/.06)]",
        accent &&
          `border-t-4 border-t-[hsl(var(--${accent === "yellow" ? "accent" : accent === "green" ? "secondary" : accent === "red" ? "destructive" : "primary"}))]`,
        className,
      )}
    >
      {children}
    </section>
  );
}

function Badge({
  children,
  tone = "ink",
}: {
  children: ReactNode;
  tone?: Tone;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold",
        tone === "yellow" &&
          "bg-[hsl(var(--accent)/.27)] text-[hsl(36_63%_28%)]",
        tone === "green" &&
          "bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))]",
        tone === "blue" &&
          "bg-[hsl(var(--primary)/.1)] text-[hsl(var(--primary))]",
        tone === "red" &&
          "bg-[hsl(var(--destructive)/.1)] text-[hsl(var(--destructive))]",
        tone === "ink" &&
          "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]",
      )}
    >
      {children}
    </span>
  );
}

function FieldMark({ small = false }: { small?: boolean }) {
  return (
    <div
      className={cn(
        "grid flex-shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-white shadow-sm ring-1 ring-[hsl(var(--border))]",
        small ? "h-9 w-9" : "h-14 w-14",
      )}
    >
      <img
        src="/logo.png"
        alt="FasalFlux logo"
        className={cn(
          "h-full w-full object-contain ",
          small ? "scale-[1.05]" : "scale-[1.1]",
        )}
      />
    </div>
  );
}

function LanguageSelector() {
  const { language, setLanguage } = useLanguage();
  return (
    <label className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))]">
      <Languages size={16} />
      <span className="sr-only">Language</span>
      <select
        aria-label="Language"
        data-testid="select-language"
        value={language}
        onChange={(event) => setLanguage(event.target.value as typeof language)}
        className="cursor-pointer bg-transparent font-semibold outline-none"
      >
        {languages.map((item) => (
          <option key={item.code} value={item.code}>
            {item.nativeLabel}
          </option>
        ))}
      </select>
    </label>
  );
}

function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-lg bg-[hsl(var(--muted))]",
        className,
      )}
    />
  );
}

function EmptyState({
  icon: Icon,
  title,
  detail,
  action,
}: {
  icon: typeof Leaf;
  title: string;
  detail: string;
  action?: ReactNode;
}) {
  const { t } = useLanguage();
  return (
    <div className="grid min-h-56 place-items-center p-8 text-center">
      <div>
        <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))]">
          <Icon size={22} />
        </div>
        <h3 className="font-display text-xl">{t(title)}</h3>
        <p className="mx-auto mt-1 max-w-sm text-sm text-[hsl(var(--muted-foreground))]">
          {t(detail)}
        </p>
        {action && <div className="mt-5">{action}</div>}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status?: string }) {
  const { t } = useLanguage();
  const map: Record<string, { label: string; tone: Tone }> = {
    booked: { label: t("Booked"), tone: "blue" },
    checked_in: { label: t("Checked in"), tone: "yellow" },
    weighing: { label: t("Weighing"), tone: "yellow" },
    quality_check: { label: t("Quality check"), tone: "blue" },
    completed: { label: t("Completed"), tone: "green" },
    cancelled: { label: t("Cancelled"), tone: "red" },
    open: { label: t("Open now"), tone: "green" },
    busy: { label: t("Busy"), tone: "yellow" },
    closed: { label: t("Closed"), tone: "red" },
    approved: { label: t("Approved"), tone: "blue" },
    processing: { label: t("Processing"), tone: "yellow" },
    paid: { label: t("Paid"), tone: "green" },
  };
  const item = map[status ?? ""] ?? {
    label: status ? t(status.replace("_", " ")) : t("Unknown"),
    tone: "ink" as Tone,
  };
  return <Badge tone={item.tone}>{item.label}</Badge>;
}

function AppShell({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [panel, setPanel] = useState<"notifications" | "profile" | null>(null);
  const { t } = useLanguage();
  const health = useHealthCheck({
    query: { queryKey: getHealthCheckQueryKey() },
  });
  const official = location.startsWith("/official");
  const profileIntroText = official
    ? t("Officer profile")
    : t("Farmer profile");
  const notificationPanelTitle = official
    ? t("Centre alerts")
    : t("Notifications");
  const notificationPanelHeading = official
    ? t("Operations updates")
    : t("Recent updates");
  const topHeaderText = official
    ? t("Churu Grain Centre")
    : formatLongDate(todayIso());
  const farmerLinks = [
    { href: "/farmer", label: t("My day"), icon: Home },
    { href: "/farmer/book", label: t("Book a slot"), icon: CalendarIcon },
    { href: "/farmer/token/current", label: t("Queue"), icon: Users },
    { href: "/farmer/payments", label: t("Payments"), icon: IndianRupee },
    { href: "/farmer/help", label: t("Help"), icon: Phone },
  ];
  const officialLinks = [
    { href: "/official", label: t("Centre overview"), icon: BarChart3 },
    { href: "/official/queue", label: t("Live queue"), icon: Users },
    {
      href: "/official/procurement",
      label: t("Record procurement"),
      icon: FileCheck2,
    },
  ];
  const links = official ? officialLinks : farmerLinks;
  return (
    <div className="grain min-h-[100dvh] bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-72 flex-col bg-[hsl(var(--sidebar))] p-5 text-[hsl(var(--sidebar-foreground))] transition-transform duration-300 lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center gap-3 border-b border-[hsl(var(--sidebar-border))] pb-6">
          <FieldMark small />
          <div>
            <div className="font-display text-[30px] leading-none">
              <span className="text-white">FASAL</span>
              <span className="text-yellow-400">FLUX</span>
            </div>
            <div className="mt-1 text-[6px] font-bold uppercase tracking-[.18em] text-gray-500 text-[hsl(var(--sidebar-foreground)/.6)]">
              {t("  ------The Continuous Flow Of Crop------")}
            </div>
          </div>
        </div>
        <div className="mt-7 flex items-center gap-3 rounded-2xl bg-[hsl(var(--sidebar-accent))] p-3">
          <div className="grid h-9 w-9 place-items-center rounded-full bg-[hsl(var(--sidebar-primary))] font-bold text-[hsl(var(--sidebar-primary-foreground))]">
            {official ? "AM" : "RK"}
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold">
              {official ? "Arjun Meena" : "Ramesh Kumar"}
            </div>
            <div className="text-xs text-[hsl(var(--sidebar-foreground)/.62)]">
              {official ? t("Mandi Officer · Churu") : t("Bhadra village")}
            </div>
          </div>
        </div>
        <nav className="mt-8 flex-1 space-y-1">
          <div className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[.18em] text-[hsl(var(--sidebar-foreground)/.5)]">
            {official ? t("Centre desk") : t("Farmer view")}
          </div>
          {links.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              data-testid={`link-${label.toLowerCase().replaceAll(" ", "-")}`}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition-colors",
                location === href
                  ? "bg-[hsl(var(--sidebar-primary))] font-bold text-[hsl(var(--sidebar-primary-foreground))]"
                  : "text-[hsl(var(--sidebar-foreground)/.7)] hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-foreground))]",
              )}
            >
              <Icon size={18} />
              <span>{label}</span>
              {location === href && (
                <ChevronRight className="ml-auto" size={16} />
              )}
            </Link>
          ))}
          <div className="my-6 border-t border-[hsl(var(--sidebar-border))]" />
          <Link
            href={official ? "/farmer" : "/official"}
            data-testid="link-switch-view"
            className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-[hsl(var(--sidebar-foreground)/.7)] hover:bg-[hsl(var(--sidebar-accent))]"
          >
            <RefreshCw size={17} />
            <span>
              {official
                ? t("Switch to farmer view")
                : t("Switch to official desk")}
            </span>
          </Link>
        </nav>
        <div className="rounded-2xl border border-[hsl(var(--sidebar-border))] p-3 text-xs text-[hsl(var(--sidebar-foreground)/.65)]">
          <div className="flex items-center gap-2 font-semibold text-[hsl(var(--sidebar-foreground))]">
            <span
              className={cn(
                "h-2 w-2 rounded-full",
                health.isError
                  ? "bg-[hsl(var(--destructive))]"
                  : "animate-pulse-soft bg-[hsl(var(--sidebar-primary))]",
              )}
            />{" "}
            {health.isError
              ? t("Working offline")
              : t("Connected to centre network")}
          </div>
          <p className="mt-2 leading-relaxed">
            {t("Your last updates stay visible even when signal drops.")}
          </p>
        </div>
      </aside>
      {mobileOpen && (
        <button
          aria-label="Close menu"
          data-testid="button-close-menu"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-30 bg-[hsl(var(--foreground)/.35)] lg:hidden"
        >
          <span className="sr-only">Close</span>
        </button>
      )}
      <main className="min-h-[100dvh] lg:pl-72">
        <header className="sticky top-0 z-20 flex h-[72px] items-center justify-between border-b border-[hsl(var(--border))] bg-[hsl(var(--background)/.92)] px-4 backdrop-blur-md sm:px-8">
          <div className="flex items-center gap-3">
            <button
              aria-label="Open menu"
              data-testid="button-open-menu"
              onClick={() => setMobileOpen(true)}
              className="rounded-lg p-2 hover:bg-[hsl(var(--muted))] lg:hidden"
            >
              <Menu size={21} />
            </button>
            <div className="lg:hidden">
              <FieldMark small />
            </div>
            <div className="hidden text-sm text-[hsl(var(--muted-foreground))] sm:block">
              {topHeaderText}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSelector />
            <button
              data-testid="button-notifications"
              aria-label={notificationPanelTitle}
              onClick={() =>
                setPanel(panel === "notifications" ? null : "notifications")
              }
              className="relative rounded-lg p-2 text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))]"
            >
              <Bell size={18} />
              <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-[hsl(var(--accent))]" />
            </button>
            <button
              data-testid="button-profile"
              aria-label={profileIntroText}
              onClick={() => setPanel(panel === "profile" ? null : "profile")}
              className="ml-1 grid h-8 w-8 place-items-center rounded-full bg-[hsl(var(--primary))] text-xs font-bold text-[hsl(var(--primary-foreground))]"
            >
              {official ? "AM" : "RK"}
            </button>
          </div>
        </header>
        {panel && (
          <>
            <button
              aria-label="Close panel"
              onClick={() => setPanel(null)}
              className="fixed inset-0 z-40 bg-[hsl(var(--foreground)/.08)]"
            />
            <div className="fixed right-4 top-[82px] z-50 w-[min(92vw,380px)] rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 shadow-2xl sm:right-8">
              {panel === "notifications" ? (
                <div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold uppercase tracking-[.14em] text-[hsl(var(--muted-foreground))]">
                        {notificationPanelTitle}
                      </div>
                      <h3 className="mt-1 font-display text-2xl">
                        {notificationPanelHeading}
                      </h3>
                    </div>
                    <button
                      onClick={() => setPanel(null)}
                      className="rounded-lg p-2 hover:bg-[hsl(var(--muted))]"
                    >
                      <X size={17} />
                    </button>
                  </div>
                  <div className="mt-4 divide-y divide-[hsl(var(--border))]">
                    {(official
                      ? [
                          [
                            t("Queue alert"),
                            t(
                              "G-102 is at weighing. Next farmer can be called.",
                            ),
                          ],
                          [
                            t("Capacity update"),
                            t(
                              "Centre load is at 82%. 12 slots remain available.",
                            ),
                          ],
                          [
                            t("Payment batch"),
                            t(
                              "Today’s procurement payment batch is being processed.",
                            ),
                          ],
                        ]
                      : [
                          [
                            t("Slot reminder"),
                            t(
                              "Your 10:00 AM slot at Central Mandi is coming up.",
                            ),
                          ],
                          [
                            t("Queue update"),
                            t("G-103 is processing. You have 3 tokens ahead."),
                          ],
                          [
                            t("Payment update"),
                            t("DBT-RAJ-88376 is still processing."),
                          ],
                        ]
                    ).map(([title, detail]) => (
                      <div key={title} className="py-3">
                        <div className="flex items-start gap-3">
                          <div className="mt-1 h-2 w-2 rounded-full bg-[hsl(var(--accent))]" />
                          <div>
                            <div className="text-sm font-semibold">{title}</div>
                            <div className="mt-1 text-xs leading-relaxed text-[hsl(var(--muted-foreground))]">
                              {detail}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold uppercase tracking-[.14em] text-[hsl(var(--muted-foreground))]">
                        {profileIntroText}
                      </div>
                      <h3 className="mt-1 font-display text-2xl">
                        {official ? "Arjun Meena" : "Ramesh Kumar"}
                      </h3>
                    </div>
                    <button
                      onClick={() => setPanel(null)}
                      className="rounded-lg p-2 hover:bg-[hsl(var(--muted))]"
                    >
                      <X size={17} />
                    </button>
                  </div>
                  {official ? (
                    <div className="mt-5 space-y-3 text-sm">
                      <div className="rounded-xl bg-[hsl(var(--muted))] p-4">
                        <div className="text-xs text-[hsl(var(--muted-foreground))]">
                          {t("Role")}
                        </div>
                        <strong>{t("Mandi Officer")}</strong>
                      </div>
                      <div className="rounded-xl bg-[hsl(var(--muted))] p-4">
                        <div className="text-xs text-[hsl(var(--muted-foreground))]">
                          {t("Centre")}
                        </div>
                        <strong>{t("Central Mandi · Churu")}</strong>
                      </div>
                      <div className="rounded-xl bg-[hsl(var(--muted))] p-4">
                        <div className="text-xs text-[hsl(var(--muted-foreground))]">
                          {t("Desk status")}
                        </div>
                        <strong>{t("● On duty · Connected")}</strong>
                      </div>
                      <div className="rounded-xl border border-[hsl(var(--border))] p-4">
                        <div className="text-xs text-[hsl(var(--muted-foreground))]">
                          {t("Access")}
                        </div>
                        <strong>
                          {t("Queue · Gate · Procurement · Capacity")}
                        </strong>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-5 space-y-3 text-sm">
                      <div className="rounded-xl bg-[hsl(var(--muted))] p-4">
                        <div className="text-xs text-[hsl(var(--muted-foreground))]">
                          {t("Village")}
                        </div>
                        <strong>{t("Bhaleri, Churu")}</strong>
                      </div>
                      <div className="rounded-xl bg-[hsl(var(--muted))] p-4">
                        <div className="text-xs text-[hsl(var(--muted-foreground))]">
                          {t("Phone")}
                        </div>
                        <strong>{t("+91 98765 43210")}</strong>
                      </div>
                      <Link
                        href="/farmer/keypad-help"
                        onClick={() => setPanel(null)}
                        className="flex items-center gap-3 rounded-xl border border-[hsl(var(--border))] p-4 hover:border-[hsl(var(--primary))]"
                      >
                        <Settings size={18} />
                        <span>
                          <strong className="block">
                            {t("Settings & access")}
                          </strong>
                          <span className="text-xs text-[hsl(var(--muted-foreground))]">
                            {t("Language, keypad, voice and help")}
                          </span>
                        </span>
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}
        <div className="mx-auto max-w-[1440px] px-4 py-7 sm:px-8 lg:px-10">
          {children}
        </div>
      </main>
      {!official && <FarmerChatbot />}
    </div>
  );
}

function FarmerChatbot() {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [chatLanguage, setChatLanguage] = useState<"en" | "hi" | "te" | "pa">(
    "en",
  );
  const [chatSize, setChatSize] = useState<"small" | "full">("small");

  const chatCopy = {
    en: {
      intro:
        "Namaste! I can help with slots, queue, payments and mandi directions.",
      selectLanguage: "Select language",
      options: {
        book: "Book a slot",
        queue: "Track my queue",
        payment: "Payment status",
        help: "Keypad / IVR help",
      },
      replies: {
        "Book a slot":
          "Open Book Slot and choose crop, mandi, date and an available time. Only future slots can be booked.",
        "Track my queue":
          "Open Queue to see your token, position, people ahead and estimated wait.",
        "Payment status":
          "Open Payments to see paid, processing and approved procurement payments.",
        "Keypad / IVR help":
          "Use the Keypad & Voice Help page for the toll-free, keypad and voice journey.",
      },
    },
    hi: {
      intro:
        "नमस्ते! मैं स्लॉट, कतार, भुगतान और मंडी दिशा में मदद कर सकता हूँ।",
      selectLanguage: "भाषा चुनें",
      options: {
        book: "स्लॉट बुक करें",
        queue: "मेरी कतार देखें",
        payment: "भुगतान स्थिति",
        help: "कीपैड / IVR सहायता",
      },
      replies: {
        "स्लॉट बुक करें":
          "बुक स्लॉट खोलें और फसल, मंडी, तिथि और उपलब्ध समय चुनें। केवल भविष्य के स्लॉट ही बुक किए जा सकते हैं।",
        "मेरी कतार देखें":
          "कतार खोलें और अपना टोकन, स्थिति, आगे वाले लोगों और अनुमानित प्रतीक्षा समय देखें।",
        "भुगतान स्थिति":
          "भुगतान पेज खोलें और भुगतान का भरा, प्रसंस्करण और स्वीकृत रिकॉर्ड देखें।",
        "कीपैड / IVR सहायता":
          "कीपैड और वॉइस हेल्प पेज पर टोल-फ्री, कीपैड और वॉइस यात्रा के लिए जाएँ।",
      },
    },
    te: {
      intro:
        "வணக்கம்! ஸ்லாட், வரிசை, கட்டணம் மற்றும் மண்டி வழிகளுக்கு உதவ முடியும்.",
      selectLanguage: "மொழியைத் தேர்ந்தெடுக்கவும்",
      options: {
        book: "நேரத்தை முன்பதிவு செய்",
        queue: "என் வரிசையைப் பார்",
        payment: "கட்டண நிலை",
        help: "கீபேட் / IVR உதவி",
      },
      replies: {
        "நேரத்தை முன்பதிவு செய்":
          "முன்பதிவு ஸ்லாட் திறந்து பயிர், மண்டி, தேதி மற்றும் கிடைக்கும் நேரத்தைத் தேர்வு செய்யவும். எதிர்கால நேரங்கள் மட்டுமே முன்பதிவு செய்ய முடியும்.",
        "என் வரிசையைப் பார்":
          "வரிசையைத் திறந்து உங்கள் டோக்கன், நிலை, முன்னே உள்ளவர்கள் மற்றும் மதிப்பிடப்பட்ட காத்திருப்பை பாருங்கள்.",
        "கட்டண நிலை":
          "கட்டணப் பக்கத்தைத் திறந்து செலுத்திய, செயலாக்கத்தில் உள்ள மற்றும் அங்கீகரிக்கப்பட்ட பணிகளைப் பாருங்கள்.",
        "கீபேட் / IVR உதவி":
          "கீபேட் மற்றும் குரல் உதவி பக்கத்தில் டோல்ஃப்ரீ, கீபேட் மற்றும் குரல் பயணத்திற்கு செல்லுங்கள்.",
      },
    },
    pa: {
      intro:
        "ਸਤ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ ਸਲਾਟ, ਕਤਾਰ, ਭੁਗਤਾਨ ਅਤੇ ਮੰਡੀ ਦਿਸ਼ਾ ਵਿੱਚ ਮਦਦ ਕਰ ਸਕਦਾ ਹਾਂ।",
      selectLanguage: "ਭਾਸ਼ਾ ਚੁਣੋ",
      options: {
        book: "ਸਲਾਟ ਬੁੱਕ ਕਰੋ",
        queue: "ਮੇਰੀ ਕਤਾਰ ਵੇਖੋ",
        payment: "ਭੁਗਤਾਨ ਸਥਿਤੀ",
        help: "ਕੀਪੈਡ / IVR ਮਦਦ",
      },
      replies: {
        "ਸਲਾਟ ਬੁੱਕ ਕਰੋ":
          "ਬੁੱਕ ਸਲਾਟ ਖੋਲ੍ਹੋ ਅਤੇ ਫਸਲ, ਮੰਡੀ, ਤਾਰੀਖ ਅਤੇ ਉਪਲਬਧ ਸਮਾਂ ਚੁਣੋ। ਸਿਰਫ ਭਵਿੱਖ ਦੇ ਸਲਾਟ ਹੀ ਬੁੱਕ ਕੀਤੇ ਜਾ ਸਕਦੇ ਹਨ।",
        "ਮੇਰੀ ਕਤਾਰ ਵੇਖੋ":
          "ਕਤਾਰ ਖੋਲ੍ਹੋ ਅਤੇ ਆਪਣਾ ਟੋਕਨ, ਸਥਿਤੀ, ਅੱਗੇ ਲੋਕ ਅਤੇ ਅਨੁਮਾਨਿਤ ਉਡੀਕ ਦੇਖੋ।",
        "ਭੁਗਤਾਨ ਸਥਿਤੀ":
          "ਭੁਗਤਾਨ ਪੇਜ ਖੋਲ੍ਹੋ ਅਤੇ ਭੁਗਤਾਨ, ਪ੍ਰੋਸੈਸਿੰਗ ਅਤੇ ਮਨਜ਼ੂਰ ਕੀਤੀਆਂ ਜਾਣ ਵਾਲੀਆਂ ਜਾਣਕਾਰੀ ਵੇਖੋ।",
        "ਕੀਪੈਡ / IVR ਮਦਦ":
          "ਕੀਪੈਡ ਅਤੇ ਵੌਇਸ ਹੈਲਪ ਪੇਜ 'ਤੇ ਟੋਲ-ਫ੍ਰੀ, ਕੀਪੈਡ ਅਤੇ ਵੌਇਸ ਯਾਤਰਾ ਲਈ ਜਾਓ।",
      },
    },
  } as const;

  const currentChatCopy = chatCopy[chatLanguage];
  const [messages, setMessages] = useState<
    Array<{ from: "bot" | "user"; text: string }>
  >([{ from: "bot", text: currentChatCopy.intro }]);

  useEffect(() => {
    setMessages((prev) => {
      if (prev.length === 0)
        return [{ from: "bot", text: currentChatCopy.intro }];
      const [first, ...rest] = prev;
      if (first.from !== "bot")
        return [{ from: "bot", text: currentChatCopy.intro }, ...rest];
      return [{ ...first, text: currentChatCopy.intro }, ...rest];
    });
  }, [currentChatCopy.intro]);

  const options = [
    currentChatCopy.options.book,
    currentChatCopy.options.queue,
    currentChatCopy.options.payment,
    currentChatCopy.options.help,
  ];

  const replies: Record<string, string> = currentChatCopy.replies;

  function choose(option: string) {
    setMessages((m) => [
      ...m,
      { from: "user", text: option },
      {
        from: "bot",
        text:
          replies[option] ??
          t(
            "Namaste! I can help with slots, queue, payments and mandi directions.",
          ),
      },
    ]);
  }

  const sizeClasses = {
    small: "w-[min(92vw,360px)]",
    full: "w-[min(90vw,760px)] h-[min(76vh,620px)]",
  };

  const chatBodyClasses = {
    small: "max-h-72",
    full: "max-h-[calc(76vh-170px)]",
  };

  return (
    <div className="fixed bottom-5 right-5 z-40">
      <button
        aria-label="Open farmer assistant"
        onClick={() => setOpen((v) => !v)}
        className="grid h-14 w-14 place-items-center rounded-full bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-xl transition-transform hover:-translate-y-1"
      >
        <Bot size={25} />
      </button>
      {open && (
        <Card
          className={cn(
            "absolute bottom-16 right-0 overflow-hidden shadow-2xl",
            sizeClasses[chatSize],
          )}
          accent="yellow"
        >
          <div className="flex items-center justify-between bg-[hsl(var(--primary))] p-4 text-[hsl(var(--primary-foreground))]">
            <div>
              <div className="text-xs font-bold uppercase tracking-[.14em] opacity-65">
                FasalFlux Assistant
              </div>
              <div className="font-semibold">Farmer help</div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label={
                  chatSize === "small"
                    ? "Open full-screen chatbot"
                    : "Switch to small chatbot"
                }
                onClick={() =>
                  setChatSize((v) => (v === "small" ? "full" : "small"))
                }
                className="rounded-md bg-white/10 px-2 py-1 text-[10px] font-bold uppercase tracking-[.12em] text-white hover:bg-white/20"
              >
                {chatSize === "small" ? "Full screen" : "Small screen"}
              </button>
              <button
                type="button"
                aria-label="Close farmer assistant"
                onClick={() => setOpen(false)}
                className="grid h-7 w-7 place-items-center rounded-md bg-white/10 hover:bg-white/20"
              >
                <X size={16} />
              </button>
            </div>
          </div>
          <div className="border-b border-[hsl(var(--border))] bg-[hsl(var(--muted))] px-4 py-2.5">
            <label className="flex items-center gap-2 text-xs font-semibold">
              <Languages size={14} />
              <span>{currentChatCopy.selectLanguage}</span>
              <select
                aria-label="Select language"
                data-testid="chatbot-language"
                value={chatLanguage}
                onChange={(e) =>
                  setChatLanguage(e.target.value as "en" | "hi" | "te" | "pa")
                }
                className="ml-auto rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-2 py-1 text-xs outline-none"
              >
                {languages.map((item) => (
                  <option key={item.code} value={item.code}>
                    {item.nativeLabel}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div
            className={cn(
              "space-y-3 overflow-auto p-4",
              chatBodyClasses[chatSize],
            )}
          >
            {messages.map((m, i) => (
              <div
                key={i}
                className={cn(
                  "max-w-[88%] rounded-xl p-3 text-sm",
                  m.from === "user"
                    ? "ml-auto bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]"
                    : "bg-[hsl(var(--muted))]",
                )}
              >
                {m.text}
              </div>
            ))}
          </div>
          <div className="border-t border-[hsl(var(--border))] p-3">
            <div className="grid grid-cols-2 gap-2">
              {options.map((o) => (
                <button
                  key={o}
                  onClick={() => choose(o)}
                  className="rounded-xl border border-[hsl(var(--border))] p-2 text-xs font-semibold hover:border-[hsl(var(--primary))]"
                >
                  {o}
                </button>
              ))}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

function CalendarIcon({ size = 20 }: { size?: number }) {
  return (
    <span className="grid h-5 w-5 place-items-center rounded border-[1.5px] border-current text-[10px] font-bold">
      {new Date().getDate()}
    </span>
  );
}

function PageIntro({
  eyebrow,
  title,
  detail,
  action,
}: {
  eyebrow: string;
  title: string;
  detail: string;
  action?: ReactNode;
}) {
  const { t } = useLanguage();
  return (
    <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
      <div className="animate-rise">
        <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[.18em] text-[hsl(var(--primary))]">
          <span className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--accent))]" />
          {t(eyebrow)}
        </div>
        <h1 className="font-display text-4xl leading-[1.05] tracking-tight sm:text-5xl">
          {t(title)}
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">
          {t(detail)}
        </p>
      </div>
      {action}
    </div>
  );
}

function FarmerDashboard() {
  const { t } = useLanguage();
  const { data, isLoading, isError, refetch } = useGetFarmerDashboard(
    { farmerId: DEMO_FARMER_ID },
    {
      query: {
        queryKey: getGetFarmerDashboardQueryKey({ farmerId: DEMO_FARMER_ID }),
      },
    },
  );
  if (isLoading) return <DashboardSkeleton />;
  if (isError || !data) return <ErrorState onRetry={refetch} />;
  const { farmer, activeToken, nextSlot, paymentSummary, recentActivity } =
    data;
  return (
    <div className="animate-rise">
      <PageIntro
        eyebrow={t("Good morning, {{name}}", {
          name: farmer.name.split(" ")[0],
        })}
        title={t("Your harvest, on your time.")}
        detail={t(
          "{{village}} · {{crop}} · Keep this page open when you travel to the mandi.",
          {
            village: farmer.village,
            crop: farmer.crop,
          },
        )}
        action={
          <Link
            href="/farmer/book"
            data-testid="link-book-slot-top"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-5 text-sm font-bold text-[hsl(var(--primary-foreground))] shadow-[0_8px_20px_hsl(205_46%_29%/.15)] hover:-translate-y-0.5"
          >
            {t("Book a slot")} <ArrowRight size={17} />
          </Link>
        }
      />
      <div className="grid gap-5 xl:grid-cols-[1.45fr_.8fr]">
        <Card
          className="overflow-hidden bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]"
          accent="yellow"
        >
          <div className="relative p-6 sm:p-8">
            <div className="absolute -right-6 -top-12 h-44 w-44 rounded-full border-[22px] border-[hsl(var(--accent)/.16)]" />
            <div className="relative flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.15em] text-[hsl(var(--primary-foreground)/.65)]">
                  <span className="h-2 w-2 rounded-full bg-[hsl(var(--accent))]" />{" "}
                  {activeToken ? t("Live token") : t("No active token")}
                </div>
                <div className="mt-5 font-display text-6xl tracking-tight">
                  {activeToken ? activeToken.tokenNumber : "—"}
                </div>
                <div className="mt-1 text-sm text-[hsl(var(--primary-foreground)/.7)]">
                  {activeToken
                    ? activeToken.centerName
                    : t("Choose a time that works for you")}
                </div>
              </div>
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))]">
                <ScanLine size={27} />
              </div>
            </div>
            {activeToken ? (
              <>
                <div className="mt-8 grid grid-cols-3 gap-2 border-t border-[hsl(var(--primary-foreground)/.16)] pt-5">
                  <div>
                    <div className="text-2xl font-bold">
                      {activeToken.position}
                    </div>
                    <div className="mt-1 text-xs text-[hsl(var(--primary-foreground)/.62)]">
                      {t("Your position")}
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">
                      {activeToken.aheadCount}
                    </div>
                    <div className="mt-1 text-xs text-[hsl(var(--primary-foreground)/.62)]">
                      {t("People ahead")}
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">
                      ~{activeToken.etaMinutes}m
                    </div>
                    <div className="mt-1 text-xs text-[hsl(var(--primary-foreground)/.62)]">
                      {t("Est. wait")}
                    </div>
                  </div>
                </div>
                <Link
                  href={`/farmer/token/${activeToken.id}`}
                  data-testid="link-view-live-token"
                  className="mt-6 flex items-center justify-between rounded-xl bg-[hsl(var(--primary-foreground)/.1)] px-4 py-3 text-sm font-semibold hover:bg-[hsl(var(--primary-foreground)/.17)]"
                >
                  {t("View live queue status")} <ChevronRight size={17} />
                </Link>
              </>
            ) : (
              <Link
                href="/farmer/book"
                data-testid="link-find-slot-empty"
                className="mt-7 flex items-center justify-between rounded-xl bg-[hsl(var(--primary-foreground)/.1)] px-4 py-3 text-sm font-semibold"
              >
                {t("Find a procurement slot")} <ChevronRight size={17} />
              </Link>
            )}
          </div>
        </Card>
        <Card className="p-6" accent="green">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-xs font-bold uppercase tracking-[.14em] text-[hsl(var(--muted-foreground))]">
                {nextSlot?.date === todayIso()
                  ? t("Today’s slot")
                  : t("Next slot")}
              </div>
              <div className="mt-4 font-display text-3xl">
                {nextSlot ? formatDate(nextSlot.date) : t("Not booked")}
              </div>
            </div>
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))]">
              <Clock3 size={20} />
            </div>
          </div>
          {nextSlot ? (
            <>
              <div className="mt-1 text-sm font-semibold">
                {nextSlot.startTime} – {nextSlot.endTime}
              </div>
              <div className="mt-5 flex items-center justify-between border-t border-[hsl(var(--border))] pt-4 text-sm">
                <span className="text-[hsl(var(--muted-foreground))]">
                  Places left
                </span>
                <strong>
                  {nextSlot.remaining} of {nextSlot.capacity}
                </strong>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-[hsl(var(--muted))]">
                <div
                  className="h-full rounded-full bg-[hsl(var(--secondary-foreground))]"
                  style={{
                    width: `${Math.max(8, ((nextSlot.capacity - nextSlot.remaining) / nextSlot.capacity) * 100)}%`,
                  }}
                />
              </div>
            </>
          ) : (
            <p className="mt-8 text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">
              Pick a slot to plan your trip with confidence.
            </p>
          )}
        </Card>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          [t("Book New Slot"), "/farmer/book", CalendarDays],
          [
            t("Track Queue"),
            activeToken
              ? `/farmer/token/${activeToken.id}`
              : "/farmer/token/current",
            Users,
          ],
          [t("My Procurement"), "/farmer/procurement", PackageCheck],
          [t("Payment Status"), "/farmer/payments", IndianRupee],
        ].map(([label, href, Icon]) => (
          <Link
            key={String(label)}
            href={String(href)}
            className="flex min-h-12 items-center justify-center gap-2 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 text-sm font-bold transition-colors hover:border-[hsl(var(--primary))] hover:bg-[hsl(var(--primary)/.04)]"
          >
            {typeof Icon === "function" ? <Icon size={17} /> : null}
            {String(label)}
          </Link>
        ))}
      </div>
      <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_1.4fr]">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl">Payments</h2>
            <Link
              href="/farmer/payments"
              data-testid="link-see-payments"
              className="text-sm font-bold text-[hsl(var(--primary))]"
            >
              See all
            </Link>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="rounded-xl bg-[hsl(var(--muted))] p-4">
              <div className="text-xs text-[hsl(var(--muted-foreground))]">
                Paid so far
              </div>
              <div className="mt-2 text-2xl font-bold">
                ₹{paymentSummary.paidAmount.toLocaleString("en-IN")}
              </div>
            </div>
            <div className="rounded-xl bg-[hsl(var(--accent)/.2)] p-4">
              <div className="text-xs text-[hsl(var(--muted-foreground))]">
                Coming to you
              </div>
              <div className="mt-2 text-2xl font-bold">
                ₹{paymentSummary.pendingAmount.toLocaleString("en-IN")}
              </div>
            </div>
          </div>
          <div className="mt-5 flex items-center justify-between text-sm">
            <span className="text-[hsl(var(--muted-foreground))]">
              Total value
            </span>
            <strong>₹{paymentSummary.totalDue.toLocaleString("en-IN")}</strong>
          </div>
        </Card>
        <Card className="p-6">
          <h2 className="font-display text-2xl">Recent activity</h2>
          <div className="mt-4 divide-y divide-[hsl(var(--border))]">
            {recentActivity.length ? (
              recentActivity.map((item) => (
                <div
                  key={item.id}
                  data-testid={`activity-${item.id}`}
                  className="flex items-start gap-3 py-3"
                >
                  <div
                    className={cn(
                      "mt-1 h-2.5 w-2.5 shrink-0 rounded-full",
                      item.tone === "success"
                        ? "bg-[hsl(var(--secondary-foreground))]"
                        : item.tone === "warning"
                          ? "bg-[hsl(var(--accent-foreground))]"
                          : "bg-[hsl(var(--primary))]",
                    )}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold">{item.label}</div>
                    <div className="mt-0.5 text-xs text-[hsl(var(--muted-foreground))]">
                      {item.detail}
                    </div>
                  </div>
                  <span className="text-xs text-[hsl(var(--muted-foreground))]">
                    {relativeTime(item.timestamp)}
                  </span>
                </div>
              ))
            ) : (
              <EmptyState
                icon={Leaf}
                title="Nothing new yet"
                detail="Your booking and payment updates will appear here."
              />
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

function BookingPage() {
  const { t } = useLanguage();
  const [cropCategory, setCropCategory] = useState<"grain" | "perishable">(
    "grain",
  );
  const [crop, setCrop] = useState("Wheat");
  const [customCropName, setCustomCropName] = useState("");
  const [selectedCenter, setSelectedCenter] = useState("");
  const [selectedDate, setSelectedDate] = useState(todayIso());
  const [selectedSlot, setSelectedSlot] = useState("");
  const [quantity, setQuantity] = useState("4.5");
  const [confirmation, setConfirmation] = useState<any>(null);
  const centersQuery = useListProcurementCenters({
    query: { queryKey: getListProcurementCentersQueryKey() },
  });
  const slotsQuery = useListAvailableSlots(
    selectedCenter,
    { date: selectedDate, cropCategory },
    {
      query: {
        enabled: Boolean(selectedCenter),
        queryKey: getListAvailableSlotsQueryKey(selectedCenter, {
          date: selectedDate,
          cropCategory,
        }),
      },
    },
  );
  const booking = useCreateBooking();
  const centers = centersQuery.data ?? [];
  const slots = slotsQuery.data ?? [];
  const chosenCenter = centers.find((center) => center.id === selectedCenter);
  const cropOptions =
    cropCategory === "grain"
      ? ["Wheat", "Rice", "Chana", "Mustard", "Other"]
      : ["Tomato", "Potato", "Onion", "Fruits & Vegetables", "Other"];
  const customCrop = crop === "Other" || crop === "Fruits & Vegetables";
  const displayCrop =
    customCrop && customCropName.trim() ? customCropName.trim() : crop;
  useEffect(() => {
    if (!cropOptions.includes(crop)) setCrop(cropOptions[0]);
    setCustomCropName("");
    setSelectedSlot("");
  }, [cropCategory]);
  useEffect(() => {
    if (selectedDate < todayIso()) {
      setSelectedDate(todayIso());
      setSelectedSlot("");
    }
  }, [selectedDate]);
  function changeCategory(next: "grain" | "perishable") {
    setCropCategory(next);
    setCrop(next === "grain" ? "Wheat" : "Tomato");
    setCustomCropName("");
    setSelectedSlot("");
  }
  function changeDate(next: string) {
    setSelectedDate(next);
    setSelectedSlot("");
  }
  function submit(event: FormEvent) {
    event.preventDefault();
    if (
      !selectedSlot ||
      !selectedCenter ||
      (customCrop && !customCropName.trim())
    )
      return;
    const slot = slots.find((item) => item.id === selectedSlot);
    if (!slot || !isSlotBookable(slot, selectedDate)) return;
    booking.mutate(
      {
        data: {
          farmerId: DEMO_FARMER_ID,
          slotId: selectedSlot,
          quantityQuintals: Number(quantity),
          crop: displayCrop,
          cropCategory,
          date: selectedDate,
        } as any,
      },
      { onSuccess: setConfirmation },
    );
  }
  if (confirmation) return <BookingSuccess confirmation={confirmation} />;
  const dates = Array.from({ length: 7 }, (_, i) => addDaysIso(i));
  return (
    <div className="animate-rise">
      <PageIntro
        eyebrow="Plan your visit"
        title="Book without the guesswork."
        detail="Choose your crop, mandi and time. You can book any available slot across the next 7 days; today’s past slots are automatically disabled."
      />
      <div className="grid gap-6 xl:grid-cols-[1.08fr_.92fr]">
        <Card className="p-6 sm:p-8">
          <form onSubmit={submit}>
            <div>
              <h2 className="font-display text-2xl">{t("Select crop")}</h2>
              <div className="mt-4 grid grid-cols-2 gap-3">
                {[
                  {
                    key: "grain",
                    label: t("Grain"),
                    icon: Wheat,
                    note: "Regular procurement window",
                  },
                  {
                    key: "perishable",
                    label: t("Perishable"),
                    icon: Sprout,
                    note: "Express 4:00 AM – 8:00 AM",
                  },
                ].map(({ key, label, icon: Icon, note }) => (
                  <button
                    type="button"
                    key={key}
                    onClick={() =>
                      changeCategory(key as "grain" | "perishable")
                    }
                    className={cn(
                      "rounded-2xl border p-4 text-left transition-colors",
                      cropCategory === key
                        ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary)/.07)]"
                        : "border-[hsl(var(--border))] hover:border-[hsl(var(--primary)/.5)]",
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className="grid h-10 w-10 place-items-center rounded-xl bg-[hsl(var(--secondary))]">
                        <Icon size={20} />
                      </div>
                      <div className="font-bold">{label}</div>
                    </div>
                    <div className="mt-3 text-xs text-[hsl(var(--muted-foreground))]">
                      {note}
                    </div>
                  </button>
                ))}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {cropOptions.map((item) => (
                  <button
                    type="button"
                    key={item}
                    onClick={() => {
                      setCrop(item);
                      setCustomCropName("");
                    }}
                    className={cn(
                      "rounded-full border px-3 py-2 text-xs font-semibold",
                      crop === item
                        ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]"
                        : "border-[hsl(var(--border))] hover:border-[hsl(var(--primary))]",
                    )}
                  >
                    {item}
                  </button>
                ))}
              </div>
              {customCrop && (
                <div className="mt-4">
                  <label
                    htmlFor="custom-crop"
                    className="text-sm font-semibold"
                  >
                    {crop === "Fruits & Vegetables"
                      ? "Name of fruit / vegetable"
                      : "Enter crop name"}
                  </label>
                  <input
                    id="custom-crop"
                    value={customCropName}
                    onChange={(e) => setCustomCropName(e.target.value)}
                    placeholder={
                      crop === "Fruits & Vegetables"
                        ? "e.g. Apple, Carrot, Guava"
                        : "e.g. Barley"
                    }
                    className="mt-2 h-12 w-full rounded-xl border border-[hsl(var(--input))] bg-transparent px-4 outline-none focus:border-[hsl(var(--primary))]"
                  />
                </div>
              )}
              {cropCategory === "perishable" && (
                <div className="mt-4 flex items-start gap-3 rounded-xl bg-[hsl(var(--accent)/.2)] p-4 text-sm">
                  <Timer size={19} className="mt-0.5 shrink-0" />
                  <div>
                    <strong>EXPRESS PERISHABLE WINDOW</strong>
                    <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
                      4:00 AM – 8:00 AM · Priority processing for time-sensitive
                      produce.
                    </p>
                  </div>
                </div>
              )}
            </div>
            <div className="mt-8 border-t border-[hsl(var(--border))] pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-display text-2xl">{t("Select mandi")}</h2>
                  <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
                    Choose a centre with the best current load.
                  </p>
                </div>
                <Badge tone="green">{centers.length} centres</Badge>
              </div>
              <div className="mt-5 grid gap-3">
                {centersQuery.isLoading ? (
                  [1, 2, 3].map((i) => <Skeleton key={i} className="h-24" />)
                ) : centersQuery.isError ? (
                  <EmptyState
                    icon={CloudOff}
                    title="Centres are out of reach"
                    detail="Check your signal and try once more."
                    action={
                      <Button
                        type="button"
                        onClick={() => centersQuery.refetch()}
                        variant="outline"
                      >
                        Try again
                      </Button>
                    }
                  />
                ) : (
                  centers.map((center) => {
                    const load = Math.round(
                      (center.todayBooked / center.todayCapacity) * 100,
                    );
                    return (
                      <button
                        type="button"
                        key={center.id}
                        onClick={() => {
                          setSelectedCenter(center.id);
                          setSelectedSlot("");
                        }}
                        className={cn(
                          "w-full rounded-xl border p-4 text-left transition-colors",
                          selectedCenter === center.id
                            ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary)/.06)]"
                            : "border-[hsl(var(--border))] hover:border-[hsl(var(--primary)/.5)]",
                        )}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="font-semibold">{center.name}</div>
                            <div className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
                              {center.distanceKm} km · {center.district},{" "}
                              {center.state}
                            </div>
                          </div>
                          <StatusBadge status={center.status} />
                        </div>
                        <div className="mt-3 grid grid-cols-3 gap-3 text-xs">
                          <span>
                            <strong className="block">{load}%</strong>
                            <span className="text-[hsl(var(--muted-foreground))]">
                              {t("Current load")}
                            </span>
                          </span>
                          <span>
                            <strong className="block">
                              {Math.max(
                                0,
                                center.todayCapacity - center.todayBooked,
                              )}
                            </strong>
                            <span className="text-[hsl(var(--muted-foreground))]">
                              {t("Slots available")}
                            </span>
                          </span>
                          <span>
                            <strong className="block">
                              ~{Math.max(15, Math.round(load / 2))} min
                            </strong>
                            <span className="text-[hsl(var(--muted-foreground))]">
                              {t("Expected wait")}
                            </span>
                          </span>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
            <div className="mt-8 border-t border-[hsl(var(--border))] pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-display text-2xl">
                    {t("Select date & time")}
                  </h2>
                  <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
                    Next 7 days are available. Past times today are
                    automatically disabled.
                  </p>
                </div>
                <CalendarDays size={22} />
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
                {dates.map((value, i) => (
                  <button
                    type="button"
                    key={value}
                    onClick={() => changeDate(value)}
                    className={cn(
                      "rounded-xl border px-3 py-3 text-left text-xs font-semibold",
                      selectedDate === value
                        ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]"
                        : "border-[hsl(var(--border))] hover:border-[hsl(var(--primary))]",
                    )}
                  >
                    <span className="block opacity-70">
                      {i === 0
                        ? t("Today")
                        : i === 1
                          ? t("Tomorrow")
                          : formatWeekday(value)}
                    </span>
                    <span className="mt-1 block text-sm">
                      {formatDate(value)}
                    </span>
                  </button>
                ))}
              </div>
              {!selectedCenter ? (
                <div className="mt-4 rounded-xl border border-dashed border-[hsl(var(--border))] p-6 text-center text-sm text-[hsl(var(--muted-foreground))]">
                  Select a mandi to see live availability.
                </div>
              ) : slotsQuery.isLoading ? (
                <div className="mt-4 grid grid-cols-2 gap-3">
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-20" />
                  ))}
                </div>
              ) : slotsQuery.isError ? (
                <div className="mt-4 rounded-xl bg-[hsl(var(--destructive)/.08)] p-4 text-sm text-[hsl(var(--destructive))]">
                  Could not load slots. Try another date.
                </div>
              ) : slots.length ? (
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {slots.map((slot) => {
                    const slotMeta = slot as typeof slot & {
                      recommended?: boolean;
                      waitMinutes?: number;
                    };
                    const past = !isSlotBookable(slot, selectedDate);
                    const recommended = slotMeta.recommended && !past;
                    return (
                      <button
                        key={slot.id}
                        type="button"
                        disabled={slot.status === "full" || past}
                        onClick={() => setSelectedSlot(slot.id)}
                        className={cn(
                          "relative rounded-xl border p-4 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-40",
                          recommended && "ring-2 ring-[hsl(var(--accent))]",
                          selectedSlot === slot.id
                            ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary)/.08)]"
                            : "border-[hsl(var(--border))] hover:border-[hsl(var(--primary)/.5)]",
                        )}
                      >
                        {recommended && (
                          <Badge tone="yellow">⭐ Recommended</Badge>
                        )}
                        <div className="mt-2 flex items-center justify-between">
                          <strong>
                            {slot.startTime} – {slot.endTime}
                          </strong>
                          <StatusBadge status={slot.status} />
                        </div>
                        <div className="mt-2 grid grid-cols-2 text-xs text-[hsl(var(--muted-foreground))]">
                          <span>{slot.remaining} slots left</span>
                          <span>~{slotMeta.waitMinutes ?? 35} min wait</span>
                        </div>
                        {past && (
                          <div className="mt-2 text-xs font-semibold text-[hsl(var(--destructive))]">
                            Past — unavailable
                          </div>
                        )}
                        {recommended && (
                          <div className="mt-2 text-xs font-semibold text-[hsl(var(--secondary-foreground))]">
                            Lowest expected waiting time
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="mt-4 rounded-xl bg-[hsl(var(--muted))] p-5 text-sm">
                  No bookable slots remain for this date. Choose another day.
                </div>
              )}
            </div>
            <div className="mt-8 border-t border-[hsl(var(--border))] pt-6">
              <label className="text-sm font-semibold" htmlFor="quantity">
                Estimated produce quantity
              </label>
              <div className="mt-2 flex items-center gap-3">
                <input
                  id="quantity"
                  data-testid="input-quantity"
                  type="number"
                  min="0.1"
                  step=".1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="h-12 w-40 rounded-xl border border-[hsl(var(--input))] bg-transparent px-4 text-lg font-bold outline-none focus:border-[hsl(var(--primary))]"
                />
                <span className="text-sm text-[hsl(var(--muted-foreground))]">
                  quintals
                </span>
              </div>
              <Button
                data-testid="button-confirm-booking"
                type="submit"
                disabled={
                  !selectedCenter ||
                  !selectedSlot ||
                  booking.isPending ||
                  !Number(quantity) ||
                  Number(quantity) <= 0 ||
                  (customCrop && !customCropName.trim())
                }
                className="mt-7 w-full sm:w-auto"
              >
                {booking.isPending ? "Holding your place…" : "Confirm Slot"}
                <ArrowRight size={17} />
              </Button>
              {booking.isError && (
                <p className="mt-3 text-sm text-[hsl(var(--destructive))]">
                  Could not book this slot. It may have just filled up or the
                  selected time has passed.
                </p>
              )}
            </div>
          </form>
        </Card>
        <BookingAside
          center={chosenCenter?.name}
          slot={slots.find((s) => s.id === selectedSlot)}
          quantity={quantity}
          crop={displayCrop}
          date={selectedDate}
          cropCategory={cropCategory}
        />
      </div>
    </div>
  );
}

function BookingAside({
  center,
  slot,
  quantity,
  crop,
  date,
  cropCategory,
}: {
  center?: string;
  slot?: any;
  quantity: string;
  crop: string;
  date: string;
  cropCategory: string;
}) {
  return (
    <div className="space-y-5">
      <Card className="field-grid overflow-hidden p-6 sm:p-8" accent="yellow">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-[hsl(var(--accent))]">
            <ShieldCheck size={21} />
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-[.15em] text-[hsl(var(--muted-foreground))]">
              Booking preview
            </div>
            <div className="font-display text-2xl">Ready to confirm.</div>
          </div>
        </div>
        <div className="mt-6 space-y-4 border-t border-[hsl(var(--border))] pt-5 text-sm">
          <div className="flex justify-between">
            <span className="text-[hsl(var(--muted-foreground))]">Crop</span>
            <strong>{crop}</strong>
          </div>
          <div className="flex justify-between">
            <span className="text-[hsl(var(--muted-foreground))]">Mandi</span>
            <strong>{center ?? "—"}</strong>
          </div>
          <div className="flex justify-between">
            <span className="text-[hsl(var(--muted-foreground))]">Date</span>
            <strong>{formatDate(date)}</strong>
          </div>
          <div className="flex justify-between">
            <span className="text-[hsl(var(--muted-foreground))]">Time</span>
            <strong>
              {slot ? `${slot.startTime} – ${slot.endTime}` : "—"}
            </strong>
          </div>
          <div className="flex justify-between">
            <span className="text-[hsl(var(--muted-foreground))]">
              Quantity
            </span>
            <strong>{quantity} quintals</strong>
          </div>
        </div>
        {cropCategory === "perishable" && (
          <div className="mt-5 rounded-xl bg-[hsl(var(--accent)/.2)] p-4 text-xs">
            <strong>Express perishables:</strong> 4:00 AM – 8:00 AM window
          </div>
        )}
      </Card>
      <Card className="p-6">
        <div className="flex items-center gap-3">
          <Phone size={18} />
          <div>
            <div className="font-semibold">Need help?</div>
            <div className="text-xs text-[hsl(var(--muted-foreground))]">
              Village facilitator / mandi help desk can assist.
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

function BookingSuccess({ confirmation }: { confirmation: any }) {
  const { t } = useLanguage();
  const token = confirmation.token;
  const slot = confirmation.slot;
  return (
    <div className="mx-auto max-w-4xl animate-rise">
      <PageIntro
        eyebrow="Booking confirmed"
        title="Your place is held."
        detail="Your digital pass includes a scannable QR for gate verification. Keep it ready when you reach the mandi."
      />
      <Card className="overflow-hidden" accent="green">
        <div className="grid lg:grid-cols-[1fr_.9fr]">
          <div className="bg-[hsl(var(--primary))] p-7 text-[hsl(var(--primary-foreground))] sm:p-10">
            <div className="text-xs font-bold uppercase tracking-[.18em] opacity-60">
              {t("Digital token")}
            </div>
            <div className="mt-3 font-display text-7xl">
              {token.tokenNumber}
            </div>
            <div className="mt-2 text-sm opacity-75">
              {confirmation.center.name}
            </div>
            <div className="mt-8 grid grid-cols-2 gap-4 border-t border-white/15 pt-5 text-sm">
              <div>
                <div className="text-xs opacity-60">Date</div>
                <strong>{formatDate(slot.date)}</strong>
              </div>
              <div>
                <div className="text-xs opacity-60">Time</div>
                <strong>
                  {slot.startTime} – {slot.endTime}
                </strong>
              </div>
              <div>
                <div className="text-xs opacity-60">Gate</div>
                <strong>{token.gate ?? "Gate 2"}</strong>
              </div>
              <div>
                <div className="text-xs opacity-60">Crop</div>
                <strong>{token.crop}</strong>
              </div>
            </div>
          </div>
          <div className="grid place-items-center p-7 sm:p-10">
            <QrCode value={token.qrValue ?? token.tokenNumber} />
            <div className="mt-4">
              <Badge tone="green">{t("Scheduled")}</Badge>
            </div>
            <div className="mt-2 text-center text-xs text-[hsl(var(--muted-foreground))]">
              Scan at the assigned gate
            </div>
          </div>
        </div>
        <div className="grid gap-3 border-t border-[hsl(var(--border))] p-5 sm:grid-cols-2">
          <Link
            href={`/farmer/token/${token.id}`}
            className="flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[hsl(var(--primary))] text-sm font-bold text-[hsl(var(--primary-foreground))]"
          >
            View Digital Pass <ArrowRight size={17} />
          </Link>
          <Link
            href={`/farmer/gate/${token.id}`}
            className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[hsl(var(--border))] text-sm font-bold hover:border-[hsl(var(--primary))]"
          >
            <ScanLine size={17} /> Gate Verification
          </Link>
        </div>
      </Card>
    </div>
  );
}

function QrCode({ value }: { value: string }) {
  const [src, setSrc] = useState("");
  useEffect(() => {
    let alive = true;
    import("qrcode")
      .then((mod) =>
        mod.toDataURL(value, {
          width: 220,
          margin: 2,
          errorCorrectionLevel: "M",
        }),
      )
      .then((url) => {
        if (alive) setSrc(url);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [value]);
  return src ? (
    <img
      src={src}
      alt={`QR pass for ${value}`}
      className="h-52 w-52 rounded-xl bg-white p-2 shadow-inner"
    />
  ) : (
    <div className="grid h-52 w-52 place-items-center rounded-xl bg-white p-5 text-center text-xs text-slate-600">
      Generating secure QR…
    </div>
  );
}

function TokenPage() {
  const { t } = useLanguage();
  const { tokenId } = useParams<{ tokenId: string }>();
  const actualTokenId = tokenId === "current" ? undefined : tokenId;
  const { data: dashboard } = useGetFarmerDashboard(
    { farmerId: DEMO_FARMER_ID },
    {
      query: {
        queryKey: getGetFarmerDashboardQueryKey({ farmerId: DEMO_FARMER_ID }),
      },
    },
  );
  const activeId = actualTokenId ?? dashboard?.activeToken?.id;
  const {
    data: token,
    isLoading,
    isError,
    refetch,
  } = useGetQueueToken(activeId ?? "", {
    query: {
      enabled: Boolean(activeId),
      queryKey: getGetQueueTokenQueryKey(activeId ?? ""),
      refetchInterval: 15000,
    },
  });
  const [delayed, setDelayed] = useState(false);
  const [reason, setReason] = useState("Tractor breakdown");
  const [rescheduling, setRescheduling] = useState(false);
  const [rescheduled, setRescheduled] = useState<any>(null);
  if (isLoading || !activeId)
    return (
      <div className="mx-auto max-w-3xl">
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="mt-3 h-5 w-1/2" />
        <Skeleton className="mt-10 h-80 w-full" />
      </div>
    );
  if (isError || !token) return <ErrorState onRetry={refetch} />;
  const stages = [
    { label: "Booked", key: "booked" },
    { label: "Checked in", key: "checked_in" },
    { label: "Weighing", key: "weighing" },
    { label: "Quality check", key: "quality_check" },
    { label: "Complete", key: "completed" },
  ];
  const current = stages.findIndex((stage) => stage.key === token.status);
  async function reschedule() {
    if (!token?.id) return;
    setRescheduling(true);
    try {
      const r = await localApiRequest<{ newSlot: any; reason?: string }>(
        `/api/queue/${token.id}/reschedule`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reason }),
        },
      );
      setRescheduled(r);
      setDelayed(false);
      await refetch();
    } finally {
      setRescheduling(false);
    }
  }
  return (
    <div className="mx-auto max-w-4xl animate-rise">
      <PageIntro
        eyebrow="Live token"
        title={`You’re #${token.position} in line.`}
        detail={`Last checked just now · ${token.centerName}`}
        action={
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw size={16} /> Refresh
          </Button>
        }
      />
      <Card className="overflow-hidden" accent="yellow">
        <div className="grid gap-0 lg:grid-cols-[.8fr_1.2fr]">
          <div className="bg-[hsl(var(--primary))] p-7 text-[hsl(var(--primary-foreground))] sm:p-10">
            <div className="text-xs font-bold uppercase tracking-[.18em] opacity-60">
              Your token
            </div>
            <div className="mt-3 font-display text-8xl">
              {token.tokenNumber}
            </div>
            <StatusBadge status={token.status} />
            <div className="mt-10 space-y-4 border-t border-white/15 pt-5 text-sm">
              <div className="flex justify-between">
                <span className="opacity-60">Crop</span>
                <strong>{token.crop}</strong>
              </div>
              <div className="flex justify-between">
                <span className="opacity-60">Mandi</span>
                <strong>{token.centerName}</strong>
              </div>
              <div className="flex justify-between">
                <span className="opacity-60">Gate</span>
                <strong>{token.gate ?? "Gate 2"}</strong>
              </div>
              <div className="flex justify-between">
                <span className="opacity-60">Time</span>
                <strong>
                  {token.slotStart && token.slotEnd
                    ? `${token.slotStart} – ${token.slotEnd}`
                    : "Scheduled"}
                </strong>
              </div>
            </div>
          </div>
          <div className="p-7 sm:p-10">
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl bg-[hsl(var(--muted))] p-4">
                <div className="text-xs text-[hsl(var(--muted-foreground))]">
                  People ahead
                </div>
                <div className="mt-1 text-3xl font-bold">
                  {token.aheadCount}
                </div>
              </div>
              <div className="rounded-xl bg-[hsl(var(--accent)/.24)] p-4">
                <div className="text-xs text-[hsl(var(--muted-foreground))]">
                  Estimated wait
                </div>
                <div className="mt-1 text-3xl font-bold">
                  ~{token.etaMinutes}m
                </div>
              </div>
            </div>
            <div className="mt-10">
              <div className="mb-6 flex items-center justify-between text-sm">
                <span className="font-bold">Queue progress</span>
                <span className="text-[hsl(var(--muted-foreground))]">
                  {Math.max(0, current + 1)} of {stages.length}
                </span>
              </div>
              <div className="relative space-y-5">
                {stages.map((stage, index) => (
                  <div
                    key={stage.key}
                    className="relative flex items-center gap-3"
                  >
                    {index < stages.length - 1 && (
                      <div
                        className={cn(
                          "absolute left-[11px] top-6 h-6 w-0.5",
                          index <= current
                            ? "bg-[hsl(var(--secondary-foreground))]"
                            : "bg-[hsl(var(--border))]",
                        )}
                      />
                    )}
                    <div
                      className={cn(
                        "z-10 grid h-6 w-6 place-items-center rounded-full border-2",
                        index <= current
                          ? "border-[hsl(var(--secondary-foreground))] bg-[hsl(var(--secondary-foreground))] text-[hsl(var(--card))]"
                          : "border-[hsl(var(--border))] bg-[hsl(var(--card))] text-transparent",
                      )}
                    >
                      {index <= current && <Check size={14} strokeWidth={3} />}
                    </div>
                    <span
                      className={cn(
                        "text-sm",
                        index === current
                          ? "font-bold"
                          : "text-[hsl(var(--muted-foreground))]",
                      )}
                    >
                      {stage.label}
                    </span>
                    {index === current && <Badge tone="green">Now</Badge>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="border-t border-[hsl(var(--border))] p-5">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setDelayed(true)}
          >
            <AlertTriangle size={17} /> I am Delayed
          </Button>
        </div>
      </Card>
      {rescheduled && (
        <div className="mt-5 rounded-2xl bg-[hsl(var(--secondary))] p-5">
          <strong>✓ Slot Rescheduled</strong>
          <p className="mt-1 text-sm">
            New slot: {rescheduled.newSlot.startTime} –{" "}
            {rescheduled.newSlot.endTime}. Your previous capacity has been
            released.
          </p>
        </div>
      )}
      {delayed && (
        <Card className="mt-5 p-6" accent="yellow">
          <div className="flex items-start gap-3">
            <AlertTriangle size={20} />
            <div className="flex-1">
              <h2 className="font-display text-2xl">{t("Running late?")}</h2>
              <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
                Tell us why and we’ll simulate the safest next available slot.
              </p>
              <div className="mt-5 grid gap-2 sm:grid-cols-2">
                {["Tractor breakdown", "Bad weather", "Traffic", "Other"].map(
                  (item) => (
                    <button
                      type="button"
                      key={item}
                      onClick={() => setReason(item)}
                      className={cn(
                        "rounded-xl border p-3 text-left text-sm",
                        reason === item
                          ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary)/.06)] font-bold"
                          : "border-[hsl(var(--border))]",
                      )}
                    >
                      {item}
                    </button>
                  ),
                )}
              </div>
              <div className="mt-5 rounded-xl bg-[hsl(var(--muted))] p-4">
                <div className="text-xs font-bold uppercase tracking-[.14em]">
                  {t("Alternative slot available")}
                </div>
                <div className="mt-2 font-display text-2xl">
                  2:30 PM – 3:00 PM
                </div>
                <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
                  Your current capacity will be released and the new slot will
                  be assigned.
                </p>
              </div>
              <Button
                className="mt-5"
                onClick={reschedule}
                disabled={rescheduling}
              >
                {rescheduling ? "Rescheduling…" : "Reschedule"}
              </Button>
            </div>
          </div>
        </Card>
      )}
      <div className="mt-5 flex items-start gap-3 rounded-2xl bg-[hsl(var(--secondary))] p-5 text-sm text-[hsl(var(--secondary-foreground))]">
        <Clock3 size={19} className="mt-0.5 shrink-0" />
        <div>
          <strong>When should you leave?</strong>
          <p className="mt-1">
            We’ll update your estimated wait as the queue moves. Keep this page
            handy and leave when you’re around 30 minutes away from your turn.
          </p>
        </div>
      </div>
    </div>
  );
}

function FarmerProcurementPage() {
  const {
    data: payments,
    isLoading,
    isError,
    refetch,
  } = useGetFarmerPayments(DEMO_FARMER_ID, {
    query: { queryKey: getGetFarmerPaymentsQueryKey(DEMO_FARMER_ID) },
  });
  const list = payments ?? [];
  return (
    <div className="animate-rise">
      <PageIntro
        eyebrow="My procurement"
        title="Your procurement record."
        detail="A simple history of what was weighed, approved and paid."
        action={
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw size={16} /> Refresh
          </Button>
        }
      />
      <Card className="overflow-hidden" accent="green">
        {isLoading ? (
          <div className="space-y-3 p-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20" />
            ))}
          </div>
        ) : isError ? (
          <ErrorState onRetry={refetch} />
        ) : (
          <div className="divide-y divide-[hsl(var(--border))]">
            {list.map((item) => (
              <div
                key={item.id}
                className="flex flex-wrap items-center gap-4 p-5"
              >
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-[hsl(var(--secondary))]">
                  <PackageCheck size={19} />
                </div>
                <div className="min-w-[200px] flex-1">
                  <div className="font-semibold">{item.label}</div>
                  <div className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
                    {formatDateTime(item.timestamp)} ·{" "}
                    {item.reference ?? "Record pending"}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-display text-xl">
                    ₹{item.amount.toLocaleString("en-IN")}
                  </div>
                  <div className="mt-1">
                    <StatusBadge status={item.status} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

function FarmerHelpPage() {
  return (
    <div className="mx-auto max-w-4xl animate-rise">
      <PageIntro
        eyebrow="Help desk"
        title="Need help with your mandi visit?"
        detail="Choose the digital, keypad or voice route that works for you."
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="p-6" accent="blue">
          <PhoneCall size={22} />
          <h2 className="mt-4 font-display text-2xl">Toll-free helpline</h2>
          <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">
            Call the mandi help desk for booking, queue or rescheduling
            assistance.
          </p>
          <div className="mt-5 rounded-xl bg-[hsl(var(--muted))] p-4 text-sm">
            <strong>Demo number</strong>
            <div className="mt-1 font-display text-xl">1800-XXX-XXXX</div>
          </div>
        </Card>
        <Card className="p-6" accent="yellow">
          <Mic size={22} />
          <h2 className="mt-4 font-display text-2xl">Keypad & Voice Help</h2>
          <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">
            See exactly how a feature-phone farmer can book a slot without the
            app.
          </p>
          <Link
            href="/farmer/keypad-help"
            className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-4 text-sm font-bold text-[hsl(var(--primary-foreground))]"
          >
            How keypad works <ArrowRight size={17} />
          </Link>
        </Card>
      </div>
    </div>
  );
}

function KeypadHelpPage() {
  const { t } = useLanguage();
  const steps = [
    [
      "1",
      "Call the helpline",
      "Dial the toll-free / virtual mandi number from any keypad phone. No app, internet or smartphone is required.",
    ],
    [
      "2",
      "Select language",
      "Press 1 for Hindi · 2 English · 3 Punjabi · 4 Telugu. The IVR continues all prompts and responses in that language.",
    ],
    [
      "3",
      "Choose a service",
      "Press 1 to Book a Slot · 2 to Track Queue · 3 to Reschedule · 4 for Payment Status · 5 for Help.",
    ],
    [
      "4",
      "Book with keypad",
      "For a booking, the IVR asks for crop, mandi and preferred date/time. Press the number shown for each choice; the system repeats your selection before moving ahead.",
    ],
    [
      "5",
      "Use voice instead",
      "Choose the voice option when offered and simply speak your answer, for example: “Wheat, Central Mandi, tomorrow at 10 AM.” The voice system converts the speech into the booking request and reads the result back to you.",
    ],
    [
      "6",
      "Confirm by voice or key",
      "The IVR tells you the mandi, crop, date, slot and gate. Say “Yes / Confirm” or press 1. Say “Change” or press 2 if anything is wrong.",
    ],
    [
      "7",
      "Get spoken updates",
      "You can call again and ask for your token, queue position, estimated wait, reschedule status or payment status. The IVR speaks the answer back in your selected language.",
    ],
    [
      "8",
      "Receive SMS pass",
      "After booking, an SMS gives the token, slot, gate and digital-pass reference. At the mandi gate, staff can verify the token/QR.",
    ],
  ];
  return (
    <div className="mx-auto max-w-4xl animate-rise">
      <PageIntro
        eyebrow="Inclusive access"
        title="How keypad & voice booking works"
        detail="Designed for farmers using basic keypad phones. The prototype simulates the complete journey; real telecom integration can be connected later."
      />
      <div className="grid gap-5 lg:grid-cols-[1.15fr_.85fr]">
        <Card className="p-6 sm:p-8" accent="blue">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-[hsl(var(--secondary))]">
              <Mic size={21} />
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-[.14em] text-[hsl(var(--muted-foreground))]">
                Feature phone journey
              </div>
              <h2 className="font-display text-2xl">No smartphone required</h2>
            </div>
          </div>
          <div className="mt-6 space-y-3">
            {steps.map(([n, title, detail]) => (
              <div
                key={n}
                className="flex gap-4 rounded-xl border border-[hsl(var(--border))] p-4"
              >
                <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[hsl(var(--primary))] text-xs font-bold text-[hsl(var(--primary-foreground))]">
                  {n}
                </div>
                <div>
                  <div className="font-semibold">{title}</div>
                  <p className="mt-1 text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">
                    {detail}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
        <div className="space-y-5">
          <Card className="p-6" accent="yellow">
            <Volume2 size={22} />
            <h2 className="mt-4 font-display text-2xl">
              How voice booking works
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">
              After calling the helpline, select your language and choose the
              voice option. You do not need to type the booking details.
            </p>
            <div className="mt-4 space-y-2 text-sm">
              <div className="rounded-xl bg-[hsl(var(--muted))] p-3">
                <strong>Farmer says:</strong> “Book wheat at Central Mandi
                tomorrow at 10 AM.”
              </div>
              <div className="rounded-xl bg-[hsl(var(--muted))] p-3">
                <strong>System asks:</strong> “You selected Wheat, Central
                Mandi, 10:00–10:30 AM. Confirm?”
              </div>
              <div className="rounded-xl bg-[hsl(var(--muted))] p-3">
                <strong>Farmer says:</strong> “Yes.” → Booking confirmed and
                token is read aloud.
              </div>
            </div>
            <p className="mt-4 text-xs text-[hsl(var(--muted-foreground))]">
              The same voice journey can read queue position, ETA, reschedule
              status and payment status back to the farmer in the selected
              language.
            </p>
            <div className="mt-4 rounded-xl bg-[hsl(var(--muted))] p-4 text-xs">
              <strong>Prototype:</strong> simulated IVR flow.{" "}
              <strong>Future:</strong> Bhashini speech/voice services + telecom
              gateway.
            </div>
          </Card>
          <Card className="p-6">
            <HelpCircle size={22} />
            <h2 className="mt-4 font-display text-2xl">Virtual number flow</h2>
            <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">
              Farmer calls one public virtual/toll-free number → IVR identifies
              the service → keypad/voice input → booking API → SMS confirmation
              → gate verification.
            </p>
            <div className="mt-4 rounded-xl border border-[hsl(var(--border))] p-4 text-sm font-semibold">
              Call → Language → Service → Slot → Confirm → SMS → Gate
            </div>
          </Card>
          <Link
            href="/farmer/help"
            className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-[hsl(var(--primary))]"
          >
            Back to Help <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}

function GateVerificationPage() {
  const { tokenId } = useParams<{ tokenId: string }>();
  const { t } = useLanguage();
  const [locationState, setLocationState] = useState<
    "idle" | "checking" | "allowed" | "blocked"
  >("idle");
  const [scanState, setScanState] = useState<"ready" | "scanned">("ready");
  const [message, setMessage] = useState("");
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const { data: token, refetch } = useGetQueueToken(tokenId ?? "", {
    query: {
      enabled: Boolean(tokenId),
      queryKey: getGetQueueTokenQueryKey(tokenId ?? ""),
    },
  });
  useEffect(() => {
    if (!cameraOpen) return;
    let scanner: any;
    let stopped = false;
    import("html5-qrcode")
      .then((mod) => {
        if (stopped) return;
        scanner = new mod.Html5Qrcode("gate-qr-reader");
        return scanner.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 220, height: 220 } },
          (decoded: string) => {
            const expected = token?.qrValue ?? token?.tokenNumber;
            if (
              decoded === expected ||
              decoded.endsWith(token?.tokenNumber ?? "__INVALID__")
            ) {
              setScanState("scanned");
              setCameraOpen(false);
              scanner.stop().catch(() => {});
              setCameraError("");
            } else {
              setCameraError("This QR belongs to a different booking.");
            }
          },
          () => {},
        );
      })
      .catch(() =>
        setCameraError(
          "Camera scanning is unavailable. Use the demo scan button instead.",
        ),
      );
    return () => {
      stopped = true;
      if (scanner) scanner.stop().catch(() => {});
    };
  }, [cameraOpen, token?.qrValue, token?.tokenNumber]);
  async function verifyWithCoords(lat: number, lon: number) {
    if (!token) return;
    setLocationState("checking");
    try {
      const x = await localApiRequest<{ message: string; verified: boolean }>(
        "/api/gate/verify",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tokenId: token.id,
            latitude: lat,
            longitude: lon,
          }),
        },
      );
      setMessage(x.message || "");
      setLocationState(x.verified ? "allowed" : "blocked");
      if (x.verified) await refetch();
    } catch {
      setMessage("Could not verify the gate right now.");
      setLocationState("blocked");
    }
  }
  function verify() {
    if (!token) return;
    if (navigator.geolocation)
      navigator.geolocation.getCurrentPosition(
        (p) => verifyWithCoords(p.coords.latitude, p.coords.longitude),
        () => verifyWithCoords(28.2921, 74.9618),
        { enableHighAccuracy: true, timeout: 5000 },
      );
    else verifyWithCoords(28.2921, 74.9618);
  }
  return (
    <div className="mx-auto max-w-3xl animate-rise">
      <PageIntro
        eyebrow={t("Gate verification")}
        title={t("Scan digital pass & verify entry")}
        detail="The gate checks the token, assigned slot and 2 km mandi geo-fence before allowing entry."
      />
      <Card className="p-6 sm:p-8" accent="green">
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="rounded-2xl bg-[hsl(var(--muted))] p-6">
            <div className="text-xs font-bold uppercase tracking-[.14em] text-[hsl(var(--muted-foreground))]">
              Digital pass
            </div>
            <div className="mt-3 font-display text-5xl">
              {token?.tokenNumber ?? "—"}
            </div>
            <div className="mt-2 text-sm">
              {token?.crop} · {token?.centerName}
            </div>
            <div className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
              {token?.slotStart} – {token?.slotEnd} · {token?.gate}
            </div>
            <div className="mt-5 flex items-center gap-2 text-xs">
              <ShieldCheck size={16} />
              <span>2 km geo-fence protected</span>
            </div>
          </div>
          <div className="rounded-2xl border border-dashed border-[hsl(var(--border))] p-6 text-center">
            <Camera size={30} className="mx-auto" />
            <div className="mt-3 font-semibold">QR scan</div>
            {cameraOpen ? (
              <div
                id="gate-qr-reader"
                className="mt-4 overflow-hidden rounded-xl"
              />
            ) : (
              <>
                <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
                  Scan the generated digital pass with the camera, or use the
                  demo button for a judge-friendly flow.
                </p>
                <div className="mt-5 grid gap-2">
                  <Button
                    className="w-full"
                    onClick={() => {
                      setCameraOpen(true);
                      setCameraError("");
                    }}
                  >
                    <Camera size={17} /> Open camera scanner
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setScanState("scanned")}
                  >
                    <ScanLine size={17} /> {t("Simulate QR Scan")}
                  </Button>
                </div>
              </>
            )}
            {cameraError && (
              <p className="mt-3 text-xs text-[hsl(var(--destructive))]">
                {cameraError}
              </p>
            )}
          </div>
        </div>
        {scanState === "scanned" && (
          <div className="mt-5 rounded-2xl border border-[hsl(var(--border))] p-5">
            <div className="flex items-center gap-3">
              <CheckCircle2 size={22} />
              <div>
                <strong>QR token scanned</strong>
                <div className="text-xs text-[hsl(var(--muted-foreground))]">
                  {token?.tokenNumber} matched to this booking.
                </div>
              </div>
            </div>
            <Button
              className="mt-5"
              onClick={verify}
              disabled={locationState === "checking"}
            >
              <MapPin size={17} />
              {locationState === "checking"
                ? "Checking 2 km geo-fence…"
                : t("Verify gate entry")}
            </Button>
            <p className="mt-2 text-xs text-[hsl(var(--muted-foreground))]">
              If location permission is denied, the prototype uses the demo
              mandi coordinate so the judge can complete the flow.
            </p>
          </div>
        )}
        {locationState !== "idle" && (
          <div
            className={cn(
              "mt-5 rounded-2xl p-5",
              locationState === "allowed"
                ? "bg-[hsl(var(--secondary))]"
                : "bg-[hsl(var(--destructive)/.08)]",
            )}
          >
            <div className="flex items-center gap-3">
              {locationState === "allowed" ? (
                <CheckCircle2 size={24} />
              ) : (
                <AlertTriangle size={24} />
              )}
              <div>
                <strong>
                  {locationState === "allowed"
                    ? t("Gate verified — entry allowed")
                    : "Gate verification failed"}
                </strong>
                <p className="mt-1 text-sm">{message}</p>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

function PaymentsPage() {
  const {
    data: payments,
    isLoading,
    isError,
    refetch,
  } = useGetFarmerPayments(DEMO_FARMER_ID, {
    query: { queryKey: getGetFarmerPaymentsQueryKey(DEMO_FARMER_ID) },
  });
  const list = payments ?? [];
  const total = list.reduce((sum, payment) => sum + payment.amount, 0);
  const paid = list
    .filter((payment) => payment.status === "paid")
    .reduce((sum, payment) => sum + payment.amount, 0);
  return (
    <div className="animate-rise">
      <PageIntro
        eyebrow="Money trail"
        title="Every rupee, accounted for."
        detail="A simple record of what has been approved, processed, and paid for your produce."
        action={
          <Button
            variant="outline"
            onClick={() => refetch()}
            data-testid="button-refresh-payments"
          >
            <RefreshCw size={16} /> Refresh
          </Button>
        }
      />
      <div className="grid gap-5 sm:grid-cols-3">
        <Metric
          label="Total value"
          value={`₹${total.toLocaleString("en-IN")}`}
          icon={Coins}
          tone="blue"
        />
        <Metric
          label="Paid to you"
          value={`₹${paid.toLocaleString("en-IN")}`}
          icon={CheckCircle2}
          tone="green"
        />
        <Metric
          label="Still coming"
          value={`₹${(total - paid).toLocaleString("en-IN")}`}
          icon={Clock3}
          tone="yellow"
        />
      </div>
      <Card className="mt-5 overflow-hidden">
        <div className="border-b border-[hsl(var(--border))] px-6 py-5">
          <h2 className="font-display text-2xl">Payment timeline</h2>
        </div>
        {isLoading ? (
          <div className="space-y-4 p-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16" />
            ))}
          </div>
        ) : isError ? (
          <ErrorState onRetry={refetch} />
        ) : list.length ? (
          <div className="divide-y divide-[hsl(var(--border))]">
            {list.map((payment) => (
              <div
                key={payment.id}
                data-testid={`payment-${payment.id}`}
                className="flex flex-wrap items-center gap-4 px-6 py-5"
              >
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))]">
                  <IndianRupee size={18} />
                </div>
                <div className="min-w-[180px] flex-1">
                  <div className="font-semibold">{payment.label}</div>
                  <div className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
                    {formatDateTime(payment.timestamp)}{" "}
                    {payment.reference && `· ${payment.reference}`}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-display text-2xl">
                    ₹{payment.amount.toLocaleString("en-IN")}
                  </div>
                  <div className="mt-1">
                    <StatusBadge status={payment.status} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={IndianRupee}
            title="No payments yet"
            detail="Once your produce is weighed and approved, payment updates will appear here."
          />
        )}
      </Card>
    </div>
  );
}

function OfficialDashboard() {
  const { data, isLoading, isError, refetch } = useGetOfficialDashboard(
    DEMO_CENTER_ID,
    {
      query: {
        queryKey: getGetOfficialDashboardQueryKey(DEMO_CENTER_ID),
        refetchInterval: 30000,
      },
    },
  );
  if (isLoading) return <DashboardSkeleton official />;
  if (isError || !data) return <ErrorState onRetry={refetch} />;
  return (
    <div className="animate-rise">
      <PageIntro
        eyebrow="Operations desk"
        title={data.center.name}
        detail={`${data.center.district}, ${data.center.state} · Live centre view`}
        action={
          <div className="flex items-center gap-2 text-xs text-[hsl(var(--muted-foreground))]">
            <span className="animate-pulse-soft h-2 w-2 rounded-full bg-[hsl(var(--secondary-foreground))]" />{" "}
            Updated {relativeTime(data.lastUpdated)}
          </div>
        }
      />
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-5">
        <Metric
          label="Farmers today"
          value={`${data.todayStats.farmersToday}`}
          icon={Users}
          tone="blue"
          detail="arrivals registered"
        />
        <Metric
          label="Active queue"
          value={`${data.todayStats.activeQueue}`}
          icon={Timer}
          tone="yellow"
          detail="tokens in operation"
        />
        <Metric
          label="Capacity"
          value={`${data.capacity.percentage}%`}
          icon={BarChart3}
          tone="yellow"
          detail={`${data.capacity.used} of ${data.capacity.total} quintals`}
        />
        <Metric
          label="Farmers processed"
          value={`${data.todayStats.farmersServed}`}
          icon={CheckCircle2}
          tone="green"
          detail="today"
        />
        <Metric
          label="Procurement"
          value={`₹${data.todayStats.procurementValue.toLocaleString("en-IN")}`}
          icon={IndianRupee}
          tone="red"
          detail="today's recorded value"
        />
      </div>
      <div className="mt-5 grid gap-5 xl:grid-cols-[1.35fr_.65fr]">
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-[hsl(var(--border))] px-6 py-5">
            <div>
              <h2 className="font-display text-2xl">Queue at a glance</h2>
              <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
                Move tokens as each station clears.
              </p>
            </div>
            <Link
              href="/official/queue"
              data-testid="link-official-queue"
              className="text-sm font-bold text-[hsl(var(--primary))]"
            >
              Open queue <ArrowRight size={15} className="ml-1 inline" />
            </Link>
          </div>
          <div className="divide-y divide-[hsl(var(--border))]">
            {data.queue.slice(0, 5).map((token) => (
              <QueueRow key={token.id} token={token} />
            ))}
          </div>
        </Card>
        <Card className="p-6" accent="yellow">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-xs font-bold uppercase tracking-[.14em] text-[hsl(var(--muted-foreground))]">
                Today’s capacity
              </div>
              <div className="mt-3 font-display text-5xl">
                {data.capacity.percentage}%
              </div>
            </div>
            <PackageCheck size={24} className="text-[hsl(var(--primary))]" />
          </div>
          <div className="mt-6 h-3 overflow-hidden rounded-full bg-[hsl(var(--muted))]">
            <div
              className="h-full rounded-full bg-[hsl(var(--accent-foreground))]"
              style={{ width: `${data.capacity.percentage}%` }}
            />
          </div>
          <div className="mt-3 flex justify-between text-xs text-[hsl(var(--muted-foreground))]">
            <span>{data.capacity.used} quintals received</span>
            <span>{data.capacity.total} capacity</span>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-xl bg-[hsl(var(--muted))] p-3">
              <span className="block text-[hsl(var(--muted-foreground))]">
                Weighbridge
              </span>
              <strong>76%</strong>
            </div>
            <div className="rounded-xl bg-[hsl(var(--muted))] p-3">
              <span className="block text-[hsl(var(--muted-foreground))]">
                Storage
              </span>
              <strong>82%</strong>
            </div>
            <div className="rounded-xl bg-[hsl(var(--muted))] p-3">
              <span className="block text-[hsl(var(--muted-foreground))]">
                Active bookings
              </span>
              <strong>38</strong>
            </div>
            <div className="rounded-xl bg-[hsl(var(--muted))] p-3">
              <span className="block text-[hsl(var(--muted-foreground))]">
                Available slots
              </span>
              <strong>12</strong>
            </div>
          </div>
          <div className="mt-6 border-t border-[hsl(var(--border))] pt-5 space-y-3">
            <Link
              href="/official/scan"
              className="flex items-center justify-between text-sm font-bold text-[hsl(var(--primary))]"
            >
              Scan farmer pass <ChevronRight size={17} />
            </Link>
            <Link
              href="/official/procurement"
              data-testid="link-record-procurement"
              className="flex items-center justify-between text-sm font-bold text-[hsl(var(--primary))]"
            >
              Record next procurement <ChevronRight size={17} />
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}

function OfficialQueue() {
  const {
    data: queue,
    isLoading,
    isError,
    refetch,
  } = useListCenterQueue(DEMO_CENTER_ID, {
    query: {
      queryKey: getListCenterQueueQueryKey(DEMO_CENTER_ID),
      refetchInterval: 15000,
    },
  });
  const update = useUpdateQueueTokenStatus();
  const [filter, setFilter] = useState("all");
  const [workingId, setWorkingId] = useState<string | null>(null);
  const list = (queue ?? []).filter(
    (token) => filter === "all" || token.status === filter,
  );

  const move = (token: any, status: QueueStatusInputStatus) => {
    setWorkingId(token.id);
    update.mutate(
      { tokenId: token.id, data: { status } },
      {
        onSettled: () => setWorkingId(null),
        onSuccess: () =>
          queryClient.invalidateQueries({
            queryKey: getListCenterQueueQueryKey(DEMO_CENTER_ID),
          }),
      },
    );
  };

  const reschedule = async (token: any) => {
    setWorkingId(token.id);
    try {
      await localApiRequest(`/api/queue/${token.id}/reschedule`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: "Officer reschedule" }),
      });
      await queryClient.invalidateQueries({
        queryKey: getListCenterQueueQueryKey(DEMO_CENTER_ID),
      });
    } finally {
      setWorkingId(null);
    }
  };

  return (
    <div className="animate-rise">
      <PageIntro
        eyebrow="Live operations"
        title="Keep the line moving."
        detail="Monitor every token, check farmers in, and move each procurement through the station."
        action={
          <div className="flex gap-2">
            <Link
              href="/official/scan"
              className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[hsl(var(--border))] px-4 text-sm font-semibold hover:border-[hsl(var(--primary))]"
            >
              <ScanLine size={16} /> Scan pass
            </Link>
            <Button
              variant="outline"
              onClick={() => refetch()}
              data-testid="button-refresh-queue"
            >
              <RefreshCw size={16} /> Refresh
            </Button>
          </div>
        }
      />
      <div className="mb-5 flex flex-wrap gap-2">
        {[
          ["all", "All tokens"],
          ["booked", "Waiting"],
          ["checked_in", "Checked in"],
          ["weighing", "Weighing"],
          ["quality_check", "Quality check"],
          ["completed", "Completed"],
          ["cancelled", "No-show / cancelled"],
        ].map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setFilter(value)}
            className={cn(
              "rounded-full border px-3 py-2 text-xs font-bold transition-colors",
              filter === value
                ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]"
                : "border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--muted-foreground))]",
            )}
          >
            {label}
          </button>
        ))}
      </div>
      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="space-y-3 p-6">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-20" />
            ))}
          </div>
        ) : isError ? (
          <ErrorState onRetry={refetch} />
        ) : list.length ? (
          <div className="divide-y divide-[hsl(var(--border))]">
            {list.map((token) => (
              <div
                key={token.id}
                className="flex flex-col gap-4 px-6 py-5 xl:flex-row xl:items-center"
                data-testid={`official-queue-row-${token.id}`}
              >
                <div className="flex min-w-0 flex-1 items-center gap-4">
                  <div className="grid h-12 w-16 shrink-0 place-items-center rounded-xl bg-[hsl(var(--primary))] font-display text-base text-[hsl(var(--primary-foreground))]">
                    {token.tokenNumber}
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold">{token.farmerName}</span>
                      <StatusBadge status={token.status} />
                    </div>
                    <div className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
                      {token.crop} · {token.slotStart}–{token.slotEnd} ·{" "}
                      {token.quantityQuintals} quintals
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    variant="soft"
                    disabled={
                      workingId === token.id ||
                      !["booked"].includes(token.status)
                    }
                    onClick={() => move(token, "checked_in")}
                  >
                    Check-in
                  </Button>
                  <Button
                    variant="outline"
                    disabled={
                      workingId === token.id ||
                      !["booked", "checked_in"].includes(token.status)
                    }
                    onClick={() =>
                      move(
                        token,
                        token.status === "booked" ? "checked_in" : "weighing",
                      )
                    }
                  >
                    Call Next
                  </Button>
                  <Button
                    variant="outline"
                    disabled={
                      workingId === token.id ||
                      ["completed", "cancelled"].includes(token.status)
                    }
                    onClick={() => reschedule(token)}
                  >
                    Reschedule
                  </Button>
                  <Button
                    variant="danger"
                    disabled={
                      workingId === token.id ||
                      ["completed", "cancelled"].includes(token.status)
                    }
                    onClick={() => move(token, "cancelled")}
                  >
                    No-show
                  </Button>
                  <Link
                    href={`/official/procurement?token=${token.id}`}
                    className={cn(
                      "grid h-11 w-11 place-items-center rounded-xl border border-[hsl(var(--border))]",
                      ["checked_in", "weighing", "quality_check"].includes(
                        token.status,
                      )
                        ? "hover:border-[hsl(var(--primary))]"
                        : "pointer-events-none opacity-40",
                    )}
                    title="Record procurement"
                  >
                    <FileCheck2 size={17} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Users}
            title="The queue is clear"
            detail="New bookings and check-ins will appear here as the day begins."
          />
        )}
      </Card>
    </div>
  );
}

function QueueRow({
  token,
  operational,
  update,
  pending,
}: {
  token: any;
  operational?: boolean;
  update?: (status: QueueStatusInputStatus) => void;
  pending?: boolean;
}) {
  const next: Record<
    string,
    { label: string; status: QueueStatusInputStatus }
  > = {
    booked: { label: "Check in", status: "checked_in" },
    checked_in: { label: "Start weighing", status: "weighing" },
    weighing: { label: "Quality check", status: "quality_check" },
    quality_check: { label: "Complete", status: "completed" },
  };
  return (
    <div
      data-testid={`queue-row-${token.id}`}
      className="flex flex-col gap-4 px-6 py-5 md:flex-row md:items-center"
    >
      <div className="flex min-w-0 flex-1 items-center gap-4">
        <div className="grid h-12 w-16 shrink-0 place-items-center whitespace-nowrap rounded-xl bg-[hsl(var(--primary))] px-1 font-display text-base leading-none text-[hsl(var(--primary-foreground))]">
          {token.tokenNumber}
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold">{token.farmerName}</span>
            <StatusBadge status={token.status} />
          </div>
          <div className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
            {token.crop} · {token.quantityQuintals} quintals ·{" "}
            {token.aheadCount} ahead
          </div>
        </div>
      </div>
      {operational && update && (
        <div className="flex items-center gap-2">
          <Button
            data-testid={`button-advance-${token.id}`}
            disabled={pending || !next[token.status]}
            onClick={() =>
              next[token.status] && update(next[token.status].status)
            }
            variant="soft"
          >
            {next[token.status]?.label ?? "Completed"} <ArrowRight size={15} />
          </Button>
          <Link
            href={`/official/procurement?token=${token.id}`}
            data-testid={`link-procure-${token.id}`}
            className="grid h-11 w-11 place-items-center rounded-xl border border-[hsl(var(--border))] hover:border-[hsl(var(--primary))]"
            title="Record procurement"
          >
            <FileCheck2 size={17} />
          </Link>
        </div>
      )}
    </div>
  );
}

function OfficialScanPage() {
  const [token, setToken] = useState<any | null>(null);
  const [verified, setVerified] = useState(false);
  async function demoScan() {
    const res = await localApiRequest<any>("/api/queue/token-104");
    setToken(res);
    setVerified(false);
  }
  async function confirm() {
    if (!token) return;
    const res = await localApiRequest<any>("/api/official/checkin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tokenId: token.id }),
    });
    setVerified(true);
    setToken(res);
    queryClient.invalidateQueries({
      queryKey: getListCenterQueueQueryKey(DEMO_CENTER_ID),
    });
  }
  return (
    <div className="animate-rise">
      <PageIntro
        eyebrow="Station 01 · Gate"
        title="Scan farmer pass."
        detail="Use the demo scanner to verify the QR pass before allowing gate entry."
      />
      <div className="grid gap-6 lg:grid-cols-[.8fr_1.2fr]">
        <Card className="p-6 sm:p-8">
          <div className="mx-auto flex aspect-square max-w-sm items-center justify-center rounded-3xl border-2 border-dashed border-[hsl(var(--primary)/.45)] bg-[hsl(var(--muted))]">
            <div className="text-center">
              <ScanLine
                size={64}
                className="mx-auto text-[hsl(var(--primary))]"
              />
              <div className="mt-4 font-display text-2xl">QR scanner</div>
              <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">
                Camera not required for this prototype.
              </p>
              <Button className="mt-6" onClick={demoScan}>
                <ScanLine size={16} /> Scan Demo Token
              </Button>
            </div>
          </div>
        </Card>
        <Card className="p-6 sm:p-8" accent="yellow">
          {!token ? (
            <EmptyState
              icon={ScanLine}
              title="Waiting for a pass"
              detail="Scan a farmer QR pass to load gate verification details."
            />
          ) : (
            <div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold uppercase tracking-[.14em] text-[hsl(var(--muted-foreground))]">
                    Farmer pass
                  </div>
                  <h2 className="mt-1 font-display text-3xl">
                    {token.tokenNumber}
                  </h2>
                </div>
                <StatusBadge status={verified ? "checked_in" : token.status} />
              </div>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl bg-[hsl(var(--muted))] p-4">
                  <div className="text-xs text-[hsl(var(--muted-foreground))]">
                    Farmer
                  </div>
                  <strong>{token.farmerName}</strong>
                </div>
                <div className="rounded-xl bg-[hsl(var(--muted))] p-4">
                  <div className="text-xs text-[hsl(var(--muted-foreground))]">
                    Crop
                  </div>
                  <strong>{token.crop}</strong>
                </div>
                <div className="rounded-xl bg-[hsl(var(--muted))] p-4">
                  <div className="text-xs text-[hsl(var(--muted-foreground))]">
                    Slot
                  </div>
                  <strong>
                    {token.slotStart}–{token.slotEnd}
                  </strong>
                </div>
                <div className="rounded-xl bg-[hsl(var(--muted))] p-4">
                  <div className="text-xs text-[hsl(var(--muted-foreground))]">
                    Geo status
                  </div>
                  <strong className="text-[hsl(var(--secondary-foreground))]">
                    ✓ Within 2 km
                  </strong>
                </div>
              </div>
              <div className="mt-5 rounded-xl border border-[hsl(var(--secondary-foreground)/.2)] bg-[hsl(var(--secondary)/.35)] p-4 text-sm">
                {verified
                  ? "✓ Gate verification complete. Farmer is checked in."
                  : "Farmer: Demo Farmer · Token: G-104 · Geo Status: ✓ Within 2 km"}
              </div>
              {!verified && (
                <Button className="mt-5 w-full" onClick={confirm}>
                  Confirm Check-in
                </Button>
              )}
              {verified && (
                <Link
                  href={`/official/procurement?token=${token.id}`}
                  className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-[hsl(var(--primary))] px-4 text-sm font-bold text-[hsl(var(--primary-foreground))]"
                >
                  Continue to Procurement{" "}
                  <ArrowRight size={16} className="ml-2" />
                </Link>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

function ProcurementPage() {
  const params = useParams<{ token?: string }>();
  const [location] = useLocation();
  const queryToken =
    new URLSearchParams(location.split("?")[1] ?? "").get("token") ??
    params.token ??
    "";
  const [tokenId, setTokenId] = useState(queryToken);
  const [weight, setWeight] = useState("");
  const [grade, setGrade] = useState<ProcurementInputQualityGrade>("A");
  const [rate, setRate] = useState("2300");
  const [notes, setNotes] = useState("");
  const [saved, setSaved] = useState(false);
  const { data: queue } = useListCenterQueue(DEMO_CENTER_ID, {
    query: { queryKey: getListCenterQueueQueryKey(DEMO_CENTER_ID) },
  });
  const procurement = useCreateProcurementRecord();
  const chosen = queue?.find((item) => item.id === tokenId);
  function submit(event: FormEvent) {
    event.preventDefault();
    procurement.mutate(
      {
        data: {
          tokenId,
          weightKg: Number(weight) * 100,
          qualityGrade: grade,
          ratePerQuintal: Number(rate),
          notes: notes || undefined,
        },
      },
      { onSuccess: () => setSaved(true) },
    );
  }
  if (saved)
    return (
      <div className="mx-auto max-w-3xl py-8 animate-rise">
        <div className="text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))]">
            <Check size={30} />
          </div>
          <h1 className="mt-5 font-display text-4xl">Procurement recorded.</h1>
          <p className="mt-3 text-sm text-[hsl(var(--muted-foreground))]">
            Digital receipt and payment tracking are ready for the farmer.
          </p>
        </div>
        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          <Card className="p-6" accent="yellow">
            <div className="text-xs font-bold uppercase tracking-[.14em] text-[hsl(var(--muted-foreground))]">
              FasalFlux Digital Receipt
            </div>
            <h2 className="mt-2 font-display text-2xl">
              Bill ID · FF-{Date.now().toString().slice(-6)}
            </h2>
            <div className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <span>Farmer</span>
                <strong>{chosen?.farmerName ?? "Demo Farmer"}</strong>
              </div>
              <div className="flex justify-between gap-4">
                <span>Crop</span>
                <strong>{chosen?.crop ?? "Wheat"}</strong>
              </div>
              <div className="flex justify-between gap-4">
                <span>Quantity</span>
                <strong>{(Number(weight) / 100).toFixed(1)} Quintal</strong>
              </div>
              <div className="flex justify-between gap-4">
                <span>Grade</span>
                <strong>{grade}</strong>
              </div>
              <div className="flex justify-between gap-4">
                <span>Rate</span>
                <strong>
                  ₹{Number(rate).toLocaleString("en-IN")} / Quintal
                </strong>
              </div>
              <div className="border-t border-[hsl(var(--border))] pt-3 flex justify-between text-base">
                <span>Total</span>
                <strong>
                  ₹
                  {((Number(weight) / 100) * Number(rate)).toLocaleString(
                    "en-IN",
                    { maximumFractionDigits: 2 },
                  )}
                </strong>
              </div>
            </div>
            <div className="mt-5 rounded-xl bg-[hsl(var(--muted))] p-3 text-sm">
              Payment status · <strong>Bank Processing</strong>
            </div>
          </Card>
          <Card className="p-6">
            <div className="text-xs font-bold uppercase tracking-[.14em] text-[hsl(var(--muted-foreground))]">
              DBT payment tracker
            </div>
            <div className="mt-6 space-y-5">
              {[
                ["Crop weighed", "done"],
                ["Quality approved", "done"],
                ["Bank processing", "active"],
                ["Account credited", "pending"],
              ].map(([label, status], i) => (
                <div key={label} className="flex gap-3">
                  <div
                    className={cn(
                      "mt-1 grid h-7 w-7 shrink-0 place-items-center rounded-full border text-xs font-bold",
                      status === "done"
                        ? "border-[hsl(var(--secondary-foreground))] bg-[hsl(var(--secondary))]"
                        : status === "active"
                          ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary)/.1)]"
                          : "border-[hsl(var(--border))]",
                    )}
                  >
                    {status === "done" ? "✓" : i + 1}
                  </div>
                  <div>
                    <strong className="text-sm">{label}</strong>
                    {status === "active" && (
                      <div className="text-xs text-[hsl(var(--muted-foreground))]">
                        Mock bank processing · DBT settlement pending
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <Button
              className="mt-7 w-full"
              data-testid="button-record-another"
              onClick={() => {
                setSaved(false);
                setTokenId("");
                setWeight("");
              }}
            >
              Record another
            </Button>
          </Card>
        </div>
      </div>
    );
  return (
    <div className="animate-rise">
      <PageIntro
        eyebrow="Station 02 · Intake"
        title="Record what arrived."
        detail="Use the farmer’s token to capture weight, quality, and the agreed rate. Check each field before saving."
      />
      <div className="grid gap-6 xl:grid-cols-[.8fr_1.2fr]">
        <Card className="p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]">
              <ScanLine size={19} />
            </div>
            <div>
              <h2 className="font-display text-2xl">Find a token</h2>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">
                Select the farmer at your scale.
              </p>
            </div>
          </div>
          <div className="mt-6 space-y-2">
            {queue
              ?.filter((item) =>
                ["checked_in", "weighing", "quality_check"].includes(
                  item.status,
                ),
              )
              .map((item) => (
                <button
                  key={item.id}
                  type="button"
                  data-testid={`button-select-token-${item.id}`}
                  onClick={() => setTokenId(item.id)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl border p-3 text-left",
                    tokenId === item.id
                      ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary)/.06)]"
                      : "border-[hsl(var(--border))]",
                  )}
                >
                  <div className="grid h-9 w-9 place-items-center rounded-lg bg-[hsl(var(--muted))] font-bold">
                    {item.tokenNumber}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-bold">{item.farmerName}</div>
                    <div className="text-xs text-[hsl(var(--muted-foreground))]">
                      {item.crop} · {item.quantityQuintals} quintals
                    </div>
                  </div>
                  <StatusBadge status={item.status} />
                </button>
              ))}
          </div>
          {!queue?.length && (
            <div className="mt-5 rounded-xl bg-[hsl(var(--muted))] p-4 text-sm text-[hsl(var(--muted-foreground))]">
              No checked-in tokens yet.
            </div>
          )}
        </Card>
        <Card className="p-6 sm:p-8" accent="yellow">
          <form onSubmit={submit}>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display text-2xl">Intake details</h2>
                <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
                  {chosen
                    ? `${chosen.tokenNumber} · ${chosen.farmerName}`
                    : "Choose a token first"}
                </p>
              </div>
              {chosen && <Badge tone="green">Ready to record</Badge>}
            </div>
            <div className="mt-7 grid gap-5 sm:grid-cols-2">
              <label className="text-sm font-semibold">
                Quantity received
                <input
                  required
                  min=".1"
                  step=".1"
                  type="number"
                  data-testid="input-weight"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="e.g. 42.5"
                  className="mt-2 h-12 w-full rounded-xl border border-[hsl(var(--input))] bg-transparent px-4 outline-none focus:border-[hsl(var(--primary))]"
                />
                <span className="mt-1 block text-xs font-normal text-[hsl(var(--muted-foreground))]">
                  quintals
                </span>
              </label>
              <label className="text-sm font-semibold">
                Quality grade
                <select
                  data-testid="select-quality-grade"
                  value={grade}
                  onChange={(e) =>
                    setGrade(e.target.value as ProcurementInputQualityGrade)
                  }
                  className="mt-2 h-12 w-full rounded-xl border border-[hsl(var(--input))] bg-[hsl(var(--card))] px-4 outline-none focus:border-[hsl(var(--primary))]"
                >
                  <option value="A">A · Premium</option>
                  <option value="B">B · Standard</option>
                  <option value="C">C · Accepted</option>
                  <option value="rejected">Rejected</option>
                </select>
              </label>
              <label className="text-sm font-semibold sm:col-span-2">
                Rate per quintal
                <input
                  required
                  min="0"
                  type="number"
                  data-testid="input-rate"
                  value={rate}
                  onChange={(e) => setRate(e.target.value)}
                  className="mt-2 h-12 w-full rounded-xl border border-[hsl(var(--input))] bg-transparent px-4 outline-none focus:border-[hsl(var(--primary))]"
                />
                <span className="mt-1 block text-xs font-normal text-[hsl(var(--muted-foreground))]">
                  ₹ per quintal
                </span>
              </label>
              <label className="text-sm font-semibold sm:col-span-2">
                Notes{" "}
                <span className="font-normal text-[hsl(var(--muted-foreground))]">
                  optional
                </span>
                <textarea
                  data-testid="input-procurement-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Add a short note for the record"
                  className="mt-2 w-full resize-none rounded-xl border border-[hsl(var(--input))] bg-transparent p-3 outline-none focus:border-[hsl(var(--primary))]"
                />
              </label>
            </div>
            <div className="mt-7 flex items-center justify-between border-t border-[hsl(var(--border))] pt-5">
              <div className="text-sm text-[hsl(var(--muted-foreground))]">
                Estimated amount{" "}
                <strong className="ml-1 text-lg text-[hsl(var(--foreground))]">
                  ₹
                  {weight
                    ? ((Number(weight) / 100) * Number(rate)).toLocaleString(
                        "en-IN",
                        { maximumFractionDigits: 0 },
                      )
                    : "—"}
                </strong>
              </div>
              <Button
                type="submit"
                data-testid="button-submit-procurement"
                disabled={!tokenId || procurement.isPending}
              >
                {procurement.isPending ? "Saving…" : "Save record"}{" "}
                <Check size={16} />
              </Button>
            </div>
            {procurement.isError && (
              <p className="mt-3 text-sm text-[hsl(var(--destructive))]">
                Could not save this record. Please check the connection.
              </p>
            )}
          </form>
        </Card>
      </div>
    </div>
  );
}

function Metric({
  label,
  value,
  icon: Icon,
  tone,
  detail,
}: {
  label: string;
  value: string;
  icon: typeof Coins;
  tone: Tone;
  detail?: string;
}) {
  const { t } = useLanguage();
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs font-bold uppercase tracking-[.1em] text-[hsl(var(--muted-foreground))]">
            {t(label)}
          </div>
          <div className="mt-3 font-display text-3xl">{value}</div>
          {detail && (
            <div className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
              {t(detail)}
            </div>
          )}
        </div>
        <div
          className={cn(
            "grid h-10 w-10 place-items-center rounded-xl",
            tone === "yellow" &&
              "bg-[hsl(var(--accent)/.27)] text-[hsl(36_63%_28%)]",
            tone === "green" &&
              "bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))]",
            tone === "blue" &&
              "bg-[hsl(var(--primary)/.1)] text-[hsl(var(--primary))]",
            tone === "red" &&
              "bg-[hsl(var(--destructive)/.1)] text-[hsl(var(--destructive))]",
          )}
        >
          <Icon size={19} />
        </div>
      </div>
    </Card>
  );
}

function DashboardSkeleton({ official = false }: { official?: boolean }) {
  return (
    <div>
      <Skeleton className="h-9 w-2/3" />
      <Skeleton className="mt-3 h-5 w-1/2" />
      <div className="mt-8 grid gap-5 lg:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className={cn("h-48", i > 2 && "lg:col-span-1")} />
        ))}
      </div>
      {official && <Skeleton className="mt-5 h-64 w-full" />}
    </div>
  );
}
function ErrorState({ onRetry }: { onRetry: () => void }) {
  const { t } = useLanguage();
  return (
    <div className="mx-auto grid max-w-md place-items-center py-20 text-center">
      <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[hsl(var(--accent)/.24)] text-[hsl(var(--accent-foreground))]">
        <CloudOff size={22} />
      </div>
      <h2 className="mt-5 font-display text-2xl">
        {t("The signal wandered.")}
      </h2>
      <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">
        {t(
          "We couldn’t reach the centre right now. Your saved details are safe.",
        )}
      </p>
      <Button variant="outline" onClick={onRetry} data-testid="button-retry">
        <RefreshCw size={16} /> {t("Try again")}
      </Button>
    </div>
  );
}
function Landing() {
  const { t } = useLanguage();
  return (
    <div className="grid min-h-[calc(100dvh-56px)] items-center py-10 lg:grid-cols-[1.1fr_.9fr] lg:gap-16">
      <div className="animate-rise">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3">
            <FieldMark />
            <div className="flex items-center gap-3">
              <div className="font-display text-[2.2rem] font-black leading-none tracking-[-0.06em] text-[hsl(var(--foreground))]">
                <span className="text-[hsl(var(--primary))]">Fasal</span>
                <span className="text-[hsl(var(--secondary))]">Flux</span>
              </div>
            </div>
          </div>
          <div className="ml-auto">
            <LanguageSelector />
          </div>
        </div>
        <div className="mt-16 max-w-2xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[hsl(var(--accent)/.24)] px-3 py-1.5 text-xs font-bold text-[hsl(36_63%_28%)]">
            <ShieldCheck size={14} /> {t("Built for the journey to the mandi")}
          </div>
          <h1 className="font-display text-6xl leading-[.95] tracking-tight sm:text-8xl">
            {t("Know your turn.")}
          </h1>
          <p className="mt-7 max-w-lg text-lg leading-relaxed text-[hsl(var(--muted-foreground))]">
            {t(
              "A quiet, clear way for farmers and procurement teams to move through harvest day — with fewer waits and more certainty.",
            )}
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/farmer"
              data-testid="link-enter-farmer"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-6 font-bold text-[hsl(var(--primary-foreground))] shadow-[0_12px_25px_hsl(205_46%_29%/.18)]"
            >
              {t("Enter farmer view")} <ArrowRight size={17} />
            </Link>
            <Link
              href="/official"
              data-testid="link-enter-official"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-[hsl(var(--border))] px-6 font-bold hover:border-[hsl(var(--primary))]"
            >
              {t("Open official desk")} <BarChart3 size={17} />
            </Link>
          </div>
        </div>
        <div className="mt-16 flex items-center gap-5 border-t border-[hsl(var(--border))] pt-5 text-sm text-[hsl(var(--muted-foreground))]">
          <div className="flex -space-x-2">
            <div className="grid h-8 w-8 place-items-center rounded-full border-2 border-[hsl(var(--background))] bg-[hsl(var(--primary))] text-xs font-bold text-[hsl(var(--primary-foreground))]">
              RK
            </div>
            <div className="grid h-8 w-8 place-items-center rounded-full border-2 border-[hsl(var(--background))] bg-[hsl(var(--secondary-foreground))] text-xs font-bold text-[hsl(var(--card))]">
              AS
            </div>
            <div className="grid h-8 w-8 place-items-center rounded-full border-2 border-[hsl(var(--background))] bg-[hsl(var(--accent))] text-xs font-bold">
              MP
            </div>
          </div>
          <span>
            {t("Designed for real field days, even when the signal is not.")}
          </span>
        </div>
      </div>
      <div className="relative mt-10 lg:mt-0">
        <div className="field-grid relative overflow-hidden rounded-[2rem] bg-[hsl(var(--secondary))] p-6 sm:p-10">
          <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full border-[35px] border-[hsl(var(--accent)/.45)]" />
          <div className="relative">
            <div className="rounded-2xl bg-[hsl(var(--card))] p-5 shadow-[0_18px_40px_hsl(205_46%_29%/.13)]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-[.14em] text-[hsl(var(--muted-foreground))]">
                  {t("Live token")}
                </span>
                <Badge tone="green">{t("Moving now")}</Badge>
              </div>
              <div className="mt-4 flex items-end justify-between">
                <div>
                  <div className="font-display text-7xl text-[hsl(var(--primary))]">
                    B-17
                  </div>
                  <div className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
                    Churu Grain Centre
                  </div>
                </div>
                <ScanLine
                  size={44}
                  className="text-[hsl(var(--accent-foreground))]"
                />
              </div>
              <div className="mt-6 grid grid-cols-3 gap-2 border-t border-[hsl(var(--border))] pt-4 text-center">
                <div>
                  <div className="font-bold">4</div>
                  <div className="text-[10px] text-[hsl(var(--muted-foreground))]">
                    {t("ahead")}
                  </div>
                </div>
                <div>
                  <div className="font-bold">~28m</div>
                  <div className="text-[10px] text-[hsl(var(--muted-foreground))]">
                    {t("wait")}
                  </div>
                </div>
                <div>
                  <div className="font-bold">2:30</div>
                  <div className="text-[10px] text-[hsl(var(--muted-foreground))]">
                    {t("slot")}
                  </div>
                </div>
              </div>
            </div>
            <div className="ml-8 mt-5 rounded-2xl bg-[hsl(var(--primary))] p-5 text-[hsl(var(--primary-foreground))] shadow-[0_14px_30px_hsl(205_46%_29%/.15)]">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))]">
                  <Truck size={19} />
                </div>
                <div>
                  <div className="text-sm font-bold">
                    {t("Leave in about 10 minutes")}
                  </div>
                  <div className="mt-1 text-xs text-[hsl(var(--primary-foreground)/.65)]">
                    {t("The queue is moving at Churu.")}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function todayIso() {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
}
function addDaysIso(days: number) {
  const d = new Date(`${todayIso()}T00:00:00+05:30`);
  d.setDate(d.getDate() + days);
  return d.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
}
function indiaNowMinutes() {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date());
  return (
    Number(parts.find((p) => p.type === "hour")?.value ?? 0) * 60 +
    Number(parts.find((p) => p.type === "minute")?.value ?? 0)
  );
}
function isSlotBookable(slot: any, date: string) {
  if (slot.status === "full") return false;
  if (date !== todayIso()) return true;
  const [h, m] = String(slot.startTime).split(":").map(Number);
  return h * 60 + m > indiaNowMinutes() + 1;
}

function formatLongDate(value: string) {
  if (!value) return "—";
  return new Date(`${value}T00:00:00+05:30`).toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatWeekday(value: string) {
  if (!value) return "—";
  return new Date(`${value}T00:00:00+05:30`).toLocaleDateString("en-IN", {
    weekday: "short",
    timeZone: "Asia/Kolkata",
  });
}

function formatDate(value: string) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
}
function formatDateTime(value: string) {
  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
function relativeTime(value: string) {
  const parsed = new Date(value).getTime();
  if (Number.isNaN(parsed)) return value;
  const diff = Math.max(0, Date.now() - parsed);
  const min = Math.round(diff / 60000);
  return min < 1
    ? "now"
    : min < 60
      ? `${min}m ago`
      : `${Math.round(min / 60)}h ago`;
}

function Router() {
  const [location] = useLocation();
  return (
    <ErrorBoundary resetKey={location}>
      <AppShell>
        <Switch>
          <Route path="/" component={FarmerDashboard} />
          <Route path="/farmer" component={FarmerDashboard} />
          <Route path="/farmer/book" component={BookingPage} />
          <Route path="/farmer/token/:tokenId" component={TokenPage} />
          <Route path="/farmer/payments" component={PaymentsPage} />
          <Route path="/farmer/procurement" component={FarmerProcurementPage} />
          <Route path="/farmer/help" component={FarmerHelpPage} />
          <Route path="/farmer/keypad-help" component={KeypadHelpPage} />
          <Route
            path="/farmer/gate/:tokenId"
            component={GateVerificationPage}
          />
          <Route path="/official" component={OfficialDashboard} />
          <Route path="/official/queue" component={OfficialQueue} />
          <Route path="/official/scan" component={OfficialScanPage} />
          <Route path="/official/procurement" component={ProcurementPage} />
          <Route component={NotFound} />
        </Switch>
      </AppShell>
    </ErrorBoundary>
  );
}

function App() {
  return (
    <LanguageProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </LanguageProvider>
  );
}

export default App;
