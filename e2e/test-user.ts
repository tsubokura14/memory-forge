// 画面のテストで使うユーザー。test（CI では ci）のデータベースにだけ入る決まった値
// （docs/design.md の「画面の画像を撮る・比べる仕組み」）
export const TEST_USER = {
  email: "me@example.com",
  password: "correct-horse-battery",
};

// ログインした状態の cookie を保存する場所。global setup が作り、ログインが要る画面のテストが storageState で使う
export const SIGNED_IN_STATE = "e2e/.auth/signed-in.json";
