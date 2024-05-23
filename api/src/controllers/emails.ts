import 'reflect-metadata';
import Boom from '@hapi/boom';
import Joi from '@hapi/joi';
import { Response, Request } from 'express';
import { JsonController, Req, Res, Get, Post, Patch, Delete, UseBefore, UploadedFile } from 'routing-controllers';
import { Authenticate } from '../middleware/authenticate';
import { EmailService } from '../services';



@JsonController()
// @UseBefore(Authenticate)
export class emailController {
  constructor(
    private emailService: EmailService) { }

  @Get('/')
  async get(@Req() req: Request, @Res() res: Response) {
    res.send('Hello World')
  }

  @Post('/registerByEmail')
  async registerByEmail(@Req() req: Request, @Res() res: Response) {

    const schema = Joi.object({
      email: Joi.string().email().required()
    });
    
    const data = { email: req.body.email };

    const { email } = await schema.validateAsync(data);

    const response = await this.emailService.registerByEmail(email);

    if(response.status === 200){
      return res.status(200).json({...response, message: 'Login successful'});
    }else if (response.status === 201){
      return res.status(201).json({...response, message: 'Registration successful'  });
    }
  }


}
