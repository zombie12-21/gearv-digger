const schools = {
  mojin: { name: '摸金派', glyph: '金', seal: '#9d7a45', title: '摸金校尉传', desc: '以摸金符感知机关，以分辨古物延续秘术。', bonus: '开局携带摸金符', focus: '远古铜具与机关之术' },
  faqiu: { name: '发丘派', glyph: '丘', seal: '#72806a', title: '丘山风水传', desc: '观星望气、寻龙点穴，能在迷乱中辨明墓地脉络。', bonus: '开局携带罗盘', focus: '风水脉络与路线推演' },
  banshan: { name: '搬山派', glyph: '山', seal: '#8c6e55', title: '搬山将军传', desc: '以力破局，擅长拆除封土、搬运巨石与破坏机括。', bonus: '开局携带撬棍', focus: '破拆封土与正面攻坚' },
  xieling: { name: '卸岭派', glyph: '岭', seal: '#7d675f', title: '卸岭王候传', desc: '善于伪装、潜行和撤退，可从敌人的盲区取得情报。', bonus: '开局携带黑布', focus: '潜行伪装与信息交易' }
};

const inventoryNames = {
  mojin: ['摸金符'], faqiu: ['寻龙罗盘'], banshan: ['铁撬棍'], xieling: ['黑色面巾']
};

const rooms = [
  { name: '朱雀回廊', rune: '玄', note: '潮湿的石砖下，传来一阵若隐若现的铜铃声。', text: '前方有一扇石门，门楣刻着未见过的符号。石缝中渗出一丝发霉的香气。', actions: [
    { label: '仔细观察符号', sub: '消耗体力 · 获得线索', type: 'observe' },
    { label: '直接推开石门', sub: '快速前进 · 风险较高', type: 'force' },
    { label: '检查墙边铜灯', sub: '可能藏有古物', type: 'search' },
    { label: '后退封住入口', sub: '谨慎行动 · 名望提升', type: 'retreat' }
  ]},
  { name: '玄武陪葬室', rune: '水', note: '四角铜鼎仍有余温，像刚刚有人祭过。', text: '陪葬室中排列着失去姓名的陶俑。中央石案上放着一枚折断的玉玦。', actions: [
    { label: '检查玉玦纹样', sub: '门派技能 · 获得情报', type: 'observe' },
    { label: '收取陪葬玉器', sub: '获得铜钱 · 增加业障', type: 'loot' },
    { label: '整理陶俑位置', sub: '可能触发机关', type: 'search' },
    { label: '留下一缕香火', sub: '消除业障 · 降低名望风险', type: 'retreat' }
  ]},
  { name: '青龙封印阁', rune: '封', note: '墙上的青龙仿佛随着烛光缓慢转动。', text: '一道铜锁封住通往地下的石阶。锁孔旁刻着九幽印，铜面下似乎有呼吸般的起伏。', actions: [
    { label: '以门派秘法试锁', sub: '根据传承决定成败', type: 'observe' },
    { label: '砸碎铜锁', sub: '迅速进入 · 伤害高', type: 'force' },
    { label: '寻找侧面暗道', sub: '消耗体力 · 寻找宝藏', type: 'search' },
    { label: '封存印记后离开', sub: '守墓结局线索', type: 'retreat' }
  ]}
];

let state = { school: null, vitality: 100, coins: 60, reputation: 50, karma: 0, room: 0, inventory: [] };

const $ = (id) => document.getElementById(id);
const schoolGrid = $('schools');

Object.entries(schools).forEach(([key, school]) => {
  const card = document.createElement('button');
  card.className = 'school-card';
  card.style.setProperty('--seal', school.seal);
  card.innerHTML = `<div class="seal-big">${school.glyph}</div><h3>${school.name}</h3><p>${school.desc}</p><span class="bonus">${school.bonus}</span>`;
  card.addEventListener('click', () => {
    document.querySelectorAll('.school-card').forEach(c => c.classList.remove('selected'));
    card.classList.add('selected');
    state.school = key;
    $('start-button').disabled = false;
  });
  schoolGrid.appendChild(card);
});

$('start-button').addEventListener('click', () => {
  const school = schools[state.school];
  state.inventory = [...inventoryNames[state.school]];
  $('seal-glyph').textContent = school.glyph;
  $('school-name').textContent = school.name;
  $('screen-select').classList.remove('active');
  $('screen-game').classList.add('active');
  render();
});

$('menu-button').addEventListener('click', () => {
  $('screen-game').classList.remove('active');
  $('screen-select').classList.add('active');
});

$('sound-toggle').addEventListener('click', (event) => {
  event.currentTarget.textContent = event.currentTarget.textContent === '◈' ? '○' : '◈';
});

function render() {
  const room = rooms[state.room];
  $('stat-vitality').textContent = state.vitality;
  $('stat-coins').textContent = state.coins;
  $('stat-reputation').textContent = state.reputation;
  $('stat-karma').textContent = state.karma;
  $('room-index').textContent = `云陵古墓 · 第${['一','二','三'][state.room]}层`;
  $('room-name').textContent = room.name;
  $('depth-value').textContent = String(state.room + 1).padStart(2, '0');
  $('gate-rune').textContent = room.rune;
  $('scene-note').textContent = room.note;
  $('event-text').textContent = room.text;

  const actions = $('actions');
  actions.innerHTML = '';
  room.actions.forEach(action => {
    const button = document.createElement('button');
    button.className = 'action-button';
    button.innerHTML = `${action.label}<span>${action.sub}</span>`;
    button.addEventListener('click', () => takeAction(action.type));
    actions.appendChild(button);
  });

  const inventory = $('inventory');
  inventory.innerHTML = '';
  for (let i = 0; i < 6; i++) {
    const item = document.createElement('div');
    item.className = state.inventory[i] ? 'item' : 'item empty';
    item.textContent = state.inventory[i] ? state.inventory[i].slice(0, 1) : '·';
    item.title = state.inventory[i] || '空位';
    inventory.appendChild(item);
  }
  $('inventory-count').textContent = `${state.inventory.length}/6`;
}

function takeAction(type) {
  const school = schools[state.school];
  const messages = [];
  if (type === 'observe') {
    state.vitality -= 4;
    state.reputation += 3;
    messages.push(`${school.name}的秘法展开：石门后的脉络逐渐清晰，“九幽印”并非宝物，而是一道封印。`);
  } else if (type === 'force') {
    state.vitality -= 18;
    state.karma += 4;
    messages.push('机括被强行触发，碎石散落。古墓结构震动，前方暂时打开了一条道路。');
  } else if (type === 'search') {
    state.vitality -= 7;
    state.coins += 15;
    state.karma += 2;
    if (state.inventory.length < 6) state.inventory.push('古玉残片');
    messages.push('暗格中找到古玉残片与一袋铜钱。残片上刻着与九幽印相同的纹路。');
  } else {
    state.reputation += 8;
    state.karma = Math.max(0, state.karma - 3);
    state.vitality += 8;
    messages.push('你没有立刻带走眼前的宝物。古墓深处传来片刻宁静，仿佛得到了回应。');
  }

  state.vitality = Math.min(100, Math.max(0, state.vitality));
  state.reputation = Math.max(0, Math.min(100, state.reputation));
  state.karma = Math.max(0, state.karma);
  state.room = (state.room + 1) % rooms.length;
  render();
  $('event-text').textContent = messages[0];

  if (state.vitality === 0) {
    $('event-text').textContent = '体力耗尽。你勉强封住古墓入口，但未能深入九幽……（刷新页面可重新开始）';
    $('actions').innerHTML = '';
  }
}
