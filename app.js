const { Client, GatewayIntentBits } = require('discord.js');
const express = require('express');
const cors = require('cors');

// 1. Инициализация бота с нужными правами
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildPresences
    ]
});

const app = express();
app.use(cors());

// --- НАСТРОЙКИ (ЗАМЕНИ НА СВОИ) ---
const SERVER_ID = '1275486349906018397'; 

// ----------------------------------

// 2. API Эндпоинт для сайта
app.get('/api/status', (req, res) => {
    const guild = client.guilds.cache.get(SERVER_ID);
    
    if (!guild) {
        return res.status(404).json({ error: "Сервер не найден" });
    }

    // Считаем онлайн (те, кто не offline)
    const onlineCount = guild.members.cache.filter(m => m.presence?.status && m.presence.status !== 'offline').size;

    res.json({
        serverName: guild.name,
        totalMembers: guild.memberCount,
        onlineMembers: onlineCount,
        botStatus: "online" // Если API ответило, значит процесс бота запущен
    });
});

// 3. Лог запуска
client.once('ready', () => {
    console.log(`✅ Бот ${client.user.tag} готов!`);
    console.log(`🔗 API доступно: http://localhost:3000/api/status`);
});

// 4. Логин
client.login(BOT_TOKEN).catch(err => console.error("❌ Ошибка токена:", err.message));

app.listen(3000, () => console.log('🚀 Веб-сервер запущен на порту 3000'));