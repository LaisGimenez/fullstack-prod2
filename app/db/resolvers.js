import PanelsController from "../controllers/PanelsController.js";
import TasksController from "../controllers/TasksController.js";
import { DateResolver } from "graphql-scalars";

const resolvers = {

    Date: DateResolver,

    Query: {
        panels: async () => {
            return await PanelsController.getPanelsList()
        },
        getPanelById: async (obj, { id }) => {
            return await PanelsController.getPanelById(id);
        },
        getTasksByPanelId: async (obj, { panId }) => {
            return await TasksController.getTasksByPanelId(panId);
        },
        getTaskById: async (obj, { id }) => {
            return await TasksController.getTaskById(id);
        },

    },

};

export default resolvers;

