"use client";

import Link from "next/link";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { BugAntIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { Address } from "~~/components/scaffold-eth";
import { useEffect, useState } from "react";

// const backend_url = process.env.NEXT_PUBLIC_BACK_ENDPOINT;
// const backend_url = `${window.location.protocol}//${window.location.hostname}:${process.env.NEXT_PUBLIC_BACKEND_PORT}`;
const backend_url = `http://${window.location.hostname}:${process.env.NEXT_PUBLIC_BACKEND_PORT}`;

// let selectedHash: string;

const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();
  const [contractAddress, setContractAddress] = useState();

  useEffect(() => {
    fetch(backend_url + "/contract-address")
      .then(res => res.json())
      .then(data => {
        setContractAddress(data.result);
        console.log(`Contract Address:${data.result}`);
      });
  }, []);

  return (
    <>
      <div className="flex items-center flex-col flex-grow pt-10">
        <div className="px-5">
          <h1 className="text-center">
            <span className="block text-2xl mb-2">Welcome to</span>
            <span className="block text-4xl font-bold">AI Diagnose</span>
          </h1>
          <div className="flex justify-center items-center space-x-2">
            <p className="my-2 font-medium">Patient Address:</p>
            <Address address={connectedAddress} />
          </div>
        </div>

        <div className="flex-grow bg-base-300 w-full mt-16 px-8 py-12">
          {
            (connectedAddress) ? <ContractAddress /> : <div></div>
          }
        </div>
      </div>
    </>
  );
};


function ContractAddress() {
  const { address: connectedAddress } = useAccount();

  const [data, setData] = useState<{ result: string[] }>();
  const [isLoading, setLoading] = useState(true);
  const [selectedHash, setSelectedHash] = useState("");

  function handleHashChange(e:any) {
    setSelectedHash(e.currentTarget.value);
    // console.log(`selectedHash: ${selectedHash}`);
  }

  useEffect(() => {
    // const objCallBody = { patientAddress: connectedAddress }
    const objCallBody = { patientAddress: "0x8757c7D953ea058baCDF82717Caf403Bd01F1099" }
    fetch(backend_url + "/get-patient-diagnoses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(objCallBody),
    })
      .then(res => res.json())
      .then(data => {
        setSelectedHash("");
        console.log(`body: ${objCallBody}`);
        setData(data);
        setLoading(false);
      });
  }, []);

  if (isLoading) return <p>Loading patient diagnoses...</p>;
  if (!data) return <p>No diagnoses information</p>;

  return (
    <div className="flex justify-center items-center gap-12 flex-col sm:flex-row">
      <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center max-w-xs rounded-3xl">
        <p className="mt-0 mb-0 font-medium">Patient Images:</p>
        <p>
            {data.result.reverse().map((ipfsHash: string | undefined) => (
              <span>
                <input className="w-full" type="radio" value={ipfsHash} name="diagnoses" onChange={handleHashChange} />
                {ipfsHash?.slice(0, 6) + "..." + ipfsHash?.slice(-4)}                
                <br />
              </span>
            ))}
        </p>
      </div>
      <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center max-w-xs rounded-3xl">
        <p>
          {
            (selectedHash !== "") ? 
              <div>
                <div className="flex justify-center items-center space-x-2">
                  <p className="my-2 font-medium">{selectedHash?.slice(0, 6) + "..." + selectedHash?.slice(-4)}</p>
                </div>
                <img src={"https://ipfs.io/ipfs/" + selectedHash} alt="" /> 
              </div>
            : <></>

          }
        </p>
      </div>
    </div>
  );
}


export default Home;
