import type {
  Farmer,
  FarmerDashboard,
  OfficialDashboard,
  Payment,
  ProcurementCenter,
  ProcurementInput,
  ProcurementRecord,
  QueueStatusInput,
  QueueToken,
  Slot,
  SlotStatus,
} from "@/api-client";

export const STORAGE_KEY = "fasalflux_demo_state";

export type DemoSlot = Slot & {
  category: "grain" | "perishable";
  recommended?: boolean;
  waitMinutes?: number;
  gate?: string;
};

export type AppState = {
  centers: ProcurementCenter[];
  slots: DemoSlot[];
  queue: QueueToken[];
  payments: Payment[];
  procurementRecords: ProcurementRecord[];
  lastUpdated: string;
};

const IST = "Asia/Kolkata";

const toDateParts = (date = new Date()) =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: IST,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);

export function todayIso(): string {
  return toDateParts();
}

export function addDaysIso(days: number): string {
  const reference = new Date(`${toDateParts()}T00:00:00+05:30`);
  reference.setDate(reference.getDate() + days);
  return toDateParts(reference);
}

const nowMinutes = (): number => {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: IST,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date());

  const hours = Number(parts.find((part) => part.type === "hour")?.value ?? 0);
  const minutes = Number(
    parts.find((part) => part.type === "minute")?.value ?? 0,
  );
  return hours * 60 + minutes;
};

const demoFarmer: Farmer = {
  id: "farmer-001",
  name: "Ramesh Kumar",
  phone: "+91 98765 43210",
  village: "Bhaleri, Churu",
  crop: "Wheat",
  preferredLanguage: "hi",
};

const demoCenters: ProcurementCenter[] = [
  {
    id: "center-churu-01",
    name: "Central Mandi",
    district: "Churu",
    state: "Rajasthan",
    distanceKm: 6.4,
    todayCapacity: 120,
    todayBooked: 86,
    status: "open",
  },
  {
    id: "center-churu-02",
    name: "North Grain Centre",
    district: "Churu",
    state: "Rajasthan",
    distanceKm: 9.2,
    todayCapacity: 100,
    todayBooked: 61,
    status: "open",
  },
  {
    id: "center-churu-03",
    name: "Agri Trade Yard",
    district: "Churu",
    state: "Rajasthan",
    distanceKm: 12.7,
    todayCapacity: 150,
    todayBooked: 108,
    status: "busy",
  },
  {
    id: "center-churu-04",
    name: "Rural Procurement Hub",
    district: "Churu",
    state: "Rajasthan",
    distanceKm: 15.1,
    todayCapacity: 90,
    todayBooked: 42,
    status: "open",
  },
];

const makeSlots = (
  centerId: string,
  date: string,
  perishable = false,
): DemoSlot[] => {
  const times = perishable
    ? [
        ["04:00", "04:30"],
        ["04:30", "05:00"],
        ["05:00", "05:30"],
        ["05:30", "06:00"],
        ["06:00", "06:30"],
        ["06:30", "07:00"],
        ["07:00", "07:30"],
        ["07:30", "08:00"],
      ]
    : [
        ["08:00", "08:30"],
        ["08:30", "09:00"],
        ["09:00", "09:30"],
        ["09:30", "10:00"],
        ["10:00", "10:30"],
        ["10:30", "11:00"],
        ["11:00", "11:30"],
        ["11:30", "12:00"],
        ["12:00", "12:30"],
        ["12:30", "13:00"],
        ["13:00", "13:30"],
        ["13:30", "14:00"],
        ["14:00", "14:30"],
        ["14:30", "15:00"],
        ["15:00", "15:30"],
      ];

  return times.map(([start, end], index) => {
    let remaining = [5, 2, 0, 12, 12, 7, 4, 8][index] ?? 6;
    const capacity = 12;
    const [hours, minutes] = start.split(":").map(Number);
    const startMinutes = hours * 60 + minutes;
    const past = date === todayIso() && startMinutes <= nowMinutes();
    if (past) remaining = 0;

    const status: SlotStatus =
      remaining === 0 ? "full" : remaining <= 3 ? "limited" : "available";
    return {
      id: `${centerId}-${date}-${perishable ? "p" : "g"}-${start.replace(":", "")}`,
      centerId,
      date,
      startTime: start,
      endTime: end,
      remaining,
      capacity,
      status,
      category: perishable ? "perishable" : "grain",
      recommended:
        !past && remaining >= 10 && (perishable ? index === 1 : index === 4),
      waitMinutes: Math.max(20, 35 + index * 5),
      gate: "Gate 2",
    } as DemoSlot;
  });
};

