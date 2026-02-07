const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// ✅ 允许所有来源（适合 Vercel 前端 + Railway 后端）
app.use(cors());
app.use(express.json());

// ✅ Railway 需要的端口写法（非常关键）
const PORT = process.env.PORT || 3000;

// ✅ 从环境变量读取 MongoDB（你已经在 Railway 配好了 MONGO_URI）
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("❌ 没有检测到 MONGO_URI，请检查 Railway Variables");
}

// 连接 MongoDB（更稳妥写法）
mongoose
  .connect(MONGO_URI, {
    serverSelectionTimeoutMS: 5000, // 5 秒超时
  })
  .then(() => console.log("✅ MongoDB 连接成功"))
  .catch(err => console.error("❌ MongoDB 连接失败：", err));

// 定义留言数据结构
const Message = mongoose.model(
  "Message",
  new mongoose.Schema({
    name: String,
    message: String,
    time: String,
  })
);

// 📌 测试接口（用来确认服务器在线）
app.get("/", (req, res) => {
  res.send("Teacher Server is running 🚀");
});

// 📌 接收前端提交的留言
app.post("/add-message", async (req, res) => {
  try {
    const { name, message, time } = req.body;
    const newMessage = new Message({ name, message, time });
    await newMessage.save();
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 📌 获取所有留言
app.get("/get-messages", async (req, res) => {
  try {
    const messages = await Message.find().sort({ _id: -1 }); // 最新的在前
    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 📌 删除留言（管理员用）
app.delete("/delete-message/:id", async (req, res) => {
  try {
    await Message.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ✅ **最关键的一行：Railway 必须监听 0.0.0.0**
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
