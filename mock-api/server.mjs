import http from "node:http";
import { URL } from "node:url";
const PORT = Number(process.env.PORT || process.env.MOCK_API_PORT || 5000);
const IST = "Asia/Kolkata";
const iso = (d = new Date()) =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: IST,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
const addDays = (days) => {
  const d = new Date(`${iso()}T00:00:00+05:30`);
  d.setDate(d.getDate() + days);
  return iso(d);
};
const nowMinutes = () => {
  const p = new Intl.DateTimeFormat("en-GB", {
    timeZone: IST,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date());
  return (
    Number(p.find((x) => x.type === "hour").value) * 60 +
    Number(p.find((x) => x.type === "minute").value)
  );
};
const demoSlotDate = () => (nowMinutes() < 630 ? iso() : addDays(1));
const farmer = {
  id: "farmer-001",
  name: "Ramesh Kumar",
  phone: "+91 98765 43210",
  village: "Bhaleri, Churu",
  crop: "Wheat",
  preferredLanguage: "hi",
};
const centers = [
  {
    id: "center-churu-01",
    name: "Central Mandi",
    district: "Churu",
    state: "Rajasthan",
    distanceKm: 6.4,
    todayCapacity: 120,
    todayBooked: 86,
    status: "open",
    latitude: 28.2921,
    longitude: 74.9618,
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
    latitude: 28.3008,
    longitude: 74.9524,
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
    latitude: 28.2804,
    longitude: 74.9706,
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
    latitude: 28.3072,
    longitude: 74.9821,
  },
];
const gate = "Gate 2";
const makeSlots = (centerId, date, perishable = false) => {
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
  return times.map(([start, end], i) => {
    let rem = [5, 2, 0, 12, 12, 7, 4, 8][i] ?? 6;
    const cap = 12;
    const [h, m] = start.split(":").map(Number);
    const startMin = h * 60 + m;
    const past = date === iso() && startMin <= nowMinutes();
    if (past) rem = 0;
    return {
      id: `${centerId}-${date}-${perishable ? "p" : "g"}-${start.replace(":", "")}`,
      centerId,
      date,
      startTime: start,
      endTime: end,
      remaining: rem,
      capacity: cap,
      status: rem === 0 ? "full" : rem <= 3 ? "limited" : "available",
      waitMinutes: Math.max(20, 35 + i * 5),
      category: perishable ? "perishable" : "grain",
      recommended: !past && rem >= 10 && (perishable ? i === 1 : i === 4),
      gate,
    };
  });
};
let slots = centers
  .flatMap((c) =>
    Array.from({ length: 7 }, (_, d) => [
      makeSlots(c.id, addDays(d), false),
      makeSlots(c.id, addDays(d), true),
    ]),
  )
  .flat(2);
const queue = [
  {
    id: "token-098",
    tokenNumber: "G-098",
    farmerName: "Arjun Meena",
    crop: "Wheat",
    quantityQuintals: 14,
    centerName: centers[0].name,
    status: "booked",
    position: 1,
    aheadCount: 0,
    etaMinutes: 7,
    bookedTime: "08:05",
    qrValue: "fasalflux://G-098",
    gate,
    slotDate: iso(),
    slotStart: "10:00",
    slotEnd: "10:30",
    slotId: "",
  },
  {
    id: "token-099",
    tokenNumber: "G-099",
    farmerName: "Sita Devi",
    crop: "Mustard",
    quantityQuintals: 12,
    centerName: centers[0].name,
    status: "booked",
    position: 2,
    aheadCount: 1,
    etaMinutes: 14,
    bookedTime: "08:12",
    qrValue: "fasalflux://G-099",
    gate,
    slotDate: iso(),
    slotStart: "10:00",
    slotEnd: "10:30",
    slotId: "",
  },
  {
    id: "token-100",
    tokenNumber: "G-100",
    farmerName: "Mohan Lal",
    crop: "Rice",
    quantityQuintals: 18,
    centerName: centers[0].name,
    status: "checked_in",
    position: 3,
    aheadCount: 2,
    etaMinutes: 21,
    bookedTime: "08:20",
    qrValue: "fasalflux://G-100",
    gate,
    slotDate: iso(),
    slotStart: "10:00",
    slotEnd: "10:30",
    slotId: "",
  },
  {
    id: "token-101",
    tokenNumber: "G-101",
    farmerName: "Kamal Singh",
    crop: "Wheat",
    quantityQuintals: 16,
    centerName: centers[0].name,
    status: "checked_in",
    position: 4,
    aheadCount: 3,
    etaMinutes: 28,
    bookedTime: "08:32",
    qrValue: "fasalflux://G-101",
    gate,
    slotDate: iso(),
    slotStart: "10:00",
    slotEnd: "10:30",
    slotId: "",
  },
  {
    id: "token-102",
    tokenNumber: "G-102",
    farmerName: "Neeraj Kumar",
    crop: "Chana",
    quantityQuintals: 10,
    centerName: centers[0].name,
    status: "weighing",
    position: 5,
    aheadCount: 4,
    etaMinutes: 35,
    bookedTime: "08:40",
    qrValue: "fasalflux://G-102",
    gate,
    slotDate: iso(),
    slotStart: "10:00",
    slotEnd: "10:30",
    slotId: "",
  },
  {
    id: "token-103",
    tokenNumber: "G-103",
    farmerName: "Ravi Singh",
    crop: "Wheat",
    quantityQuintals: 15,
    centerName: centers[0].name,
    status: "booked",
    position: 6,
    aheadCount: 5,
    etaMinutes: 42,
    bookedTime: "08:48",
    qrValue: "fasalflux://G-103",
    gate,
    slotDate: iso(),
    slotStart: "10:00",
    slotEnd: "10:30",
    slotId: "",
  },
  {
    id: "token-104",
    tokenNumber: "G-104",
    farmerName: farmer.name,
    crop: "Wheat",
    quantityQuintals: 18,
    centerName: centers[0].name,
    status: "booked",
    position: 7,
    aheadCount: 6,
    etaMinutes: 42,
    bookedTime: "09:05",
    qrValue: "fasalflux://G-104",
    gate,
    slotDate: demoSlotDate(),
    slotStart: "10:30",
    slotEnd: "11:00",
    slotId: `${centers[0].id}-${demoSlotDate()}-g-1030`,
  },
];
const payments = [
  {
    id: "payment-001",
    farmerId: farmer.id,
    amount: 42840,
    status: "paid",
    label: "Wheat procurement · 24 quintals",
    timestamp: `${addDays(-8)}T07:45:00+05:30`,
    reference: "DBT-RAJ-88412",
  },
  {
    id: "payment-002",
    farmerId: farmer.id,
    amount: 31200,
    status: "processing",
    label: "Wheat procurement · 18 quintals",
    timestamp: `${addDays(-1)}T16:20:00+05:30`,
    reference: "DBT-RAJ-88376",
  },
  {
    id: "payment-003",
    farmerId: farmer.id,
    amount: 17600,
    status: "approved",
    label: "Mustard procurement · 10 quintals",
    timestamp: `${addDays(-3)}T12:15:00+05:30`,
    reference: "DBT-RAJ-88102",
  },
];
const activity = [
  {
    id: "activity-1",
    label: "Slot confirmed",
    detail: "Today, 10:30–11:00 at Central Mandi",
    timestamp: new Date().toISOString(),
    tone: "success",
  },
  {
    id: "activity-2",
    label: "Queue tracking active",
    detail: "6 tokens are ahead of your token",
    timestamp: new Date(Date.now() - 6 * 60000).toISOString(),
    tone: "info",
  },
  {
    id: "activity-3",
    label: "Payment processing",
    detail: "DBT-RAJ-88376 is being transferred to your account",
    timestamp: new Date(Date.now() - 24 * 3600000).toISOString(),
    tone: "warning",
  },
];
const statuses = new Set([
    "booked",
    "checked_in",
    "weighing",
    "quality_check",
    "completed",
    "cancelled",
  ]),
  grades = new Set(["A", "B", "C", "rejected"]);
const token = (id) => queue.find((x) => x.id === id);
function normalize() {
  let active = queue.filter(
    (t) => !["completed", "cancelled"].includes(t.status),
  );
  active.forEach((t, i) => {
    t.position = i + 1;
    t.aheadCount = i;
    t.etaMinutes = i === 0 ? 8 : i * 7;
  });
}
function send(res, status, data) {
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET,POST,PATCH,OPTIONS",
    "access-control-allow-headers": "Content-Type",
  });
  res.end(JSON.stringify(data));
}
function bad(res, s, e) {
  send(res, s, { error: e });
}
function body(req) {
  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", (c) => (raw += c));
    req.on("end", () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        reject(new Error("Invalid JSON"));
      }
    });
  });
}
function bookable(slot) {
  if (slot.status === "full") return false;
  const today = iso();
  if (slot.date < today) return false;
  if (slot.date > addDays(6)) return false;
  if (slot.date !== today) return true;
  const [h, m] = slot.startTime.split(":").map(Number);
  return h * 60 + m > nowMinutes() + 1;
}
const server = http.createServer(async (req, res) => {
  if (req.method === "OPTIONS") return send(res, 204, {});
  const u = new URL(
      req.url || "/",
      `http://${req.headers.host || "localhost"}`,
    ),
    p = u.pathname;
  try {
    if (req.method === "GET" && p === "/api/healthz")
      return send(res, 200, { status: "ok" });
    if (req.method === "GET" && p === "/api/dashboard/farmer") {
      if ((u.searchParams.get("farmerId") || farmer.id) !== farmer.id)
        return bad(res, 404, "Farmer not found");
      const activeToken =
        queue.find(
          (t) =>
            t.farmerName === farmer.name &&
            !["completed", "cancelled"].includes(t.status),
        ) || null;
      const nextSlot = activeToken
        ? {
            id: `${activeToken.id}-slot`,
            centerId: centers[0].id,
            date: activeToken.slotDate,
            startTime: activeToken.slotStart,
            endTime: activeToken.slotEnd,
            remaining: 12,
            capacity: 12,
            status: "available",
            gate,
          }
        : slots.find((s) => bookable(s) && s.status !== "full") || null;
      return send(res, 200, {
        farmer,
        activeToken,
        nextSlot,
        paymentSummary: {
          totalDue: payments.reduce((a, x) => a + x.amount, 0),
          paidAmount: payments
            .filter((x) => x.status === "paid")
            .reduce((a, x) => a + x.amount, 0),
          pendingAmount: payments
            .filter((x) => x.status !== "paid")
            .reduce((a, x) => a + x.amount, 0),
        },
        recentActivity: activity,
      });
    }
    let m = p.match(/^\/api\/dashboard\/official\/([^/]+)$/);
    if (req.method === "GET" && m) {
      const c = centers.find((x) => x.id === m[1]);
      if (!c) return bad(res, 404, "Procurement center not found");
      return send(res, 200, {
        center: c,
        queue,
        capacity: {
          used: c.todayBooked,
          total: c.todayCapacity,
          percentage: Math.round((c.todayBooked / c.todayCapacity) * 100),
        },
        todayStats: {
          farmersToday: 124,
          activeQueue: 38,
          farmersServed: 67,
          quintalsProcured: 486,
          pendingPayments: 138400,
          procurementValue: 1840000,
        },
        lastUpdated: new Date().toISOString(),
      });
    }
    if (req.method === "GET" && p === "/api/centers")
      return send(res, 200, centers);
    m = p.match(/^\/api\/centers\/([^/]+)\/slots$/);
    if (req.method === "GET" && m) {
      if (!centers.find((c) => c.id === m[1]))
        return bad(res, 404, "Procurement center not found");
      const d = u.searchParams.get("date") || iso();
      const cat = u.searchParams.get("cropCategory") || "grain";
      return send(
        res,
        200,
        slots.filter(
          (s) => s.centerId === m[1] && s.date === d && s.category === cat,
        ),
      );
    }
    if (req.method === "POST" && p === "/api/bookings") {
      const b = await body(req),
        q = Number(b.quantityQuintals);
      if (
        b.farmerId !== farmer.id ||
        !b.slotId ||
        !Number.isFinite(q) ||
        q < 0.1
      )
        return bad(res, 400, "Invalid booking details");
      const s = slots.find((x) => x.id === b.slotId);
      if (!s || !bookable(s))
        return bad(res, 409, "This slot is no longer bookable");
      const c = centers.find((x) => x.id === s.centerId);
      s.remaining--;
      s.status =
        s.remaining === 0 ? "full" : s.remaining <= 3 ? "limited" : "available";
      const active = queue.filter(
          (t) => !["completed", "cancelled"].includes(t.status),
        ).length,
        n = 105 + queue.length;
      const crop = b.crop || "Wheat";
      const t = {
        id: `token-${n}`,
        tokenNumber: `G-${n}`,
        farmerName: farmer.name,
        crop,
        quantityQuintals: q,
        centerName: c.name,
        status: "booked",
        position: active + 1,
        aheadCount: active,
        etaMinutes: active * 7 + 8,
        bookedTime: new Date().toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }),
        qrValue: `fasalflux://G-${n}`,
        gate: s.gate || gate,
        slotDate: s.date,
        slotStart: s.startTime,
        slotEnd: s.endTime,
        slotId: s.id,
        cropCategory: b.cropCategory || "grain",
      };
      queue.push(t);
      if (s.date === iso()) c.todayBooked++;
      normalize();
      return send(res, 201, {
        bookingId: `booking-${Date.now()}`,
        farmer,
        center: c,
        slot: s,
        token: t,
      });
    }
    m = p.match(/^\/api\/queue\/([^/]+)$/);
    if (req.method === "GET" && m) {
      const t = token(m[1]);
      return t ? send(res, 200, t) : bad(res, 404, "Queue token not found");
    }
    m = p.match(/^\/api\/queue\/([^/]+)\/status$/);
    if (req.method === "PATCH" && m) {
      const b = await body(req),
        t = token(m[1]);
      if (!t || !statuses.has(b.status))
        return bad(res, 400, "Invalid token status update");
      t.status = b.status;
      normalize();
      return send(res, 200, t);
    }
    m = p.match(/^\/api\/queue\/([^/]+)\/reschedule$/);
    if (req.method === "POST" && m) {
      const t = token(m[1]);
      if (!t) return bad(res, 404, "Queue token not found");
      const payload = await body(req);
      const oldSlot = slots.find((s) => s.id === t.slotId);
      if (oldSlot) {
        oldSlot.remaining = Math.min(oldSlot.capacity, oldSlot.remaining + 1);
        oldSlot.status =
          oldSlot.remaining === 0
            ? "full"
            : oldSlot.remaining <= 3
              ? "limited"
              : "available";
      }
      const newDate = addDays(1);
      const newSlot =
        slots.find(
          (s) =>
            s.date === newDate &&
            s.startTime === "14:30" &&
            s.status !== "full",
        ) || slots.find((s) => s.date === newDate && s.status !== "full");
      if (!newSlot) return bad(res, 409, "No alternative slot available");
      newSlot.remaining--;
      newSlot.status =
        newSlot.remaining === 0
          ? "full"
          : newSlot.remaining <= 3
            ? "limited"
            : "available";
      t.slotDate = newSlot.date;
      t.slotStart = newSlot.startTime;
      t.slotEnd = newSlot.endTime;
      t.slotId = newSlot.id;
      t.gate = newSlot.gate || gate;
      t.status = "booked";
      normalize();
      return send(res, 200, {
        message: "Slot rescheduled",
        reason: payload.reason || "Other",
        newSlot,
        token: t,
      });
    }
    if (req.method === "POST" && p === "/api/official/checkin") {
      const b = await body(req),
        t = token(b.tokenId);
      if (!t) return bad(res, 404, "Queue token not found");
      if (["completed", "cancelled"].includes(t.status))
        return bad(res, 409, "Token cannot be checked in");
      t.status = "checked_in";
      normalize();
      return send(res, 200, t);
    }
    m = p.match(/^\/api\/centers\/([^/]+)\/queue$/);
    if (req.method === "GET" && m) {
      const c = centers.find((x) => x.id === m[1]);
      if (!c) return bad(res, 404, "Procurement center not found");
      normalize();
      return send(
        res,
        200,
        queue.filter((t) => t.centerName === c.name),
      );
    }
    if (req.method === "POST" && p === "/api/procurement") {
      const b = await body(req),
        w = Number(b.weightKg),
        r = Number(b.ratePerQuintal),
        t = token(b.tokenId);
      if (
        !t ||
        !Number.isFinite(w) ||
        w < 0.1 ||
        !Number.isFinite(r) ||
        r < 0 ||
        !grades.has(b.qualityGrade)
      )
        return bad(res, 400, "Invalid procurement record");
      t.status = "completed";
      normalize();
      return send(res, 201, {
        id: `procurement-${Date.now()}`,
        tokenId: t.id,
        weightKg: w,
        qualityGrade: b.qualityGrade,
        grossAmount: (w / 100) * r,
        recordedAt: new Date().toLocaleString("en-IN"),
        notes: b.notes || "",
      });
    }
    if (req.method === "POST" && p === "/api/gate/verify") {
      const b = await body(req),
        t = token(b.tokenId);
      if (!t) return bad(res, 404, "Queue token not found");
      const c = centers.find((x) => x.name === t.centerName);
      const lat = Number(b.latitude),
        lon = Number(b.longitude);
      if (!c || !Number.isFinite(lat) || !Number.isFinite(lon))
        return bad(res, 400, "Location required");
      if (["completed", "cancelled"].includes(t.status))
        return bad(res, 409, "This booking is no longer valid for gate entry");
      const toRad = (x) => (x * Math.PI) / 180;
      const R = 6371,
        dLat = toRad(lat - c.latitude),
        dLon = toRad(lon - c.longitude),
        a =
          Math.sin(dLat / 2) ** 2 +
          Math.cos(toRad(c.latitude)) *
            Math.cos(toRad(lat)) *
            Math.sin(dLon / 2) ** 2,
        distance = 2 * R * Math.asin(Math.sqrt(a));
      const verified = distance <= 2;
      if (verified && t.status === "booked") t.status = "checked_in";
      return send(res, 200, {
        verified,
        distanceKm: Number(distance.toFixed(2)),
        gate: t.gate,
        status: t.status,
        message: verified
          ? `Within 2 km of ${c.name}. Gate entry verified.`
          : `You are ${distance.toFixed(1)} km away. Move within 2 km of ${c.name} before gate entry.`,
      });
    }
    m = p.match(/^\/api\/payments\/([^/]+)$/);
    if (req.method === "GET" && m)
      return m[1] === farmer.id
        ? send(res, 200, payments)
        : bad(res, 404, "Farmer not found");
    return bad(res, 404, "API route not found");
  } catch (e) {
    console.error(e);
    return bad(res, 500, "Mock API error");
  }
});
server.listen(PORT, () =>
  console.log(`FasalFlux mock API running on http://localhost:${PORT}`),
);
