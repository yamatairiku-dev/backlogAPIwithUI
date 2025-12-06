# 一括処理
## 01getUsersToBeDeleted.js
### 機能
プロジェクトに参加していないユーザーを出力する　=> usersToBeDeleted.csv
## 02getUsersNotLoggedIn.js
### 機能
しばらくログインしていないユーザーを出力する　=> getUsersNotLoggedIn.csv
## 03getUsersNotLoggedInWithPjInfo.js
### 機能
しばらくログインしていないユーザーを出力する（プロジェクト名付き、延べユーザー）=> usersToBeDeletedWithPjInfo.csv  
注意：除外プロジェクト以外のプロジェクトに参加していないユーザーは出力されない => 01getUsersToBeDeleted.jsの出力を参照
## 04getProjectAdmins.js
### 機能
プロジェクト管理者の一覧を出力する（プロジェクト管理者の設定は任意のためプロジェクト管理者が設定されていないプロジェクトが多い）=> adminsWithPjInfo.csv

# 分割処理（一括処理の途中経過が必要なときにご利用ください）
## 11getUsers.js
### 機能
ユーザー一覧を出力する　=> userIDs.json
## 12getProjectIDs.js
### 機能
プロジェクト一覧を出力する => projectIDs.json
## 13getPjMember.js
### 前提条件
12getProjectIDs.js が実行済み
### 機能
プロジェクトに参加しているユーザー一覧を出力する => pjMember.json, pjMember.csv
## 14usersForDelete.js
### 前提条件
11getUsers.js, 13getPjMember.js が実行済み
### 機能
プロジェクトに参加していないユーザーを出力する　=> usersForDelete.csv
# 環境変数
## ローカル環境で動かす時には.envファイルに設定する
MY_SPACE = 'スペースのURL（末尾のスラッシュは無し）'  
API_KEY = '管理者権限のAPIキー'  
EXCLUSION_PROJECTS = ['ユーザー取得を除外するプロジェクトのIDの配列']  
PORT = ポート番号（デフォルトは3000）  
NOT_LOGGED_IN_DAYS = 最近ログインしていない日数（UIの入力値で上書きされる）  

# Backlog ユーザー整理ツール 引き継ぎドキュメント

## 1. 目的

- Backlog（API v2）からユーザー・プロジェクト情報を取得し、
  - 「プロジェクトに所属していないユーザー」
  - 「一定期間ログインしていないユーザー」
  - 「プロジェクト管理者一覧」
  を CSV/JSON に出力するためのツールです。
- Node.js スクリプトと簡易 Web UI（Express + HTML）で構成され、運用担当者がブラウザから実行状況・出力結果を確認できます。

---

## 2. 全体構成

- ルート直下
  - `server.js`  
    - Express サーバ本体。Web UI とバックエンド API を提供。
  - `index.html`  
    - ブラウザ用のシンプルな UI。スクリプト実行と出力ファイル一覧を表示。
  - バッチスクリプト群  
    - 一括処理: `01getUsersToBeDeleted.js` `02getUsersNotLoggedIn.js` `03getUsersNotLoggedInWithPjInfo.js` `04getProjectAdmin.js`
    - 分割処理: `11getUsers.js` `12getProjectIDs.js` `13getPjMember.js` `14usersForDelete.js`
  - ドキュメント
    - `Readme.md`（日本語で機能一覧と環境変数の説明）
    - `GEMINI.md`（セキュリティの簡易ガイド）
  - 出力ディレクトリ
    - `output/`（CSV/JSON 生成先。サーバから静的配信される）

- 依存ライブラリ（`package.json`）
  - `"type": "module"` により ES Modules を使用
  - `axios`（Backlog API 呼び出し）
  - `dotenv`（`.env` 読み込み）
  - `express`（Web サーバ）
  - `marked`（`Readme.md` を HTML に変換）

---

## 3. 環境構築

1. Node.js（LTS 推奨）をインストール
2. 依存パッケージのインストール
   - `npm install`
3. `.env` に環境変数を設定（※ファイル自体はリポジトリに含めないこと）
4. ローカル起動
   - `node server.js`
   - ブラウザで `http://localhost:3000` にアクセス

Docker 利用時は `docker-compose.yml` / `Dockerfile` に従い、例として：
- `docker-compose up --build`

---

## 4. 設定（環境変数）

`.env` に以下を設定します（**絶対にコミットしないこと**）。

- `MY_SPACE`  
  - Backlog スペースの URL（末尾スラッシュなし）  
  - 例: `https://example.backlog.com`
- `API_KEY`  
  - 管理者権限の API キー
- `EXCLUSION_PROJECTS`  
  - ユーザー取得対象から除外するプロジェクトキーの配列（文字列）  
  - 例: `["PJ1","PJ2"]`
  - スクリプト `01 / 03 / 04 / 12` で除外対象とするプロジェクト判定に利用
