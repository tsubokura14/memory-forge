<!--
変更の仕様のひな形。コピーして docs/changes/<年-月-日>-<何をするか>.md を作る（例：2026-09-17-add-due-date.md）。
「なぜ」〜「調べたこと」は、AIが下書きし、人間が答えて決める（手順5）。「画面」のスクリーンショットは、プロトタイプで合意したときに足す（手順6）。
「設計」以降はAIが下書きし、人間がレビューする（手順7）。
スクリーンショットは、このファイルと同じ名前のフォルダに置く（例：2026-09-17-add-due-date/list-empty.png）。
-->

# 連続日数で、続けているのがわかる（#10）

## なぜ

続けるのが楽しくなるようにするため。今日まで何日続いたか、今週のどの日に答えたか、今日もう答えたかを Home のいちばん上で見せ、「今日も炎を灯す」気持ちで毎日解けるようにする（`docs/overview.md` の「連続日数」）。

## 影響する今の仕様

- `docs/specs/home.md` の「最初の画面（`/`）」：いちばん上に連続日数が加わる。並びが「day streak」「menu」「subjects」になる
- 新しい節：`docs/specs/home.md` に「連続日数」の数え方を足す（「身についている具合」と同じように、数え方を1か所に書く）

## 使う場面

1. 月曜から水曜まで毎日解いた人が、木曜の朝（日本時間）にまだ答えずに Home を開くと、線だけの炎と「3」、今週の月〜水の炎が灯り、木曜の炎がゆっくり点滅し、「answer today to keep the flame」と出る
2. 同じ人が、木曜に Solve で1問答えて Home に戻ると、左の炎が灯って「4」になり、木曜の炎も灯り、「done today」と出る
3. 一昨日を最後に答えていない人が Home を開くと、日数は「0」になる。今週答えた日の炎は灯ったまま残る

## 受け入れ条件

- Home のいちばん上（上のバーの下、menu の上）に「day streak」の見出しと、連続日数の枠が出る
- 日の区切りは日本時間の0時。1日に1問でも答えた日を「取り組んだ日」とする
  - スキップも答えたことに数える
  - 不備の印が付いている問題への答えは数えない（印を付ける前に答えていても）
  - 問題を消すと、その問題の答えも数えなくなる。その日にほかの答えがなければ、その日は取り組んだ日でなくなり、日数が減ることがある
- 日数は、今日までさかのぼって取り組んだ日が何日続いているか
  - 今日答えていれば、今日を含めて数える
  - 今日まだ答えていなくても、昨日答えていれば、昨日までの日数を出す（切れない）
  - 今日も昨日も答えていなければ0
- 今日答えたかどうかで、炎と日数の色と、今日の様子の文言が変わる
  - 答えた：炎が灯り、「done today」
  - まだ：炎は線だけで、「answer today to keep the flame」
  - 0日のとき：炎は線だけで、「answer a question to light the flame」
- 日数は数字だけを出し、単位は添えない（見出しが「day streak」のため）
- 日数が4桁（9999）までは、PC でもスマホの幅でも、炎・日数・今週の7日が1行に収まる
- 今週（月〜日）の7日を並べ、日ごとに、答えた日・答えなかった日・今日まだ・これからの日を見分けられるようにする。今日の曜日がわかる
- Solve で1問答えてから Home に戻ると、日数と今日の炎がそれを含めた表示になっている
- Home を開いたまま日付が変わっても表示は変わらず、開き直すと（読み直しを含む）今の日付で出る
- 連続日数を読み込んでいる間は、「day streak」の見出しの下に、連続日数の枠と同じ高さの枠を点滅させる。Subject の一覧とは別に出す
- 連続日数を読み込めなかったときは、「day streak」の見出しの下に、danger の帯「Couldn't load day streak.」と retry を出す。retry で読み直す。Subject の一覧はふつうに出す
- ログインしていないと見られない（Home と同じ）

## 画面

### Home（`/`）

見た目は `docs/ui.md` の「連続日数」に従う。

