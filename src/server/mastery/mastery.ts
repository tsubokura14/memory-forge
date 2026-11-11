export type MasteryCounts = { total: number; answered: number; correct: number };
export type Mastery = {
  correct: number;
  wrong: number;
  new: number;
  accuracy: number | null;
};

export function mastery(_counts: MasteryCounts): Mastery {
  throw new Error("Not implemented.");
}
