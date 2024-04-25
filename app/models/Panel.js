import mongoose from "mongoose";
import Task from "./Task.js";

const panelSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true,
        trim: true
    },
    dat: {
        type: Date,
        required: true
    },
    descrip: {
        type: String,
        trim: true
    },
    color: {
        type: String,
        required: true
    },
    tasks: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Task"
    }],

},

    { timestamps: true, }

);
const Panel = mongoose.model("Panel", panelSchema);

export default Panel;