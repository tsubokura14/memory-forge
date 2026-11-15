# 設定

## Settings（`/settings`）

- ログインしていないと見られない（`docs/specs/sign-in.md`）
- いちばん上に上のバーが出る（`docs/specs/app-bar.md`）
- Home の menu の settings から開く。解く画面や Login からは開けない
- 左上に戻るリンク「home」、その下に見出し「Settings」を出す（パンくずは出さない）。戻るリンクを押すと Home に移る
- 「appearance」の見出しの下の枠に、ラベル「theme」と「system」「light」「dark」を横に並べ、1つを選べる。下の行に「Saved on this device. System follows your OS setting.」を出す
  - 3つは docs/ui.md の「少しの中から1つ選ぶもの」と同じく、選んでいるものだけを surface の地にする
- 0件・大量・読み込み中・エラー・権限なしは起こらない（読み込むデータがなく、覚えるのは端末の中だけのため）

| 状態 | 表示 | スクリーンショット |
| --- | --- | --- |
| 通常（system） | 戻るリンク「home」、見出し「Settings」、appearance の枠で system が選ばれている | ![](screens/settings-default.png) |
| dark を選んだ | dark が選ばれ、暗い画面 | ![](screens/settings-dark.png) |

## テーマ

- 選ぶと、その場で画面の明るさが切り替わる（保存のボタンはない）
  - system：OS の設定に合わせる。選んでいる間に OS の設定を変えると、画面も合わせて変わる
  - light：いつも明るい
  - dark：いつも暗い
- まだ選んだことがなければ system
- 選んだ値は端末（ブラウザ）ごとに覚える。読み直しても、閉じて開き直しても、選んだ明るさで出る。ほかの端末には移らない
- 選んだ明るさは、Login を含むすべての画面に効く。開いた瞬間から選んだ明るさで出る