const makeQueueSeed = (): QueueToken[] => [
  {
    id: "token-098",
    tokenNumber: "G-098",
    farmerName: "Ramesh Kumar",
    crop: "Wheat",
    quantityQuintals: 14,
    centerName: "Central Mandi",
    status: "booked",
    position: 1,
    aheadCount: 0,
    etaMinutes: 7,
    bookedTime: "08:05",
    qrValue: "fasalflux://G-098",
    gate: "Gate 2",
    slotDate: todayIso(),
    slotStart: "10:00",
    slotEnd: "10:30",
  },
  {
    id: "token-099",
    tokenNumber: "G-099",
    farmerName: "Sita Devi",
    crop: "Mustard",
    quantityQuintals: 12,
    centerName: "Central Mandi",
    status: "booked",
    position: 2,
    aheadCount: 1,
    etaMinutes: 14,
    bookedTime: "08:12",
    qrValue: "fasalflux://G-099",
    gate: "Gate 2",
    slotDate: todayIso(),
    slotStart: "10:00",
    slotEnd: "10:30",
  },
  {
    id: "token-100",
    tokenNumber: "G-100",
    farmerName: "Mohan Lal",
    crop: "Rice",
    quantityQuintals: 18,
    centerName: "Central Mandi",
    status: "checked_in",
    position: 3,
    aheadCount: 2,
    etaMinutes: 21,
    bookedTime: "08:20",
    qrValue: "fasalflux://G-100",
    gate: "Gate 2",
    slotDate: todayIso(),
    slotStart: "10:00",
    slotEnd: "10:30",
  },
  {
    id: "token-101",
    tokenNumber: "G-101",
    farmerName: "Kamal Singh",
    crop: "Wheat",
    quantityQuintals: 16,
    centerName: "Central Mandi",
    status: "checked_in",
    position: 4,
    aheadCount: 3,
    etaMinutes: 28,
    bookedTime: "08:32",
    qrValue: "fasalflux://G-101",
    gate: "Gate 2",
    slotDate: todayIso(),
    slotStart: "10:00",
    slotEnd: "10:30",
  },
  {
    id: "token-102",
    tokenNumber: "G-102",
    farmerName: "Neeraj Kumar",
    crop: "Chana",
    quantityQuintals: 10,
    centerName: "Central Mandi",
    status: "weighing",
    position: 5,
    aheadCount: 4,
    etaMinutes: 35,
    bookedTime: "08:40",
    qrValue: "fasalflux://G-102",
    gate: "Gate 2",
    slotDate: todayIso(),
    slotStart: "10:00",
    slotEnd: "10:30",
  },
  {
    id: "token-103",
    tokenNumber: "G-103",
    farmerName: "Ravi Singh",
    crop: "Wheat",
    quantityQuintals: 15,
    centerName: "Central Mandi",
    status: "booked",
    position: 6,
    aheadCount: 5,
    etaMinutes: 42,
    bookedTime: "08:48",
    qrValue: "fasalflux://G-103",
    gate: "Gate 2",
    slotDate: todayIso(),
    slotStart: "10:00",
    slotEnd: "10:30",
  },
  {
    id: "token-104",
    tokenNumber: "G-104",
    farmerName: "Demo Farmer",
    crop: "Wheat",
    quantityQuintals: 11,
    centerName: "Central Mandi",
    status: "booked",
    position: 7,
    aheadCount: 6,
    etaMinutes: 49,
    bookedTime: "08:55",
    qrValue: "fasalflux://G-104",
    gate: "Gate 2",
    slotDate: todayIso(),
    slotStart: "10:00",
    slotEnd: "10:30",
  },
];

