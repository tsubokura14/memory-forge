<!--
変更の仕様のひな形。コピーして docs/changes/<年-月-日>-<何をするか>.md を作る（例：2026-09-17-add-due-date.md）。
「なぜ」〜「調べたこと」は、AIが下書きし、人間が答えて決める（手順5）。「画面」のスクリーンショットは、プロトタイプで合意したときに足す（手順6）。
「設計」以降はAIが下書きし、人間がレビューする（手順7）。
スクリーンショットは、このファイルと同じ名前のフォルダに置く（例：2026-09-17-add-due-date/list-empty.png）。
-->

# 誤りのある問題に印を付けて、あとで直せる（#12）

## なぜ

解いていて、問題文・選択肢・正解・解説に誤りがありそうだと気づいても、今はその場で残す方法がない。誤った問題がそのまま出題され続け、誤った問題で付いた記録で正答率もずれる。
気づいた問題に印を付けて出題から外し、あとで Subject ごとにまとめて書き出して直し、取り込み直せるようにする。

## 影響する今の仕様

- `docs/specs/solve.md`
  - Setup：出せる問題の数と start（印の付いた問題を除く）
  - Solve：flag のボタン、答える前・答えたあとの flag、進み具合の数
  - Result：flagged · not counted の数（今は いつも 0）、数える問題が0問のときの表示
  - 記録：答える前に印を付けた問題は記録しない
- `docs/specs/home.md`：Subject の今の身についている具合（印の付いた問題を除く）
- `docs/specs/import.md`：取り込む前の確認（印の付いた問題が置き換わるとき）、取り込んだあと（印と記録のリセット）
- `docs/specs/manage.md`：印の付いた問題の一覧、unflag、export flagged（→「決まっていないこと」の1つ目）

## 使う場面

1. Python の Decorators を10問解いている人が、4問目で正解の選択肢がおかしいと気づき、答える前に flag を押す。4問目は記録されずに5問目に進み、上に「flagged — moved on without recording」と出る。解き終わりの結果では、flagged · not counted が 1 になり、得点は 9 問のうちの数になる
2. 同じ人が、別の問題で答えて解説を読んでから、解説が誤っていると気づき flag を押す。ボタンがその場で flagged に変わり、答えた記録は残る。次に Setup で Decorators を選ぶと、印の付いた2問を除いた数で start する
3. 週末に Manage で Python の flagged を開くと、印の付いた2問だけが並ぶ。export flagged · Python で書き出して直し、取り込み直すと、取り込む前の確認で2問に「flag and records reset」と出る。import all のあと、2問は印が消え、記録のない問題として出題される

## 受け入れ条件

### Solve

- 問題の上の行の右に、flag のボタンを出す。答える前・答えたあとのどちらでも押せる
- 答える前に flag を押すと、答えずに次の問題に進み、その問題は記録しない。上に「k3f9a2 flagged — moved on without recording.」（印を付けた問題の ID）の知らせを出す
  - 知らせは、次の操作（選ぶ・submit・skip・flag）まで出す
  - 最後の問題で答える前に flag を押すと、Result に移る（知らせは出さない）
  - 正解・不正解の数は増やさず、問題の番号と線は進める
- 答えたあとに flag を押すと、その場でボタンが flagged に変わる。答えた記録は残る。Solve の中では印を外せない
- 印を付けた問題は、ほかの解く回でも出題しない
- 印を付けられなかったときは、答えの保存と同じ danger の帯「Couldn't flag this question.」と retry を出す。答える前の flag なら、次の問題に進まない

### Setup

- 出せる問題の数・start の数・「〜 has only 8 questions to ask.」は、印の付いた問題を除いて数える
- Topic の行（All を含む）の数の並びの終わりに、印の付いた問題があれば、warning の flag の印と数を出す
- 選んだ Topic（All なら Subject）に印の付いた問題があり、出せる問題が1問以上あるときは、start の上に「⚑1 flagged excluded」（印と数は warning）を出す
- 選んだ Topic（All なら Subject）の問題に全部印が付いていると、どの順番でも、warning の文字で「No questions to ask — all 8 in Typing are flagged.」（問題の数と Topic の名前。All なら Subject の名前）と出し、start · 0 を薄くして押せない
  - lowest accuracy で、全部ではないが、印のない解いた問題がないときは、今の「No questions to ask — none in Typing have been answered yet.」

### Home・Setup の今の身についている具合

- Home の Subject と Setup の Topic の線・「30 correct · 10 wrong · 8 new」・% には、印の付いた問題を数えない（全部に印が付いた Topic は「0 correct · 0 wrong · 0 new」と「—」）

### Result

- flagged · not counted に、この回で印を付けた問題の数を出す
- 印を付けた問題は、答える前でも答えたあとでも、得点・正答率・correct / incorrect / skipped・by topic に数えない（答えたあとに付けた問題の記録は残る）
- 数える問題が0問のときは、円を線だけにし、% と得点を muted の「—」、得点の下を「no questions counted」にする。by topic の一覧は出さない

### Manage

