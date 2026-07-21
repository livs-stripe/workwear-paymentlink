import DemoHeader from "@/components/DemoHeader";
import DemoHub from "@/components/DemoHub";
import TestModeBanner from "@/components/TestModeBanner";

export default function Home() {
  return (
    <div className="min-h-screen bg-wwgSurface">
      <TestModeBanner />
      <DemoHeader />
      <main>
        <DemoHub />
      </main>
    </div>
  );
}
