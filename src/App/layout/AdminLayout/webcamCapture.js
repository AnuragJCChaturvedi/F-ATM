import React from 'react';
import Webcam from "react-webcam";

import {s3, rekognition} from "../../../aws"

import dataStore from "../../../datastore.json"

import Button from '@mui/material/Button';

import './helper.css'

import { SnackbarProvider, enqueueSnackbar, useSnackbar } from 'notistack';


const triggerFlash = () => {
    const flash = document.getElementById('flash');
    flash.classList.add('active');

    setTimeout(() => {
        flash.classList.remove('active');
    }, 300); // 500ms for the flash effect
};

const videoConstraints = {
    width: 450,
    height: 655,
    facingMode: "user"
  };

  const searchFacesByImage =  async (sourceImageBase64, onUpdateScreen) => {

    const ibytes = getImageBytes(sourceImageBase64)

    const params = {
      CollectionId: 'hackathon',
      Image: {
        // If using bytes
        Bytes: ibytes
      },
      FaceMatchThreshold: 70, // Adjust as needed
      MaxFaces: 2 // Adjust as needed
    };
  
    rekognition.searchFacesByImage(params, function(err, data) {
      console.log("Search Result: ")
      if (err) {
        console.log(err, err.stack); // an error occurred
        enqueueSnackbar("Some trouble with server", { variant: "error" })
      }
      else {
        console.log(data); // successful response
        const faceIds = data.FaceMatches.map(match => match.Face.FaceId);
        // Fetch object metadata from S3 based on face IDs
        if (faceIds.length == 0) {
            console.log("User not part of PNC")
        } else {
            const user = fetchObjectMetadata(faceIds)
            sessionStorage.setItem('user', JSON.stringify(user))
            onUpdateScreen('PIN')
        }
      }
    });;
  };


  const fetchObjectMetadata = (faceIds) => {
    const bestMatchId = faceIds[0]
    return dataStore.find((data) => data.faceid == bestMatchId)
  }

  const getImageBytes = (imageSrc) => {
    // Remove data URL prefix ("data:image/jpeg;base64,") and convert to ArrayBuffer
    const base64Data = imageSrc.replace(/^data:image\/\w+;base64,/, '');
    const binaryData = atob(base64Data);
    const length = binaryData.length;
    const bytes = new Uint8Array(length);
    
    for (let i = 0; i < length; i++) {
      bytes[i] = binaryData.charCodeAt(i);
    }
    
    return bytes;
  };

const WebcamCapture = ({onUpdateScreen}) => {
    const webcamRef = React.useRef(null);

    const [imgSrc, setImgSrc] = React.useState(null)

    const { enqueueSnackbar } = useSnackbar();


    const capture = React.useCallback(
      async () => {
        const imageSrc = webcamRef.current.getScreenshot();
        console.log(imageSrc);

        setImgSrc(imageSrc)

        triggerFlash();

        await searchFacesByImage(imageSrc, onUpdateScreen);
      },
      [webcamRef, setImgSrc]
    );
    return (
      <>
        <Webcam
          audio={false}
          height={videoConstraints.height}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          width={videoConstraints.width}
          videoConstraints={videoConstraints}
        />
        <div style={{textAlign: 'center', marginLeft: '-300px', marginTop: '15px'}}>
        <Button variant="contained" onClick={capture} style={{ fontSize: '10px', padding: '7px 14px' }}>Click to Proceed</Button>
        </div>


        {/* {imgSrc && (<img src={imgSrc}/>)} */}

        <div id="flash" className="flash-effect"></div>


      </>
    );
  };

  export default WebcamCapture