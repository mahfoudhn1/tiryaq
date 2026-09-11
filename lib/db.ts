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

const db = new Dexie('tiryaq-clinical-local') as Dexie & {
  medications: Table<AlgerianMedication, string>;
};

db.version(1).stores({
  medications: 'id, brand_name, dci, [brand_name+dci]',
});

function stringValue(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizeMedication(raw: Record<string, unknown>, index: number): AlgerianMedication | null {
  const registrationNumber = stringValue(raw['Unnamed: 1']);
  const dci = stringValue(raw['Unnamed: 3']);
  const brandName = stringValue(raw['Unnamed: 4']);

  if (!dci && !brandName) return null;

  return {
    id: `${registrationNumber || 'local'}-${index}`,
    registration_number: registrationNumber,
    brand_name: brandName || dci,
    dci: dci || brandName,
    form: stringValue(raw['Unnamed: 5']),
    dosage: stringValue(raw['Unnamed: 6']),
    laboratory: stringValue(raw['Unnamed: 12']),
    is_reimbursable: stringValue(raw['Unnamed: 9']).toUpperCase() === 'HOP',
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

  const recordCount = await db.medications.count();
  if (recordCount > 0) {
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

  await db.medications.bulkPut(medications);
  window.localStorage.setItem('nomenclature_seeded', 'true');
}