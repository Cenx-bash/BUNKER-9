    /* ============================================================
   BUNKER-9 :: DELIRIUM SWEEP
   game.js
   ============================================================ */

/* ============================================================
   DIFFICULTY SYSTEM
   ============================================================ */
const DIFFICULTIES = {
  easy: {
    label: "EASY", enemyCount: 3, enemySpeed: 1.0, damagePerSec: 6,
    sanityDrain: 0.6, scoreMult: 0.8, moneyMult: 0.8, health: 130,
    bossHealthMult: 0.8, bossDamageMult: 0.6, bossInterval: 10,
    healthScaling: 0.15, enemyScaling: 0.3, hellMode: false,
    allBoss: false, bossAbilities: false,
  },
  medium: {
    label: "MEDIUM", enemyCount: 5, enemySpeed: 1.4, damagePerSec: 12,
    sanityDrain: 1.5, scoreMult: 1.0, moneyMult: 1.0, health: 100,
    bossHealthMult: 1.2, bossDamageMult: 0.9, bossInterval: 7,
    healthScaling: 0.35, enemyScaling: 0.8, hellMode: false,
    allBoss: false, bossAbilities: false,
  },
  hard: {
    label: "HARD", enemyCount: 8, enemySpeed: 1.8, damagePerSec: 20,
    sanityDrain: 2.5, scoreMult: 1.3, moneyMult: 1.3, health: 80,
    bossHealthMult: 1.8, bossDamageMult: 1.2, bossInterval: 5,
    healthScaling: 0.55, enemyScaling: 1.3, hellMode: false,
    allBoss: false, bossAbilities: false,
  },
  extreme: {
    label: "EXTREME", enemyCount: 11, enemySpeed: 2.2, damagePerSec: 28,
    sanityDrain: 3.5, scoreMult: 1.7, moneyMult: 1.7, health: 65,
    bossHealthMult: 2.5, bossDamageMult: 1.6, bossInterval: 3,
    healthScaling: 0.75, enemyScaling: 1.8, hellMode: false,
    allBoss: false, bossAbilities: false,
  },
  impossible: {
    label: "IMPOSSIBLE", enemyCount: 14, enemySpeed: 2.6, damagePerSec: 35,
    sanityDrain: 4.5, scoreMult: 2.2, moneyMult: 2.2, health: 50,
    bossHealthMult: 3.5, bossDamageMult: 2.0, bossInterval: 1,
    healthScaling: 1.0, enemyScaling: 2.2, hellMode: false,
    allBoss: false, bossAbilities: true,
  },
  hell: {
    label: "HELL", enemyCount: 20, enemySpeed: 2.8, damagePerSec: 40,
    sanityDrain: 6.0, scoreMult: 3.0, moneyMult: 3.0, health: 35,
    bossHealthMult: 4.0, bossDamageMult: 2.5, bossInterval: 1,
    healthScaling: 1.5, enemyScaling: 0, hellMode: true,
    allBoss: true, bossAbilities: true,
  },
};

const DIFFICULTY_UNLOCKS = {
  easy:       { require: null,       label: "EASY" },
  medium:     { require: "easy",     requireLevel: 10, label: "MEDIUM" },
  hard:       { require: "medium",   requireLevel: 10, label: "HARD" },
  extreme:    { require: "hard",     requireLevel: 10, label: "EXTREME" },
  impossible: { require: "extreme",  requireLevel: 10, label: "IMPOSSIBLE" },
  hell:       { require: "impossible", requireLevel: 10, label: "HELL" },
};

/* ============================================================
   MAP TYPES
   ============================================================ */
const MAP_TYPES = {
  BUNKER: {
    name: "BUNKER", theme: "industrial",
    wallColor: "#4a4540", floorColor: "#2a2520", ceilingColor: "#0a0908",
    accentColor: "#5a5040", ambientColor: 0x2a1a0a, lightColor: 0xff8040,
    fogColor: 0x020100, fogDensity: 0.015,
    hasLamps: true, hasPipes: true,
    enemyTypes: ["grunt", "tank", "brute"], bossType: "warden",
  },
  CRYPT: {
    name: "CRYPT", theme: "dark",
    wallColor: "#3a3535", floorColor: "#1a1a1a", ceilingColor: "#0a0a0a",
    accentColor: "#4a4035", ambientColor: 0x1a0a1a, lightColor: 0x8040ff,
    fogColor: 0x050005, fogDensity: 0.02,
    hasLamps: false, hasPipes: false,
    enemyTypes: ["grunt", "fast", "spitter"], bossType: "lich",
  },
  FACTORY: {
    name: "FACTORY", theme: "mechanical",
    wallColor: "#5a5045", floorColor: "#3a3530", ceilingColor: "#1a1a1a",
    accentColor: "#6a6040", ambientColor: 0x1a2a0a, lightColor: 0x80ff40,
    fogColor: 0x020100, fogDensity: 0.012,
    hasLamps: true, hasPipes: true,
    enemyTypes: ["grunt", "tank", "brute", "fast"], bossType: "mech",
  },
  LAB: {
    name: "LAB", theme: "scientific",
    wallColor: "#4a5a5a", floorColor: "#2a3a3a", ceilingColor: "#1a2a2a",
    accentColor: "#5a6a6a", ambientColor: 0x0a1a2a, lightColor: 0x4080ff,
    fogColor: 0x000510, fogDensity: 0.01,
    hasLamps: true, hasPipes: false,
    enemyTypes: ["fast", "spitter", "grunt"], bossType: "experiment",
  },
  SEWER: {
    name: "SEWER", theme: "toxic",
    wallColor: "#3a3a2a", floorColor: "#2a2a1a", ceilingColor: "#1a1a0a",
    accentColor: "#4a4a2a", ambientColor: 0x0a1a0a, lightColor: 0x40ff80,
    fogColor: 0x000500, fogDensity: 0.025,
    hasLamps: false, hasPipes: true,
    enemyTypes: ["spitter", "grunt", "fast"], bossType: "abomination",
  },
  TEMPLE: {
    name: "TEMPLE", theme: "ancient",
    wallColor: "#5a4a3a", floorColor: "#3a2a1a", ceilingColor: "#1a1a0a",
    accentColor: "#6a5a4a", ambientColor: 0x1a0a0a, lightColor: 0xff8040,
    fogColor: 0x050000, fogDensity: 0.018,
    hasLamps: false, hasPipes: false,
    enemyTypes: ["grunt", "brute", "fast"], bossType: "guardian",
  },
};

/* ============================================================
   WEAPONS
   ============================================================ */
const WEAPONS = [
  { id: "knife", name: "COMBAT KNIFE", damage: 30, fireRate: 0.35, range: 1.8, price: 0, owned: true, equipped: true, spread: 0, ammo: 0, maxAmmo: 0, reloadTime: 0, auto: false, desc: "Standard melee weapon", color: "#888888", isMelee: true, xp: 0, level: 1, mastered: false, weaponType: "melee" },
  { id: "machete", name: "MACHETE", damage: 45, fireRate: 0.5, range: 2.2, price: 350, owned: false, equipped: false, spread: 0, ammo: 0, maxAmmo: 0, reloadTime: 0, auto: false, desc: "Heavy slashing blade", color: "#aaaaaa", isMelee: true, xp: 0, level: 1, mastered: false, weaponType: "melee" },
  { id: "m9", name: "M9 PISTOL", damage: 25, fireRate: 0.28, range: 30, price: 200, owned: false, equipped: false, spread: 0.02, ammo: 15, maxAmmo: 15, reloadTime: 1.2, auto: false, desc: "Standard sidearm", color: "#f0b060", isMelee: false, xp: 0, level: 1, mastered: false, weaponType: "pistol" },
  { id: "deagle", name: "DEAGLE .50", damage: 90, fireRate: 0.4, range: 38, price: 800, owned: false, equipped: false, spread: 0.02, ammo: 7, maxAmmo: 7, reloadTime: 1.8, auto: false, desc: "High-caliber pistol", color: "#ffcc44", isMelee: false, xp: 0, level: 1, mastered: false, weaponType: "pistol" },
  { id: "mp5", name: "MP5 SMG", damage: 18, fireRate: 0.08, range: 25, price: 400, owned: false, equipped: false, spread: 0.06, ammo: 30, maxAmmo: 30, reloadTime: 1.5, auto: true, desc: "High rate of fire", color: "#88aaff", isMelee: false, xp: 0, level: 1, mastered: false, weaponType: "smg" },
  { id: "vector", name: "KRISS VECTOR", damage: 22, fireRate: 0.05, range: 28, price: 650, owned: false, equipped: false, spread: 0.04, ammo: 25, maxAmmo: 25, reloadTime: 1.3, auto: true, desc: "Rapid fire SMG", color: "#66ccff", isMelee: false, xp: 0, level: 1, mastered: false, weaponType: "smg" },
  { id: "m870", name: "M870 SHOTGUN", damage: 12, fireRate: 0.45, range: 15, price: 550, owned: false, equipped: false, spread: 0.15, ammo: 6, maxAmmo: 6, reloadTime: 2.0, auto: false, desc: "Devastating close range", color: "#ff8844", isMelee: false, xp: 0, level: 1, mastered: false, weaponType: "shotgun" },
  { id: "spas12", name: "SPAS-12", damage: 14, fireRate: 0.5, range: 18, price: 750, owned: false, equipped: false, spread: 0.12, ammo: 8, maxAmmo: 8, reloadTime: 2.2, auto: true, desc: "Combat shotgun", color: "#ff6633", isMelee: false, xp: 0, level: 1, mastered: false, weaponType: "shotgun" },
  { id: "m4a1", name: "M4A1 CARBINE", damage: 35, fireRate: 0.14, range: 45, price: 700, owned: false, equipped: false, spread: 0.03, ammo: 30, maxAmmo: 30, reloadTime: 1.8, auto: true, desc: "Versatile combat rifle", color: "#44ff88", isMelee: false, xp: 0, level: 1, mastered: false, weaponType: "rifle" },
  { id: "ak47", name: "AK-47", damage: 40, fireRate: 0.12, range: 42, price: 1000, owned: false, equipped: false, spread: 0.05, ammo: 30, maxAmmo: 30, reloadTime: 1.6, auto: true, desc: "Iconic assault rifle", color: "#aa8844", isMelee: false, xp: 0, level: 1, mastered: false, weaponType: "rifle" },
  { id: "m24", name: "M24 SNIPER", damage: 180, fireRate: 0.9, range: 80, price: 0, owned: false, equipped: false, spread: 0.005, ammo: 5, maxAmmo: 5, reloadTime: 2.5, auto: false, desc: "Long range precision", color: "#ff44ff", isMelee: false, xp: 0, level: 1, mastered: false, weaponType: "rifle" },
  { id: "rpg7", name: "RPG-7", damage: 200, fireRate: 1.5, range: 40, price: 1300, owned: false, equipped: false, spread: 0.1, ammo: 1, maxAmmo: 1, reloadTime: 3.0, auto: false, desc: "Explosive devastation", color: "#ff4444", isMelee: false, xp: 0, level: 1, mastered: false, weaponType: "heavy" },
  { id: "m134", name: "M134 MINIGUN", damage: 10, fireRate: 0.04, range: 22, price: 1100, owned: false, equipped: false, spread: 0.1, ammo: 100, maxAmmo: 100, reloadTime: 3.5, auto: true, desc: "Unleash a storm of lead", color: "#ff8800", isMelee: false, xp: 0, level: 1, mastered: false, weaponType: "heavy" },
  { id: "railgun", name: "RAILGUN", damage: 250, fireRate: 1.2, range: 100, price: 2200, owned: false, equipped: false, spread: 0.001, ammo: 3, maxAmmo: 3, reloadTime: 3.5, auto: false, desc: "Penetrating power", color: "#00ffff", isMelee: false, xp: 0, level: 1, mastered: false, weaponType: "heavy" },
  { id: "phaser", name: "PHASER RIFLE", damage: 45, fireRate: 0.1, range: 55, price: 850, owned: false, equipped: false, spread: 0.01, ammo: 20, maxAmmo: 20, reloadTime: 1.6, auto: true, desc: "Precise energy weapon", color: "#44ffff", isMelee: false, xp: 0, level: 1, mastered: false, weaponType: "energy" },
  { id: "laser", name: "LASER CANNON", damage: 60, fireRate: 0.15, range: 60, price: 1200, owned: false, equipped: false, spread: 0.005, ammo: 15, maxAmmo: 15, reloadTime: 2.0, auto: true, desc: "High-power laser", color: "#ff44ff", isMelee: false, xp: 0, level: 1, mastered: false, weaponType: "energy" },
];

/* ============================================================
   TOOLS
   ============================================================ */
const TOOLS = [
  { id: "map_reveal",   name: "MAP REVEAL",   price: 150, desc: "Reveals minimap for 10s", owned: false },
  { id: "health_pack",  name: "HEALTH PACK",  price: 100, desc: "Restore 30 HP", owned: false },
  { id: "sanity_boost", name: "SANITY BOOST", price: 120, desc: "Restore 40 Sanity", owned: false },
  { id: "speed_boost",  name: "SPEED BOOST",  price: 200, desc: "+50% speed for 8s", owned: false },
  { id: "shield",       name: "SHIELD",       price: 250, desc: "Absorb 50 damage", owned: false },
  { id: "xp_boost",     name: "XP BOOST",     price: 300, desc: "Double weapon XP for 10 kills", owned: false },
];

/* ============================================================
   PLAYER STATS & PERKS
   ============================================================ */
const PLAYER_STATS = {
  health:  { level: 0, cost: 2, max: 20, label: "HEALTH",  bonus: 5 },
  damage:  { level: 0, cost: 2, max: 20, label: "DAMAGE",  bonus: 3 },
  defense: { level: 0, cost: 2, max: 20, label: "DEFENSE", bonus: 2 },
  speed:   { level: 0, cost: 2, max: 20, label: "SPEED",   bonus: 0.05 },
  luck:    { level: 0, cost: 3, max: 15, label: "LUCK",    bonus: 0.01 },
  ammo:    { level: 0, cost: 2, max: 15, label: "AMMO",    bonus: 2 },
};

const PERKS = {
  quick_hands: { id: "quick_hands", name: "Quick Hands", desc: "+30% reload speed", cost: 1, tier: 1, icon: "Z" },
  steady_aim:  { id: "steady_aim",  name: "Steady Aim",  desc: "-50% weapon spread", cost: 1, tier: 1, icon: "T" },
  light_foot:  { id: "light_foot",  name: "Light Foot",  desc: "+20% movement speed", cost: 1, tier: 1, icon: "L" },
  berserker:   { id: "berserker",   name: "Berserker",   desc: "+30% damage when below 30% HP", cost: 2, tier: 2, icon: "B" },
  tank:        { id: "tank",        name: "Tank",        desc: "+50% max health, +30% defense", cost: 2, tier: 2, icon: "D" },
  scout:       { id: "scout",       name: "Scout",       desc: "+40% speed, +20% dodge", cost: 2, tier: 2, icon: "S" },
  demo:        { id: "demo",        name: "Demolition",  desc: "+50% explosive damage", cost: 3, tier: 3, icon: "X" },
  sniper:      { id: "sniper",      name: "Sniper",      desc: "+100% headshot damage", cost: 3, tier: 3, icon: "N" },
  assassin:    { id: "assassin",    name: "Assassin",    desc: "+200% melee damage from behind", cost: 3, tier: 3, icon: "A" },
};

/* ============================================================
   GAME STATE
   ============================================================ */
let currentDifficulty = "easy";
let diffConfig = DIFFICULTIES.easy;
let unlockedDifficulties = ["easy"];
let highestLevelCleared = 0;

let currentWeapon = WEAPONS[0];
let money = 0;
let statPoints = 0;
let currentAmmo = 0;
let isReloading = false;
let reloadTimer = 0;
let headshots = 0;
let dodges = 0;
let weaponMastered = 0;
let tools = JSON.parse(JSON.stringify(TOOLS));
let playerStatLevels = { health: 0, damage: 0, defense: 0, speed: 0, luck: 0, ammo: 0 };
let shieldAmount = 0;
let playtime = 0;
let activePerks = [];

let grenadeCooldown = 0;
const GRENADE_MAX_COOLDOWN = 30;
let grenadesThrown = 0;
let hordesSummoned = 0;

let stats = {
  totalScore: 0, highestLevel: 0, totalKills: 0, bossesDefeated: 0,
  totalMoney: 0, gamesPlayed: 0, headshots: 0, dodges: 0, mastered: 0,
  grenadesThrown: 0, hordesSummoned: 0,
};

/* ============================================================
   THREE.JS GLOBALS
   ============================================================ */
let scene, camera, renderer, clock;
let flashlight, flashlightOn = true;
let wallMeshes = [];
let enemies = [];
let obstacles = [];
let bossEnemy = null;
let isBossLevel = false;
let isHellMode = false;
let score = 0, level = 1, health = 100, sanity = 100;
let ammoReady = true, shootCooldown = 0;
let gameActive = false, gamePaused = false;
let yaw = 0, pitch = 0;
let keys = {};
let pointerLocked = false;
let minimapCtx;
let hitFlashTimer = 0;
let alertTimer = 0;
let gunGroup;
let bobTime = 0;
let flareCooldown = 0;
let heartbeatTimer = 0;
let savedLevelLoaded = false;
let playerHeight = 1.7;
let velocityY = 0;
let isGrounded = true;
let jumpCooldownTimer = 0;
let mapRevealTimer = 0;
let speedBoostTimer = 0;
let speedBoostMultiplier = 1;
let totalKillsThisRun = 0;
let levelClearedForStat = false;
const GRAVITY = -18;
const JUMP_SPEED = 7.5;
let meleeCooldown = 0;
let isCrouching = false;
let isInspecting = false;
let cols, rows, grid, wallSegs, exitCell;
const CELL = 6;
let lastPlayerPos = null;
let isMobile = false;
let touchController = null;

let mouseSensitivity = 1.0;
let invertY = false;
let screenShakeEnabled = true;
let currentFov = 72;

const canvas = document.getElementById("gameCanvas");
const damageOverlay = document.getElementById("damageOverlay");

/* ============================================================
   AUDIO SYSTEM
   ============================================================ */
