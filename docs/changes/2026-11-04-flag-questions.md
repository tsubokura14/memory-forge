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
- `docs/specs/import.md`：取り込む前の確認（印の付いた問題が置き換わるとき）、取り込んだあと（印と記録のリセット）
- `docs/specs/manage.md`：印の付いた問題の一覧、unflag、export flagged（→「決まっていないこと」の1つ目）

## 使う場面

1. Python の Decorators を10問解いている人が、4問目で正解の選択肢がおかしいと気づき、答える前に flag を押す。4問目は記録されずに5問目に進み、上に「flagged — moved on without recording」と出る。解き終わりの結果では、flagged · not counted が 1 になり、得点は 9 問のうちの数になる
2. 同じ人が、別の問題で答えて解説を読んでから、解説が誤っていると気づき flag を押す。ボタンがその場で flagged に変わり、答えた記録は残る。次に Setup で Decorators を選ぶと、印の付いた2問を除いた数で start する
3. 週末に Manage で Python の flagged を開くと、印の付いた2問だけが並ぶ。export flagged · Python で書き出して直し、取り込み直すと、取り込む前の確認で2問に「flag and records reset」と出る。import all のあと、2問は印が消え、記録のない問題として出題される

## 受け入れ条件

### Solve

- 答える前・答えたあとのどちらでも、flag を押せる
- 答える前に flag を押すと、答えずに次の問題に進み、その問題は記録しない。上に「flagged — moved on without recording」の知らせを出す
- 答えたあとに flag を押すと、その場でボタンが flagged に変わる。答えた記録は残る
- 印を付けた問題は、ほかの解く回でも出題しない

### Setup

- 出せる問題の数・start の数・「〜 has only 8 questions to ask.」は、印の付いた問題を除いて数える
- 選んだ Topic（All なら Subject）の問題に全部印が付いていると、start を押せない

### Result

- flagged · not counted に、この回で印を付けた問題の数を出す
- 数える問題が0問のときは、円を線だけにし、% と得点を muted の「—」、得点の下を「no questions counted」にする。by topic の一覧は出さない

### Manage

- Subject ごとに、印の付いた問題だけの一覧を見られる
- unflag で、その場で印が外れる。外しても記録は変わらない
- export flagged · <Subject の名前> で、印の付いた問題を書き出す

### Import

- 取り込む前の確認で、印の付いた問題が置き換わるときは「flag and records reset」と出す
- 取り込むと、置き換わった印の付いた問題は、印が消え、その問題の記録も消える

## 画面

- Solve：flag のボタン、答えたあとの flagged、答える前の flag のあとの知らせ
- Setup：全部に印が付いているときの表示
- Result：数える問題が0問のとき（`docs/ui.md` の「解き終わりの結果」に決まりがある）
- Manage：印の付いた問題の一覧（行は warning-soft の地、flag の印と unflag。`docs/ui.md` にある）、0件のとき
- Import：取り込む前の確認の「flag and records reset」

状態ごとの表示とスクリーンショットは、`/dev-proto` で合わせて足す。

## やらないこと

- アプリの画面で問題を書き換えない（直すときはファイルを書き出して直し、取り込み直す。`docs/overview.md` の「やらないこと」）
- Solve の中で印を外さない（外すのは Manage の一覧から）
- 印を付けた理由（どこが誤りか）のメモは残さない

## 決まっていないこと

- [x] Manage の一覧・書き出しは、まだない #11（一覧・書き出し・削除）で作る。#12 をどう進める？ 案：(a) #11 を先に作り、そのあと #12 を全部作る (b) #12 は Solve・Setup・Result・Import だけにし、Manage の flagged・unflag・export flagged は #11 のあと（#11 に含めるか、別の Issue） → (a)。#11 を先に作り、#12 は Manage の flagged・unflag・export flagged も含めて全部作る
- [ ] 答える前の flag の知らせは、いつ消える？（次の操作まで／数秒で）。最後の問題で答える前に flag したら、Result に移り、知らせは出さない？
- [ ] 答える前に flag した問題は、Solve の上の数（正解・不正解）と番号・線をどう進める？ 案：正解・不正解の数は増やさず、番号と線は進める
- [ ] 答えたあとに flag した問題は、Result の得点・正答率・correct / incorrect / skipped・by topic に数える？ 「flagged · not counted」「全部に印を付けて数える問題がないとき」からは、数えない（答える前でも答えたあとでも、印の付いた問題は全部 not counted）と読める
- [ ] 印を付けるのに失敗したとき（つながらない）の表示と文言は？ 案：答えの保存と同じ danger の帯「Couldn't flag this question.」と retry
- [ ] Setup で全部に印が付いているときの文言は？ 案：warning の文字で「No questions to ask — all in Decorators are flagged.」（lowest accuracy の案内に合わせる）。lowest accuracy で、解いた問題が全部印付きのときも同じ？
- [ ] Setup の Topic の行に、印の付いた問題の数を出す？（出さない案）
- [ ] 印の付いた問題が、取り込み直して「変わらない」（中身が同じ）だったときは、印と記録はそのまま？
- [ ] 取り込む前の確認の「flag and records reset」は、どこに出す？ 案：置き換わる問題の行の右に、warning の文字で
- [ ] Manage の flagged の一覧が0件のときの文言は？ 案：点線の枠で「No flagged questions in Python.」

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
