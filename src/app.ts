import { Bot, InlineKeyboard } from "grammy";
import dotenv from "dotenv"
dotenv.config();

//Store bot screaming status
let screaming = false;

//Create a new bot
const bot = new Bot(process.env.TELEGRAM_TOKEN!);

/* 
  COMMANDS
*/
bot.command("start", (ctx) => ctx.reply(
  `Welcome! Up and running.\n
  Use /menu to show the menu options`
));

//This function handles the /scream command
bot.command("scream", () => {
  console.log('scream command triggered!');
  screaming = true;
});

// This function handles /whisper command
bot.command("whisper", () => {
  screaming = false;
});

/* 
  MESSAGES
*/
bot.hears(/.*ping.*/, async (ctx) => {
  // `reply` is an alias for `sendMessage` in the same chat (see next section).
  await ctx.reply("pong!!", {
    // `reply_parameters` specifies the actual reply feature.
    reply_parameters: { message_id: ctx.msg.message_id },
    reply_markup: { force_reply: true },
  });
});

//This function would be added to the dispatcher as a handler for messages coming from the Bot API
bot.on(":text", async (ctx) => {
  const message = ctx.msg.text!
  // Print to console
  console.log(
    `${ctx.from!.first_name} wrote ${message}`,
  );
  // send dm to the user
  // ctx.api.sendMessage(ctx.from!.id, `${ctx.from!.first_name} wrote ${message}`)

  if (screaming && ctx.msg.text) {
    // Scream the message
    await ctx.reply(ctx.msg.text.toUpperCase(), {
      entities: ctx.msg.entities,
      reply_parameters: { message_id: ctx.msg.message_id }
    });
  } else {
    ctx.reply(message, {
      // entities: ctx.message.entities,
      reply_parameters: { message_id: ctx.msg.message_id }
    })
  }
});

bot.on(":media");
bot.on(":file");
bot.on(["message", "edited_message"] /* , ... */);
bot.on("message:photo", (ctx) => {
  console.log(
    `${ctx.from.first_name} sent a photo`,
  );
});


/* 
  CREATE A MENU 
*/

//Pre-assign menu text
const firstMenu = "<b>Menu 1</b>\n\nA beautiful menu with a shiny inline button.";
const secondMenu = "<b>Menu 2</b>\n\nA better menu with even more shiny inline buttons.";

//Pre-assign button text
const nextButton = "Next";
const backButton = "Back";
const tutorialButton = "Tutorial";

//Build keyboards
const firstMenuMarkup = new InlineKeyboard().text(nextButton, nextButton);
const secondMenuMarkup = new InlineKeyboard().text(backButton, backButton).text(tutorialButton, "https://core.telegram.org/bots/tutorial");


//This handler sends a menu with the inline buttons we pre-assigned above
bot.command("menu", async (ctx) => {
  await ctx.reply(firstMenu, {
    parse_mode: "HTML",
    reply_markup: firstMenuMarkup,
  });
});

//This handler processes back button on the menu
bot.callbackQuery(backButton, async (ctx) => {
  //Update message content with corresponding menu section
  await ctx.editMessageText(firstMenu, {
    reply_markup: firstMenuMarkup,
    parse_mode: "HTML",
  });
});

//This handler processes next button on the menu
bot.callbackQuery(nextButton, async (ctx) => {
  //Update message content with corresponding menu section
  await ctx.editMessageText(secondMenu, {
    reply_markup: secondMenuMarkup,
    parse_mode: "HTML",
  });
});


//Start the Bot
bot.start();
