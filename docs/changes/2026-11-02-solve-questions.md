# Subject と Topic を選んで問題を解ける（#6）

## なぜ

このアプリの中心の機能。取り込んだ問題を、Topic・順番・問題数を選んで解き、1問ごとに答え合わせと解説で確かめられるようにする。
`docs/overview.md` のとおり、正答率が低い順に出題するために、答えた記録は最初の版から残す。

## 影響する今の仕様

- `docs/specs/home.md`：Home に Subject の一覧が加わる（今は、Subject が1つ以上あると「subjects」を出さない）
- 新規：`docs/specs/solve.md`（Setup と Solve）
- `docs/specs/app-bar.md`：Solve の上のバーは、ほかの画面と違う（quit と進み具合）

## 使う場面

1. Subject「Python」（Topic「Decorators」12問、「Generators」8問）を取り込んだ自分が、Home の「Python」を押す。Setup で「Decorators」・正答率が低い順・10問を選んで start を押すと、Solve に1問目が出る
2. 単一選択の問題で、選択肢 C を選んで submit を押すと、同じ画面で正解・不正解が出る。explanation で解説に切り替え、next で次の問題に進む。上のバーの正解・不正解の数と、何問目かが進む
3. 5問目で quit を押すと、確かめのダイアログが出る。quit を押すと Setup に戻り、4問目までに答えた記録は残る

## 受け入れ条件

### Home の Subject の一覧

- 「menu」を上に、「subjects」をその下に置く（今の「subjects」が上の並びから入れ替わる）
- Subject が1つ以上あると、「subjects」の見出しの下に Subject を取り込んだ順に並べる。押すと、その Subject の Setup に移る
- Subject が0件のときは、今までどおり Import への入り口を出す
- Subject を読み込めなかったときは、エラーと retry を出す

### Setup

- Subject の中の Topic を1つ選ぶか、全部の Topic（All）を選ぶ。Topic は、その Topic の問題が最初に出てくる順に並べる
- 出題の順番を、in order・random・lowest accuracy から選ぶ
  - in order：取り込んだ順（最初の取り込みではファイルの順。取り込み直して増えた問題は最後）
  - random：start を押すたびにランダムに並べる
  - lowest accuracy：正答率が低い順（下の「記録」）
- 問題数を、all・5・10・20 から選ぶ
- 最初は、All・in order・10 を選んでいる
- start には、出す問題の数を添える（start · 10 など）。押すと、選んだ問題で Solve が始まる
- 選んだ問題数より出せる問題が少ないときは、そのことを出す。All を選んでいるときは、Topic の名前の代わりに Subject の名前で出す
- start を押して問題を読めなかったときは、Setup のまま、エラーと retry を出す
- Solve から Setup に戻ったとき（quit・results・最後の問題の skip）は、直前に選んでいた Topic・順番・問題数のまま
- back で Home に戻る
- ない Subject の Setup を開くと、見つからないことを出す

### Solve

- 1問ずつ出す。単一選択は1つだけ、複数選択は当てはまるものをすべて選んで submit で答える
- 問題の上に、単一か複数か・Topic・問題の ID を出す
- 選択肢を1つも選んでいない間は、submit を押せず、選ぶよう案内する
- submit すると、同じ画面で正解・不正解を出す。不正解のときは正解の記号も出す。複数選択は、全部合っていたときだけ正解（部分点なし）
- 答えを保存できなかったときは、エラーと retry を出す
- 答えたあとは、explanation と question のボタンで、解説と問題を切り替える
- next で次の問題に進む。最後の問題では、next の代わりに results を出し、押すと Setup に戻る（Result の画面は #8 で作る）
- skip で、答えずに次の問題に進む。スキップした問題は、不正解として記録する。最後の問題の skip は、results と同じく Setup に戻る
- 上のバーに、ここまでの正解の数・不正解の数（スキップを含む）・今の問題の番号（4/10 など）と、答えた割合の線を出す
- quit を押すと確かめのダイアログを出す。continue でそのまま続け、quit で Setup に戻る。やめるまでに答えた分の記録は残る

### 記録

- 答えるたびに（submit とスキップ）、その問題の正解・不正解を記録する
- 「正答率が低い順」は、問題ごとの正答率（全部の回答のうち正解の割合）で並べる
  - まだ一度も解いていない問題は出さない（復習に使うため）
  - 選んだ Topic に、一度でも解いた問題が1つもないときは、start を押せず（start · 0）、その理由を出す
  - 正答率が同じ問題は、その中でランダムに並べる
