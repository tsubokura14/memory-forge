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
- Subject が1つ以上あると、「subjects」の見出しの下に Subject を並べる。押すと、その Subject の Setup に移る
- Subject が0件のときは、今までどおり Import への入り口を出す
- Subject を読み込めなかったときは、エラーと retry を出す

### Setup

- Subject の中の Topic を1つ選ぶか、全部の Topic（All）を選ぶ
- 出題の順番を、in order・random・lowest accuracy から選ぶ
  - in order：ファイルの順
  - random：start を押すたびにランダムに並べる
  - lowest accuracy：正答率が低い順（下の「記録」）
- 問題数を、all・5・10・20 から選ぶ
- 最初は、All・in order・10 を選んでいる
- start には、出す問題の数を添える（start · 10 など）。押すと、選んだ問題で Solve が始まる
- 選んだ問題数より出せる問題が少ないときは、そのことを出す
- back で Home に戻る

### Solve

- 1問ずつ出す。単一選択は1つだけ、複数選択は当てはまるものをすべて選んで submit で答える
- 問題の上に、単一か複数か・Topic・問題の ID を出す
- 選択肢を1つも選んでいない間は、submit を押せず、選ぶよう案内する
- submit すると、同じ画面で正解・不正解を出す。不正解のときは正解の記号も出す。複数選択は、全部合っていたときだけ正解（部分点なし）
- 答えを保存できなかったときは、エラーと retry を出す
- 答えたあとは、explanation と question のボタンで、解説と問題を切り替える
- next で次の問題に進む。最後の問題では、next の代わりに results を出し、押すと Setup に戻る（Result の画面は #8 で作る）
- skip で、答えずに次の問題に進む。スキップした問題は、不正解として記録する
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

画面に見えるもの（選べる順番と問題数、Home の Subject の行と Setup の Topic の行に出すもの、押せない表示、文言）は、合意済みのプロトタイプ（Home・Setup・Solve は作成済み）に合わせる。`/dev-proto` でプロトタイプから写し、仕様と食い違うところだけを聞く。

## 調べたこと

<!-- 作り方がわからず先に調べたときだけ書く -->
