"use client";

import { useState } from "react";
import { ethers } from "ethers";
import { IPX_ABI, IPX_ADDRESS } from "@/utils/constants";

export default function BuyIP() {
  const [tokenId, setTokenId] = useState("");
  const [ipData, setIpData] = useState<any>(null);
  const [account, setAccount] = useState<string>("");
  const [contractName, setContractName] = useState<string>("");
  const [ips, setIps] = useState<IPStruct[]>([]);

  const connectWallet = async () => {
    if (window.ethereum) {
      const provider = new ethers.BrowserProvider(window.ethereum);
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      setAccount(address);

      const ipx = new ethers.Contract(IPX_ADDRESS, IPX_ABI, signer);
      const name = await ipx.name();
      setContractName(name);
    }
  };

  const handleBuyIP = async (tokenId: number) => {
    try {
      if (!window.ethereum) throw new Error("Please install MetaMask");

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(IPX_ADDRESS, IPX_ABI, signer);
      const userAddress = await signer.getAddress();

      const balance = await provider.getBalance(userAddress);
      const ipData = await contract.ips(tokenId);
      const basePrice = ipData.basePrice;

      console.log("Rent price in wei:", basePrice.toString());
      console.log("Your balance:", ethers.formatEther(balance), "ETH");

      if (balance < basePrice) {
        alert("Saldo tidak cukup untuk membeli NFT ini");
        return;
      }

      const tx = await contract.buyIP(Number(tokenId), { value: basePrice });
      const receipt = await tx.wait();
      console.log("Transaction confirmed:", receipt);
      alert("IP purchased successfully!");
    } catch (err: any) {
      alert(`Error: ${err.message}`);
      console.log(err.message);
      if (err?.code === "CALL_EXCEPTION") {
        alert(
          "Transaksi gagal: kemungkinan token ID tidak valid atau sudah disewa."
        );
      } else if (err?.code === "INSUFFICIENT_FUNDS") {
        alert("Saldo tidak mencukupi untuk gas dan beli.");
      } else {
        alert("Gagal beli NFT. Lihat console untuk detail.");
      }
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-xl shadow-md">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Buy IP</h2>

      <input
        type="text"
        value={tokenId}
        onChange={(e) => setTokenId(e.target.value)}
        placeholder="Enter Token ID"
        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />

      <button
        onClick={() => handleBuyIP(tokenId)}
        className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md transition duration-200"
      >
        Buy Now
      </button>

      {ipData && (
        <div className="mt-6 text-sm bg-gray-50 p-4 rounded-md shadow-inner space-y-2">
          <p>
            <span className="font-semibold">Title:</span> {ipData.title}
          </p>
          <p>
            <span className="font-semibold">Description:</span>{" "}
            {ipData.description}
          </p>
          <p>
            <span className="font-semibold">Category:</span>{" "}
            {ipData.category?.toString()}
          </p>
          <p>
            <span className="font-semibold">Tag:</span> {ipData.tag}
          </p>
          <p>
            <span className="font-semibold">File:</span> {ipData.file}
          </p>
          <p>
            <span className="font-semibold">License Option:</span>{" "}
            {ipData.licenseOpt}
          </p>
          <p>
            <span className="font-semibold">Base Price:</span>{" "}
            {ethers.formatEther(ipData.basePrice)} ETH
          </p>
          <p>
            <span className="font-semibold">Rent Price:</span>{" "}
            {ethers.formatEther(ipData.rentPrice)} ETH
          </p>
          <p>
            <span className="font-semibold">Royalty %:</span>{" "}
            {ipData.royaltyPercentage?.toString()}%
          </p>
        </div>
      )}
    </div>
  );
}
