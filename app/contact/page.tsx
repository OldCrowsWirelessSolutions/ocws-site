// app/contact/page.tsx
import ContactClient from "./ContactClient";

export const metadata = {
  title: "Contact | Old Crows Wireless Solutions",
  description:
    "Get in touch with Old Crows Wireless Solutions to discuss RF engineering, wireless diagnostics, and connectivity challenges.",
};

type PageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

export default function ContactPage({ searchParams }: PageProps) {
  const subject =
    typeof searchParams?.subject === "string" ? searchParams.subject : "";

  return <ContactClient initialSubject={subject} />;
}