- 絞り込みの枠の中、Topic のプルダウン（と delete）の右に、flagged のボタンを置く。押すと、印の付いた問題だけの一覧になり、もう一度押すと戻る。押すと1ページ目に戻る
  - Topic と組み合わせて絞れる（Decorators の印の付いた問題だけ）
  - Topic を変えても、flagged のまま。Subject を変えると、flagged が外れる
  - 読み込み直したときや、ほかの画面から戻ったときは、flagged かどうかも、選んでいた Topic・ページと同じく残る
- flagged の一覧を見ている間は、上の export が「export flagged · Python」になり、Subject の印の付いた問題を全部書き出す（Topic で絞っていても、Subject の全部の印の付いた問題）。ファイルの名前と形は、export <Subject の名前> と同じ
- Subject と Topic のプルダウンの一覧の行に、印の付いた問題があれば、問題数の左に warning の flag の印と数を出す
- 印の付いた問題の行は、flagged の一覧でもふつうの一覧でも、warning-soft の地にし、delete の左に「unflag」（flag の印と warning の文字）を出す
- unflag で、その場で印が外れる。外しても記録は変わらない
  - ふつうの一覧では、行の地が戻り、unflag が消える
  - flagged の一覧では、行がすぐに消える。今のページが空になったら前のページ、全部外したら0件の表示
- flagged の一覧が0件のときは、一覧の場所に点線の枠で「No flagged questions in Python.」を出す（Topic で絞っているときは「No flagged questions in Decorators.」）
  - Subject に印の付いた問題が1問もないときは、export flagged を出さない（Topic で絞って0件でも、Subject のほかの Topic にあれば出す）

### Import

- 取り込む前の確認で、置き換わる問題の見出しを「replaced — records are kept, except for flagged questions」にする
- 印の付いた問題が置き換わるときは、その問題の行の右に、warning の flag の印と文字で「flag and records reset」と出す
- 取り込むと、置き換わった印の付いた問題は、印が消え、その問題の記録も消える
- 印の付いた問題が「変わらない」ときは、印も記録もそのまま

## 画面

- Solve：問題の上の行の右に、flag（muted の等幅の文字だけのボタン。指を乗せると warning の文字と warning-soft の地）。答えたあとに押すと、warning-soft の地と warning の文字の「flagged」。答える前の flag のあとの知らせは、問題の上に warning の枠と warning-soft の地の帯で、flag の印と等幅の文字
- Setup：Topic の行の数の並びの終わりに「· ⚑1」（warning）。start の上に「⚑1 flagged excluded」（muted の等幅の小さな文字、印と数は warning）
- Manage：flagged のボタンは枠だけ（muted の等幅の文字と flag の印）。押している間は warning の枠・warning-soft の地・warning の文字。flagged の一覧の0件は、Subject が0件のときと同じ点線の枠
- 印を付けられなかったときの帯は、答えの保存の失敗（`docs/specs/screens/solve-error.png`）と同じ見た目で、文言だけが違うので、スクリーンショットを付けない

| 画面 | 状態 | 表示 | スクリーンショット |
| --- | --- | --- | --- |
| Setup | 印がある | Decorators と All に「⚑1」、start の上に「⚑1 flagged excluded」 | ![](2026-11-04-flag-questions/setup-default.png) |
| Setup | 全部に印 | Typing を選び、「No questions to ask — all 8 in Typing are flagged.」と start · 0 | ![](2026-11-04-flag-questions/setup-none.png) |
| Solve | 答える前 | 問題の上の行の右に flag | ![](2026-11-04-flag-questions/solve-question.png) |
| Solve | 答えたあとに印 | flagged に変わる | ![](2026-11-04-flag-questions/solve-answered-flagged.png) |
| Solve | 答える前に印 | 次の問題の上に「k3f9a2 flagged — moved on without recording.」 | ![](2026-11-04-flag-questions/solve-flagged.png) |
| Result | 印がある | flagged · not counted が 1 | ![](2026-11-04-flag-questions/result-default.png) |
| Result | 全部に印 | 円を線だけにし、「—」と no questions counted | ![](2026-11-04-flag-questions/result-all-flagged.png) |
| Manage | 通常 | 印の付いた行は warning-soft の地と unflag、右に flagged のボタン | ![](2026-11-04-flag-questions/manage-default.png) |
| Manage | Subject を開く | プルダウンの行に印の数 | ![](2026-11-04-flag-questions/manage-subject-open.png) |
| Manage | Topic を開く | プルダウンの行に印の数 | ![](2026-11-04-flag-questions/manage-topic-open.png) |
| Manage | flagged | 印の付いた問題だけ。export flagged · Python | ![](2026-11-04-flag-questions/manage-flagged.png) |
| Manage | flagged が0件 | 点線の枠「No flagged questions in Python.」。export は出さない | ![](2026-11-04-flag-questions/manage-flagged-empty.png) |
| Import | 取り込む前の確認 | 見出しの「except for flagged questions」と、行の右の「flag and records reset」 | ![](2026-11-04-flag-questions/import-preview.png) |

## やらないこと

