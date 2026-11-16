# ログイン

## ログインしていないとき

- Login（`/login`）以外のどの画面を開いても、Login に移る。sign in すると、開こうとしていた画面に移る
- Login を直接開いて sign in すると、Home に移る
- ログインしている人が Login を開くと、Home に移る
- ログインしたままでいられるのは、最後に使ってから30日。過ぎたら、ログインしていない人と同じ扱いになる
- sign out（上のバー。`docs/specs/app-bar.md`）したあとは、ログインしていない人と同じ扱いになる。ブラウザの戻るで前の画面に戻っても、Login が出る

## アカウント

- 通るのは、画面の外（`npm run user:create`）で作った自分のアカウントだけ。アプリの画面から新しく登録する手段はない
- メールアドレスとパスワードのほかに、紐づけた Google アカウントでも入れる。紐づけていない Google アカウントでは、新しいアカウントはできない

## Login（`/login`）

- 上のバーは出さない。画面の真ん中に、ロゴとアプリ名、その下に sm の幅のカード、カードの下の外に forgot password? を置く
- カードの中は、上から帯（エラーのとき）、email の入力、password の入力、sign in のボタン（primary）、線と「or」の区切り、枠だけのボタン「sign in with google」（Google のロゴは付けない）
- email か password が空のまま sign in を押すと、ブラウザの「入力してください」が出て、送らない
- 送っている間は、ボタンが「signing in…」になって薄くなり、ボタンと入力が押せない（打てない）。sign in with google を押してから Google の画面に移るまでの間も同じ（sign in with google も薄くなる）
- メールアドレスかパスワードが違うと、Login のまま、danger の帯で「Incorrect email or password.」を出す。どちらが違ったかは出さない。入れた email と password は残り、password の枠が danger になる
- 同じメールアドレスで5回続けて間違えると、そこから15分は、正しいパスワードでも入れず、danger の帯で「Too many attempts. Try again in 15 minutes.」を出す
  - 登録されていないメールアドレスも、同じに数える
  - 止めている間に試しても、15分は延びない。15分たてば、また入れる
  - 15分たったあとは、0から数え直す
  - 入れたら、間違えた回数は0に戻る
- つながらないなど、サーバーのエラーのときは、Login のまま、danger の帯で「Couldn't sign in. Please try again.」を出す。retry のボタンは出さない
- forgot password? は、押しても何も起きない

### Google でのログイン

- sign in with google を押すと Google の画面に移る。email と password は空でもよい
- 紐づけた Google アカウントを選ぶと、Home に移る（開こうとしていた画面があれば、その画面に移る）
- Google の画面でキャンセルしたときは、何も出さずに Login に戻る
- 紐づけていない Google アカウントを選ぶと、Login に戻り、danger の帯で「This Google account isn't linked. Sign in with your email, then link it in settings.」を出す
- つながらないなど、そのほかで入れなかったときは、Login に戻り、danger の帯で「Couldn't sign in. Please try again.」を出す
- パスワードを続けて間違えて止めている15分の間も、Google では入れる。Google での失敗は、間違えた回数に数えない
- ログインしたままでいられる期間と sign out の扱いは、メールアドレスとパスワードで入ったときと同じ

| 状態 | 表示 | スクリーンショット |
| --- | --- | --- |
| 通常 | ロゴとアプリ名、email・password の入力、sign in のボタン、「or」の区切りと sign in with google のボタン、forgot password? | ![](screens/login-default.png) |
| 送っている間・Google に移っている間 | sign in が「signing in…」になり、どちらのボタンも薄く、入力と一緒に押せない | ![](screens/login-loading.png) |
| 違う | 入力の上に danger の帯で「Incorrect email or password.」。email と password は残り、password の枠が danger | ![](screens/login-error.png) |
| 止めている | 入力の上に danger の帯で「Too many attempts. Try again in 15 minutes.」 | ![](screens/login-locked.png) |
| サーバーのエラー | 入力の上に danger の帯で「Couldn't sign in. Please try again.」 | ![](screens/login-server-error.png) |
| 紐づけていない Google アカウント | 入力の上に danger の帯で「This Google account isn't linked. Sign in with your email, then link it in settings.」 | ![](screens/login-google-error.png) |
