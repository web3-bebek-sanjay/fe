"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { IPCard } from "./IPCard"
import { LicenseModal } from "./LicenseModal"
import { useAccount } from "wagmi"
import { useGetNotOwned } from "@/hooks/useGetNotOwned"
import { IPStruct } from "@/lib/app_interface"

// Mock IP data
const mockIPData = [
  {
    id: "1",
    title: "Digital Artwork Collection",
    owner: "0x7a86c0b064171007716bbd6af96676935799a63e",
    fileUpload: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809",
    licenseTypes: ["buy", "rent"],
    category: "Art",
    price: 0.05,
  },
  {
    id: "2",
    title: "Music Production Sample Pack",
    owner: "0x3a26746ddb79b1b8e4450e3f4ffe2e110060eb40",
    fileUpload: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745",
    licenseTypes: ["buy", "rent"],
    category: "Audio",
    price: 0.03,
  },
  {
    id: "3",
    title: "Research Paper: Blockchain Economics",
    owner: "0x1a0f2a21f8b98ee9a6adb648042f94a255e4e4d4",
    fileUpload: "https://images.unsplash.com/photo-1451187580459-43490279c0fa",
    licenseTypes: ["buy"],
    category: "Research",
    price: 0.08,
  },
  {
    id: "4",
    title: "Photography Collection: Urban Landscapes",
    owner: "0x8e23ee67d1332ad560396262c48ffbb01f93d052",
    fileUpload: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df",
    licenseTypes: ["rent"],
    category: "Photography",
    price: 0.02,
  },
  {
    id: "5",
    title: "Game Character Design",
    owner: "0x7a86c0b064171007716bbd6af96676935799a63e",
    fileUpload: "https://images.unsplash.com/photo-1552820728-8b83bb6b773f",
    licenseTypes: ["buy", "rent"],
    category: "Gaming",
    price: 0.15,
  },
  {
    id: "6",
    title: "Software Algorithm Patent",
    owner: "0x1a0f2a21f8b98ee9a6adb648042f94a255e4e4d4",
    fileUpload: "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb",
    licenseTypes: ["buy"],
    category: "Software",
    price: 0.25,
  },
]

interface IPCardGridProps {
  searchQuery: string
}

export const IPCardGrid: React.FC<IPCardGridProps> = ({ searchQuery }) => {
  const [selectedIP, setSelectedIP] = useState<IPStruct>();
  const [isModalOpen, setIsModalOpen] = useState(false)

  const { address } = useAccount()
  const { getIPsNotOwnedBy } = useGetNotOwned()

  const [ips, setIps] = useState<IPStruct[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!address) return

    const fetchIPs = async () => {
      setLoading(true)

      try {
        const data = await getIPsNotOwnedBy(address)
        // console.log(data)

        await new Promise<void>((resolve) => {
          setIps(data)
          requestAnimationFrame(() => resolve())
        })

        console.log("State ips updated:", data)
      } catch (err) {
        console.error("Failed fetching IPs:", err)
      }

      setLoading(false)
    }

    fetchIPs()
  }, [address])


  const handleCardClick = (ip: IPStruct) => {
    setSelectedIP(ip)
    setIsModalOpen(true)
  }

  const filteredIPs = ips.filter(
    (ip) =>
      ip.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div>
      {filteredIPs.length === 0 ? (
        <div className="text-center py-8 text-slate-500">No IP assets found matching your search criteria.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredIPs.map((ip, idx) => (
            <IPCard key={idx} ip={ip} onClick={() => handleCardClick(ip)} />
          ))}
        </div>
      )}
      {selectedIP && <LicenseModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} ip={selectedIP} />}
    </div>
  )
}