| 状態 | 表示 | スクリーンショット |
| --- | --- | --- |
| 今日答えた | 灯った炎と日数（flame）、今週の答えた日の炎、「done today」 | [home-default.png](2026-11-14-show-day-streak/home-default.png) |
| 今日まだ（昨日まで続いている） | 線だけの炎と日数、今日の炎が点滅、「answer today to keep the flame」 | [home-streak-pending.png](2026-11-14-show-day-streak/home-streak-pending.png) |
| 0日 | 線だけの炎と「0」（muted）、muted の「answer a question to light the flame」 | [home-no-streak.png](2026-11-14-show-day-streak/home-no-streak.png) |
| 日数が大きい | 4桁の日数でも、炎・日数・今週の7日が1行に収まる | [home-long.png](2026-11-14-show-day-streak/home-long.png)、[home-long-mobile.png](2026-11-14-show-day-streak/home-long-mobile.png) |
| スマホの幅 | 炎を小さくし、7日の間を詰めて右に寄せる。曜日は1文字 | [home-default-mobile.png](2026-11-14-show-day-streak/home-default-mobile.png) |
| 読み込み中 | 連続日数の枠と同じ高さの枠が点滅する | [home-streak-loading.png](2026-11-14-show-day-streak/home-streak-loading.png) |
| 読み込めなかった | danger の帯「Couldn't load day streak.」と retry | [home-streak-error.png](2026-11-14-show-day-streak/home-streak-error.png) |

## やらないこと

- 連続日数のほかの記録（最長記録、過去の週や月のカレンダー）は出さない
- 続かなかったときの通知や、切れないようにする仕組み（お休みの日など）は作らない
- Home を開いたまま日付が変わったときに、表示を自動で変えない（開き直せば変わる）
- 問題を消しても連続日数が減らないようにする仕組み（アーカイブ）は、今回は作らない。あとで別の機能として作る

## 決まっていないこと

- [x] スキップした問題も「答えた」に数える？（スキップも不正解として記録に残る） → 数える
- [x] 問題を消して（Manage の削除、印の付いた問題の取り込み直し）その日の記録がなくなったら、連続日数が減ってよい？ → 今は減ってよい。あとで、問題を消しても減らないようにするアーカイブの機能を作る
- [x] 答えたあとに不備の印を付けた問題の答えも、数える？（身についている具合では数えていない） → 数えない
- [x] 日数の文言は数字だけ？「days」などの単位を添える？（1のときの書き分けも） → お任せ → 数字だけ（見出しが「day streak」のため。/dev-proto で、合意済みのプロトタイプと同じと確かめた）
- [x] 0日のときの今日の様子の文言は？（`docs/ui.md` には色（muted）だけが書かれている） → お任せ → 「answer a question to light the flame」（/dev-proto で、合意済みのプロトタイプの文言に合わせた）
- [x] 連続日数を読み込んでいる間と、読み込めなかったときの表示は？（Subject の一覧とは別に出す？まとめて出す？） → お任せ → Subject の一覧とは別に出す。読み込み中は枠の点滅、読み込めなかったら「Couldn't load day streak.」と retry（`docs/ui.md` の「状態の見せ方」に従う）
- [x] 日数が大きいとき（3桁・4桁）の見え方の決まりは要る？ → 想定しておく → 4桁まで1行に収める
- [x] 「Home を開いたまま日付が変わっても表示を変えない」を、やらないことにしてよい？ → よい。読み直しなどで変われば足りる

## 調べたこと

---

## 設計

### データ

- 表も列も足さない。取り組んだ日は、今の `answers.answered_at` から数える（`docs/design.md` の「データ」の「記録」に、連続日数もこの表から数えると書いてある）
- スキップも `answers` に1行残る（`src/server/solve/answer.ts` の `skipQuestion`）ので、何もしなくても数える
- 問題を消すと、その答えも消える（`answers.question_id` の `onDelete: "cascade"`）ので、何もしなくても数えなくなる
- 不備の印は、数えるときに `questions.flagged = false` の問題の答えだけにして除く（身についている具合と同じ扱い）

