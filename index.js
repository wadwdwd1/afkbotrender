const mineflayer = require('mineflayer');
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder');
const { GoalBlock } = goals;

const bot = mineflayer.createBot({
  host: 'test.wadmc.site',
  port: 25565,
  username: 'minor'
});

bot.loadPlugin(pathfinder);

bot.once('spawn', () => {
  const mcData = require('minecraft-data')(bot.version);
  const defaultMove = new Movements(bot, mcData);
  bot.pathfinder.setMovements(defaultMove);

  bot.chat("Hello! Looking for stone...");

  findAndMineStone();

  function findAndMineStone() {
    const stoneBlock = bot.findBlock({
      matching: block => block.name === 'stone',
      maxDistance: 32,
      count: 1
    });

    if (!stoneBlock) {
      bot.chat("No stone found nearby! 😢");
      return;
    }

    const pos = stoneBlock.position;
    bot.chat(`Found stone at ${pos}. Going to it...`);

    bot.pathfinder.setGoal(new GoalBlock(pos.x, pos.y, pos.z));

    bot.once('goal_reached', async () => {
      bot.chat("Arrived at stone. Equipping pickaxe...");

      try {
        const pickaxe = bot.inventory.items().find(item =>
          item.name.includes('pickaxe')
        );

        if (!pickaxe) {
          bot.chat("No pickaxe in inventory!");
          return;
        }

        await bot.equip(pickaxe, 'hand');
        bot.chat("Pickaxe equipped! Mining now...");

        await bot.dig(stoneBlock);
        bot.chat("Mined the stone! ✅");

        setTimeout(findAndMineStone, 2000);
      } catch (err) {
        bot.chat("Error while mining: " + err.message);
        console.error(err);
      }
    });
  }
});

bot.on('error', err => {
  console.log("❌ Bot error:", err);
});

bot.on('end', () => {
  console.log("👋 Bot disconnected.");
});
