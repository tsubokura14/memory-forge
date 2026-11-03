# 解き終わりに結果を見られる（#8）

## なぜ

今は、最後の問題で results を押しても Setup に戻るだけで、解いた回の出来がわからない。解き終わりに正答率・得点・数と Topic ごとの結果を出し、ひと目で出来をつかんで、もう一度解くかを決められるようにする。

## 影響する今の仕様

- `docs/specs/solve.md` の「Solve」：最後の問題の results と skip で Setup に戻る、を Result に移るに変える
- `docs/specs/solve.md` の「Setup」：Solve から戻ったときに直前の選び方のままになる場合に、Result の try again を足す
- `docs/specs/app-bar.md`：上のバーが出る画面に Result を足す
- 新規：Result（`docs/specs/solve.md` に節を足すか、新しいファイルにするかは設計で決める）

## 使う場面

1. Python の Decorators を10問解いた人が、7問正解・2問不正解・1問スキップで、最後の問題で results を押すと、「session complete」と「Python」、正答率 70% と得点 7/10、correct 7・incorrect 2・skipped 1・flagged 0 の数、Decorators の行（7/10、70%）が出る。try again を押すと、Decorators・in order・10 を選んだままの Setup に戻る
2. Python の All を20問解いた人が results を押すと、Topic ごとの行（Decorators 5/8、Typing 3/6 など）が Setup と同じ順に出て、どの Topic が弱かったかがわかる。home を押すと Home に戻る
3. 最後の問題をスキップした人には、Setup ではなく Result が出る。途中で quit した人は、今のまま Setup に戻る

## 受け入れ条件

- Solve の最後の問題で results を押すと、Result が出る。最後の問題で skip しても、Result が出る
- quit は、今のまま Setup に戻る
- いちばん上に上のバーが出る。戻るリンクは置かない
- 上に「session complete」と Subject の名前を出す
- 正答率の円（真ん中に % と accuracy）と得点（正解の数 / 解いた問題の数。例：7/10）を出す
  - 得点と正答率では、スキップを不正解として数える
  - 正答率は、整数に四捨五入する（6/9 は 67%）
- correct・incorrect・skipped・flagged（not counted）の数を出す
  - incorrect は、答えて間違えた数だけ（スキップは skipped にだけ数える）
  - flagged は、不備の印を付ける機能（#12）ができるまで、いつも 0
- Topic ごとの行に、正解と不正解（スキップを含む）の割合の線、得点（3/4）、% を出す
  - 並びは Setup の Topic と同じ順（その Topic の問題が最初に出てくる順）。解いた回に出た Topic だけを出す
  - Topic を1つ選んで解いたときも、その1行を出す
- 下に、幅いっぱいの try again（主な操作）と、home を置く
  - try again で、同じ Subject の Setup に移る。Topic・順番・問題数は、直前に選んでいたもののまま
  - home で、Home に移る
- Result で読み込み直すと、結果は出ず、Setup の最初の選び方（All・in order・10）からになる。それまでに答えた分の記録は残る

## 画面

### Result

| 状態 | 表示 | スクリーンショット |
| --- | --- | --- |
| 通常 | 正答率の円と得点、4つの数、Topic ごとの行、try again と home | |
| Topic が多い | Topic の行が続く | |

- 結果は解き終わったときに手元で出すので、読み込み中とエラーの状態はない（設計で変わるなら、そのとき決める）
- 数える問題が0問のとき（全部に不備の印）は、#12 で扱う

## やらないこと

- 前に解いた回の結果を、あとから見返すこと（結果は解き終わったときだけ出す）
- 1問ずつの結果の一覧（`docs/ui.md` の「1問ずつの結果は、解き終わりの結果の画面で見る」は、仕上げのときに今の作りに合わせて直す）
- 不備の印を付ける機能と、数える問題が0問のときの表示（#12）

## 決まっていないこと

- [x] 不備の印（flagged）の数と「数える問題が0問のとき」をどうするか（印を付ける機能は #12 で、まだない） → flagged（not counted）のカードは出し、今はいつも 0。0問のときの表示は #12 で扱う
- [x] 最後の問題で skip したときも Result を出すか。quit は今のまま Setup に戻すか → 最後の skip は Result、quit は今のまま Setup
- [x] `docs/ui.md` の「1問ずつの結果は、解き終わりの結果の画面で見る」に合わせて、1問ずつの結果の一覧も出すか → 出さない
- [x] 下の操作の try again と home は、どちらを主な操作（primary）にするか → try again
- [x] try again で戻った Setup は、直前に選んでいた Topic・順番・問題数のままにするか → 直前の選び方のまま
- [x] 正答率の % の丸め方（例：6/9 = 66.7%） → 整数に四捨五入（67%）
- [x] Result の incorrect の数に、スキップを含めるか。得点と % では、スキップを不正解として数えるか → incorrect には含めない。得点と % では不正解として数える
- [x] Topic ごとの行の並び順。1つの Topic だけを解いたときも行を出すか → Setup と同じ順。1つでも出す
- [x] Result の上のバーは、ふつうの上のバー（ロゴと sign out）にするか。戻るリンクは置くか → ふつうの上のバー。戻るリンクは置かない
- [x] Result で読み込み直したときにどうするか → Setup の最初の選び方からになる

## 調べたこと

---

## 設計

## 確かめ方

-

## タスク

- [ ]