- 選んだ問題数が、出せる問題の数より多いときは、ある分だけ出す
- 選択肢は、ファイルの順のまま出す
- 解いている途中でページを読み込み直したり閉じたりすると、続きからは解けない。Setup からやり直す。それまでに答えた分の記録は残る

### ログイン

- Setup と Solve は、ログインしていないと見られない（`docs/specs/sign-in.md`）

## 画面

合意したプロトタイプのスクリーンショットは、あとの Issue で足すもの（連続日数 #10、身についている具合の線と % #9、不備の印 #12、コードの色分け #7、Result #8、settings）を隠して撮った。
画像は `docs/changes/2026-11-02-solve-questions/` に置く（PC の幅、ライトモード）。

### Home

- 上から「menu」（manage の枠。2列の枠の左の1枚の大きさ）、「subjects」の順に並べる
- Subject の行：名前と、右に chevron_right の印。枠で囲んだ行を、区切り線で並べる
- 読み込み中：Subject の行と同じ形の枠を4つ、点滅させる
- 読み込めなかった：danger の帯「Couldn't load subjects.」と retry

| 状態 | 表示 | スクリーンショット |
| --- | --- | --- |
| Subject が1つ以上 | menu の manage、subjects の Subject の行 | ![](2026-11-02-solve-questions/home-default.png) |
| Subject が多い | Subject の行が続く | ![](2026-11-02-solve-questions/home-many.png) |
| Subject が0件 | menu の manage、subjects の点線の枠と import | ![](2026-11-02-solve-questions/home-empty.png) |
| 読み込み中 | subjects に点滅する枠 | ![](2026-11-02-solve-questions/home-loading.png) |
| エラー | subjects に danger の帯と retry | ![](2026-11-02-solve-questions/home-error.png) |

### Setup

- 上から、戻るリンク（back）、primary の等幅の小さな「study setup」、Subject の名前（見出し）
- 「topic」：丸の付いた行で、Topic の名前を並べ、最後に太字の「All」。選んでいる行は primary-soft の地
- 「order」「questions」：横に並べたボタン（`docs/ui.md` の「選ぶもの」）
- その下に案内（muted の等幅の小さな文字）と、幅いっぱいの start
  - 問題が足りない：「Decorators has only 8 questions to ask.」
  - lowest accuracy で、解いた問題がない：warning の文字で「No questions to ask — none in Typing have been answered yet.」。start は薄くして押せない（start · 0）
  - All を選んでいるときは、Topic の名前の代わりに Subject の名前（「Python has only 8 questions to ask.」など）
- start を押して問題を読めなかった：start の上に、danger の帯「Couldn't load questions.」と retry（プロトタイプにない状態。スクリーンショットは付けない）
- 読み込み中：Topic の行の形の枠を6つ、点滅させる
- 読み込めなかった：danger の帯「Couldn't load this subject.」と retry

| 状態 | 表示 | スクリーンショット |
| --- | --- | --- |
| 通常 | All・in order・10 を選んでいる | ![](2026-11-02-solve-questions/setup-default.png) |
| 問題が足りない | 案内と、ある分の数の start | ![](2026-11-02-solve-questions/setup-few.png) |
| 解いた問題がない（lowest accuracy） | warning の案内と、押せない start · 0 | ![](2026-11-02-solve-questions/setup-unanswered.png) |
| Topic が多い | Topic の行が続く | ![](2026-11-02-solve-questions/setup-many.png) |
| 読み込み中 | 点滅する枠 | ![](2026-11-02-solve-questions/setup-loading.png) |
| エラー | danger の帯と retry | ![](2026-11-02-solve-questions/setup-error.png) |

### Solve

- 上のバー：左に quit（arrow_back の印）、右に正解の数・不正解の数・今の問題の番号、下の端に答えた割合の線（`docs/ui.md` の「進み具合」）
- 問題の上の行：枠で囲んだ「single」か「multi」、Topic の名前、問題の ID（muted の等幅の小さな文字）
- 問題文の下に、行番号つきのコードブロック（問題にコードがあるとき）
- 下に固定した操作
  - 答える前：skip（枠だけ）と submit。何も選んでいない間は、上に「select an option to proceed」を出し、submit を薄くして押せない
  - 答えたあと：explanation / question の切り替え（枠だけ）と next（最後の問題は results。どちらも arrow_forward の印）
