/**
 * Feriados Nacionais do Brasil + Feriados de São Paulo (Estado e Município)
 */

export interface Holiday {
  date: string;       // "YYYY-MM-DD"
  name: string;
  type: 'nacional' | 'estadual' | 'municipal';
}

/**
 * Calcula a data da Páscoa para um dado ano (algoritmo de Meeus/Jones/Butcher).
 */
function easter(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}

function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

function fmt(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * Retorna todos os feriados de um ano.
 */
export function getHolidays(year: number): Holiday[] {
  const e = easter(year);

  // Feriados móveis (baseados na Páscoa)
  const carnavalSeg   = addDays(e, -48);
  const carnavalTer   = addDays(e, -47);
  const sextaSanta    = addDays(e, -2);
  const corpusChristi = addDays(e, 60);

  const holidays: Holiday[] = [
    // === Nacionais fixos ===
    { date: `${year}-01-01`, name: 'Confraternização Universal',   type: 'nacional' },
    { date: `${year}-04-21`, name: 'Tiradentes',                   type: 'nacional' },
    { date: `${year}-05-01`, name: 'Dia do Trabalho',              type: 'nacional' },
    { date: `${year}-09-07`, name: 'Independência do Brasil',      type: 'nacional' },
    { date: `${year}-10-12`, name: 'Nossa Sra. Aparecida',         type: 'nacional' },
    { date: `${year}-11-02`, name: 'Finados',                      type: 'nacional' },
    { date: `${year}-11-15`, name: 'Proclamação da República',     type: 'nacional' },
    { date: `${year}-11-20`, name: 'Dia da Consciência Negra',     type: 'nacional' },
    { date: `${year}-12-25`, name: 'Natal',                        type: 'nacional' },

    // === Nacionais móveis ===
    { date: fmt(carnavalSeg),   name: 'Carnaval (Segunda)',        type: 'nacional' },
    { date: fmt(carnavalTer),   name: 'Carnaval (Terça)',          type: 'nacional' },
    { date: fmt(sextaSanta),    name: 'Sexta-feira Santa',         type: 'nacional' },
    { date: fmt(e),             name: 'Páscoa',                    type: 'nacional' },
    { date: fmt(corpusChristi), name: 'Corpus Christi',            type: 'nacional' },

    // === São Paulo (município) ===
    { date: `${year}-01-25`, name: 'Aniversário de São Paulo',    type: 'municipal' },

    // === São Paulo (estado) ===
    { date: `${year}-07-09`, name: 'Revolução Constitucionalista', type: 'estadual' },
  ];

  return holidays.sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Mapa rápido: "YYYY-MM-DD" → Holiday[] para lookup O(1).
 */
export function getHolidayMap(year: number): Map<string, Holiday[]> {
  const map = new Map<string, Holiday[]>();
  for (const h of getHolidays(year)) {
    const list = map.get(h.date) || [];
    list.push(h);
    map.set(h.date, list);
  }
  return map;
}

/**
 * Retorna o feriado de um Date (ou null se não for feriado).
 */
export function getHolidayForDate(d: Date, holidayMap: Map<string, Holiday[]>): Holiday[] | null {
  const key = fmt(d);
  return holidayMap.get(key) ?? null;
}

export { fmt as formatDateKey };
