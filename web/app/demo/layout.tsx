import DemoHeader from "@/components/DemoHeader";
import TestModeBanner from "@/components/TestModeBanner";

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#f7f7f8]">
      <TestModeBanner />
      <DemoHeader />
      <main>{children}</main>
    </div>
  );
}
