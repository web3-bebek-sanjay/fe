// "use client"

// import { useState } from "react"
// import { Layout } from "@/components/Layout"
// import { LicenseManagement } from "@/components/license/LicenseManagement"
// import { IPRegistration } from "@/components/registration/IPRegistration"
// import { RoyaltyManagement } from "@/components/royalty/RoyaltyManagement"
// import { RemixManagement } from "@/components/remix/RemixManagement"
// import { RemixRegistration } from "@/components/remix/RemixRegistration"
// import { History} from "@/components/history/history"

// export default function Home() {
//   const [activeTab, setActiveTab] = useState("license")

//   return (
//     <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
//       {activeTab === "license" && <LicenseManagement />}
//       {activeTab === "registerIP" && <IPRegistration />}
//       {activeTab === "registerRemix" && <RemixRegistration />}
//       {activeTab === "royalty" && <RoyaltyManagement />}
//       {activeTab === "remix" && <RemixManagement />}
//       {activeTab === "history" && <History />}
//     </Layout>
//   )
// }

// IPXFrontendApp/src/app/page.tsx
"use client";

import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { IPX_ABI, IPX_ADDRESS } from "@/utils/constants";
import FormRegisterIP from "@/components/FormRegisterIP";

export default function Home() {
  const [account, setAccount] = useState<string>("");
  const [contractName, setContractName] = useState<string>("");
  const [metadataURI, setMetadataURI] = useState<string>("");

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

  const mintNFT = async () => {
    if (!metadataURI) return alert("Isi metadata URI dulu");
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const ipx = new ethers.Contract(IPX_ADDRESS, IPX_ABI, signer);

    const tx = await ipx.mint(account, metadataURI);
    await tx.wait();
    alert("NFT IP berhasil di-mint!");
  };

  const rentIP = async (tokenId: number) => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const ipx = new ethers.Contract(IPX_ADDRESS, IPX_ABI, signer);
      const userAddress = await signer.getAddress();

      const balance = await provider.getBalance(userAddress);
      const ipData = await ipx.ips(tokenId);
      const rentPrice = ipData.rentPrice;

      console.log("Rent price in wei:", rentPrice.toString());
      console.log("Your balance:", ethers.formatEther(balance), "ETH");

      if (balance < rentPrice) {
        alert("Saldo tidak cukup untuk menyewa NFT ini.");
        return;
      }

      const tx = await ipx.rentIP(tokenId, {
        value: rentPrice,
      });

      console.log("Waiting for transaction confirmation...");
      await tx.wait();

      alert("✅ Berhasil menyewa NFT!");
    } catch (error: any) {
      console.error("❌ Gagal menyewa:", error);
      if (error?.code === "CALL_EXCEPTION") {
        alert("Transaksi gagal: kemungkinan token ID tidak valid atau sudah disewa.");
      } else if (error?.code === "INSUFFICIENT_FUNDS") {
        alert("Saldo tidak mencukupi untuk gas dan sewa.");
      } else {
        alert("Gagal menyewa NFT. Lihat console untuk detail.");
      }
    }
  };


  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <h1 className="text-3xl font-bold mb-4">IPX NFT DApp</h1>

      {!account ? (
        <button
          onClick={connectWallet}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Connect Wallet
        </button>
      ) : (
        <div className="w-full max-w-md">
          <p className="mb-2">Connected as: {account}</p>
          <p className="mb-4">Contract: {contractName}</p>

          <input
            type="text"
            placeholder="Metadata URI (IPFS)"
            className="border p-2 w-full mb-4"
            value={metadataURI}
            onChange={(e) => setMetadataURI(e.target.value)}
          />

          <button
            onClick={mintNFT}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            Mint NFT
          </button>
          <FormRegisterIP />
          <div className="mt-4">
            <button
              onClick={() => rentIP(0)}
              className="bg-purple-600 text-white px-4 py-2 rounded mt-4"
            >
              Sewa NFT ID #1
            </button>
          </div>

        </div>

      )}
    </main>
  );
}

// ryan
// buy
// remix
// getipbyowners
// getlistrent
// getmyipremix
// getlistrentfrommyip

// alex
// rentip [done]
// getip []
// getipnotownedby
// getnonremix
// getmyremix