import { useState } from "react";

export function UploadImage(params: any) {
  // console.log(JSON.stringify(params));
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  const handleGetDiagnose = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSelectedImage(file);

    const formData = new FormData();
    formData.append('image', file);

    fetch(params.backend_url + "/upload-image", {
      method: "POST",
      body: formData,
    })
      .then(res => res.json())
      .then(data => {
        console.log(`Response: ${JSON.stringify(data.result)}`);
        setSelectedImage(null);
      });
  };

  const handleNewDiagnose = (event: any) => {
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    fileInput.click();
  }

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
