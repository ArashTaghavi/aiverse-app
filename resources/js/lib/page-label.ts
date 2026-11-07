export function getPageLabel(pathname: string): string {
    const routes: Record<string, string> = {
        dashboard: "Dashboard",
        "chat-with-document": "Chat with Document",
        "databas-analyst": "Databas Analyst",
        profile: "Profile",
        settings: "Settings",
    };

    const route = Object.keys(routes).find((route) => pathname.includes(route));

    return route ? routes[route] : "Workspace";
}
