import 'reflect-metadata';
import Boom from '@hapi/boom';
import { Service } from 'typedi';
import { getConnection } from 'typeorm';

import { Email } from '../models/email';

@Service()
export class EmailService {

  public async registerByEmail(email:string):  Promise<any | { status: number }> {
    const emailRepo = getConnection().getRepository(Email);
    // search if there is same image in Images table
    const existingEmail = await emailRepo.findOne({ where: { email: email } });
    if (existingEmail) {
      return { status: 200, id:existingEmail.id, email:existingEmail.email };
    }
    // search if it is a new Email, then create it 
    const newEmail = await emailRepo.create({  email: email });
    const resNewEmail = await emailRepo.save(newEmail);
    return { status: 201, id:resNewEmail.id, email:resNewEmail.email };

  }

}
