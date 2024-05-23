import React, { useEffect, useState, useContext } from "react";
import ParticlesBg from "particles-bg";
import icon from "../icon";
import { makeStyles } from "@material-ui/core/styles";
import { useHistory } from "react-router-dom";
import SignInComponent from "../components/Signin";
import { Avatar, Upload, Space, Typography, Button } from "antd";
import ImgCrop from "antd-img-crop";
import { message, Col, Row } from "antd";
import { Flex, Progress } from "antd";
import { Context } from "../App";

const { Text } = Typography;
export default function SignIn() {
  const [data, setData] = useState(null);
  const [showSignIn, setShowSignIn] = useState(true);
  const [emailAddress, setEmailAddress] = useState("");
  const [showUploadImage, setShowUploadImage] = useState(false);
  const [prevImg, setPrevImg] = useState({});
  const [fileList, setFileList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [percent, setPercent] = useState(null);
  const [aiImage, setAiImage] = useState("");
  const { hasLogin, setHasLogin, emailId, setEmailId } = useContext(Context);
  const aspect = 3 / 2;

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
    signIn: {
      backgroundColor: "rgba(215,215,215,0.75)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      transition: "opacity 0.8s ease-out",
      opacity: 1,
      borderRadius: 10,
    },
    hidden: {
      opacity: 0, 
    },
    show: {
      opacity: 1,
    },
    submit: {
      marginTop: "20px",
      width: "200px",
      height: "80px",

      margin: theme.spacing(3, 0, 2),
      "&:hover": {
        backgroundColor: "purple", 
      },
    },
  }));
  const classes = useStyles();

  const history = useHistory();

  useEffect(() => {
    if (hasLogin) {
      getImagesById(emailId);
    }
  }, [hasLogin]);

  useEffect(() => {}, [fileList]);

  const handleDemoClick = () => {
    setShowSignIn(false);

    setTimeout(() => {
      localStorage.removeItem("imageId")
      history.push({
        pathname: "/JigsawDemo",
        aiImage: false,
      });
    }, 1500); // 1500ms
  };

  const handleSignInClick = () => {
    setShowSignIn(false);
    setTimeout(() => {
      setShowUploadImage(true);
    }, 1500); // 1500ms
  };

  const getImagesById = async (emailId) => {
    try {
      const response = await fetch(
        `http://localhost:3000/image/?emailId=${encodeURIComponent(emailId)}`
      );
      const jsonData = await response.json();
      const imageList = jsonData.imageList.map((item) => ({
        id: item.id,
        url: item.image,
        aiUrl: item.aiImage,
      }));
      setFileList(imageList);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const onRemove = (image) => {
    const imageId = image.id;
    const config = {
      method: "DELETE",
      headers: {
        // "Content-Type": "multipart/form-data",
        // 'Authorization': `Bearer ${token}`,
      },
    };
    fetch(
      `http://localhost:3000/image/?emailId=${encodeURIComponent(
        emailId
      )}&imageId=${imageId}`,
      config
    )
      .then((response) => response.json())
      .then((response) => {
        if (response.status === 200) {
          const updatedFileList = fileList.filter(
            (item) => item.id !== imageId
          );
          setFileList(updatedFileList);
          if (prevImg.id === imageId) {
            setPrevImg({});
          }
        } else {
          message.error(response.message);
        }
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  const handleUpload = (fileObject) => {
    let formData = new FormData();
    formData.append("image", fileObject.file);

    const config = {
      method: "POST",
      body: formData,
      headers: {
        // "Content-Type": "multipart/form-data",
        // 'Authorization': `Bearer ${token}`,
      },
    };
    fetch(
      `http://localhost:3000/image/?emailId=${encodeURIComponent(emailId)}`,
      config
    )
      .then((response) => response.json())
      .then((response) => {
        if (response.status === 400) {
          return message.error(response.message);
        }
        setFileList([...fileList, { id: response.id, url: response.image }]);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  const onPreview = (file) => {
    setPrevImg({ ...file });
  };
  const handleGenerateAI = async () => {
    const id = prevImg.id;
    const randomValue = Math.floor(Math.random() * 11) + 10;
    setPercent(randomValue);
    setLoading(true);

    const intervalId2 = setInterval(async () => {
      if (percent < 95) {
        const randomIncrement = Math.floor(Math.random() * 5) + 1;
        setPercent((percent) => {
          const newValue = percent + randomIncrement;
          return newValue > 95 ? 95 : newValue; 
        });
      }
      if (aiImage) {
        clearInterval(intervalId2);
      }
    }, 2000); // request interface every 2 seconds
    try {
      const ids = await getAiImageJobId(id);
      if (!ids) {
        return message.error('There is internet error, please regenerate the image');
      }
      let response;

      const intervalId = setInterval(async () => {
        response = await getAiImage(ids);
        if (response.status === "SUCCESS") {
          let prevImg = {};
          fileList.forEach((item) => {
            if (item.id === response.id) {
              item.aiUrl = response.aiImage;
              prevImg = item;
            }
          });
          setFileList((prevFileList) => {
            return [...prevFileList];
          });
          setPrevImg(prevImg);
          setAiImage(response.aiImage);
          setLoading(false);
          clearInterval(intervalId);
        }
      }, 2000); // request interface every 2 seconds

    } catch (error) {
      console.error("Error:", error);
    } finally {
    }
  };
  const getAiImageJobId = async (id) => {
    const config = {
      method: "POST",
      body: JSON.stringify(prevImg),
      headers: {
        "Content-Type": "application/json",
      },
    };

    try {
      const response = await fetch(
        `http://localhost:3000/image/ai/?id=${id}`,
        config
      );
      const responseData = await response.json();

      if (responseData.status === 200) {
        return responseData.message;
      }
      if (responseData.status === 400) {
        message.error(responseData.message);
        return null; // Return null or throw an error based on your error handling strategy
      }
    } catch (error) {
      console.error("Error:", error);
      throw error; // Propagate the error upwards
    }
  };
  const getAiImage = async (ids) => {
    const config = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    };

    try {
      const response = await fetch(
        `http://localhost:3000/image/ai/?ids=${JSON.stringify(ids)}`,
        config
      );
      const responseData = await response.json();
      return responseData;
    } catch (error) {
      console.error("Error:", error);
      throw error; // Propagate the error upwards
    }
  };
  const playWithAiJigsaw = (prevImg) => {
    const aiImage = prevImg.aiUrl;
    const origImage = prevImg.url;
    setTimeout(() => {
      localStorage.setItem("imageId", prevImg.id);

      history.push({
        pathname: "/JigsawDemo",
        aiImage: true,
        aiImgUrl: aiImage,
        oriImgUrl: prevImg.url,
      });
    }, 1500); // 1500ms
  };

  return (
    <Row className="App">
      {!hasLogin && (
        <Col xs={24} sm={24} md={24} lg={24} xl={24}>
          <div className="sign-in">
            <div
              className={`${classes.signIn} ${
                showSignIn ? "" : classes.hidden
              }`}
            >
              <SignInComponent
                handleDemoClick={handleDemoClick}
                handleSignInClick={handleSignInClick}
                getImagesById={getImagesById}
              />
            </div>
          </div>
        </Col>
      )}

      <Col xs={24} sm={24} md={24} lg={24} xl={24} className="flex-center">
        <ImgCrop rotationSlider aspect={aspect}>
          <Upload
            // action="https://660d2bd96ddfa2943b33731c.mockapi.io/api/upload"
            listType="picture-card"
            fileList={fileList}
            customRequest={handleUpload}
            // onChange={onChange}
            onPreview={onPreview}
            onRemove={onRemove}
          >
            {fileList.length < 5 && "+ Upload"}
          </Upload>
        </ImgCrop>
      </Col>

      {prevImg.id && (
        <Row gutter={20}>
          <Col
            xs={24}
            sm={24}
            md={24}
            lg={prevImg.aiUrl ? 12 : 24}
            xl={prevImg.aiUrl ? 12 : 24}
          >
            <div className="preview-image-box-small-button">
              <img
                src={prevImg.url}
                className="preview-image"
                alt="preview-image"
              />
              {/* if there is already an ai image */}
              {prevImg.aiUrl ? (
                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  className={classes.submit}
                  onClick={() => playWithAiJigsaw(prevImg)}
                >
                  Play with AI Jigsaw
                </Button>
              ) : (
                <>
                  {loading ? (
                    // <img src="https://crush-ai-2.oss-cn-chengdu.aliyuncs.com/files/loading.gif"></img>
                    <Progress strokeLinecap="butt" percent={percent} />
                  ) : (
                    <Button
                      fullWidth
                      variant="contained"
                      color="primary"
                      className={classes.submit}
                      onClick={handleGenerateAI}
                    >
                      Generate AI Image
                    </Button>
                  )}
                </>
              )}
            </div>
          </Col>
          {/* if there is already an ai image */}
          {prevImg.aiUrl && (
            <Col xs={24} sm={24} md={24} lg={12} xl={12}>
              <div className="preview-image-box-small-button">
                <img
                  src={prevImg.aiUrl}
                  className="preview-image"
                  alt="preview-image"
                />
                <>
                  {loading ? (
                    <Progress
                      className="progress-gif-percent"
                      strokeLinecap="butt"
                      percent={percent}
                    />
                  ) : (
                    <Button
                      fullWidth
                      variant="contained"
                      color="primary"
                      className={classes.submit}
                      onClick={handleGenerateAI}
                    >
                      Regenerate AI Image
                    </Button>
                  )}
                </>
              </div>
            </Col>
          )}
        </Row>
      )}
      {prevImg.id && <Col xs={24} sm={24} md={24} lg={24} xl={24}></Col>}

      <ParticlesBg type="custom" config={config} bg={true} />
    </Row>
  );
}
