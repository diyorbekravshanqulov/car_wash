import { Injectable } from '@nestjs/common';
import { CreateBotDto } from './dto/create-bot.dto';
import { UpdateBotDto } from './dto/update-bot.dto';
import { InjectModel } from '@nestjs/sequelize';
import { Bot } from './model/bot.model';
import { InjectBot } from 'nestjs-telegraf';
import { BOT_NAME } from '../app.constants';
import { Context, Markup, Telegraf } from 'telegraf';
import { truncate } from 'fs';

@Injectable()
export class BotService {
  constructor(
    @InjectModel(Bot) private botRepo: typeof Bot,
    @InjectBot(BOT_NAME) private readonly bot: Telegraf<Context>,
  ) {}

  async start(ctx: Context) {
    const userId = ctx.from.id;
    const user = await this.botRepo.findOne({ where: { user_Id: userId } });
    if (!user) {
      await this.botRepo.create({
        user_Id: userId,
        username: ctx.from.username,
        first_name: ctx.from.first_name,
        last_name: ctx.from.last_name,
      });
      await ctx.reply(`Please, <b>"Send phone number"</b> point button`, {
        parse_mode: 'HTML',
        ...Markup.keyboard([
          Markup.button.contactRequest('📞 Send me your phone number'),
        ])
          .oneTime()
          .resize(),
      });
    } else if (!user.status) {
      await ctx.reply(`Please, <b>"Send phone number"</b> point button`, {
        parse_mode: 'HTML',
        ...Markup.keyboard([
          Markup.button.contactRequest('📞 Send me your phone number'),
        ])
          .oneTime()
          .resize(),
      });
    } else {
      await ctx.reply(`With this bot you contact stadium program `, {
        parse_mode: 'HTML',
        ...Markup.removeKeyboard(),
      });
    }
  }

  async onContact(ctx: Context) {
    if ('contact' in ctx.message) {
      const userId = ctx.from.id;
      const user = await this.botRepo.findOne({
        where: { user_Id: userId },
      });
      if (!user) {
        await ctx.reply(`Please, <b>"/start"</b> point button`, {
          parse_mode: 'HTML',
          ...Markup.keyboard([['/start']])
            .oneTime()
            .resize(),
        });
      } else if (ctx.message.contact.user_id != userId) {
        await ctx.reply(`Please, <b>"Send your own contact"</b> point button`, {
          parse_mode: 'HTML',
          ...Markup.keyboard([
            Markup.button.contactRequest('📞 Send me your phone number'),
          ])
            .oneTime()
            .resize(),
        });
      } else {
        await this.botRepo.update(
          {
            phone_number: ctx.message.contact.phone_number,
            status: true,
          },
          {
            where: { user_Id: userId },
          },
        );
        await ctx.reply(`Congretulation, You have registrated`, {
          parse_mode: 'HTML',
          ...Markup.removeKeyboard(),
        });
      }
    }
  }
}
