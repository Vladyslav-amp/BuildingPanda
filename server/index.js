import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import nodemailer from "nodemailer";
import { z } from "zod";

dotenv.config();

const app = express();
app.set("trust proxy", 1); // важливо для rate-limit за Nginx

app.use(helmet());
app.use(express.json({ limit: "100kb" }));

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    methods: ["POST", "GET"],
  })
);

app.use(
  rateLimit({
    windowMs: 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

const ContactSchema = z.object({
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
});

const EstimateSchema = z.object({
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
});

function makeTransport() {
  return nodemailer.createTransport({
    service: "gmail",
    auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD },
  });
}

app.get("/api/health", (req, res) => res.json({ ok: true }));

app.post("/api/contact", async (req, res) => {
  const parsed = ContactSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ ok: false });

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

    const subject = `Estimate: ${d.fullName} (${d.city}) ${Math.round(d.totalLow)}–${Math.round(d.totalHigh)} PLN`;

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
${
  d.objectType === "Mieszkanie"
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

const port = Number(process.env.PORT || 4000);
app.listen(port, "127.0.0.1", () => {
  console.log(`API running on http://127.0.0.1:${port}`);
});
