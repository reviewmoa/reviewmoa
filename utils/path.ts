export function pathForView(view: string) {
  const paths: Record<string, string> = {
    home: "/",
    missions: "/missions",
    categories: "/categories",
    tagrank: "/tagrank",
    progress: "/progress",
    random: "/random",
    admin: "/admin"
  };

  return paths[view] ?? "/";
}

export function pathForMission(missionId: string) {
  return `/missions/${missionId}`;
}

export function pathForRequester(missionId: string, requester: string) {
  return `/missions/${missionId}/requesters/${requester}`;
}

export function pathForCard(cardId: string) {
  return `/cards/${cardId}`;
}
