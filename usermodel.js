const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: String,
    fname: String,
    photo: String,
    department: String,
    discipline: String,
    session: String,
    nic: String,
    enumber: String,
    pnumber: String,
    email: { type: String, unique: true },
    password: String,
    poadd: String,
    peadd: String,
    cf: String,
    cb: String,
    idcf: String,
    idcb: String
});

module.exports = mongoose.model("user", userSchema);
