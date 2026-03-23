// app/contact/page.tsx
import ContactClient from "./ContactClient";

export const metadata = {
  title: "Contact | Old Crows Wireless Solutions",
  description:
    "Get in touch with OCWS for on-site RF assessments, technical questions, or general inquiries. Joshua Turner responds within 1 business day.",
};

export default function ContactPage() {
  return <ContactClient />;
}
