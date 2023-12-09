import React, { useState } from 'react';
import Tesseract from 'tesseract.js';
import CopyToClipboard from 'react-copy-to-clipboard';
import 'bootstrap/dist/css/bootstrap.min.css';

const ImageToTextConverter = () => {
  const [images, setImages] = useState([]);
  const [texts, setTexts] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const handleImageUpload = async (e) => {
    const files = e.target.files || e.dataTransfer.files;

    // Filter out non-image files
    const imageFiles = Array.from(files).filter((file) => file.type.startsWith('image/'));

    // Process each image file
    for (const imageFile of imageFiles) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImages((prevImages) => [...prevImages, reader.result]);
        setSelectedFiles((prevFiles) => [...prevFiles, imageFile]);
      };

      reader.readAsDataURL(imageFile);
    }
    
    // Clear error message when files are selected
    setError(null);
  };

  const handleDeleteImage = (index) => {
    const updatedImages = [...images];
    const updatedSelectedFiles = [...selectedFiles];
    updatedImages.splice(index, 1);
    updatedSelectedFiles.splice(index, 1);
    setImages(updatedImages);
    setSelectedFiles(updatedSelectedFiles);
  };

  const handleSubmit = async () => {
    try {
      if (selectedFiles.length === 0) {
        setError('Please select at least one image file.');
        return;
      }

      setLoading(true);
      const promises = selectedFiles.map((file) =>
        Tesseract.recognize(file, 'eng')
          .then(({ data }) => data.text)
          .catch((err) => {
            throw err;
          })
      );
      const resultTexts = await Promise.all(promises);
      setTexts(resultTexts);
      setSuccessMessage('Conversion completed successfully!');
    } catch (error) {
      setError('Error occurred during conversion. Please try again.');
    } finally {
      setLoading(false);
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

      <div className="mt-3">
        {selectedFiles.map((file, index) => (
          <div key={index} className="d-flex align-items-center mb-2">
            <img
              src={images[index]}
              alt={`Uploaded ${index}`}
              className="img-thumbnail mr-2"
              style={{ height: '50px', width: '50px', objectFit: 'cover' }}
            />
            <span>{file.name}</span>
            <button className="btn btn-danger ml-auto" onClick={() => handleDeleteImage(index)}>
              Delete
            </button>
          </div>
        ))}
      </div>

      {loading && (
        <div className="spinner-border text-primary" role="status">
          <span className="sr-only">Loading...</span>
        </div>
      )}
      {error && <p className="text-danger">{error}</p>}
      {successMessage && <p className="text-success">{successMessage}</p>}

      <button className="btn btn-primary mt-3" onClick={handleSubmit}>
        Submit
      </button>

      {texts.map((text, index) => (
        <div key={index} className="mt-4 d-flex">
          <div style={{ height: '200px', width: '200px', marginRight: '20px' }}>
            <img src={images[index]} alt={`Uploaded ${index}`} className="img-fluid" style={{ height: '100%', width: '100%' }} />
          </div>
          <div style={{ height: '200px', width: '800px' }}>
            <CopyToClipboard text={text}>
              <div className="card" style={{ width: '100%', height: '100%', overflow: 'hidden' }}>
                <div className="card-header" style={{ position: 'sticky', top: '0', zIndex: '1', backgroundColor: 'white' }}>
                  <button
                    className="btn btn-secondary"
                    onClick={() => alert('Text copied to clipboard!')}
                  >
                    Copy
                  </button>
                  <a
                    className="btn btn-success ml-2"
                    href={`data:text/plain;charset=utf-8,${encodeURIComponent(text)}`}
                    download={`extracted_text_${index}.txt`}
                  >
                    Download
                  </a>
                </div>
                <div className="card-body" style={{ overflowY: 'auto' }}>
                  <p className="card-text">Extracted Text: {text}</p>
                </div>
              </div>
            </CopyToClipboard>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ImageToTextConverter;
