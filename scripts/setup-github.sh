#!/usr/bin/env bash
# GitHub リポジトリの初期設定（gh CLI でログインし、このリポジトリを GitHub に push 済みであること）
set -euo pipefail

# 次にやる Issue に付けるラベル（bug は GitHub が最初から用意している）
gh label create "next" --color "0E8A16" --description "次にやる（1〜3件まで）" --force

# どの流れで進めるか（docs/process/flow.md）。/dev-triage で付ける
gh label create "flow:light" --color "C2E0C6" --description "軽い流れ（/dev-fix。新しいテストなし）" --force
gh label create "flow:medium" --color "FBCA04" --description "中くらいの流れ（/dev-fix。テストを先に書く）" --force
gh label create "flow:heavy" --color "D93F0B" --description "重い流れ（/dev-spec から）" --force

# 取り込み方法を Squash merge だけにし、取り込んだブランチを自動で消す
gh repo edit \
  --enable-squash-merge \
  --enable-merge-commit=false \
  --enable-rebase-merge=false \
  --delete-branch-on-merge

# Squash merge のコミットメッセージを「PR のタイトル」と「PR の本文」にする
gh api --method PATCH "repos/{owner}/{repo}" \
  -f squash_merge_commit_title=PR_TITLE \
  -f squash_merge_commit_message=PR_BODY \
  --silent

# main への push と、秘密情報を含む push を、手元の Git のフック（.githooks/pre-push）で断る
git config core.hooksPath .githooks

# main を、PR を通さないと入れないようにする。一人でも自分の PR をマージできるよう、承認の数は0にする
# 非公開リポジトリで GitHub Free の場合は使えないので、そのときは上のフックだけが守りになる
# CI はまだないので、必須のチェックは空にする。CI を作ったら（docs/how-we-work.md の手順4）、そのジョブを必須にする
if gh api --method PUT "repos/{owner}/{repo}/branches/main/protection" --input - --silent 2>/dev/null <<'EOF'
{
  "required_status_checks": null,
  "enforce_admins": true,
  "required_pull_request_reviews": { "required_approving_review_count": 0 },
  "restrictions": null
}
EOF
then
  echo "main のブランチ保護を設定しました。"
else
  echo "main のブランチ保護は使えませんでした（非公開リポジトリで GitHub Free の場合）。main への push は手元のフックで止めます。"
fi

# 秘密情報を含む push を、GitHub でも断る（secret scanning の push protection）
# 非公開リポジトリでは有料（GitHub Secret Protection）なので、使えなければ手元のフックだけが守りになる
if gh api --method PATCH "repos/{owner}/{repo}" --input - --silent 2>/dev/null <<'EOF'
{
  "security_and_analysis": {
    "secret_scanning": { "status": "enabled" },
    "secret_scanning_push_protection": { "status": "enabled" }
  }
}
EOF
then
  echo "秘密情報を含む push を、GitHub でも断るようにしました。"
else
  echo "GitHub の push protection は使えませんでした（非公開リポジトリで有料の機能がない場合）。秘密情報を含む push は手元のフックで止めます。"
fi

echo "GitHub の設定が終わりました。"