- 結果の帯：正解は success の「correct」、不正解は danger の「incorrect — answer: B」（複数選択は「A, B」）
- 解説：枠の中に、muted の等幅の小さな「explanation」の見出しと、解説の文
- 答えを保存できなかった：選択肢の下に、danger の帯「Couldn't save your answer.」と retry
- 読み込み中：問題文・コード・選択肢の形の枠を点滅させる
- quit の確かめ：ダイアログ「Quit this session?」「Answers so far are kept.」と、continue（枠だけ）と quit（primary）

| 状態 | 表示 | スクリーンショット |
| --- | --- | --- |
| 答える前（単一選択） | choose one と丸い記号の選択肢 | ![](2026-11-02-solve-questions/solve-question.png) |
| 答えたあと（問題） | 答え合わせの色、結果の帯、explanation と next | ![](2026-11-02-solve-questions/solve-answered.png) |
| 答えたあと（解説） | 解説と、question と next | ![](2026-11-02-solve-questions/solve-explanation.png) |
| 答える前（複数選択） | select all that apply と四角い記号の選択肢 | ![](2026-11-02-solve-questions/solve-multiple.png) |
| 答えたあと（複数選択） | 選ばなかった正解に missed | ![](2026-11-02-solve-questions/solve-answered-multiple.png) |
| 答える前（選択肢がコード） | 選択肢の中にコードブロック | ![](2026-11-02-solve-questions/solve-code-choices.png) |
| 答えたあと（選択肢がコード） | 答え合わせの色 | ![](2026-11-02-solve-questions/solve-answered-code-choices.png) |
| 最後の問題 | next の代わりに results | ![](2026-11-02-solve-questions/solve-last.png) |
| 問題が多い | 37/100 など | ![](2026-11-02-solve-questions/solve-many.png) |
| 読み込み中 | 点滅する枠 | ![](2026-11-02-solve-questions/solve-loading.png) |
| 保存のエラー | danger の帯と retry | ![](2026-11-02-solve-questions/solve-error.png) |
| quit の確かめ | ダイアログ（continue と quit） | ![](2026-11-02-solve-questions/solve-quit.png) |

## やらないこと

- Result の画面（#8）。最後の問題の results は、#6 では Setup に戻す
- 身についている具合（Home の Subject と Setup の Topic の線と %）（#9）
- コードの色付け（#7）
- 不備の印（#12）
- 連続日数（#10）
- 復習・間隔をあけた出題（`docs/overview.md` の「あとで作る機能」）
- 複数選択の部分点（`docs/overview.md` の「やらないこと」）

## 決まっていないこと

- [x] 最後の問題の results は、#6 ではどこに移る？ → Setup に戻す。Result に移すのは #8 で足す（`/dev-triage` で決めた）
- [x] 記録は #6 で保存する？ 「正答率が低い順」も #6 で作る？ → どちらも #6 で作る（`/dev-triage` で決めた）
- [x] 身についている具合（線と %）は？ → #9 で作る（`/dev-triage` で決めた）
- [x] 選んだ問題数が、Topic の問題数より多いときは、ある分だけ出す？ → ある分だけ出す
- [x] 「正答率が低い順」で、まだ一度も解いていない問題は、先に出す？ 後に出す？ 正答率が同じ問題の並びは？ → まだ一度も解いていない問題は出さない（正答率が低い順は、復習に使うため）。正答率が同じ問題は、その中でランダム
- [x] 選択肢の並びは、ファイルの順のまま？ 毎回入れ替える？ → ファイルの順のまま（A・B・C の記号が、ファイルや解説の文と合うように）
- [x] 解いている途中でページを読み込み直したり、閉じたりしたら？ → Setup からやり直す。答えた分の記録は残る
- [x] 「正答率が低い順」で、選んだ Topic に一度でも解いた問題が1つもないときは？ → start を押せない表示にし、理由を短く出す。見た目と文言は、プロトタイプにこの状態があれば合わせ、なければ `/dev-proto` で決める

