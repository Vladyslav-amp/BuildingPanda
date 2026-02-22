import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import nodemailer from "nodemailer";
import { z } from "zod";

dotenv.config();

const app = express();
app.set("trust proxy", 1);

app.use(helmet());
app.use(express.json({ limit: "100kb" }));

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    methods: ["POST", "GET"],
  })
);

/**
 * Globalny limiter (dla całego API) — łagodny
 */
app.use(
  rateLimit({
    windowMs: 60 * 1000,
    max: 30,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

/**
 * Osobny limiter dla czatu (mocniejszy anty-spam)
 */
const chatLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
});

function makeTransport() {
  // Zostawiamy Gmail jak masz (GMAIL_APP_PASSWORD)
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  // Jeśli chcesz wersję SMTP (bardziej enterprise), daj znać — podeślę gotowy config pod SMTP_HOST/PORT/USER/PASS.
}

/* -------------------- Schematy -------------------- */

const HoneypotSchema = z.object({
  website: z.string().max(0).optional().or(z.literal("")),
});

const ContactSchema = z
  .object({
    fullName: z.string().min(2).max(100),
    email: z.string().email().max(200),
    phone: z.string().min(7).max(30),
    service: z.string().max(100).optional(),
    city: z.string().min(2).max(120),
    timeframe: z.string().max(60).optional(),
    message: z.string().min(5).max(4000),

    consentContact: z.boolean().refine((v) => v === true),
    consentPersonalData: z.boolean().refine((v) => v === true),

    website: z.string().max(0).optional().or(z.literal("")),
  })
  .merge(HoneypotSchema);

const EstimateSchema = z
  .object({
    objectType: z.string().max(40),
    workType: z.string().max(60),

    voivodeship: z.string().max(60),
    city: z.string().max(80),

    area: z.number().min(10).max(4000),
    rooms: z.number().min(1).max(50),
    bathrooms: z.number().min(1).max(20),

    apartmentFloor: z.number().min(0).max(120).optional(),
    hasElevator: z.boolean().optional(),

    floors: z.number().min(1).max(10).optional(),

    condition: z.string().max(40),
    complexity: z.string().max(40),
    ceiling: z.string().max(20),

    urgency: z.string().max(20),
    materials: z.string().max(20),
    standard: z.string().max(20),

    budgetCapOn: z.boolean(),
    budgetCap: z.number().min(0).max(800000),

    options: z.record(z.boolean()).optional(),

    totalLow: z.number().min(0).max(10000000),
    totalHigh: z.number().min(0).max(10000000),
    timeWeeksLow: z.number().min(0).max(200),
    timeWeeksHigh: z.number().min(0).max(200),

    fullName: z.string().min(2).max(100),
    email: z.string().email().max(200),
    phone: z.string().min(7).max(30),

    consentContact: z.boolean().refine((v) => v === true),
    consentPersonalData: z.boolean().refine((v) => v === true),

    website: z.string().max(0).optional().or(z.literal("")),
  })
  .merge(HoneypotSchema);

/**
 * ✅ NOWY: lead z czatu (asystent)
 * email opcjonalny, reszta wymagana
 */
const ChatLeadSchema = z
  .object({
    fullName: z.string().min(2).max(100),
    phone: z.string().min(7).max(30),
    email: z.string().email().max(200).optional().or(z.literal("")),
    city: z.string().min(2).max(120),
    topic: z.string().min(3).max(200),
    details: z.string().min(5).max(4000),

    source: z.string().max(60).default("chat_assistant"),
    lastServiceId: z.string().max(80).optional(),

    consentContact: z.boolean().refine((v) => v === true),
    consentPersonalData: z.boolean().refine((v) => v === true),

    website: z.string().max(0).optional().or(z.literal("")),
    // (opcjonalnie) transcript rozmowy:
    transcript: z.array(z.string().max(800)).max(30).optional(),
    pageUrl: z.string().max(500).optional(),
    userAgent: z.string().max(500).optional(),
  })
  .merge(HoneypotSchema);

/* -------------------- Routes -------------------- */

app.get("/api/health", (req, res) => res.json({ ok: true }));

app.post("/api/contact", async (req, res) => {
  const parsed = ContactSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ ok: false });

  // honeypot
  if (parsed.data.website && parsed.data.website.length > 0) {
    return res.json({ ok: true });
  }

  try {
    const d = parsed.data;
    const t = makeTransport();

    const subject = `Contact form: ${d.fullName} (${d.city})`;
    const text = `New request:

Name: ${d.fullName}
Email: ${d.email}
Phone: ${d.phone}

Service: ${d.service ?? "-"}
City: ${d.city}
Timeframe: ${d.timeframe ?? "-"}

Message:
${d.message}

Consents:
- Contact: ${d.consentContact ? "YES" : "NO"}
- Personal data: ${d.consentPersonalData ? "YES" : "NO"}
`;

    await t.sendMail({
      from: `"${process.env.MAIL_FROM_NAME || "Website"}" <${process.env.GMAIL_USER}>`,
      to: process.env.MAIL_TO,
      replyTo: d.email,
      subject,
      text,
    });

    res.json({ ok: true });
  } catch (e) {
    console.error("CONTACT_MAIL_ERROR:", e);
    res.status(500).json({ ok: false });
  }
});

