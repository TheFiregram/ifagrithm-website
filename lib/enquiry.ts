export const ENQUIRY_EMAIL = "Ifagrithm@gmail.com";
export const ENQUIRY_SUBJECT = "IFAGRITHM demo enquiry";

export type Enquiry = {
  name: string;
  email: string;
  company: string;
  question: string;
};

export function enquiryMessage(enquiry: Enquiry): string {
  return [
    `Name: ${enquiry.name.trim()}`,
    `Email: ${enquiry.email.trim()}`,
    `Company: ${enquiry.company.trim() || "Not provided"}`,
    "",
    "Research question:",
    enquiry.question.trim(),
  ].join("\r\n");
}

export function enquiryEmailUrl(enquiry: Enquiry): string {
  return `mailto:${ENQUIRY_EMAIL}?subject=${encodeURIComponent(ENQUIRY_SUBJECT)}&body=${encodeURIComponent(enquiryMessage(enquiry))}`;
}

export function enquiryGmailUrl(enquiry: Enquiry): string {
  const params = new URLSearchParams({
    view: "cm",
    fs: "1",
    to: ENQUIRY_EMAIL,
    su: ENQUIRY_SUBJECT,
    body: enquiryMessage(enquiry),
  });
  return `https://mail.google.com/mail/?${params}`;
}
