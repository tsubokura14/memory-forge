# ホーム

## 最初の画面（`/`）

- ログインしていないと見られない（`docs/specs/sign-in.md`）
- いちばん上に上のバーが出る（`docs/specs/app-bar.md`）
- Subject が0件のときは、「subjects」の見出しの下に、点線の枠で「No subjects yet.」「Import a question file to get started.」と primary の import を出す。import を押すと Import（`docs/specs/import.md`）に移る
- Subject が1つ以上あるときは、「subjects」の見出しごと出さない
- 「menu」の見出しの下に、枠の行「manage」と「Import, export, delete, flagged」を出す。押すと Manage（`docs/specs/manage.md`）に移る
- Subject を読み込んでいる間は、0件の表示と同じ形（見出しと枠）を点滅させる

| 状態 | 表示 | スクリーンショット |
| --- | --- | --- |
| Subject が0件 | subjects の点線の枠と import、その下に menu の manage | ![](screens/home-empty.png) |
| 通常（Subject が1つ以上） | menu の manage だけ | ![](screens/home-default.png) |