### サーバーの処理（`src/server/streak/`）

数え方は、データベースを読む部分と、読まない計算に分ける（`docs/design.md` の「全体の構成」）。

- `answered-days.ts` の `listAnsweredDays(): Promise<string[]>`
  - 印のない問題の答えについて、`answered_at` を日本時間の日付にした `"YYYY-MM-DD"` を、重ねずに返す（`(answered_at at time zone 'Asia/Tokyo')::date`）
  - 全部の日を返す。前提（崩れたら見直す）：使う人はひとりで、日の数は数千まで。重くなったら、今日からさかのぼる分だけにする（コメントに書く）
- `day-streak.ts`（データベースを使わない）
  - `tokyoDate(now: Date): string`：その時刻の日本時間の日付（`"YYYY-MM-DD"`）。`Intl.DateTimeFormat` の `timeZone: "Asia/Tokyo"` で求める
  - `dayStreak(answeredDays: string[], today: string): DayStreak`
    - `days`：今日（今日答えていなければ昨日）からさかのぼって、続いている日の数。今日も昨日もなければ 0
    - `today`：`"done"`（今日答えた）・`"keep"`（今日まだで、日数が1以上）・`"none"`（日数が0）。画面は、これで炎と日数の色と文言を出し分ける（出し分けの決まりを `src/server/` に置くため）
    - `week`：今週の月〜日の7日。日ごとに `"answered"`・`"missed"`（今日より前で答えていない）・`"pending"`（今日で、まだ答えていない）・`"upcoming"`（今日より後）
    - `todayIndex`：今日が `week` の何番目か（月曜が 0）。今日答えたあとは `week` から今日がわからないため持つ
    - 日付は `"YYYY-MM-DD"` の文字列のまま比べ、1日ずらすときだけ UTC の `Date` にして計算する（実行する場所の時間帯に左右されないため。コメントに書く）
- `streak.ts` の `getDayStreak(now: Date): Promise<DayStreak>`：`dayStreak(await listAnsweredDays(), tokyoDate(now))`。「今」は引数で受け取り、呼ぶ側（Home）が下の `now()` を渡す
- 日の区切りが日本時間であることは、連続日数だけの決まりなので、`day-streak.ts` と `answered-days.ts` のコメントに書く（2つのファイルに `Asia/Tokyo` を書くことになるので、名前を `day-streak.ts` の1つの定数にし、`answered-days.ts` はそれを使う）

### 「今」の日時と、画面を撮るときの固定（`src/server/clock.ts`）

- `now(): Date`：環境変数 `FIXED_NOW`（ISO 8601 の日時）があればその日時、なければ今の日時を返す。サーバーで「今」を使うところは、これを呼ぶ
- `playwright.config.ts` の `webServer.env` にだけ `FIXED_NOW` を置き、ブラウザの日時（`e2e/fixtures.ts` の `page.clock`、2026-01-15 09:00 日本時間・木曜）と同じ値にする。値は `e2e/fixtures.ts` の1つの定数にし、`playwright.config.ts` はそれを読む
- `.env.local`・`.env.test`・GitHub の Secret・Vercel には置かない
- 答えを記録する `answer.ts` は、今のままデータベースの `now()` で `answered_at` を入れる（`clock.ts` を使わない）
  - 画面のテストで答えの日時を決めたいのは Home の連続日数だけで、それは `e2e/questions.ts` の `insertAnswers` で日時を指定して入れれば足りるため
  - そのため、画面のテストの中で Solve で答えてから Home の連続日数を見ることはできない（答えは今の日時、Home は固定した日時で数える）
- 理由と前提は、複数の場所（`clock.ts`・`playwright.config.ts`・`e2e/fixtures.ts`）に関わるので、`docs/design.md` の「画面の画像を撮る・比べる仕組み」の「撮るたびに変わるものを止める」の日時に書く（今の「サーバー側の日時は固定していない」の前提を書き換える）

比べた選択肢（選ばなかった理由）：

