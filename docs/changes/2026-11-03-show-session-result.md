# 解き終わりに結果を見られる（#8）

## なぜ

今は、最後の問題で results を押しても Setup に戻るだけで、解いた回の出来がわからない。解き終わりに正答率・得点・数と Topic ごとの結果を出し、ひと目で出来をつかんで、もう一度解くかを決められるようにする。

## 影響する今の仕様

- `docs/specs/solve.md` の「Solve」：最後の問題の results（と、決まれば最後の問題の skip）で Setup に戻る、を Result に移るに変える
- 新規：Result（`docs/specs/solve.md` に節を足すか、新しいファイルにするかは設計で決める）

## 使う場面

1. Python の Decorators を10問解いた人が、最後の問題で results を押すと、「session complete」と「Python」、正答率 70% と得点 7/10、correct 7・incorrect 2・skipped 1 の数、Decorators の行（7/10、70%）が出る。try again を押すと、Decorators・in order・10 を選んだままの Setup に戻る
2. Python の All を20問解いた人が results を押すと、Topic ごとの行（Decorators 5/8、Typing 3/6 など）が出て、どの Topic が弱かったかがわかる。home を押すと Home に戻る

## 受け入れ条件

- Solve の最後の問題で results を押すと、Result が出る
- Result の上に「session complete」と Subject の名前を出す
- 正答率（%）と得点（正解の数 / 数える問題の数）を出す
- correct・incorrect・skipped・flagged（not counted）の数を出す
- Topic ごとに、得点と % を出す
- try again で、同じ Subject の Setup に移る
- home で、Home に移る

## 画面

### Result

| 状態 | 表示 | スクリーンショット |
| --- | --- | --- |
| 通常 | 正答率の円と得点、4つの数、Topic ごとの行、try again と home | |
| Topic が多い | Topic の行が続く | |

## やらないこと

- 1つ前に解いた回の結果を、あとから見返すこと（結果は解き終わったときだけ出す）
- 不備の印を付ける機能（#12）

## 決まっていないこと

- [ ] 不備の印（flagged）の数と「数える問題が0問のとき」をどうするか（印を付ける機能は #12 で、まだない）
- [ ] 最後の問題で skip したときも Result を出すか。quit は今のまま Setup に戻すか
- [ ] `docs/ui.md` の「1問ずつの結果は、解き終わりの結果の画面で見る」に合わせて、1問ずつの結果の一覧も出すか
- [ ] 下の操作の try again と home は、どちらを主な操作（primary）にするか
- [ ] try again で戻った Setup は、直前に選んでいた Topic・順番・問題数のままにするか
- [ ] 正答率の % の丸め方（例：6/9 = 66.7%）
- [ ] Result の incorrect の数に、スキップを含めるか（Solve の上のバーの不正解の数はスキップを含む）。得点と % では、スキップを不正解として数えるか
- [ ] Topic ごとの行の並び順。1つの Topic だけを解いたときも行を出すか
- [ ] Result の上のバーは、ふつうの上のバー（ロゴと sign out）にするか。戻るリンクは置くか
- [ ] Result で読み込み直したときにどうするか（Solve と同じく、Setup の最初の選び方からやり直す、など）

## 調べたこと

---

## 設計

## 確かめ方

-

## タスク

- [ ]
