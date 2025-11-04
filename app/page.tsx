import AppNavbar from "../components/AppNavbar";
import SplitText from "../components/SplitText";
import { GridScan } from "../components/GridScan";

export default function Home() {
  return (
    <div className="relative min-h-screen bg-black overflow-hidden">
      <div className="absolute inset-0 z-0">
        <GridScan
          sensitivity={0.55}
          lineThickness={1}
          linesColor="#BCA8E1"
          gridScale={0.1}
          scanColor="#FF9FFC"
          scanOpacity={0.4}
          enablePost
          bloomIntensity={0.6}
          chromaticAberration={0.002}
          noiseIntensity={0.01}
        />
      </div>
      <div className="relative z-10">
        <AppNavbar />
      </div>
      <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
        <div className="mx-auto w-full max-w-4xl px-6 text-center">
          <div className="mb-8 flex justify-center">
            <div className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-md">
              ✨ New Background
            </div>
          </div>
          <SplitText
            text="Hold on, scanning for Angular users."
            className="text-5xl md:text-7xl font-semibold tracking-tighter text-white sans-serif"
            delay={50}
            duration={0.5}
            ease="cubic-bezier(.22,1,.36,1)"
            splitType="chars"
            from={{ opacity: 0, y: 20 }}
            to={{ opacity: 1, y: 0 }}
            threshold={0.1}
            rootMargin="-100px"
            textAlign="center"
          />
          <div className="pointer-events-auto mt-8 flex justify-center gap-4">
            <a
              href="#get-started"
              className="rounded-full bg-white px-8 py-3 text-sm font-semibold text-black shadow-lg transition hover:bg-white/90 md:text-base"
            >
              Get Started
            </a>
            <a
              href="#learn-more"
              className="rounded-full border border-white/30 bg-white/5 px-8 py-3 text-sm font-semibold text-white backdrop-blur-md transition hover:bg-white/10 hover:border-white/50 md:text-base"
            >
              Learn More
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