- ブラウザで今日を決める：サーバーは答えた日の一覧だけを返し、日数と今週はブラウザの部品が `page.clock` の日時で数える。サーバーで組み立てた HTML とブラウザの結果が食い違いうる（読み込んだ直後に別の表示が一瞬出る）うえ、出し分けの決まりを `src/server/` に置く `docs/design.md` の決まりから外れ、ブラウザの時間帯の扱いも要るため選ばなかった
- 連続日数は撮らない：合わせるスクリーンショットの状態を本番で撮れず、Home の今の画像も日付で毎日変わってしまうため選ばなかった

### 画面

- `src/app/(app)/page.tsx`：menu の上に「day streak」の見出しの `section` を足す。中身は `<Suspense fallback={<DayStreakSkeleton />}>` で囲んだ `DayStreakSection`（Subject の一覧とは別の `Suspense`）
  - `DayStreakSection`：`await connection()` のあと `getDayStreak(now())` を呼ぶ。失敗したら `Banner` に「Couldn't load day streak.」と `RetryButton` を出す（Subjects と同じ形）
  - `DayStreakSkeleton`：連続日数の枠と同じ高さの枠1つを `animate-pulse` と `surface-raised` で出す
  - 「開いたまま日付が変わっても変えない」は、開いたときにサーバーで1回だけ組み立てることで満たす（ブラウザで日付を見張らない）
  - 「Solve で答えてから戻ると反映される」は、Home を開くたびに `connection()` でデータベースを読むことで満たす（今の Subject の一覧と同じ）
- `src/components/day-streak.tsx`（新しい部品）：`DayStreak` を受け取って枠を出す。`docs/ui.md` の「連続日数」の部品で、`card.tsx` などの今の部品で作れる部分は今の部品を使う
  - 炎は Material Symbols の `local_fire_department`。灯った炎は FILL を 1 にする
  - 日数は `font-display` と `text-display`。色は `today` で出し分ける（done：flame、keep：text、none：muted）
  - 今週の7日は、日の状態ごとに炎か点を出し、曜日は PC で「Mon」、スマホの幅で「M」（2つを書いて `sm:` で出し分ける）。今日の曜日は flame の色にし、下に flame の小さな点
  - `pending` の炎は flame の色の線だけの炎に `animate-pulse`（トークンを足さない）
  - 今日の様子：done は success の check の印と「done today」、keep は flame の「answer today to keep the flame」、none は muted の「answer a question to light the flame」
  - スマホの幅では、炎を小さくし、7日の間を詰めて右に寄せる。4桁の日数でも1行に収まる大きさにする（スクリーンショット `home-long-mobile.png` に合わせる）
- `src/styles/globals.css`：灯った炎のために `@utility icon-fill`（`font-variation-settings: "FILL" 1`）を足す
  - 入れている `material-symbols` 0.47.6 の `material-symbols-outlined.woff2` は、FILL の軸を持つ可変の書体（パッケージの README）。軸の既定は FILL 0 なので、線だけの炎は今の `icon` のまま
  - `[font-variation-settings:...]` のように書いた値のクラスは ESLint で止まる（`docs/design.md` の「トークンにない値は、ESLint で止める」）ので、`@utility` にする

比べた選択肢（選ばなかった理由）：

- 点滅に、炎だけの遅い点滅をトークンに足す：読み込み中の枠と違う動きにできるが、トークンが1つ増え、`docs/ui.md` にも書き足すことになるため選ばなかった。見分けは形（炎）で足りる

### 画面のテスト（`e2e/`）

- `e2e/questions.ts` の `insertAnswers`：答えごとに `answeredAt` を指定できるようにする。指定しないときは `e2e/fixtures.ts` の固定した日時にする（今の日時で入ると、固定した今日より後の日になるため）
- `e2e/home.spec.ts`：連続日数の状態ごとに、日を決めた答えを入れて撮る。今の `home-default`・`home-empty`・`home-many` も、連続日数が加わるので撮り直す
- サーバーで組み立てる Home の読み込み中と、読み込めなかった状態は撮らない（`docs/design.md` の「画面の画像を撮る・比べる仕組み」）。プロトタイプの画像（`home-streak-loading.png`・`home-streak-error.png`）を見本にし、コードを見て確かめる

