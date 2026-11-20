const weapons = {
  mojin: { name:'玄铁摸金锹', icon:'锹', damage:18, rarity:'rare', effect:'挖掘时不触发机关' },
  faqiu: { name:'分金定穴尺', icon:'尺', damage:12, rarity:'legend', effect:'查看墓穴隐藏路线' },
  banshan: { name:'龙纹开山斧', icon:'斧', damage:28, rarity:'rare', effect:'对石质机关额外伤害' },
  xieling: { name:'追魂匕首', icon:'刃', damage:16, rarity:'legend', effect:'暴击后恢复体力' }
};

const itemCatalog = [
  { name:'朱砂符', icon:'符', type:'消耗品', desc:'抵挡一次诅咒伤害' },
  { name:'回春丹', icon:'丹', type:'消耗品', desc:'恢复30点体力' },
  { name:'夜明珠', icon:'珠', type:'宝物', desc:'照亮隐藏暗道' },
  { name:'青铜镇墓兽', icon:'兽', type:'宝物', desc:'提高破拆成功率' },
  { name:'金蚕丝', icon:'丝', type:'材料', desc:'制作防护装备' },
  { name:'牵魂铃', icon:'铃', type:'奇物', desc:'吸引远处敌人的注意' },
  { name:'九幽残片', icon:'印', type:'任务物品', desc:'缺失九幽印的关键碎片' },
  { name:'避邪铜镜', icon:'镜', type:'护具', desc:'减少诅咒与业障' }
];

const originalTakeAction = window.takeAction;

state.weapon = weapons[state.school] || weapons.mojin;
state.enemy = null;

function installInventoryExpansion() {
  const inventoryPanel = document.querySelector('.inventory-panel');
  if (!inventoryPanel) return;

  let weaponPanel = document.getElementById('weapon-panel');
  if (!weaponPanel) {
    weaponPanel = document.createElement('div');
    weaponPanel.id = 'weapon-panel';
    weaponPanel.className = 'weapon-panel';
    inventoryPanel.appendChild(weaponPanel);
  }

  const itemSection = document.createElement('div');
  itemSection.id = 'loot-section';
  itemSection.className = 'loot-section';
  itemSection.innerHTML = '<div class="panel-heading"><span>可用物品</span><strong>快捷栏</strong></div><div id="item-grid" class="item-grid"></div>';
  inventoryPanel.appendChild(itemSection);

  renderWeapons();
  renderItemGrid();
}

function renderWeapons() {
  const panel = document.getElementById('weapon-panel');
  if (!panel) return;
  panel.innerHTML = `
    <div class="panel-heading"><span>特殊武器</span><strong>${state.weapon.rarity === 'legend' ? '传说' : '稀有'}</strong></div>
    <button class="weapon-card" id="equipped-weapon">
      <span class="weapon-icon">${state.weapon.icon}</span>
      <strong>${state.weapon.name}</strong>
      <small>伤害 ${state.weapon.damage} · ${state.weapon.effect}</small>
    </button>`;
}

function renderItemGrid() {
  const grid = document.getElementById('item-grid');
  if (!grid) return;
  grid.innerHTML = itemCatalog.slice(0, 6).map((item, index) => `
    <button class="loot-item" data-index="${index}" title="${item.desc}">
      <span>${item.icon}</span>
      <small>${item.name}</small>
    </button>`).join('');

  grid.querySelectorAll('.loot-item').forEach(button => {
    button.addEventListener('click', () => useItem(itemCatalog[Number(button.dataset.index)]));
  });
}

function useItem(item) {
  if (item.name === '回春丹') {
    state.vitality = Math.min(100, state.vitality + 30);
  } else if (item.name === '朱砂符') {
    state.karma = Math.max(0, state.karma - 5);
  } else if (item.name === '夜明珠') {
    state.reputation = Math.min(100, state.reputation + 2);
  } else {
    state.coins += item.type === '宝物' ? 20 : 5;
  }
  $('event-text').textContent = `使用了${item.name}：${item.desc}。`;
  render();
}

window.enhancedTakeAction = function(type) {
  takeAction(type);
  if (type === 'force' || type === 'observe') {
    state.enemy = { name: state.room === 2 ? '青铜墓将' : '腐骨守卫', health: 40 + state.room * 20 };
    $('event-text').textContent += ` 突然出现：${state.enemy.name}！`;
    addCombatButtons();
  }
  renderWeapons();
};

function addCombatButtons() {
  if (!state.enemy) return;
  const actions = $('actions');
  const combat = document.createElement('div');
  combat.className = 'combat-panel';
  combat.innerHTML = `
    <span>敌人：${state.enemy.name}</span>
    <strong>生命 ${state.enemy.health}</strong>
    <button class="action-button" id="attack-button">使用${state.weapon.name}<span>造成 ${state.weapon.damage} 点伤害</span></button>`;
  actions.prepend(combat);
  $('attack-button').addEventListener('click', () => {
    let damage = state.weapon.damage;
    if (state.school === 'xieling' && Math.random() > 0.7) {
      damage *= 2;
      state.vitality = Math.min(100, state.vitality + 8);
    }
    state.enemy.health -= damage;
    if (state.enemy.health <= 0) {
      state.coins += 35;
      state.reputation += 5;
      state.karma += 2;
      if (state.inventory.length < 6) state.inventory.push('机关核心');
      state.enemy = null;
      $('event-text').textContent = `击败守墓者！获得铜钱与机关核心。`;
      combat.remove();
    } else {
      state.vitality -= 7;
      combat.querySelector('strong').textContent = `生命 ${state.enemy.health}`;
      $('event-text').textContent = `${state.enemy.name}反击，损失7点体力。`;
    }
    render();
  });
}

const observer = new MutationObserver(() => {
  if (!document.getElementById('loot-section')) installInventoryExpansion();
});
observer.observe(document.querySelector('.inventory-panel') || document.body, { childList:true, subtree:true });

window.addEventListener('load', () => {
  installInventoryExpansion();

  document.queryAll = document.querySelectorAll;
  const actionArea = document.querySelector('#actions');
  if (actionArea) {
    actionArea.addEventListener('click', event => {
      const button = event.target.closest('.action-button');
      if (!button || button.id === 'attack-button') return;
    });
  }
});