- [x] Home の並びは？ → プロトタイプに合わせ、menu を上、subjects を下にする。manage はプロトタイプの2列の枠の大きさのまま、左に1枚だけ置く（`/dev-proto` で決めた）
- [x] lowest accuracy で、解いた問題がない Topic を選んだときの見た目と文言は？ → 印が全部付いているときと同じ見せ方で、warning の「No questions to ask — none in <Topic> have been answered yet.」と、押せない start · 0（`/dev-proto` で決めた）
- [x] in order と random の並びは？ → in order はファイルの順、random は start のたびにランダム（`/dev-proto` で決めた）

- [x] in order の「ファイルの順」は、取り込み直して問題が増えたときは？ → 取り込んだ順にする。最初の取り込みではファイルの順で、取り込み直して増えた問題は最後に並ぶ（`/dev-plan` で決めた）
- [x] Home の Subject と Setup の Topic の並びは？ → Subject は取り込んだ順、Topic はその Topic の問題が最初に出てくる順（`/dev-plan` で決めた）
- [x] 最後の問題で skip を押したら？ → results と同じく Setup に戻る（`/dev-plan` で決めた）
- [x] Solve から Setup に戻ったときの選び方は？ → 直前の Topic・順番・問題数のまま。読み込み直したときは最初の選び方（`/dev-plan` で決めた）
- [x] start を押して問題を読めなかったら？ → Setup のまま、start の上に danger の帯「Couldn't load questions.」と retry（`/dev-plan` で決めた）
- [x] 問題が足りないときなどの案内で、All を選んでいるときは？ → Topic の名前の代わりに Subject の名前。ない Subject の Setup は、見つからない画面を出す（`/dev-plan` で決めた）

画面に見えるもの（選べる順番と問題数、Home の Subject の行と Setup の Topic の行に出すもの、押せない表示、文言）は、合意済みのプロトタイプ（Home・Setup・Solve は作成済み）に合わせる。`/dev-proto` でプロトタイプから写し、仕様と食い違うところだけを聞く。

## 調べたこと

<!-- 作り方がわからず先に調べたときだけ書く -->

---

## 設計

### データの変更

新しい表 `answers`（答えた記録）。答えるたびに（submit とスキップ）1行足す。

| 列 | 型 | 中身 |
| --- | --- | --- |
| `id` | integer（自動の番号） | |
| `question_id` | integer | `questions.id`。問題を消すと、記録も一緒に消える（`onDelete: "cascade"`） |
| `correct` | boolean | 正解か。スキップは false |
| `answered_at` | timestamptz | 答えた日時（既定は今） |

- `question_id` に索引を付ける（問題ごとに数えるため）
- 取り込み直しは、同じ問題の行を書き換える（`onConflictDoUpdate`）ので、`questions.id` は変わらず、記録は残る
- 選んだやり方：答えるたびに1行足す表
  - 比べた案：`questions` に「正解の数」「答えた数」の列を足す。簡単で読むのも速いが、最後の答え（#9 の身についている具合）と答えた日（#10 の連続日数）がわからず、作り直すことになるので選ばなかった
  - 行は増え続けるが、使う人はひとりなので、数万行ほどで済む
- 残す場所：`docs/design.md` の「データ」に、`answers` の持ち方と、正答率・最後の答え・答えた日をこの表から数えることを書く（T1）

### 決まり（`src/server/`）

データベースを使わない決まりと、読み書きを分ける（`docs/design.md` の「全体の構成」）。

- `src/server/solve/pick.ts`（データベースを使わない。Setup の画面からも読む）
  - `Order = "in-order" | "random" | "lowest-accuracy"`、`Count = "all" | 5 | 10 | 20`、Topic の All は `null`
  - `pickQuestions(candidates, order, count, random = Math.random)`：出す問題を選んで並べる
    - `candidates` は `{ id, correctCount, answerCount }` の並び（`id` は `questions.id`）
    - in order は `id` の順（取り込んだ順）、random は全部を混ぜる
    - lowest accuracy は、一度も解いていない問題を除き、正答率（`correctCount / answerCount`）の低い順。同じ正答率の中は混ぜる
    - そのあと、問題数で切る（all は切らない）
    - テストで並びを決められるように、乱数を引数で渡せるようにする
  - `startNotice(stats, order, count)`：start に添える数と案内の種類を返す
    - 返すもの：`{ count, notice: "none" | "few" | "unanswered" }`
    - `stats` は、選んだ Topic（All なら全部）の `{ total, answered }`
    - 出せる数は、lowest accuracy なら `answered`、ほかは `total`。出せる数が0で lowest accuracy なら `unanswered`、出せる数が選んだ問題数より少なければ `few`
    - 文言（Topic の名前か Subject の名前か）は画面で決める