### 仕上げで反映するもの

- `docs/specs/home.md`：並び（day streak・menu・subjects）と、「連続日数」の節（数え方）
- `docs/design.md`：「記録」の連続日数の数え方（日本時間の日付、印のない問題の答え）。`FIXED_NOW` はタスク2で書く

## 確かめ方

- Home のいちばん上に「day streak」の見出しと枠が出る：触って確かめる（画像 `home-default.png`）
- 日の区切りは日本時間の0時：テスト（`tokyoDate` で、日本時間の 23:59:59 と 0:00:00 の両側。`listAnsweredDays` で、`answered_at` が日本時間の0時の前後の答えが別の日になる）
- 1日に1問でも答えた日を数え、同じ日の答えは1日にまとめる：テスト（`listAnsweredDays`）
- スキップも数える：テスト（`listAnsweredDays` で、不正解の答えを代表に入れる。スキップは不正解として記録される）
- 不備の印の付いた問題の答えは数えない：テスト（`listAnsweredDays`）
- 問題を消すとその答えも数えない：コードを見て確かめる（`answers` の `onDelete: "cascade"`。消した問題の答えは表に残らないので、数える処理には何も足さない）
- 日数の数え方（今日答えた・今日まだで昨日答えた・今日も昨日もない・途中で切れている・週をまたいで続く）：テスト（`dayStreak`）
- 今日答えたかどうかでの出し分け（done・keep・none）：テスト（`dayStreak` の `today`）。どの色・文言で出るかは、触って確かめる（画像 `home-default.png`・`home-streak-pending.png`・`home-no-streak.png`）
- 日数は数字だけで単位を付けない：触って確かめる（画像）
- 4桁でも1行に収まる：触って確かめる（画像 `home-long.png`・`home-long-mobile.png`）
- 今週の7日の状態と今日の曜日：テスト（`dayStreak` の `week` と `todayIndex`。今日が月曜・日曜の週の両端も）。見分け方は、触って確かめる（画像）
- Solve で答えてから Home に戻ると反映される：触って確かめる（`npm run dev` で答えて戻る。画面のテストでは日時が合わないため撮らない）
- 開いたまま日付が変わっても変わらず、開き直すと今の日付：コードを見て確かめる（開いたときにサーバーで1回だけ組み立て、ブラウザに日付を見張る処理がない）
- 読み込み中の枠：コードを見て確かめる（Subject とは別の `Suspense` と `fallback`。見本は `home-streak-loading.png`）
- 読み込めなかったときの帯と retry：コードを見て確かめる（見本は `home-streak-error.png`。Subject の一覧は別の `Suspense` なので影響しない）
- ログインしていないと見られない：コードを見て確かめる（Home は今のまま `src/proxy.ts` が守る。新しい画面やアクションを足さない）

## タスク

- [x] 1. 連続日数をサーバーで数えられる（`src/server/streak/` の `answered-days.ts`・`day-streak.ts`・`streak.ts` と、その Vitest のテスト）。画面は変えない
- [ ] 2. Home のいちばん上に連続日数を出す（`src/server/clock.ts`、`src/app/(app)/page.tsx`、`src/components/day-streak.tsx`、`src/styles/globals.css`、`playwright.config.ts`、`e2e/fixtures.ts`・`e2e/questions.ts`・`e2e/home.spec.ts`、`docs/design.md` の日時の固定）
  - 合わせるスクリーンショット：`home-default.png`、`home-streak-pending.png`、`home-no-streak.png`、`home-long.png`、`home-long-mobile.png`、`home-default-mobile.png`（見本だけ：`home-streak-loading.png`、`home-streak-error.png`）
  - 撮り直す画像（`docs/specs/screens/`）：`home-default.png`、`home-empty.png`、`home-many.png`
  - 足す画像（`docs/specs/screens/`）：`home-default-mobile.png`、`home-streak-pending.png`、`home-no-streak.png`、`home-long.png`、`home-long-mobile.png`
