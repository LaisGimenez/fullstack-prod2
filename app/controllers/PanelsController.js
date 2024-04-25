import Panel from "../models/Panel.js";
import Task from "../models/Task.js";

const PanelsController = {
    getPanelsList: async () => {
         return await Panel.find({});
    },
    getPanelById: async id => {
         return await Panel.findById(id)
            .populate("tasks");
    },
};

export default PanelsController;