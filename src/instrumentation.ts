export async function register() {
  // Migrations uniquement cote serveur Node (pas Edge runtime)
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./lib/migrations");
  }
}
