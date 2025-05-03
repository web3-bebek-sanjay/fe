"use client";

import { useState } from "react";
import { ethers } from "ethers";
import { IPX_ABI, IPX_ADDRESS } from "@/utils/constants";

// Definisikan jaringan Pharos Devnet
const pharosDevnet = {
  id: 50002,
  name: "PharosDevnet",
  nativeCurrency: {
    decimals: 18,
    name: "Ether",
    symbol: "ETH",
  },
  rpcUrls: {
    default: {
      http: ["https://devnet.dplabs-internal.com"],
      webSocket: ["wss://devnet.dplabs-internal.com"],
    },
  },
  blockExplorers: {
    default: { name: "Explorer", url: "https://pharosscan.xyz/" },
  },
};

export default function FormRegisterIP() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(0);
  const [tag, setTag] = useState("");
  const [fileUpload, setFileUpload] = useState("");
  const [licenseOpt, setLicenseOpt] = useState(0);
  const [basePrice, setBasePrice] = useState("");
  const [rentPrice, setRentPrice] = useState("");
  const [royaltyPercentage, setRoyaltyPercentage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState("");
  const [tokenId, setTokenId] = useState("");
  const [ipData, setIpData] = useState<any>(null);

  const handleSubmit = async () => {
    try {
      if (!window.ethereum) throw new Error("Please install MetaMask");
      setLoading(true);

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(IPX_ADDRESS, IPX_ABI, signer);

      console.log({
        licenseOpt,
        type: typeof licenseOpt,
      });

      const tx = await contract.registerIP(
        title,
        description,
        category,
        tag,
        fileUpload,
        Number(licenseOpt),
        ethers.parseUnits(basePrice, 18),
        ethers.parseUnits(rentPrice, 18),
        royaltyPercentage,
        { gasLimit: 5000000 }
      );

      const receipt = await tx.wait();
      const event = receipt.logs.find(
        (log) => log.address.toLowerCase() === IPX_ADDRESS.toLowerCase()
      );

      // Decode tokenId from event if emitted (optional)
      // You may need to adjust this based on your smart contract event
      // For now, just save tx hash
      setTxHash(tx.hash);
      console.log("Transaction Hash:", tx.hash);
    } catch (err: any) {
      alert(`Error: ${err.message}`);
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGetIP = async () => {
    try {
      if (!window.ethereum) throw new Error("Please install MetaMask");

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(IPX_ADDRESS, IPX_ABI, signer);

      const ip = await contract.getIP(tokenId);
      setIpData(ip);
      console.log("Fetched IP:", ip);
    } catch (err: any) {
      alert(`Error: ${err.message}`);
      console.error(err.message);
    }
  };

  return (
    <div className="p-4 border rounded-xl w-full max-w-md bg-white shadow">
      <h2 className="text-lg font-bold mb-4">Register IP</h2>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="input"
        placeholder="Title"
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="input"
        placeholder="Description"
      />
      <input
        type="number"
        value={category}
        onChange={(e) => setCategory(Number(e.target.value))}
        className="input"
        placeholder="Category (uint)"
      />
      <input
        value={tag}
        onChange={(e) => setTag(e.target.value)}
        className="input"
        placeholder="Tag"
      />
      <input
        value={fileUpload}
        onChange={(e) => setFileUpload(e.target.value)}
        className="input"
        placeholder="File Upload (e.g., IPFS URL)"
      />
      <input
        type="number"
        value={licenseOpt}
        onChange={(e) => setLicenseOpt(Number(e.target.value))}
        className="input"
        placeholder="License Option (uint8)"
      />
      <input
        type="text"
        value={basePrice}
        onChange={(e) => setBasePrice(e.target.value)}
        className="input"
        placeholder="Base Price (ETH)"
      />
      <input
        type="text"
        value={rentPrice}
        onChange={(e) => setRentPrice(e.target.value)}
        className="input"
        placeholder="Rent Price (ETH)"
      />
      <input
        type="number"
        value={royaltyPercentage}
        onChange={(e) => setRoyaltyPercentage(Number(e.target.value))}
        className="input"
        placeholder="Royalty (%)"
      />

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="mt-4 bg-blue-600 text-white py-2 px-4 rounded"
      >
        {loading ? "Registering..." : "Register IP"}
      </button>

      {txHash && (
        <p className="mt-3 text-green-700">
          ✅ Registered! Tx:{" "}
          <a
            href={`https://pharosscan.xyz/tx/${txHash}`}
            target="_blank"
            className="underline"
          >
            {txHash.slice(0, 10)}...
          </a>
        </p>
      )}

      <div className="mt-8 border-t pt-4">
        <h3 className="text-md font-semibold mb-2">Get IP by Token ID</h3>
        <input
          value={tokenId}
          onChange={(e) => setTokenId(e.target.value)}
          className="input"
          placeholder="Enter Token ID"
        />
        <button
          onClick={handleGetIP}
          className="bg-green-600 text-white py-2 px-4 rounded mt-2"
        >
          Fetch IP
        </button>

        {ipData && (
          <div className="mt-4 text-sm bg-gray-100 p-3 rounded">
            <p>
              <strong>Title:</strong> {ipData.title}
            </p>
            <p>
              <strong>Description:</strong> {ipData.description}
            </p>
            <p>
              <strong>Category:</strong> {ipData.category.toString()}
            </p>
            <p>
              <strong>Tag:</strong> {ipData.tag}
            </p>
            <p>
              <strong>File:</strong> {ipData.fileUpload}
            </p>
            <p>
              <strong>License Option:</strong> {ipData.licenseopt}
            </p>
            <p>
              <strong>Base Price:</strong>{" "}
              {ethers.formatEther(ipData.basePrice)} ETH
            </p>
            <p>
              <strong>Rent Price:</strong>{" "}
              {ethers.formatEther(ipData.rentPrice)} ETH
            </p>
            <p>
              <strong>Royalty %:</strong> {ipData.royaltyPercentage.toString()}%
            </p>
          </div>
        )}
      </div>

      <style jsx>{`
        .input {
          width: 100%;
          padding: 8px;
          margin-bottom: 10px;
          border: 1px solid #ccc;
          border-radius: 6px;
        }
      `}</style>
    </div>
  );
}
