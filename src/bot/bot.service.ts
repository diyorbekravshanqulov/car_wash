import { Injectable } from '@nestjs/common';
import { CreateBotDto } from './dto/create-bot.dto';
import { UpdateBotDto } from './dto/update-bot.dto';
import { InjectModel } from '@nestjs/sequelize';
import { Bot } from './model/bot.model';
import { InjectBot } from 'nestjs-telegraf';
import { BOT_NAME } from '../app.constants';
import { Context, Markup, Telegraf } from 'telegraf';
import { truncate } from 'fs';
import { UsersService } from '../users/users.service';

@Injectable()
export class BotService {
  private step: any;
  private step1: any;
  private user: any;
  private car: any;
  constructor(
    @InjectModel(Bot) private botRepo: typeof Bot,
    @InjectBot(BOT_NAME) private readonly bot: Telegraf<Context>,
    private readonly users: UsersService,
  ) {
    this.step = 0;
    this.step1 = 0;
    this.user = {};
    this.car = {};
  }

  async start(ctx: Context) {
    this.step = 0;
    this.step1 = 0;
    await ctx.reply(
      'Assalomu alaykum  ' +
        ctx.message.from.first_name +
        '\n' +
        "Avtomobil yuvish uchun ro'yxatdan o'tish uchun ekranning pastki qismidagi (Ro'yxatdan o'tish) tugmasini bosing.",
      {
        reply_markup: {
          keyboard: [
            [
              { text: "Ro'yxatdan o'tish" },
              { text: "Biz haqimizda ma'lumotlar" },
            ],
            [
              { text: 'Bizning manzil 📍' },
              { text: "Biz bilan bog'lanish 📲" },
            ],
          ],
          resize_keyboard: true,
        },
      },
    );
  }

  async onMessage(ctx: Context) {
    if ('text' in ctx.message) {
      if (ctx.message.text == 'Bizning manzil 📍') {
        await ctx.sendLocation(35.804819, 51.43407, {
          live_period: 86400,
        });
      }

      if (this.step == 0) {
        if (ctx.message.text == "Biz bilan bog'lanish 📲") {
          this.user.id = ctx.message.from.id;
          // Foydalanuvchidan ismini so'raymiz
          this.step = ++this.step; // keyingi qadamga o'tish
          await ctx.reply('Ismingizni kiritining', {
            reply_markup: {
              keyboard: [[{ text: 'Ortga qaytish' }]],
              resize_keyboard: true,
            },
          });
        }
      } else if (this.step == 1 && this.user.id == ctx.message.from.id) {
        // Foydalanuvchi ismini saqlash
        this.user.name = ctx.message.text;

        this.step = ++this.step; // boshqaga o'tish
        await ctx.reply(`Yoshingizdi kiritining`, {
          reply_markup: {
            keyboard: [[{ text: 'Ortga qaytish' }]],
            resize_keyboard: true,
          },
        });
      } else if (this.step == 2 && this.user.id == ctx.message.from.id) {
        // Foydalanuvchi ismini saqlash
        this.user.age = ctx.message.text;
        this.step = ++this.step; // boshqaga o'tish
        await ctx.reply(`Mashena nomi`, {
          reply_markup: {
            keyboard: [[{ text: 'Ortga qaytish' }]],
            resize_keyboard: true,
          },
        });
      } else if (this.step == 3 && this.user.id == ctx.message.from.id) {
        // Foydalanuvchi ismini saqlash
        this.user.car_name = ctx.message.text;

        await ctx.reply(
          `id:${this.user.id}
          Name:${this.user.name},
          Age:${this.user.age},
          Mashena:${this.user.car_name} `,
        );
      }

      if (ctx.message.text == "Biz haqimizda ma'lumotlar") {
        await ctx.reply(
          'Avtomobillarga xizmat ko’rsatish har doim daromadli xizmat ko’rsatish sohalaridan biri bo’lib kelmoqda. Ayniqsa har bir avtomobil egasi o’z mashinasiga o’zi xizmat ko’rsatsa bu ajoyib imkoniyatdan boshqa narsa emas.',
        );
      }

      if (ctx.message.text == "Ro'yxatdan o'tish") {
        await ctx.reply('Mashinagizdi turini aytining', {
          reply_markup: {
            keyboard: [[{ text: 'Yengil mashina' }, { text: 'Yuk mashinasi' }]],
            resize_keyboard: true,
          },
        });
      }

      if (this.step1 == 0) {
        if (ctx.message.text == 'Yengil mashina') {
          console.log(ctx, 'Yengil mashina');

          this.car.id = ctx.message.from.id;
          this.step1 = ++this.step1;
          await ctx.reply('Mashena name', {
            reply_markup: {
              keyboard: [[{ text: 'Ortga qaytish' }]],
              resize_keyboard: true,
            },
          });
        }
      } else if (this.step1 == 1 && this.car.id == ctx.message.from.id) {
        this.car.name = ctx.message.text;
        this.step1 = ++this.step1;
        await ctx.reply(`Qanday yuvish kerek`, {
          reply_markup: {
            keyboard: [[{ text: 'Ortga qaytish' }]],
            resize_keyboard: true,
          },
        });
      } else if (this.car.id == ctx.message.from.id) {
        console.log(ctx.message.text);

        this.car.yuvish = ctx.message.text;
        this.step1 = ++this.step1;
        await ctx.reply(
          `id:${this.car.id}
          :${this.car.name},
          :${this.car.yuvish},
         `,
        );
      }
    }
  }
}