- `src/server/solve/grade.ts`（データベースを使わない）
  - `gradeAnswer(correct, selected)`：選んだ記号の集まりが正解とちょうど同じなら正解（部分点なし。並びは問わない）
- `src/server/solve/setup.ts`
  - `getSetup(subjectId)`：Subject の名前と、Topic ごとの `{ name, total, answered }` を返す。ない Subject は `null`
    - Topic の並びは、その Topic の問題の `questions.id` のいちばん小さいものの順。SQL の `group by topic` で数える
- `src/server/solve/start.ts`
  - `startSession(subjectId, topic, order, count)`：問題と、問題ごとの記録の数（`answers` を `left join` して `group by`）を読み、`pickQuestions` で選ぶ
  - 返すもの：選んだ問題の `{ id, questionId, topic, type, text, choices }`。正解と解説は返さない（答え合わせのあとに返す）
- `src/server/solve/answer.ts`
  - `answerQuestion(id, selected)`：問題を読み、`gradeAnswer` で確かめ、`answers` に1行足す。返すもの：`{ correct, answer, explanation }`
  - `skipQuestion(id)`：`correct = false` で1行足す
  - 問題が消えていたら失敗にする（画面で「Couldn't save your answer.」）
- `src/server/subjects/subjects.ts`
  - `listSubjects()`：`{ id, name }` を `subjects.id` の順（取り込んだ順）に返す
  - Home が使わなくなる `hasSubjects` は消す
