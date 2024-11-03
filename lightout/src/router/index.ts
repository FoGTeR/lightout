import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import DataImport from "../views/DataImport.vue";
import GroupFilter from "../views/GroupFilter.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: HomeView,
    },
    {
      path: "/import",
      name: "import",
      component: DataImport,
    },
    {
      path: "/filter",
      name: "filter",
      component: GroupFilter,
    },
  ],
});

export default router;
