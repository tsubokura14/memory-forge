---
name: dev-triage
description: Issue をどの流れ（軽い・中くらい・重い）で進めるか、理由つきで案を出し、人間が決めたらラベルを付ける
argument-hint: <Issue番号>
disable-model-invocation: true
---

Issue #$ARGUMENTS を、どの流れで進めるか決めるのを手伝う。**決めるのは人間。** 直したり、仕様を書いたりはしない。

1. `gh issue view $ARGUMENTS` で Issue を読む。関係する `docs/specs/` と、変わりそうなコードを読む
2. `docs/process/flow.md` に照らして、案を出す
   - 「必ず重い流れにするもの」に当たるものを、1つずつ確かめる。当たったものと、当たらないと考えた理由を書く
   - 変わりそうな場所（ファイル、画面）と、その場所をほかに使っているところを書く
   - 迷う点（Issue だけではわからないこと）があれば、推測で決めずに質問として書く
3. 次の形で伝える
   - 案：軽い・中くらい・重い のどれか
   - 理由：`docs/process/flow.md` のどれに当たるか
   - 変わりそうな場所
   - 質問（あれば）
4. 人間が流れを決めたら、`gh issue edit $ARGUMENTS --add-label flow:<light|medium|heavy>` でラベルを付ける。前に付けた流れのラベルがあれば外す
5. 次に使うコマンドを伝えて終わる
   - 軽い・中くらい：`/dev-fix $ARGUMENTS`
   - 重い：`/dev-spec $ARGUMENTS`
