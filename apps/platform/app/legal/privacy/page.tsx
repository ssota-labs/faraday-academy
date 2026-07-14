export default function PrivacyPage() {
  return (
    <main style={{ maxWidth: 640, margin: "2rem auto", padding: "0 1rem", lineHeight: 1.6 }}>
      <h1>Privacy & data (draft)</h1>
      <p>
        We collect the minimum needed for accounts, entitlements, learning
        progress, and abuse prevention. Course community display names are
        minimized. Export and delete endpoints:{" "}
        <code>GET /v1/me/export</code>, <code>DELETE /v1/me</code>.
      </p>
    </main>
  );
}