const AudioSys = {
  ctx: null,
  ensure() {
    if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (this.ctx.state === "suspended") this.ctx.resume();
    return this.ctx;
  },
  beep(freq, dur, type, gainVal, sweepTo) {
    try {
      const c = this.ensure();
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.type = type || "square";
      osc.frequency.setValueAtTime(freq, c.currentTime);
      if (sweepTo) osc.frequency.exponentialRampToValueAtTime(sweepTo, c.currentTime + dur);
      gain.gain.setValueAtTime(Math.min(gainVal || 0.12, 0.3), c.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + dur);
      osc.connect(gain);
      gain.connect(c.destination);
      osc.start();
      osc.stop(c.currentTime + dur);
    } catch (e) { /* silent */ }
  },
  shoot() { this.beep(180, 0.08, "square", 0.1, 70); },
  hit() { this.beep(660, 0.07, "square", 0.12, 400); },
  headshot() { this.beep(880, 0.1, "sine", 0.15, 1200); },
  hurt() { this.beep(100, 0.3, "sawtooth", 0.15, 50); },
  clear() {
    this.beep(440, 0.15, "sine", 0.12, 880);
    setTimeout(() => this.beep(660, 0.2, "sine", 0.12, 1200), 150);
  },
  death() { this.beep(250, 0.8, "sawtooth", 0.18, 30); },
  scare() {
    this.beep(800, 0.3, "sawtooth", 0.15, 200);
    setTimeout(() => this.beep(200, 0.4, "sawtooth", 0.1, 50), 200);
  },
  jump() { this.beep(120, 0.05, "sine", 0.04, 200); },
  boss() {
    this.beep(150, 0.5, "sawtooth", 0.2, 60);
    setTimeout(() => this.beep(200, 0.4, "sawtooth", 0.15, 100), 300);
  },
  knife() { this.beep(300, 0.05, "sawtooth", 0.08, 100); },
  heavyKnife() { this.beep(250, 0.1, "sawtooth", 0.12, 80); },
  bossAbility() { this.beep(400, 0.3, "sine", 0.15, 800); },
  dodge() { this.beep(500, 0.05, "sine", 0.08, 1000); },
  levelUp() {
    this.beep(500, 0.1, "sine", 0.12, 800);
    setTimeout(() => this.beep(700, 0.15, "sine", 0.12, 1000), 150);
  },
  money() { this.beep(600, 0.05, "sine", 0.06, 800); },
  grenade() {
    this.beep(300, 0.3, "sawtooth", 0.2, 60);
    setTimeout(() => this.beep(400, 0.5, "sawtooth", 0.15, 80), 300);
  },
  horde() {
    this.beep(100, 0.5, "sawtooth", 0.25, 50);
    setTimeout(() => this.beep(150, 0.4, "sawtooth", 0.2, 70), 400);
  },
};

/* ============================================================
   HELPER FUNCTIONS
   ============================================================ */
function getStatBonus(stat) { return PLAYER_STATS[stat].bonus * playerStatLevels[stat]; }
function getMaxHealth() { return diffConfig.health + getStatBonus("health"); }
function getDamageBonus() { return getStatBonus("damage"); }
function getDefenseBonus() { return getStatBonus("defense"); }
function getSpeedBonus() { return 1 + getStatBonus("speed"); }
function getLuckBonus() { return getStatBonus("luck"); }
function getAmmoBonus() { return getStatBonus("ammo"); }
function getMaxAmmoForWeapon(w) { return w.isMelee ? 0 : w.maxAmmo + Math.floor(getAmmoBonus() / 2); }
function getWeaponXpToLevel(lvl) { return lvl * 50; }
function getMapType(lvl) {
  const keys = Object.keys(MAP_TYPES);
  return MAP_TYPES[keys[lvl % keys.length]];
}

function updateGrenadeDisplay() {
  const cooldownEl = document.getElementById("grenadeCooldown");
  const barEl = document.getElementById("grenadeBar");
  if (!cooldownEl || !barEl) return;
  if (grenadeCooldown > 0) {
    const pct = (grenadeCooldown / GRENADE_MAX_COOLDOWN) * 100;
    cooldownEl.textContent = Math.ceil(grenadeCooldown) + "s";
    cooldownEl.className = "grenade-cooldown";
    barEl.style.width = (100 - pct) + "%";
  } else {
    cooldownEl.textContent = "READY";
    cooldownEl.className = "grenade-cooldown ready";
    barEl.style.width = "100%";
  }
}

function updateAmmoDisplay() {
  const ammoEl = document.getElementById("ammoVal");
  const reloadEl = document.getElementById("reloadIndicator");
  if (!ammoEl || !reloadEl) return;
  if (currentWeapon.isMelee) {
    ammoEl.textContent = "\u2014";
    reloadEl.classList.remove("active");
    return;
  }
  const maxAmmo = getMaxAmmoForWeapon(currentWeapon);
  if (isReloading) {
    ammoEl.textContent = "...";
    reloadEl.textContent = "RELOADING " + Math.max(0, reloadTimer).toFixed(1) + "s";
    reloadEl.classList.add("active");
  } else {
    ammoEl.textContent = Math.floor(currentAmmo) + "/" + maxAmmo;
    reloadEl.classList.remove("active");
    ammoEl.style.color = currentAmmo <= 0 ? "#ff4444" : "#f0b060";
  }
}

function updateWeaponXPDisplay() {
  const w = currentWeapon;
  const barEl = document.getElementById("weaponXpBar");
  const txtEl = document.getElementById("weaponXpText");
  if (!barEl || !txtEl) return;
  if (w.isMelee) {
    barEl.style.width = "0%";
    txtEl.textContent = "\u2014";
    return;
  }
  const needed = getWeaponXpToLevel(w.level);
  const pct = Math.min((w.xp / needed) * 100, 100);
  barEl.style.width = pct + "%";
  txtEl.textContent = Math.floor(w.xp) + "/" + needed;
}

function renderHealthBar() {
  const wrap = document.getElementById("healthBar");
  if (!wrap) return;
  wrap.innerHTML = "";
  const maxHealth = getMaxHealth();
  const segCount = 10;
  const filled = Math.round((health / maxHealth) * segCount);
  for (let i = 0; i < segCount; i++) {
    const seg = document.createElement("div");
    seg.className = "hseg" + (i < filled ? " on" : "");
    if (health < maxHealth * 0.3 && i < filled) seg.classList.add("warn");
    if (health < maxHealth * 0.15 && i < filled) seg.classList.add("critical");
    wrap.appendChild(seg);
  }
  if (hitFlashTimer > 0) {
    wrap.classList.add("shake");
    setTimeout(() => wrap.classList.remove("shake"), 200);
  }
}

function updateEnemyCount() {
  const el = document.getElementById("enemyVal");
  if (el) el.textContent = enemies.length;
}

function updateStatsUI() {
  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  set("statScore", stats.totalScore);
  set("statLevel", stats.highestLevel);
  set("statKills", stats.totalKills);
  set("statBosses", stats.bossesDefeated);
  set("statMoney", stats.totalMoney);
  set("statGames", stats.gamesPlayed);
  set("statWeapon", currentWeapon.name);
  set("statDifficulty", diffConfig.label);
  set("statHeadshots", stats.headshots);
  set("statDodges", stats.dodges);
  set("statMastered", stats.mastered);
  set("statGrenades", stats.grenadesThrown);
  set("statHordes", stats.hordesSummoned);
  set("weaponNameVal", currentWeapon.name);
  set("weaponLevelVal", currentWeapon.level);
  highestLevelCleared = stats.highestLevel;
  checkDifficultyUnlocks();
  const hours = Math.floor(playtime / 3600);
  const minutes = Math.floor((playtime % 3600) / 60);
  set("statPlaytime", hours + "h " + minutes + "m");
}

function addWeaponXP(xp) {
  const w = currentWeapon;
  if (!w || w.isMelee) return;
  w.xp += xp;
  const needed = getWeaponXpToLevel(w.level);
  while (w.xp >= needed && w.level < 10) {
    w.xp -= needed;
    w.level++;
    AudioSys.levelUp();
    showMessage("Weapon " + w.name + " reached level " + w.level + "!");
    if (w.level === 10 && !w.mastered) {
      w.mastered = true;
      weaponMastered++;
      stats.mastered++;
      showMessage("MASTERED: " + w.name);
    }
  }
  const lvlEl = document.getElementById("weaponLevelVal");
  if (lvlEl) lvlEl.textContent = w.level;
  updateWeaponXPDisplay();
  updateStatsUI();
}

function showMessage(text) {
  const obj = document.getElementById("objectiveVal");
  if (!obj) return;
  obj.textContent = text;
  obj.style.color = "#88aaff";
  setTimeout(() => {
    if (isBossLevel || isHellMode) {
      obj.textContent = "DEFEAT THE BOSS(ES)";
      obj.style.color = "#ff4444";
    } else {
      obj.textContent = "LOCATE EXIT PAD";
      obj.style.color = "#6f6";
    }
  }, 2000);
}

function showBossAbility(text) {
  const display = document.getElementById("bossAbilityDisplay");
  if (!display) return;
  display.textContent = text;
  display.style.opacity = 1;
  setTimeout(() => { display.style.opacity = 0; }, 1500);
}

function applyScreenShake(intensity) {
  if (!screenShakeEnabled) return;
  const shake = document.getElementById("screenShake");
  if (!shake) return;
  shake.style.display = "block";
  const maxOffset = intensity * 12;
  const x = (Math.random() - 0.5) * maxOffset * 2;
  const y = (Math.random() - 0.5) * maxOffset * 2;
  canvas.style.transform = "translate(" + x + "px, " + y + "px)";
  setTimeout(() => {
    canvas.style.transform = "";
    shake.style.display = "none";
  }, 100);
}

function addDamageNumber(position, damage, isHeadshot, isBoss) {
  const container = document.getElementById("damageNumbers");
  if (!container || !camera) return;
  const el = document.createElement("div");
  el.className = "damage-number";
  if (isHeadshot) el.classList.add("headshot");
  if (isBoss) el.classList.add("boss");
  el.textContent = "-" + Math.round(damage);
  const vector = position.clone().project(camera);
  const x = (vector.x * 0.5 + 0.5) * window.innerWidth;
  const y = (-vector.y * 0.5 + 0.5) * window.innerHeight;
  el.style.left = x + "px";
  el.style.top = y + "px";
  container.appendChild(el);
  while (container.children.length > 40) container.removeChild(container.firstChild);
  setTimeout(() => { if (el.parentNode) el.remove(); }, 1000);
}

function addMoneyPopup(amount, position) {
  const container = document.getElementById("damageNumbers");
  if (!container || !camera) return;
  const el = document.createElement("div");
  el.className = "money-popup";
  el.textContent = "+" + amount;
  const vector = position.clone().project(camera);
  const x = (vector.x * 0.5 + 0.5) * window.innerWidth + (Math.random() - 0.5) * 40;
  const y = (-vector.y * 0.5 + 0.5) * window.innerHeight;
  el.style.left = x + "px";
  el.style.top = y + "px";
  container.appendChild(el);
  setTimeout(() => { if (el.parentNode) el.remove(); }, 1200);
}

function flashCrosshair(isHeadshot) {
  const c = document.getElementById("crosshair");
  if (!c) return;
  c.classList.remove("hit", "headshot");
  c.classList.add("hit-marker");
  if (isHeadshot) {
    c.classList.add("headshot");
    setTimeout(() => c.classList.remove("headshot"), 200);
  } else {
    c.classList.add("hit");
    setTimeout(() => c.classList.remove("hit"), 120);
  }
  setTimeout(() => c.classList.remove("hit-marker"), 150);
}

function addKillFeed(monsterType, isHeadshot, isBoss) {
  const feed = document.getElementById("killFeed");
  if (!feed) return;
  const entry = document.createElement("div");
  entry.className = "kill-entry";
  const bossText = isBoss ? " BOSS!" : "";
  const headshotText = isHeadshot ? " HEADSHOT!" : "";
  entry.textContent = monsterType + " eliminated" + bossText + headshotText;
  entry.style.color = isBoss ? "#ff8800" : isHeadshot ? "#ff8800" : "#ff4444";
  feed.appendChild(entry);
  setTimeout(() => { if (entry.parentNode) entry.remove(); }, 2500);
  if (feed.children.length > 5) feed.removeChild(feed.firstChild);
}

function startReload() {
  if (isReloading || currentWeapon.isMelee) return;
  const maxAmmo = getMaxAmmoForWeapon(currentWeapon);
  if (currentAmmo >= maxAmmo) return;
  isReloading = true;
  reloadTimer = currentWeapon.reloadTime || 1.5;
  if (activePerks.includes("quick_hands")) reloadTimer *= 0.7;
  updateAmmoDisplay();
}

function updateReload(dt) {
  if (!isReloading) return;
  reloadTimer -= dt;
  if (reloadTimer <= 0) {
    isReloading = false;
    currentAmmo = getMaxAmmoForWeapon(currentWeapon);
    ammoReady = true;
    updateAmmoDisplay();
  } else {
    updateAmmoDisplay();
  }
}

function toggleFlashlight() {
  if (!gameActive || gamePaused) return;
  flashlightOn = !flashlightOn;
  if (flashlight) flashlight.intensity = flashlightOn ? 2.5 : 0;
  showMessage(flashlightOn ? "FLASHLIGHT: ON" : "FLASHLIGHT: OFF");
}

function tryFlare() {
  if (!gameActive || gamePaused || flareCooldown > 0) return;
  flareCooldown = 1.8;
  AudioSys.scare();
  document.body.style.backgroundColor = "#fff";
  setTimeout(() => (document.body.style.backgroundColor = ""), 120);
  enemies.forEach((en) => {
    const d = en.position.distanceTo(camera.position);
    if (d < 10) {
      en.userData.scareTimer = 0.8;
      en.userData.path = null;
      const dir = new THREE.Vector3().subVectors(en.position, camera.position).normalize();
      en.position.add(dir.multiplyScalar(1.5));
    }
  });
}

function toggleCrouch() {
  if (!gameActive || gamePaused) return;
  isCrouching = !isCrouching;
  playerHeight = isCrouching ? 1.0 : 1.7;
}

function toggleWeaponInspect() {
  if (!gameActive || gamePaused || isInspecting || !gunGroup) return;
  isInspecting = true;
  const originalRotation = gunGroup.rotation.x || 0;
  const targetRotation = Math.PI / 3;
  const steps = 30;
  let step = 0;
  const inspectInterval = setInterval(() => {
    step++;
    const progress = step / steps;
    const eased = 1 - Math.pow(1 - progress, 3);
    if (gunGroup) gunGroup.rotation.x = originalRotation + (targetRotation - originalRotation) * eased;
    if (step >= steps) {
      clearInterval(inspectInterval);
      setTimeout(() => {
        const returnInterval = setInterval(() => {
          step--;
          const progress2 = step / steps;
          const eased2 = 1 - Math.pow(1 - progress2, 3);
          if (gunGroup) gunGroup.rotation.x = originalRotation + (targetRotation - originalRotation) * eased2;
          if (step <= 0) {
            clearInterval(returnInterval);
            if (gunGroup) gunGroup.rotation.x = originalRotation;
            isInspecting = false;
          }
        }, 16);
      }, 200);
    }
  }, 16);
}

function tryJump() {
  if (!isGrounded || jumpCooldownTimer > 0) return;
  velocityY = JUMP_SPEED;
  isGrounded = false;
  jumpCooldownTimer = 0.3;
  AudioSys.jump();
}

function togglePause() {
  if (!gameActive) return;
  gamePaused = !gamePaused;
  const pauseMenu = document.getElementById("pauseMenu");
  if (pauseMenu) pauseMenu.style.display = gamePaused ? "flex" : "none";
  if (gamePaused) document.exitPointerLock();
  else if (!isMobile) canvas.requestPointerLock();
}

function generateLoot(enemyType) {
  const loot = { money: 0, items: [] };
  if (Math.random() < 0.3) {
    loot.money = Math.floor(5 + Math.random() * 25);
    if (Math.random() < 0.2) {
      const available = tools.filter((t) => !t.owned);
      if (available.length > 0) {
        loot.items.push(available[Math.floor(Math.random() * available.length)].id);
      }
    }
  }
  return loot;
}

function applyPerk(perkId) {
  const perk = PERKS[perkId];
  if (!perk || activePerks.includes(perkId) || statPoints < perk.cost) return false;
  statPoints -= perk.cost;
  activePerks.push(perkId);
  updateStatsUI();
  showMessage("Perk equipped: " + perk.name);
  return true;
}

/* ============================================================
   GRENADE & HORDE SYSTEM
   ============================================================ */
function throwGrenade() {
  if (!gameActive || gamePaused) return;
  if (grenadeCooldown > 0) {
    showMessage("Grenade on cooldown: " + Math.ceil(grenadeCooldown) + "s");
    return;
  }
  grenadeCooldown = GRENADE_MAX_COOLDOWN;
  grenadesThrown++;
  stats.grenadesThrown++;
  updateGrenadeDisplay();
  updateStatsUI();

  AudioSys.grenade();
  applyScreenShake(0.6);
  showMessage("GRENADE THROWN");

  if (particleSystem) {
    const pos = camera.position.clone().add(new THREE.Vector3(0, 1, -5));
    particleSystem.emit(pos, 0xff6633, 50, 8, 0.8, 0.3, 2);
    particleSystem.emit(pos, 0xff4400, 30, 5, 0.6, 0.2, 1.5);
    particleSystem.emit(pos, 0xff8800, 20, 10, 0.4, 0.15, 1);
  }

  const explosionRadius = 4;
  const origin = camera.position.clone();
  let enemiesHit = 0;

  enemies.forEach((enemy) => {
    const dist = enemy.position.distanceTo(origin);
    if (dist < explosionRadius) {
      const damage = 150 * (1 - dist / explosionRadius);
      const actualDamage = Math.max(10, damage);
      enemy.userData.hp -= actualDamage;
      enemiesHit++;
      addDamageNumber(enemy.position, actualDamage, false, enemy.userData.isBoss);
      const dir = new THREE.Vector3().subVectors(enemy.position, origin).normalize();
      enemy.position.add(dir.multiplyScalar(2));
      if (enemy.userData.hp <= 0) killEnemy(enemy, false);
    }
  });

  if (Math.random() < 0.5) spawnHorde();

  if (enemiesHit > 0) showMessage(enemiesHit + " enemies hit by grenade");
}

