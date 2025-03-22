import LiveKitModal from "@/components/LiveKitModal";
import * as React from "react"
import { useState } from "react";

export default function AssistantMenu() {
    const [showSupport, setShowSupport] = useState(false);

  const handleSupportClick = () => {
    setShowSupport(true)
  }

  return (
    <div className="app">
        <button className="support-button" onClick={handleSupportClick}>
          Talk to an Agent!
        </button>


      {showSupport && <LiveKitModal setShowSupport={setShowSupport}/>}
    </div>
  )
}
