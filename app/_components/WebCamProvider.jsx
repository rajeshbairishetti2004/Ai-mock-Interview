"use client";

import { WebCamContext } from "@/context/WebCamContext";
import { useState } from "react";

export default function WebCamProvider({ children }) {
  const [webCamEnabled, setWebCamEnabled] = useState(false);

  return (
    <WebCamContext.Provider value={{ webCamEnabled, setWebCamEnabled }}>
      {children}
    </WebCamContext.Provider>
  );
}