function spawnHorde() {
  hordesSummoned++;
  stats.hordesSummoned++;
  updateStatsUI();

  const hordeSize = Math.floor(10 + Math.random() * 40);
  showMessage("HORDE APPROACHING: " + hordeSize + " enemies");
  AudioSys.horde();

  const alert = document.getElementById("hordeAlert");
  if (alert) {
    alert.textContent = "HORDE APPROACHING: " + hordeSize + " ENEMIES";
    alert.style.display = "block";
    alert.classList.add("show");
    applyScreenShake(0.8);
    setTimeout(() => {
      alert.classList.remove("show");
      alert.style.display = "none";
    }, 3000);
  }

  const spawnRadius = 8 + Math.random() * 4;
  const angleStep = (Math.PI * 2) / hordeSize;

  for (let i = 0; i < hordeSize; i++) {
    const angle = angleStep * i + (Math.random() - 0.5) * 0.5;
    const radius = spawnRadius + (Math.random() - 0.5) * 2;
    const spawnX = camera.position.x + Math.cos(angle) * radius;
    const spawnZ = camera.position.z + Math.sin(angle) * radius;
    if (spawnX < 1 || spawnX > cols * CELL - 1 || spawnZ < 1 || spawnZ > rows * CELL - 1) continue;

    const types = ["grunt", "fast", "tank", "brute", "spitter"];
    const typeId = types[Math.floor(Math.random() * types.length)];
    const typeDef = enemyTypes.find((t) => t.id === typeId) || enemyTypes[0];
    const maxHp = Math.round(getEnemyHealthScaling(level) * typeDef.hpMult * 1.2);

    const enemy = createMapMonster(typeId, typeDef.size, typeDef.height, "dark");
    enemy.position.set(spawnX, 0, spawnZ);
    enemy.userData.isEnemy = true;
    enemy.userData.isBoss = false;
    enemy.userData.type = typeDef.id;
    enemy.userData.cell = { i: Math.floor(spawnX / CELL), j: Math.floor(spawnZ / CELL) };
    enemy.userData.path = null;
    enemy.userData.repathTimer = 0.2 + Math.random() * 0.3;
    enemy.userData.speed = diffConfig.enemySpeed * typeDef.speedMult * (0.8 + Math.random() * 0.4);
    enemy.userData.maxHp = maxHp;
    enemy.userData.hp = maxHp;
    enemy.userData.scareTimer = 0;
    enemy.userData.height = typeDef.height;
    enemy.userData.attackRange = typeDef.attackRange;
    enemy.userData.attackCooldown = typeDef.attackCooldown;
    enemy.userData.attackTimer = Math.random() * typeDef.attackCooldown;
    enemy.userData.damageMult = typeDef.damageMult;
    enemy.userData.collisionRadius = 0.5;
    enemy.castShadow = true;
    enemy.receiveShadow = true;
    scene.add(enemy);
    enemies.push(enemy);
  }

  const feed = document.getElementById("killFeed");
  if (feed) {
    const entry = document.createElement("div");
    entry.className = "kill-entry";
    entry.textContent = "HORDE SPAWNED: " + hordeSize + " ENEMIES";
    entry.style.color = "#ff8800";
    entry.style.fontWeight = "bold";
    feed.appendChild(entry);
    setTimeout(() => { if (entry.parentNode) entry.remove(); }, 3000);
  }
}

/* ============================================================
   WEAPON MESHES
   ============================================================ */
function createPolygonWeapon(weaponType) {
  const group = new THREE.Group();

  switch (weaponType) {
    case "knife": {
      const bladeMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.8, roughness: 0.2 });
      const handleMat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.9 });
      const blade = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.3, 0.04), bladeMat);
      blade.position.set(0.2, -0.08, -0.65);
      blade.scale.x = 0.5;
      group.add(blade);
      const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.04, 0.12, 6), handleMat);
      handle.position.set(0.2, -0.22, -0.65);
      handle.rotation.x = Math.PI / 2;
      group.add(handle);
      const guard = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.015, 0.04), new THREE.MeshStandardMaterial({ color: 0x444444, metalness: 0.5 }));
      guard.position.set(0.2, -0.15, -0.65);
      group.add(guard);
      break;
    }
    case "machete": {
      const macheteMat = new THREE.MeshStandardMaterial({ color: 0xaaaaaa, metalness: 0.7, roughness: 0.3 });
      const macheteHandle = new THREE.MeshStandardMaterial({ color: 0x3a2a1a, roughness: 0.9 });
      const macheteBlade = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.4, 0.05), macheteMat);
      macheteBlade.position.set(0.2, -0.05, -0.75);
      macheteBlade.scale.x = 0.3;
      group.add(macheteBlade);
      const h = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.045, 0.15, 6), macheteHandle);
      h.position.set(0.2, -0.25, -0.75);
      h.rotation.x = Math.PI / 2;
      group.add(h);
      break;
    }
    case "pistol": {
      const pistolMat = new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.6, roughness: 0.4 });
      const pistolGrip = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.8 });
      const body = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.35), pistolMat);
      body.position.set(0.2, -0.18, -0.55);
      group.add(body);
      const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.02, 0.25, 8), pistolMat);
      barrel.position.set(0.2, -0.15, -0.85);
      barrel.rotation.x = Math.PI / 2;
      group.add(barrel);
      const grip = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.12, 0.05), pistolGrip);
      grip.position.set(0.18, -0.34, -0.5);
      group.add(grip);
      const sight = new THREE.Mesh(new THREE.BoxGeometry(0.01, 0.015, 0.015), pistolMat);
      sight.position.set(0.2, -0.1, -0.7);
      group.add(sight);
      break;
    }
    case "smg": {
      const smgMat = new THREE.MeshStandardMaterial({ color: 0x2a2a2a, metalness: 0.5, roughness: 0.5 });
      const smgStock = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.8 });
      const body = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.09, 0.5), smgMat);
      body.position.set(0.2, -0.18, -0.55);
      group.add(body);
      const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.015, 0.3, 8), smgMat);
      barrel.position.set(0.2, -0.15, -0.95);
      barrel.rotation.x = Math.PI / 2;
      group.add(barrel);
      const mag = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.1, 0.03), smgMat);
      mag.position.set(0.18, -0.32, -0.6);
      group.add(mag);
      const stock = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.04, 0.08), smgStock);
      stock.position.set(0.2, -0.14, -0.3);
      group.add(stock);
      const sight = new THREE.Mesh(new THREE.BoxGeometry(0.01, 0.02, 0.02), smgMat);
      sight.position.set(0.2, -0.09, -0.75);
      group.add(sight);
      break;
    }
    case "shotgun": {
      const shotMat = new THREE.MeshStandardMaterial({ color: 0x3a3a3a, metalness: 0.6, roughness: 0.4 });
      const body = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.1, 0.4), shotMat);
      body.position.set(0.2, -0.18, -0.55);
      group.add(body);
      const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.03, 0.4, 8), shotMat);
      barrel.position.set(0.2, -0.14, -0.95);
      barrel.rotation.x = Math.PI / 2;
      group.add(barrel);
      const grip = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.14, 0.05), new THREE.MeshStandardMaterial({ color: 0x2a1a0a, roughness: 0.9 }));
      grip.position.set(0.18, -0.35, -0.5);
      group.add(grip);
      const stock = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.03, 0.1), new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.8 }));
      stock.position.set(0.2, -0.15, -0.3);
      group.add(stock);
      break;
    }
    case "rifle": {
      const rifleMat = new THREE.MeshStandardMaterial({ color: 0x2a2a2a, metalness: 0.5, roughness: 0.5 });
      const body = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.08, 0.6), rifleMat);
      body.position.set(0.2, -0.18, -0.55);
      group.add(body);
      const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.02, 0.4, 8), rifleMat);
      barrel.position.set(0.2, -0.15, -1.0);
      barrel.rotation.x = Math.PI / 2;
      group.add(barrel);
      const grip = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.12, 0.05), new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.8 }));
      grip.position.set(0.18, -0.34, -0.5);
      group.add(grip);
      const stock = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.04, 0.12), new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.8 }));
      stock.position.set(0.2, -0.14, -0.25);
      group.add(stock);
      const scope = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.03, 0.08, 8), new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.7 }));
      scope.position.set(0.2, -0.05, -0.7);
      scope.rotation.x = Math.PI / 2;
      group.add(scope);
      break;
    }
    case "heavy": {
      const heavyMat = new THREE.MeshStandardMaterial({ color: 0x444444, metalness: 0.7, roughness: 0.3 });
      const body = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.12, 0.5), heavyMat);
      body.position.set(0.2, -0.18, -0.55);
      group.add(body);
      const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.03, 0.35, 8), heavyMat);
      barrel.position.set(0.2, -0.14, -0.95);
      barrel.rotation.x = Math.PI / 2;
      group.add(barrel);
      const grip = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.14, 0.06), new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.9 }));
      grip.position.set(0.18, -0.36, -0.5);
      group.add(grip);
      const stock = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.04, 0.1), new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.8 }));
      stock.position.set(0.2, -0.16, -0.25);
      group.add(stock);
      break;
    }
    case "energy": {
      const energyMat = new THREE.MeshStandardMaterial({ color: 0x44ffff, emissive: 0x44ffff, emissiveIntensity: 0.3, transparent: true, opacity: 0.8 });
      const body = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.08, 0.4), energyMat);
      body.position.set(0.2, -0.18, -0.55);
      group.add(body);
      const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.015, 0.3, 8), energyMat);
      barrel.position.set(0.2, -0.15, -0.9);
      barrel.rotation.x = Math.PI / 2;
      group.add(barrel);
      const core = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 8), new THREE.MeshStandardMaterial({ color: 0x00ffff, emissive: 0x00ffff, emissiveIntensity: 0.8, transparent: true, opacity: 0.6 }));
      core.position.set(0.2, -0.14, -0.55);
      group.add(core);
      break;
    }
    default: {
      const defMat = new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.6 });
      const body = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.4), defMat);
      body.position.set(0.2, -0.18, -0.55);
      group.add(body);
      const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.02, 0.3, 8), defMat);
      barrel.position.set(0.2, -0.15, -0.9);
      barrel.rotation.x = Math.PI / 2;
      group.add(barrel);
    }
  }

  return group;
}

/* ============================================================
   MONSTER MESHES
   ============================================================ */
function createMapMonster(type, size, height, mapTheme) {
  const group = new THREE.Group();

  let color, emissive;
  switch (mapTheme) {
    case "industrial": color = 0x663333; emissive = 0xff4422; break;
    case "dark":       color = 0x334466; emissive = 0x6644ff; break;
    case "mechanical": color = 0x666633; emissive = 0x88ff44; break;
    case "scientific": color = 0x336666; emissive = 0x44ff88; break;
    case "toxic":      color = 0x336633; emissive = 0x44ff44; break;
    case "ancient":    color = 0x664433; emissive = 0xff8844; break;
    default:           color = 0x663333; emissive = 0xff4422;
  }

  const mat = new THREE.MeshStandardMaterial({
    color, emissive, emissiveIntensity: 0.3,
    roughness: 0.5, metalness: 0.3, flatShading: true,
  });

  if (type === "grunt") {
    const body = new THREE.Mesh(new THREE.CylinderGeometry(size * 0.4, size * 0.5, height * 0.5, 7), mat);
    body.position.y = height * 0.35;
    group.add(body);
    const head = new THREE.Mesh(new THREE.SphereGeometry(size * 0.3, 6, 6), mat);
    head.position.y = height * 0.85;
    head.scale.y = 0.8;
    group.add(head);
    const armGeo = new THREE.CylinderGeometry(size * 0.06, size * 0.08, height * 0.35, 6);
    const aL = new THREE.Mesh(armGeo, mat); aL.position.set(-size * 0.45, height * 0.35, 0); aL.rotation.z = 0.2; group.add(aL);
    const aR = new THREE.Mesh(armGeo, mat); aR.position.set(size * 0.45, height * 0.35, 0); aR.rotation.z = -0.2; group.add(aR);
    const legGeo = new THREE.CylinderGeometry(size * 0.06, size * 0.05, height * 0.3, 6);
    const lL = new THREE.Mesh(legGeo, mat); lL.position.set(-size * 0.2, height * 0.15, 0); group.add(lL);
    const lR = new THREE.Mesh(legGeo, mat); lR.position.set(size * 0.2, height * 0.15, 0); group.add(lR);
  } else if (type === "fast") {
    const sm = mat.clone(); sm.color.setHex(0x224488); sm.emissive.setHex(0x4488ff);
    const body = new THREE.Mesh(new THREE.CylinderGeometry(size * 0.25, size * 0.35, height * 0.5, 6), sm);
    body.position.y = height * 0.4;
    group.add(body);
    const head = new THREE.Mesh(new THREE.ConeGeometry(size * 0.25, height * 0.3, 6), sm);
    head.position.y = height * 0.85;
    group.add(head);
    const armGeo = new THREE.CylinderGeometry(size * 0.04, size * 0.05, height * 0.45, 6);
    const aL = new THREE.Mesh(armGeo, sm); aL.position.set(-size * 0.35, height * 0.4, 0); aL.rotation.z = 0.3; group.add(aL);
    const aR = new THREE.Mesh(armGeo, sm); aR.position.set(size * 0.35, height * 0.4, 0); aR.rotation.z = -0.3; group.add(aR);
  } else if (type === "tank") {
    const tm = mat.clone(); tm.color.setHex(0x333311); tm.emissive.setHex(0x88aa44);
    const body = new THREE.Mesh(new THREE.CylinderGeometry(size * 0.5, size * 0.6, height * 0.5, 8), tm);
    body.position.y = height * 0.4;
    group.add(body);
    const head = new THREE.Mesh(new THREE.BoxGeometry(size * 0.45, height * 0.25, size * 0.45), tm);
    head.position.y = height * 0.8;
    group.add(head);
    const armGeo = new THREE.CylinderGeometry(size * 0.1, size * 0.13, height * 0.3, 6);
    const aL = new THREE.Mesh(armGeo, tm); aL.position.set(-size * 0.55, height * 0.35, 0); group.add(aL);
    const aR = new THREE.Mesh(armGeo, tm); aR.position.set(size * 0.55, height * 0.35, 0); group.add(aR);
  } else if (type === "brute") {
    const bm = mat.clone(); bm.color.setHex(0x441111); bm.emissive.setHex(0xcc4444);
    const body = new THREE.Mesh(new THREE.CylinderGeometry(size * 0.45, size * 0.55, height * 0.5, 7), bm);
    body.position.y = height * 0.4;
    group.add(body);
    const head = new THREE.Mesh(new THREE.ConeGeometry(size * 0.35, height * 0.35, 5), bm);
    head.position.y = height * 0.85;
    group.add(head);
    const armGeo = new THREE.CylinderGeometry(size * 0.08, size * 0.12, height * 0.4, 6);
    const aL = new THREE.Mesh(armGeo, bm); aL.position.set(-size * 0.5, height * 0.35, 0); aL.rotation.z = 0.15; group.add(aL);
    const aR = new THREE.Mesh(armGeo, bm); aR.position.set(size * 0.5, height * 0.35, 0); aR.rotation.z = -0.15; group.add(aR);
  } else if (type === "spitter") {
    const sm = mat.clone(); sm.color.setHex(0x113311); sm.emissive.setHex(0x44ff44);
    const body = new THREE.Mesh(new THREE.CylinderGeometry(size * 0.35, size * 0.5, height * 0.4, 6), sm);
    body.position.y = height * 0.3;
    group.add(body);
    const head = new THREE.Mesh(new THREE.SphereGeometry(size * 0.35, 6, 6), sm);
    head.position.y = height * 0.7;
    head.scale.set(1, 0.8, 1.2);
    group.add(head);
    const tGeo = new THREE.CylinderGeometry(size * 0.03, size * 0.05, height * 0.4, 5);
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2;
      const t = new THREE.Mesh(tGeo, sm);
      t.position.set(Math.cos(angle) * size * 0.3, height * 0.3, Math.sin(angle) * size * 0.3);
      t.rotation.z = Math.cos(angle) * 0.3;
      t.rotation.x = Math.sin(angle) * 0.3;
      group.add(t);
    }
  }

  const eyeMat = new THREE.MeshStandardMaterial({ color: 0xff0000, emissive: 0xff0000, emissiveIntensity: 0.8 });
  const eyeGeo = new THREE.SphereGeometry(size * 0.06, 6, 6);
  const eL = new THREE.Mesh(eyeGeo, eyeMat); eL.position.set(-size * 0.12, height * 0.8, size * 0.2); group.add(eL);
  const eR = new THREE.Mesh(eyeGeo, eyeMat); eR.position.set(size * 0.12, height * 0.8, size * 0.2); group.add(eR);

  return group;
}

function createMapBoss(mapTheme) {
  const group = new THREE.Group();
  const size = 1.5, height = 3.0;
  let color, emissive, accent;
  switch (mapTheme) {
    case "industrial": color = 0x663322; emissive = 0xff4422; accent = 0x884433; break;
    case "dark":       color = 0x334466; emissive = 0x6644ff; accent = 0x445588; break;
    case "mechanical": color = 0x666633; emissive = 0x88ff44; accent = 0x888844; break;
    case "scientific": color = 0x336666; emissive = 0x44ff88; accent = 0x448888; break;
    case "toxic":      color = 0x336633; emissive = 0x44ff44; accent = 0x448844; break;
    case "ancient":    color = 0x664433; emissive = 0xff8844; accent = 0x886644; break;
    default:           color = 0x663322; emissive = 0xff4422; accent = 0x884433;
  }
  const bodyMat = new THREE.MeshStandardMaterial({ color, emissive, emissiveIntensity: 0.3, roughness: 0.3, metalness: 0.6, flatShading: true });
  const accentMat = new THREE.MeshStandardMaterial({ color: accent, emissive, emissiveIntensity: 0.2, roughness: 0.4, metalness: 0.5, flatShading: true });

  const torso = new THREE.Mesh(new THREE.CylinderGeometry(size * 0.5, size * 0.6, height * 0.4, 8), bodyMat);
  torso.position.y = height * 0.4;
  group.add(torso);

  const chest = new THREE.Mesh(new THREE.BoxGeometry(size * 0.5, height * 0.15, size * 0.3), accentMat);
  chest.position.y = height * 0.55;
  group.add(chest);

  const head = new THREE.Mesh(new THREE.ConeGeometry(size * 0.3, height * 0.3, 6), bodyMat);
  head.position.y = height * 0.85;
  group.add(head);

  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2;
    const horn = new THREE.Mesh(new THREE.ConeGeometry(size * 0.04, height * 0.15, 4), accentMat);
    horn.position.set(Math.cos(angle) * size * 0.25, height * 0.95, Math.sin(angle) * size * 0.25);
    horn.rotation.x = Math.cos(angle) * 0.5;
    horn.rotation.z = Math.sin(angle) * 0.5;
    group.add(horn);
  }

  const armGeo = new THREE.CylinderGeometry(size * 0.1, size * 0.15, height * 0.5, 6);
  const aL = new THREE.Mesh(armGeo, bodyMat); aL.position.set(-size * 0.6, height * 0.4, 0); aL.rotation.z = 0.3; group.add(aL);
  const aR = new THREE.Mesh(armGeo, bodyMat); aR.position.set(size * 0.6, height * 0.4, 0); aR.rotation.z = -0.3; group.add(aR);

  const clawGeo = new THREE.ConeGeometry(size * 0.08, height * 0.1, 4);
  const cL = new THREE.Mesh(clawGeo, accentMat); cL.position.set(-size * 0.7, height * 0.2, 0); group.add(cL);
  const cR = new THREE.Mesh(clawGeo, accentMat); cR.position.set(size * 0.7, height * 0.2, 0); group.add(cR);

  const legGeo = new THREE.CylinderGeometry(size * 0.12, size * 0.1, height * 0.3, 6);
  const lL = new THREE.Mesh(legGeo, bodyMat); lL.position.set(-size * 0.3, height * 0.15, 0); group.add(lL);
  const lR = new THREE.Mesh(legGeo, bodyMat); lR.position.set(size * 0.3, height * 0.15, 0); group.add(lR);

  const core = new THREE.Mesh(new THREE.SphereGeometry(size * 0.12, 6, 6), new THREE.MeshStandardMaterial({ color: emissive, emissive, emissiveIntensity: 0.8, transparent: true, opacity: 0.6 }));
  core.position.set(0, height * 0.4, size * 0.2);
  group.add(core);

  const eyeMat = new THREE.MeshStandardMaterial({ color: 0xff0000, emissive: 0xff0000, emissiveIntensity: 1.0 });
  const eyeGeo = new THREE.SphereGeometry(size * 0.06, 6, 6);
  const eL = new THREE.Mesh(eyeGeo, eyeMat); eL.position.set(-size * 0.12, height * 0.85, size * 0.2); group.add(eL);
  const eR = new THREE.Mesh(eyeGeo, eyeMat); eR.position.set(size * 0.12, height * 0.85, size * 0.2); group.add(eR);

  return group;
}