- `NOT_LOGGED_IN_DAYS`
  - 「最近ログインしていない」とみなす日数（整数）
  - スクリプト `02 / 03` で使用
  - Web UI から実行する場合、画面の入力値で一時的に上書きして実行されます
- `PORT`
  - Web サーバのポート番号（未設定時は `3000`）

**セキュリティ上の注意（`GEMINI.md` より）**

- `.env` などの設定ファイルは読ませない・共有しない
- API キーやパスワード等が記録されたファイルはコミット・共有しない
- 誤ってログ等にキーを含めた場合は速やかにキーをローテーションする

---

## 5. バッチスクリプト一覧

### 5.1 一括処理

#### 01getUsersToBeDeleted.js

- 概要  
  - 「いずれの（除外対象外の）プロジェクトにも参加していないユーザー」を抽出します。
- 処理内容
  - `/api/v2/users` で全ユーザー一覧を取得
  - `/api/v2/projects` と `/projects/{projectKey}/users` で、各プロジェクトの所属ユーザーを取得
  - `EXCLUSION_PROJECTS` に含まれるプロジェクトキーを除外してアクティブユーザー集合を作成
  - アクティブユーザーに属さないユーザーを抽出
- 出力
  - `output/01usersToBeDeleted.csv`
  - 項目: ユーザーID / ユーザー名 / メールアドレス / 最終ログイン日(YYYY-MM-DD)

#### 02getUsersNotLoggedIn.js

- 概要  
  - 指定日数以上ログインしていないユーザーを抽出します。
- 処理内容
  - `NOT_LOGGED_IN_DAYS` をもとに基準日時を算出
  - 全ユーザーの `lastLoginTime` から、基準日時以前のユーザーのみ抽出
- 出力
  - `output/02usersNotLoggedIn.csv`
  - 項目: ユーザーID / ユーザー名 / メールアドレス / 最終ログイン日(YYYY-MM-DD)

#### 03getUsersNotLoggedInWithPjInfo.js

- 概要  
  - 「指定日数以上ログインしていないユーザー」を、「所属プロジェクト情報付き」「延べユーザー（プロジェクト×ユーザー単位）」で出力します。
  - 除外プロジェクト以外のプロジェクトに参加していないユーザーはここでは出力されないため、プロジェクト未所属ユーザーは `01` の結果を参照します。
- 処理内容
  - `/api/v2/projects` から全プロジェクト一覧を取得し、`EXCLUSION_PROJECTS` を除外
  - 各プロジェクトの `/projects/{projectKey}/users` からユーザーリスト取得
  - プロジェクトキーとプロジェクト名をユーザー情報に付与
  - `NOT_LOGGED_IN_DAYS` に基づき、基準日時以前のユーザーのみ抽出
- 出力
  - `output/03usersToBeDeletedWithPjInfo.csv`
  - 項目: ユーザーID / ユーザー名 / メールアドレス / 最終ログイン日 / プロジェクトキー / プロジェクト名

#### 04getProjectAdmin.js

- 概要  
  - プロジェクト管理者（administrators）の一覧を、プロジェクト情報付きで出力します。
- 処理内容
  - `/api/v2/projects` から全プロジェクト一覧を取得（`EXCLUSION_PROJECTS` を除外）
  - `/projects/{projectKey}/administrators` で各プロジェクトの管理者一覧を取得
  - プロジェクトキー・プロジェクト名を付与
- 出力
  - `output/04adminsWithPjInfo.csv`
  - 項目: ユーザーID / プロジェクト管理者名 / メールアドレス / 最終ログイン日 / プロジェクトキー / プロジェクト名

---

### 5.2 分割処理（中間成果物を確認したい場合向け）

#### 11getUsers.js

- 概要  
  - 全ユーザー一覧を JSON で出力します。
- 出力
  - `output/userIDs.json`
  - 形式: `[ [userId, name, mailAddress, lastLoginTime], ... ]`

#### 12getProjectIDs.js

- 概要  
  - プロジェクトキー一覧を JSON で出力します（`EXCLUSION_PROJECTS` を除外）。
- 出力
  - `output/projectIDs.json`
  - 形式: `[ "PJ1", "PJ2", ... ]`

#### 13getPjMember.js

- 前提条件  
  - `12getProjectIDs.js` が事前に実行されており、`output/projectIDs.json` が存在すること。
- 概要  
  - 各プロジェクトのメンバー一覧を JSON / CSV で出力します。
- 出力
  - `output/pjMember.json`  
    - 形式: プロジェクトごとの `[ [userId, name, projectKey], ... ]` の配列
  - `output/pjMember.csv`  
    - 形式: `userId,name,projectKey` の行を列挙

#### 14usersForDelete.js

- 前提条件  
  - `11getUsers.js` と `13getPjMember.js` が実行済みで、`output/userIDs.json`, `output/pjMember.json` が存在すること。
