<!--
変更の仕様のひな形。コピーして docs/changes/<年-月-日>-<何をするか>.md を作る（例：2026-09-17-add-due-date.md）。
「なぜ」〜「調べたこと」は、AIが下書きし、人間が答えて決める（手順5）。「画面」のスクリーンショットは、プロトタイプで合意したときに足す（手順6）。
「設計」以降はAIが下書きし、人間がレビューする（手順7）。
スクリーンショットは、このファイルと同じ名前のフォルダに置く（例：2026-09-17-add-due-date/list-empty.png）。
-->

# 問題を一覧で見て、書き出し・削除できる（#11）

## なぜ

今の Manage には import しかなく、取り込んだ問題を見られない。問題を直すための元のファイルを取り出す方法も、要らなくなった問題を消す方法もない。
取り込んだ問題を一覧で確かめ、直すときは Subject ごとに書き出し、要らなくなった問題は Subject・Topic・1問ずつ消せるようにする。

## 影響する今の仕様

- `docs/specs/manage.md`：Manage（今は「問題の一覧・書き出し・削除は、まだない」）
- `docs/specs/import.md`：書き出したファイルを、そのまま取り込み直せること（問題のファイルの形）
- `docs/specs/home.md`・`docs/specs/solve.md`：消した Subject・Topic・問題が、Home の一覧と Setup から消える

## 使う場面

1. Python（480問、Topic が6つ）を取り込んである人が、Manage を開くと、Subject のプルダウンに Python、Topic に All topics が選ばれ、問題が50問ずつ並ぶ。下には「1–50 of 480」とページの番号が出る。Topic で Decorators を選ぶと、Decorators の問題だけになる
2. 同じ人が、Python の問題を直したくなり、export Python を押す。Python の全部の問題が1つのファイルとして保存される。直して Import で取り込み直すと、直した問題だけが「置き換わる」に出る
3. 同じ人が、もう使わない Topic「Typing」を消そうとして、Topic のプルダウンの右の delete を押す。確認のダイアログに、消える問題の数と記録のことと、取り消せないことが出る。delete を押すと Typing が一覧と Setup から消える

## 受け入れ条件

### 一覧

- Subject のプルダウンで Subject を選び、Topic のプルダウンで All topics か Topic を1つ選ぶと、その問題が一覧に並ぶ
- プルダウンの一覧の行には、名前と問題数を出す
- 一覧は50問ずつのページに分ける。「151–200 of 480」と、前後のボタンとページの番号を出す。1ページで収まるときは、前後のボタンと番号を出さない
- 開いたときは、取り込んだ順で最初の Subject と All topics、1ページ目を選んでいる
- Subject を変えると、All topics と1ページ目に戻る
- 読み込み直したときや、ほかの画面から戻ったときは、選んでいた Subject・Topic・ページのまま
- 問題は取り込んだ順に並べる。行には、ID、Topic、問題文の1行目（長いときは「…」で切る）、種類（single / multi）、問題ごとの正答率（75% など）と解いた回数を出す。まだ解いていない問題は「—」
- 行を押しても、問題の中身は開かない
- Subject が0件のときは、点線の枠で「No subjects yet.」「Import a question file to get started.」と import を出す。import で Import に移る
- 読み込めなかったときは、danger の帯「Couldn't load questions.」と retry を出す

### 書き出し

- export <Subject の名前>（例：export Python）で、選んでいる Subject の全部の問題を、1つのファイルに保存する。Topic で絞っていても、Subject の全部を書き出す
- ファイルの名前は、Subject の名前を小文字にし、空白とファイル名に使えない記号を「-」にしたもの（Python → python.json、Web API → web-api.json）
- ファイルには、取り込むファイルと同じ項目だけを入れる（記録は入れない）。問題は取り込んだ順
- 書き出したファイルは、そのまま Import で取り込み直せる。取り込み直すと、全部「変わらない」になる
- 書き出せなかったときは、danger の帯「Couldn't export Python.」を出す

### 削除

- Subject のプルダウンの右の delete で、その Subject を消す。Topic のプルダウンの右の delete で、その Topic を消す（All topics のときは、ボタンを出さない）。問題の行から、その1問を消す
- 消す前に、確認のダイアログを出す。cancel と Esc ではそのまま、delete で消える
  - Subject：「Delete Python?」「480 questions and their records will be deleted. This can't be undone.」
  - Topic：「Delete Typing?」「12 questions and their records will be deleted. This can't be undone.」
  - 1問：「Delete k3f9a2?」「This question and its records will be deleted. This can't be undone.」
