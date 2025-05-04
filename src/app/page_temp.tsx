"use client";

import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { IPX_ABI, IPX_ADDRESS } from "@/utils/constants";
import FormRegisterIP from "@/components/FormRegisterIP";


export default function Home() {
  const [account, setAccount] = useState<string>("");
  const [contractName, setContractName] = useState<string>("");
  const [metadataURI, setMetadataURI] = useState<string>("");
  const [ips, setIps] = useState<IPStruct[]>([]);
  const [nonRemixIps, setNonRemixIps] = useState<IPStruct[]>([]);
  const [myRemixes, setMyRemixes] = useState<RemixInfoStruct[]>([]);

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

  interface IPStruct {
    title: string;
    description: string;
    category: bigint;
    tag: string;
    fileUpload: string;
    licenseopt: number;
    basePrice: bigint;
    rentPrice: bigint;
    royaltyPercentage: bigint;
    owner: string;
  }

  interface RemixInfoStruct {
    ip: IPStruct;
    parentId: bigint;
  }

  const fetchIPsByOwner = async (address: string): Promise<IPStruct[]> => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const ipx = new ethers.Contract(IPX_ADDRESS, IPX_ABI, signer);

    const ips: IPStruct[] = await ipx.getIPsNotOwnedBy(address);
    return ips;
  };

  const fetchNonRemixIPs = async (address: string): Promise<IPStruct[]> => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const ipx = new ethers.Contract(IPX_ADDRESS, IPX_ABI, signer);

    const ips: IPStruct[] = await ipx.get_non_remix(address);
    return ips;
  };

  const fetchMyRemixes = async (address: string): Promise<RemixInfoStruct[]> => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const ipx = new ethers.Contract(IPX_ADDRESS, IPX_ABI, signer);

    const remixes: RemixInfoStruct[] = await ipx.getMyRemix(address);
    return remixes;
  };

  const loadMyIPs = async () => {
    if (!account) return;
    const [myIPs, nonRemix, remixes] = await Promise.all([
      fetchIPsByOwner(account),
      fetchNonRemixIPs(account),
      fetchMyRemixes(account),
    ]);

    setIps(myIPs);
    setNonRemixIps(nonRemix);
    setMyRemixes(remixes);
  };

  useEffect(() => {
    if (account) {
      loadMyIPs();
    }
  }, [account]);

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

            {ips.length > 0 && (
              <div className="mt-6">
                <h2 className="text-xl font-semibold mb-2">My IPs:</h2>
                <ul className="space-y-2">
                  {ips.map((ip, index) => (
                    <li key={index} className="border p-3 rounded bg-gray-100">
                      <p className="font-bold">{ip.title}</p>
                      <p>{ip.description}</p>
                      <p className="text-sm text-gray-600">
                        Rent: {ethers.formatEther(ip.rentPrice)} ETH
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {nonRemixIps.length > 0 && (
              <div className="mt-6">
                <h2 className="text-xl font-semibold mb-2">Non-Remix IPs:</h2>
                <ul className="space-y-2">
                  {nonRemixIps.map((ip, index) => (
                    <li key={index} className="border p-3 rounded bg-yellow-100">
                      <p className="font-bold">{ip.title}</p>
                      <p>{ip.description}</p>
                      <p className="text-sm text-gray-600">
                        Rent: {ethers.formatEther(ip.rentPrice)} ETH
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {myRemixes.length > 0 && (
              <div className="mt-6">
                <h2 className="text-xl font-semibold mb-2">My Remix IPs:</h2>
                <ul className="space-y-2">
                  {myRemixes.map((remix, index) => (
                    <li key={index} className="border p-3 rounded bg-blue-100">
                      <p className="font-bold">{remix.ip.title}</p>
                      <p>{remix.ip.description}</p>
                      <p className="text-sm text-gray-600">Parent ID: {remix.parentId.toString()}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}



// ryan
// buy
// remix
// getipbyowners [done]
// getlistrent
// getmyipremix
// getlistrentfrommyip

// alex
// rentip [done]
// getip [done]
// getipnotownedby [done]
// getnonremix [done]
// getmyremix [done]