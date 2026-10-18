"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileJson, Plus, Save, Trash2, FormInput } from "lucide-react";
import { parseCatalogInput, slugify } from "@/lib/catalogInput";

type BrandOption = { slug: string; name: string };

export type AddFormInitial = {
  brandSlug?: string;
  modelName?: string;
  suggestionId?: string;
  suggestionNote?: string;
};

type TrimState = Record<string, string>;

type FieldDef = {
  key: string;
  label: string;
  required?: boolean;
  hint?: string;
  options?: string[];
};

const TRIM_GROUPS: { title: string; fields: FieldDef[] }[] = [
  {
    title: "Основное",
    fields: [
      { key: "name", label: "Название версии", required: true },
      { key: "slug", label: "Slug (для адреса)", hint: "пусто — из названия" },
      {
        key: "powertrainType",
        label: "Тип двигателя",
        required: true,
        options: ["BEV", "EREV", "PHEV", "HEV"],
      },
      {
        key: "drive",
        label: "Привод",
        required: true,
        options: ["Передний", "Задний", "Полный"],
      },
      { key: "highlight", label: "Ключевое отличие версии" },
    ],
  },
  {
    title: "Цена",
    fields: [
      { key: "priceCny", label: "Цена в Китае, ¥", hint: "нужна для расчёта таможни" },
      { key: "priceFrom", label: "Цена, ₽", hint: "пусто — по курсу ЦБ из юаней" },
    ],
  },
  {
    title: "Запас хода и динамика",
    fields: [
      { key: "rangeKm", label: "Запас хода CLTC, км", required: true },
      { key: "totalRangeKm", label: "Общий запас хода, км", hint: "BEV: пусто = как CLTC" },
      { key: "powerKw", label: "Мощность, кВт", hint: "достаточно кВт или л.с." },
      { key: "powerHp", label: "Мощность, л.с." },
      { key: "powerP30Kw", label: "P30, кВт", hint: "по документации; пусто — 0,45 × пик" },
      { key: "torqueNm", label: "Крутящий момент, Н·м", required: true },
      { key: "accelSec", label: "Разгон 0–100, с", required: true },
      { key: "topSpeedKmh", label: "Макс. скорость, км/ч", required: true },
      { key: "motorModel", label: "Модель двигателя" },
    ],
  },
  {
    title: "ДВС (только EREV/PHEV/HEV)",
    fields: [
      { key: "icePowerKw", label: "Мощность ДВС, кВт" },
      { key: "icePowerHp", label: "Мощность ДВС, л.с." },
    ],
  },
  {
    title: "Батарея и зарядка",
    fields: [
      { key: "batteryKwh", label: "Батарея, кВт·ч", required: true },
      { key: "batteryType", label: "Тип батареи", hint: "LFP, NMC…" },
      { key: "fastCharge", label: "Быстрая зарядка", hint: "напр. 27 мин (30→80%)" },
      { key: "lidar", label: "Лидар", hint: "пусто, если нет" },
    ],
  },
  {
    title: "Габариты и масса (по возможности)",
    fields: [
      { key: "lengthMm", label: "Длина, мм" },
      { key: "widthMm", label: "Ширина, мм" },
      { key: "heightMm", label: "Высота, мм" },
      { key: "wheelbaseMm", label: "Колёсная база, мм" },
      { key: "frontTrackMm", label: "Передняя колея, мм" },
      { key: "curbWeightKg", label: "Снаряжённая масса, кг" },
      { key: "grossWeightKg", label: "Полная масса, кг" },
      { key: "turningRadiusM", label: "Радиус разворота, м" },
    ],
  },
];

const TRIM_KEYS = TRIM_GROUPS.flatMap((g) => g.fields.map((f) => f.key));

const emptyTrim = (): TrimState => ({ powertrainType: "BEV", drive: "Полный" });

