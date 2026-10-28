// 取り込む問題のファイルを確かめる。データベースは使わない（取り込み済みの問題との比べは diff.ts）

export const MAX_FILE_BYTES = 4 * 1024 * 1024;
export const MAX_QUESTIONS = 1000;
const MIN_CHOICES = 2;
const MAX_CHOICES = 8;

export type QuestionType = "single" | "multiple";

export type FileQuestion = {
  id: string;
  topic: string;
  type: QuestionType;
  text: string;
  choices: string[];
  correct: string[];
  explanation: string;
};

export type QuestionFile = { subject: string; questions: FileQuestion[] };

// 誤りの一覧の1行。id はファイル全体の誤りなら「—」、ID が書かれていない問題なら「#3」（何問目か）
export type FileError = { id: string; item: string; message: string };

export type ValidateResult =
  { ok: true; file: QuestionFile } | { ok: false; errors: FileError[] };

const MISSING = "Missing.";
const WRONG_FORMAT = "Wrong format.";
const UNCLOSED_CODE = "Code block is not closed (```).";
const FILE_ID = "—";

export function choiceLetter(index: number): string {
  return String.fromCharCode("A".charCodeAt(0) + index);
}

// 前後の空白だけのものは空とみなす（docs/design.md の「データ」の「問題」）
function isBlank(value: string): boolean {
  return value.trim() === "";
}

// 行の始め（前の空白は除く）が ``` の行が奇数なら、閉じていない
function hasUnclosedCodeBlock(value: string): boolean {
  const fences = value.split("\n").filter((line) => /^\s*```/.test(line));
  return fences.length % 2 === 1;
}

function formatCount(n: number): string {
  return n.toLocaleString("en-US");
}

export function validateQuestionFile(content: string): ValidateResult {
  // 大きさは UTF-8 のバイト数で数える。画面でも、送る前に同じ上限で止める
  if (new TextEncoder().encode(content).length > MAX_FILE_BYTES) {
    return fail([
      { id: FILE_ID, item: "file", message: "Too large. Up to 4 MB." },
    ]);
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    return fail([{ id: FILE_ID, item: "file", message: "Not valid JSON." }]);
  }
  if (!isRecord(parsed)) {
    return fail([{ id: FILE_ID, item: "file", message: WRONG_FORMAT }]);
  }

  const errors: FileError[] = [];

  const subject = parsed.subject;
  if (
    subject === undefined ||
    (typeof subject === "string" && isBlank(subject))
  ) {
    errors.push({ id: FILE_ID, item: "subject", message: MISSING });
  } else if (typeof subject !== "string") {
    errors.push({ id: FILE_ID, item: "subject", message: WRONG_FORMAT });
  }

  const rawQuestions = parsed.questions;
  if (rawQuestions === undefined) {
    errors.push({ id: FILE_ID, item: "questions", message: MISSING });
    return fail(errors);
  }
  if (!Array.isArray(rawQuestions)) {
    errors.push({ id: FILE_ID, item: "questions", message: WRONG_FORMAT });
    return fail(errors);
  }
  if (rawQuestions.length === 0) {
    errors.push({ id: FILE_ID, item: "questions", message: "No questions." });
  }
  if (rawQuestions.length > MAX_QUESTIONS) {
    errors.push({
      id: FILE_ID,
      item: "questions",
      message: `Too many questions (${formatCount(rawQuestions.length)}). Up to ${formatCount(MAX_QUESTIONS)}.`,
    });
  }

  // 問題ごとの誤りは、問題の順に並べる。ID の重なりは、最初に出てきた問題の位置に出す
  const perQuestion: FileError[][] = rawQuestions.map(() => []);
  const questions: FileQuestion[] = [];
  const positionsById = new Map<string, number[]>();

  rawQuestions.forEach((raw, index) => {
    const label =
      isRecord(raw) && typeof raw.id === "string" && !isBlank(raw.id)
        ? raw.id
        : `#${index + 1}`;
    const add = (item: string, message: string) =>
      perQuestion[index].push({ id: label, item, message });

    // 問題そのものがオブジェクトでないときは、項目の名前の代わりに question で示す
    if (!isRecord(raw)) {
      add("question", WRONG_FORMAT);
      return;
    }

    const id = readText(raw.id, "id", add);
    const topic = readText(raw.topic, "topic", add);
    const type = readType(raw.type, add);
    const text = readText(raw.text, "text", add, true);
    const choices = readChoices(raw.choices, add);
    const correct = readCorrect(raw.correct, type, choices, add);
    const explanation = readText(raw.explanation, "explanation", add, true);

    if (id !== undefined) {
      positionsById.set(id, [...(positionsById.get(id) ?? []), index]);
    }
    if (
      id !== undefined &&
      topic !== undefined &&
      type !== undefined &&
      text !== undefined &&
      choices !== undefined &&
      correct !== undefined &&
      explanation !== undefined
    ) {
      questions.push({ id, topic, type, text, choices, correct, explanation });
    }
  });

  for (const [id, positions] of positionsById) {
    if (positions.length > 1) {
      perQuestion[positions[0]].push({
        id,
        item: "id",
        message: `Duplicate ID (${positions.length} questions).`,
      });
    }
  }

  errors.push(...perQuestion.flat());
  if (errors.length > 0) return fail(errors);
  return { ok: true, file: { subject: subject as string, questions } };
}

