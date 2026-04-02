const { dynamoDbClient, s3Client } = require("../config/aws-config");
const {
  GetCommand,
  PutCommand,
  DeleteCommand,
  ScanCommand,
} = require("@aws-sdk/lib-dynamodb");
const { PutObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
require('dotenv').config();

const TableName = process.env.TABLE; 
const Bucket = process.env.BUCKET;

const getAll = async (nameQuery, statusQuery) => {
  const params = { TableName };
  const conditions = [];
  const values = {};

  if (nameQuery) {
    conditions.push(
      "(contains(eventName, :nameQuery) OR contains(holderName, :nameQuery))",
    );
    values[":nameQuery"] = nameQuery;
  }

  if (statusQuery && statusQuery !== "All") {
    conditions.push("#st = :statusQuery");
    values[":statusQuery"] = statusQuery;

    // Java có từ đặc biệt là Class, ...
    // SQL Server SELECT, FROM
    params.ExpressionAttributeNames = { "#st": "status" };
  }

  if (conditions.length > 0) {
    params.FilterExpression = conditions.join(" AND ");
    params.ExpressionAttributeValues = values;
  }

  const data = await dynamoDbClient.send(new ScanCommand(params));
  // const data = await dynamoDbClient.send(
  //   new ScanCommand({
  //     TableName,
  //     FilterExpression,
  //     ExpressionAttributeValues,

  //     ExpressionAttributeNames,

  //   }),
  // );
  return data.Items || [];
};

const getById = async (studentId) => {
  const data = await dynamoDbClient.send(
    new GetCommand({ TableName, Key: { studentId } }),
  );
  return data.Item || null;
};

const upsert = async (studentId, body, file) => {
  // 1. Chuẩn bị dữ liệu
  const {
    dateOfBirth,
    avatar,
    fullName,
    gender,
    nationalId,
  } = body;

  // if (quantity <= 0) throw new Error("Số lượng lớn hơn 0");
  // if (pricePerTicket <= 0) throw new Error("Giá vé lớn hơn 0");
  // if (eventDate < Date.now()) throw new Error("Ngày sự kiện không hợp lệ");

  // 2.1 Làm payload TH1 Tạo vé mới
  let studentData = {
    studentId: studentId ?? Date.now().toString(),
    dateOfBirth,
    avatar,
    fullName,
    gender,
    nationalId,
  };

  // 2.2 Làm payload TH2 Cập nhật vé
  if (studentId) {
    const data = await dynamoDbClient.send(
      new GetCommand({ TableName, Key: { studentId } }),
    );

    if (!data.Item) throw new Error("Không tìm thấy sản phẩm");

    studentData = { ...data.Item, ...body };
  }

  // 3 Làm việc với S3
  if (file) {
    // Upload ảnh
    const key = `${Date.now()}-${file.originalname}`;
    await s3Client.send(
      new PutObjectCommand({
        Bucket,
        Body: file.buffer,
        Key: key,
        ContentType: file.mimetype,
      }),
    );

    // Xóa ảnh nếu có
    if (studentData.avatar) {
      await s3Client.send(
        new PutObjectCommand({
          Bucket,
          Key: studentData.avatar.split("/").pop(),
        }),
      );
    }

    // Cập nhật vào payload
    studentData.avatar = `https://${Bucket}.s3.amazonaws.com/${key}`;
  }

  // 4 Làm việc với Dynamodb
  // studentData.totalAmount = studentData.quantity * studentData.pricePerTicket;

  // if (studentData.category === "VIP" && studentData.quantity > 4) {
  //   studentData.finalAmount = studentData.totalAmount * 0.9;
  //   studentData.isDicount = true;
  // } else if (studentData.category === "VVIP " && studentData.quantity > 2) {
  //   studentData.finalAmount = studentData.totalAmount * 0.85;
  //   studentData.isDicount = true;
  // } else {
  //   studentData.finalAmount = studentData.totalAmount;
  //   studentData.isDicount = false;
  // }

  await dynamoDbClient.send(
    new PutCommand({
      TableName,
      Item: studentData,
    }),
  );
};

const deleteById = async (studentId) => {
  const data = await dynamoDbClient.send(
    new GetCommand({ TableName, Key: { studentId } }),
  );

  // Làm việc s3
  if (data.Item?.avatar) {
    await s3Client.send(
      new DeleteObjectCommand({
        Bucket,
        Key: data.Item.avatar.split("/").pop(),
      }),
    );
  }

  // Làm việc với Dynamodb
  await dynamoDbClient.send(
    new DeleteCommand({ TableName, Key: { studentId } }),
  );
};

module.exports = {
  getAll,
  getById,
  upsert,
  deleteById,
};