/* ============================================================
   MAZE GENERATION
   ============================================================ */
function generateMaze(cols, rows) {
  const grid = [];
  for (let i = 0; i < cols; i++) {
    grid.push([]);
    for (let j = 0; j < rows; j++) {
      grid[i].push({ top: true, right: true, bottom: true, left: true, visited: false });
    }
  }
  const stack = [];
  let current = { i: 0, j: 0 };
  grid[0][0].visited = true;
  stack.push(current);
  const opposite = { top: "bottom", bottom: "top", left: "right", right: "left" };

  function neighbors(cell) {
    const { i, j } = cell;
    const list = [];
    if (j > 0 && !grid[i][j - 1].visited) list.push({ i, j: j - 1, dir: "top" });
    if (i < cols - 1 && !grid[i + 1][j].visited) list.push({ i: i + 1, j, dir: "right" });
    if (j < rows - 1 && !grid[i][j + 1].visited) list.push({ i, j: j + 1, dir: "bottom" });
    if (i > 0 && !grid[i - 1][j].visited) list.push({ i: i - 1, j, dir: "left" });
    return list;
  }

  while (stack.length) {
    current = stack[stack.length - 1];
    const options = neighbors(current);
    if (options.length === 0) { stack.pop(); continue; }
    const pick = options[Math.floor(Math.random() * options.length)];
    grid[current.i][current.j][pick.dir] = false;
    grid[pick.i][pick.j][opposite[pick.dir]] = false;
    grid[pick.i][pick.j].visited = true;
    stack.push({ i: pick.i, j: pick.j });
  }
  return grid;
}

function buildWallSegments(grid, cols, rows, cellSize) {
  const segs = [];
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      const cell = grid[i][j];
      const x0 = i * cellSize, z0 = j * cellSize, x1 = x0 + cellSize, z1 = z0 + cellSize;
      if (j === 0 && cell.top) segs.push({ x1: x0, z1: z0, x2: x1, z2: z0 });
      if (cell.bottom) segs.push({ x1: x0, z1: z1, x2: x1, z2: z1 });
      if (i === 0 && cell.left) segs.push({ x1: x0, z1: z0, x2: x0, z2: z1 });
      if (cell.right) segs.push({ x1: x1, z1: z0, x2: x1, z2: z1 });
    }
  }
  return segs;
}

function bfsPath(grid, cols, rows, start, goal) {
  const key = (i, j) => i + "," + j;
  const visited = new Set([key(start.i, start.j)]);
  const prev = {};
  const queue = [start];
  let found = false;
  while (queue.length) {
    const cur = queue.shift();
    if (cur.i === goal.i && cur.j === goal.j) { found = true; break; }
    const cell = grid[cur.i][cur.j];
    const nbrs = [];
    if (!cell.top && cur.j > 0) nbrs.push({ i: cur.i, j: cur.j - 1 });
    if (!cell.right && cur.i < cols - 1) nbrs.push({ i: cur.i + 1, j: cur.j });
    if (!cell.bottom && cur.j < rows - 1) nbrs.push({ i: cur.i, j: cur.j + 1 });
    if (!cell.left && cur.i > 0) nbrs.push({ i: cur.i - 1, j: cur.j });
    for (const n of nbrs) {
      const k = key(n.i, n.j);
      if (!visited.has(k)) { visited.add(k); prev[k] = cur; queue.push(n); }
    }
  }
  if (!found) return null;
  const path = [];
  let cur = goal;
  while (!(cur.i === start.i && cur.j === start.j)) {
    path.unshift(cur);
    cur = prev[key(cur.i, cur.j)];
    if (!cur) return null;
  }
  return path;
}

/* ============================================================
   COLLISION
   ============================================================ */
function resolveCollision(pos, radius, segments, obstaclesList) {
  const maxIterations = 8;
  for (let iter = 0; iter < maxIterations; iter++) {
    let moved = false;
    for (const s of segments) {
      const dx = s.x2 - s.x1, dz = s.z2 - s.z1;
      const len2 = dx * dx + dz * dz || 1;
      let t = ((pos.x - s.x1) * dx + (pos.z - s.z1) * dz) / len2;
      t = Math.max(0, Math.min(1, t));
      const cx = s.x1 + t * dx, cz = s.z1 + t * dz;
      const distX = pos.x - cx, distZ = pos.z - cz;
      const dist = Math.sqrt(distX * distX + distZ * distZ);
      if (dist < radius && dist > 0.0001) {
        const push = (radius - dist) / dist;
        pos.x += distX * push * 1.05;
        pos.z += distZ * push * 1.05;
        moved = true;
      }
    }
    for (const obs of obstaclesList) {
      const dx = pos.x - obs.position.x;
      const dz = pos.z - obs.position.z;
      const dist = Math.sqrt(dx * dx + dz * dz);
      const obsRadius = obs.userData.collisionRadius || 0.4;
      const combinedRadius = radius + obsRadius;
      if (dist < combinedRadius && dist > 0.0001) {
        const push = (combinedRadius - dist) / dist;
        pos.x += dx * push * 1.05;
        pos.z += dz * push * 1.05;
        moved = true;
      }
    }
    if (!moved) break;
  }
  return pos;
}

/* ============================================================
   ENEMY TYPES
   ============================================================ */
const enemyTypes = [
  { id: "grunt",   name: "Grunt",   size: 0.7, height: 1.8, speedMult: 1.0, hpMult: 1.0, damageMult: 1.0, attackRange: 1.3, attackCooldown: 1.0 },
  { id: "fast",    name: "Runner",  size: 0.6, height: 1.6, speedMult: 1.6, hpMult: 0.7, damageMult: 0.8, attackRange: 1.5, attackCooldown: 0.7 },
  { id: "tank",    name: "Tank",    size: 0.9, height: 2.0, speedMult: 0.7, hpMult: 2.5, damageMult: 1.3, attackRange: 1.5, attackCooldown: 1.5 },
  { id: "brute",   name: "Brute",   size: 1.0, height: 2.2, speedMult: 0.8, hpMult: 3.0, damageMult: 1.5, attackRange: 1.8, attackCooldown: 1.8 },
  { id: "spitter", name: "Spitter", size: 0.6, height: 1.5, speedMult: 1.2, hpMult: 0.8, damageMult: 1.2, attackRange: 3.0, attackCooldown: 0.9 },
];

function getEnemyHealthScaling(sector) {
  const baseHealth = 1 + Math.floor(sector * diffConfig.healthScaling);
  return Math.round(baseHealth * (0.5 + Math.random() * 1.5));
}

function getBossHealth(sector) { return Math.round((50 + sector * 8) * diffConfig.bossHealthMult); }
function getBossDamage() { return diffConfig.damagePerSec * 0.6 * diffConfig.bossDamageMult; }

/* ============================================================
   PROCEDURAL TEXTURES
   ============================================================ */
function createProceduralTexture(width, height, generator) {
  const c = document.createElement("canvas");
  c.width = width;
  c.height = height;
  const ctx = c.getContext("2d");
  generator(ctx, width, height);
  const texture = new THREE.CanvasTexture(c);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.anisotropy = 16;
  return texture;
}

function generateBrickTexture(ctx, w, h) {
  ctx.fillStyle = "#4a4540";
  ctx.fillRect(0, 0, w, h);
  const brickH = 40, brickW = 80;
  for (let row = 0; row < h / brickH + 1; row++) {
    const offset = row % 2 === 0 ? 0 : brickW / 2;
    for (let col = -1; col < w / brickW + 2; col++) {
      const x = col * brickW + offset;
      const y = row * brickH;
      const variation = 20 + Math.random() * 30;
      ctx.fillStyle = "rgb(" + (60 + variation) + "," + (55 + variation) + "," + (50 + variation) + ")";
      ctx.fillRect(x, y, brickW - 2, brickH - 2);
    }
  }
  ctx.strokeStyle = "#3a3530";
  ctx.lineWidth = 1;
  for (let row = 0; row < h / brickH + 1; row++) {
    ctx.beginPath(); ctx.moveTo(0, row * brickH); ctx.lineTo(w, row * brickH); ctx.stroke();
  }
  for (let col = 0; col < w / brickW + 2; col++) {
    ctx.beginPath(); ctx.moveTo(col * brickW, 0); ctx.lineTo(col * brickW, h); ctx.stroke();
  }
}

function generateStoneTexture(ctx, w, h) {
  ctx.fillStyle = "#3a3535";
  ctx.fillRect(0, 0, w, h);
  const ss = 60;
  for (let row = 0; row < h / ss + 1; row++) {
    for (let col = 0; col < w / ss + 1; col++) {
      const x = col * ss + ((row % 2) * ss) / 2;
      const y = row * ss;
      const variation = 10 + Math.random() * 20;
      const base = 50 + variation;
      ctx.fillStyle = "rgb(" + base + "," + (base - 5) + "," + (base - 10) + ")";
      ctx.beginPath();
      const points = 6 + Math.floor(Math.random() * 4);
      for (let i = 0; i < points; i++) {
        const angle = (i / points) * Math.PI * 2;
        const radius = ss * 0.4 + Math.random() * 8;
        const px = x + ss / 2 + Math.cos(angle) * radius;
        const py = y + ss / 2 + Math.sin(angle) * radius;
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
    }
  }
}

function generateMetalTexture(ctx, w, h) {
  ctx.fillStyle = "#4a4a4a";
  ctx.fillRect(0, 0, w, h);
  for (let i = 0; i < 100; i++) {
    const y = Math.random() * h;
    ctx.strokeStyle = "rgba(80,80,80," + (0.02 + Math.random() * 0.06) + ")";
    ctx.lineWidth = 1 + Math.random() * 3;
    ctx.beginPath();
    ctx.moveTo(0, y);
    for (let x = 0; x < w; x += 2) ctx.lineTo(x, y + (Math.random() - 0.5) * 2);
    ctx.stroke();
  }
}

function generateWoodTexture(ctx, w, h) {
  ctx.fillStyle = "#5a4030";
  ctx.fillRect(0, 0, w, h);
  for (let i = 0; i < 20; i++) {
    const y = i * (h / 20) + Math.random() * 5;
    ctx.strokeStyle = "rgba(30,20,10," + (0.05 + Math.random() * 0.1) + ")";
    ctx.lineWidth = 1 + Math.random() * 3;
    ctx.beginPath();
    ctx.moveTo(0, y);
    for (let x = 0; x < w; x += 5) ctx.lineTo(x, y + (Math.random() - 0.5) * 6);
    ctx.stroke();
  }
}

function generateFloorTexture(ctx, w, h) {
  const colors = ["#2a2520", "#25201a", "#302a25"];
  ctx.fillStyle = colors[0];
  ctx.fillRect(0, 0, w, h);
  const ts = 64;
  for (let row = 0; row < h / ts + 1; row++) {
    for (let col = 0; col < w / ts + 1; col++) {
      const x = col * ts, y = row * ts;
      ctx.fillStyle = colors[(row + col) % colors.length];
      ctx.fillRect(x, y, ts - 1, ts - 1);
    }
  }
}

function generateCryptFloor(ctx, w, h) {
  ctx.fillStyle = "#1a1a1a";
  ctx.fillRect(0, 0, w, h);
  const ts = 48;
  for (let row = 0; row < h / ts + 1; row++) {
    for (let col = 0; col < w / ts + 1; col++) {
      const x = col * ts, y = row * ts;
      const variation = 10 + Math.random() * 15;
      const base = 20 + variation;
      ctx.fillStyle = "rgb(" + base + "," + (base - 2) + "," + (base - 4) + ")";
      ctx.fillRect(x, y, ts - 1, ts - 1);
    }
  }
}

function createWallTexture(mapType) {
  const gen = mapType === "CRYPT" ? generateStoneTexture
    : mapType === "FACTORY" ? generateMetalTexture
    : mapType === "TEMPLE" ? generateStoneTexture
    : generateBrickTexture;
  return createProceduralTexture(512, 512, gen);
}

function createFloorTexture(mapType) {
  const gen = mapType === "CRYPT" ? generateCryptFloor : generateFloorTexture;
  return createProceduralTexture(512, 512, gen);
}

/* ============================================================
   PARTICLE SYSTEM
   ============================================================ */
class ParticleSystem {
  constructor() { this.particles = []; this.pool = []; }

  emit(position, color, count, speed, life, size, spread) {
    for (let i = 0; i < count; i++) {
      let p = this.pool.pop();
      if (!p) {
        const geo = new THREE.SphereGeometry(0.05, 4, 4);
        const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 1 });
        p = new THREE.Mesh(geo, mat);
        scene.add(p);
      }
      const angle = Math.random() * Math.PI * 2;
      const speedMult = speed * (0.5 + Math.random() * 0.5);
      p.position.copy(position);
      p.userData = {
        velocity: new THREE.Vector3(
          Math.cos(angle) * speedMult * (spread || 1),
          (Math.random() - 0.5) * speedMult * 0.5,
          Math.sin(angle) * speedMult * (spread || 1)
        ),
        life: life * (0.3 + Math.random() * 0.7),
        maxLife: life,
        size: size * (0.5 + Math.random() * 0.5),
      };
      p.scale.setScalar(p.userData.size);
      p.visible = true;
      this.particles.push(p);
    }
  }

  update(dt) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.userData.life -= dt;
      if (p.userData.life <= 0) {
        p.visible = false;
        this.pool.push(p);
        this.particles.splice(i, 1);
        continue;
      }
      const lifeRatio = p.userData.life / p.userData.maxLife;
      p.position.add(p.userData.velocity.clone().multiplyScalar(dt));
      p.userData.velocity.multiplyScalar(0.98);
      p.material.opacity = lifeRatio;
      p.scale.setScalar(p.userData.size * lifeRatio);
    }
  }
}

let particleSystem;

/* ============================================================
   LEVEL BUILDING
   ============================================================ */
