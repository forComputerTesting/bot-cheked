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
            if (currentTime - lastMessageTime > 5000) { // 5 секунд
                try {
                    const banDuration = 7 * 24 * 60 * 60; // 7 дней в секундах
                    const untilDate = Math.floor(Date.now() / 1000) + banDuration;

                    await bot.banChatMember(GROUP_ID, userId, { until_date: untilDate });
                    USER_ACTIVITY.delete(userId);
                    console.log(`User ${userId} banned for 7 days due to inactivity`);
                } catch (error) {
                    console.error(`Error banning user ${userId}:`, error);
                }
            }
        }
    }, 1000); // Проверка каждую секунду
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

// Запускаем проверку активности
checkUserActivity();
