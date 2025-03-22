"use client";

import React from "react";
import { Play, X } from "lucide-react";
import { Dock, DockIcon } from "@/components/magicui/dock";

const AgentDock = ({ isConnected, isConnecting, onConnect, onDisconnect }) => {
  return (
    <div className="fixed bottom-8 left-0 right-0 z-50">
      <Dock direction="middle" className="bg-white shadow-lg">
        {isConnected ? (
          <DockIcon onClick={onDisconnect} title="Disconnect agent" className="text-black hover:bg-gray-100">
            <X className="size-6" />
          </DockIcon>
        ) : (
          <DockIcon 
            onClick={onConnect} 
            disabled={isConnecting}
            title="Connect to agent"
            className="text-black hover:bg-gray-100"
          >
            {isConnecting ? (
              <div className="animate-spin h-5 w-5 border-2 border-black border-t-transparent rounded-full" />
            ) : (
              <Play className="size-6" fill="currentColor" />
            )}
          </DockIcon>
        )}
      </Dock>
    </div>
  );
};

export default AgentDock;