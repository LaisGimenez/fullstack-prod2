import Task from "../models/Task.js";
import Panel from "../models/Panel.js";

const TasksController = {
    getTaskById: async id => {
        return await Task.findById(id);
    },
    getTasksByPanelId: async panId => {
        return await Task.find({ panId });
    },
};

export default TasksController;