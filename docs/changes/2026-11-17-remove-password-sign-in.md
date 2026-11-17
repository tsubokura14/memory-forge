# Google アカウントだけでログインする（#110）

## なぜ

パスワードを覚えたり打ったりせずに済むようにするため。今はメールアドレスとパスワードでも、紐づけた Google アカウントでも入れるが、パスワードを残す限り、覚えておく・漏れないようにする・忘れたら再設定する手間が残る。

## 影響する今の仕様

- `docs/specs/sign-in.md`：「アカウント」と「Login」。メールアドレスとパスワードでのログイン、続けて間違えたときの止め、forgot password? をなくす
- `docs/specs/settings.md`：「account」の枠（email の行をなくす）と「Google アカウントの紐づけ」（自分の Google アカウントは外せない）
- `docs/overview.md`：「主な機能」のログインと、パスワードの再設定

## 使う場面

1. 自分の Google アカウント（アプリの設定に書いたもの）を持つ人が、スマホで Login を開くと、sign in with google のボタンだけが出る。押して Google のアカウントを選ぶと Home に入る
2. 紐づけていない Google アカウントで sign in with google を押すと、Login に戻り、danger の帯で「This Google account isn't linked.」が出る。中には入れない
3. Settings を開くと、google の行のいちばん上に自分の Google アカウントが unlink なしで出て、その下に Settings で足した Google アカウントが並ぶ。足したものは unlink で外せる

## 受け入れ条件

### アカウント

- 自分の Google アカウントは、アプリの設定（画面の外）に書いた1つ。初めから入れて、Settings では外せない
- そのほかに、Settings で足した Google アカウントでも入れる
- 今までのメールアドレスとパスワードでは入れない。パスワードと、続けて間違えた回数の記録は消す

### Login

- カードの中は、上から帯（エラーのとき）と、sign in with google のボタンだけ。email・password の入力、sign in のボタン、「or」の区切り、forgot password? は出さない
- 自分の Google アカウントか、Settings で足した Google アカウントを選ぶと、Home に移る（開こうとしていた画面があれば、その画面に移る）
- sign in with google を押してから Google の画面に移るまでの間は、ボタンが「signing in…」になって薄くなり、押せない
- Google の画面でキャンセルしたときは、何も出さずに Login に戻る
- それ以外の Google アカウントを選ぶと、Login に戻り、danger の帯で「This Google account isn't linked.」を出す。新しいアカウントはできない
- つながらないなど、そのほかで入れなかったときは、Login に戻り、danger の帯で「Couldn't sign in. Please try again.」を出す
- ログインしたままでいられる期間と sign out の扱いは、今までどおり

### Settings

- account の枠は google の行だけにする（email の行は出さない）
- google の行のいちばん上に、自分の Google アカウントのメールアドレスを check の印を付けて出す。右に unlink は置かない
- その下に、Settings で足した Google アカウントを紐づけた順に並べ、それぞれの右に unlink を置く（足す・外す・失敗の扱いは今までどおり）
- 自分の Google アカウントがいつも出るので、「Not linked」は出さない

## 画面

### Login（`/login`）

| 状態 | 表示 | スクリーンショット |
| --- | --- | --- |
| 通常 | ロゴとアプリ名、カードの中に sign in with google のボタン | |
| Google に移っている間 | ボタンが「signing in…」で薄く、押せない | |
| 紐づけていない Google アカウント | ボタンの上に danger の帯で「This Google account isn't linked.」 | |
| サーバーのエラー | ボタンの上に danger の帯で「Couldn't sign in. Please try again.」 | |

- ボタンの見た目（primary か枠だけか）は、このあと見た目を刷新するので、今は問わない

### Settings（`/settings`）

| 状態 | 表示 | スクリーンショット |
| --- | --- | --- |
| 自分の Google アカウントだけ | google の行に、自分の Google アカウント（unlink なし）と link google account | |
| 足した Google アカウントがある | 自分の Google アカウントの下に、足したものが unlink 付きで並ぶ | |

- 読み込み中・エラー・権限なしは、今までどおり

## やらないこと

- Google アカウントで新しく登録すること（自分以外の人のログイン・新しい登録は作らない）
- Google 以外（GitHub など）でのログイン
- パスワードの再設定（#4 は閉じる）
- 自分の Google アカウントを画面から変えること（変えるときはアプリの設定を書き換える）

## 決まっていないこと

- [x] 1. 最初のアカウントはどう作る？ → 作るのではなく、自分の Google アカウント1つが初めからある（アプリの設定＝環境変数に書く）。消せない
- [x] 2. 最後の1つの Google アカウントを外せる？ → 自分の Google アカウントは外せない。Settings で足したものは外せる
- [x] 3. Login の sign in with google のボタンは primary にする？ → 見た目はこのあと刷新するので、今は問わない
- [x] 4. 紐づけていない Google アカウントのエラーの文言は？ → 「This Google account isn't linked.」
- [x] 5. Settings の account の枠の email の行は残す？ → 消す
- [x] 6. 今あるパスワードはどうする？ → 消す
- [x] 7. #4（パスワードを再設定できる）と、`docs/overview.md` のパスワードの再設定は？ → #4 は閉じ、`docs/overview.md` からも消す
- [x] 8. Settings で、自分の Google アカウントはどう出す？ → google の行のいちばん上に、unlink なしで出す
- [x] 9. Login のボタンの文言と、Google に移っている間の文言は？ → 「sign in with google」と「signing in…」

## 調べたこと

---

## 設計

## 確かめ方

-

## タスク

- [ ]
