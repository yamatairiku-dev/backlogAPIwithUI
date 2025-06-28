# 一括処理
## getUsersToBeDeleted.js
### 機能
プロジェクトに参加していないユーザーを出力する　=> usersToBeDeleted.csv
## getUsersNotLoggedIn.js
### 機能
しばらくログインしていないユーザーを出力する　=> getUsersNotLoggedIn.csv
## getUsersNotLoggedInWithPjInfo.js
### 機能
しばらくログインしていないユーザーを出力する（プロジェクト名付き、延べユーザー）=> usersToBeDeletedWithPjInfo.csv
## getProjectAdmins.js
### 機能
プロジェクト管理者の一覧をを出力する（プロジェクト管理者の設定は任意のためプロジェクト管理者が設定されていないプロジェクトが多い）=> adminsWithPjInfo.csv

# 分割処理（一括処理の途中経過が必要なときにご利用ください）
## 01getUsers.js
### 機能
ユーザー一覧を出力する　=> userIDs.json
## 02getProjectIDs.js
### 機能
プロジェクト一覧を出力する => projectIDs.json
## 03getPjMember.js
### 前提条件
02getProjectIDs.js が実行済み
### 機能
プロジェクトに参加しているユーザー一覧を出力する => pjMember.json, pjMember.csv
## 04usersForDelete.js
### 前提条件
01getUsers.js, 03getPjMember.js が実行済み
### 機能
プロジェクトに参加していないユーザーを出力する　=> usersForDelete.csv