const EXAMPLE_JSON = `{
  "brandSlug": "li-auto",
  "model": {
    "name": "Пример модели",
    "bodyType": "SUV",
    "seats": 5,
    "tagline": "Короткая подпись",
    "description": "Описание модели",
    "exteriorColors": [{ "name": "Белый", "hex": "#f5f5f5" }],
    "interiorColors": [{ "name": "Чёрный", "hex": "#1a1a1a" }]
  },
  "trims": [
    {
      "name": "Standard",
      "powertrainType": "BEV",
      "drive": "Задний",
      "priceCny": 250000,
      "rangeKm": 600,
      "powerKw": 200,
      "torqueNm": 360,
      "accelSec": 6.5,
      "topSpeedKmh": 200,
      "batteryKwh": 80,
      "batteryType": "LFP",
      "fastCharge": "20 мин (10→80%)"
    }
  ]
}`;

function parseColorLines(text: string) {
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((line) => {
      const m = line.match(/^(.*?)[\s:,-]*(#[0-9a-fA-F]{6})$/);
      return m ? { name: m[1].trim(), hex: m[2] } : { name: line, hex: "" };
    });
}

function colorsToText(list: unknown): string {
  if (!Array.isArray(list)) return "";
  return list
    .map((c) =>
      c && typeof c === "object"
        ? `${String((c as { name?: unknown }).name ?? "")} ${String((c as { hex?: unknown }).hex ?? "")}`
        : "",
    )
    .join("\n");
}

const inputCls =
  "mt-1 w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-charge";
const labelCls = "font-mono text-[11px] uppercase tracking-wide text-ink-soft";

export function AddModelForm({
  brands,
  initial,
}: {
  brands: BrandOption[];
  initial: AddFormInitial;
}) {
  const router = useRouter();
  const [tab, setTab] = useState<"form" | "json">("form");

  const [brandMode, setBrandMode] = useState<"existing" | "new">("existing");
  const [brandSlug, setBrandSlug] = useState(initial.brandSlug ?? brands[0]?.slug ?? "");
  const [nb, setNb] = useState({
    name: "",
    slug: "",
    country: "Китай",
    description: "",
    accent: "#2b6cb0",
    logo: "",
  });

  const [modelName, setModelName] = useState(initial.modelName ?? "");
  const [modelSlug, setModelSlug] = useState("");
  const [bodyType, setBodyType] = useState("");
  const [seats, setSeats] = useState("5");
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState(initial.suggestionNote ?? "");
  const [exterior, setExterior] = useState("");
  const [interior, setInterior] = useState("");
  const [trims, setTrims] = useState<TrimState[]>([emptyTrim()]);

  const [jsonText, setJsonText] = useState("");
  const [jsonNote, setJsonNote] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  function setTrimField(i: number, key: string, value: string) {
    setTrims((prev) => prev.map((t, idx) => (idx === i ? { ...t, [key]: value } : t)));
  }

  function buildPayload() {
    return {
      brandSlug: brandMode === "existing" ? brandSlug : undefined,
      newBrand: brandMode === "new" ? nb : undefined,
      model: {
        name: modelName,
        slug: modelSlug,
        bodyType,
        seats,
        tagline,
        description,
        exteriorColors: parseColorLines(exterior),
        interiorColors: parseColorLines(interior),
      },
      trims: trims.map((t) => {
        const o: Record<string, string> = {};
        for (const k of TRIM_KEYS) if ((t[k] ?? "").trim() !== "") o[k] = t[k];
        return o;
      }),
      suggestionId: initial.suggestionId,
    };
  }

  async function handleSave() {
    setErrors([]);
    const payload = buildPayload();
    const check = parseCatalogInput(payload);
    if (!check.ok) {
      setErrors(check.errors);
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/catalog/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErrors(
          Array.isArray(data.errors) && data.errors.length
            ? data.errors
            : [data.error ?? "Не удалось сохранить"],
        );
        return;
      }
      router.push(`/admin/brand/${data.brandSlug}/${data.modelSlug}`);
      router.refresh();
    } catch {
      setErrors(["Нет связи с сервером"]);
    } finally {
      setSaving(false);
    }
  }

  function loadJson() {
    setErrors([]);
    setJsonNote("");
    let raw: unknown;
    try {
      raw = JSON.parse(jsonText);
    } catch (e) {
      setErrors([`Это не JSON: ${e instanceof Error ? e.message : "ошибка разбора"}`]);
      return;
    }
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
      setErrors(["Ожидается JSON-объект"]);
      return;
    }
    const r = raw as Record<string, unknown>;
    const s = (v: unknown) => (v === undefined || v === null ? "" : String(v));

    if (r.newBrand && typeof r.newBrand === "object") {
      const b = r.newBrand as Record<string, unknown>;
      setBrandMode("new");
      setNb({
        name: s(b.name),
        slug: s(b.slug),
        country: s(b.country) || "Китай",
        description: s(b.description),
        accent: s(b.accent) || "#2b6cb0",
        logo: s(b.logo),
      });
    } else {
      setBrandMode("existing");
      if (s(r.brandSlug)) setBrandSlug(s(r.brandSlug));
    }

    const m = (r.model && typeof r.model === "object" ? r.model : {}) as Record<string, unknown>;
    setModelName(s(m.name));
    setModelSlug(s(m.slug));
    setBodyType(s(m.bodyType));
    setSeats(s(m.seats) || "5");
    setTagline(s(m.tagline));
    setDescription(s(m.description));
    setExterior(colorsToText(m.exteriorColors));
    setInterior(colorsToText(m.interiorColors));

    const list = Array.isArray(r.trims) ? r.trims : [];
    setTrims(
      list.length
        ? list.map((t) => {
            const o: TrimState = {};
            if (t && typeof t === "object") {
              for (const k of TRIM_KEYS) {
                const v = (t as Record<string, unknown>)[k];
                if (v !== undefined && v !== null) o[k] = String(v);
              }
            }
            return o;
          })
        : [emptyTrim()],
    );

    const check = parseCatalogInput({ ...r, suggestionId: initial.suggestionId });
    setTab("form");
    if (check.ok) {
      setJsonNote("Данные загружены в форму — проверьте и нажмите «Добавить в каталог».");
    } else {
      setErrors(check.errors);
      setJsonNote("Данные загружены в форму, но есть ошибки — исправьте их ниже.");
    }
  }

  return (
    <div className="mt-6">
      {initial.suggestionId && (
        <div className="mb-4 rounded-xl border border-charge/30 bg-charge/5 px-4 py-3 text-sm text-ink">
          Добавление из предложения. После сохранения оно будет отмечено как одобренное.
        </div>
      )}

      <div className="flex gap-2">
        {(
          [
            ["form", "Форма", FormInput],
            ["json", "Вставить JSON", FileJson],
          ] as const
        ).map(([id, label, Icon]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`flex items-center gap-1.5 rounded-full border px-4 py-2 text-xs font-medium transition-colors ${
              tab === id
                ? "border-ink bg-ink text-surface"
                : "border-line text-ink hover:border-charge hover:text-charge"
            }`}
          >
            <Icon size={13} />
            {label}
          </button>
        ))}
      </div>

      {jsonNote && <p className="mt-3 text-sm text-charge">{jsonNote}</p>}

      {tab === "json" && (
        <div className="mt-4 rounded-2xl border border-line bg-surface-card p-6">
          <p className="text-sm text-ink-soft">
            Вставьте карточку в формате JSON. Она заполнит форму, ничего не сохраняя —
            вы сможете проверить и поправить данные.
          </p>
          <textarea
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
            rows={16}
            spellCheck={false}
            placeholder="{ ... }"
            className={`${inputCls} font-mono text-xs`}
          />
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={loadJson}
              disabled={!jsonText.trim()}
              className="rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-surface transition-colors hover:bg-deep disabled:opacity-50"
            >
              Загрузить в форму
            </button>
            <button
              type="button"
              onClick={() => setJsonText(EXAMPLE_JSON)}
              className="rounded-full border border-line px-5 py-2.5 text-sm font-medium text-ink hover:border-charge hover:text-charge"
            >
              Показать пример
            </button>
          </div>
          {errors.length > 0 && <ErrorList errors={errors} />}
        </div>
      )}

      {tab === "form" && (
        <div className="mt-4 flex flex-col gap-6">
          <section className="rounded-2xl border border-line bg-surface-card p-6">
            <h2 className="font-display text-lg font-semibold text-ink">Марка</h2>
            <div className="mt-3 flex gap-4 text-sm text-ink">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={brandMode === "existing"}
                  onChange={() => setBrandMode("existing")}
                />
                Есть в каталоге
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={brandMode === "new"}
                  onChange={() => setBrandMode("new")}
                />
                Новая марка
              </label>
            </div>

            {brandMode === "existing" ? (
              <select
                value={brandSlug}
                onChange={(e) => setBrandSlug(e.target.value)}
                className={inputCls}
              >
                {brands.map((b) => (
                  <option key={b.slug} value={b.slug}>
                    {b.name}
                  </option>
                ))}
              </select>
            ) : (
              <div className="mt-3 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelCls}>Название *</label>
                  <input
                    className={inputCls}
                    value={nb.name}
                    onChange={(e) =>
                      setNb((p) => ({
                        ...p,
                        name: e.target.value,
                        logo: p.logo || e.target.value.slice(0, 2).toUpperCase(),
                      }))
                    }
                  />
                </div>
                <div>
                  <label className={labelCls}>Slug</label>
                  <input
                    className={inputCls}
                    value={nb.slug}
                    placeholder={slugify(nb.name) || "из названия"}
                    onChange={(e) => setNb((p) => ({ ...p, slug: e.target.value }))}
                  />
                </div>
                <div>
                  <label className={labelCls}>Страна / происхождение *</label>
                  <input
                    className={inputCls}
                    value={nb.country}
                    onChange={(e) => setNb((p) => ({ ...p, country: e.target.value }))}
                  />
                </div>
                <div>
                  <label className={labelCls}>Метка логотипа (2–3 символа)</label>
                  <input
                    className={inputCls}
                    value={nb.logo}
                    maxLength={3}
                    onChange={(e) => setNb((p) => ({ ...p, logo: e.target.value }))}
                  />
                </div>
                <div>
                  <label className={labelCls}>Акцентный цвет</label>
                  <input
                    type="color"
                    className="mt-1 h-10 w-20 cursor-pointer rounded-lg border border-line bg-surface"
                    value={nb.accent}
                    onChange={(e) => setNb((p) => ({ ...p, accent: e.target.value }))}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className={labelCls}>Описание бренда</label>
                  <textarea
                    className={inputCls}
                    rows={2}
                    value={nb.description}
                    onChange={(e) => setNb((p) => ({ ...p, description: e.target.value }))}
                  />
                </div>
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-line bg-surface-card p-6">
            <h2 className="font-display text-lg font-semibold text-ink">Модель</h2>
            <p className="mt-1 text-xs text-ink-soft">
              Если модель с таким slug уже есть у этой марки, будут добавлены только версии.
            </p>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelCls}>Название *</label>
                <input
                  className={inputCls}
                  value={modelName}
                  onChange={(e) => setModelName(e.target.value)}
                />
              </div>
              <div>
                <label className={labelCls}>Slug</label>
                <input
                  className={inputCls}
                  value={modelSlug}
                  placeholder={slugify(modelName) || "из названия"}
                  onChange={(e) => setModelSlug(e.target.value)}
                />
              </div>
              <div>
                <label className={labelCls}>Тип кузова *</label>
                <input
                  className={inputCls}
                  list="body-types"
                  value={bodyType}
                  onChange={(e) => setBodyType(e.target.value)}
                />
                <datalist id="body-types">
                  {["SUV", "Седан", "Хэтчбек", "Лифтбек", "Универсал", "Минивэн", "Купе", "Пикап"].map(
                    (b) => (
                      <option key={b} value={b} />
                    ),
                  )}
                </datalist>
              </div>
              <div>
                <label className={labelCls}>Мест *</label>
                <input
                  className={inputCls}
                  inputMode="numeric"
                  value={seats}
                  onChange={(e) => setSeats(e.target.value)}
                />
              </div>
              <div className="sm:col-span-2">
                <label className={labelCls}>Короткая подпись</label>
                <input
                  className={inputCls}
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                />
              </div>
              <div className="sm:col-span-2">
                <label className={labelCls}>Описание</label>
                <textarea
                  className={inputCls}
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <div>
                <label className={labelCls}>Цвета кузова (по строке: название #hex)</label>
                <textarea
                  className={`${inputCls} font-mono text-xs`}
                  rows={4}
                  placeholder={"Белый #f5f5f5\nЧёрный #1a1a1a"}
                  value={exterior}
                  onChange={(e) => setExterior(e.target.value)}
                />
              </div>
              <div>
                <label className={labelCls}>Цвета салона (по строке: название #hex)</label>
                <textarea
                  className={`${inputCls} font-mono text-xs`}
                  rows={4}
                  value={interior}
                  onChange={(e) => setInterior(e.target.value)}
                />
              </div>
            </div>
          </section>

          {trims.map((trim, i) => (
            <section key={i} className="rounded-2xl border border-line bg-surface-card p-6">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg font-semibold text-ink">
                  Версия {i + 1}
                  {trim.name ? ` — ${trim.name}` : ""}
                </h2>
                {trims.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setTrims((p) => p.filter((_, idx) => idx !== i))}
                    className="flex items-center gap-1 text-xs text-ink-soft hover:text-red-600"
                  >
                    <Trash2 size={13} /> Удалить
                  </button>
                )}
              </div>
              {TRIM_GROUPS.map((g) => (
                <div key={g.title} className="mt-4">
                  <p className="font-mono text-[10px] uppercase tracking-wide text-charge">
                    {g.title}
                  </p>
                  <div className="mt-2 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {g.fields.map((f) => (
                      <div key={f.key}>
                        <label className={labelCls}>
                          {f.label}
                          {f.required ? " *" : ""}
                        </label>
                        {f.options ? (
                          <>
                            <input
                              className={inputCls}
                              list={`${f.key}-${i}`}
                              value={trim[f.key] ?? ""}
                              onChange={(e) => setTrimField(i, f.key, e.target.value)}
                            />
                            <datalist id={`${f.key}-${i}`}>
                              {f.options.map((o) => (
                                <option key={o} value={o} />
                              ))}
                            </datalist>
                          </>
                        ) : (
                          <input
                            className={inputCls}
                            value={trim[f.key] ?? ""}
                            placeholder={f.hint}
                            onChange={(e) => setTrimField(i, f.key, e.target.value)}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </section>
          ))}

          <button
            type="button"
            onClick={() => setTrims((p) => [...p, emptyTrim()])}
            className="flex items-center justify-center gap-1.5 self-start rounded-full border border-line px-5 py-2.5 text-sm font-medium text-ink hover:border-charge hover:text-charge"
          >
            <Plus size={14} /> Ещё одна версия
          </button>

          {errors.length > 0 && <ErrorList errors={errors} />}

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex items-center justify-center gap-1.5 self-start rounded-full bg-ink px-6 py-3 text-sm font-medium text-surface transition-colors hover:bg-deep disabled:opacity-50"
          >
            <Save size={14} />
            {saving ? "Сохраняю…" : "Добавить в каталог"}
          </button>
        </div>
      )}
    </div>
  );
}

function ErrorList({ errors }: { errors: string[] }) {
  return (
    <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
      <p className="font-medium">Нужно исправить:</p>
      <ul className="mt-1 list-disc pl-5">
        {errors.map((e, i) => (
          <li key={i}>{e}</li>
        ))}
      </ul>
    </div>
  );
}
