const TelegramBot = require('node-telegram-bot-api');
const TOKEN_v2 = "8016611576:AAGpzknvJ6p2bN6_0RDV9DIkR9asWX7zl2Y";
const GROUP_ID = "-1002293469110";
const bot = new TelegramBot(TOKEN_v2, { polling: true });

const USER_ACTIVITY = new Map();

// Функция для проверки активности пользователей
async function checkUserActivity() {
    setInterval(async () => {
        const currentTime = Date.now();
        for (const [userId, lastMessageTime] of USER_ACTIVITY.entries()) {
            if (currentTime - lastMessageTime > 5000) { // 5 секунд
                try {
                    await bot.banChatMember(GROUP_ID, userId);
                    USER_ACTIVITY.delete(userId);
                    console.log(`User ${userId} kicked for inactivity`);
                } catch (error) {
                    console.error(`Error kicking user ${userId}:`, error);
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
