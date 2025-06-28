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
## 04getProjectAdmins.js
### 機能
プロジェクト管理者の一覧をを出力する（プロジェクト管理者の設定は任意のためプロジェクト管理者が設定されていないプロジェクトが多い）=> adminsWithPjInfo.csv

# 分割処理（一括処理の途中経過が必要なときにご利用ください）
## 11getUsers.js
### 機能
ユーザー一覧を出力する　=> userIDs.json
## 12getProjectIDs.js
### 機能
プロジェクト一覧を出力する => projectIDs.json
## 13getPjMember.js
### 前提条件
02getProjectIDs.js が実行済み
### 機能
プロジェクトに参加しているユーザー一覧を出力する => pjMember.json, pjMember.csv
## 14usersForDelete.js
### 前提条件
01getUsers.js, 03getPjMember.js が実行済み
### 機能
プロジェクトに参加していないユーザーを出力する　=> usersForDelete.csv
# 環境変数
## ローカル環境で動かす時には.envファイルに設定する
MY_SPACE = 'スペースのURL（末尾のスラッシュは無し）'  
API_KEY = '管理者権限のAPIキー'  
EXCLUSION_PROJECTS = ['ユーザー取得を除外するプロジェクトのIDの配列']  
PORT = ポート番号（デフォルトは3000）  
NOT_LOGGED_IN_DAYS = 最近ログインしていない日数（UIの入力値で上書きされる）  
