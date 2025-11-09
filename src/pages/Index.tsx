import Header from "@/components/Header";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import HelpForm from "@/components/HelpForm";
import VolunteerForm from "@/components/VolunteerForm";
import Stories from "@/components/Stories";
import AIChatbot from "@/components/AIChatbot";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <HowItWorks />
        <HelpForm />
        <VolunteerForm />
        <Stories />
      </main>
      <Footer />
      <AIChatbot />
    </div>
  );
};

export default Index;