function buildLevel(sector) {
  const base = 8;
  cols = base + Math.min(sector, 6);
  rows = base + Math.min(sector, 6);

  const mapType = getMapType(sector);
  const mapTypeEl = document.getElementById("mapTypeVal");
  if (mapTypeEl) mapTypeEl.textContent = mapType.name;

  isHellMode = diffConfig.hellMode || false;
  isBossLevel = isHellMode ? true : (sector % diffConfig.bossInterval === 0 && sector > 0);

  levelClearedForStat = false;
  grid = generateMaze(cols, rows);
  wallSegs = buildWallSegments(grid, cols, rows, CELL);
  exitCell = { i: cols - 1, j: rows - 1 };

  if (scene) {
    while (scene.children.length > 0) {
      const obj = scene.children[0];
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose());
        else obj.material.dispose();
      }
      scene.remove(obj);
    }
  }

  scene = new THREE.Scene();
  scene.background = new THREE.Color(mapType.fogColor);
  scene.fog = new THREE.FogExp2(mapType.fogColor, mapType.fogDensity);

  camera = new THREE.PerspectiveCamera(currentFov, window.innerWidth / window.innerHeight, 0.1, 180);
  camera.position.set(CELL * 0.5, playerHeight, CELL * 0.5);

  const ambientLight = new THREE.AmbientLight(mapType.ambientColor, 0.3);
  scene.add(ambientLight);

  const dirLight = new THREE.DirectionalLight(mapType.lightColor, 0.35);
  dirLight.position.set(15, 25, 15);
  dirLight.castShadow = true;
  dirLight.shadow.mapSize.width = 2048;
  dirLight.shadow.mapSize.height = 2048;
  dirLight.shadow.camera.near = 0.1;
  dirLight.shadow.camera.far = 50;
  dirLight.shadow.camera.left = -30;
  dirLight.shadow.camera.right = 30;
  dirLight.shadow.camera.top = 30;
  dirLight.shadow.camera.bottom = -30;
  scene.add(dirLight);

  const fillLight = new THREE.DirectionalLight(0x4466ff, 0.05);
  fillLight.position.set(-10, 10, -10);
  scene.add(fillLight);

  flashlight = new THREE.SpotLight(0xffeedd, 2.5, 24, Math.PI / 4.5, 0.6, 1.8);
  flashlight.position.set(0.22, -0.12, -0.3);
  flashlight.target.position.set(0, 0, -1);
  flashlight.castShadow = true;
  flashlight.shadow.mapSize.width = 1024;
  flashlight.shadow.mapSize.height = 1024;
  camera.add(flashlight.target);
  camera.add(flashlight);
  scene.add(camera);
  flashlightOn = true;

  gunGroup = createPolygonWeapon(currentWeapon.weaponType || "pistol");
  camera.add(gunGroup);

  const wallTexture = createWallTexture(mapType.name);
  const floorTexture = createFloorTexture(mapType.name);

  const wallMat = new THREE.MeshStandardMaterial({ map: wallTexture, roughness: 0.9, metalness: mapType.name === "FACTORY" ? 0.3 : 0.0, color: mapType.wallColor });
  const floorMat = new THREE.MeshStandardMaterial({ map: floorTexture, roughness: 1.0, metalness: 0.0, color: mapType.floorColor });
  const ceilMat = new THREE.MeshStandardMaterial({ color: mapType.ceilingColor, roughness: 1.0, metalness: 0.0 });
  const exitMat = new THREE.MeshStandardMaterial({ color: 0x0d3a1a, emissive: 0x2fbf4a, emissiveIntensity: 0.8, roughness: 0.3, metalness: 0.5 });

  const floor = new THREE.Mesh(new THREE.PlaneGeometry(cols * CELL, rows * CELL), floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.set((cols * CELL) / 2, 0, (rows * CELL) / 2);
  floor.receiveShadow = true;
  scene.add(floor);

  const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(cols * CELL, rows * CELL), ceilMat);
  ceiling.rotation.x = Math.PI / 2;
  ceiling.position.set((cols * CELL) / 2, 3.4, (rows * CELL) / 2);
  scene.add(ceiling);

  if (mapType.hasPipes) {
    const pipeMat = new THREE.MeshStandardMaterial({ color: 0x333030, roughness: 0.7, metalness: 0.3 });
    for (let i = 0; i < Math.min(cols, rows); i++) {
      const x = i * CELL + CELL / 2;
      const z = i * CELL + CELL / 2;
      const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 3.2, 6), pipeMat);
      pipe.position.set(x, 1.7, z);
      scene.add(pipe);
      if (i % 2 === 0) {
        const cross = new THREE.Mesh(new THREE.BoxGeometry(3, 0.04, 0.04), pipeMat);
        cross.position.set(x, 1.7, z + 1);
        scene.add(cross);
      }
    }
  }

  wallMeshes = [];
  const wallHeight = 3.4, wallThick = 0.3;
  wallSegs.forEach((s) => {
    const len = Math.hypot(s.x2 - s.x1, s.z2 - s.z1);
    const geo = new THREE.BoxGeometry(len + wallThick, wallHeight, wallThick);
    const mesh = new THREE.Mesh(geo, wallMat);
    const midX = (s.x1 + s.x2) / 2, midZ = (s.z1 + s.z2) / 2;
    mesh.position.set(midX, wallHeight / 2, midZ);
    if (Math.abs(s.x2 - s.x1) < 0.01) mesh.rotation.y = Math.PI / 2;
    mesh.userData.isWall = true;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);
    wallMeshes.push(mesh);
  });

  const pad = new THREE.Mesh(new THREE.BoxGeometry(CELL * 0.7, 0.1, CELL * 0.7), exitMat);
  pad.position.set(exitCell.i * CELL + CELL / 2, 0.06, exitCell.j * CELL + CELL / 2);
  pad.receiveShadow = true;
  scene.add(pad);
  const padLight = new THREE.PointLight(0x39ff6a, 3, 12, 2);
  padLight.position.set(pad.position.x, 1.5, pad.position.z);
  scene.add(padLight);

  if (mapType.hasLamps) {
    const lampCount = Math.min(cols + 2, rows + 2);
    for (let n = 0; n < lampCount; n++) {
      const i = Math.floor(Math.random() * cols);
      const j = Math.floor(Math.random() * rows);
      const lamp = new THREE.PointLight(mapType.lightColor, 0.6, 8, 2);
      lamp.position.set(i * CELL + CELL / 2, 2.6, j * CELL + CELL / 2);
      scene.add(lamp);
    }
  }

  obstacles = [];
  const metalMat = new THREE.MeshStandardMaterial({ map: createProceduralTexture(256, 256, generateMetalTexture), roughness: 0.4, metalness: 0.8, color: mapType.accentColor });
  const obstacleCount = Math.min(6 + sector * 2, 20);
  for (let n = 0; n < obstacleCount; n++) {
    let placed = false, attempts = 0;
    while (!placed && attempts < 80) {
      attempts++;
      const i = Math.floor(Math.random() * (cols - 2)) + 1;
      const j = Math.floor(Math.random() * (rows - 2)) + 1;
      if (Math.abs(i) + Math.abs(j) < 4) continue;
      if (i === exitCell.i && j === exitCell.j) continue;
      const x = i * CELL + CELL / 2 + (Math.random() - 0.5) * CELL * 0.3;
      const z = j * CELL + CELL / 2 + (Math.random() - 0.5) * CELL * 0.3;
      const type = Math.floor(Math.random() * 3);
      let mesh;
      if (type === 0) {
        const crateGroup = new THREE.Group();
        for (let s = 0; s < 2 + Math.floor(Math.random() * 2); s++) {
          const size = 0.4 + Math.random() * 0.3;
          const crateMat = new THREE.MeshStandardMaterial({ map: createProceduralTexture(128, 128, generateWoodTexture), roughness: 0.9, metalness: 0.0, color: mapType.accentColor });
          const crate = new THREE.Mesh(new THREE.BoxGeometry(size, size * 0.7, size), crateMat);
          crate.position.set((Math.random() - 0.5) * 0.2, s * size * 0.65, (Math.random() - 0.5) * 0.2);
          crate.castShadow = true;
          crate.receiveShadow = true;
          crateGroup.add(crate);
        }
        mesh = crateGroup;
      } else if (type === 1) {
        const barrelGroup = new THREE.Group();
        for (let b = 0; b < 2 + Math.floor(Math.random() * 2); b++) {
          const rad = 0.2 + Math.random() * 0.12;
          const barrelMat = new THREE.MeshStandardMaterial({ map: createProceduralTexture(128, 128, generateMetalTexture), roughness: 0.5, metalness: 0.6, color: mapType.accentColor });
          const barrel = new THREE.Mesh(new THREE.CylinderGeometry(rad, rad * 0.9, 0.3 + Math.random() * 0.25, 8), barrelMat);
          barrel.position.set((Math.random() - 0.5) * 0.3, 0.15, (Math.random() - 0.5) * 0.3);
          barrel.rotation.z = (Math.random() - 0.5) * 0.1;
          barrel.castShadow = true;
          barrel.receiveShadow = true;
          barrelGroup.add(barrel);
        }
        mesh = barrelGroup;
      } else {
        const barrierMat = new THREE.MeshStandardMaterial({ map: createProceduralTexture(128, 128, generateMetalTexture), roughness: 0.4, metalness: 0.7, color: mapType.accentColor });
        mesh = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.5, 0.8), barrierMat);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
      }
      mesh.position.set(x, 0.25, z);
      mesh.userData.isObstacle = true;
      mesh.userData.collisionRadius = 0.4;
      scene.add(mesh);
      obstacles.push(mesh);
      placed = true;
    }
  }

  enemies = [];
  bossEnemy = null;

  if (isHellMode) {
    const bossCount = Math.min(3 + Math.floor(sector / 2), 8);
    for (let i = 0; i < bossCount; i++) {
      const boss = createMapBoss(mapType.theme);
      const margin = 2;
      const bi = margin + Math.floor(Math.random() * (cols - margin * 2));
      const bj = margin + Math.floor(Math.random() * (rows - margin * 2));
      boss.position.set(bi * CELL + CELL / 2, 0, bj * CELL + CELL / 2);
      boss.userData = {
        isEnemy: true, isBoss: true, type: "boss",
        cell: { i: bi, j: bj }, path: null,
        repathTimer: 0.2 + Math.random() * 0.3,
        speed: diffConfig.enemySpeed * (0.5 + Math.random() * 0.2),
        maxHp: getBossHealth(level) * (1 + i * 0.2),
        hp: getBossHealth(level) * (1 + i * 0.2),
        scareTimer: 0, height: 3.0,
        attackRange: 2.0 + i * 0.1,
        attackCooldown: 1.2 - i * 0.05,
        attackTimer: Math.random() * 0.5,
        damageMult: diffConfig.bossDamageMult * (1 + i * 0.1),
        bossDamage: getBossDamage() * (1 + i * 0.1),
        bossIndex: i,
        abilityCooldowns: { PULL: 0, SUMMON: 0, TELEPORT: 0, SHOCKWAVE: 0 },
        collisionRadius: 0.9,
      };
      boss.castShadow = true;
      boss.receiveShadow = true;
      const glowLight = new THREE.PointLight(0xff3333, 2.5 + i * 0.3, 12);
      glowLight.position.y = 1.5;
      boss.add(glowLight);
      scene.add(boss);
      if (i === 0) bossEnemy = boss;
      enemies.push(boss);
    }
  } else if (isBossLevel) {
    const boss = createMapBoss(mapType.theme);
    const margin = 2;
    const bi = margin + Math.floor(Math.random() * (cols - margin * 2));
    const bj = margin + Math.floor(Math.random() * (rows - margin * 2));
    boss.position.set(bi * CELL + CELL / 2, 0, bj * CELL + CELL / 2);
    boss.userData = {
      isEnemy: true, isBoss: true, type: "boss",
      cell: { i: bi, j: bj }, path: null,
      repathTimer: 0.2 + Math.random() * 0.3,
      speed: diffConfig.enemySpeed * 0.5,
      maxHp: getBossHealth(level),
      hp: getBossHealth(level),
      scareTimer: 0, height: 3.0,
      attackRange: 2.0, attackCooldown: 1.2,
      attackTimer: Math.random() * 0.5,
      damageMult: diffConfig.bossDamageMult,
      bossDamage: getBossDamage(),
      bossIndex: 0,
      abilityCooldowns: { PULL: 0, SUMMON: 0, TELEPORT: 0, SHOCKWAVE: 0 },
      collisionRadius: 0.9,
    };
    boss.castShadow = true;
    boss.receiveShadow = true;
    const glowLight = new THREE.PointLight(0xff3333, 2.5, 12);
    glowLight.position.y = 1.5;
    boss.add(glowLight);
    scene.add(boss);
    bossEnemy = boss;
    enemies.push(boss);
    const regularCount = Math.min(diffConfig.enemyCount - 1, 4);
    spawnMapEnemies(regularCount, sector, mapType);
  } else {
    const enemyCount = Math.min(diffConfig.enemyCount + Math.floor(sector * 0.5), 22);
    spawnMapEnemies(enemyCount, sector, mapType);
  }

  const levelEl = document.getElementById("levelVal");
  if (levelEl) levelEl.textContent = sector;
  updateEnemyCount();

  if (!savedLevelLoaded) {
    sanity = 100;
    const sv = document.getElementById("sanityVal");
    const sb = document.getElementById("sanityBar");
    if (sv) sv.textContent = "100%";
    if (sb) sb.querySelector("span").style.width = "100%";
    health = getMaxHealth();
  }
  savedLevelLoaded = false;
  renderHealthBar();
  playerHeight = 1.7;
  velocityY = 0;
  isGrounded = true;
  isCrouching = false;

  const clearTitleEl = document.getElementById("clearTitle");
  if (clearTitleEl) clearTitleEl.textContent = isBossLevel || isHellMode ? "BOSS DEFEATED" : "SECTOR PURGED";

  const shieldValEl = document.getElementById("shieldVal");
  const shieldDispEl = document.getElementById("shieldDisplay");
  const statPtsEl = document.getElementById("statPointsVal");
  const wNameEl = document.getElementById("weaponNameVal");
  const wLvlEl = document.getElementById("weaponLevelVal");
  const objValEl = document.getElementById("objectiveVal");

  if (shieldValEl) shieldValEl.textContent = Math.round(shieldAmount);
  if (shieldDispEl) shieldDispEl.style.opacity = shieldAmount > 0 ? 1 : 0;
  if (statPtsEl) statPtsEl.textContent = statPoints;
  if (wNameEl) wNameEl.textContent = currentWeapon.name;
  if (wLvlEl) wLvlEl.textContent = currentWeapon.level;
  updateAmmoDisplay();
  updateWeaponXPDisplay();
  updateGrenadeDisplay();

  if (isBossLevel || isHellMode) {
    const bossInd = document.getElementById("bossIndicator");
    if (bossInd) {
      bossInd.style.opacity = 1;
      setTimeout(() => { bossInd.style.opacity = 0; }, 2000);
    }
    AudioSys.boss();
    const obj = document.getElementById("objective");
    if (obj) obj.querySelector(".val").classList.add("boss-objective");
    if (objValEl) objValEl.textContent = "DEFEAT THE BOSS(ES)";
  } else {
    const obj = document.getElementById("objective");
    if (obj) obj.querySelector(".val").classList.remove("boss-objective");
    if (objValEl) objValEl.textContent = "LOCATE EXIT PAD";
  }
}

function spawnMapEnemies(count, sector, mapType) {
  const availableTypes = mapType.enemyTypes;
  for (let n = 0; n < count; n++) {
    let placed = false, attempts = 0;
    while (!placed && attempts < 80) {
      attempts++;
      const i = Math.floor(Math.random() * cols);
      const j = Math.floor(Math.random() * rows);
      if (Math.abs(i) + Math.abs(j) < 4) continue;
      if (i === exitCell.i && j === exitCell.j) continue;
      if (bossEnemy && Math.abs(i - Math.floor(cols / 2)) < 3 && Math.abs(j - Math.floor(rows / 2)) < 3) continue;

      const typeId = availableTypes[Math.floor(Math.random() * availableTypes.length)];
      const typeDef = enemyTypes.find((t) => t.id === typeId) || enemyTypes[0];
      const maxHp = Math.round(getEnemyHealthScaling(sector) * typeDef.hpMult);

      const enemy = createMapMonster(typeId, typeDef.size, typeDef.height, mapType.theme);
      enemy.position.set(i * CELL + CELL / 2, 0, j * CELL + CELL / 2);

      enemy.userData = {
        isEnemy: true, isBoss: false, type: typeDef.id,
        cell: { i, j }, path: null,
        repathTimer: 0.2 + Math.random() * 0.3,
        speed: diffConfig.enemySpeed * typeDef.speedMult + (Math.random() * 0.2 - 0.1),
        maxHp, hp: maxHp, scareTimer: 0,
        height: typeDef.height,
        attackRange: typeDef.attackRange,
        attackCooldown: typeDef.attackCooldown,
        attackTimer: Math.random() * typeDef.attackCooldown,
        damageMult: typeDef.damageMult,
        collisionRadius: 0.5,
      };
      enemy.castShadow = true;
      enemy.receiveShadow = true;
      scene.add(enemy);
      enemies.push(enemy);
      placed = true;
    }
  }
}

/* ============================================================
   BOSS ABILITIES
   ============================================================ */
const BOSS_ABILITIES = {
  PULL: {
    name: "PULL", duration: 0.5, cooldown: 5,
    execute: (boss, player) => {
      const dir = new THREE.Vector3().subVectors(boss.position, player.position).normalize();
      player.position.add(dir.multiplyScalar(3));
      AudioSys.bossAbility();
      showBossAbility("PULL!");
      applyScreenShake(0.5);
      return true;
    },
  },
  SUMMON: {
    name: "SUMMON", duration: 1.0, cooldown: 8,
    execute: (boss, player, scene, enemies) => {
      const count = 2 + Math.floor(Math.random() * 2);
      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2 + Math.random() * 0.5;
        const dist = 3 + Math.random() * 2;
        const pos = boss.position.clone().add(new THREE.Vector3(Math.cos(angle) * dist, 0.9, Math.sin(angle) * dist));
        const s = createMapMonster("spitter", 0.5, 0.8, "dark");
        s.position.copy(pos);
        s.userData = {
          isEnemy: true, isBoss: false, type: "summoned",
          cell: { i: Math.floor(pos.x / CELL), j: Math.floor(pos.z / CELL) },
          path: null, repathTimer: 0.2,
          speed: diffConfig.enemySpeed * 1.5,
          maxHp: 20 + level * 2, hp: 20 + level * 2,
          scareTimer: 0, height: 0.8,
          attackRange: 1.2, attackCooldown: 0.8, attackTimer: 0,
          damageMult: 0.6, collisionRadius: 0.4,
        };
        s.castShadow = true;
        s.receiveShadow = true;
        scene.add(s);
        enemies.push(s);
      }
      AudioSys.bossAbility();
      showBossAbility("SUMMON!");
      return true;
    },
  },
  TELEPORT: {
    name: "TELEPORT", duration: 0.3, cooldown: 6,
    execute: (boss, player) => {
      const angle = Math.random() * Math.PI * 2;
      const dist = 4 + Math.random() * 3;
      const newPos = player.position.clone().add(new THREE.Vector3(Math.cos(angle) * dist, boss.position.y, Math.sin(angle) * dist));
      boss.position.copy(newPos);
      AudioSys.bossAbility();
      showBossAbility("TELEPORT!");
      applyScreenShake(0.3);
      return true;
    },
  },
  SHOCKWAVE: {
    name: "SHOCKWAVE", duration: 0.8, cooldown: 7,
    execute: (boss, player) => {
      const dist = boss.position.distanceTo(player.position);
      if (dist < 5) {
        const damage = 15 * diffConfig.bossDamageMult;
        const defenseBonus = getDefenseBonus();
        let dmg = Math.max(1, damage - defenseBonus);
        if (shieldAmount > 0) {
          const absorbed = Math.min(shieldAmount, dmg);
          shieldAmount -= absorbed;
          dmg -= absorbed;
          if (shieldAmount <= 0) shieldAmount = 0;
          const sv = document.getElementById("shieldVal");
          const sd = document.getElementById("shieldDisplay");
          if (sv) sv.textContent = Math.round(shieldAmount);
          if (sd) sd.style.opacity = shieldAmount > 0 ? 1 : 0;
        }
        health -= dmg;
        hitFlashTimer = 0.3;
        if (damageOverlay) damageOverlay.style.opacity = Math.min(0.5, dmg / 50);
        setTimeout(() => { if (damageOverlay) damageOverlay.style.opacity = 0; }, 300);
        AudioSys.hurt();
        applyScreenShake(0.8);
        const dir = new THREE.Vector3().subVectors(player.position, boss.position).normalize();
        player.position.add(dir.multiplyScalar(2));
        showBossAbility("SHOCKWAVE!");
        return true;
      }
      return false;
    },
  },
};

/* ============================================================
   RENDERER / MINIMAP
   ============================================================ */
function initRenderer() {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
}

function initMinimap() {
  const cnv = document.getElementById("minimap");
  if (!cnv) return;
  cnv.width = 150;
  cnv.height = 150;
  minimapCtx = cnv.getContext("2d");
}

function drawMinimap() {
  if (!minimapCtx || !grid) return;
  const ctx = minimapCtx;
  const W = 150, H = 150;
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = "rgba(5,3,2,0.9)";
  ctx.fillRect(0, 0, W, H);
  const cellPx = Math.min(W / cols, H / rows);
  ctx.strokeStyle = "rgba(120,90,60,0.2)";
  ctx.lineWidth = 0.8;
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      const cell = grid[i][j];
      const x0 = i * cellPx, y0 = j * cellPx;
      ctx.beginPath();
      if (cell.top) { ctx.moveTo(x0, y0); ctx.lineTo(x0 + cellPx, y0); }
      if (cell.left) { ctx.moveTo(x0, y0); ctx.lineTo(x0, y0 + cellPx); }
      if (cell.right) { ctx.moveTo(x0 + cellPx, y0); ctx.lineTo(x0 + cellPx, y0 + cellPx); }
      if (cell.bottom) { ctx.moveTo(x0, y0 + cellPx); ctx.lineTo(x0 + cellPx, y0 + cellPx); }
      ctx.stroke();
    }
  }
  ctx.fillStyle = "rgba(80,200,80,0.25)";
  ctx.fillRect(exitCell.i * cellPx + cellPx * 0.35, exitCell.j * cellPx + cellPx * 0.35, cellPx * 0.3, cellPx * 0.3);
  enemies.forEach((e) => {
    const ex = (e.position.x / CELL) * cellPx;
    const ez = (e.position.z / CELL) * cellPx;
    const size = e.userData.isBoss ? 6 : 2;
    ctx.fillStyle = e.userData.isBoss ? "rgba(255,80,80,0.8)" : "rgba(200,50,50,0.4)";
    ctx.beginPath();
    ctx.arc(ex, ez, size, 0, Math.PI * 2);
    ctx.fill();
  });
  const px = (camera.position.x / CELL) * cellPx;
  const pz = (camera.position.z / CELL) * cellPx;
  ctx.save();
  ctx.translate(px, pz);
  ctx.rotate(yaw);
  ctx.fillStyle = "rgba(200,160,100,0.5)";
  ctx.beginPath();
  ctx.moveTo(0, -4);
  ctx.lineTo(3, 3);
  ctx.lineTo(-3, 3);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

