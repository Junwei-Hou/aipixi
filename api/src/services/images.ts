import 'reflect-metadata';
import Boom from '@hapi/boom';
import { Service } from 'typedi';
import { getConnection } from 'typeorm';
import { Images } from '../models/images';
import crypto, { createHash, createSign } from "crypto";
import fs, { readFileSync } from "fs";
import config from '../config';
import path from 'path';
import fetch from 'node-fetch';
import OSS from 'ali-oss'; // I choose ali oss serve
import { response } from 'express';

// tensor
const urlPre = "https://" + config.tusiArtApiUrl;
const appId = config.appId;
const privateKeyPath = path.join(__dirname, "../tusi.cert/private_key.pem");

const jobUrl = '/v1/jobs';
const imageUrl = '/v1/resource/image';

const client = new OSS({
  accessKeyId: config.oss.accessKeyId as string,
  accessKeySecret: config.oss.accessKeySecret as string,
  bucket: config.oss.bucket as string,
  region: config.oss.region as string,
});
const endPoint = config.oss.endPoint as string;
@Service()
export class ImagesService {

  public async getImage(email: any): Promise<Images[]> {
    const imageRepo = getConnection().getRepository(Images);

    const imagesByEmail = await imageRepo.find({ where: { email: email } });

    return imagesByEmail;
  }

  public async getImages(id: string){
    const imageRepo = getConnection().getRepository(Images);
    const images = await imageRepo.findOne({ where: { id: id } });
    return images
  }

  public async addOriginImage(file: any, email: any) {
    // Here, The image file has been parsed 
    const fileName = setFileName(file.originalname);
    // write the image into local file
    await fs.promises.rename('uploads/' + file.filename, 'public/image/' + fileName,)
    const localFile = 'public/image/' + fileName;
    const key = 'origin/' + fileName;
    const ossRes = await client.put('/ToYourGF/' + key, localFile); // upload to ali oss 
    const imageSrc = `http://${endPoint}/` + ossRes.name; // oss url path
    // fs.unlinkSync(localFile);
    const imageRepo = getConnection().getRepository(Images);
    const imagesWithSameEmail = await imageRepo.find({ where: { email: email } });
    const existingImage = imagesWithSameEmail.find(img => img.image === imageSrc);
    if (existingImage) {
      return { error: 'This image has existed' };
    }
    const newImage = imageRepo.create({ image: imageSrc, email: email });

    try {
      return await imageRepo.save(newImage);;
    } catch (error) {
      console.error("An error occurred while saving data to the database:", error);
    }
  }


  public async getAiJob(jobId: any, id: any) {

    let jobDict = await getJobResult(jobId);
    if (jobDict.status === 'SUCCESS') {
      let aiImageUrl = jobDict.successInfo.images[0].url;
      const imageRepo = getConnection().getRepository(Images);
      const imagesByEmail = await imageRepo.findOne({ where: { id: id } });
      const origImg = imagesByEmail.image
      const aiImg = modifyFileName(origImg);
      const localFile = await getAiImageFromTUSI(aiImageUrl, aiImg)
      var key = 'ai/' + localFile;
      const ossRes = await client.put('/ToYourGF/' + key, localFile);
      const aiImage = `http://${endPoint}/` + ossRes.name;
      // if (imagesByEmail.aiImage) return { ...imagesByEmail, status: 'SUCCESS' };
      imagesByEmail.aiImage = aiImage;
      try {
        jobDict = await imageRepo.save(imagesByEmail);
        return { ...jobDict, status: 'SUCCESS' };
      } catch (error) {
        console.error("Error while updating image:", error);
      }
    }


    return jobDict
  }
  public async createAiJob( id: any) {
    const imageRepo = getConnection().getRepository(Images);
    const imagesByEmail = await imageRepo.findOne({ where: { id: id } });
    const image = imagesByEmail.image
    const resourceId = await uploadImg(image);
    const data = getAiParams(resourceId);
    const resp = await createJob(data);
    if ('job' in resp) {
      const job_dict = resp.job;
      const job_id = job_dict.id;
      const job_status = job_dict.status;
      return {
        jobId: job_id,
        id: id
      }
    }
  }

  public async deleteImage(imageId: any, emailId: any): Promise<Images | { status: number, message: string }> {

    const imageRepo = getConnection().getRepository(Images);
    try {
      const foundImage = await imageRepo.findOne({ where: { id: imageId } });
      if (!foundImage) {
        return { status: 201, message: 'Image not found' };
      }
      const res = await imageRepo.remove(foundImage);
      return { status: 200, message: 'Image has been deleted' };
    } catch (error) {
      console.error('Error deleting image:', error);
      return { status: 201, message: 'Failed to delete image' };
    }
  }
}