- アプリの画面で問題を書き換えない（直すときはファイルを書き出して直し、取り込み直す。`docs/overview.md` の「やらないこと」）
- Solve の中で印を外さない（外すのは Manage の一覧から）
- 印を付けた理由（どこが誤りか）のメモは残さない

## 決まっていないこと

- [x] Manage の一覧・書き出しは、まだない #11（一覧・書き出し・削除）で作る。#12 をどう進める？ 案：(a) #11 を先に作り、そのあと #12 を全部作る (b) #12 は Solve・Setup・Result・Import だけにし、Manage の flagged・unflag・export flagged は #11 のあと（#11 に含めるか、別の Issue） → (a)。#11 を先に作り、#12 は Manage の flagged・unflag・export flagged も含めて全部作る
- [x] 答える前の flag の知らせは、いつ消える？（次の操作まで／数秒で）。最後の問題で答える前に flag したら、Result に移り、知らせは出さない？ → 次の操作（選ぶ・submit・skip・flag）まで出す。最後の問題では Result に移り、知らせは出さない
- [x] 答える前に flag した問題は、Solve の上の数（正解・不正解）と番号・線をどう進める？ 案：正解・不正解の数は増やさず、番号と線は進める → 案のまま
- [x] 答えたあとに flag した問題は、Result の得点・正答率・correct / incorrect / skipped・by topic に数える？ 「flagged · not counted」「全部に印を付けて数える問題がないとき」からは、数えない（答える前でも答えたあとでも、印の付いた問題は全部 not counted）と読める → 数えない（答えた記録は残す）
- [x] 印を付けるのに失敗したとき（つながらない）の表示と文言は？ 案：答えの保存と同じ danger の帯「Couldn't flag this question.」と retry → 案のまま
- [x] Setup で全部に印が付いているときの文言は？ 案：warning の文字で「No questions to ask — all in Decorators are flagged.」（lowest accuracy の案内に合わせる）。lowest accuracy で、解いた問題が全部印付きのときも同じ？ → 案のまま。lowest accuracy のときも同じ
- [x] Setup の Topic の行に、印の付いた問題の数を出す？（出さない案） → 出さない
- [x] 印の付いた問題が、取り込み直して「変わらない」（中身が同じ）だったときは、印と記録はそのまま？ → そのまま
- [x] 取り込む前の確認の「flag and records reset」は、どこに出す？ 案：置き換わる問題の行の右に、warning の文字で → 案のまま
- [x] Manage の flagged の一覧が0件のときの文言は？ 案：点線の枠で「No flagged questions in Python.」 → 案のまま
- [x] Home の Subject と Setup の Topic の今の身についている具合（線・数・%）に、印の付いた問題を数える？ → 数えない
- [x] （`/dev-proto` で）合意済みのプロトタイプは、Setup の Topic の行に印の数を出している（上では「出さない」と答えた） → プロトタイプどおり出す
- [x] （`/dev-proto` で）Manage の flagged の一覧が0件の状態が、プロトタイプにない → プロトタイプに足して撮る
- [x] （`/dev-proto` で）Manage の flagged の絞り込みは、Subject・Topic を変えたとき、読み込み直したときにどうなる？ → Subject を変えると外れ、Topic を変えても残る。読み込み直しても残る
- [x] （`/dev-proto` で）flagged の一覧で unflag を押すと？ → 行がすぐに消える。ページが空になったら前のページ、全部外したら0件の表示
- [x] （`/dev-proto` で）flagged の一覧が0件でも、プロトタイプは export flagged を出している（押すと0問のファイルで、取り込めない） → Subject に印の付いた問題がないときは出さない（プロトタイプも直した）
- [x] （`/dev-proto` で）Topic で絞った flagged の一覧が0件で、Subject のほかの Topic にはあるときは？ → 「No flagged questions in Decorators.」と Topic の名前で出し、export flagged は出す
- [x] （`/dev-proto` で）プロトタイプの Setup は、身についている具合の数に印の付いた問題を入れていた（上では「数えない」と答えた） → プロトタイプの表示用の数を直す（見た目は変えない）
- [x] （`/dev-proto` で）印を付けられなかったときの状態が、プロトタイプにない → 文だけ仕様に残す（スクリーンショットは付けない）
- [x] （`/dev-proto` で）lowest accuracy で、解いた問題は全部印付きだが、印のない解いていない問題があるときは、「all 8 … are flagged」が事実と合わない → 全部に印のときだけ flagged の文言。そうでなければ今の「none … have been answered yet」

## 調べたこと

---

## 設計

<!--
変えるファイル、データの変更、やり方を選んだ理由。
理由と前提には、仕上げたあとに残す場所も書く（そのコードだけに関わるならコメント、複数の場所に関わるなら docs/design.md）。
docs/design.md と食い違う設計になるなら、そのことも書く
-->

## 確かめ方

<!-- 受け入れ条件ごとに「テスト」「触って確かめる」「コードを見て確かめる」のどれか。選び方は docs/process/testing.md -->

-

## タスク

<!-- 1タスク = 1ブランチ = 1PR。「〜ができたら完了」と1文で言える大きさ。データと画面は分ける。画面のタスクには合わせるスクリーンショットを書く -->

- [ ]
