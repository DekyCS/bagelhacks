import * as React from "react"
import { Button } from "@/components/ui/button"
import { ArrowRight } from 'lucide-react';
import { ShinyText } from "@/components/shiny-text";
import { BlurFade } from "@/components/magicui/blur-fade";
import { Particles } from "@/components/magicui/particles";
import { CustomNeonGradientCard } from "@/components/custom-neon-gradient";

export default function Home() {
    // Force dark theme with React's useEffect
    React.useEffect(() => {
        // Add dark class to html element
        document.documentElement.classList.add('dark');
        // Remove the class when component unmounts
        return () => {
            // Only remove if we added it
            document.documentElement.classList.remove('dark');
        };
    }, []);

    return (
        <div className="bg-black w-full min-h-screen overflow-x-hidden">
            <Particles
                className="absolute inset-0 z-0"
                quantity={100}
                ease={80}
                color="#ffffff"
                refresh
            />
            
            <div className="max-w-7xl flex flex-col mx-auto text-center items-center text-white p-6 pt-16">
                <BlurFade delay={0.25 * 1}>
                    <ShinyText />
                </BlurFade>
                <BlurFade delay={0.25 * 2}>
                    <h1 className="text-8xl mt-8 mb-4 max-w-6xl pb-2 bg-gradient-to-br from-white to-gray-400 bg-clip-text text-transparent">Master your interviews with AI-powered practice.</h1>
                </BlurFade>
                <BlurFade delay={0.25 * 3}>
                    <p className="text-xl max-w-2xl mb-8 text-gray-400 font-normal">Our intelligent agents adapt to your target company and role, providing realistic interview scenarios that build confidence and sharpen your skills in a fun, stress-free environment.</p>
                </BlurFade>
                <BlurFade delay={0.25 * 4}>
                    <Button 
                        className="cursor-pointer bg-white text-black hover:bg-gray-200 mb-32"
                        onClick={() => window.location.href = '/start'}
                    >
                        Create Your Interview Agent <ArrowRight className="ml-2"/>
                    </Button>
                </BlurFade>
                <BlurFade delay={0.25 * 3} direction="up" duration={0.6}>
                    <CustomNeonGradientCard
                        borderSize={0}
                        neonColors={{ 
                            firstColor: "#ff00aa80",
                            secondColor: "#00FFF180"
                        }}
                    >
                        <img
                            src="/hero-dark.png"
                            className="h-full w-full rounded-2xl object-cover"
                        />
                    </CustomNeonGradientCard>
                </BlurFade>
            </div>
        </div>
    )
}