const TelegramBot = require('node-telegram-bot-api');
const TOKEN_v2 = "8016611576:AAGpzknvJ6p2bN6_0RDV9DIkR9asWX7zl2Y";
const GROUP_ID = "-1002467053411";
const bot = new TelegramBot(TOKEN_v2, { polling: true });

const USER_ACTIVITY = new Map();

// Функция для проверки активности пользователей
async function checkUserActivity() {
    setInterval(async () => {
        const currentTime = Date.now();
        for (const [userId, lastMessageTime] of USER_ACTIVITY.entries()) {
            const inactiveTime = currentTime - lastMessageTime;

            // 30 дней в миллисекундах (30 * 24 * 60 * 60 * 1000)
            if (inactiveTime > 30 * 24 * 60 * 60 * 1000) { 
                try {
                    await bot.banChatMember(GROUP_ID, userId, { until_date: Math.floor(Date.now() / 1000) + 60 }); // Баним на 1 минуту
                    setTimeout(async () => {
                        try {
                            await bot.unbanChatMember(GROUP_ID, userId, { only_if_banned: true }); // Разбан
                            await bot.kickChatMember(GROUP_ID, userId); // Удаляем из группы
                            USER_ACTIVITY.delete(userId);
                            console.log(`User ${userId} removed for inactivity`);
                        } catch (error) {
                            console.error(`Error removing user ${userId}:`, error);
                        }
                    }, 60 * 1000); // Через 1 минуту после бана удаляем
                } catch (error) {
                    console.error(`Error banning user ${userId}:`, error);
                }
            }
        }
    }, 60 * 1000); // Проверка каждую минуту
}

// Обработчик команды /start
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    USER_ACTIVITY.set(msg.from.id, Date.now());
    bot.sendMessage(chatId, "Salom! Bu bot orqali sizni kuzatib boraman!");
});

// Отслеживание активности пользователей
bot.on('message', (msg) => {
    if (msg.chat.type === 'supergroup' || msg.chat.type === 'group') {
        USER_ACTIVITY.set(msg.from.id, Date.now());
    }
});

// Команда /active_users
bot.onText(/\/active_users/, async (msg) => {
    const chatId = msg.chat.id;

    if (USER_ACTIVITY.size === 0) {
        bot.sendMessage(chatId, "Hozircha faollik kuzatilmadi.");
        return;
    }

    let activeUsersList = "Faol foydalanuvchilar:\n";
    for (const userId of USER_ACTIVITY.keys()) {
        try {
            const user = await bot.getChatMember(chatId, userId);
            activeUsersList += `👤 ${user.user.first_name} (@${user.user.username || "yo'q"})\n`;
        } catch (error) {
            console.error(`Error fetching user ${userId}:`, error);
            activeUsersList += `👤 UserID: ${userId}\n`;
        }
    }

    bot.sendMessage(chatId, activeUsersList);
});

// Запускаем проверку активности
checkUserActivity();
