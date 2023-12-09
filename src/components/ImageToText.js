import React, { useState } from 'react';
import Tesseract from 'tesseract.js';
import CopyToClipboard from 'react-copy-to-clipboard';
import 'bootstrap/dist/css/bootstrap.min.css';

const ImageToTextConverter = () => {
  const [images, setImages] = useState([]);
  const [texts, setTexts] = useState([]);

  const handleImageUpload = async (e) => {
    const files = e.target.files || e.dataTransfer.files;

    // Filter out non-image files
    const imageFiles = Array.from(files).filter((file) => file.type.startsWith('image/'));

    // Process each image file
    for (const imageFile of imageFiles) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        // Perform OCR on the image
        const { data: { text } } = await Tesseract.recognize(reader.result, 'eng');

        // Update state with the new image and extracted text
        setImages((prevImages) => [...prevImages, reader.result]);
        setTexts((prevTexts) => [...prevTexts, text]);
      };

      reader.readAsDataURL(imageFile);
    }
  };

  return (
    <div className="container mt-4">
      <input
        type="file"
        onChange={handleImageUpload}
        accept="image/*"
        multiple
        style={{ display: 'none' }}
        id="fileInput"
      />
      <label htmlFor="fileInput" className="btn btn-primary">
        Drag and drop or click to select multiple image files
      </label>
      {images.map((image, index) => (
        <div key={index} className="mt-4">
          <img
            src={image}
            alt={`Uploaded ${index}`}
            className="img-fluid"
            style={{ height: '200px', objectFit: 'cover', marginBottom: '10px' }}
          />
          <CopyToClipboard text={texts[index]}>
            <div className="card" style={{ height: '200px', overflowY: 'auto' }}>
              <div className="card-body">
                <p className="card-text">Extracted Text: {texts[index]}</p>
              </div>
              <div className="card-footer">
                <button className="btn btn-secondary" onClick={() => alert('Text copied to clipboard!')}>
                  Copy
                </button>
                <a
                  className="btn btn-success ml-2"
                  href={`data:text/plain;charset=utf-8,${encodeURIComponent(texts[index])}`}
                  download={`extracted_text_${index}.txt`}
                >
                  Download
                </a>
              </div>
            </div>
          </CopyToClipboard>
        </div>
      ))}
    </div>
  );
};

export default ImageToTextConverter;