app.post("/api/estimate", async (req, res) => {
  const parsed = EstimateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ ok: false });

  // honeypot
  if (parsed.data.website && parsed.data.website.length > 0) {
    return res.json({ ok: true });
  }

  try {
    const d = parsed.data;
    const t = makeTransport();

    const optionsText = d.options
      ? Object.entries(d.options)
        .filter(([, v]) => v)
        .map(([k]) => `- ${k}`)
        .join("\n")
      : "-";

    const subject = `Estimate: ${d.fullName} (${d.city}) ${Math.round(d.totalLow)}–${Math.round(
      d.totalHigh
    )} PLN`;

    const text = `CALCULATOR ESTIMATE

Client:
Name: ${d.fullName}
Email: ${d.email}
Phone: ${d.phone}

Location:
${d.city}, ${d.voivodeship}

Scope:
Object: ${d.objectType}
Work: ${d.workType}
Area: ${d.area} m²
Rooms: ${d.rooms}
Bathrooms: ${d.bathrooms}
${d.objectType === "Mieszkanie"
        ? `Floor: ${d.apartmentFloor ?? "-"} | Elevator: ${d.hasElevator ? "YES" : "NO"}`
        : `Floors (house): ${d.floors ?? "-"}`
      }

Parameters:
Condition: ${d.condition}
Complexity: ${d.complexity}
Ceiling: ${d.ceiling}
Urgency: ${d.urgency}
Materials: ${d.materials}
Standard: ${d.standard}

Budget:
Budget cap enabled: ${d.budgetCapOn ? "YES" : "NO"}
Budget cap: ${d.budgetCap} PLN

Selected options:
${optionsText}

RESULT:
Cost range: ${Math.round(d.totalLow)} – ${Math.round(d.totalHigh)} PLN
Time: ${d.timeWeeksLow} – ${d.timeWeeksHigh} weeks

Consents:
- Contact: ${d.consentContact ? "YES" : "NO"}
- Personal data: ${d.consentPersonalData ? "YES" : "NO"}
`;

    await t.sendMail({
      from: `"${process.env.MAIL_FROM_NAME || "Website"}" <${process.env.GMAIL_USER}>`,
      to: process.env.MAIL_TO,
      replyTo: d.email,
      subject,
      text,
    });

    res.json({ ok: true });
  } catch (e) {
    console.error("ESTIMATE_MAIL_ERROR:", e);
    res.status(500).json({ ok: false });
  }
});


app.post("/api/chat-lead", chatLimiter, async (req, res) => {
  const parsed = ChatLeadSchema.safeParse(req.body);
  if (!parsed.success) {
    const err = parsed.error.flatten();
    console.log("CHAT_LEAD_ZOD_ERROR:", JSON.stringify(err, null, 2));
    return res.status(400).json({ ok: false, error: err });
  }
  
  if (parsed.data.website && parsed.data.website.length > 0) {
    return res.json({ ok: true });
  }

  try {
    const d = parsed.data;
    const t = makeTransport();

    const subject = `CHAT LEAD: ${d.fullName} (${d.city}) — ${d.topic}`;

    const transcriptText =
      d.transcript && d.transcript.length
        ? `\n\nTranscript (last messages):\n${d.transcript.map((x) => `- ${x}`).join("\n")}\n`
        : "";

    const text = `NEW CHAT LEAD

Client:
Name: ${d.fullName}
Phone: ${d.phone}
Email: ${d.email || "-"}

Location:
City: ${d.city}

Request:
Topic: ${d.topic}
Service ID: ${d.lastServiceId ?? "-"}
Details:
${d.details}

Meta:
Source: ${d.source}
Page URL: ${d.pageUrl || "-"}
User-Agent: ${d.userAgent || "-"}
${transcriptText}

Consents:
- Contact: YES
- Personal data: YES
`;

    await t.sendMail({
      from: `"${process.env.MAIL_FROM_NAME || "Website Chat"}" <${process.env.GMAIL_USER}>`,
      to: process.env.MAIL_TO,
      replyTo: d.email || undefined,
      subject,
      text,
    });

    res.json({ ok: true });
  } catch (e) {
    console.error("CHAT_MAIL_ERROR:", e);
    res.status(500).json({ ok: false });
  }
});

const port = Number(process.env.PORT || 4000);
app.listen(port, "127.0.0.1", () => {
  console.log(`API running on http://127.0.0.1:${port}`);
});