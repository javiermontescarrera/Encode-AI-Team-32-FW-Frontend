"use client";

import Link from "next/link";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
// import { BugAntIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { Address } from "~~/components/scaffold-eth";
import { UploadImage } from "~~/components/UploadImage";
import { useEffect, useState } from "react";

// const BACKEND_URL = process.env.NEXT_PUBLIC_BACK_ENDPOINT;
// const BACKEND_URL = `${window.location.protocol}//${window.location.hostname}:${process.env.NEXT_PUBLIC_BACKEND_PORT}`;
const BACKEND_URL = `http://${window.location.hostname}:${process.env.NEXT_PUBLIC_BACKEND_PORT}`;

const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();
  const [contractAddress, setContractAddress] = useState();

  useEffect(() => {
    fetch(BACKEND_URL + "/contract-address")
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
            (connectedAddress) ? <Diagnoses /> : <div></div>
          }
        </div>
      </div>
    </>
  );
};


function Diagnoses() {
  const { address: connectedAddress } = useAccount();

  const [data, setData] = useState<{ result: string[] }>();
  const [isLoading, setLoading] = useState(true);
  const [selectedHash, setSelectedHash] = useState("");
  const [diagnoseDetailsData, setDiagnoseDetailsData] = useState<{ result: object }>();
  const [isdiagnoseDetailsLoading, setDiagnoseDetailsLoading] = useState(true);
  
  function handleHashChange(e:any) {
    setSelectedHash(e.currentTarget.value);
    // console.log(`selectedHash: ${e.currentTarget.value}`);
  }

  useEffect(() => {
    // const objCallBody = { patientAddress: connectedAddress }
    const objCallBody = { patientAddress: "0x8757c7D953ea058baCDF82717Caf403Bd01F1099" }
    fetch(BACKEND_URL + "/get-patient-diagnoses", {
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
      {  
        (selectedHash !== "") ? 
          <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center max-w-xs rounded-3xl">
            <DiagnoseDetails selectedHash={selectedHash}/>
          </div>
        :
        <></>
      }
      <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center max-w-xs rounded-3xl">
        <UploadImage backend_url={BACKEND_URL} />
      </div>
    </div>
  );
}

function DiagnoseDetails(params: any) {
  const [data, setData] = useState<{ result: string[] }>();
  const [isLoading, setLoading] = useState(true);
  // const [objBody, setBody] = useState({ diagnoseHash: "" });

  const trimmedHash = params.selectedHash?.slice(0, 6) + "..." + params.selectedHash?.slice(-4);
  // console.log(`trimmedHash: ${trimmedHash}`);

  function formatTimestamp(timestamp:string) {
    const options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
    };
    return new Date(Number(timestamp) * 1000).toLocaleDateString('en-US', options);
  }
  
  useEffect(() => {
    const objBody = { diagnoseHash: params.selectedHash };
    // console.log(`objBody: ${JSON.stringify(objBody)}`);

    fetch(BACKEND_URL + "/get-diagnose-details", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(objBody),
    })
      .then(res => res.json())
      .then(data => {
        console.log(`body: ${JSON.stringify(objBody)}`);
        setData(data);
        setLoading(false);
        // console.log(data.result);
      });
  }, [params.selectedHash]);

  if (isLoading) return <p>Loading ${trimmedHash} diagnose details...</p>;
  if (!data) return <p>No details found</p>;

  return (
    <p>
      <div>
        {  
          (params.selectedHash !== "") ? 
          <>
            <div className="flex justify-center items-center space-x-2">
              <p className="my-2 font-medium">{trimmedHash}</p>
            </div>
            <img src={"https://ipfs.io/ipfs/" + params.selectedHash} alt="" sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
          </>
          : <></>
        }
        {
          ((data.result) && params.selectedHash !== "") ? 
            <span>
              <p className="my-2 font-medium">Diagnose: {data.result[0]}</p>
              <p className="my-2 font-medium">Registered on {formatTimestamp(data.result[1])}</p>
            </span>
          : <></>
        }
        
      </div>
    </p>
  );
}


export default Home;
