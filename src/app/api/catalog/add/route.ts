import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { isAdmin } from "@/lib/adminAuth";
import { jsonError } from "@/lib/apiError";
import { invalidateCatalogCache } from "@/lib/catalog";
import { parseCatalogInput } from "@/lib/catalogInput";
import { addToCatalog, type ResolvedTrim } from "@/lib/catalogWrite";
import { getCnyRubRate } from "@/lib/exchangeRate";
import { HttpError } from "@/lib/httpError";
import { setSuggestionStatus } from "@/lib/suggestionStatus";

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Некорректный JSON" }, { status: 400 });
  }

  const parsed = parseCatalogInput(body);
  if (!parsed.ok) {
    return NextResponse.json({ error: "Проверьте данные", errors: parsed.errors }, { status: 400 });
  }
  const input = parsed.value;

  try {
    // Цена в рублях не указана — считаем по курсу ЦБ из цены в юанях.
    let rate: number | undefined;
    const trims: ResolvedTrim[] = [];
    for (const t of input.trims) {
      if (t.priceFrom !== undefined) {
        trims.push({ ...t, priceFrom: t.priceFrom });
        continue;
      }
      if (t.priceCny === undefined) throw new HttpError("Не указана цена", 400);
      rate ??= await getCnyRubRate();
      trims.push({ ...t, priceFrom: Math.round((t.priceCny * rate) / 1000) * 1000 });
    }

    const result = await addToCatalog(input, trims);

    if (input.suggestionId) {
      await setSuggestionStatus(input.suggestionId, "approved");
    }

    invalidateCatalogCache();
    revalidatePath("/", "layout");

    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    return jsonError(error, "catalog-add");
  }
}
