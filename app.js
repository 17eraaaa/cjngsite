const { Client, GatewayIntentBits } = require('discord.js');
const express = require('express');
const cors = require('cors');

// 1. Инициализация бота с нужными правами
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,   // Важно: Кэширует юзеров
        GatewayIntentBits.GuildPresences  // Важно: Видит их онлайн-статусы
    ]
});

const app = express();
app.use(cors()); 

// --- НАСТРОЙКИ ---
const SERVER_ID = '1275486349906018397'; 
const DISCORD_TOKEN = process.env.DISCORD_TOKEN; 
// ------------------

// 2. API Эндпоинт для сайта (делаем асинхронным через async/await)
app.get('/api/status', async (req, res) => {
    try {
        // Получаем сервер из кэша или запрашиваем у Discord напрямую
        let guild = client.guilds.cache.get(SERVER_ID);
        if (!guild) {
            guild = await client.guilds.fetch(SERVER_ID);
        }
        
        if (!guild) {
            return res.status(404).json({ error: "Сервер Discord не найден или бот не добавлен на него." });
        }

        // КРИТИЧЕСКИ ВАЖНО: Принудительно выкачиваем актуальный список участников со статусами онлайн
        // Без этого guild.members.cache будет пустой или неполный!
        const members = await guild.members.fetch({ withPresences: true });

        // Считаем онлайн (все, кроме тех, у кого статус 'offline' или отсутствует presence)
        const onlineCount = members.filter(m => m.presence && m.presence.status !== 'offline').size;

        res.json({
            serverName: guild.name,
            totalMembers: guild.memberCount, // Отдает 100% точное общее число участников сервера
            onlineMembers: onlineCount,     // Точное число людей в сети
            botStatus: "online"
        });
        
    } catch (error) {
        console.error("Ошибка при обработке запроса API:", error);
        res.status(500).json({ error: "Внутренняя ошибка сервера API" });
    }
});

// 3. Лог успешного запуска бота в Discord
client.once('ready', () => {
    console.log(`✅ Бот ${client.user.tag} успешно запущен и авторизован!`);
});

// 4. Логин бота
if (!DISCORD_TOKEN) {
    console.error("❌ КРИТИЧЕСКАЯ ОШИБКА: Переменная среды DISCORD_TOKEN не задана!");
} else {
    client.login(DISCORD_TOKEN).catch(err => console.error("❌ Ошибка авторизации токена:", err.message));
}

// 5. Запуск веб-сервера Express
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Веб-сервер API успешно запущен на порту ${PORT}`));
