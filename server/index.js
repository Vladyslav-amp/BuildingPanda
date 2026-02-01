import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import nodemailer from "nodemailer";
import { z } from "zod";

dotenv.config();

const app = express();
app.use(helmet());
app.use(express.json({ limit: "100kb" }));
app.set("trust proxy", 1);

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    methods: ["POST"],
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
    const text =
      `New request:

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
    res.status(500).json({ ok: false });
  }
});

app.listen(port, "127.0.0.1", () => {
  console.log(`API running on http://127.0.0.1:${port}`);
});