type Add = (item: string, message: string) => void;

function fail(errors: FileError[]): ValidateResult {
  return { ok: false, errors };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readText(
  value: unknown,
  item: string,
  add: Add,
  mayHaveCode = false,
): string | undefined {
  if (value === undefined || (typeof value === "string" && isBlank(value))) {
    add(item, MISSING);
    return undefined;
  }
  if (typeof value !== "string") {
    add(item, WRONG_FORMAT);
    return undefined;
  }
  if (mayHaveCode && hasUnclosedCodeBlock(value)) {
    add(item, UNCLOSED_CODE);
    return undefined;
  }
  return value;
}

function readType(value: unknown, add: Add): QuestionType | undefined {
  if (value === undefined || (typeof value === "string" && isBlank(value))) {
    add("type", MISSING);
    return undefined;
  }
  if (value !== "single" && value !== "multiple") {
    add("type", "Must be single or multiple.");
    return undefined;
  }
  return value;
}

function readChoices(value: unknown, add: Add): string[] | undefined {
  if (value === undefined || (Array.isArray(value) && value.length === 0)) {
    add("choices", MISSING);
    return undefined;
  }
  if (!Array.isArray(value)) {
    add("choices", WRONG_FORMAT);
    return undefined;
  }
  if (value.length < MIN_CHOICES || value.length > MAX_CHOICES) {
    add("choices", "Needs 2 to 8 choices.");
    return undefined;
  }
  let ok = true;
  value.forEach((choice, index) => {
    if (
      readText(choice, `choice ${choiceLetter(index)}`, add, true) === undefined
    ) {
      ok = false;
    }
  });
  return ok ? (value as string[]) : undefined;
}

function readCorrect(
  value: unknown,
  type: QuestionType | undefined,
  choices: string[] | undefined,
  add: Add,
): string[] | undefined {
  if (value === undefined || (Array.isArray(value) && value.length === 0)) {
    add("correct", MISSING);
    return undefined;
  }
  // 同じ記号を2回書いたものも、形が違うとする（正解の数を数え違えないため）
  if (
    !Array.isArray(value) ||
    !value.every((letter) => typeof letter === "string") ||
    new Set(value).size !== value.length
  ) {
    add("correct", WRONG_FORMAT);
    return undefined;
  }
  const letters = value as string[];

  // 選択肢が確かめられないときは、記号が選択肢の中にあるかは見ない（選択肢の誤りだけを出す）
  if (choices === undefined) return undefined;
  const valid = new Set(choices.map((_, index) => choiceLetter(index)));
  const outside = letters.filter((letter) => !valid.has(letter));
  for (const letter of outside) {
    add("correct", `Not one of the choices (${letter}).`);
  }
  if (outside.length > 0) return undefined;

  if (type === "single" && letters.length !== 1) {
    add("correct", "Single choice needs exactly 1 correct answer.");
    return undefined;
  }
  if (type === "multiple" && letters.length < 2) {
    add("correct", "Multiple choice needs 2 or more correct answers.");
    return undefined;
  }
  return letters;
}
