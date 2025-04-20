"use client"

import { useState } from "react"
import { Layout } from "./components/Layout"
import { LicenseManagement } from "./components/license/LicenseManagement"
import { IPRegistration } from "./components/registration/IPRegistration"
import { RoyaltyManagement } from "./components/royalty/RoyaltyManagement"
import { WalletProvider } from "./context/WalletContext"
export function App() {
  const [activeTab, setActiveTab] = useState("license")
  return (
    <WalletProvider>
      <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
        {activeTab === "license" && <LicenseManagement />}
        {activeTab === "register" && <IPRegistration />}
        {activeTab === "royalty" && <RoyaltyManagement />}
      </Layout>
    </WalletProvider>
  )
}