const makePayments = (): Payment[] => [
  {
    id: "payment-001",
    farmerId: "farmer-001",
    amount: 12000,
    status: "paid",
    label: "Wheat lot · 14 quintals",
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    reference: "UTR-89451234",
  },
  {
    id: "payment-002",
    farmerId: "farmer-001",
    amount: 9000,
    status: "processing",
    label: "Mustard lot · 9 quintals",
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    reference: "UTR-89451235",
  },
  {
    id: "payment-003",
    farmerId: "farmer-001",
    amount: 16000,
    status: "approved",
    label: "Chana lot · 12 quintals",
    timestamp: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
    reference: "UTR-89451236",
  },
];

export function buildSeedState(): AppState {
  const slots = demoCenters.flatMap((center) =>
    Array.from({ length: 7 }, (_, dayIndex) => [
      ...makeSlots(center.id, addDaysIso(dayIndex), false),
      ...makeSlots(center.id, addDaysIso(dayIndex), true),
    ]).flat(),
  );

  return {
    centers: demoCenters,
    slots,
    queue: makeQueueSeed(),
    payments: makePayments(),
    procurementRecords: [],
    lastUpdated: new Date().toISOString(),
  };
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

export function getSeedState(): AppState {
  return clone(buildSeedState());
}

export async function localApiRequest<T = unknown>(
  input: string | URL,
  init: RequestInit = {},
): Promise<T> {
  const url = typeof input === "string" ? input : input.toString();
  const method = (init.method ?? "GET").toUpperCase();
  const pathname = url.split("?")[0];
  const searchParams = new URLSearchParams(url.split("?")[1] ?? "");

  if (pathname === "/api/healthz") {
    return { status: "ok" } as T;
  }

  if (pathname === "/api/dashboard/farmer") {
    const farmerId = searchParams.get("farmerId") ?? "farmer-001";
    return getFarmerDashboard(farmerId) as T;
  }

  if (pathname.startsWith("/api/dashboard/official/")) {
    const centerId = pathname.replace("/api/dashboard/official/", "");
    return getOfficialDashboard(centerId) as T;
  }

  if (pathname === "/api/centers") {
    return listProcurementCenters() as T;
  }

  if (pathname.startsWith("/api/centers/") && pathname.endsWith("/slots")) {
    const centerId = pathname
      .replace("/api/centers/", "")
      .replace("/slots", "");
    const query = {
      date: searchParams.get("date") ?? undefined,
      cropCategory: searchParams.get("cropCategory") ?? undefined,
    };
    return listAvailableSlots(centerId, query) as T;
  }

  if (pathname === "/api/bookings" && method === "POST") {
    const payload = JSON.parse((init.body as string) ?? "{}") as {
      farmerId?: string;
      slotId?: string;
      quantityQuintals?: number;
      crop?: string;
      cropCategory?: string;
      date?: string;
    };
    return createBooking({
      farmerId: payload.farmerId ?? "farmer-001",
      slotId: payload.slotId ?? "",
      quantityQuintals: Number(payload.quantityQuintals ?? 0),
      crop: payload.crop,
      cropCategory: payload.cropCategory,
      date: payload.date,
    }) as T;
  }

  if (
    pathname.startsWith("/api/queue/") &&
    pathname.endsWith("/status") &&
    method === "PATCH"
  ) {
    const tokenId = pathname.replace("/api/queue/", "").replace("/status", "");
    const payload = JSON.parse((init.body as string) ?? "{}") as {
      status?: string;
    };
    const result = updateQueueTokenStatus(tokenId, {
      status: payload.status as any,
    });
    if (!result) throw new Error("Queue token not found");
    return result as T;
  }

  if (
    pathname.startsWith("/api/queue/") &&
    pathname.endsWith("/reschedule") &&
    method === "POST"
  ) {
    const tokenId = pathname
      .replace("/api/queue/", "")
      .replace("/reschedule", "");
    const payload = JSON.parse((init.body as string) ?? "{}") as {
      reason?: string;
    };
    return rescheduleToken(tokenId, payload.reason) as T;
  }

  if (pathname.startsWith("/api/queue/")) {
    const tokenId = pathname.replace("/api/queue/", "");
    const token = getQueueToken(tokenId);
    if (!token) throw new Error("Queue token not found");
    return token as T;
  }

  if (pathname.startsWith("/api/centers/") && pathname.endsWith("/queue")) {
    const centerId = pathname
      .replace("/api/centers/", "")
      .replace("/queue", "");
    return listCenterQueue(centerId) as T;
  }

  if (pathname === "/api/procurement" && method === "POST") {
    const payload = JSON.parse((init.body as string) ?? "{}") as {
      tokenId?: string;
      weightKg?: number;
      qualityGrade?: string;
      ratePerQuintal?: number;
      notes?: string;
    };
    return createProcurementRecord({
      tokenId: payload.tokenId ?? "",
      weightKg: Number(payload.weightKg ?? 0),
      qualityGrade: (payload.qualityGrade as any) ?? "A",
      ratePerQuintal: Number(payload.ratePerQuintal ?? 0),
      notes: payload.notes,
    }) as T;
  }

  if (pathname.startsWith("/api/payments/")) {
    const farmerId = pathname.replace("/api/payments/", "");
    return getFarmerPayments(farmerId) as T;
  }

  if (pathname === "/api/gate/verify" && method === "POST") {
    const payload = JSON.parse((init.body as string) ?? "{}") as {
      tokenId?: string;
      latitude?: number;
      longitude?: number;
    };
    return verifyGateAccess({
      tokenId: payload.tokenId ?? "",
      latitude: Number(payload.latitude ?? 0),
      longitude: Number(payload.longitude ?? 0),
    }) as T;
  }

  if (pathname === "/api/official/checkin" && method === "POST") {
    const payload = JSON.parse((init.body as string) ?? "{}") as {
      tokenId?: string;
    };
    const token = checkInOfficial(payload.tokenId ?? "");
    if (!token) throw new Error("Queue token not found");
    return token as T;
  }

  throw new Error(`No local mock handler for ${url}`);
}

export function loadDemoState(): AppState {
  if (typeof window === "undefined") {
    return getSeedState();
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const seed = getSeedState();
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
      return seed;
    }

    const parsed = JSON.parse(raw) as Partial<AppState>;
    if (!parsed || typeof parsed !== "object") {
      throw new Error("invalid state");
    }

    const seed = getSeedState();
    const state: AppState = {
      centers:
        Array.isArray(parsed.centers) && parsed.centers.length
          ? parsed.centers
          : seed.centers,
      slots:
        Array.isArray(parsed.slots) && parsed.slots.length
          ? parsed.slots
          : seed.slots,
      queue: Array.isArray(parsed.queue) ? parsed.queue : seed.queue,
      payments: Array.isArray(parsed.payments)
        ? parsed.payments
        : seed.payments,
      procurementRecords: Array.isArray(parsed.procurementRecords)
        ? parsed.procurementRecords
        : seed.procurementRecords,
      lastUpdated:
        typeof parsed.lastUpdated === "string"
          ? parsed.lastUpdated
          : seed.lastUpdated,
    };

    return state;
  } catch {
    const seed = getSeedState();
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
    return seed;
  }
}

