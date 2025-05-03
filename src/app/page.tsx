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
  const [tokenId, setTokenId] = useState<string>("");
  const [parentId, setParentId] = useState<string>("");
  const [ips, setIps] = useState<IPStruct[]>([]);
  const [nonRemixIps, setNonRemixIps] = useState<IPStruct[]>([]);
  const [rentList, setRentList] = useState<
    { index: number; renter: string; expiresAt: string }[]
  >([]);
  const [remixList, setRemixList] = useState<any[]>([]);
  const [parentTokenId, setParentTokenId] = useState("");

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
        alert(
          "Transaksi gagal: kemungkinan token ID tidak valid atau sudah disewa."
        );
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

  const fetchIPsByOwner = async (address: string): Promise<IPStruct[]> => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const ipx = new ethers.Contract(IPX_ADDRESS, IPX_ABI, signer);
    const ips: IPStruct[] = await ipx.getIPsByOwner(address);
    return ips;
  };

  const fetchNonRemixIPs = async (address: string): Promise<IPStruct[]> => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const ipx = new ethers.Contract(IPX_ADDRESS, IPX_ABI, signer);
    const result: IPStruct[] = await ipx.get_non_remix(address);
    return result;
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

  const handleRemixIP = async (parentId: number) => {
    try {
      if (!window.ethereum) throw new Error("Please install MetaMask");

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(IPX_ADDRESS, IPX_ABI, signer);

      const ipData = await contract.ips(parentId);

      const tx = await contract.remixIP(
        ipData.title,
        ipData.description,
        ipData.category.toNumber(),
        ipData.tag,
        ipData.file,
        ipData.royaltyPercentage.toNumber(),
        parentId
      );
      const receipt = await tx.wait();
      console.log("Transaction confirmed:", receipt);
      alert("IP remixeds successfully!");
    } catch (err: any) {
      alert(`Error: ${err.message}`);
      console.log(err.message);
      if (err?.code === "CALL_EXCEPTION") {
        alert(
          "Transaksi gagal: kemungkinan token ID tidak valid atau sudah disewa."
        );
      } else {
        alert("Gagal remix NFT. Lihat console untuk detail.");
      }
    }
  };

  const getListRent = async () => {
    try {
      if (!window.ethereum) throw new Error("Please install MetaMask");

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const userAddress = await signer.getAddress();
      const contract = new ethers.Contract(IPX_ADDRESS, IPX_ABI, provider);
      const rentList = await contract.getListRent(userAddress);

      console.log("List of rented IPs", rentList);

      const formatted = rentList.map((rent: any, index: number) => ({
        index,
        renter: rent.renter,
        expiresAt: new Date(Number(rent.expiresAt) * 1000).toLocaleString(),
      }));

      // console.table(formatted);
      setRentList(formatted);
    } catch (error: any) {
      console.log("Failed to fetch rent list:", error.message);
      alert("Failed to fetch rent list. Check console.");
      return [];
    }
  };

  const getMyIPRemix = async () => {
    try {
      if (!window.ethereum) throw new Error("Please install MetaMask");

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(IPX_ADDRESS, IPX_ABI, provider);

      const results = await contract.getMyIPsRemix(Number(parentTokenId));

      const formatted = results.map((item: any, index: number) => ({
        index,
        title: item.ip.title,
        description: item.ip.description,
        owner: item.ip.owner,
        category: item.ip.category,
        tag: item.ip.tag,
        file: item.ip.fileUpload,
        licenseopt: item.ip.licenseopt,
        basePrice: ethers.formatEther(item.ip.basePrice),
        rentPrice: ethers.formatEther(item.ip.rentPrice),
        royalty: item.ip.royaltyPercentage,
        parentId: item.parentId,
      }));

      setRemixList(formatted);
    } catch (error: any) {
      console.log("Error fetching remix list:", error.message);
      alert("Failed to fetch remix list");
    }
  };

  const loadMyIPs = async () => {
    if (!account) return;
    const myIPs = await fetchIPsByOwner(account);
    const myNonRemixIPs = await fetchNonRemixIPs(account);
    setIps(myIPs);
    setNonRemixIps(myNonRemixIPs);
  };

  useEffect(() => {
    if (account) loadMyIPs();
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
              onClick={() => rentIP(3)}
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
                  {nonRemixIps.map(
                    (ip, index) =>
                      ip.title !== "" && (
                        <li
                          key={index}
                          className="border p-3 rounded bg-gray-100"
                        >
                          <p className="font-bold">{ip.title}</p>
                          <p>{ip.description}</p>
                          <p className="text-sm text-gray-600">
                            Rent: {ethers.formatEther(ip.rentPrice)} ETH
                          </p>
                        </li>
                      )
                  )}
                </ul>
              </div>
            )}
          </div>
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
              onClick={() => handleBuyIP(Number(tokenId))}
              className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md transition duration-200"
            >
              Buy Now
            </button>
          </div>
          <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-xl shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              Remix IP
            </h2>

            <input
              type="text"
              value={parentId}
              onChange={(e) => setParentId(e.target.value)}
              placeholder="Enter Token ID"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />

            <button
              onClick={() => handleRemixIP(Number(parentId))}
              className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md transition duration-200"
            >
              Remix Now
            </button>
          </div>
          <div className="max-w-2xl mx-auto mt-10">
            <button
              onClick={getListRent}
              className="mb-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md transition duration-200"
            >
              Load My Rented IPs
            </button>

            {rentList.length > 0 ? (
              <table className="w-full table-auto border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-4 py-2">#</th>
                    <th className="border border-gray-300 px-4 py-2">Renter</th>
                    <th className="border border-gray-300 px-4 py-2">
                      Expires At
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rentList.map((item) => (
                    <tr key={item.index}>
                      <td className="border border-gray-300 px-4 py-2">
                        {item.index + 1}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {item.renter}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {item.expiresAt}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-gray-600">No rented IPs found.</p>
            )}
          </div>
          <div className="max-w-3xl mx-auto mt-10 p-6 bg-white rounded-xl shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              My Remix IPs
            </h2>

            <input
              type="text"
              value={parentTokenId}
              onChange={(e) => setParentTokenId(e.target.value)}
              placeholder="Enter Parent Token ID"
              className="w-full px-4 py-2 mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />

            <button
              onClick={getMyIPRemix}
              className="mb-6 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md transition duration-200"
            >
              Load Remix IPs
            </button>

            {remixList.length > 0 ? (
              <table className="w-full table-auto border-collapse border border-gray-300 text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border px-4 py-2">#</th>
                    <th className="border px-4 py-2">Title</th>
                    <th className="border px-4 py-2">Tag</th>
                    <th className="border px-4 py-2">Base Price</th>
                    <th className="border px-4 py-2">Rent Price</th>
                    <th className="border px-4 py-2">Royalty</th>
                  </tr>
                </thead>
                <tbody>
                  {remixList.map((item) => (
                    <tr key={item.index}>
                      <td className="border px-4 py-2">{item.index + 1}</td>
                      <td className="border px-4 py-2">{item.title}</td>
                      <td className="border px-4 py-2">{item.tag}</td>
                      <td className="border px-4 py-2">{item.basePrice} ETH</td>
                      <td className="border px-4 py-2">{item.rentPrice} ETH</td>
                      <td className="border px-4 py-2">{item.royalty}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-gray-600">
                No remix IPs found for this parent ID.
              </p>
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
// getnonremix []
// getmyremix
// nanti hapus jangan lupa
