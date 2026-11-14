# ホーム

## 最初の画面（`/`）

- ログインしていないと見られない（`docs/specs/sign-in.md`）
- いちばん上に上のバーが出る（`docs/specs/app-bar.md`）
- 上から「menu」「subjects」の順に並べる
- 「menu」の見出しの下に、枠「manage」と「Import, export, delete, flagged」を出す。PC の幅では、2列の枠の左の1枚の大きさ。押すと Manage（`docs/specs/manage.md`）に移る
- 「subjects」の見出しの下に、Subject を取り込んだ順に、枠で囲んだ行を区切り線で並べる
  - 行には、左に名前と、その下にその Subject の全部の問題の身についている具合（下の「身についている具合」の線と数）を出し、右に %、その右に chevron_right の印を出す。名前が長いときは、行の中で折り返す
  - 印の数は出さない
  - 押すと、その Subject の Setup（`docs/specs/solve.md`）に移る
- Subject が0件のときは、「subjects」の見出しの下に、点線の枠で「No subjects yet.」「Import a question file to get started.」と primary の import を出す。import を押すと Import（`docs/specs/import.md`）に移る
- Subject を読み込んでいる間は、「subjects」の見出しの下に、線と数のある Subject の行と同じ高さの枠を4つ点滅させる
- Subject を読み込めなかったときは、「subjects」の見出しの下に、danger の帯「Couldn't load subjects.」と retry を出す。retry で読み直す

| 状態 | 表示 | スクリーンショット |
| --- | --- | --- |
| 通常（Subject が1つ以上） | menu の manage、subjects の Subject の行に線・数・%。まだ解いていない Linux は、線が全部 border、「0 correct · 0 wrong · 30 new」と「—」 | ![](screens/home-default.png) |
| Subject が多い | Subject の行が続く | ![](screens/home-many.png) |
| Subject が0件 | menu の manage、subjects の点線の枠と import | ![](screens/home-empty.png) |

## 身についている具合

Home の Subject の行と、Setup の Topic の行（`docs/specs/solve.md`）で、同じ数え方で出す。

- 問題ごとに、最後の答えで「correct」「wrong」「new」のどれかに数える
  - 最後の答えが正解：correct。不正解かスキップ：wrong。答えた記録がない：new
- 印の付いた問題は、どれにも数えない
- 名前の下に細い線を出し、左から correct（success）・wrong（danger）・new（border）の割合で塗り分ける
- 線の下に、muted の等幅の小さな文字で「30 correct · 10 wrong · 8 new」と出す。correct の数は success、wrong の数は danger。0の項目も含めて、いつも3つを並べる
- 行の右に、等幅で「correct ÷（correct + wrong）」を整数に四捨五入した %（例：2 ÷ 3 は 67%）を、決まった幅で右にそろえて出す。correct + wrong が0のときは「—」
- 全部の問題に印が付いているときは「0 correct · 0 wrong · 0 new」と「—」にし、線は全部 border にする
- スマホの幅で数が1行に収まらないときは、折り返す
