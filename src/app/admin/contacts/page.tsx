import { getContact } from "@/lib/contactStore";
import { ContactEditForm } from "../ContactEditForm";
import { AdminNav } from "../AdminNav";

export const dynamic = "force-dynamic";

export default async function AdminContactsPage() {
  const contact = await getContact();

  return (
    <div className="min-h-screen bg-surface px-5 py-10">
      <div className="mx-auto max-w-xl">
        <AdminNav title="Контакты" />

        <p className="mt-4 text-sm text-ink-soft">
          Эти данные используются в шапке сайта, подвале и в блоке связи на
          каждой странице модели.
        </p>

        <div className="mt-8">
          <ContactEditForm initial={contact} />
        </div>
      </div>
    </div>
  );
}
