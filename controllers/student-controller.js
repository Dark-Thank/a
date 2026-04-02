const {
  deleteById,
  getAll,
  getById,
  upsert,
} = require("../services/student-service");

const handleRenderIndex = async (req, res) => {
  const { nameQuery, statusQuery } = req.query;

  const students = await getAll(nameQuery, statusQuery);
  res.render("index", { students });
};

const handleRenderForm = async (req, res) => {
  const studentId = req.params.studentId;
  const student = studentId ? await getById(studentId) : null;
  res.render("form", { student });
};

const handleRenderDetail = async (req, res) => {
  const studentId = req.params.studentId;
  const student = studentId ? await getById(studentId) : null;
  if (!student) return res.status(404).send("Không tìm thấy học sinh");
  res.render("detail", { student });
};

const handleUpsert = async (req, res) => {
  const { studentId } = req.params;
  try {
    await upsert(studentId, req.body, req.file);
    res.redirect("/");
  } catch (err) {
    res.render("form", {
      student: { studentId, ...req.body },
      error: err.message,
    });
  }
};

const handleDelete = async (req, res) => {
  await deleteById(req.params.studentId);
  res.redirect("/");
};

module.exports = {
  handleRenderDetail,
  handleRenderForm,
  handleRenderIndex,
  handleDelete,
  handleUpsert,
};
