# Google アカウントだけでログインする（#110）

## なぜ

パスワードを覚えたり打ったりせずに済むようにするため。今はメールアドレスとパスワードでも、紐づけた Google アカウントでも入れるが、パスワードを残す限り、覚えておく・漏れないようにする・忘れたら再設定する手間が残る。

## 影響する今の仕様

- `docs/specs/sign-in.md`：「アカウント」と「Login」。メールアドレスとパスワードでのログイン、続けて間違えたときの止め、forgot password? をなくす
- `docs/specs/settings.md`：「account」の枠と「Google アカウントの紐づけ」（最後の1つを外せるか）
- `docs/overview.md`：「主な機能」のログインと、パスワードの再設定

## 使う場面

1. 自分の Google アカウントを紐づけてある人が、スマホで Login を開くと、sign in with google のボタンだけが出る。押して Google のアカウントを選ぶと Home に入る
2. 紐づけていない Google アカウントで sign in with google を押すと、Login に戻り、danger の帯でエラーが出る。中には入れない
3. Settings で、紐づけた Google アカウントを追加したり外したりする

## 受け入れ条件

### Login

- カードの中は、上から帯（エラーのとき）と、sign in with google のボタンだけ。email・password の入力、sign in のボタン、「or」の区切り、forgot password? は出さない
- 紐づけた Google アカウントを選ぶと、Home に移る（開こうとしていた画面があれば、その画面に移る）
- sign in with google を押してから Google の画面に移るまでの間は、ボタンが薄くなり、押せない
- Google の画面でキャンセルしたときは、何も出さずに Login に戻る
- 紐づけていない Google アカウントを選ぶと、Login に戻り、danger の帯でエラーを出す。新しいアカウントはできない
- つながらないなど、そのほかで入れなかったときは、Login に戻り、danger の帯で「Couldn't sign in. Please try again.」を出す
- メールアドレスとパスワードでは入れない
- ログインしたままでいられる期間と sign out の扱いは、今までどおり

### Settings

- account の枠の google の行で、紐づけた Google アカウントを足す・外すのは、今までどおり

## 画面

### Login（`/login`）

| 状態 | 表示 | スクリーンショット |
| --- | --- | --- |
| 通常 | ロゴとアプリ名、カードの中に sign in with google のボタン | |
| Google に移っている間 | ボタンが薄く、押せない | |
| 紐づけていない Google アカウント | ボタンの上に danger の帯 | |
| サーバーのエラー | ボタンの上に danger の帯で「Couldn't sign in. Please try again.」 | |

### Settings（`/settings`）

- 変わるのは、最後の1つを外すときの扱い（「決まっていないこと」）

## やらないこと

- Google アカウントで新しく登録すること（自分以外の人のログイン・新しい登録は作らない）
- Google 以外（GitHub など）でのログイン
- パスワードの再設定（#4）

## 決まっていないこと

- [ ] 1. 最初のアカウントはどう作る？ 今は `npm run user:create` でメールアドレスとパスワードを入れて作り、Settings で Google を紐づけている。パスワードがなくなると、Settings に入る手段がないので、最初の Google アカウントを画面の外で紐づける（例：コマンドで Google のメールアドレスを登録しておき、そのメールアドレスの Google アカウントで初めて入ったときに紐づく）などが要る
- [ ] 2. 最後の1つの Google アカウントを外せる？ 外すと入れなくなる（例：最後の1つは unlink を出さない／押せない、または外せて、入り直すにはコマンドが要る）
- [ ] 3. Login の sign in with google のボタンは、今の枠だけのままにする？ 1画面に1つの主な操作になるので、primary にする？
- [ ] 4. 紐づけていない Google アカウントのエラーの文言は？ 今の「This Google account isn't linked. Sign in with your email, then link it in settings.」は、email で入れなくなるので使えない（例：「This Google account isn't linked.」）
- [ ] 5. Settings の account の枠の email の行は残す？ 今はパスワードのアカウントのメールアドレスを出している
- [ ] 6. 今あるパスワードはどうする？ 入れなくするだけで残す／消す（あとで戻せるかどうかに関わる）
- [ ] 7. #4（パスワードを再設定できる）は閉じる？ `docs/overview.md` のパスワードの再設定も消してよい？

## 調べたこと

---

## 設計

## 確かめ方

-

## タスク

- [ ]
