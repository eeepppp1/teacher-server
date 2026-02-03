const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// 🔹 这里换成你的 MongoDB 连接字符串
const MONGO_URI = "mongodb+srv://3803397120_db_user:<db_password>@cluster0.qp3cujl.mongodb.net/?appName=Cluster0";

mongoose.connect(MONGO_URI)
  .then(() => console.log("MongoDB 连接成功"))
  .catch(err => console.log(err));

// 定义留言数据结构
const Message = mongoose.model("Message", new mongoose.Schema({
  name: String,
  message: String,
  time: String
}));

// 📌 接收前端提交的留言
app.post("/add-message", async (req, res) => {
  const { name, message, time } = req.body;
  const newMessage = new Message({ name, message, time });
  await newMessage.save();
  res.send({ success: true });
});

// 📌 获取所有留言
app.get("/get-messages", async (req, res) => {
  const messages = await Message.find();
  res.send(messages);
});

app.listen(3000, () => {
  console.log("服务器运行在 http://localhost:3000");
});

// 📌 删除留言（管理员用）
app.delete("/delete-message/:id", async (req, res) => {
  try {
    await Message.findByIdAndDelete(req.params.id);
    res.send({ success: true });
  } catch (err) {
    res.status(500).send({ success: false, error: err });
  }
});
