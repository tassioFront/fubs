// function workspaceCard() {
//   return (
//     <div className="bg-gary-success/10 border border-gary-success/20 rounded-lg p-xl max-w-2xl mx-auto"></div>
//   );
// }
export default async function AppPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-gutter py-3xl">
        <div className="text-center">
          <h1 className="text-display-xl font-bold text-foreground mb-lg">
            Welcome to Your Dashboard!
          </h1>
          <p className="text-body-lg text-muted-foreground mb-xl">
            Here you can manage you find all your workspace at once. Simple.{' '}
          </p>

          <div className="bg-gary-success/10 border border-gary-success/20 rounded-lg p-xl max-w-2xl mx-auto"></div>
        </div>
      </div>
    </div>
  );
}
