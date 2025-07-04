import fs from "fs";
const pjMember = JSON.parse(fs.readFileSync("./output/pjMember.json", "utf8"));
const users = JSON.parse(fs.readFileSync("./output/userIDs.json", "utf8"));

const output = "./output";

const activeUserIDs = [];
pjMember.map((e) => e.map((e) => activeUserIDs.push(e[0])));
const set = new Set(activeUserIDs);
const uniqueActiveUserIDs = [...set];
const userIDs = users.map((e) => e[0]);
const userIDsForDelete = userIDs.filter(
  (val) => !uniqueActiveUserIDs.includes(val)
);
const result = users.filter((val) => userIDsForDelete.includes(val[0]));

let resultCSV = "";
result.map((e) => (resultCSV += e.join(",") + "\n"));
console.log(result);
console.log("全ユーザー数:" + userIDs.length);
console.log("アクティブユーザー数:" + uniqueActiveUserIDs.length);
console.log("削除ユーザー数:" + result.length);
fs.writeFileSync(`${output}/nonActiveUsers.csv`, resultCSV);