/* ============================================================
   ENEMY AI
   ============================================================ */
function updateEnemies(dt) {
  const playerCell = { i: Math.floor(camera.position.x / CELL), j: Math.floor(camera.position.z / CELL) };
  let anyClose = false;
  let closestDist = 999;

  enemies.forEach((en) => {
    en.userData.repathTimer -= dt;
    en.userData.attackTimer -= dt;

    if (en.userData.scareTimer > 0) {
      en.userData.scareTimer -= dt;
      const pulse = 0.8 + Math.sin(performance.now() * 0.02) * 0.3;
      en.children.forEach((child) => {
        if (child.isMesh && child.material) child.material.emissiveIntensity = pulse;
      });
      return;
    } else {
      en.children.forEach((child) => {
        if (child.isMesh && child.material) child.material.emissiveIntensity = en.userData.isBoss ? 0.6 : 0.3;
      });
    }

    const curCell = { i: Math.floor(en.position.x / CELL), j: Math.floor(en.position.z / CELL) };
    if (en.userData.repathTimer <= 0) {
      en.userData.repathTimer = 0.15 + Math.random() * 0.2;
      en.userData.path = bfsPath(grid, cols, rows, curCell, playerCell);
    }

    const distToPlayer = en.position.distanceTo(camera.position);
    const attackRange = en.userData.attackRange || 1.3;
    const healthPercent = en.userData.hp / en.userData.maxHp;
    let speedMod = 1.0;

    if (healthPercent < 0.3 && !en.userData.isBoss) {
      speedMod = 1.3;
      en.children.forEach((child) => {
        if (child.isMesh && child.material) child.material.emissiveIntensity = 0.8 + Math.sin(performance.now() * 0.03) * 0.2;
      });
    }

    if (en.userData.isBoss && diffConfig.bossAbilities) {
      /* Tick boss ability cooldowns */
      if (en.userData.abilityCooldowns) {
        const cdKeys = Object.keys(en.userData.abilityCooldowns);
        for (let i = 0; i < cdKeys.length; i++) {
          en.userData.abilityCooldowns[cdKeys[i]] = Math.max(0, en.userData.abilityCooldowns[cdKeys[i]] - dt);
        }
      }

      if (Math.random() < 0.015 && en.userData.attackTimer <= 0) {
        const abilityKeys = ["PULL", "SUMMON", "TELEPORT", "SHOCKWAVE"];
        const available = [];
        for (const key of abilityKeys) {
          if (!en.userData.abilityCooldowns || en.userData.abilityCooldowns[key] <= 0) available.push(key);
        }
        if (available.length > 0) {
          const abilityKey = available[Math.floor(Math.random() * available.length)];
          const ability = BOSS_ABILITIES[abilityKey];
          if (ability) {
            const playerPos = camera.position.clone();
            let success = false;
            try {
              if (abilityKey === "SUMMON") success = ability.execute(en, playerPos, scene, enemies);
              else success = ability.execute(en, playerPos);
            } catch (e) { success = false; }

            if (success) {
              if (!en.userData.abilityCooldowns) en.userData.abilityCooldowns = {};
              en.userData.abilityCooldowns[abilityKey] = ability.cooldown + Math.random() * 2;
              en.userData.attackTimer = ability.duration;

              if (abilityKey === "SHOCKWAVE" || abilityKey === "PULL") {
                if (lastPlayerPos) {
                  const moved = playerPos.distanceTo(lastPlayerPos);
                  if (moved > 1.5) {
                    dodges++;
                    stats.dodges++;
                    updateStatsUI();
                    AudioSys.dodge();
                  }
                }
                lastPlayerPos = playerPos.clone();
              }
            }
          }
        }
      }
    }

    if (distToPlayer < attackRange && en.userData.attackTimer <= 0) {
      let damage = en.userData.isBoss
        ? (en.userData.bossDamage || diffConfig.damagePerSec * 0.6 * diffConfig.bossDamageMult)
        : diffConfig.damagePerSec * 0.5 * (en.userData.damageMult || 1);

      if (en.userData.type === "spitter" && distToPlayer > 1.5) {
        const defBonus = getDefenseBonus();
        let dmg = Math.max(1, damage * 0.6 - defBonus);
        if (shieldAmount > 0) {
          const absorbed = Math.min(shieldAmount, dmg);
          shieldAmount -= absorbed;
          dmg -= absorbed;
          if (shieldAmount <= 0) shieldAmount = 0;
          const sv = document.getElementById("shieldVal");
          const sd = document.getElementById("shieldDisplay");
          if (sv) sv.textContent = Math.round(shieldAmount);
          if (sd) sd.style.opacity = shieldAmount > 0 ? 1 : 0;
        }
        health -= dmg;
        hitFlashTimer = 0.15;
        if (damageOverlay) damageOverlay.style.opacity = Math.min(0.3, dmg / 50);
        setTimeout(() => { if (damageOverlay) damageOverlay.style.opacity = 0; }, 300);
        AudioSys.hurt();
        applyScreenShake(0.2);
        en.userData.attackTimer = en.userData.attackCooldown * 1.2;
        renderHealthBar();
      } else {
        const defBonus = getDefenseBonus();
        let dmg = Math.max(1, damage - defBonus);
        if (shieldAmount > 0) {
          const absorbed = Math.min(shieldAmount, dmg);
          shieldAmount -= absorbed;
          dmg -= absorbed;
          if (shieldAmount <= 0) shieldAmount = 0;
          const sv = document.getElementById("shieldVal");
          const sd = document.getElementById("shieldDisplay");
          if (sv) sv.textContent = Math.round(shieldAmount);
          if (sd) sd.style.opacity = shieldAmount > 0 ? 1 : 0;
        }
        health -= dmg;
        hitFlashTimer = 0.2;
        if (damageOverlay) damageOverlay.style.opacity = Math.min(0.4, dmg / 50);
        setTimeout(() => { if (damageOverlay) damageOverlay.style.opacity = 0; }, 300);
        AudioSys.hurt();
        applyScreenShake(0.3);
        en.userData.attackTimer = en.userData.attackCooldown || 1.0;
        renderHealthBar();
        const dir = new THREE.Vector3().subVectors(en.position, camera.position).normalize();
        en.position.add(dir.multiplyScalar(0.3));
      }
    }

    if (distToPlayer > attackRange * 0.6) {
      const path = en.userData.path;
      if (path && path.length) {
        const next = path[0];
        const targetX = next.i * CELL + CELL / 2;
        const targetZ = next.j * CELL + CELL / 2;
        const dx = targetX - en.position.x;
        const dz = targetZ - en.position.z;
        const d = Math.hypot(dx, dz);
        if (d < 0.2) path.shift();
        else {
          const baseSpeed = en.userData.speed * (keys["Shift"] ? 0.8 : 1.0) * getSpeedBonus();
          const speed = baseSpeed * speedMod;
          en.position.x += (dx / d) * speed * dt;
          en.position.z += (dz / d) * speed * dt;
        }
      }
    }

    for (const other of enemies) {
      if (other === en) continue;
      const dx = en.position.x - other.position.x;
      const dz = en.position.z - other.position.z;
      const dist = Math.sqrt(dx * dx + dz * dz);
      const minDist = (en.userData.collisionRadius || 0.5) + (other.userData.collisionRadius || 0.5);
      if (dist < minDist && dist > 0.01) {
        const push = ((minDist - dist) / dist) * 0.5;
        en.position.x += dx * push;
        en.position.z += dz * push;
      }
    }

    const bobAmount = en.userData.isBoss ? 0.1 : 0.06;
    const swayAmount = en.userData.isBoss ? 0.03 : 0.02;
    en.position.y = Math.sin(performance.now() * 0.004 + (en.id || 0)) * bobAmount;
    en.rotation.z = Math.sin(performance.now() * 0.003 + (en.id || 0) * 1.5) * swayAmount;

    if (distToPlayer < 7) anyClose = true;
    if (distToPlayer < closestDist) closestDist = distToPlayer;
  });

  if (anyClose && closestDist < 7) {
    const drainRate = diffConfig.sanityDrain * (1 - closestDist / 7) * 0.5;
    sanity -= drainRate * dt;
    if (sanity < 0) { sanity = 0; triggerJumpscare(); }
    const sv = document.getElementById("sanityVal");
    const sb = document.getElementById("sanityBar");
    if (sv) sv.textContent = Math.round(sanity) + "%";
    if (sb) sb.querySelector("span").style.width = sanity + "%";
  } else if (flashlightOn) {
    sanity = Math.min(100, sanity + 0.25 * dt);
    const sv = document.getElementById("sanityVal");
    const sb = document.getElementById("sanityBar");
    if (sv) sv.textContent = Math.round(sanity) + "%";
    if (sb) sb.querySelector("span").style.width = sanity + "%";
  }

  const banner = document.getElementById("alertBanner");
  const heartbeat = document.getElementById("heartbeat");
  if (banner && heartbeat) {
    if (anyClose) {
      alertTimer += dt;
      banner.style.opacity = (Math.sin(performance.now() * 0.012) * 0.5 + 0.5).toFixed(2);
      if (closestDist < 3.5) {
        heartbeat.style.opacity = "0.9";
        heartbeatTimer += dt;
        if (heartbeatTimer > 0.3) heartbeatTimer = 0;
      } else {
        heartbeat.style.opacity = "0.3";
        heartbeatTimer += dt;
        if (heartbeatTimer > 0.8) heartbeatTimer = 0;
      }
    } else {
      alertTimer = 0;
      banner.style.opacity = 0;
      heartbeat.style.opacity = 0;
      heartbeatTimer = 0;
    }
  }
}