function generateSignature(method: any, url: any, appId: any, body: any, privateKeyPath: any) {
  const methodStr = method.toUpperCase();
  const urlStr = url;
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const nonceStr = createHash('md5').update(timestamp).digest("hex");
  const bodyStr = body ? JSON.stringify(body) : '';
  const toSign = `${methodStr}\n${urlStr}\n${timestamp}\n${nonceStr}\n${bodyStr}`;

  const privateKey = readFileSync(privateKeyPath);
  const sign = createSign('RSA-SHA256');
  sign.update(toSign);
  const signature = sign.sign(privateKey, "base64");
  return `TAMS-SHA256-RSA app_id=${appId},nonce_str=${nonceStr},timestamp=${timestamp},signature=${signature}`;
}

async function sendRequest(method: any, url: any, body: any, signature: any) {
  const headers = {
    "Content-Type": "application/json",
    "Accept": "application/json",
    "Authorization": signature
  };
  const response = body ?
    await fetch(url, {
      method: method,
      headers: headers,
      body: JSON.stringify(body)
    }) :
    await fetch(url, {
      method: method,
      headers: headers
    });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status} ${response.statusText}`);
  }

  return await response.json();
}

function createMD5() {
  return crypto.createHash('md5').update(`${Date.now()}`).digest('hex')
}

async function getJobResult(jobId: any) {
  const authHeader = generateSignature('GET', jobUrl + '/' + jobId, appId, null, privateKeyPath);
  const resp = await sendRequest('GET', urlPre + jobUrl + '/' + jobId, null, authHeader);
  const jobDict = resp.job;
  return jobDict
}

function modifyFileName(origImg: string) {
  const lastSlashIndex = origImg.lastIndexOf('/');

  const fileName = origImg.substring(lastSlashIndex + 1);

  const newFileName = '_ai_' + fileName.substring(fileName.indexOf('origin') + 6);

  const currentDate = new Date();
  const hours = currentDate.getHours().toString().padStart(2, '0'); 
  const minutes = currentDate.getMinutes().toString().padStart(2, '0');
  const seconds = currentDate.getSeconds().toString().padStart(2, '0'); 

  const modifiedFileName = newFileName + `_${hours}-${minutes}-${seconds}`;

  return modifiedFileName;
}

function setFileName(val: string) {
  const index = val.lastIndexOf('.');
  const fileName = val.slice(0, index); // without extension name、
  const fileType = val.slice(index); // extension name such as .png
  const time = setTime(); // current time 
  const newFileName = `${time}_${fileName}${fileType}`;
  return newFileName;
}
function setTime() {
  const dateStr = new Date();
  var year = dateStr.getFullYear().toString().padStart(4, '0');
  var month = (dateStr.getMonth() + 1).toString().padStart(2, '0');
  var day = dateStr.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}-`;
}


function getAiImageFromTUSI(imagePath: any, aiImg: any) {
  const localFilePath = aiImg;
  return new Promise(async (resolve, reject) => {
    try {
      fetch(imagePath)
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.buffer();
        })
        .then(buffer => {
          const dirname = path.dirname(localFilePath);
          if (!fs.existsSync(dirname)) {
            fs.mkdirSync(dirname, { recursive: true });
          }
          // write oss image into local file 
          fs.writeFileSync(localFilePath, buffer);
          resolve(localFilePath);

        }).catch(error => {
          console.error('Error downloading file:', error);
          reject(error);
        });
    } catch (error) {
      reject(error);
    }
  })
}

