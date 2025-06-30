import { createRouter, createWebHistory } from "vue-router";
import Login from "../views/Login.vue";
import Subscribe from "../views/Subscribe.vue";
import Home from "../views/Home.vue";
import AuthRedirect from "../views/AuthRedirect.vue";
import ImageGeneration from "../views/ImageGeneration.vue";
import Game from "../views/Game.vue";

const routes = [
  { path: "/", component: AuthRedirect },
  { path: "/login", component: Login },
  { path: "/subscribe", component: Subscribe },
  { path: "/home", component: Home },
  { path: "/generate", component: ImageGeneration },
  { path: "/room/:id", component: Game },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
