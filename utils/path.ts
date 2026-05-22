const PATHS: Record<string, string> = {
  home: "/",
  missions: "/missions",
  categories: "/categories",
  tagrank: "/tagrank",
  progress: "/progress",
  random: "/random",
  admin: "/admin"
};

export const pathForView = (view: string) => PATHS[view] ?? "/";

export const pathForMission = (missionId: string) => `/missions/${missionId}`;

export const pathForRequester = (missionId: string, requester: string) =>
  `/missions/${missionId}/requesters/${requester}`;

export const pathForCard = (cardId: string) => `/cards/${cardId}`;
