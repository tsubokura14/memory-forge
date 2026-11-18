-- パスワードで入る機能はなくなった（Google アカウントだけで入る）ので、パスワードのハッシュを持つ行も消す
DELETE FROM "account" WHERE "provider_id" = 'credential';--> statement-breakpoint
DROP TABLE "sign_in_attempts" CASCADE;