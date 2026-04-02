const express = require("express");
const multer = require("multer");
const studentController = require("./controllers/student-controller");

const app = express();

// Middleware
app.use(express.urlencoded({ extended: true }));
const upload = multer({ storage: multer.memoryStorage() });

// Views
app.set("view engine", "ejs");
app.set("views", "./views");

// Views Route
app.get("/", studentController.handleRenderIndex);
app.get("/form", studentController.handleRenderForm);
app.get("/detail/:studentId", studentController.handleRenderDetail);
app.get("/form/:studentId", studentController.handleRenderForm);

// Api Route
app.post(
  "/students/upsert",
  upload.single("avatar"),
  studentController.handleUpsert,
);
app.post(
  "/students/upsert/:studentId",
  upload.single("avatar"),
  studentController.handleUpsert,
);
app.post("/students/delete/:studentId", studentController.handleDelete);

// Listen
app.listen(3000, () => {
  console.log("Server mở rồi nè");
});


{/* <input type="text" name="holderName" placeholder="holderName" value="<%= student?.holderName %>">
<input type="number" name="quantity" placeholder="quantity" value="<%= student?.quantity %>">
<input type="number" name="pricePerTicket" placeholder="pricePerTicket" value="<%= student?.pricePerTicket %>">
<div>
    <label>status</label>
    <select name="status">
        <option value="Upcoming" <%= ticket?.status === 'Upcoming' ? "selected" : "" %>>Upcoming</option>
        <option value="Sold" <%= ticket?.status === 'Sold' ? "selected" : "" %>>Sold</option>
        <option value="Cancelled" <%= ticket?.status === 'Cancelled' ? "selected" : "" %>>Cancelled</option>
    </select>
</div>  */}