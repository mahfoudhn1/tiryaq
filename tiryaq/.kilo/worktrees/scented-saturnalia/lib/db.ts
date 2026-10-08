import Dexie, { type Table } from 'dexie';

export interface AlgerianMedication {
  id: string;
  registration_number: string;
  brand_name: string;
  dci: string;
  form: string;
  dosage: string;
  laboratory: string;
  is_reimbursable: boolean;
}

interface NomenclaturePayload {
  medicines: Array<Record<string, unknown>>;
}

const NOMENCLATURE_VERSION = '2025-registered-products-v1';
const NOMENCLATURE_VERSION_KEY = 'nomenclature_seed_version';

const db = new Dexie('tiryaq-clinical-local') as Dexie & {
  medications: Table<AlgerianMedication, string>;
};

db.version(1).stores({
  medications: 'id, brand_name, dci, [brand_name+dci]',
});

function stringValue(value: unknown): string {
  if (typeof value === 'string') return value.trim();
  return typeof value === 'number' && Number.isFinite(value) ? String(value) : '';
}

function normalizeMedication(raw: Record<string, unknown>, index: number): AlgerianMedication | null {
  const registrationNumber = stringValue(raw.registrationNumber);
  const dci = stringValue(raw.inn);
  const brandName = stringValue(raw.brandName);

  if (!dci && !brandName) return null;

  return {
    id: `${registrationNumber || 'local'}-${index}`,
    registration_number: registrationNumber,
    brand_name: brandName || dci,
    dci: dci || brandName,
    form: stringValue(raw.form),
    dosage: stringValue(raw.strength),
    laboratory: stringValue(raw.manufacturer),
    is_reimbursable: stringValue(raw.p1).toUpperCase() === 'HOP',
  };
}

function isNomenclaturePayload(value: unknown): value is NomenclaturePayload {
  if (typeof value !== 'object' || value === null || !('medicines' in value)) return false;
  const medicines = value.medicines;
  return Array.isArray(medicines) && medicines.every((item) => typeof item === 'object' && item !== null);
}

export const nomenclatureDb = db;

let initialization: Promise<void> | undefined;

export function initializeNomenclature(): Promise<void> {
  initialization ??= seedNomenclature();
  return initialization;
}

async function seedNomenclature(): Promise<void> {
  if (typeof window === 'undefined') return;

  const seededVersion = window.localStorage.getItem(NOMENCLATURE_VERSION_KEY);
  if (seededVersion === NOMENCLATURE_VERSION && (await db.medications.count()) > 0) {
    window.localStorage.setItem('nomenclature_seeded', 'true');
    return;
  }

  const response = await fetch('/data/algerian_nomenclature.json');
  if (!response.ok) throw new Error(`Nomenclature download failed (${response.status})`);

  const payload: unknown = await response.json();
  if (!isNomenclaturePayload(payload)) throw new Error('Invalid nomenclature payload');

  const medications = payload.medicines
    .map(normalizeMedication)
    .filter((medication): medication is AlgerianMedication => medication !== null);

  await db.medications.clear();
  await db.medications.bulkPut(medications);
  window.localStorage.setItem(NOMENCLATURE_VERSION_KEY, NOMENCLATURE_VERSION);
  window.localStorage.setItem('nomenclature_seeded', 'true');
}