- 消した問題の記録も一緒に消える
- 消したものは、一覧・Home・Setup から消える。問題が1つもなくなった Topic と Subject も消える
- 消したあと：Subject を消したら次の Subject（なければ0件の表示）、Topic を消したら All topics、1問を消して今のページが空になったら前のページを出す。消したことの知らせは出さない
- 消せなかったときは、ダイアログの中に「Couldn't delete.」を出し、何も消さない

## 画面

- Manage：Subject と Topic のプルダウン、問題の一覧、ページ、export、delete のボタンと確認のダイアログ
- 状態：通常、Subject が0件、Topic が多い（プルダウンの中をスクロール）、問題が多い（ページ）、スマホの幅（ページの「4 / 10」）、読み込み中、読み込めない、書き出し・削除の失敗

状態ごとの表示とスクリーンショットは、`/dev-proto` で合わせて足す。

## やらないこと

- アプリの画面で問題を書き換えない（`docs/overview.md` の「やらないこと」）
- 不備の印の一覧（flagged）・unflag・export flagged、プルダウンの印の数は作らない（#12）
- Topic で絞って、その Topic だけを書き出すことはしない（書き出しは Subject 単位）
- 消したものを元に戻すことはしない
- 一覧の中を文字で検索したり、並べ替えたりしない

## 決まっていないこと

- [x] Manage を開いたときに選んでいる Subject は？ 案：Home と同じ並び（取り込んだ順）の最初の Subject → 案のまま
- [x] 問題の行に出すものは？ 案：ID、Topic、問題文の1行目（長いときは「…」で切る）、種類（single / multi）、正答率と解いた回数。並びは取り込んだ順（Setup の in order と同じ） → 案のまま
- [x] 行を押すと、問題の中身（選択肢・正解・解説）を見られる？ 案：見られない（確かめは書き出したファイルで） → 案のまま
- [x] 1問ずつの delete のボタンは、行のどこに、どんな形で出す？（`docs/ui.md` には Subject と Topic の delete しかない） → 合意済みのプロトタイプに合わせる（`/dev-proto` で撮って書く）
- [x] Subject を変えたとき、Topic とページはどうなる？ 案：All topics と1ページ目に戻る → 案のまま
- [x] 読み込み直したときや、Setup などから戻ったとき、選んでいた Subject・Topic・ページは残る？ → 残す
- [x] 書き出すファイルの名前は？ 案：Subject の名前を小文字にしたもの（python.json）。Subject の名前に空白や記号があるときは？ → 小文字にし、空白とファイル名に使えない記号は「-」にする（「Web API」→ web-api.json）
- [x] 書き出すファイルに記録（正答率など）は入れない？（案：入れない。取り込むファイルと同じ形だけ） → 案のまま
- [x] 確認のダイアログの文言は？ 案：（下） → 案のまま
  - Subject：「Delete Python?」「480 questions and their records will be deleted. This can't be undone.」
  - Topic：「Delete Typing?」「12 questions and their records will be deleted. This can't be undone.」
  - 1問：「Delete k3f9a2?」「This question and its records will be deleted. This can't be undone.」
- [x] 消したあとの表示は？ 案：Subject を消したら次の Subject（なければ0件の表示）、Topic を消したら All topics、1問を消して今のページが空になったら前のページ。消したことの知らせは出す？ → 案のまま。知らせは出さない
- [x] 消して Subject の問題が0問になったら（最後の Topic・最後の1問を消したら）、Subject も消える、でよい？ → 消える
- [x] 書き出し・削除・読み込みに失敗したときの文言は？ 案：danger の帯「Couldn't load questions.」と retry／「Couldn't export Python.」／ダイアログの中に「Couldn't delete.」 → 案のまま
- [x] Subject が0件のときの文言は？ 案：Home と同じ点線の枠「No subjects yet.」「Import a question file to get started.」と import → 案のまま
- [x] Home の menu の説明「Import, export, delete, flagged」と Manage の説明「Import, export and delete questions.」は今のまま？ → 今のまま

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
