import 'reflect-metadata';
import Boom from '@hapi/boom';
import Joi from '@hapi/joi';
import { Response, Request } from 'express';
import { JsonController, Req, Res, Get, Post, Patch, Delete, UseBefore, UploadedFile } from 'routing-controllers';

import { Authenticate } from '../middleware/authenticate';
import { ImagesService } from '../services';
import { logger } from '../utils';
import multer from 'multer';
import fs from 'fs';
import OSS from 'ali-oss'; // I choose ali oss serve
import config from '../config';
import { json } from 'body-parser';
// Create Multer instance，Specifies the directory and name of the file to be uploaded
const upload = multer({ dest: 'uploads/' });


@JsonController()
// @UseBefore(Authenticate)
@UseBefore(upload.single('image')) // 'image' is the key of the upload file
export class ImageController {
  constructor(
    private imageService: ImagesService) { }

  @Get('/image')
  public async getImage(@Req() req: Request, @Res() res: Response): Promise<Response> {
    const emailId = req.query.emailId;
    const imageRes = await this.imageService.getImage(emailId);
    return res.send({ imageList: imageRes });
  }

  @Post('/image')
  async uploadImages(@UploadedFile('image') file: Express.Multer.File, @Req() req: Request, @Res() res: Response) {
    const emailId = req.query.emailId;
    if (!file) {
      return { error: 'No file uploaded' };
    }
    const databaseRes: any = await this.imageService.addOriginImage(file, emailId);
    return databaseRes

  }

  @Get('/image/ai')
  async getImageAI(@Req() req: Request, @Res() res: Response) {
    // 处理图片AI相关的逻辑
    const ids: any = req.query.ids;
    const parsedIds = JSON.parse(ids);
    const jobId = parsedIds.jobId;
    const id = parsedIds.id;
    const response = await this.imageService.getAiJob(jobId, id);
    console.log('response',response)
    return res.send(JSON.stringify(response));
  }

  @Get('/images')
  async getImages(@Req() req: Request, @Res() res: Response) {
    const id: any = req.query.id;
    const response = await this.imageService.getImages( id);
    return res.send({ status: 200, message: response });
  }

  @Post('/image/ai')
  async createImageAI(@Req() req: Request, @Res() res: Response) {
    const id = req.query.id; 
    const ids: object = await this.imageService.createAiJob(id);
    return res.send({ status: 200, message: ids })
  }

  @Delete('/image')
  async deleteImages(@Req() req: Request, @Res() res: Response): Promise<Response> {
    const emailId = req.query.emailId;
    const imageId = req.query.imageId;
    const imageRes = await this.imageService.deleteImage(imageId, emailId);
    return res.send(imageRes);
  }
}
