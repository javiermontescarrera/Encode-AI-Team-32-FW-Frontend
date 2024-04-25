import { useState } from "react";
// import { useContractWrite, usePrepareContractWrite, useWaitForTransaction } from "wagmi";
import { 
  type BaseError, 
  useWaitForTransactionReceipt, 
  useWriteContract 
} from 'wagmi';

export function UploadImage(params: any) {
  // console.log(JSON.stringify(params));

  // Wagmi new version====================================================================================
  const { 
    data: hash,
    error,  
    isPending, 
    writeContract 
  } = useWriteContract() 

  const { isLoading: isConfirming, isSuccess: isConfirmed } = 
    useWaitForTransactionReceipt({ 
      hash, 
    })
  // =====================================================================================================

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isLoading, setLoading] = useState(false);
  const [diagnose, setDiagnose] = useState("");
  const [ipfsHash, setIpfsHash] = useState("");

  const handleGetDiagnose = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setSelectedImage(file);

    const formData = new FormData();
    formData.append('image', file);

    fetch(`${params.backend_url}/upload-image`, {
      method: "POST",
      body: formData,
    })
      .then(res => res.json())
      .then(async data => {
        setSelectedImage(null);
        console.log(`Upload response: ${JSON.stringify(data.result)}`);

        // AI bone fracture detection:
        fetch(`${params.ai_url}/object-detection/${data.result.filename}`)
        .then((response) => response.json())
        .then((aiData) => {
          console.log(`AI response: ${JSON.stringify(aiData)}`);

          setDiagnose(aiData.diagnose);
          const objIPFSUploadBody = {imageName: aiData.outputFileName};
          console.log(`objIPFSUploadBody: ${JSON.stringify(objIPFSUploadBody)}`);

          // Uploading the resulting analyzed image to IPFS:
          fetch(`${params.backend_url}/upload-to-ipfs`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(objIPFSUploadBody),
          })
            .then(res => res.json())
            .then(ipfsData => {
              console.log(`IPFS response: ${JSON.stringify(ipfsData)}`);
              setIpfsHash(ipfsData.result.IpfsHash);
              setLoading(false);
              // write?.();

              console.log(`ipfsData.IpfsHash> ${ipfsData.result.IpfsHash}`);
              console.log(`aiData.diagnose> ${aiData.diagnose}`);
              writeContract({ 
                address: `${params.contractAddress}`, 
                abi: params.contractAbi, 
                functionName: 'recordDiagnose', 
                args: [ipfsData.result.IpfsHash, aiData.diagnose], 
              })
            });
        });
      });
  };

  // Wagmi call ==========================================================================================
  // const {
  //   config: config,
  //   error: prepareError,
  //   isError: isPrepareError,
  // } = usePrepareContractWrite({
  //   address: `${params.contracAddress}`,
  //   abi: params.contractAbi,
  //   functionName: "recordDiagnose",
  //   args: [ipfsHash.toString(), diagnose.toString()],
  //   enabled: true,
  // });

  // const { data: data, error: error, isError: isError, write: write } = useContractWrite(config);
  // const { isLoading: isLoading, isSuccess: isSuccess } = useWaitForTransaction({
  //   hash: data?.hash,
  // });

  // if (isPrepareError) {
  //   console.log(`PrepareError: ${prepareError?.message}`);
  // }
  // if (isError) {
  //   console.log(`Error: ${error?.message}`);
  // }
  // if (isLoading) console.log("Executing maintenance task");
  // if (isSuccess) {
  //   console.log("Execute task successful");
  //   setTimeout(() => {
  //     window.parent.location = window.parent.location.href;
  //   }, 2000);
  // }
  // =====================================================================================================


  const handleNewDiagnose = (event: any) => {
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    fileInput.click();
  }

  if (isLoading) return <p>Processing uploaded image...</p>;

  return (
    <>
      <div className="wrapper">
        <input
          type="file"
          accept="image/*"
          id="fileInput"
          style={{ display: 'none' }} // Hide the input element
          onChange={handleGetDiagnose}
        />
        {selectedImage && <p>Selected image: {selectedImage.name}</p>}
        <button 
          className="btn btn-primary"
          disabled={isPending} 
          onClick={handleNewDiagnose}>
          {isPending ? 'Adding to the blockchain...' : 'Add Image'}
        </button>

        {hash && <div>Transaction Hash: {hash}</div>}
        {isConfirming && <div>Waiting for confirmation...</div>} 
        {isConfirmed && <div>Transaction confirmed.</div>}  
        {error && ( 
          <div>Error: {(error as BaseError).shortMessage || error.message}</div> 
        )}
      </div>
    </>
  );
}