export function saveDemoState(state: AppState): AppState {
  if (typeof window === "undefined") return state;
  const next = {
    ...state,
    lastUpdated: new Date().toISOString(),
  };
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}

export function resetDemoState(): AppState {
  const seed = getSeedState();
  return saveDemoState(seed);
}

export function getCenterById(centerId: string): ProcurementCenter | undefined {
  const state = loadDemoState();
  return state.centers.find((center) => center.id === centerId);
}

export function getFarmerDashboard(farmerId: string): FarmerDashboard {
  const state = loadDemoState();
  const farmer = state.queue.some(
    (token) => token.farmerName === demoFarmer.name,
  )
    ? demoFarmer
    : { ...demoFarmer, id: farmerId };
  const activeToken =
    state.queue.find(
      (token) =>
        token.farmerName === farmer.name &&
        ["booked", "checked_in", "weighing", "quality_check"].includes(
          token.status,
        ),
    ) ?? null;

  const nextSlot =
    state.slots.find(
      (slot) =>
        slot.centerId === "center-churu-01" &&
        (slot.date >= todayIso() || slot.date === todayIso()) &&
        slot.remaining > 0,
    ) ?? null;

  const totalDue = state.payments
    .filter((payment) => payment.farmerId === farmer.id)
    .reduce((sum, payment) => sum + payment.amount, 0);
  const paidAmount = state.payments
    .filter(
      (payment) => payment.farmerId === farmer.id && payment.status === "paid",
    )
    .reduce((sum, payment) => sum + payment.amount, 0);

  return {
    farmer,
    activeToken,
    nextSlot,
    paymentSummary: {
      totalDue,
      paidAmount,
      pendingAmount: Math.max(totalDue - paidAmount, 0),
    },
    recentActivity: [
      {
        id: "activity-1",
        label: "Slot booked",
        detail: "Wheat • Central Mandi • Today at 10:00 AM",
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        tone: "success",
      },
      {
        id: "activity-2",
        label: "Weighment completed",
        detail: "Lot accepted after inspection",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        tone: "info",
      },
      {
        id: "activity-3",
        label: "Payment in progress",
        detail: "Bank verification started",
        timestamp: new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString(),
        tone: "warning",
      },
    ],
  };
}

