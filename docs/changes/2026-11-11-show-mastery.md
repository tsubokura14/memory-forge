# Subject と Topic に、今の身についている具合を出す（#9）

## なぜ

どの Subject・Topic が身についていて、どこが苦手かが、今は解いてみないとわからない。Home と Setup の行に今の具合を出し、苦手な Topic を選んで解けるようにする。

Issue #9 にある「問題ごとの正答率と解いた回数（Manage）」と「正答率が低い順の出題（Setup の lowest accuracy）」は、もう `docs/specs/manage.md` と `docs/specs/solve.md` にあり、作られている。今回は残りの「Subject と Topic の具合の線」と、#12 から回ってきた「Setup の Topic の行の印の数」を作る。

## 影響する今の仕様

- `docs/specs/home.md` の「最初の画面」：Subject の行に具合を出す。読み込み中の枠の形
- `docs/specs/solve.md` の「Setup」：Topic の行（All を含む）に具合と印の数を出す。読み込み中の枠の形

## 使う場面

1. Python に48問（印なし）があり、最後の答えが正解30問・不正解10問・まだ解いていない8問の人が、Home を開くと、Python の行に、緑・赤・灰の割合で塗り分けた線と「30 correct · 10 wrong · 8 new」、右に「75%」が出る（30 ÷ 40）
2. 同じ人が Python の Setup を開くと、Topic ごとの行に同じ形の線と数が出る。Decorators だけ % が低いので、Decorators を選んで解く。Typing の8問のうち1問に印があると、Typing の行の数の終わりに「· ⚑1」が出て、線と数はその1問を除いた7問で数える
3. 取り込んだばかりでまだ1問も解いていない Subject は、線が全部灰色で「0 correct · 0 wrong · 12 new」、% は「—」

## 受け入れ条件

### 数え方（Home と Setup で同じ）

- 問題ごとに、最後の答えで「correct」「wrong」「new」のどれかに数える
  - 最後の答えが正解：correct。不正解かスキップ：wrong。答えた記録がない：new
- 印の付いた問題は、どれにも数えない
- % は「correct ÷（correct + wrong）」を整数に四捨五入したもの（例：2 ÷ 3 は 67%）。correct + wrong が0のときは「—」
- 数は、0の項目も含めて、いつも correct・wrong・new の3つを並べる
- 全部の問題に印が付いた Topic（Home では Subject）は「0 correct · 0 wrong · 0 new」と「—」にし、線は全部 border にする
- スマホの幅で数が1行に収まらないときは、折り返す

### Home

- Subject の行に、名前の下に、その Subject の全部の問題で数えた線と「30 correct · 10 wrong · 8 new」を出し、右に % を出す（右の chevron_right の印は今のまま）
- 線は、左から correct（success）・wrong（danger）・new（border）の割合で塗り分ける
- 印の数は出さない

### Setup

- Topic の行と All の行に、名前の下に、その Topic（All なら Subject の全部）の線と数を出し、右に % を出す
- 印の付いた問題があれば、数の並びの終わりに「· ⚑1」（flag の印と数は warning）を出す
- 選んでいる行（primary-soft の地）でも、線と数の色はほかの行と同じ
- Solve の quit と Result の try again で Setup に戻ったときは、それまでに答えた分を入れた具合を出す

## 画面

### Home（home）

| 状態 | 表示 | スクリーンショット |
| --- | --- | --- |
| 通常 | Subject の行に線・数・% | |
| まだ解いていない Subject | 線が全部 border、「0 correct · 0 wrong · 12 new」と「—」 | |
| Subject が多い | 行が続く | |
| Subject が0件 | 今のまま（点線の枠と import） | 今の home-empty.png |
| 読み込み中 | 線と数のある行と同じ形の枠を点滅させる | |
| 読み込めない | 今のまま（danger の帯と retry） | |

### Setup（setup）

| 状態 | 表示 | スクリーンショット |
| --- | --- | --- |
| 通常 | Topic の行と All の行に線・数・%。印のある行に「· ⚑1」 | |
| 全部に印 | その Topic の行が「0 correct · 0 wrong · 0 new · ⚑8」と「—」 | |
| Topic が多い | 行が続く | |
| 読み込み中 | 線と数のある行と同じ形の枠を点滅させる | |
| 読み込めない | 今のまま（danger の帯と retry） | |

## やらないこと

- 線や行を押して、その Topic の問題の一覧や苦手な問題を出すこと（画面の移動はない）
- 具合の移り変わり（日ごとのグラフなど）
- Manage の問題ごとの正答率と、Setup の lowest accuracy を変えること（もうある）
- Home の Subject の行に、印の数を出すこと

## 決まっていないこと

- [x] Home の Subject の行にも、印の数「· ⚑1」を出す？（#12 で決まったのは Setup の Topic の行だけ） → 出さない（印は Setup と Manage で見る）
- [x] % は整数に四捨五入する？（Manage と Result は四捨五入。199 correct · 1 wrong も 100% になる） → 四捨五入する。Manage・Result とそろえ、100% の特別扱いはしない
- [x] 数が0の項目も出す？（「0 correct · 0 wrong · 12 new」のように、いつも3つ並べる理解） → 出す。いつも3つ並べる
- [x] 全部に印が付いた Topic の線は、全部 border の線にする？線を出さない？ → 全部 border の線にする（行の形をほかとそろえる）
- [x] Home で、全部の問題に印が付いた Subject も、Topic と同じく「0 correct · 0 wrong · 0 new」と「—」にする？ → する
- [x] スマホの幅で、数（と「· ⚑1」）が1行に収まらないときは、折り返す？ → 折り返す
- [x] Setup の選んでいる行（primary-soft の地）でも、線と数の色は同じでよい？ → 同じにする
- [x] 1つの機能として、Home と Setup をまとめて1つの仕様でよい？（数え方が同じなので、まとめる案） → まとめる

## 調べたこと
