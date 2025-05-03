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
  const [royaltyPercentage, setRoyaltyPercentage] = useState("");
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState("");

  const handleSubmit = async () => {
    try {
      if (!window.ethereum) throw new Error("Please install MetaMask");
      setLoading(true);

      // Menambahkan RPC PharosDevnet ke provider
      const provider = new ethers.BrowserProvider(window.ethereum, {
        chainId: pharosDevnet.id,
        name: pharosDevnet.name,
        rpcUrls: pharosDevnet.rpcUrls.default.http,
      });
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(IPX_ADDRESS, IPX_ABI, signer);

      const tx = await contract.registerIP(
        title,
        description,
        category,
        tag,
        fileUpload,
        licenseOpt,
        ethers.parseUnits(basePrice, 18),
        ethers.parseUnits(rentPrice, 18),
        royaltyPercentage, 
        { gasLimit: 5000000 } // coba set gasLimit lebih tinggi
      );
      

      await tx.wait();
      setTxHash(tx.hash);
      console.log()
    } catch (err: any) {
      alert(`Error: ${err.message}`);
      console.log(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-xl w-full max-w-md bg-white shadow">
      <h2 className="text-lg font-bold mb-4">Register IP</h2>
      <input value={title} onChange={(e) => setTitle(e.target.value)} className="input" placeholder="Title" />
      <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="input" placeholder="Description" />
      <input type="number" value={category} onChange={(e) => setCategory(Number(e.target.value))} className="input" placeholder="Category (uint)" />
      <input value={tag} onChange={(e) => setTag(e.target.value)} className="input" placeholder="Tag" />
      <input value={fileUpload} onChange={(e) => setFileUpload(e.target.value)} className="input" placeholder="File Upload (e.g., IPFS URL)" />
      <input type="number" value={licenseOpt} onChange={(e) => setLicenseOpt(Number(e.target.value))} className="input" placeholder="License Option (uint8)" />
      <input type="text" value={basePrice} onChange={(e) => setBasePrice(e.target.value)} className="input" placeholder="Base Price (ETH)" />
      <input type="text" value={rentPrice} onChange={(e) => setRentPrice(e.target.value)} className="input" placeholder="Rent Price (ETH)" />
      <input type="number" value={royaltyPercentage} onChange={(e) => setRoyaltyPercentage(Number(e.target.value))} className="input" placeholder="Royalty (%)" />

      <button onClick={handleSubmit} disabled={loading} className="mt-4 bg-blue-600 text-white py-2 px-4 rounded">
        {loading ? "Registering..." : "Register IP"}
      </button>

      {txHash && (
        <p className="mt-3 text-green-700">
          ✅ Registered! Tx: <a href={`https://pharosscan.xyz/tx/${txHash}`} target="_blank" className="underline">{txHash.slice(0, 10)}...</a>
        </p>
      )}

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
