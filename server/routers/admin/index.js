module.exports = (app) => {
  const express = require("express");
  const AdminUser = require("../../models/AdminUser");
  const jwt = require("jsonwebtoken");
  const assert = require("http-assert");
  const authMiddleware = require("../../middleware/auth");
  const resourceMiddleware = require("../../middleware/resource");
  const router = express.Router({
    mergeParams: true,
  });

  //保存资源
  router.post("/", async (req, res) => {
    const model = await req.Model.create(req.body);
    res.send(model);
  });
  //获取资源
  router.get("/", authMiddleware(), async (req, res) => {
    const queryOptions = {};
    if (req.Model.modelName === "Category") {
      queryOptions.populate = "parent";
    }
    const items = await req.Model.find().setOptions(queryOptions).limit(10);
    res.send(items);
  });
  //获取特定资源
  router.get("/:id", async (req, res) => {
    const model = await req.Model.findById(req.params.id);
    res.send(model);
  });
  //修改特定资源
  router.put("/:id", async (req, res) => {
    const model = await req.Model.findByIdAndUpdate(req.params.id, req.body);
    res.send(model);
  });
  //删除特定资源
  router.delete("/:id", async (req, res) => {
    await req.Model.findByIdAndDelete(req.params.id, req.body);
    res.send({
      success: true,
    });
  });

  //通用接口
  app.use(
    "/admin/api/rest/:resource",
    authMiddleware(),
    resourceMiddleware(),
    router
  );

  const multer = require("multer");
  const upload = multer({
    dest: __dirname + "/../../uploads",
  });
  //文件上传
  app.post(
    "/admin/api/upload",
    authMiddleware(),
    upload.single("file"),
    async (req, res) => {
      const file = req.file;
      file.url = `http://localhost:3000/uploads/${file.filename}`;
      res.send(file);
    }
  );

  //登录
  app.post("/admin/api/login", async (req, res) => {
    const { username, password } = req.body;

    //1.判断用户是否存在
    const user = await AdminUser.findOne({ username }).select("+password");
    assert(user, 422, "用户不存在");
    //2.校验密码
    const isValid = require("bcryptjs").compareSync(password, user.password);
    assert(isValid, 422, "密码错误");

    //3.返回token

    const token = jwt.sign({ id: user._id }, app.get("secret"));
    res.send({ token });
  });

  //错误处理函数
  app.use(async (err, req, res, next) => {
    res.status(err.statusCode || 500).send({
      message: err.message,
    });
  });
};
