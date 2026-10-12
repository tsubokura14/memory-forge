/** @type {import("prettier").Config} */
const config = {
  // Windows（core.autocrlf=true）で取り出すと改行が CRLF になり、既定の "lf" では
  // 手元でだけ確かめが失敗するため。リポジトリの中は Git が LF にそろえる
  endOfLine: "auto",
};

export default config;
