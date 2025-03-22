import * as React from "react"
import Experience from "@/components/Experience"
import AssistantMenu from "@/components/AssistantMenu"

export default function Interview() {
    return (
        <>
            {/* Sticky navigation bar at the top */}
            <div className="sticky top-0 z-50 w-full">
                <AssistantMenu />
            </div>
            
            {/* Main content below the sticky nav */}
            <main>
                <Experience />
            </main>
        </>
    )
}