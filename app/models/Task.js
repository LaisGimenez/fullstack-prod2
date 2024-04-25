import mongoose from "mongoose";
import Panel from "./Panel.js";

const taskSchema = new mongoose.Schema({

    panId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Panel",
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true,
    },
    descrip: {
        type: String,
        required: true,
        trim: true
    },
    member: {
        type: String,
        required: true,
        trim: true
    },
    dat: {
        type: Date,
        required: true,
    },
    status: {
        type: Number,
        required: true
    }
},
    { timestamps: true, }
);

const Task = mongoose.model("Task", taskSchema);

export default Task;
