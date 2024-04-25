import { useEffect, useState } from "react";

export function UploadImage(params: any) {
  // console.log(JSON.stringify(params));
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isLoading, setLoading] = useState(false);
  const [diagnose, setDiagnose] = useState("");

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
        .then((data) => {
          console.log(`AI response: ${JSON.stringify(data)}`);

          setDiagnose(data.diagnose);
          const objIPFSUploadBody = {imageName: data.outputFileName};
          // console.log(`objIPFSUploadBody: ${JSON.stringify(objIPFSUploadBody)}`);

          fetch(`${params.backend_url}/upload-to-ipfs`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(objIPFSUploadBody),
          })
            .then(res => res.json())
            .then(ipfsData => {
              setLoading(false);
              
              console.log(`IPFS response: ${JSON.stringify(ipfsData)}`);

              // ipfsData.IpfsHash

            });
        });

        
        
        ;
        // console.log(`AI response: ${JSON.stringify(aiResponse)}`);

        // if (!aiResponse.ok) {
        //   throw new Error(`API request failed with status ${aiResponse.status}`);
        // }

        // const aidata = await aiResponse.json();
        // console.log(`AI data: ${JSON.stringify(aidata)}`);
      });
  };

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
        <button className="btn btn-primary" onClick={handleNewDiagnose}>
          Add Image
        </button>
      </div>
    </>
  );
}