- 概要  
  - 「いずれのプロジェクトにも所属していないユーザー」を、11/13 の中間成果物から算出します。  
    （ロジックは `01getUsersToBeDeleted.js` と同等イメージ）
- 出力
  - `output/nonActiveUsers.csv`  
    - 全ユーザーからアクティブユーザーIDを引いた結果を CSV で出力  
    - 内容は `userIDs.json` の行構造と同一（`[id, name, mailAddress, lastLoginTime]`）

---

## 6. Web UI / API の構成

### 6.1 Express サーバ（server.js）

- 起動
  - `node server.js`
- 主要エンドポイント
  - `GET /`  
    - `index.html` を返却（Web UI）
  - `GET /api/scripts`  
    - カレントディレクトリの `.js` ファイル一覧を返却（`server.js` は除外）
  - `GET /api/run/:scriptName?notLoggedInDays=180`  
    - 指定スクリプトを `child_process.spawn("node", [scriptPath])` で実行
    - 環境変数 `NOT_LOGGED_IN_DAYS` にクエリ `notLoggedInDays` を上書きした状態で起動
    - 標準出力をレスポンスとして返却（エラー時は標準エラーを 500 で返却）
  - `GET /api/output-files`  
    - `output/` 以下のファイル一覧を返却（`.gitkeep`, `.DS_Store` は除外）
  - `GET /api/readme`  
    - `Readme.md` を読み込み、`marked` で HTML に変換した内容を返却
  - `GET /output/*`  
    - `output/` ディレクトリを静的配信（CSV/JSON ダウンロード用）

### 6.2 Web UI（index.html）

- 機能
  - 左カラム: `Scripts`  
    - `/api/scripts` から取得した `.js` ファイル名をボタンとして表示
    - ボタン押下で `/api/run/:scriptName` を呼び出し、`Output` エリアに実行ログを表示
  - 右カラム:
    - 「最近ログインしていない日数」の入力欄  
      - デフォルト `180` 日。`02` / `03` のような `NOT_LOGGED_IN_DAYS` を使うスクリプトに効果あり
    - `Downloadable Files`  
      - `/api/output-files` から取得した出力ファイル名をリンク表示（クリックで `output/xxx.csv` ダウンロード）
    - `Output`  
      - スクリプト実行結果（console.log の内容）を表示
    - `Readme.md` 表示エリア  
      - `/api/readme` の HTML を表示し、スクリプトの説明を確認可能

---

## 7. 典型的な運用フロー

### 7.1 プロジェクト未所属ユーザーの抽出（簡易）

1. `.env` に `EXCLUSION_PROJECTS` を設定
2. Web UI で `01getUsersToBeDeleted.js` を選択して実行  
   または CLI から `node 01getUsersToBeDeleted.js`
3. `output/01usersToBeDeleted.csv` をダウンロードし、対象ユーザーを確認

### 7.2 長期間ログインしていないユーザーの抽出

1. `.env` に `NOT_LOGGED_IN_DAYS` のデフォルト値を設定（例: 180）
2. Web UI で日数を調整しつつ以下を実行
   - `02getUsersNotLoggedIn.js`  
     → シンプルにユーザー単位で出力
   - `03getUsersNotLoggedInWithPjInfo.js`  
     → 所属プロジェクト情報付き・延べユーザーで出力
3. `output/02usersNotLoggedIn.csv` / `output/03usersToBeDeletedWithPjInfo.csv` をレビュー

### 7.3 分割処理で詳細に確認しながら実行

1. `node 11getUsers.js` → `output/userIDs.json`
2. `node 12getProjectIDs.js` → `output/projectIDs.json`
3. `node 13getPjMember.js` → `output/pjMember.json`, `output/pjMember.csv`
4. `node 14usersForDelete.js` → `output/nonActiveUsers.csv`
5. 中間ファイルを都度確認しながらロジック・対象ユーザーをチェック

---

## 8. 引き継ぎ時の注意点・おすすめ運用

- **本番適用前の検証**
  - 新しい環境変数・コード変更を行った際は、必ずテスト用スペース or テストユーザーで検証する
  - 出力 CSV の件数・代表行を既存結果と比較する（増減の理由を確認）
- **環境変数管理**
  - `.env` は各環境ごとに管理し、リポジトリには絶対に含めない
  - `EXCLUSION_PROJECTS` は、運用ルールに応じて定期的に見直す（例: 退役済みプロジェクトなど）
- **ログの扱い**
  - スクリプト実行ログ（特にエラー時）に API キー等が出力されないよう注意
  - 問題が発生した場合は、ログ（ユーザー情報などをマスクした状態）と `output/` の代表的なファイルを添えて引き継ぐ
- **コード変更時**
  - スクリプトは ES Modules + 2スペースインデントで統一
  - 共通化したくなる処理は、複数ファイルから使われるようになってからモジュール化する
  - 出力ファイル名を変更した場合は `Readme.md` と本ドキュメントも必ず更新する
