# Google アカウントでもログインできる（#14）

## なぜ

スマホなどで、パスワードを入れずに手早く入れるようにするため。今はメールアドレスとパスワードでしか入れず、スマホで長いパスワードを打つのが手間になっている。

## 影響する今の仕様

- `docs/specs/settings.md`：Settings に Google アカウントの紐づけの枠を足す
- `docs/specs/sign-in.md`：「アカウント」と「Login」に、Google でのログインを足す

## 使う場面

1. メールアドレスとパスワードでログインしている人が、PC で Home の menu から Settings を開き、link google account を押す。Google の画面で自分の Google アカウントを選ぶと Settings に戻り、紐づけた Google アカウントのメールアドレスが出る
2. 紐づけ済みの人が、スマホで Login を開き、sign in with google を押して Google のアカウントを選ぶと、パスワードを打たずに Home に入る
3. 紐づけていない Google アカウントで sign in with google を押すと、Login に戻り、danger の帯でエラーが出る。中には入れない

## 受け入れ条件

### 紐づけ（Settings）

- Settings に Google アカウントの枠があり、紐づけていなければ link google account のボタンを出す
- link google account を押すと Google の画面に移り、アカウントを選ぶと Settings に戻って、紐づけた Google アカウント（メールアドレス）と unlink のボタンを出す
- Google の画面でやめた・失敗したときは、Settings に戻り、danger の帯でエラーを出す。紐づけは変わらない
- unlink を押すと、その場で外れ、link google account のボタンに戻る
- 外したあとは、その Google アカウントでは入れない

### ログイン（Login）

- Login に sign in with google のボタンを出す
- 紐づけた Google アカウントを選ぶと、Home に移る（開こうとしていた画面があれば、その画面に移る）
- 紐づけていない Google アカウントを選ぶと、Login に戻り、danger の帯でエラーを出す。新しいアカウントはできない
- Google でログインしたあとも、ログインしたままでいられる期間と sign out の扱いは、メールアドレスとパスワードで入ったときと同じ
- メールアドレスとパスワードでのログインは、今までどおり使える

## 画面

### Settings（`/settings`）

| 状態 | 表示 | スクリーンショット |
| --- | --- | --- |
| 紐づけていない | Google アカウントの枠に link google account のボタン | |
| 紐づけた | 紐づけた Google アカウントのメールアドレスと unlink のボタン | |
| 紐づけの失敗 | danger の帯でエラー | |
| unlink の失敗 | （決まっていないこと） | |

### Login（`/login`）

| 状態 | 表示 | スクリーンショット |
| --- | --- | --- |
| 通常 | 今の表示に sign in with google のボタンを足す | |
| 紐づけていない Google アカウント | danger の帯でエラー | |

## やらないこと

- Google アカウントで新しく登録すること（`docs/overview.md` の「やらないこと」）
- Google 以外（GitHub など）でのログイン
- パスワードをなくして Google だけで入るようにすること（パスワードでのログインは残す）

## 決まっていないこと

- [ ] 1. 紐づけられる Google アカウントは1つだけ？（複数は紐づけない、でよいか）
- [ ] 2. Google アカウントのメールアドレスが、自分のアカウントのメールアドレスと違っても紐づけてよい？
- [ ] 3. Settings の枠の見出しとラベルの文言（例：見出し「account」、ラベル「google」、ボタン「link google account」「unlink」）。紐づけたときに出すのはメールアドレスだけでよい？
- [ ] 4. エラーの帯の文言。紐づけの失敗（例：「Couldn't link your Google account. Please try again.」）、すでにほかのアカウントに紐づいている Google アカウントを選んだとき（1人だけのアプリなので起こらない、でよいか）、Login の紐づけていない Google アカウント（例：「This Google account isn't linked.」）
- [ ] 5. Google の画面で「キャンセル」したときも、Settings・Login にエラーの帯を出す？ それとも何も出さずに戻るだけ？
- [ ] 6. unlink は確認のダイアログなしで、その場で外してよい？（Issue では「その場で外れる」）。外すのに失敗したときは、danger の帯（retry のボタンなし）でよい？
- [ ] 7. Login のボタンの置き場所：sign in のボタンの下に区切り（「or」など）を置き、その下に枠だけのボタンで sign in with google、でよいか。Google のロゴは付ける？（docs/ui.md の「記号は Material Symbols」と合わないので、付けないなら文字だけ）
- [ ] 8. Login で sign in with google を押してから Google の画面に移るまでの間、ボタンを「signing in…」にして押せなくする？
- [ ] 9. Login で5回続けて間違えて止めている15分の間、sign in with google では入れる？
- [ ] 10. 自分のアカウントのパスワードでの止め（5回の間違い）は、Google でのログインの失敗では数えない、でよいか

## 調べたこと

---

## 設計

## 確かめ方

-

## タスク

- [ ]
