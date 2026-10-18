import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CompareView } from "./CompareView";

export const dynamic = "force-dynamic";

export default function ComparePage() {
  return (
    <>
      <Header />
      <CompareView />
      <Footer />
    </>
  );
}
