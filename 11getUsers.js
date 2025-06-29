import axios from "axios";
import fs from "fs";
import "dotenv/config";

const output = "./output";

const asyncFunc = async () => {
  const result = await axios
    .get(`${process.env.MY_SPACE}/api/v2/users?apiKey=${process.env.API_KEY}`)
    .catch(() => console.log("エラー"));
  const userIDs = result.data.map((e) => [
    e.id,
    e.name,
    e.mailAddress,
    e.lastLoginTime,
  ]);
  console.log("ユーザー数: " + userIDs.length);
  fs.writeFileSync(`${output}/userIDs.json`, JSON.stringify(userIDs));
};

asyncFunc().finally(() => console.log("done"));
