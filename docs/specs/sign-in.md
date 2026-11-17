# ログイン

## ログインしていないとき

- Login（`/login`）以外のどの画面を開いても、Login に移る。ログインすると、開こうとしていた画面に移る
- Login を直接開いてログインすると、Home に移る
- ログインしている人が Login を開くと、Home に移る
- ログインしたままでいられるのは、最後に使ってから30日。過ぎたら、ログインしていない人と同じ扱いになる
- sign out（上のバー。`docs/specs/app-bar.md`）したあとは、ログインしていない人と同じ扱いになる。ブラウザの戻るで前の画面に戻っても、Login が出る

## アカウント

- 通るのは、自分の Google アカウント（アプリの設定に書いた1つ。画面の外で書き換える）と、Settings で紐づけた Google アカウントだけ（`docs/specs/settings.md`）。アプリの画面から新しく登録する手段はない
- パスワードでは入れない。紐づけていない Google アカウントでは、新しいアカウントはできない

## Login（`/login`）

- 上のバーは出さない。画面の真ん中に、ロゴとアプリ名、その下に sm の幅のカードを置く
- カードの中は、上から帯（エラーのとき）と、ボタン「sign in with google」（Google のロゴは付けない）だけ
- sign in with google を押すと Google の画面に移る。押してから Google の画面に移るまでの間は、ボタンが「signing in…」になって薄くなり、押せない
- 自分の Google アカウントか、紐づけた Google アカウントを選ぶと、Home に移る（開こうとしていた画面があれば、その画面に移る）
- Google の画面でキャンセルしたときは、何も出さずに Login に戻る
- それ以外の Google アカウントを選ぶと、Login に戻り、danger の帯で「This Google account isn't linked.」を出す
- つながらないなど、そのほかで入れなかったときは、Login に戻り、danger の帯で「Couldn't sign in. Please try again.」を出す。retry のボタンは出さない

| 状態 | 表示 | スクリーンショット |
| --- | --- | --- |
| 通常 | ロゴとアプリ名、カードの中に sign in with google のボタン | ![](screens/login-default.png) |
| Google に移っている間 | ボタンが「signing in…」で薄く、押せない | ![](screens/login-loading.png) |
| 紐づけていない Google アカウント | ボタンの上に danger の帯で「This Google account isn't linked.」 | ![](screens/login-google-error.png) |
| サーバーのエラー | ボタンの上に danger の帯で「Couldn't sign in. Please try again.」 | ![](screens/login-server-error.png) |
