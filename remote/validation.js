const DESKS = new Set(["Consumer apps", "DeFi", "Protocols"]);
const ROLES = new Set(["scout", "partnership", "analyst"]);

export function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function text(body, field, limit, errors, optional = false, multiline = false) {
  const raw = body[field];
  if (raw === undefined && optional) return "";
  if (typeof raw !== "string") {
    errors.push(`${field} must be text`);
    return "";
  }
  const value = raw.trim();
  if (!value && !optional) errors.push(`${field} is required`);
  if (value.length > limit) errors.push(`${field} is too long`);
  const controls = multiline ? /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/ : /[\u0000-\u001f\u007f]/;
  if (controls.test(raw)) errors.push(`${field} contains invalid characters`);
  return value;
}

export function validateApplication(body) {
  const errors = [];
  if (!isRecord(body)) return { app: null, errors: ["Application must be a JSON object."] };
  const app = {};
  for (const [field, limit] of Object.entries({ full_name: 120, x_handle: 16, telegram: 32, email: 254, country: 80, links: 4000, context: 2000, why: 4000 })) {
    app[field] = text(body, field, limit, errors, field === "context", ["links", "context", "why"].includes(field));
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(app.email)) errors.push("email is not valid");
  if (!/^@?[A-Za-z0-9_]{1,15}$/.test(app.x_handle)) errors.push("x_handle is not valid");
  if (app.why.length < 40) errors.push("why needs at least 40 characters");
  if (!ROLES.has(body.role)) errors.push("role must be scout, partnership or analyst");
  app.role = body.role;
  if (!Array.isArray(body.desks) || body.desks.length === 0 || body.desks.length > DESKS.size || body.desks.some(desk => !DESKS.has(desk))) {
    errors.push("Choose valid research desks.");
    app.desks = [];
  } else app.desks = [...new Set(body.desks)];
  if (body.company !== undefined && body.company !== "") errors.push("spam");
  return { app, errors };
}

export function validateEnquiry(body) {
  const errors = [];
  if (!isRecord(body)) return { enquiry: null, errors: ["Enquiry must be a JSON object."] };
  const enquiry = {
    name: text(body, "name", 200, errors),
    email: text(body, "email", 254, errors),
    company: text(body, "company", 200, errors, true),
    question: text(body, "question", 5000, errors, false, true),
  };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(enquiry.email)) errors.push("email is not valid");
  return { enquiry, errors };
}

export function validId(value) {
  return typeof value === "number" && Number.isSafeInteger(value) && value > 0 && value <= 2147483647;
}