function triggerJumpscare() {
  const js = document.getElementById("jumpscare");
  if (!js || js.style.display === "flex") return;
  js.style.display = "flex";
  const c = document.createElement("canvas");
  c.width = 400; c.height = 400;
  const ctx = c.getContext("2d");
  ctx.fillStyle = "#1a0a0a"; ctx.fillRect(0, 0, 400, 400);
  ctx.fillStyle = "#3a1a1a"; ctx.beginPath(); ctx.ellipse(200, 200, 160, 200, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#f0d0a0"; ctx.beginPath(); ctx.ellipse(200, 180, 100, 120, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.ellipse(150, 150, 30, 40, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(250, 150, 30, 40, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#d00"; ctx.beginPath(); ctx.ellipse(150, 150, 10, 20, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(250, 150, 10, 20, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#000"; ctx.beginPath(); ctx.ellipse(200, 240, 70, 50, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#d44"; ctx.beginPath(); ctx.ellipse(200, 240, 50, 30, 0, 0, Math.PI * 2); ctx.fill();
  js.innerHTML = "";
  js.appendChild(c);
  AudioSys.scare();
  setTimeout(() => { js.style.display = "none"; js.innerHTML = ""; }, 400);
}

/* ============================================================
   PLAYER UPDATE
   ============================================================ */
function updatePlayer(dt) {
  if (!isGrounded) {
    velocityY += GRAVITY * dt;
    playerHeight += velocityY * dt;
    if (playerHeight <= (isCrouching ? 1.0 : 1.7)) {
      playerHeight = isCrouching ? 1.0 : 1.7;
      velocityY = 0;
      isGrounded = true;
    }
  }
  if (jumpCooldownTimer > 0) jumpCooldownTimer -= dt;
  if (meleeCooldown > 0) meleeCooldown -= dt;

  if (speedBoostTimer > 0) { speedBoostTimer -= dt; speedBoostMultiplier = 1.5; }
  else speedBoostMultiplier = 1;

  const baseSpeed = (keys["Shift"] ? 8.5 : 4.8) * speedBoostMultiplier * getSpeedBonus();
  const forward = new THREE.Vector3(Math.sin(yaw), 0, Math.cos(yaw));
  const strafe = new THREE.Vector3(Math.cos(yaw), 0, -Math.sin(yaw));

  let mx = 0, mz = 0;
  if (gameActive && !gamePaused) {
    if (isMobile && touchController) {
      const move = touchController.getMovement();
      mx = move.x;
      mz = move.z;
    } else {
      if (keys["w"] || keys["W"]) { mx -= forward.x; mz -= forward.z; }
      if (keys["s"] || keys["S"]) { mx += forward.x; mz += forward.z; }
      if (keys["a"] || keys["A"]) { mx -= strafe.x; mz -= strafe.z; }
      if (keys["d"] || keys["D"]) { mx += strafe.x; mz += strafe.z; }
    }
  }

  const mlen = Math.hypot(mx, mz);
  let moving = false;
  if (mlen > 0.001) {
    mx /= mlen;
    mz /= mlen;
    moving = true;
    camera.position.x += mx * baseSpeed * dt;
    camera.position.z += mz * baseSpeed * dt;
  }

  const pos = { x: camera.position.x, z: camera.position.z };
  resolveCollision(pos, 0.3, wallSegs, obstacles);

  for (const enemy of enemies) {
    const dx = pos.x - enemy.position.x;
    const dz = pos.z - enemy.position.z;
    const dist = Math.sqrt(dx * dx + dz * dz);
    const enemyRadius = enemy.userData.collisionRadius || 0.5;
    if (dist < enemyRadius + 0.3 && dist > 0.01) {
      const push = ((enemyRadius + 0.3 - dist) / dist) * 1.05;
      pos.x += dx * push;
      pos.z += dz * push;
    }
  }

  camera.position.x = pos.x;
  camera.position.z = pos.z;
  camera.position.x = Math.max(0.4, Math.min(cols * CELL - 0.4, camera.position.x));
  camera.position.z = Math.max(0.4, Math.min(rows * CELL - 0.4, camera.position.z));

  const jumpDisplay = document.getElementById("jumpCooldown");
  if (jumpDisplay) {
    if (jumpCooldownTimer > 0) { jumpDisplay.textContent = "JUMP COOLDOWN"; jumpDisplay.style.color = "#d44"; }
    else if (!isGrounded) { jumpDisplay.textContent = "IN AIR"; jumpDisplay.style.color = "#88aaff"; }
    else { jumpDisplay.textContent = "JUMP READY"; jumpDisplay.style.color = "#6f6"; }
  }

  if (moving) {
    bobTime += dt * 9;
    camera.position.y = playerHeight + Math.sin(bobTime) * 0.04;
  } else {
    camera.position.y += (playerHeight - camera.position.y) * 0.1;
  }

  camera.rotation.order = "YXZ";
  camera.rotation.y = yaw;
  camera.rotation.x = pitch;

  const ci = Math.floor(camera.position.x / CELL);
  const cj = Math.floor(camera.position.z / CELL);
  if (ci === exitCell.i && cj === exitCell.j) {
    if (isBossLevel && bossEnemy) return;
    if (isHellMode && enemies.filter((e) => e.userData.isBoss).length > 0) return;
    if (enemies.length === 0) onLevelClear();
    else {
      const objValEl = document.getElementById("objectiveVal");
      if (objValEl) {
        objValEl.textContent = "DEFEAT ALL ENEMIES";
        objValEl.style.color = "#ff4444";
        setTimeout(() => {
          objValEl.textContent = isBossLevel || isHellMode ? "DEFEAT THE BOSS(ES)" : "LOCATE EXIT PAD";
          objValEl.style.color = "#6f6";
        }, 1500);
      }
    }
  }
}

/* ============================================================
   ATTACK SYSTEM
   ============================================================ */
const raycaster = new THREE.Raycaster();

function tryAttack() {
  if (!gameActive || gamePaused) return;

  if (currentWeapon.isMelee) {
    if (meleeCooldown > 0) return;
    meleeCooldown = currentWeapon.fireRate;
    AudioSys.knife();
    if (gunGroup) gunGroup.position.z = 0.08;
    setTimeout(() => { if (gunGroup) gunGroup.position.z = 0; }, 150);

    const attackRadius = currentWeapon.range || 2.0;
    const attackAngle = Math.PI / 3;
    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
    const origin = camera.position.clone();

    for (const enemy of enemies) {
      const toEnemy = new THREE.Vector3().subVectors(enemy.position, origin);
      const dist = toEnemy.length();
      if (dist > attackRadius) continue;
      if (forward.angleTo(toEnemy) > attackAngle) continue;

      const damageBonus = getDamageBonus();
      let totalDamage = currentWeapon.damage + damageBonus;

      if (activePerks.includes("assassin")) {
        const enemyForward = new THREE.Vector3(0, 0, 1).applyQuaternion(enemy.quaternion);
        const toEnemyDir = toEnemy.clone().normalize();
        if (enemyForward.dot(toEnemyDir) > 0.5) totalDamage *= 3;
      }

      const isHeadshot = Math.random() < 0.3;
      const finalDamage = isHeadshot ? totalDamage * 2 : totalDamage;
      enemy.userData.hp -= finalDamage;
      addDamageNumber(enemy.position, finalDamage, isHeadshot, enemy.userData.isBoss);
      if (enemy.userData.hp <= 0) killEnemy(enemy, isHeadshot);
      flashCrosshair(isHeadshot);
      AudioSys.hit();
    }
  } else {
    if (isReloading) return;
    if (currentAmmo <= 0) { startReload(); return; }
    if (!ammoReady) return;

    ammoReady = false;
    shootCooldown = currentWeapon.fireRate;
    AudioSys.shoot();
    if (gunGroup) gunGroup.position.z = 0.12;
    applyScreenShake(0.3);
    setTimeout(() => { if (gunGroup) gunGroup.position.z = 0; }, 100);

    currentAmmo--;
    updateAmmoDisplay();

    const damageBonus = getDamageBonus();
    let totalDamage = currentWeapon.damage + damageBonus;

    if (activePerks.includes("berserker") && health < getMaxHealth() * 0.3) totalDamage *= 1.3;
    if (activePerks.includes("demo") && currentWeapon.weaponType === "heavy") totalDamage *= 1.5;

    const spread = currentWeapon.spread || 0.02;
    const randX = (Math.random() - 0.5) * spread;
    const randY = (Math.random() - 0.5) * spread;

    raycaster.setFromCamera({ x: randX, y: randY }, camera);
    const targets = wallMeshes.concat(enemies);
    const hits = raycaster.intersectObjects(targets, true);

    if (hits.length) {
      /* Find first hit that belongs to an enemy */
      let hitEnemyRoot = null;
      for (const hit of hits) {
        let obj = hit.object;
        while (obj && !obj.userData.isEnemy && obj.parent) obj = obj.parent;
        if (obj && obj.userData.isEnemy) { hitEnemyRoot = obj; break; }
        if (obj && obj.userData.isWall) break;
      }
      if (hitEnemyRoot) {
        const enemy = hitEnemyRoot;
        const headPos = enemy.position.clone();
        headPos.y += (enemy.userData.height || 1.5) * 0.85;
        const isHeadshot = hits[0].point.distanceTo(headPos) < 0.5;
        let damage = totalDamage;
        if (isHeadshot) {
          damage *= 2;
          if (activePerks.includes("sniper")) damage *= 2;
        }
        if (enemy.userData.isBoss) damage *= 0.7;
        enemy.userData.hp -= damage;
        addDamageNumber(enemy.position, damage, isHeadshot, enemy.userData.isBoss);
        if (enemy.userData.hp <= 0) {
          killEnemy(enemy, isHeadshot);
          flashCrosshair(isHeadshot);
          if (isHeadshot) AudioSys.headshot(); else AudioSys.hit();
        } else {
          flashCrosshair(isHeadshot);
          AudioSys.hit();
        }
      }
    }

    if (currentAmmo <= 0) setTimeout(() => startReload(), 300);
  }
}

function tryHeavyAttack() {
  if (!gameActive || gamePaused) return;
  if (!currentWeapon.isMelee) return;
  if (meleeCooldown > 0) return;

  meleeCooldown = currentWeapon.fireRate * 1.5;
  AudioSys.heavyKnife();
  if (gunGroup) { gunGroup.position.z = 0.15; gunGroup.rotation.x = -0.3; }
  applyScreenShake(0.4);
  setTimeout(() => { if (gunGroup) { gunGroup.position.z = 0; gunGroup.rotation.x = 0; } }, 300);

  const damageBonus = getDamageBonus();
  let totalDamage = (currentWeapon.damage + damageBonus) * 1.5;
  const attackRadius = (currentWeapon.range || 2.0) * 1.2;
  const attackAngle = Math.PI / 2;
  const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
  const origin = camera.position.clone();

  for (const enemy of enemies) {
    const toEnemy = new THREE.Vector3().subVectors(enemy.position, origin);
    const dist = toEnemy.length();
    if (dist > attackRadius) continue;
    if (forward.angleTo(toEnemy) > attackAngle) continue;
    const isHeadshot = Math.random() < 0.3;
    const dmg = isHeadshot ? totalDamage * 2 : totalDamage;
    enemy.userData.hp -= dmg;
    addDamageNumber(enemy.position, dmg, isHeadshot, enemy.userData.isBoss);
    if (enemy.userData.hp <= 0) { killEnemy(enemy, isHeadshot); flashCrosshair(isHeadshot); AudioSys.hit(); }
  }
}

function killEnemy(mesh, isHeadshot) {
  scene.remove(mesh);
  enemies = enemies.filter((e) => e !== mesh);
  const isBoss = mesh.userData.isBoss || false;

  const loot = generateLoot(isBoss ? "boss" : "normal");
  const earned = loot.money || (isBoss ? 300 : 25);
  money += earned;
  stats.totalMoney += earned;

  const scoreGain = Math.round((isBoss ? 800 : 75) * diffConfig.scoreMult);
  score += scoreGain;
  stats.totalScore += scoreGain;
  totalKillsThisRun++;
  stats.totalKills++;
  if (isBoss) stats.bossesDefeated++;
  if (isHeadshot) { headshots++; stats.headshots++; }

  if (!currentWeapon.isMelee) addWeaponXP(isBoss ? 50 : 10);

  if (loot.items && loot.items.length > 0) {
    loot.items.forEach((itemId) => {
      const tool = tools.find((t) => t.id === itemId);
      if (tool) { tool.owned = true; showMessage("Found " + tool.name); useTool(itemId); }
    });
  }

  const monsterName = mesh.userData.isBoss ? "BOSS" : (mesh.userData.type ? mesh.userData.type.toUpperCase() : "MONSTER");
  addKillFeed(monsterName, isHeadshot, isBoss);
  addMoneyPopup(earned, mesh.position);
  AudioSys.money();

  let gainedStatPoint = false;
  if (isBoss) { statPoints += 2; gainedStatPoint = true; }
  else if (Math.random() < 0.02 + getLuckBonus()) { statPoints++; gainedStatPoint = true; }

  const scoreValEl = document.getElementById("scoreVal");
  const moneyValEl = document.getElementById("moneyVal");
  const statPtsEl = document.getElementById("statPointsVal");
  if (scoreValEl) scoreValEl.textContent = score;
  if (moneyValEl) moneyValEl.textContent = money;
  if (statPtsEl) statPtsEl.textContent = statPoints;

  updateEnemyCount();
  sanity = Math.min(100, sanity + (isBoss ? 25 : 3));
  const sv = document.getElementById("sanityVal");
  const sb = document.getElementById("sanityBar");
  if (sv) sv.textContent = Math.round(sanity) + "%";
  if (sb) sb.querySelector("span").style.width = sanity + "%";

  if (isBoss && mesh === bossEnemy) {
    bossEnemy = null;
    const remainingBosses = enemies.filter((e) => e.userData.isBoss).length;
    if (remainingBosses === 0 && isHellMode) {
      const objValEl = document.getElementById("objectiveVal");
      if (objValEl) objValEl.textContent = "ALL BOSSES DEFEATED";
      setTimeout(() => onLevelClear(), 1000);
    }
  }

  updateStatsUI();
  if (gainedStatPoint) showMessage("+1 Stat Point");
}

/* ============================================================
   SHOP
   ============================================================ */
let currentShopTab = "weapons";

function renderShop(tab) {
  tab = tab || currentShopTab;
  const container = document.getElementById("shopItems");
  if (!container) return;
  container.innerHTML = "";
  const shopMoneyEl = document.getElementById("shopMoney");
  const shopStatEl = document.getElementById("shopStatPoints");
  if (shopMoneyEl) shopMoneyEl.textContent = money;
  if (shopStatEl) shopStatEl.textContent = statPoints;

  document.querySelectorAll(".shop-tab").forEach((t) => {
    t.classList.toggle("active", t.dataset.tab === tab);
  });

  if (tab === "weapons") {
    const groups = {};
    WEAPONS.forEach((w) => {
      const type = w.weaponType || "other";
      if (!groups[type]) groups[type] = [];
      groups[type].push(w);
    });
    Object.keys(groups).forEach((group) => {
      const groupDiv = document.createElement("div");
      groupDiv.style.cssText = "width:100%;text-align:center;color:#7a5a3a;font-size:10px;letter-spacing:3px;margin:4px 0;";
      groupDiv.textContent = "--- " + group.toUpperCase() + " ---";
      container.appendChild(groupDiv);
      groups[group].forEach((w) => {
        const div = document.createElement("div");
        div.className = "shop-item";
        const owned = w.owned ? (w.equipped ? " EQUIPPED" : " OWNED") : "";
        div.innerHTML =
          '<div class="name">' + w.name + (w.mastered ? " MASTERED" : "") + '</div>' +
          '<div class="price">' + (w.price === 0 ? "FREE" : w.price) + '</div>' +
          '<div class="owned">' + owned + '</div>' +
          '<div class="stats">DMG:' + w.damage + ' | AMMO:' + (w.isMelee ? "\u2014" : w.maxAmmo) + '</div>' +
          '<div class="desc">' + w.desc + '</div>';
        div.style.cursor = "pointer";
        div.addEventListener("click", () => {
          if (w.owned) {
            WEAPONS.forEach((we) => { we.equipped = false; });
            w.equipped = true;
            currentWeapon = w;
            currentAmmo = w.isMelee ? 0 : getMaxAmmoForWeapon(w);
            const wnv = document.getElementById("weaponNameVal");
            const wlv = document.getElementById("weaponLevelVal");
            if (wnv) wnv.textContent = w.name;
            if (wlv) wlv.textContent = w.level;
            updateAmmoDisplay();
            updateWeaponXPDisplay();
            if (gunGroup) {
              camera.remove(gunGroup);
              gunGroup = createPolygonWeapon(w.weaponType || "pistol");
              camera.add(gunGroup);
            }
            renderShop(tab);
            updateStatsUI();
            buildLevel(level);
          } else if (money >= w.price) {
            money -= w.price;
            w.owned = true;
            WEAPONS.forEach((we) => { we.equipped = false; });
            w.equipped = true;
            currentWeapon = w;
            currentAmmo = w.isMelee ? 0 : getMaxAmmoForWeapon(w);
            const wnv = document.getElementById("weaponNameVal");
            const wlv = document.getElementById("weaponLevelVal");
            const mv = document.getElementById("moneyVal");
            if (wnv) wnv.textContent = w.name;
            if (wlv) wlv.textContent = w.level;
            if (mv) mv.textContent = money;
            updateAmmoDisplay();
            updateWeaponXPDisplay();
            if (gunGroup) {
              camera.remove(gunGroup);
              gunGroup = createPolygonWeapon(w.weaponType || "pistol");
              camera.add(gunGroup);
            }
            renderShop(tab);
            updateStatsUI();
            buildLevel(level);
          }
        });
        container.appendChild(div);
      });
    });
  } else if (tab === "tools") {
    tools.forEach((t) => {
      const div = document.createElement("div");
      div.className = "shop-item";
      div.innerHTML =
        '<div class="name">' + t.name + '</div>' +
        '<div class="price">' + t.price + '</div>' +
        '<div class="desc">' + t.desc + '</div>' +
        '<div style="font-size:10px;color:#7a8a9a;">' + (t.owned ? "OWNED" : "") + '</div>';
      div.style.cursor = "pointer";
      div.addEventListener("click", () => {
        if (t.owned) useTool(t.id);
        else if (money >= t.price) {
          money -= t.price;
          t.owned = true;
          const mv = document.getElementById("moneyVal");
          if (mv) mv.textContent = money;
          renderShop(tab);
        }
      });
      container.appendChild(div);
    });
  } else if (tab === "stats") {
    Object.keys(PLAYER_STATS).forEach((statKey) => {
      const stat = PLAYER_STATS[statKey];
      const lvl = playerStatLevels[statKey];
      const maxed = lvl >= stat.max;
      const div = document.createElement("div");
      div.className = "shop-item";
      div.innerHTML =
        '<div class="name">' + stat.label + '</div>' +
        '<div class="level">Level ' + lvl + '/' + stat.max + '</div>' +
        '<div class="price">' + stat.cost + ' SP</div>' +
        '<div class="stats">Bonus: +' + (stat.bonus * lvl).toFixed(2) + '</div>' +
        '<div style="font-size:8px;color:#7a8a9a;">' + (maxed ? "MAXED" : "Click to upgrade") + '</div>';
      div.style.cursor = maxed ? "default" : "pointer";
      div.style.opacity = maxed ? 0.5 : 1;
      if (!maxed) {
        div.addEventListener("click", () => {
          if (statPoints >= stat.cost) {
            statPoints -= stat.cost;
            playerStatLevels[statKey]++;
            const spv = document.getElementById("statPointsVal");
            if (spv) spv.textContent = statPoints;
            if (statKey === "health") { health = getMaxHealth(); renderHealthBar(); }
            if (statKey === "ammo" && !currentWeapon.isMelee) {
              currentAmmo = getMaxAmmoForWeapon(currentWeapon);
              updateAmmoDisplay();
            }
            renderShop(tab);
            saveGame();
          }
        });
      }
      container.appendChild(div);
    });
  } else if (tab === "perks") {
    Object.keys(PERKS).forEach((perkId) => {
      const perk = PERKS[perkId];
      const owned = activePerks.includes(perkId);
      const canAfford = statPoints >= perk.cost;
      const div = document.createElement("div");
      div.className = "shop-item";
      div.innerHTML =
        '<div class="name">' + perk.name + '</div>' +
        '<div class="price">' + perk.cost + ' SP</div>' +
        '<div class="perk-desc">' + perk.desc + '</div>' +
        '<div style="font-size:8px;color:#7a8a9a;margin-top:4px;">' +
        (owned ? "EQUIPPED" : canAfford ? "Click to unlock" : "Not enough points") +
        '</div>';
      div.style.cursor = owned ? "default" : "pointer";
      div.style.opacity = owned ? 0.6 : 1;
      if (!owned) {
        div.addEventListener("click", () => { if (applyPerk(perkId)) renderShop(tab); });
      }
      container.appendChild(div);
    });
  }
}

function useTool(toolId) {
  const tool = tools.find((t) => t.id === toolId);
  if (!tool) return;
  switch (toolId) {
    case "map_reveal":
      mapRevealTimer = 10;
      showMessage("Map Revealed for 10s");
      break;
    case "health_pack":
      health = Math.min(getMaxHealth(), health + 30);
      renderHealthBar();
      showMessage("+30 HP");
      break;
    case "sanity_boost":
      sanity = Math.min(100, sanity + 40);
      const sv = document.getElementById("sanityVal");
      const sb = document.getElementById("sanityBar");
      if (sv) sv.textContent = Math.round(sanity) + "%";
      if (sb) sb.querySelector("span").style.width = sanity + "%";
      showMessage("+40 Sanity");
      break;
    case "speed_boost":
      speedBoostTimer = 8;
      showMessage("Speed Boost for 8s");
      break;
    case "shield":
      shieldAmount = 50;
      const shieldValEl = document.getElementById("shieldVal");
      const shieldDispEl = document.getElementById("shieldDisplay");
      if (shieldValEl) shieldValEl.textContent = Math.round(shieldAmount);
      if (shieldDispEl) shieldDispEl.style.opacity = 1;
      showMessage("Shield +50");
      break;
    case "xp_boost":
      showMessage("XP Boost activated");
      break;
  }
}

/* ============================================================
   SAVE SYSTEM
   ============================================================ */
const SAVE_VERSION = 2;

function saveGame() {
  try {
    const saveData = {
      version: SAVE_VERSION,
      score, level, money, health, sanity,
      difficulty: currentDifficulty,
      weapons: WEAPONS.map((w) => ({ id: w.id, owned: w.owned, equipped: w.equipped, xp: w.xp, level: w.level, mastered: w.mastered })),
      weaponIndex: WEAPONS.indexOf(currentWeapon),
      tools: tools.map((t) => ({ id: t.id, owned: t.owned })),
      shield: shieldAmount,
      stats, statPoints,
      playerStats: playerStatLevels,
      ammo: currentAmmo,
      headshots, dodges,
      unlockedDifficulties, highestLevelCleared, weaponMastered,
      activePerks,
      playtime, grenadesThrown, hordesSummoned,
      timestamp: Date.now(),
    };
    localStorage.setItem("bunker9_save", JSON.stringify(saveData));
    const sn = document.getElementById("saveNotify");
    if (sn) {
      sn.style.display = "block";
      setTimeout(() => { sn.style.display = "none"; }, 1500);
    }
    return true;
  } catch (e) { return false; }
}

function loadSave() {
  try {
    const raw = localStorage.getItem("bunker9_save");
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (data.version !== SAVE_VERSION) {
      console.warn("BUNKER-9: Save version mismatch, starting fresh.");
      localStorage.removeItem("bunker9_save");
      return null;
    }
    if (typeof data.score !== "number" || typeof data.level !== "number") return null;
    return data;
  } catch (e) { return null; }
}

function applySave(data) {
  if (!data) return false;
  score = data.score || 0;
  level = data.level || 1;
  money = data.money || 0;
  health = data.health || 100;
  sanity = data.sanity || 100;
  shieldAmount = data.shield || 0;
  statPoints = data.statPoints || 0;
  currentAmmo = data.ammo || 0;
  headshots = data.headshots || 0;
  dodges = data.dodges || 0;
  weaponMastered = data.weaponMastered || 0;
  playtime = data.playtime || 0;
  grenadesThrown = data.grenadesThrown || 0;
  hordesSummoned = data.hordesSummoned || 0;
  if (data.unlockedDifficulties) unlockedDifficulties = data.unlockedDifficulties;
  if (data.highestLevelCleared) highestLevelCleared = data.highestLevelCleared;
  if (data.playerStats) playerStatLevels = data.playerStats;
  if (data.stats) stats = data.stats;
  if (data.activePerks) activePerks = data.activePerks;
  if (data.difficulty && DIFFICULTIES[data.difficulty]) {
    currentDifficulty = data.difficulty;
    diffConfig = DIFFICULTIES[currentDifficulty];
  }
  if (data.weapons) {
    data.weapons.forEach((saveW) => {
      const w = WEAPONS.find((w) => w.id === saveW.id);
      if (w) {
        w.owned = saveW.owned;
        w.equipped = saveW.equipped;
        w.xp = saveW.xp || 0;
        w.level = saveW.level || 1;
        w.mastered = saveW.mastered || false;
      }
    });
    if (data.weaponIndex !== undefined && data.weaponIndex >= 0 && data.weaponIndex < WEAPONS.length) {
      const w = WEAPONS[data.weaponIndex];
      if (w && w.owned) {
        currentWeapon = w;
        WEAPONS.forEach((we) => { we.equipped = we === w; });
      }
    }
    const equipped = WEAPONS.find((w) => w.equipped);
    if (!equipped) {
      const firstOwned = WEAPONS.find((w) => w.owned);
      if (firstOwned) { firstOwned.equipped = true; currentWeapon = firstOwned; }
    }
  }
  if (data.tools) {
    data.tools.forEach((saveT) => {
      const t = tools.find((t) => t.id === saveT.id);
      if (t) t.owned = saveT.owned;
    });
  }
  const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
  set("scoreVal", score);
  set("moneyVal", money);
  set("levelVal", level);
  set("sanityVal", Math.round(sanity) + "%");
  const sb = document.getElementById("sanityBar");
  if (sb) sb.querySelector("span").style.width = sanity + "%";
  set("shieldVal", Math.round(shieldAmount));
  const sd = document.getElementById("shieldDisplay");
  if (sd) sd.style.opacity = shieldAmount > 0 ? 1 : 0;
  set("statPointsVal", statPoints);
  set("weaponNameVal", currentWeapon.name);
  set("weaponLevelVal", currentWeapon.level);
  stats.grenadesThrown = grenadesThrown;
  stats.hordesSummoned = hordesSummoned;
  renderHealthBar();
  updateStatsUI();
  updateAmmoDisplay();
  updateWeaponXPDisplay();
  updateGrenadeDisplay();
  updateDifficultyButtons();
  updateUnlockInfo();
  return true;
}

/* ============================================================
   DIFFICULTY UNLOCKS
   ============================================================ */
function checkDifficultyUnlocks() {
  const order = ["easy", "medium", "hard", "extreme", "impossible", "hell"];
  for (let i = 0; i < order.length; i++) {
    const diff = order[i];
    const info = DIFFICULTY_UNLOCKS[diff];
    if (info.require && info.requireLevel) {
      if (unlockedDifficulties.includes(info.require) && highestLevelCleared >= info.requireLevel) {
        if (!unlockedDifficulties.includes(diff)) {
          unlockedDifficulties.push(diff);
          unlockedDifficulties.sort((a, b) => order.indexOf(a) - order.indexOf(b));
        }
      }
    }
  }
  updateDifficultyButtons();
  updateUnlockInfo();
}

function updateDifficultyButtons() {
  document.querySelectorAll("#difficultyRow .menu-btn").forEach((btn) => {
    const diff = btn.dataset.diff;
    const isUnlocked = unlockedDifficulties.includes(diff);
    btn.classList.toggle("locked", !isUnlocked);
    btn.innerHTML = isUnlocked ? DIFFICULTY_UNLOCKS[diff].label : DIFFICULTY_UNLOCKS[diff].label + " [L]";
    if (currentDifficulty === diff && !isUnlocked) {
      currentDifficulty = "easy";
      diffConfig = DIFFICULTIES.easy;
      document.querySelectorAll("#difficultyRow .menu-btn").forEach((b) => {
        b.classList.toggle("active-mode", b.dataset.diff === currentDifficulty);
      });
    }
  });
}

function updateUnlockInfo() {
  const info = document.getElementById("unlockInfo");
  if (!info) return;
  const order = ["easy", "medium", "hard", "extreme", "impossible", "hell"];
  let nextDiff = null;
  for (const diff of order) {
    if (!unlockedDifficulties.includes(diff)) { nextDiff = diff; break; }
  }
  if (nextDiff) {
    const ui = DIFFICULTY_UNLOCKS[nextDiff];
    info.textContent = "Complete " + ui.requireLevel + " levels on " + ui.require.toUpperCase() + " to unlock " + ui.label;
  } else {
    info.textContent = "All difficulties unlocked!";
  }
}

/* ============================================================
   TOUCH CONTROLLER
   ============================================================ */
class TouchController {
  constructor() {
    this.joystick = { x: 0, y: 0 };
    this.joystickHandle = document.getElementById("joystickHandle");
    this.joystickBase = document.getElementById("joystickBase");
    this.isTouching = false;
    this.setupTouchEvents();
  }

  setupTouchEvents() {
    const touchLeft = document.getElementById("touchLeft");
    if (!touchLeft) return;

    const startJoy = (e) => { e.preventDefault(); this.isTouching = true; this.handleJoystick(e); };
    const moveJoy = (e) => { e.preventDefault(); if (this.isTouching) this.handleJoystick(e); };
    const endJoy = (e) => {
      e.preventDefault();
      this.isTouching = false;
      this.joystick.x = 0;
      this.joystick.y = 0;
      if (this.joystickHandle) this.joystickHandle.style.transform = "translate(-50%, -50%)";
    };

    touchLeft.addEventListener("pointerdown", startJoy);
    touchLeft.addEventListener("pointermove", moveJoy);
    touchLeft.addEventListener("pointerup", endJoy);
    touchLeft.addEventListener("pointercancel", endJoy);
    touchLeft.addEventListener("pointerleave", endJoy);

    const bindButton = (id, fn) => {
      const el = document.getElementById(id);
      if (!el) return;
      const handler = (e) => { e.preventDefault(); e.stopPropagation(); fn(); };
      el.addEventListener("pointerdown", handler);
    };

    bindButton("actionAttack", tryAttack);
    bindButton("actionHeavy", tryHeavyAttack);
    bindButton("actionJump", tryJump);
    bindButton("actionReload", startReload);
    bindButton("actionFlashlight", toggleFlashlight);
    bindButton("actionGrenade", throwGrenade);
  }

  handleJoystick(e) {
    if (!this.isTouching || !this.joystickHandle || !this.joystickBase) return;
    const rect = this.joystickBase.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const maxDist = rect.width / 2 - 25;
    let dx = e.clientX - centerX;
    let dy = e.clientY - centerY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > maxDist) {
      dx = (dx / dist) * maxDist;
      dy = (dy / dist) * maxDist;
    }
    this.joystick.x = dx / maxDist;
    this.joystick.y = dy / maxDist;
    this.joystickHandle.style.transform =
      "translate(" + (-50 + (dx / maxDist) * 50) + "%, " + (-50 + (dy / maxDist) * 50) + "%)";
  }

  getMovement() {
    if (!this.isTouching) return { x: 0, z: 0 };
    return { x: this.joystick.x, z: -this.joystick.y };
  }
}