export function getOfficialDashboard(centerId: string): OfficialDashboard {
  const state = loadDemoState();
  const center =
    state.centers.find((item) => item.id === centerId) ?? state.centers[0];
  const queue = state.queue.filter((token) => token.centerName === center.name);
  const used = queue.reduce(
    (sum, token) => sum + Number(token.quantityQuintals || 0),
    0,
  );
  const total = center.todayCapacity;
  const percentage = Math.max(
    8,
    Math.min(96, Math.round((used / total) * 100)),
  );

  return {
    center,
    queue,
    capacity: {
      used,
      total,
      percentage,
    },
    todayStats: {
      farmersToday: queue.length + 6,
      activeQueue: queue.filter((token) => token.status !== "completed").length,
      farmersServed: 12,
      quintalsProcured: used,
      pendingPayments: 9,
      procurementValue: 468500,
    },
    lastUpdated: new Date().toISOString(),
  };
}

export function listProcurementCenters(): ProcurementCenter[] {
  return loadDemoState().centers;
}

export function listAvailableSlots(
  centerId: string,
  params?: { date?: string; cropCategory?: string },
): DemoSlot[] {
  const state = loadDemoState();
  const date = params?.date;
  const cropCategory = params?.cropCategory;

  return state.slots.filter((slot) => {
    if (slot.centerId !== centerId) return false;
    if (date && slot.date !== date) return false;
    if (cropCategory && slot.category !== cropCategory) return false;
    return slot.remaining > 0 || slot.status === "limited";
  });
}

export function getQueueToken(tokenId: string): QueueToken | undefined {
  return loadDemoState().queue.find((token) => token.id === tokenId);
}

export function listCenterQueue(centerId: string): QueueToken[] {
  const center = getCenterById(centerId);
  const state = loadDemoState();
  if (!center) return [];
  return state.queue.filter((token) => token.centerName === center.name);
}

