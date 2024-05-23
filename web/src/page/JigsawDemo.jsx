import React, { useEffect, useState, useContext } from "react";
import puzzleInit from "../components/simple-jigsaw-main/jigsawInit";
import ParticlesBg from "particles-bg";
import icon from "../icon";
import { makeStyles } from "@material-ui/core/styles";
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { Button, message } from "antd";
import "./JigsawStyle.css";
import { useHistory } from "react-router-dom";
import { Context } from "../App";

export default function JigsawDemo() {
  const [data, setData] = useState(null);
  const [aiImage, setAiImage] = useState(null);
  const [origImage, setOrigImage] = useState(null);
  const [showDemo, setShowDemo] = useState(false);
  const [distance, setDistance] = useState(0);
  const [handleBarVisible, setHandleBarVisible] = useState(false);
  const [distBoxOuter, setDistBoxOuter] = useState(0);
  const [windowWidth, setWindowWidth] = useState(0);
  const [windowHeight, setWindowHeight] = useState(0);
  const [canvasWidth, setCanvasWidth] = useState(0);
  const [canvasHeight, setCanvasHeight] = useState(0);
  const location = useLocation();
  const params = location.state;
  const { email, setEmail } = useContext(Context);

  const history = useHistory();
  const config = {
    num: [4, 7],
    rps: 0.1,
    radius: [5, 40],
    life: [1.5, 3],
    v: [2, 3],
    tha: [-50, 50],
    alpha: [0.6, 0],
    scale: [0.1, 0.9],
    body: icon,
    position: "all",
    //color: ["random", "#ff0000"],
    cross: "dead",
    random: 10,
  };

  const useStyles = makeStyles((theme) => ({
    show: {
      backgroundColor: "rgba(215,215,215,0.75)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      transition: "opacity 0.8s ease-out",
      opacity: 1,
    },
    hidden: {
      opacity: 0,
    },
    goBack: {
      marginTop: "20px",
      width: "200px",
      height: "80px",
      backgroundColor: "orange",
      margin: theme.spacing(3, 0, 2),
      "&:hover": {
        backgroundColor: "purple",
      },
    },
    sendIt: {
      marginTop: "20px",
      width: "200px",
      height: "80px",
      backgroundColor: "pink",
      margin: theme.spacing(3, 0, 2),
      "&:hover": {
        backgroundColor: "purple",
      },
    },
  }));
  const classes = useStyles();
  const calculateSize = () => {
    console.log("window.innerWidth", window.innerWidth);
    var isMobile =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    let canvasWidth;
    let canvasHeight;
    if (isMobile) {
      if (windowWidth / windowHeight <= 2 / 3) {
        canvasWidth = windowWidth * 0.9; // windowWidth's 90%
        canvasHeight = (canvasWidth * 2) / 3;
      } else if (windowWidth / windowHeight > 2 / 3) {
        canvasHeight = windowHeight * 0.9; // windowHeight's 90%
        canvasWidth = (canvasHeight * 3) / 2;
      }
    } else {
      if (windowWidth / windowHeight <= 2 / 3) {
        canvasWidth = windowWidth * 0.9; // windowWidth's 90%
        canvasHeight = (canvasWidth * 2) / 3;
      } else if (windowWidth / windowHeight > 2 / 3) {
        canvasHeight = windowHeight * 0.9; // windowHeight's 90%
        canvasWidth = (canvasHeight * 3) / 2;
      }
    }

    console.log("windowWidth", windowWidth);
    console.log("windowHeight", windowHeight);

    // set canvas radio is 2:3, width:height
    // if windowWidth : windowHeight < 2:3 , set windowWidth as canvasWidth,
    // if windowWidth : windowHeight > 2:3 , set windowHeight as canvasHeight.

    setWindowWidth(windowWidth);
    setWindowHeight(windowHeight);

    setCanvasWidth(canvasWidth);
    setCanvasHeight(canvasHeight);

    return {
      canvasWidth: canvasWidth,
      canvasHeight: canvasHeight,
    };
  };
  useEffect(() => {
    fetchData();
  }, []);
  const getImages = async (imageId) => {
    const config = {
      method: "Get",
      headers: {
        "Content-Type": "application/json",
      },
    };
    try {
      const response = await fetch(
        `http://localhost:3000/images/?id=${imageId}`,
        config
      );
      const responseData = await response.json();
      if (responseData.status === 200) {
        return responseData.message;
      } else {
        return null; // Return null or throw an error based on your error handling strategy
      }
    } catch (error) {
      console.error("Error:", error);
      throw error; // Propagate the error upwards
    }
  };
  const fetchData = async () => {
    const imageId = localStorage.getItem("imageId");

    try {
      // check if localStorage has data
      console.log("---imageId----", imageId);

      if (!imageId) {
        console.log("run h12123erer");

        setData(
          "https://junweioss.oss-rg-china-mainland.aliyuncs.com/ToYourGF/origin/2024-05-19-_%C3%A6%C2%B4%C2%9B%C3%A5%C2%AD%C2%90roko_Ark%20Nights%20Texas_p0_76516131_3907233_3840x2160.jpg"
        );
        setOrigImage(
          "https://junweioss.oss-rg-china-mainland.aliyuncs.com/ToYourGF/ai/_ai_05-19-_%C3%A6%C2%B4%C2%9B%C3%A5%C2%AD%C2%90roko_Ark%20Nights%20Texas_p0_76516131_3907233_3840x2160.jpg_03-17-17"
        );
      } else {
        console.log("run herer");
        let images = await getImages(imageId);
        const aiImage = images.aiImage;
        const origImage = images.image;
        setData(aiImage);
        setOrigImage(origImage);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowDemo(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);
  useEffect(() => {
    if (data) {
      console.log("data", data);
      const canvas = document.getElementById("myCanvas");
      const img = new Image();
      img.crossOrigin = "https://jun.mrlcn.com";
      img.src = data;
      const res = calculateSize();
      const canvasWidth = res.canvasWidth;
      const canvasHeight = res.canvasHeight;
      const ctx = canvas.getContext("2d");

      img.onload = function () {
        ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight);
        let url = canvas.toDataURL("image/png");
        const image = new Image();
        image.src = url;
        image.onload = function () {
          puzzleInit(image, canvas, canvasWidth, canvasHeight);
        };
        const container = document.querySelector(".g-outer");
        const rect = container.getBoundingClientRect();
        setDistBoxOuter(rect.left);
      };
    }
  }, [data]);

  // add a EventListener
  useEffect(() => {
    function handlePuzzleComplete(event) {
      const res = calculateSize();
      const canvasWidth = res.canvasWidth;
      const canvasHeight = res.canvasHeight;
      const targetDistance = canvasWidth; // set edge as 1080
      const duration = 2000; // set duration 2s
      const increment = (targetDistance / duration) * 10;
      let currentDistance = 0; // set start as 0
      let increasing = true;
      const intervalId = setInterval(() => {
        if (increasing) {
          currentDistance += increment;
          if (currentDistance >= targetDistance) {
            currentDistance = targetDistance;
            increasing = false;
          }
        } else {
          currentDistance -= increment;
          if (currentDistance <= 0) {
            currentDistance = 0;
            setHandleBarVisible(true);
            clearInterval(intervalId);
          }
        }
        setDistance(currentDistance);
      }, 10);
    }

    document.addEventListener("puzzleCompleteEvent", handlePuzzleComplete);

    return () => {
      document.removeEventListener("puzzleCompleteEvent", handlePuzzleComplete);
    };
  }, []);

  const barStart = (event) => {};
  const barMove = (event) => {
    setDistance(Number(event.clientX) - Number(distBoxOuter));
  };
  const barTMove = (event) => {
    setDistance(Number(event.targetTouches[0].clientX) - Number(distBoxOuter));
  };
  const barEnd = (event) => {
    const startX = Number(event.clientX) - Number(distBoxOuter);
    const duration = 100;
    const increment = (startX / duration) * 10;

    let currentX = startX;
    setDistance(Number(event.clientX) - Number(distBoxOuter));

    const intervalId = setInterval(() => {
      currentX -= increment;
      setDistance(currentX);
      if (currentX <= 0) {
        setDistance(0);
        clearInterval(intervalId);
      }
    }, 10);
  };
  const barTEnd = (event) => {
    const startX =
      Number(event.changedTouches[0].clientX) - Number(distBoxOuter);
    const duration = 100;
    const increment = (startX / duration) * 10;

    let currentX = startX;
    setDistance(Number(event.changedTouches[0].clientX) - Number(distBoxOuter));

    const intervalId = setInterval(() => {
      currentX -= increment;
      setDistance(currentX);
      if (currentX <= 0) {
        setDistance(0);
        clearInterval(intervalId);
      }
    }, 10);
  };
  const handleGoBack = () => {
    history.goBack();
  };
  const handleSendFriend = () => {
    const currentPageUrl = window.location.href;

    navigator.clipboard
      .writeText(currentPageUrl)
      .then(() => {
        alert("The link has been successfully copied to the clipboard!");
      })
      .catch((error) => {
        console.error("Error copying link:", error);
        alert(
          "An error occurred while copying the link. Please copy the link manually!"
        );
      });
  };
  return (
    <div className="App">
      <div className={`${showDemo ? classes.show : classes.hidden}`}>
        <div
          className="g-outer"
          style={{
            width: `${canvasWidth}px`,
            height: `${canvasHeight - 1}px`,
            backgroundImage: `url(${origImage})`,
          }}
        >
          <canvas
            id="myCanvas"
            width={canvasWidth}
            height={canvasHeight}
          ></canvas>
          <div
            className="g-inner"
            style={{
              width: `${distance}px`,
              height: `${canvasHeight}px`,
              maxWidth: `${canvasWidth}px`,
              backgroundImage: `url(${origImage})`,
            }}
          ></div>
          <div
            className="resizeHandle"
            onMouseEnter={barStart}
            onMouseMove={barMove}
            onMouseLeave={barEnd}
            onTouchMove={barTMove}
            onTouchEnd={barTEnd}
            style={{
              display: handleBarVisible ? "block" : "none",
              minWidth: `${distance}px`,
              width: `${canvasWidth}px`,
              height: `${canvasHeight}px`,
            }}
          ></div>
        </div>
      </div>
      {handleBarVisible && (
        <div className="button">
          <Button
            fullWidth
            variant="contained"
            color="primary"
            className={classes.goBack}
            onClick={handleGoBack}
          >
            Go Back
          </Button>
          <Button
            fullWidth
            variant="contained"
            color="primary"
            className={classes.sendIt}
            onClick={handleSendFriend}
          >
            Send To Your Friend
          </Button>
        </div>
      )}
      <ParticlesBg type="custom" config={config} bg={true} />
    </div>
  );
}
