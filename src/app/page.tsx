"use client"

import { useState } from "react"
import { Layout } from "@/components/Layout"
import { LicenseManagement } from "@/components/license/LicenseManagement"
import { IPRegistration } from "@/components/registration/IPRegistration"
import { RoyaltyManagement } from "@/components/royalty/RoyaltyManagement"
import { RemixManagement } from "@/components/remix/RemixManagement"
import { RemixRegistration } from "@/components/remix/RemixRegistration"
import { History} from "@/components/history/history"

export default function Home() {
  const [activeTab, setActiveTab] = useState("license")

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {activeTab === "license" && <LicenseManagement />}
      {activeTab === "registerIP" && <IPRegistration />}
      {activeTab === "registerRemix" && <RemixRegistration />}
      {activeTab === "royalty" && <RoyaltyManagement />}
      {activeTab === "remix" && <RemixManagement />}
      {activeTab === "history" && <History />}
    </Layout>
  )
}