- `src/server/questions/markup.ts`（データベースを使わない。画面の部品から読む）
  - `parseMarkup(text)`：問題文・選択肢・解説の文字を、段落（中に `` ` `` で囲んだ文の中のコードを持つ）と、コードブロック（```` ``` ```` で囲んだもの）の並びに分ける
  - ```` ``` ```` のあとの言語の名前は、#7（色付け）で使うまで読み捨てる
  - 閉じていないコードブロックは、取り込みで止めているので来ない
- `src/server/auth/session.ts`
  - `requireSession()`：今 `src/app/(app)/manage/import/actions.ts` にあるものを移し、Import と Solve のアクションの両方から使う
  - 残す場所：`docs/design.md` の「ログインの確かめ」に、アクションは `requireSession()` で確かめることを書く（T4）

答え合わせはサーバーでする（submit で選んだ記号を送り、正解か・正解の記号・解説を受け取る）。

- 理由：答え合わせと記録を1回の操作にし、記録できなかったら正解・不正解を出さずに retry を出せるため。正解をブラウザに先に送らずに済み、答え合わせの決まりを1か所に置ける
- 比べた案：正解を問題と一緒に送り、画面で答え合わせする。決まりが画面とサーバーの2か所になるので選ばなかった
- 残す場所：`answer.ts` のコメント

### 画面

Setup と Solve は、1つの画面（`/subjects/[id]`）の中で切り替える。

- start を押すと、`startSession` のアクションで問題を受け取り、ブラウザの中の状態だけで Solve に切り替える。今の問題・ここまでの数などはブラウザにだけ持つので、読み込み直すと Setup の最初の選び方に戻る（仕様の「記録」）
- 比べた案：Solve を別の URL にし、Topic・順番・問題数を URL に入れる。読み込み直すと同じ選び方で解き直しになり、random の並びも変わって仕様と合わないので選ばなかった
- 上のバーが Setup（今のバー）と Solve（quit と進み具合）で違うので、`src/app/(app)/` の外の `src/app/subjects/[id]/` に置き、バーは画面の中で出し分ける
- 残す場所：`docs/design.md` の「全体の構成」に `subjects/[id]/` を足し、Solve の状態をブラウザにだけ持つことと、その理由を書く（T3）

変えるファイル

- `src/app/subjects/[id]/page.tsx`：`<Suspense>` の中で `getSetup` を読み、`study.tsx` に渡す。ない Subject は `notFound()`
- `src/app/subjects/[id]/actions.ts`：`startSessionAction`・`answerAction`・`skipAction`。どれも `requireSession()` で確かめる
- `src/app/subjects/[id]/study.tsx`（ブラウザで動く）：Setup と Solve の切り替えと、選び方・解いている状態を持つ
- `src/app/subjects/[id]/setup-form.tsx`・`solve-view.tsx`：Setup と Solve の中身
- `src/app/(app)/page.tsx`：menu を上、subjects を下にし、`listSubjects` で Subject の行を並べる
- `src/app/(app)/layout.tsx`：Solve を外に置いたので、コメントを今の作りに合わせる
- 部品（`src/components/`）
  - 今あるものを広げる
    - `banner.tsx`：結果の帯のために success を足す
    - `app-bar.tsx`：Setup でもそのまま使う
  - 新しく作る（どれも `docs/ui.md` にある部品）
    - `retry-button.tsx`：読み込みのエラーの retry。`router.refresh()` で読み直す
    - `segmented.tsx`：「選ぶもの」の横に並べたボタン
    - `radio-list.tsx`：「選ぶもの」の丸の付いた行
    - `solve-bar.tsx`：解く画面の上のバー（quit・数・線）
    - `choice.tsx`：選択肢の行（単一・複数、答え合わせのあとの色、missed）
    - `rich-text.tsx`：`parseMarkup` の結果を出す（問題文のコードには行番号を付け、選択肢のコードには付けない）
    - `code-block.tsx`
    - `dialog.tsx`：quit の確かめ（ブラウザの `<dialog>`。popover の影）
- 読み込み中：Home と Setup は `<Suspense>` の `fallback`。Solve は、start を押してから問題を受け取るまで、画面の中で点滅する枠を出す
- 読み込めなかった（Home・Setup）：読む部品の中で例外を受け止め、danger の帯と `retry-button` を出す（`connection()` は受け止める範囲の外で呼ぶ）

### 画面の画像

本番から撮って `docs/specs/screens/` に置くのは、次の状態。

- Home：default・many・empty
- Setup：default・few・unanswered・many
- Solve：表のすべての状態
  - 読み込み中と保存のエラーは、アクションの返事を `page.route` で止める・失敗させて撮る（Import と同じ）

撮らないもの

- Home と Setup の読み込み中・読み込めなかった状態。サーバーで組み立てる画面で、テスト用のデータベースでは作れない（今の Home の読み込み中も撮っていない）。合意したプロトタイプの画像（このファイルの「画面」）を見本にし、コードを見て確かめる
- 残す場所：`docs/design.md` の「画面の画像を撮る・比べる仕組み」（T6）

### テスト用のデータ

- `e2e/questions.ts` に、記録を入れる `resetQuestions` の引数を足す（問題ごとの正解・不正解の回数）。lowest accuracy と setup-unanswered の状態を作るため

## 確かめ方

### Home の Subject の一覧

| 受け入れ条件 | 確かめ方 |
| --- | --- |
| menu が上、subjects が下 | 触って確かめる（home-default の画像） |
| Subject を取り込んだ順に並べ、押すと Setup に移る | テスト：`listSubjects` の並び（Vitest）、押すと `/subjects/<id>` に移る（`e2e/home.spec.ts`） |
| 0件のときは Import への入り口 | テスト：`e2e/home.spec.ts`（今のテストをそのまま使う） |
| 読み込めなかったときのエラーと retry | コードを見て確かめる：`src/app/(app)/page.tsx` の例外を受け止めるところ |

### Setup

| 受け入れ条件 | 確かめ方 |
| --- | --- |
| Topic を1つか All を選ぶ。Topic の並び | テスト：`getSetup` の Topic の並びと数（Vitest） |
| in order・random の並び | テスト：`pickQuestions`（Vitest） |
| all・5・10・20、問題数で切る | テスト：`pickQuestions` の切り方（all と、出せる数より少ない・多い数）（Vitest） |
| 最初は All・in order・10 | 触って確かめる（setup-default の画像） |
| start に数を添える。足りないときの案内 | テスト：`startNotice`（Vitest）。案内の文言（Topic の名前・Subject の名前）は `e2e/solve.spec.ts` |
| start で Solve が始まる | テスト：`e2e/solve.spec.ts` |
| start で読めなかったときのエラーと retry | テスト：`e2e/solve.spec.ts`（アクションを失敗させる） |
| Setup に戻ったときは直前の選び方のまま | テスト：`e2e/solve.spec.ts`（quit のあと） |
| back で Home | 触って確かめる |
| ない Subject は見つからない | テスト：`e2e/solve.spec.ts` |

### Solve

| 受け入れ条件 | 確かめ方 |
| --- | --- |
| 単一は1つ、複数はいくつでも選んで submit | テスト：`e2e/solve.spec.ts`（単一で選び直すと前の選択が外れる、複数は2つ選べる） |
| 単一か複数か・Topic・ID | 触って確かめる（画像） |
| 選んでいない間は submit を押せず案内 | テスト：`e2e/solve.spec.ts` |
| 正解・不正解、正解の記号、部分点なし | テスト：`gradeAnswer`（Vitest）。帯の文言（correct、incorrect — answer: A, B）は `e2e/solve.spec.ts` |
| 保存できなかったときのエラーと retry | テスト：`e2e/solve.spec.ts`（アクションを失敗させ、retry で通る） |
| explanation と question の切り替え | テスト：`e2e/solve.spec.ts` |
| next、最後は results で Setup に戻る | テスト：`e2e/solve.spec.ts` |
| skip で次へ、不正解として記録、最後の skip は Setup | テスト：`skipQuestion` の記録（Vitest）、最後の skip で Setup に戻る（`e2e/solve.spec.ts`） |
| 上のバーの数・番号・線 | テスト：数と番号が答えるたびに進む（`e2e/solve.spec.ts`）。線は触って確かめる |
| quit のダイアログ、continue と quit | テスト：`e2e/solve.spec.ts` |
| 問題文・選択肢・解説のコード | テスト：`parseMarkup`（Vitest）。見た目は触って確かめる（solve-code-choices の画像） |

### 記録

| 受け入れ条件 | 確かめ方 |
| --- | --- |
| 答えるたびに正解・不正解を記録 | テスト：`answerQuestion`・`skipQuestion` で `answers` に入る（Vitest） |
| 正答率が低い順。解いていない問題は出さない。同じ正答率は混ぜる | テスト：`pickQuestions`（Vitest。乱数を渡して並びを決める）、記録から正答率を数える（`startSession` の Vitest） |
| 解いた問題がないと start を押せない | テスト：`startNotice`（Vitest）。押せないことは `e2e/solve.spec.ts` |
| 出せる数より多いときはある分だけ | テスト：`pickQuestions`（Vitest） |
| 選択肢はファイルの順 | コードを見て確かめる：`startSession` が `choices` を並べ替えずに返す |
| 読み込み直すと Setup から。記録は残る | 触って確かめる |

### ログイン

| 受け入れ条件 | 確かめ方 |
| --- | --- |
| Setup と Solve はログインしていないと見られない | コードを見て確かめる：`src/proxy.ts` の対象に `/subjects/` が入っていること（今の決まりのまま）と、アクションが `requireSession()` を呼ぶこと |

## タスク

- [ ] T1：`answers` の表を足し、答え合わせと記録（`gradeAnswer`・`answerQuestion`・`skipQuestion`）ができたら完了。画面は変えない
- [ ] T2：Setup の数と出題の決まり（`getSetup`・`pickQuestions`・`startNotice`・`startSession`）ができたら完了。画面は変えない
- [ ] T3：`/subjects/[id]` に Setup が出て、Topic・順番・問題数を選べたら完了。start はまだ Solve につながない（Home からはまだ入れない）
  - 合わせる画像：setup-default・setup-few・setup-unanswered・setup-many（setup-loading・setup-error は見本）
- [ ] T4：start で Solve が始まり、答える・解説を見る・next・skip・results で Setup に戻るまでができたら完了。start で読めなかったときの帯も
  - 合わせる画像：solve-question・solve-answered・solve-explanation・solve-multiple・solve-answered-multiple・solve-code-choices・solve-answered-code-choices・solve-last・solve-many・solve-loading
- [ ] T5：保存できなかったときの帯と retry、quit のダイアログができたら完了
  - 合わせる画像：solve-error・solve-quit
- [ ] T6：Home の menu と subjects を入れ替え、Subject の一覧から Setup に入れたら完了
  - 合わせる画像：home-default・home-many・home-empty（home-loading・home-error は見本）
