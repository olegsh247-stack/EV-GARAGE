import { NextRequest, NextResponse } from "next/server";
import { getContact, setContact } from "@/lib/contactStore";

export async function GET() {
  const contact = await getContact();
  return NextResponse.json(contact);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { phoneDisplay, phoneHref, whatsappHref, telegramHref, email } = body;

  if (
    typeof phoneDisplay !== "string" ||
    typeof phoneHref !== "string" ||
    typeof whatsappHref !== "string" ||
    typeof telegramHref !== "string" ||
    typeof email !== "string"
  ) {
    return NextResponse.json({ error: "Некорректные данные" }, { status: 400 });
  }

  await setContact({ phoneDisplay, phoneHref, whatsappHref, telegramHref, email });
  return NextResponse.json({ ok: true });
}