async function uploadImg(imagePath: any) {
  const uploadData = {
    "expireSec": 3600,
  }
  const authHeader = generateSignature('POST', imageUrl, appId, uploadData, privateKeyPath);
  return new Promise(async (resolve, reject) => {
    try {
      const resp: any = await sendRequest('POST', urlPre + imageUrl, uploadData, authHeader);
      const resourceId = resp['resourceId']
      const putUrl = resp['putUrl']
      const headers = resp['headers']
      const localFilePath = path.join(__dirname, 'image', 'jigsawAI.jpeg');
      fetch(imagePath)
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.buffer();
        })
        .then(buffer => {
          const dirname = path.dirname(localFilePath);
          if (!fs.existsSync(dirname)) {
            fs.mkdirSync(dirname, { recursive: true });
          }
          // write oss image into local file 
          fs.writeFileSync(localFilePath, buffer);
          // read local image and sent to tusiart
          fs.readFile(localFilePath, async (err, data) => {
            if (err) {
              console.log('err', err)
              throw err;
            }
            const response = await fetch(putUrl, {
              method: 'PUT',
              headers: headers,
              body: data
            });
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status} ${response.statusText}`);
            }
            resolve(resourceId);
          });
        }).catch(error => {
          console.error('Error downloading file:', error);
          reject(error);
        });
    } catch (error) {
      reject(error);
    }
  })
}

async function createJob(data: any) {
  const authHeader = generateSignature('POST', jobUrl, appId, data, privateKeyPath);
  const res = await sendRequest('POST', urlPre + jobUrl, data, authHeader);
  return res;
}

function getAiParams(resourceId:any){
  // return {
  //     "request_id": createMD5(),
  //     "stages": [
  //       {
  //         "type": "INPUT_INITIALIZE",
  //         "inputInitialize": {
  //           "image_resource_id": resourceId,
  //           "count": 1 
  //         }
  //       },
  //       {
  //         "type": "DIFFUSION",
  //         "diffusion": {
  //           "width": 600, 
  //           "height": 400, 
  //           "prompts": [
  //             {
  //               "text": ""
  //             }
  //           ],
  //           "sampler": "DPM++ 2M Karras",
  //           "sdVae": "Automatic",
  //           "steps": 15,
  //           "sd_model": "600423083519508503", //checkpoint
  //           "clip_skip": 2,
  //           "cfg_scale": 7
  //         }
  //       }
  //     ]
  //   }
  return {
    "requestId": createMD5(),
    "stages": [
      {
        "type": "INPUT_INITIALIZE",
        "inputInitialize": {
          "count": 1
        }
      },
      {
        "type": "DIFFUSION",
        "diffusion": {
          "width": 600,
          "height": 400,
          "prompts": [
            {
              "text": "(8k, RAW photo, best quality, masterpiece:1.2), (realistic, photo-realistic:1.37),best quality, ultra high res, (photorealistic:1.4), RAW photo, 8k uhd,  soft lighting, high quality, film grain, Fujifilm XT3, white skin "
            }
          ],
          "negativePrompts": [
            {
              "text": "nipple, titty, sensuality, Bare breasts, overly revealing clothing, bare limbs, two heads, two faces, Deformed, bad eyes, crossed eyes, disfigured, poorly drawn face, mutation, mutated, ((extra limb)), ugly, missing limb, floating limbs, disconnected limbs, frame, lowres, bad anatomy, cropped, worst quality, low quality, cartoon style, underage, fat, ugly, disfigured, too many fingers, deformed, bad eyes, ugly eyes, dead eyes, watermark, (overage:1.1) , nsfw, (worst quality:1.6), (low quality:1.6). (normal guality:1.7), watermark"
            }
          ],
          "sdModel": "653502471223850877",
          "sdVae": "Automatic",
          "sampler": "Euler a",
          "steps": 30,
          "cfgScale": 10,
          "clipSkip": 6,
          "denoisingStrength": 0,
          "etaNoiseSeedDelta": 30000,
          "controlnet": {
            "args": [
              {
                "inputImageResourceId": resourceId,
                "preprocessor": "lineart_realistic",
                "model": "control_v11p_sd15_lineart",
                "weight": 1.5,
                "resizeMode": "DEFAULT",
                "guidance": 0,
                "guidanceStart": 0,
                "guidanceEnd": 1,
                "controlMode": "BALANCED",
                "pixelPerfect": true
              }
            ]
          },
          "lora": {
            "items": [
              {
                "loraModel": "643763684419793644",
                "weight": 0.5
              }
            ]
          }
        }
      },
      {
        "type": "IMAGE_TO_ADETAILER",
        "imageToAdetailer": {
          "args": [
            {
              "adModel": "face_yolov8n_v2.pt",
              "adPrompt": [
                {
                  "text": "(8k, RAW photo, best quality, masterpiece:1.2), (realistic, photo-realistic:1.37),best quality, ultra high res, (photorealistic:1.4), RAW photo, 8k uhd,  soft lighting, high quality, film grain, Fujifilm XT3, "
                }
              ],
              "adNegativePrompt": [
                {
                  "text": "nipple, titty, sensuality, Bare breasts, overly revealing clothing, bare limbs, two heads, two faces, Deformed, bad eyes, crossed eyes, disfigured, poorly drawn face, mutation, mutated, ((extra limb)), ugly, missing limb, floating limbs, disconnected limbs, frame, lowres, bad anatomy, cropped, worst quality, low quality, cartoon style, underage, fat, ugly, disfigured, too many fingers, deformed, bad eyes, ugly eyes, dead eyes, watermark, (overage:1.1) , nsfw, (worst quality:1.6), (low quality:1.6). (normal guality:1.7), watermark"
                }
              ],
              "adDenoisingStrength": 0.2,
              "adInpaintOnlyMasked": true,
              "adConfidence": 0.3,
              "adUseSteps": true
            }
          ]
        }
      }
    ]
  }
}