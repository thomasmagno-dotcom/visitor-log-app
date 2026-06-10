import { Resend } from "resend";

const FROM_ADDRESS = "Van Giessen Growers Inc. <visitors@vangiessen.ca>";

type VisitorInfo = {
  name: string;
  company: string;
  purpose: string;
  signedInAt: string;
};

type HostInfo = {
  name: string;
  email: string;
};

export async function sendVisitorNotification(host: HostInfo, visitor: VisitorInfo) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("[email] RESEND_API_KEY not set — skipping notification.");
    return;
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  const time = new Date(visitor.signedInAt).toLocaleTimeString("en-CA", {
    hour: "2-digit", minute: "2-digit", hour12: true,
  });
  const date = new Date(visitor.signedInAt).toLocaleDateString("en-CA", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  const { error } = await resend.emails.send({
    from: FROM_ADDRESS,
    to: host.email,
    subject: `Visitor Arrival: ${visitor.name} is here to see you`,
    text: [
      `Hello ${host.name},`,
      "",
      `${visitor.name} from ${visitor.company} has signed in and is waiting to see you.`,
      "",
      `Purpose of visit: ${visitor.purpose}`,
      `Arrived: ${time} on ${date}`,
      "",
      "Please proceed to reception to greet your visitor.",
      "",
      "— Van Giessen Growers Inc. Visitor System",
    ].join("\n"),
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:Arial,sans-serif;background:#f9fafb;margin:0;padding:32px 16px;">
  <div style="max-width:480px;margin:0 auto;background:#fff;border-radius:12px;
              border:1px solid #e5e7eb;overflow:hidden;">
    <div style="background:#15803d;padding:20px 28px;">
      <p style="margin:0;color:#fff;font-size:13px;font-weight:600;
                letter-spacing:.05em;text-transform:uppercase;">
        Van Giessen Growers Inc.
      </p>
      <h1 style="margin:4px 0 0;color:#fff;font-size:20px;font-weight:700;">
        Visitor Arrival
      </h1>
    </div>
    <div style="padding:28px;">
      <p style="margin:0 0 16px;color:#374151;font-size:15px;">
        Hello <strong>${host.name}</strong>,
      </p>
      <p style="margin:0 0 20px;color:#374151;font-size:15px;">
        Your visitor has arrived and is waiting in reception.
      </p>
      <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
        <tr>
          <td style="padding:10px 14px;background:#f3f4f6;border-radius:6px 6px 0 0;
                     font-size:11px;font-weight:700;color:#6b7280;
                     text-transform:uppercase;letter-spacing:.05em;">Visitor</td>
          <td style="padding:10px 14px;background:#f3f4f6;border-radius:6px 6px 0 0;
                     font-size:15px;font-weight:600;color:#111827;">${visitor.name}</td>
        </tr>
        <tr>
          <td style="padding:10px 14px;border-bottom:1px solid #f3f4f6;
                     font-size:11px;font-weight:700;color:#6b7280;
                     text-transform:uppercase;letter-spacing:.05em;">Company</td>
          <td style="padding:10px 14px;border-bottom:1px solid #f3f4f6;
                     font-size:14px;color:#374151;">${visitor.company}</td>
        </tr>
        <tr>
          <td style="padding:10px 14px;border-bottom:1px solid #f3f4f6;
                     font-size:11px;font-weight:700;color:#6b7280;
                     text-transform:uppercase;letter-spacing:.05em;">Purpose</td>
          <td style="padding:10px 14px;border-bottom:1px solid #f3f4f6;
                     font-size:14px;color:#374151;">${visitor.purpose}</td>
        </tr>
        <tr>
          <td style="padding:10px 14px;font-size:11px;font-weight:700;color:#6b7280;
                     text-transform:uppercase;letter-spacing:.05em;">Arrived</td>
          <td style="padding:10px 14px;font-size:14px;color:#374151;">
            ${time} &nbsp;·&nbsp; ${date}
          </td>
        </tr>
      </table>
      <p style="margin:0;color:#6b7280;font-size:13px;
                border-top:1px solid #f3f4f6;padding-top:16px;">
        Please proceed to reception to greet your visitor.
      </p>
    </div>
  </div>
</body>
</html>`,
  });

  if (error) {
    throw new Error(`Resend error: ${error.message}`);
  }
}
