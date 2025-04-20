"use client"

import type React from "react"
import { useEffect, useState, createContext, useContext } from "react"

interface WalletContextType {
  connected: boolean
  connecting: boolean
  address: string
  connect: () => void
  disconnect: () => void
}

const WalletContext = createContext<WalletContextType>({
  connected: false,
  connecting: false,
  address: "",
  connect: () => {},
  disconnect: () => {},
})

export const useWallet = () => useContext(WalletContext)

export const WalletProvider: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
  const [connected, setConnected] = useState(false)
  const [connecting, setConnecting] = useState(false)
  const [address, setAddress] = useState("")

  // Simulate wallet connection
  const connect = async () => {
    setConnecting(true)
    try {
      // Simulate connection delay
      await new Promise((resolve) => setTimeout(resolve, 1500))
      // Generate a mock Ethereum address
      const mockAddress = "0x" + Math.random().toString(16).slice(2, 12) + Math.random().toString(16).slice(2, 12)
      setAddress(mockAddress)
      setConnected(true)
      // Store in local storage to persist the connection
      localStorage.setItem("walletConnected", "true")
      localStorage.setItem("walletAddress", mockAddress)
    } catch (error) {
      console.error("Error connecting wallet:", error)
    } finally {
      setConnecting(false)
    }
  }

  const disconnect = () => {
    setConnected(false)
    setAddress("")
    localStorage.removeItem("walletConnected")
    localStorage.removeItem("walletAddress")
  }

  // Check for existing connection on mount
  useEffect(() => {
    const isConnected = localStorage.getItem("walletConnected") === "true"
    const savedAddress = localStorage.getItem("walletAddress")
    if (isConnected && savedAddress) {
      setConnected(true)
      setAddress(savedAddress)
    }
  }, [])

  return (
    <WalletContext.Provider
      value={{
        connected,
        connecting,
        address,
        connect,
        disconnect,
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}
