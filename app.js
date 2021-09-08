const { Telegraf } = require('telegraf');
const session = require('telegraf/session')
const Markup = require('telegraf/markup')
const chatrafinad = 477071
const accessdeny = ("Данный бот не работает в вашем чате, пожалуйста обратитесь к создателю @rafinad.")


function getMainMenu() {
    return Markup.keyboard([
        ['Список жрален', 'Добавить/Удалить жральню'],
        ['Идём жрать!']
    ]).resize().extra()
}

function yesNoKeyboard() {
    return Markup.inlineKeyboard([
        Markup.callbackButton('Да', 'yes'),
        Markup.callbackButton('Нет', 'no')
    ], {columns: 2}).extra()
}




let taskList = {
   "-1001157323283":[ "KFC", "Бургер Кинг", "Макдональдс", "Шаурма", "Пицца", "Суши" ],//чат 2
   "477071":[ "Лаки", "Марукамэ", "Моремания", "StrEAT" ], //моя личка с ботом
   "-259796507":[ "Лаки", "Марукамэ", "Моремания", "StrEAT" ], 
   "main":[ "это список для всех пользователей" ], 
   "main":[ "это список для всех пользователей" ], 
   "main":[ "это список для всех пользователей" ], 
   "main":[ "это список для всех пользователей" ], 
   "main":[ "это список для всех пользователей" ],  
   "main":[ "это список для всех пользователей" ]  
}

const allowChats = Object.keys(taskList)

function checkChat(chatid) {
  try {
    if (allowChats.includes(`${chatid}`)) {
      return true
    }
    return false
  } catch(err) {
        console.log(err)
    }
}



function getMyTasks(chatid) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(taskList[chatid])
        }, 500)
    })
}


function addTask(chatid, text) {
    taskList[chatid].push(text)
}

function deleteTask(chatid, id) {
    taskList[chatid].splice(id, 1)
}


const bot = new Telegraf(process.env.BOT_TOKEN)

function deleteMessage(chatid, messageid) {
    setTimeout(() => bot.telegram.deletemessage(chatid, messageid), 5 * 1000);
}

bot.use(session())


bot.hears(/^пинг$|^пук$/i, async (ctx) => {
 //  if (checkChat(ctx.chat.id)) ctx.reply('checkChat=true'); else ctx.reply('checkChat=false');
  //  ctx.deleteMessage(ctx.message.id)
    const lastmessage = await ctx.reply(`ChatID=${ctx.chat.id}`);
  //  await deleteMessage(ctx.message.id, lastmessage.message_id)
   //  ctx.reply(`__${lastmessage.message_id}`)
  // setTimeout(deleteMessage, 5 * 1000, ctx.chat.id, lastmessage.message_id)
   setTimeout(() => ctx.deleteMessage(lastmessage.message_id), 5 * 1000);
})


bot.start(ctx => {
    ctx.replyWithHTML(
        'Привет, я <b>Голодный енот!</b>\n\n'+
        'Если Вы хотите пойти поесть то просто напишите "хочу жрать" в чат')
})

bot.hears(/.+stop/i, ctx => {
    ctx.reply("Ну чтож, в другой раз поедим!", Markup.removeKeyboard().extra())
})

bot.hears(/^хочу жрать$|.+eat/i, ctx => {
    ctx.replyWithHTML(
        'Привет, я <b>Голодный енот!</b>\n\n'+
        'Чтобы быстро добавить жральню, просто напишите "добавить НАЗВАНИЕ_ЖРАЛЬНИ" и отправьте боту',
        getMainMenu())
})

bot.hears(/^список жрален/i, async ctx => {
    
       if (await !checkChat(ctx.chat.id)) {
           return ctx.reply(`Данный бот не работает в вашем чате, пожалуйста обратитесь к создателю @rafinad. Ваш ChatID: ${ctx.chat.id}`)
       }
       const chatid = ctx.chat.id
    const tasks = await getMyTasks(chatid)
    let result = ''

    for (let i = 0; i < tasks.length; i++) {
        result = result + `[${i+1}] ${tasks[i]}\n`
    }

    ctx.replyWithHTML(
        `<b>Список жрален вашего чата:</b>\n\n`+
        `${result}`
    )
})


bot.hears(/^добавить\/Удалить жральню$/i, ctx => {
    ctx.replyWithHTML(
        'Введите фразу <i>"удалить НОМЕР_ЖРАЛЬНИ"</i>, чтобы удалить его из списка,'+
        ' например: \n<b>"удалить 3"</b>\n'+
        'Чтобы быстро добавить жральню, просто напишите "добавить НАЗВАНИЕ_ЖРАЛЬНИ" и отправьте в чат, например:\n'+
        ' например: \n<b>"добавить Шаурмешная №1"</b>\n',
    )
})

bot.hears(/^удалить\s(\d+)$/i, async ctx => {
    if (await !checkChat(ctx.chat.id)) {
        return ctx.reply(`Я не смогу ничего удалить :-(. ${accessdeny} Ваш ChatID: ${ctx.chat.id}`)
       }
    const id = Number(+/\d+/.exec(ctx.message.text)) - 1
    deleteTask(ctx.chat.id, id)
    ctx.reply('Ваша жральня успешно удалена')
})

bot.hears(/^идём жрать/i, async ctx => {
    
       if (await !checkChat(ctx.chat.id)) {
           return ctx.reply(`Сегодня никуда не пойдём :-( Данный бот не работает в вашем чате, пожалуйста обратитесь к создателю @rafinad. Ваш ChatID: ${ctx.chat.id}`)
       }
       chatid = ctx.chat.id
    const randomTask = taskList[chatid][Math.floor(Math.random() * taskList[chatid].length )];
    ctx.replyWithPhoto(
        'https://enot-doma.ru/wp-content/uploads/2017/01/20.01.2017_01.jpg',
        {
            caption: (`Ура, идём жрать в ${randomTask}!`)
        }
    )
    ctx.reply("Приятного аппетита!", Markup.removeKeyboard().extra())
})

bot.hears(/^добавить\s/i, async ctx => {
    if (await !checkChat(ctx.chat.id)) {
           return ctx.reply(`Ничего не буду добавлять :-(. ${accessdeny} Ваш ChatID: ${ctx.chat.id}`)
       }
    ctx.message.text=ctx.message.text.replace(/добавить /i, "");
    ctx.session.taskText = ctx.message.text
    ctx.session.chatId = ctx.chat.id

    ctx.replyWithHTML(
        `Вы действительно хотите добавить жральню:\n\n`+
        `<i>${ctx.message.text}</i>`,
        yesNoKeyboard()
    )
})

bot.action(['yes', 'no'], ctx => {
    if (ctx.callbackQuery.data === 'yes') {
        chatid = ctx.session.chatId
        addTask(chatid, ctx.session.taskText)
        ctx.editMessageText('Ваша жральня успешно добавлена')
    } else {
        ctx.deleteMessage()
    }
})




module.exports.handler = async function (event, context) {
    const message = JSON.parse(event.body);
    await bot.handleUpdate(message);
    return {
        statusCode: 200,
        body: '',
    };
};