export function createBooking(input: {
  farmerId: string;
  slotId: string;
  quantityQuintals: number;
  crop?: string;
  cropCategory?: string;
  date?: string;
}): {
  bookingId: string;
  farmer: Farmer;
  center: ProcurementCenter;
  slot: Slot;
  token: QueueToken;
} {
  const state = loadDemoState();
  const slot = state.slots.find((item) => item.id === input.slotId);
  if (!slot) {
    throw new Error("Slot not found");
  }
  const center =
    state.centers.find((item) => item.id === slot.centerId) ?? state.centers[0];
  const farmer = { ...demoFarmer, id: input.farmerId };
  const nextNumber = state.queue.length + 98;
  const tokenNumber = `G-${String(nextNumber).padStart(3, "0")}`;
  const token: QueueToken = {
    id: `token-${String(nextNumber).padStart(3, "0")}`,
    tokenNumber,
    farmerName: farmer.name,
    crop: input.crop ?? farmer.crop,
    quantityQuintals: input.quantityQuintals,
    centerName: center.name,
    status: "booked",
    position:
      state.queue.filter(
        (item) =>
          item.centerName === center.name && item.status !== "completed",
      ).length + 1,
    aheadCount: Math.max(
      0,
      state.queue.filter(
        (item) =>
          item.centerName === center.name && item.status !== "completed",
      ).length,
    ),
    etaMinutes: 20,
    bookedTime: new Intl.DateTimeFormat("en-GB", {
      timeZone: IST,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(new Date()),
    qrValue: `fasalflux://${tokenNumber}`,
    gate: "Gate 2",
    slotDate: input.date ?? slot.date,
    slotStart: slot.startTime,
    slotEnd: slot.endTime,
  };

  slot.remaining = Math.max(0, slot.remaining - 1);
  slot.status =
    slot.remaining === 0
      ? "full"
      : slot.remaining <= 3
        ? "limited"
        : "available";
  state.queue.push(token);
  const persisted = saveDemoState(state);

  return {
    bookingId: `booking-${Date.now()}`,
    farmer,
    center,
    slot: persisted.slots.find((item) => item.id === input.slotId) ?? slot,
    token,
  };
}

export function updateQueueTokenStatus(
  tokenId: string,
  input: QueueStatusInput,
): QueueToken | undefined {
  const state = loadDemoState();
  const target = state.queue.find((token) => token.id === tokenId);
  if (!target) return undefined;

  target.status = input.status;
  target.position = Math.max(
    1,
    state.queue.filter(
      (token) =>
        token.centerName === target.centerName && token.status !== "completed",
    ).length,
  );
  target.aheadCount = Math.max(0, target.position - 1);
  target.etaMinutes = Math.max(5, 9 * target.position);
  saveDemoState(state);
  return target;
}

export function createProcurementRecord(
  input: ProcurementInput,
): ProcurementRecord {
  const state = loadDemoState();
  const record: ProcurementRecord = {
    id: `proc-${Date.now()}`,
    tokenId: input.tokenId,
    weightKg: input.weightKg,
    qualityGrade: input.qualityGrade,
    grossAmount: (input.weightKg / 100) * input.ratePerQuintal,
    recordedAt: new Date().toISOString(),
    notes: input.notes,
  };

  state.procurementRecords.push(record);
  const queueToken = state.queue.find((item) => item.id === input.tokenId);
  if (queueToken) {
    queueToken.status = "completed";
  }

  state.payments.push({
    id: `payment-${Date.now()}`,
    farmerId: "farmer-001",
    amount: record.grossAmount,
    status: "processing",
    label: `Procurement ${record.id}`,
    timestamp: new Date().toISOString(),
    reference: `UTR-${Date.now().toString().slice(-8)}`,
  });

  saveDemoState(state);
  return record;
}

export function getFarmerPayments(farmerId: string): Payment[] {
  return loadDemoState().payments.filter(
    (payment) => payment.farmerId === farmerId,
  );
}

export function verifyGateAccess(payload: {
  tokenId: string;
  latitude: number;
  longitude: number;
}): { verified: boolean; message: string } {
  const state = loadDemoState();
  const token = state.queue.find((item) => item.id === payload.tokenId);
  if (!token) {
    return { verified: false, message: "Token not found in the mandi queue." };
  }

  const verified =
    Math.abs(payload.latitude - 28.2921) < 0.05 &&
    Math.abs(payload.longitude - 74.9618) < 0.05;
  if (verified) {
    token.status = "checked_in";
    saveDemoState(state);
    return { verified: true, message: "Gate verified — entry allowed." };
  }

  return {
    verified: false,
    message: "Farmer is outside the approved mandi geo-fence.",
  };
}

export function rescheduleToken(
  tokenId: string,
  reason?: string,
): { newSlot: DemoSlot; reason?: string } {
  const state = loadDemoState();
  const token = state.queue.find((item) => item.id === tokenId);
  if (!token) throw new Error("Token not found");

  const center =
    state.centers.find((item) => item.name === token.centerName) ??
    state.centers[0];
  const nextSlot = state.slots.find(
    (slot) =>
      slot.centerId === center.id &&
      slot.date >= todayIso() &&
      slot.remaining > 0 &&
      slot.category ===
        (token.crop === "Tomato" ||
        token.crop === "Onion" ||
        token.crop === "Potato"
          ? "perishable"
          : "grain"),
  );

  if (!nextSlot) {
    throw new Error("No alternate slot available");
  }

  token.slotDate = nextSlot.date;
  token.slotStart = nextSlot.startTime;
  token.slotEnd = nextSlot.endTime;
  token.status = "booked";
  saveDemoState(state);

  return {
    newSlot: nextSlot,
    reason,
  };
}

export function checkInOfficial(tokenId: string): QueueToken | undefined {
  const state = loadDemoState();
  const token = state.queue.find((item) => item.id === tokenId);
  if (!token) return undefined;
  token.status = "checked_in";
  saveDemoState(state);
  return token;
}