function initMobile() {
  isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;
  if (isMobile) {
    const mc = document.getElementById("mobileControls");
    if (mc) mc.style.display = "block";
    touchController = new TouchController();
    document.addEventListener("contextmenu", (e) => e.preventDefault());
  }
}

/* ============================================================
   FLOW CONTROL
   ============================================================ */
function startGame(loadSaveData) {
  document.getElementById("mainMenu").style.display = "none";
  document.getElementById("hud").style.display = "block";
  document.getElementById("pauseMenu").style.display = "none";
  document.getElementById("shopMenu").style.display = "none";
  document.getElementById("statsPanel").style.display = "none";
  document.getElementById("settingsMenu").style.display = "none";

  stats.gamesPlayed++;
  totalKillsThisRun = 0;

  if (loadSaveData) {
    applySave(loadSaveData);
    savedLevelLoaded = true;
    buildLevel(level);
    clock = new THREE.Clock();
    gameActive = true;
    gamePaused = false;
    if (!isMobile) canvas.requestPointerLock();
    updateStatsUI();
    return;
  }

  score = 0;
  level = 1;
  health = getMaxHealth();
  sanity = 100;
  money = 0;
  shieldAmount = 0;
  statPoints = 0;
  headshots = 0;
  dodges = 0;
  weaponMastered = 0;
  grenadesThrown = 0;
  hordesSummoned = 0;
  activePerks = [];
  WEAPONS.forEach((w) => { w.owned = false; w.equipped = false; w.xp = 0; w.level = 1; w.mastered = false; });
  WEAPONS[0].owned = true;
  WEAPONS[0].equipped = true;
  currentWeapon = WEAPONS[0];
  currentAmmo = 0;
  tools.forEach((t) => { t.owned = false; });
  Object.keys(PLAYER_STATS).forEach((key) => { playerStatLevels[key] = 0; });
  stats.grenadesThrown = 0;
  stats.hordesSummoned = 0;

  const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
  set("scoreVal", score);
  set("moneyVal", money);
  set("objectiveVal", "LOCATE EXIT PAD");
  set("shieldVal", "0");
  const sd = document.getElementById("shieldDisplay");
  if (sd) sd.style.opacity = 0;
  set("statPointsVal", statPoints);
  set("weaponNameVal", currentWeapon.name);
  set("weaponLevelVal", currentWeapon.level);

  initMinimap();
  buildLevel(level);
  clock = new THREE.Clock();
  gameActive = true;
  gamePaused = false;
  if (!isMobile) canvas.requestPointerLock();
  updateStatsUI();
  updateAmmoDisplay();
  updateWeaponXPDisplay();
  updateGrenadeDisplay();
  renderShop(currentShopTab);
}

function onLevelClear() {
  if (!gameActive) return;
  gameActive = false;
  document.exitPointerLock();
  AudioSys.clear();

  if (!levelClearedForStat && Math.random() < 0.5) {
    statPoints++;
    const spv = document.getElementById("statPointsVal");
    if (spv) spv.textContent = statPoints;
    showMessage("+1 Stat Point (Level Clear)");
    levelClearedForStat = true;
  }

  const bonus = isBossLevel || isHellMode ? 500 : 100;
  money += bonus;
  stats.totalMoney += bonus;
  const scoreBonus = Math.round(isBossLevel || isHellMode ? 1000 : 200) * diffConfig.scoreMult;
  score += scoreBonus;
  stats.totalScore += scoreBonus;
  if (level > stats.highestLevel) stats.highestLevel = level;
  if (level > highestLevelCleared) highestLevelCleared = level;

  const mv = document.getElementById("moneyVal");
  const cs = document.getElementById("clearScore");
  const ct = document.getElementById("clearTitle");
  if (mv) mv.textContent = money;
  if (cs) cs.textContent = score;
  if (ct) ct.textContent = isBossLevel || isHellMode ? "BOSS DEFEATED" : "SECTOR PURGED";
  document.getElementById("clearScreen").style.display = "flex";
  updateStatsUI();
  saveGame();
  checkDifficultyUnlocks();
}

function nextLevel() {
  document.getElementById("clearScreen").style.display = "none";
  level += 1;
  const sv = document.getElementById("scoreVal");
  if (sv) sv.textContent = score;
  health = Math.min(getMaxHealth(), health + 10);
  renderHealthBar();
  buildLevel(level);
  gameActive = true;
  gamePaused = false;
  clock.getDelta();
  if (!isMobile) canvas.requestPointerLock();
}

function onGameOver() {
  if (!gameActive) return;
  gameActive = false;
  document.exitPointerLock();
  AudioSys.death();
  const gs = document.getElementById("goScore");
  const gl = document.getElementById("goLevel");
  if (gs) gs.textContent = score;
  if (gl) gl.textContent = level - 1;
  document.getElementById("gameOverScreen").style.display = "flex";
  updateStatsUI();
  localStorage.removeItem("bunker9_save");
}

function restartGame() {
  document.getElementById("gameOverScreen").style.display = "none";
  startGame();
}

function goToMenu() {
  document.getElementById("pauseMenu").style.display = "none";
  document.getElementById("gameOverScreen").style.display = "none";
  document.getElementById("clearScreen").style.display = "none";
  document.getElementById("hud").style.display = "none";
  document.getElementById("shopMenu").style.display = "none";
  document.getElementById("statsPanel").style.display = "none";
  document.getElementById("settingsMenu").style.display = "none";
  document.getElementById("mainMenu").style.display = "flex";
  gameActive = false;
  gamePaused = false;
  updateStatsUI();
}

/* ============================================================
   MAIN LOOP
   ============================================================ */
function animate() {
  requestAnimationFrame(animate);
  if (!gameActive || gamePaused) {
    if (gameActive && gamePaused && scene && camera) renderer.render(scene, camera);
    return;
  }
  const dt = Math.min(clock.getDelta(), 0.06);
  playtime += dt;

  if (grenadeCooldown > 0) {
    grenadeCooldown -= dt;
    if (grenadeCooldown < 0) grenadeCooldown = 0;
    updateGrenadeDisplay();
  }

  updatePlayer(dt);
  updateEnemies(dt);
  updateReload(dt);

  if (particleSystem) particleSystem.update(dt);

  if (mapRevealTimer > 0) mapRevealTimer -= dt;

  if (shootCooldown > 0) {
    shootCooldown -= dt;
    if (shootCooldown <= 0) { ammoReady = true; updateAmmoDisplay(); }
  }
  if (flareCooldown > 0) flareCooldown -= dt;

  if (gunGroup && gunGroup.position.z > 0) gunGroup.position.z += (0 - gunGroup.position.z) * 0.1;

  if (hitFlashTimer > 0) {
    hitFlashTimer -= dt;
    document.body.style.boxShadow = "inset 0 0 120px rgba(255,0,0," + (hitFlashTimer * 2).toFixed(2) + ")";
  } else {
    document.body.style.boxShadow = "none";
  }

  renderHealthBar();
  drawMinimap();

  if (health <= 0 || sanity <= 0) onGameOver();
  renderer.render(scene, camera);
}

/* ============================================================
   INPUT HANDLING
   ============================================================ */
document.addEventListener("keydown", (e) => {
  keys[e.key] = true;
  if (e.key === "r" || e.key === "R") toggleFlashlight();
  if (e.key === "f" || e.key === "F") tryFlare();
  if (e.key === "g" || e.key === "G") throwGrenade();
  if (e.key === " " && gameActive && !gamePaused) { e.preventDefault(); tryJump(); }
  if (e.key === "c" || e.key === "C") toggleCrouch();
  if (e.key === "q" || e.key === "Q") toggleWeaponInspect();
  if ((e.key === "Escape" || e.key === "p" || e.key === "P") && gameActive && !gamePaused) togglePause();
});

document.addEventListener("keyup", (e) => { keys[e.key] = false; });

canvas.addEventListener("click", () => {
  if (!gameActive) return;
  if (!pointerLocked && !isMobile) { canvas.requestPointerLock(); return; }
  if (!gamePaused && !isMobile) tryAttack();
});

canvas.addEventListener("contextmenu", (e) => {
  e.preventDefault();
  if (!gameActive || !pointerLocked || gamePaused || isMobile) return;
  tryHeavyAttack();
});

document.addEventListener("pointerlockchange", () => {
  pointerLocked = document.pointerLockElement === canvas;
  document.body.style.cursor = pointerLocked ? "none" : "default";
});

document.addEventListener("mousemove", (e) => {
  if (!pointerLocked || gamePaused || !gameActive || isMobile) return;
  yaw -= e.movementX * 0.002 * mouseSensitivity;
  pitch -= e.movementY * 0.002 * mouseSensitivity * (invertY ? -1 : 1);
  pitch = Math.max(-1.2, Math.min(1.2, pitch));
});

window.addEventListener("resize", () => {
  if (!camera || !renderer) return;
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

/* ============================================================
   UI BINDINGS
   ============================================================ */
document.querySelectorAll("#difficultyRow .menu-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const diff = btn.dataset.diff;
    if (!unlockedDifficulties.includes(diff)) return;
    document.querySelectorAll("#difficultyRow .menu-btn").forEach((b) => b.classList.remove("active-mode"));
    btn.classList.add("active-mode");
    currentDifficulty = diff;
    diffConfig = DIFFICULTIES[diff];
    updateStatsUI();
  });
});

document.getElementById("startGameBtn").addEventListener("click", () => {
  const saveData = loadSave();
  if (saveData && confirm("Continue from saved game?")) { startGame(saveData); return; }
  startGame();
});

document.getElementById("continueBtn").addEventListener("click", () => {
  const saveData = loadSave();
  if (saveData) startGame(saveData);
  else alert("No saved game found.");
});

document.getElementById("retryBtn").addEventListener("click", restartGame);
document.getElementById("nextBtn").addEventListener("click", nextLevel);
document.getElementById("resumeBtn").addEventListener("click", () => { if (gamePaused) togglePause(); });
document.getElementById("saveBtn").addEventListener("click", () => { if (gameActive) saveGame(); });
document.getElementById("quitToMenuBtn").addEventListener("click", goToMenu);

document.querySelectorAll(".shop-tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    currentShopTab = tab.dataset.tab;
    renderShop(currentShopTab);
  });
});

document.getElementById("shopMenuBtn").addEventListener("click", () => {
  currentShopTab = "weapons";
  renderShop("weapons");
  document.getElementById("shopMenu").style.display = "flex";
});

document.getElementById("shopFromPauseBtn").addEventListener("click", () => {
  currentShopTab = "weapons";
  renderShop("weapons");
  document.getElementById("pauseMenu").style.display = "none";
  document.getElementById("shopMenu").style.display = "flex";
});

document.getElementById("shopClose").addEventListener("click", () => {
  document.getElementById("shopMenu").style.display = "none";
  if (gameActive && gamePaused) document.getElementById("pauseMenu").style.display = "flex";
  const mv = document.getElementById("moneyVal");
  if (mv) mv.textContent = money;
});

document.getElementById("statsMenuBtn").addEventListener("click", () => {
  updateStatsUI();
  document.getElementById("statsPanel").style.display = "flex";
});

document.getElementById("statsFromPauseBtn").addEventListener("click", () => {
  updateStatsUI();
  document.getElementById("pauseMenu").style.display = "none";
  document.getElementById("statsPanel").style.display = "flex";
});

document.getElementById("statsClose").addEventListener("click", () => {
  document.getElementById("statsPanel").style.display = "none";
  if (gameActive && gamePaused) document.getElementById("pauseMenu").style.display = "flex";
});

document.getElementById("settingsMenuBtn").addEventListener("click", () => {
  document.getElementById("settingsMenu").style.display = "flex";
});

document.getElementById("settingsFromPauseBtn").addEventListener("click", () => {
  document.getElementById("pauseMenu").style.display = "none";
  document.getElementById("settingsMenu").style.display = "flex";
});

document.getElementById("settingsClose").addEventListener("click", () => {
  document.getElementById("settingsMenu").style.display = "none";
  if (gameActive && gamePaused) document.getElementById("pauseMenu").style.display = "flex";
});

document.getElementById("sensitivitySlider").addEventListener("input", (e) => {
  mouseSensitivity = parseFloat(e.target.value);
  document.getElementById("sensitivityValue").textContent = mouseSensitivity.toFixed(1);
});

document.getElementById("invertToggle").addEventListener("click", () => {
  invertY = !invertY;
  document.getElementById("invertToggle").textContent = invertY ? "ON" : "OFF";
  document.getElementById("invertToggle").classList.toggle("active", invertY);
});

document.getElementById("shakeToggle").addEventListener("click", () => {
  screenShakeEnabled = !screenShakeEnabled;
  document.getElementById("shakeToggle").textContent = screenShakeEnabled ? "ON" : "OFF";
  document.getElementById("shakeToggle").classList.toggle("active", screenShakeEnabled);
});

const fovSlider = document.getElementById("fovSlider");
const fovValue = document.getElementById("fovValue");
if (fovSlider && fovValue) {
  fovSlider.addEventListener("input", (e) => {
    const v = parseFloat(e.target.value);
    fovValue.textContent = v;
    currentFov = v;
    if (camera) { camera.fov = v; camera.updateProjectionMatrix(); }
  });
}

/* ============================================================
   INIT
   ============================================================ */
particleSystem = new ParticleSystem();

initMobile();

const hasSave = loadSave() !== null;
const contBtn = document.getElementById("continueBtn");
if (contBtn) contBtn.style.display = hasSave ? "block" : "none";

checkDifficultyUnlocks();
initRenderer();
initMinimap();
renderShop("weapons");
animate();

/* Single-line banner; set DEBUG to true to see full info */
const DEBUG = false;
if (DEBUG) {
  console.log("%cBUNKER-9 :: DELIRIUM SWEEP", "color:#f0b060;font-weight:bold;font-size:14px");
  console.log("Map types:", Object.keys(MAP_TYPES).join(", "));
  console.log("Weapons:", WEAPONS.length);
  console.log("Enemy types:", enemyTypes.map((e) => e.id).join(", "));
  console.log("Grenade: G key, 30s cooldown, 50% horde chance");
  console.log("Controls: WASD | Mouse | LMB | RMB | R F G C Q | ESC");
  console.log("Mobile supported");
}
