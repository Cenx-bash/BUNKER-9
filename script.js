function() {
            "use strict";

            // ---- AUDIO ----
            const AudioSys = (function() {
                let ctx = null;

                function ensure() { if (!ctx) ctx = new(window.AudioContext || window.webkitAudioContext)(); return ctx; }

                function beep(freq, dur, type, gainVal, sweepTo) {
                    try {
                        const c = ensure();
                        const osc = c.createOscillator();
                        const gain = c.createGain();
                        osc.type = type || 'square';
                        osc.frequency.setValueAtTime(freq, c.currentTime);
                        if (sweepTo) osc.frequency.exponentialRampToValueAtTime(sweepTo, c.currentTime + dur);
                        gain.gain.setValueAtTime(gainVal || 0.12, c.currentTime);
                        gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + dur);
                        osc.connect(gain);
                        gain.connect(c.destination);
                        osc.start();
                        osc.stop(c.currentTime + dur);
                    } catch (e) {}
                }
                return {
                    shoot() { beep(180, 0.08, 'square', 0.10, 70); },
                    hit() { beep(660, 0.07, 'square', 0.12, 400); },
                    hurt() { beep(100, 0.3, 'sawtooth', 0.15, 50); },
                    clear() { beep(440, 0.15, 'sine', 0.12, 880);
                        setTimeout(() => beep(660, 0.2, 'sine', 0.12, 1200), 150); },
                    death() { beep(250, 0.8, 'sawtooth', 0.18, 30); },
                    scare() { beep(800, 0.3, 'sawtooth', 0.15, 200);
                        setTimeout(() => beep(200, 0.4, 'sawtooth', 0.10, 50), 200); },
                    jump() { beep(120, 0.05, 'sine', 0.04, 200); },
                    boss() { beep(150, 0.5, 'sawtooth', 0.2, 60);
                        setTimeout(() => beep(200, 0.4, 'sawtooth', 0.15, 100), 300); },
                };
            })();

            // ---- DIFFICULTY ----
            const DIFFICULTIES = {
                easy: { enemyCount: 3, enemySpeed: 1.2, damagePerSec: 8, sanityDrain: 0.8, scoreMult: 0.8, moneyMult: 0.8,
                    health: 120, bossHealthMult: 1.0, bossDamageMult: 0.7 },
                medium: { enemyCount: 5, enemySpeed: 1.6, damagePerSec: 15, sanityDrain: 1.8, scoreMult: 1.0,
                    moneyMult: 1.0, health: 100, bossHealthMult: 1.5, bossDamageMult: 1.0 },
                hard: { enemyCount: 8, enemySpeed: 2.0, damagePerSec: 22, sanityDrain: 2.8, scoreMult: 1.3,
                    moneyMult: 1.3, health: 85, bossHealthMult: 2.0, bossDamageMult: 1.3 },
                extreme: { enemyCount: 11, enemySpeed: 2.4, damagePerSec: 30, sanityDrain: 3.8, scoreMult: 1.7,
                    moneyMult: 1.7, health: 70, bossHealthMult: 2.8, bossDamageMult: 1.7 },
                impossible: { enemyCount: 14, enemySpeed: 2.8, damagePerSec: 38, sanityDrain: 5.0, scoreMult: 2.2,
                    moneyMult: 2.2, health: 55, bossHealthMult: 3.5, bossDamageMult: 2.2 },
                hell: { enemyCount: 18, enemySpeed: 3.2, damagePerSec: 48, sanityDrain: 6.5, scoreMult: 3.0,
                    moneyMult: 3.0, health: 40, bossHealthMult: 4.5, bossDamageMult: 3.0 },
            };
            let currentDifficulty = 'medium';
            let diffConfig = DIFFICULTIES.medium;

            // ---- WEAPONS ----
            const WEAPONS = [
                { id: 'pistol', name: 'PISTOL', damage: 25, fireRate: 0.28, range: 30, price: 0, owned: true,
                equipped: true },
                { id: 'smg', name: 'SMG', damage: 20, fireRate: 0.10, range: 25, price: 300, owned: false,
                equipped: false },
                { id: 'shotgun', name: 'SHOTGUN', damage: 55, fireRate: 0.45, range: 18, price: 450, owned: false,
                    equipped: false },
                { id: 'rifle', name: 'RIFLE', damage: 42, fireRate: 0.16, range: 45, price: 600, owned: false,
                    equipped: false },
                { id: 'sniper', name: 'SNIPER', damage: 95, fireRate: 0.7, range: 60, price: 800, owned: false,
                    equipped: false },
                { id: 'rpg', name: 'RPG', damage: 150, fireRate: 1.2, range: 35, price: 1200, owned: false,
                    equipped: false },
                { id: 'minigun', name: 'MINIGUN', damage: 18, fireRate: 0.05, range: 22, price: 1000, owned: false,
                    equipped: false },
                { id: 'laser', name: 'LASER', damage: 60, fireRate: 0.12, range: 50, price: 750, owned: false,
                    equipped: false },
                { id: 'revolver', name: 'REVOLVER', damage: 80, fireRate: 0.5, range: 40, price: 650, owned: false,
                    equipped: false },
                { id: 'ak47', name: 'AK-47', damage: 45, fireRate: 0.12, range: 40, price: 900, owned: false,
                    equipped: false },
                { id: 'deagle', name: 'DEAGLE', damage: 85, fireRate: 0.4, range: 38, price: 700, owned: false,
                    equipped: false },
                { id: 'flamethrower', name: 'FLAMETHROWER', damage: 35, fireRate: 0.08, range: 15, price: 1100,
                    owned: false, equipped: false },
                { id: 'railgun', name: 'RAILGUN', damage: 200, fireRate: 1.0, range: 70, price: 2000, owned: false,
                    equipped: false },
            ];
            let currentWeapon = WEAPONS[0];
            let money = 0;
            let statPoints = 0;

            // ---- STATS SYSTEM ----
            const PLAYER_STATS = {
                health: { level: 0, cost: 2, max: 20, label: '❤️ HEALTH', bonus: 5 },
                damage: { level: 0, cost: 2, max: 20, label: '⚔️ DAMAGE', bonus: 3 },
                defense: { level: 0, cost: 2, max: 20, label: '🛡️ DEFENSE', bonus: 2 },
                speed: { level: 0, cost: 2, max: 20, label: '💨 SPEED', bonus: 0.05 },
                luck: { level: 0, cost: 3, max: 15, label: '🍀 LUCK', bonus: 0.01 },
            };
            let playerStatLevels = { health: 0, damage: 0, defense: 0, speed: 0, luck: 0 };

            function getStatBonus(stat) {
                return PLAYER_STATS[stat].bonus * playerStatLevels[stat];
            }

            function getMaxHealth() {
                return diffConfig.health + getStatBonus('health');
            }

            function getDamageBonus() {
                return getStatBonus('damage');
            }

            function getDefenseBonus() {
                return getStatBonus('defense');
            }

            function getSpeedBonus() {
                return 1 + getStatBonus('speed');
            }

            function getLuckBonus() {
                return getStatBonus('luck');
            }

            // ---- TOOLS ----
            const TOOLS = [
                { id: 'map_reveal', name: 'MAP REVEAL', price: 150, desc: 'Reveals minimap for 10s', owned: false },
                { id: 'health_pack', name: 'HEALTH PACK', price: 100, desc: 'Restore 30 HP', owned: false },
                { id: 'sanity_boost', name: 'SANITY BOOST', price: 120, desc: 'Restore 40 Sanity', owned: false },
                { id: 'speed_boost', name: 'SPEED BOOST', price: 200, desc: '+50% speed for 8s', owned: false },
                { id: 'shield', name: 'SHIELD', price: 250, desc: 'Absorb 50 damage', owned: false },
            ];
            let tools = JSON.parse(JSON.stringify(TOOLS));

            // ---- STATS TRACKING ----
            let stats = {
                totalScore: 0,
                highestLevel: 0,
                totalKills: 0,
                bossesDefeated: 0,
                totalMoney: 0,
                gamesPlayed: 0,
            };

            function updateStatsUI() {
                document.getElementById('statScore').textContent = stats.totalScore;
                document.getElementById('statLevel').textContent = stats.highestLevel;
                document.getElementById('statKills').textContent = stats.totalKills;
                document.getElementById('statBosses').textContent = stats.bossesDefeated;
                document.getElementById('statMoney').textContent = stats.totalMoney;
                document.getElementById('statGames').textContent = stats.gamesPlayed;
                document.getElementById('statWeapon').textContent = currentWeapon.name;
                document.getElementById('statDifficulty').textContent = currentDifficulty.toUpperCase();
            }

            // ---- SAVE SYSTEM ----
            function saveGame() {
                try {
                    const saveData = {
                        score: score,
                        level: level,
                        money: money,
                        health: health,
                        sanity: sanity,
                        difficulty: currentDifficulty,
                        weapons: WEAPONS.map(w => ({ id: w.id, owned: w.owned, equipped: w.equipped })),
                        weaponIndex: WEAPONS.indexOf(currentWeapon),
                        tools: tools.map(t => ({ id: t.id, owned: t.owned })),
                        shield: shieldAmount,
                        stats: stats,
                        statPoints: statPoints,
                        playerStats: playerStatLevels,
                        timestamp: Date.now()
                    };
                    localStorage.setItem('bunker9_save', JSON.stringify(saveData));
                    document.getElementById('saveNotify').style.display = 'block';
                    setTimeout(() => { document.getElementById('saveNotify').style.display = 'none'; }, 1500);
                    return true;
                } catch (e) { return false; }
            }

            function loadSave() {
                try {
                    const raw = localStorage.getItem('bunker9_save');
                    if (!raw) return null;
                    const data = JSON.parse(raw);
                    if (typeof data.score !== 'number' || typeof data.level !== 'number') return null;
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
                if (data.playerStats) {
                    playerStatLevels = data.playerStats;
                }
                if (data.stats) {
                    stats = data.stats;
                }
                if (data.difficulty && DIFFICULTIES[data.difficulty]) {
                    currentDifficulty = data.difficulty;
                    diffConfig = DIFFICULTIES[currentDifficulty];
                    document.querySelectorAll('#difficultyRow .menu-btn').forEach(b => {
                        b.classList.toggle('active-mode', b.dataset.diff === currentDifficulty);
                    });
                }
                if (data.weapons) {
                    data.weapons.forEach(saveW => {
                        const w = WEAPONS.find(w => w.id === saveW.id);
                        if (w) { w.owned = saveW.owned;
                            w.equipped = saveW.equipped; }
                    });
                    if (data.weaponIndex !== undefined && data.weaponIndex >= 0 && data.weaponIndex < WEAPONS.length) {
                        const w = WEAPONS[data.weaponIndex];
                        if (w && w.owned) { currentWeapon = w;
                            WEAPONS.forEach(we => we.equipped = (we === w)); }
                    }
                    const equipped = WEAPONS.find(w => w.equipped);
                    if (!equipped) {
                        const firstOwned = WEAPONS.find(w => w.owned);
                        if (firstOwned) { firstOwned.equipped = true;
                            currentWeapon = firstOwned; }
                    }
                }
                if (data.tools) {
                    data.tools.forEach(saveT => {
                        const t = tools.find(t => t.id === saveT.id);
                        if (t) t.owned = saveT.owned;
                    });
                }
                document.getElementById('scoreVal').textContent = score;
                document.getElementById('moneyVal').textContent = money;
                document.getElementById('levelVal').textContent = level;
                document.getElementById('sanityVal').textContent = Math.round(sanity) + '%';
                document.getElementById('sanityBar').querySelector('span').style.width = sanity + '%';
                document.getElementById('shieldVal').textContent = Math.round(shieldAmount);
                document.getElementById('shieldDisplay').style.opacity = shieldAmount > 0 ? 1 : 0;
                document.getElementById('statPointsVal').textContent = statPoints;
                renderHealthBar();
                updateStatsUI();
                return true;
            }

            // ---- MAZE GEN ----
            const CELL = 6;
            let cols, rows, grid, wallSegs, exitCell;
            let scene, camera, renderer, clock;
            let flashlight, flashlightOn = true;
            let wallMeshes = [];
            let enemies = [];
            let obstacles = [];
            let bossEnemy = null;
            let isBossLevel = false;
            let score = 0,
                level = 1,
                health = 100,
                sanity = 100;
            let shieldAmount = 0;
            let ammoReady = true,
                shootCooldown = 0;
            let gameActive = false,
                gamePaused = false;
            let yaw = 0,
                pitch = 0;
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

            const canvas = document.getElementById('gameCanvas');

            function initRenderer() {
                renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
                renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
                renderer.setSize(window.innerWidth, window.innerHeight);
                renderer.shadowMap.enabled = true;
                renderer.shadowMap.type = THREE.PCFSoftShadowMap;
                renderer.shadowMap.bias = 0.0001;
                renderer.toneMapping = THREE.ACESFilmicToneMapping;
                renderer.toneMappingExposure = 1.2;
            }

            // ---- TEXTURE GENERATORS ----
            function createTexture(width, height, color, pattern) {
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.fillStyle = color;
                ctx.fillRect(0, 0, width, height);
                if (pattern) pattern(ctx, width, height);
                const texture = new THREE.CanvasTexture(canvas);
                texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
                texture.repeat.set(2, 2);
                return texture;
            }

            function createWallTexture() {
                return createTexture(256, 256, '#3a3530', (ctx, w, h) => {
                    for (let i = 0; i < 40; i++) {
                        ctx.fillStyle = `rgba(80,70,60,${0.1 + Math.random()*0.15})`;
                        const x = Math.random() * w,
                            y = Math.random() * h;
                        ctx.fillRect(x, y, 2 + Math.random() * 8, 2 + Math.random() * 8);
                    }
                    for (let i = 0; i < 15; i++) {
                        ctx.strokeStyle = `rgba(60,50,40,${0.1 + Math.random()*0.1})`;
                        ctx.lineWidth = 0.5;
                        ctx.beginPath();
                        ctx.moveTo(Math.random() * w, Math.random() * h);
                        ctx.lineTo(Math.random() * w, Math.random() * h);
                        ctx.stroke();
                    }
                    // Horizontal lines
                    ctx.strokeStyle = 'rgba(50,45,40,0.08)';
                    ctx.lineWidth = 1;
                    for (let i = 0; i < 20; i++) {
                        ctx.beginPath();
                        ctx.moveTo(0, i * 12 + 5);
                        ctx.lineTo(w, i * 12 + 5);
                        ctx.stroke();
                    }
                });
            }

            function createFloorTexture() {
                return createTexture(256, 256, '#1a1815', (ctx, w, h) => {
                    for (let i = 0; i < 60; i++) {
                        ctx.fillStyle = `rgba(40,35,30,${0.1 + Math.random()*0.2})`;
                        const x = Math.random() * w,
                            y = Math.random() * h;
                        const size = 1 + Math.random() * 4;
                        ctx.fillRect(x, y, size, size);
                    }
                    // Grid lines
                    ctx.strokeStyle = 'rgba(50,45,40,0.05)';
                    ctx.lineWidth = 0.5;
                    for (let i = 0; i < 30; i++) {
                        ctx.beginPath();
                        ctx.moveTo(i * 8, 0);
                        ctx.lineTo(i * 8, h);
                        ctx.stroke();
                        ctx.beginPath();
                        ctx.moveTo(0, i * 8);
                        ctx.lineTo(w, i * 8);
                        ctx.stroke();
                    }
                });
            }

            function createMonsterTexture(baseColor, emissiveColor, detail) {
                return createTexture(128, 128, baseColor, (ctx, w, h) => {
                    // Veins / organic pattern
                    for (let i = 0; i < 30; i++) {
                        ctx.strokeStyle = `rgba(${emissiveColor},${0.2 + Math.random()*0.3})`;
                        ctx.lineWidth = 1 + Math.random() * 2;
                        ctx.beginPath();
                        let x = Math.random() * w,
                            y = Math.random() * h;
                        ctx.moveTo(x, y);
                        for (let j = 0; j < 5; j++) {
                            x += (Math.random() - 0.5) * 20;
                            y += (Math.random() - 0.5) * 20;
                            ctx.lineTo(x, y);
                        }
                        ctx.stroke();
                    }
                    // Spots
                    for (let i = 0; i < 20; i++) {
                        ctx.fillStyle = `rgba(0,0,0,${0.1 + Math.random()*0.2})`;
                        ctx.beginPath();
                        ctx.arc(Math.random() * w, Math.random() * h, 2 + Math.random() * 6, 0, Math.PI * 2);
                        ctx.fill();
                    }
                    // Glow spots
                    for (let i = 0; i < 8; i++) {
                        ctx.fillStyle = `rgba(${emissiveColor},${0.2 + Math.random()*0.3})`;
                        ctx.beginPath();
                        ctx.arc(Math.random() * w, Math.random() * h, 3 + Math.random() * 8, 0, Math.PI * 2);
                        ctx.fill();
                    }
                });
            }

            function createBossTexture() {
                return createTexture(256, 256, '#442222', (ctx, w, h) => {
                    // Boss specific - cracked armor pattern
                    for (let i = 0; i < 50; i++) {
                        ctx.strokeStyle = `rgba(200,50,50,${0.2 + Math.random()*0.3})`;
                        ctx.lineWidth = 1 + Math.random() * 3;
                        ctx.beginPath();
                        let x = Math.random() * w,
                            y = Math.random() * h;
                        ctx.moveTo(x, y);
                        for (let j = 0; j < 8; j++) {
                            x += (Math.random() - 0.5) * 30;
                            y += (Math.random() - 0.5) * 30;
                            ctx.lineTo(x, y);
                        }
                        ctx.stroke();
                    }
                    // Runes
                    for (let i = 0; i < 12; i++) {
                        ctx.fillStyle = `rgba(255,50,50,${0.3 + Math.random()*0.4})`;
                        ctx.font = `${20 + Math.random()*30}px serif`;
                        ctx.fillText(['ᚠ', 'ᚢ', 'ᚦ', 'ᚨ', 'ᚱ', 'ᚲ', 'ᚷ', 'ᚹ'][i % 8], Math.random() * w, Math.random() *
                        h);
                    }
                });
            }

            function createGunTexture() {
                return createTexture(128, 128, '#2a2218', (ctx, w, h) => {
                    // Metal scratches
                    for (let i = 0; i < 20; i++) {
                        ctx.strokeStyle = `rgba(80,70,60,${0.1 + Math.random()*0.15})`;
                        ctx.lineWidth = 0.5;
                        ctx.beginPath();
                        ctx.moveTo(Math.random() * w, Math.random() * h);
                        ctx.lineTo(Math.random() * w, Math.random() * h);
                        ctx.stroke();
                    }
                    // Rivets
                    for (let i = 0; i < 15; i++) {
                        ctx.fillStyle = `rgba(60,55,50,${0.3 + Math.random()*0.3})`;
                        ctx.beginPath();
                        ctx.arc(Math.random() * w, Math.random() * h, 1 + Math.random() * 2, 0, Math.PI * 2);
                        ctx.fill();
                    }
                });
            }

            function buildLevel(sector) {
                const base = 8;
                cols = base + Math.min(sector, 6);
                rows = base + Math.min(sector, 6);

                isBossLevel = (sector % 5 === 0 && sector > 0);
                levelClearedForStat = false;

                grid = generateMaze(cols, rows);
                wallSegs = buildWallSegments(grid, cols, rows, CELL);
                exitCell = { i: cols - 1, j: rows - 1 };

                scene = new THREE.Scene();
                scene.background = new THREE.Color(0x020100);
                scene.fog = new THREE.FogExp2(0x020100, 0.018);

                camera = new THREE.PerspectiveCamera(72, window.innerWidth / window.innerHeight, 0.1, 180);
                camera.position.set(CELL * 0.5, playerHeight, CELL * 0.5);

                // ---- AMBIENT LIGHT ----
                const ambientLight = new THREE.AmbientLight(0x2a1a0a, 0.3);
                scene.add(ambientLight);

                // ---- MAIN DIRECTIONAL LIGHT ----
                const dirLight = new THREE.DirectionalLight(0xff8844, 0.4);
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

                // ---- FILL LIGHT ----
                const fillLight = new THREE.DirectionalLight(0x4466ff, 0.15);
                fillLight.position.set(-10, 10, -10);
                scene.add(fillLight);

                // ---- FLASHLIGHT ----
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

                // ---- GUN MODEL with texture ----
                gunGroup = new THREE.Group();
                const gunTexture = createGunTexture();
                const gunMat = new THREE.MeshStandardMaterial({
                    map: gunTexture,
                    roughness: 0.7,
                    metalness: 0.4,
                    color: 0x3a3228
                });

                const body = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.10, 0.5), gunMat);
                body.position.set(0.20, -0.20, -0.45);
                const barrel = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.04, 0.3), gunMat);
                barrel.position.set(0.20, -0.17, -0.80);
                const grip = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.14, 0.08), gunMat);
                grip.position.set(0.18, -0.34, -0.40);
                // Flashlight attachment
                const lightMat = new THREE.MeshStandardMaterial({ color: 0x888888, emissive: 0xffaa44,
                    emissiveIntensity: 0.4, roughness: 0.3, metalness: 0.6 });
                const lightAttach = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.08, 8), lightMat);
                lightAttach.position.set(0.22, -0.10, -0.72);
                lightAttach.rotation.x = Math.PI / 2;
                gunGroup.add(body, barrel, grip, lightAttach);
                camera.add(gunGroup);

                // ---- WALLS with texture ----
                const wallTexture = createWallTexture();
                const wallMat = new THREE.MeshStandardMaterial({
                    map: wallTexture,
                    roughness: 0.95,
                    metalness: 0.0,
                    color: 0x4a4540
                });

                const floorTexture = createFloorTexture();
                const floorMat = new THREE.MeshStandardMaterial({
                    map: floorTexture,
                    roughness: 1.0,
                    metalness: 0.0,
                    color: 0x2a2520
                });

                const ceilMat = new THREE.MeshStandardMaterial({
                    color: 0x0a0908,
                    roughness: 1.0,
                    metalness: 0.0
                });

                const exitMat = new THREE.MeshStandardMaterial({
                    color: 0x0d3a1a,
                    emissive: 0x2fbf4a,
                    emissiveIntensity: 0.8,
                    roughness: 0.3,
                    metalness: 0.5
                });

                // ---- FLOOR ----
                const floor = new THREE.Mesh(new THREE.PlaneGeometry(cols * CELL, rows * CELL), floorMat);
                floor.rotation.x = -Math.PI / 2;
                floor.position.set(cols * CELL / 2, 0, rows * CELL / 2);
                floor.receiveShadow = true;
                scene.add(floor);

                // ---- CEILING ----
                const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(cols * CELL, rows * CELL), ceilMat);
                ceiling.rotation.x = Math.PI / 2;
                ceiling.position.set(cols * CELL / 2, 3.4, rows * CELL / 2);
                scene.add(ceiling);

                // ---- WALLS ----
                wallMeshes = [];
                const wallHeight = 3.4,
                    wallThick = 0.3;
                wallSegs.forEach(s => {
                    const len = Math.hypot(s.x2 - s.x1, s.z2 - s.z1);
                    const geo = new THREE.BoxGeometry(len + wallThick, wallHeight, wallThick);
                    const mesh = new THREE.Mesh(geo, wallMat);
                    const midX = (s.x1 + s.x2) / 2,
                        midZ = (s.z1 + s.z2) / 2;
                    mesh.position.set(midX, wallHeight / 2, midZ);
                    if (Math.abs(s.x2 - s.x1) < 0.01) mesh.rotation.y = Math.PI / 2;
                    mesh.userData.isWall = true;
                    mesh.castShadow = true;
                    mesh.receiveShadow = true;
                    scene.add(mesh);
                    wallMeshes.push(mesh);
                });

                // ---- EXIT PAD ----
                const pad = new THREE.Mesh(new THREE.BoxGeometry(CELL * 0.7, 0.1, CELL * 0.7), exitMat);
                pad.position.set(exitCell.i * CELL + CELL / 2, 0.06, exitCell.j * CELL + CELL / 2);
                pad.receiveShadow = true;
                scene.add(pad);
                const padLight = new THREE.PointLight(0x39ff6a, 3, 12, 2);
                padLight.position.set(pad.position.x, 1.5, pad.position.z);
                scene.add(padLight);

                // ---- AMBIENT LAMPS (flickering) ----
                for (let n = 0; n < Math.min(cols + 2, rows + 2); n++) {
                    const i = Math.floor(Math.random() * cols),
                        j = Math.floor(Math.random() * rows);
                    const lamp = new THREE.PointLight(0xff8040, 0.6, 8, 2);
                    lamp.position.set(i * CELL + CELL / 2, 2.6, j * CELL + CELL / 2);
                    lamp.userData.flicker = Math.random() * 10;
                    scene.add(lamp);
                    if (!scene.userData.lamps) scene.userData.lamps = [];
                    scene.userData.lamps.push(lamp);

                    // Lamp fixture
                    const fixtureMat = new THREE.MeshStandardMaterial({ color: 0x333030, roughness: 0.8 });
                    const fixture = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, 0.15, 6), fixtureMat);
                    fixture.position.set(i * CELL + CELL / 2, 2.7, j * CELL + CELL / 2);
                    scene.add(fixture);
                }

                // ---- OBSTACLES (crates, barrels with textures) ----
                obstacles = [];
                const crateTexture = createTexture(64, 64, '#4a3a2a', (ctx, w, h) => {
                    for (let i = 0; i < 10; i++) {
                        ctx.strokeStyle = `rgba(60,50,40,${0.2 + Math.random()*0.3})`;
                        ctx.lineWidth = 1;
                        ctx.strokeRect(Math.random() * w, Math.random() * h, 5 + Math.random() * 15, 5 + Math.random() *
                            15);
                    }
                });
                const crateMat = new THREE.MeshStandardMaterial({ map: crateTexture, roughness: 0.9, metalness: 0.0 });
                const barrelMat = new THREE.MeshStandardMaterial({ color: 0x3a3a3a, roughness: 0.8, metalness: 0.3 });

                const obstacleCount = Math.min(4 + sector * 2, 20);
                for (let n = 0; n < obstacleCount; n++) {
                    let placed = false;
                    let attempts = 0;
                    while (!placed && attempts < 50) {
                        attempts++;
                        const i = Math.floor(Math.random() * cols),
                            j = Math.floor(Math.random() * rows);
                        const dist = Math.abs(i - 0) + Math.abs(j - 0);
                        if (dist < 4) continue;
                        if (i === exitCell.i && j === exitCell.j) continue;
                        const x = i * CELL + CELL / 2 + (Math.random() - 0.5) * CELL * 0.4;
                        const z = j * CELL + CELL / 2 + (Math.random() - 0.5) * CELL * 0.4;
                        let tooClose = false;
                        for (const e of enemies) {
                            if (Math.abs(e.position.x - x) < 1.5 && Math.abs(e.position.z - z) < 1.5) tooClose = true;
                        }
                        if (tooClose) continue;
                        const isCrate = Math.random() > 0.5;
                        let mesh;
                        if (isCrate) {
                            const size = 0.4 + Math.random() * 0.5;
                            const height = 0.4 + Math.random() * 0.5;
                            mesh = new THREE.Mesh(new THREE.BoxGeometry(size, height, size), crateMat);
                        } else {
                            const radius = 0.25 + Math.random() * 0.2;
                            const height = 0.4 + Math.random() * 0.3;
                            mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius * 0.8, height, 8), barrelMat);
                        }
                        mesh.position.set(x, (mesh.geometry.parameters?.height || 0.5) / 2, z);
                        mesh.castShadow = true;
                        mesh.receiveShadow = true;
                        mesh.userData.isObstacle = true;
                        mesh.userData.radius = 0.4;
                        scene.add(mesh);
                        obstacles.push(mesh);
                        placed = true;
                    }
                }

                // ---- ENEMIES with advanced textures ----
                enemies = [];
                bossEnemy = null;

                const enemyTypes = [
                    { id: 'grunt', name: 'Grunt', color: '#441111', emissive: '200,40,40', size: 0.7, height: 1.8,
                        speedMult: 1.0, hpMult: 1.0, damageMult: 1.0, attackRange: 1.3, attackCooldown: 1.0 },
                    { id: 'fast', name: 'Runner', color: '#224488', emissive: '70,140,255', size: 0.6, height: 1.6,
                        speedMult: 1.6, hpMult: 0.7, damageMult: 0.8, attackRange: 1.5, attackCooldown: 0.7 },
                    { id: 'tank', name: 'Tank', color: '#444422', emissive: '140,180,70', size: 0.9, height: 2.0,
                        speedMult: 0.7, hpMult: 2.5, damageMult: 1.3, attackRange: 1.5, attackCooldown: 1.5 },
                    { id: 'brute', name: 'Brute', color: '#442222', emissive: '200,70,70', size: 1.0, height: 2.2,
                        speedMult: 0.8, hpMult: 3.0, damageMult: 1.5, attackRange: 1.8, attackCooldown: 1.8 },
                    { id: 'spitter', name: 'Spitter', color: '#224422', emissive: '70,255,70', size: 0.6, height: 1.5,
                        speedMult: 1.2, hpMult: 0.8, damageMult: 1.2, attackRange: 3.0, attackCooldown: 0.9 },
                ];

                if (isBossLevel) {
                    // ---- BOSS with advanced texture ----
                    const bossTexture = createBossTexture();
                    const bossMat = new THREE.MeshStandardMaterial({
                        map: bossTexture,
                        emissive: new THREE.Color(0xff3333),
                        emissiveIntensity: 0.5,
                        roughness: 0.3,
                        metalness: 0.6
                    });
                    const boss = new THREE.Mesh(new THREE.BoxGeometry(1.5, 3.0, 1.5), bossMat);
                    const centerI = Math.floor(cols / 2),
                        centerJ = Math.floor(rows / 2);
                    boss.position.set(centerI * CELL + CELL / 2, 1.5, centerJ * CELL + CELL / 2);
                    boss.userData.isEnemy = true;
                    boss.userData.isBoss = true;
                    boss.userData.type = 'boss';
                    boss.userData.cell = { i: centerI, j: centerJ };
                    boss.userData.path = null;
                    boss.userData.repathTimer = 0.2;
                    boss.userData.speed = diffConfig.enemySpeed * 0.6;
                    boss.userData.maxHp = Math.round((50 + level * 5) * diffConfig.bossHealthMult);
                    boss.userData.hp = boss.userData.maxHp;
                    boss.userData.scareTimer = 0;
                    boss.userData.height = 3.0;
                    boss.userData.attackRange = 2.0;
                    boss.userData.attackCooldown = 1.2;
                    boss.userData.attackTimer = 0;
                    boss.userData.damageMult = diffConfig.bossDamageMult;
                    boss.castShadow = true;
                    boss.receiveShadow = true;
                    // Boss aura
                    const glowLight = new THREE.PointLight(0xff3333, 2, 10);
                    glowLight.position.set(0, 1.5, 0);
                    boss.add(glowLight);
                    // Crown/spikes
                    const spikeMat = new THREE.MeshStandardMaterial({ color: 0x662222, emissive: 0xff4444,
                        emissiveIntensity: 0.3 });
                    for (let i = 0; i < 5; i++) {
                        const angle = (i / 5) * Math.PI * 2;
                        const spike = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.3, 4), spikeMat);
                        spike.position.set(Math.cos(angle) * 0.8, 1.7, Math.sin(angle) * 0.8);
                        spike.rotation.x = Math.PI / 2;
                        spike.rotation.z = angle;
                        boss.add(spike);
                    }
                    scene.add(boss);
                    bossEnemy = boss;
                    enemies.push(boss);

                    const indicator = document.getElementById('bossIndicator');
                    indicator.style.opacity = 1;
                    setTimeout(() => { indicator.style.opacity = 0; }, 3000);
                    AudioSys.boss();

                    const regularCount = Math.min(diffConfig.enemyCount - 1, 4);
                    spawnRegularEnemies(regularCount, sector);
                } else {
                    const enemyCount = Math.min(diffConfig.enemyCount + Math.floor(sector * 0.5), 22);
                    spawnRegularEnemies(enemyCount, sector);
                }

                document.getElementById('levelVal').textContent = sector;
                updateEnemyCount();
                if (!savedLevelLoaded) {
                    sanity = 100;
                    document.getElementById('sanityVal').textContent = '100%';
                    document.getElementById('sanityBar').querySelector('span').style.width = '100%';
                    health = getMaxHealth();
                }
                savedLevelLoaded = false;
                renderHealthBar();
                playerHeight = 1.7;
                velocityY = 0;
                isGrounded = true;
                document.getElementById('clearTitle').textContent = isBossLevel ? '⚔ BOSS DEFEATED ⚔' :
                'SECTOR PURGED';
                document.getElementById('shieldVal').textContent = Math.round(shieldAmount);
                document.getElementById('shieldDisplay').style.opacity = shieldAmount > 0 ? 1 : 0;
                document.getElementById('statPointsVal').textContent = statPoints;
            }

            function spawnRegularEnemies(count, sector) {
                const baseHealth = 1 + Math.floor(sector * 0.4);
                const types = ['grunt', 'fast', 'tank', 'brute', 'spitter'];

                for (let n = 0; n < count; n++) {
                    let placed = false;
                    let attempts = 0;
                    while (!placed && attempts < 80) {
                        attempts++;
                        const i = Math.floor(Math.random() * cols),
                            j = Math.floor(Math.random() * rows);
                        const dist = Math.abs(i - 0) + Math.abs(j - 0);
                        if (dist < 4) continue;
                        if (i === exitCell.i && j === exitCell.j) continue;
                        if (bossEnemy && Math.abs(i - Math.floor(cols / 2)) < 3 && Math.abs(j - Math.floor(rows / 2)) <
                            3) continue;

                        const typeIdx = Math.min(Math.floor((sector - 1) / 2), types.length - 1);
                        const typeId = types[typeIdx];
                        const typeDef = enemyTypes.find(t => t.id === typeId) || enemyTypes[0];

                        const tex = createMonsterTexture(typeDef.color, typeDef.emissive, true);
                        const mat = new THREE.MeshStandardMaterial({
                            map: tex,
                            emissive: new THREE.Color(`rgb(${typeDef.emissive})`),
                            emissiveIntensity: 0.3,
                            roughness: 0.6,
                            metalness: 0.2
                        });
                        const mesh = new THREE.Mesh(new THREE.BoxGeometry(typeDef.size, typeDef.height, typeDef.size),
                        mat);
                        mesh.position.set(i * CELL + CELL / 2, typeDef.height / 2, j * CELL + CELL / 2);
                        mesh.userData.isEnemy = true;
                        mesh.userData.isBoss = false;
                        mesh.userData.type = typeDef.id;
                        mesh.userData.cell = { i, j };
                        mesh.userData.path = null;
                        mesh.userData.repathTimer = 0.2 + Math.random() * 0.3;
                        mesh.userData.speed = diffConfig.enemySpeed * typeDef.speedMult + (Math.random() * 0.2 - 0.1);
                        mesh.userData.maxHp = Math.round((baseHealth + Math.random() * 2) * typeDef.hpMult);
                        mesh.userData.hp = mesh.userData.maxHp;
                        mesh.userData.scareTimer = 0;
                        mesh.userData.height = typeDef.height;
                        mesh.userData.attackRange = typeDef.attackRange;
                        mesh.userData.attackCooldown = typeDef.attackCooldown;
                        mesh.userData.attackTimer = Math.random() * typeDef.attackCooldown;
                        mesh.userData.damageMult = typeDef.damageMult;
                        mesh.castShadow = true;
                        mesh.receiveShadow = true;
                        // Add glowing eyes
                        const eyeMat = new THREE.MeshStandardMaterial({
                            color: new THREE.Color(`rgb(${typeDef.emissive})`),
                            emissive: new THREE.Color(`rgb(${typeDef.emissive})`),
                            emissiveIntensity: 0.8
                        });
                        const eye1 = new THREE.Mesh(new THREE.SphereGeometry(0.06, 6, 6), eyeMat);
                        eye1.position.set(0.12, 0.15, -typeDef.size / 2 - 0.01);
                        const eye2 = new THREE.Mesh(new THREE.SphereGeometry(0.06, 6, 6), eyeMat);
                        eye2.position.set(-0.12, 0.15, -typeDef.size / 2 - 0.01);
                        mesh.add(eye1, eye2);
                        scene.add(mesh);
                        enemies.push(mesh);
                        placed = true;
                    }
                }
            }

            function generateMaze(cols, rows) {
                const grid = [];
                for (let i = 0; i < cols; i++) {
                    grid.push([]);
                    for (let j = 0; j < rows; j++) grid[i].push({ top: true, right: true, bottom: true, left: true,
                        visited: false });
                }
                const stack = [];
                let current = { i: 0, j: 0 };
                grid[0][0].visited = true;
                stack.push(current);
                const opposite = { top: 'bottom', bottom: 'top', left: 'right', right: 'left' };

                function neighbors(cell) {
                    const { i, j } = cell;
                    const list = [];
                    if (j > 0 && !grid[i][j - 1].visited) list.push({ i, j: j - 1, dir: 'top' });
                    if (i < cols - 1 && !grid[i + 1][j].visited) list.push({ i: i + 1, j, dir: 'right' });
                    if (j < rows - 1 && !grid[i][j + 1].visited) list.push({ i, j: j + 1, dir: 'bottom' });
                    if (i > 0 && !grid[i - 1][j].visited) list.push({ i: i - 1, j, dir: 'left' });
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
                        const x0 = i * cellSize,
                            z0 = j * cellSize,
                            x1 = x0 + cellSize,
                            z1 = z0 + cellSize;
                        if (j === 0 && cell.top) segs.push({ x1: x0, z1: z0, x2: x1, z2: z0 });
                        if (cell.bottom) segs.push({ x1: x0, z1: z1, x2: x1, z2: z1 });
                        if (i === 0 && cell.left) segs.push({ x1: x0, z1: z0, x2: x0, z2: z1 });
                        if (cell.right) segs.push({ x1: x1, z1: z0, x2: x1, z2: z1 });
                    }
                }
                return segs;
            }

            function resolveCollision(pos, radius, segments, obstaclesList) {
                for (let pass = 0; pass < 4; pass++) {
                    for (const s of segments) {
                        const dx = s.x2 - s.x1,
                            dz = s.z2 - s.z1;
                        const len2 = dx * dx + dz * dz || 1;
                        let t = ((pos.x - s.x1) * dx + (pos.z - s.z1) * dz) / len2;
                        t = Math.max(0, Math.min(1, t));
                        const cx = s.x1 + t * dx,
                            cz = s.z1 + t * dz;
                        const distX = pos.x - cx,
                            distZ = pos.z - cz;
                        const dist = Math.sqrt(distX * distX + distZ * distZ);
                        if (dist < radius && dist > 0.0001) {
                            const push = (radius - dist) / dist;
                            pos.x += distX * push;
                            pos.z += distZ * push;
                        }
                    }
                    for (const obs of obstaclesList) {
                        const dx = pos.x - obs.position.x;
                        const dz = pos.z - obs.position.z;
                        const dist = Math.sqrt(dx * dx + dz * dz);
                        const obsRadius = obs.userData.radius || 0.5;
                        if (dist < radius + obsRadius) {
                            const push = (radius + obsRadius - dist) / (dist || 0.001);
                            pos.x += dx * push;
                            pos.z += dz * push;
                        }
                    }
                }
                return pos;
            }

            function bfsPath(grid, cols, rows, start, goal) {
                const key = (i, j) => i + ',' + j;
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
                        if (!visited.has(k)) { visited.add(k);
                            prev[k] = cur;
                            queue.push(n); }
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

            // ---- INPUT ----
            document.addEventListener('keydown', e => {
                keys[e.code] = true;
                if (e.code === 'KeyR') toggleFlashlight();
                if (e.code === 'KeyF') tryFlare();
                if (e.code === 'Space' && gameActive && !gamePaused) tryJump();
                if ((e.code === 'Escape' || e.code === 'KeyP') && gameActive && !gamePaused) {
                    togglePause();
                }
            });
            document.addEventListener('keyup', e => { keys[e.code] = false; });
            canvas.addEventListener('click', () => {
                if (gameActive && !pointerLocked && !gamePaused) canvas.requestPointerLock();
                else if (gameActive && pointerLocked && !gamePaused) tryShoot();
            });
            document.addEventListener('pointerlockchange', () => {
                pointerLocked = document.pointerLockElement === canvas;
            });
            document.addEventListener('mousemove', e => {
                if (!pointerLocked || gamePaused) return;
                yaw -= e.movementX * 0.0022;
                pitch -= e.movementY * 0.0022;
                pitch = Math.max(-1.3, Math.min(1.3, pitch));
            });
            window.addEventListener('resize', () => {
                if (!camera || !renderer) return;
                camera.aspect = window.innerWidth / window.innerHeight;
                camera.updateProjectionMatrix();
                renderer.setSize(window.innerWidth, window.innerHeight);
            });

            // ---- JUMP ----
            function tryJump() {
                if (!isGrounded || jumpCooldownTimer > 0) return;
                velocityY = JUMP_SPEED;
                isGrounded = false;
                jumpCooldownTimer = 0.3;
                AudioSys.jump();
            }

            // ---- PAUSE ----
            function togglePause() {
                if (!gameActive) return;
                gamePaused = !gamePaused;
                document.getElementById('pauseMenu').style.display = gamePaused ? 'flex' : 'none';
                if (gamePaused) document.exitPointerLock();
                else canvas.requestPointerLock();
            }

            // ---- FLASHLIGHT ----
            function toggleFlashlight() {
                if (!gameActive || gamePaused) return;
                flashlightOn = !flashlightOn;
                flashlight.intensity = flashlightOn ? 2.5 : 0;
                const lightAttach = gunGroup.children.find(c => c.geometry && c.geometry.type === 'CylinderGeometry');
                if (lightAttach) { lightAttach.material.emissiveIntensity = flashlightOn ? 0.4 : 0; }
                document.getElementById('objectiveVal').textContent = flashlightOn ? 'FLASHLIGHT: ON' :
                    'FLASHLIGHT: OFF';
                setTimeout(() => { document.getElementById('objectiveVal').textContent = 'LOCATE EXIT PAD'; }, 800);
            }

            // ---- FLARE ----
            function tryFlare() {
                if (!gameActive || gamePaused || flareCooldown > 0) return;
                flareCooldown = 1.8;
                AudioSys.scare();
                document.body.style.backgroundColor = '#fff';
                setTimeout(() => document.body.style.backgroundColor = '', 120);
                enemies.forEach(en => {
                    const d = en.position.distanceTo(camera.position);
                    if (d < 10) {
                        en.userData.scareTimer = 0.8;
                        en.userData.path = null;
                        const dir = new THREE.Vector3().subVectors(en.position, camera.position).normalize();
                        en.position.add(dir.multiplyScalar(1.5));
                    }
                });
            }

            // ---- SHOOTING ----
            const raycaster = new THREE.Raycaster();

            function tryShoot() {
                if (!ammoReady || !gameActive || gamePaused) return;
                ammoReady = false;
                shootCooldown = currentWeapon.fireRate;
                document.getElementById('ammoVal').textContent = 'CYCLING';
                AudioSys.shoot();
                gunGroup.position.z = 0.12;

                const damageBonus = getDamageBonus();
                const totalDamage = currentWeapon.damage + damageBonus;

                raycaster.setFromCamera({ x: 0, y: 0 }, camera);
                const targets = wallMeshes.concat(enemies);
                const hits = raycaster.intersectObjects(targets);
                if (hits.length) {
                    const hit = hits[0];
                    if (hit.object.userData.isEnemy) {
                        const enemy = hit.object;
                        const damage = totalDamage * (enemy.userData.isBoss ? 0.7 : 1);
                        enemy.userData.hp -= damage;
                        if (enemy.userData.hp <= 0) {
                            killEnemy(enemy);
                            flashCrosshair();
                            AudioSys.hit();
                        } else {
                            flashCrosshair();
                            AudioSys.hit();
                            const healthRatio = enemy.userData.hp / enemy.userData.maxHp;
                            if (enemy.userData.isBoss) {
                                enemy.material.emissiveIntensity = 1.0;
                                setTimeout(() => { enemy.material.emissiveIntensity = 0.5; }, 200);
                            }
                        }
                    }
                }
            }

            function flashCrosshair() {
                const c = document.getElementById('crosshair');
                c.classList.add('hit');
                setTimeout(() => c.classList.remove('hit'), 120);
            }

            function killEnemy(mesh) {
                scene.remove(mesh);
                enemies = enemies.filter(e => e !== mesh);
                const isBoss = mesh.userData.isBoss || false;
                const earned = isBoss ? 200 : 25;
                money += earned;
                stats.totalMoney += earned;
                const scoreGain = Math.round((isBoss ? 500 : 75) * diffConfig.scoreMult);
                score += scoreGain;
                stats.totalScore += scoreGain;
                totalKillsThisRun++;
                stats.totalKills++;
                if (isBoss) stats.bossesDefeated++;

                let gainedStatPoint = false;
                if (isBoss) {
                    statPoints++;
                    gainedStatPoint = true;
                } else {
                    const luckBonus = getLuckBonus();
                    const chance = 0.01 + luckBonus;
                    if (Math.random() < chance) {
                        statPoints++;
                        gainedStatPoint = true;
                    }
                }

                document.getElementById('scoreVal').textContent = score;
                document.getElementById('moneyVal').textContent = money;
                document.getElementById('statPointsVal').textContent = statPoints;
                updateEnemyCount();
                sanity = Math.min(100, sanity + (isBoss ? 20 : 3));
                document.getElementById('sanityVal').textContent = Math.round(sanity) + '%';
                document.getElementById('sanityBar').querySelector('span').style.width = sanity + '%';
                if (isBoss) bossEnemy = null;
                updateStatsUI();

                if (gainedStatPoint) {
                    showMessage('⭐ +1 Stat Point!');
                }
            }

            function updateEnemyCount() {
                document.getElementById('enemyVal').textContent = enemies.length;
            }

            // ---- HUD ----
            function renderHealthBar() {
                const wrap = document.getElementById('healthBar');
                wrap.innerHTML = '';
                const maxHealth = getMaxHealth();
                const segCount = 10;
                const filled = Math.round((health / maxHealth) * segCount);
                for (let i = 0; i < segCount; i++) {
                    const seg = document.createElement('div');
                    seg.className = 'hseg' + (i < filled ? ' on' : '');
                    if (health < maxHealth * 0.3 && i < filled) seg.classList.add('warn');
                    if (health < maxHealth * 0.15 && i < filled) seg.classList.add('critical');
                    wrap.appendChild(seg);
                }
            }

            function initMinimap() {
                const cnv = document.getElementById('minimap');
                cnv.width = 150;
                cnv.height = 150;
                minimapCtx = cnv.getContext('2d');
            }

            function drawMinimap() {
                if (!minimapCtx) return;
                const ctx = minimapCtx;
                const W = 150,
                    H = 150;
                ctx.clearRect(0, 0, W, H);
                ctx.fillStyle = 'rgba(5,3,2,0.9)';
                ctx.fillRect(0, 0, W, H);

                for (let i = 0; i < 60; i++) {
                    ctx.fillStyle = `rgba(100,80,60,${Math.random()*0.06})`;
                    ctx.fillRect(Math.random() * W, Math.random() * H, 2, 2);
                }

                const cellPx = Math.min(W / cols, H / rows);

                ctx.strokeStyle = 'rgba(120,90,60,0.2)';
                ctx.lineWidth = 0.8;
                for (let i = 0; i < cols; i++)
                    for (let j = 0; j < rows; j++) {
                        const cell = grid[i][j];
                        const x0 = i * cellPx,
                            y0 = j * cellPx;
                        ctx.beginPath();
                        if (cell.top) { ctx.moveTo(x0, y0);
                            ctx.lineTo(x0 + cellPx, y0); }
                        if (cell.left) { ctx.moveTo(x0, y0);
                            ctx.lineTo(x0, y0 + cellPx); }
                        if (cell.right) { ctx.moveTo(x0 + cellPx, y0);
                            ctx.lineTo(x0 + cellPx, y0 + cellPx); }
                        if (cell.bottom) { ctx.moveTo(x0, y0 + cellPx);
                            ctx.lineTo(x0 + cellPx, y0 + cellPx); }
                        ctx.stroke();
                    }

                ctx.fillStyle = 'rgba(150,120,80,0.25)';
                obstacles.forEach(obs => {
                    const ox = (obs.position.x / CELL) * cellPx,
                        oz = (obs.position.z / CELL) * cellPx;
                    ctx.fillRect(ox - 2, oz - 2, 4, 4);
                });

                ctx.fillStyle = 'rgba(80,200,80,0.25)';
                ctx.fillRect(exitCell.i * cellPx + cellPx * 0.35, exitCell.j * cellPx + cellPx * 0.35, cellPx * 0.3,
                    cellPx * 0.3);

                enemies.forEach(e => {
                    const ex = (e.position.x / CELL) * cellPx,
                        ez = (e.position.z / CELL) * cellPx;
                    const size = e.userData.isBoss ? 5 : 2;
                    const color = e.userData.isBoss ? 'rgba(255,50,50,0.6)' : 'rgba(200,50,50,0.4)';
                    ctx.fillStyle = color;
                    ctx.beginPath();
                    ctx.arc(ex, ez, size, 0, Math.PI * 2);
                    ctx.fill();
                });

                const px = (camera.position.x / CELL) * cellPx,
                    pz = (camera.position.z / CELL) * cellPx;
                ctx.save();
                ctx.translate(px, pz);
                ctx.rotate(yaw);
                ctx.fillStyle = 'rgba(200,160,100,0.5)';
                ctx.beginPath();
                ctx.moveTo(0, -4);
                ctx.lineTo(3, 3);
                ctx.lineTo(-3, 3);
                ctx.closePath();
                ctx.fill();
                ctx.restore();

                if (Math.random() < 0.12) {
                    ctx.fillStyle = `rgba(0,0,0,${Math.random()*0.12})`;
                    ctx.fillRect(0, 0, W, H);
                }
            }

            // ---- ENEMY AI with attacks ----
            function updateEnemies(dt) {
                const playerCell = { i: Math.floor(camera.position.x / CELL), j: Math.floor(camera.position.z / CELL) };
                let anyClose = false;
                let closestDist = 999;

                enemies.forEach(en => {
                    en.userData.repathTimer -= dt;
                    en.userData.attackTimer -= dt;

                    if (en.userData.scareTimer > 0) {
                        en.userData.scareTimer -= dt;
                        en.material.emissiveIntensity = 0.8 + Math.sin(performance.now() * 0.02) * 0.3;
                        return;
                    } else {
                        en.material.emissiveIntensity = en.userData.isBoss ? 0.5 : 0.3;
                    }

                    const curCell = { i: Math.floor(en.position.x / CELL), j: Math.floor(en.position.z / CELL) };
                    if (en.userData.repathTimer <= 0) {
                        en.userData.repathTimer = 0.15 + Math.random() * 0.2;
                        en.userData.path = bfsPath(grid, cols, rows, curCell, playerCell);
                    }

                    const distToPlayer = en.position.distanceTo(camera.position);
                    const attackRange = en.userData.attackRange || 1.3;

                    // Attack logic
                    if (distToPlayer < attackRange && en.userData.attackTimer <= 0) {
                        const baseDamage = diffConfig.damagePerSec * 0.5;
                        const damage = baseDamage * (en.userData.damageMult || 1) * (en.userData.isBoss ? diffConfig
                            .bossDamageMult : 1);
                        let dmg = damage;
                        if (shieldAmount > 0) {
                            const absorbed = Math.min(shieldAmount, dmg);
                            shieldAmount -= absorbed;
                            dmg -= absorbed;
                            if (shieldAmount <= 0) shieldAmount = 0;
                            document.getElementById('shieldVal').textContent = Math.round(shieldAmount);
                            document.getElementById('shieldDisplay').style.opacity = shieldAmount > 0 ? 1 : 0;
                        }
                        health -= dmg;
                        hitFlashTimer = 0.2;
                        AudioSys.hurt();
                        en.userData.attackTimer = en.userData.attackCooldown || 1.0;

                        en.material.emissiveIntensity = 1.5;
                        setTimeout(() => { en.material.emissiveIntensity = en.userData.isBoss ? 0.5 : 0.3; }, 150);

                        const dir = new THREE.Vector3().subVectors(en.position, camera.position).normalize();
                        en.position.add(dir.multiplyScalar(0.3));
                    }

                    if (distToPlayer > attackRange * 0.6) {
                        const path = en.userData.path;
                        if (path && path.length) {
                            const next = path[0];
                            const targetX = next.i * CELL + CELL / 2,
                                targetZ = next.j * CELL + CELL / 2;
                            const dx = targetX - en.position.x,
                                dz = targetZ - en.position.z;
                            const d = Math.hypot(dx, dz);
                            if (d < 0.2) { path.shift(); } else {
                                const speed = en.userData.speed * (keys['ShiftLeft'] ? 0.8 : 1.0) * getSpeedBonus();
                                en.position.x += (dx / d) * speed * dt;
                                en.position.z += (dz / d) * speed * dt;
                            }
                        }
                    }

                    en.rotation.y += dt * (en.userData.isBoss ? 1.5 : 2.0);
                    const height = en.userData.height || 1.8;
                    en.position.y = height / 2 + Math.sin(performance.now() * 0.004 + en.id) * 0.06;

                    if (distToPlayer < 7) anyClose = true;
                    if (distToPlayer < closestDist) closestDist = distToPlayer;
                });

                const banner = document.getElementById('alertBanner');
                const heartbeat = document.getElementById('heartbeat');
                if (anyClose) {
                    alertTimer += dt;
                    banner.style.opacity = (Math.sin(performance.now() * 0.012) * 0.5 + 0.5).toFixed(2);
                    if (closestDist < 3.5) {
                        heartbeat.style.opacity = '0.9';
                        heartbeatTimer += dt;
                        if (heartbeatTimer > 0.3) { heartbeatTimer = 0;
                            AudioSys.hurt(); }
                    } else {
                        heartbeat.style.opacity = '0.3';
                        heartbeatTimer += dt;
                        if (heartbeatTimer > 0.8) { heartbeatTimer = 0; }
                    }
                } else {
                    alertTimer = 0;
                    banner.style.opacity = 0;
                    heartbeat.style.opacity = 0;
                    heartbeatTimer = 0;
                }

                if (!flashlightOn || flashlight.intensity < 0.5) {
                    sanity -= diffConfig.sanityDrain * dt;
                    if (sanity < 0) sanity = 0;
                    document.getElementById('sanityVal').textContent = Math.round(sanity) + '%';
                    document.getElementById('sanityBar').querySelector('span').style.width = sanity + '%';
                    if (sanity < 20 && Math.random() < 0.004) {
                        triggerJumpscare();
                    }
                } else {
                    sanity = Math.min(100, sanity + 0.25 * dt);
                    document.getElementById('sanityVal').textContent = Math.round(sanity) + '%';
                    document.getElementById('sanityBar').querySelector('span').style.width = sanity + '%';
                }
            }

            // ---- JUMBSCARE ----
            function triggerJumpscare() {
                if (document.getElementById('jumpscare').style.display === 'flex') return;
                const js = document.getElementById('jumpscare');
                js.style.display = 'flex';
                const canvas2 = document.createElement('canvas');
                canvas2.width = 400;
                canvas2.height = 400;
                const ctx = canvas2.getContext('2d');
                ctx.fillStyle = '#1a0a0a';
                ctx.fillRect(0, 0, 400, 400);
                ctx.fillStyle = '#3a1a1a';
                ctx.beginPath();
                ctx.ellipse(200, 200, 160, 200, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#f0d0a0';
                ctx.beginPath();
                ctx.ellipse(200, 180, 100, 120, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#fff';
                ctx.beginPath();
                ctx.ellipse(150, 150, 30, 40, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.beginPath();
                ctx.ellipse(250, 150, 30, 40, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#d00';
                ctx.beginPath();
                ctx.ellipse(150, 150, 10, 20, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.beginPath();
                ctx.ellipse(250, 150, 10, 20, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#000';
                ctx.beginPath();
                ctx.ellipse(200, 240, 70, 50, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#d44';
                ctx.beginPath();
                ctx.ellipse(200, 240, 50, 30, 0, 0, Math.PI * 2);
                ctx.fill();
                js.innerHTML = '';
                js.appendChild(canvas2);
                AudioSys.scare();
                setTimeout(() => { js.style.display = 'none';
                    js.innerHTML = ''; }, 400);
            }

            // ---- PLAYER UPDATE ----
            function updatePlayer(dt) {
                if (!isGrounded) {
                    velocityY += GRAVITY * dt;
                    playerHeight += velocityY * dt;
                    if (playerHeight <= 1.7) {
                        playerHeight = 1.7;
                        velocityY = 0;
                        isGrounded = true;
                    }
                }
                if (jumpCooldownTimer > 0) jumpCooldownTimer -= dt;

                if (speedBoostTimer > 0) {
                    speedBoostTimer -= dt;
                    speedBoostMultiplier = 1.5;
                } else {
                    speedBoostMultiplier = 1;
                }

                const baseSpeed = (keys['ShiftLeft'] ? 8.5 : 4.8) * speedBoostMultiplier * getSpeedBonus();
                const forward = new THREE.Vector3(Math.sin(yaw), 0, Math.cos(yaw));
                const strafe = new THREE.Vector3(Math.cos(yaw), 0, -Math.sin(yaw));
                let mx = 0,
                    mz = 0;
                if (keys['KeyW']) { mx -= forward.x;
                    mz -= forward.z; }
                if (keys['KeyS']) { mx += forward.x;
                    mz += forward.z; }
                if (keys['KeyA']) { mx -= strafe.x;
                    mz -= strafe.z; }
                if (keys['KeyD']) { mx += strafe.x;
                    mz += strafe.z; }
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
                camera.position.x = pos.x;
                camera.position.z = pos.z;
                camera.position.x = Math.max(0.4, Math.min(cols * CELL - 0.4, camera.position.x));
                camera.position.z = Math.max(0.4, Math.min(rows * CELL - 0.4, camera.position.z));

                const jumpDisplay = document.getElementById('jumpCooldown');
                if (jumpCooldownTimer > 0) {
                    jumpDisplay.textContent = 'JUMP COOLDOWN';
                    jumpDisplay.style.color = '#d44';
                } else if (!isGrounded) {
                    jumpDisplay.textContent = '⬆ IN AIR';
                    jumpDisplay.style.color = '#88aaff';
                } else {
                    jumpDisplay.textContent = 'JUMP READY';
                    jumpDisplay.style.color = '#6f6';
                }

                if (moving) {
                    bobTime += dt * 9;
                    camera.position.y = playerHeight + Math.sin(bobTime) * 0.04;
                } else {
                    camera.position.y += (playerHeight - camera.position.y) * 0.1;
                }
                camera.rotation.order = 'YXZ';
                camera.rotation.y = yaw;
                camera.rotation.x = pitch;

                const ci = Math.floor(camera.position.x / CELL),
                    cj = Math.floor(camera.position.z / CELL);
                if (ci === exitCell.i && cj === exitCell.j) {
                    if (isBossLevel && bossEnemy) {
                        return;
                    }
                    if (enemies.length === 0 || (isBossLevel && !bossEnemy)) {
                        onLevelClear();
                    } else {
                        document.getElementById('objectiveVal').textContent = '⚔ DEFEAT ALL ENEMIES';
                        document.getElementById('objectiveVal').style.color = '#ff4444';
                        setTimeout(() => {
                            document.getElementById('objectiveVal').textContent = 'LOCATE EXIT PAD';
                            document.getElementById('objectiveVal').style.color = '#6f6';
                        }, 1500);
                    }
                }
            }

            // ---- MAIN LOOP ----
            function animate() {
                requestAnimationFrame(animate);
                if (!gameActive || gamePaused) {
                    if (gameActive && gamePaused && scene && camera) {
                        renderer.render(scene, camera);
                    }
                    return;
                }
                const dt = Math.min(clock.getDelta(), 0.06);

                updatePlayer(dt);
                updateEnemies(dt);

                if (mapRevealTimer > 0) mapRevealTimer -= dt;

                if (shootCooldown > 0) {
                    shootCooldown -= dt;
                    if (shootCooldown <= 0) { ammoReady = true;
                        document.getElementById('ammoVal').textContent = 'READY'; }
                }
                if (flareCooldown > 0) flareCooldown -= dt;

                gunGroup.position.z += (0 - gunGroup.position.z) * 0.2;

                if (scene.userData.lamps) {
                    scene.userData.lamps.forEach(l => {
                        l.userData.flicker += dt * 7;
                        l.intensity = 0.5 + Math.sin(l.userData.flicker) * 0.3 + Math.random() * 0.1;
                    });
                }

                if (hitFlashTimer > 0) {
                    hitFlashTimer -= dt;
                    document.body.style.boxShadow = 'inset 0 0 120px rgba(255,0,0,' + (hitFlashTimer * 2).toFixed(2) +
                        ')';
                } else {
                    document.body.style.boxShadow = 'none';
                }

                renderHealthBar();
                drawMinimap();

                if (health <= 0 || sanity <= 0) {
                    onGameOver();
                }
                renderer.render(scene, camera);
            }

            // ---- SHOP (Unified) ----
            let currentShopTab = 'weapons';

            function renderShop(tab = currentShopTab) {
                const container = document.getElementById('shopItems');
                container.innerHTML = '';
                document.getElementById('shopMoney').textContent = money;
                document.getElementById('shopStatPoints').textContent = statPoints;

                document.querySelectorAll('.shop-tab').forEach(t => {
                    t.classList.toggle('active', t.dataset.tab === tab);
                });

                if (tab === 'weapons') {
                    WEAPONS.forEach(w => {
                        const div = document.createElement('div');
                        div.className = 'shop-item';
                        const owned = w.owned ? (w.equipped ? ' ✅ EQUIPPED' : ' ✅ OWNED') : '';
                        const priceText = w.price === 0 ? 'FREE' : `💰 ${w.price}`;
                        div.innerHTML = `
                        <div class="name">${w.name}</div>
                        <div class="price">${priceText}</div>
                        <div class="owned">${owned}</div>
                        <div class="stats">DMG:${w.damage} ROF:${w.fireRate.toFixed(2)}</div>
                      `;
                        div.style.cursor = 'pointer';
                        div.addEventListener('click', () => {
                            if (w.owned) {
                                WEAPONS.forEach(we => we.equipped = false);
                                w.equipped = true;
                                currentWeapon = w;
                                renderShop(tab);
                                updateStatsUI();
                            } else if (money >= w.price) {
                                money -= w.price;
                                w.owned = true;
                                WEAPONS.forEach(we => we.equipped = false);
                                w.equipped = true;
                                currentWeapon = w;
                                document.getElementById('moneyVal').textContent = money;
                                renderShop(tab);
                                updateStatsUI();
                            }
                        });
                        container.appendChild(div);
                    });
                } else if (tab === 'tools') {
                    tools.forEach(t => {
                        const div = document.createElement('div');
                        div.className = 'shop-item';
                        const owned = t.owned ? ' ✅ OWNED' : '';
                        div.innerHTML = `
                        <div class="name">${t.name}</div>
                        <div class="price">💰 ${t.price}</div>
                        <div class="desc">${t.desc}</div>
                        <div style="font-size:10px; color:#7a8a9a;">${owned}</div>
                      `;
                        div.style.cursor = 'pointer';
                        div.addEventListener('click', () => {
                            if (t.owned) {
                                useTool(t.id);
                            } else if (money >= t.price) {
                                money -= t.price;
                                t.owned = true;
                                document.getElementById('moneyVal').textContent = money;
                                renderShop(tab);
                            }
                        });
                        container.appendChild(div);
                    });
                } else if (tab === 'stats') {
                    Object.keys(PLAYER_STATS).forEach(statKey => {
                        const stat = PLAYER_STATS[statKey];
                        const level = playerStatLevels[statKey];
                        const maxed = level >= stat.max;
                        const div = document.createElement('div');
                        div.className = 'shop-item';
                        div.innerHTML = `
                        <div class="name">${stat.label}</div>
                        <div class="level">Level ${level}/${stat.max}</div>
                        <div class="price">⭐ ${stat.cost}</div>
                        <div class="stats">Bonus: +${(stat.bonus * level).toFixed(2)}</div>
                        <div style="font-size:8px; color:#7a8a9a;">${maxed ? 'MAXED' : 'Click to upgrade'}</div>
                      `;
                        div.style.cursor = maxed ? 'default' : 'pointer';
                        div.style.opacity = maxed ? 0.5 : 1;
                        if (!maxed) {
                            div.addEventListener('click', () => {
                                if (statPoints >= stat.cost) {
                                    statPoints -= stat.cost;
                                    playerStatLevels[statKey]++;
                                    document.getElementById('statPointsVal').textContent = statPoints;
                                    if (statKey === 'health') {
                                        health = getMaxHealth();
                                        renderHealthBar();
                                    }
                                    renderShop(tab);
                                    saveGame();
                                }
                            });
                        }
                        container.appendChild(div);
                    });
                }
            }

            function useTool(toolId) {
                const tool = tools.find(t => t.id === toolId);
                if (!tool) return;

                switch (toolId) {
                    case 'map_reveal':
                        mapRevealTimer = 10;
                        showMessage('🗺 Map Revealed for 10s');
                        break;
                    case 'health_pack':
                        health = Math.min(getMaxHealth(), health + 30);
                        renderHealthBar();
                        showMessage('❤️ +30 HP');
                        break;
                    case 'sanity_boost':
                        sanity = Math.min(100, sanity + 40);
                        document.getElementById('sanityVal').textContent = Math.round(sanity) + '%';
                        document.getElementById('sanityBar').querySelector('span').style.width = sanity + '%';
                        showMessage('🧠 +40 Sanity');
                        break;
                    case 'speed_boost':
                        speedBoostTimer = 8;
                        showMessage('💨 Speed Boost for 8s');
                        break;
                    case 'shield':
                        shieldAmount = 50;
                        document.getElementById('shieldVal').textContent = Math.round(shieldAmount);
                        document.getElementById('shieldDisplay').style.opacity = 1;
                        showMessage('🛡 Shield +50');
                        break;
                }
            }

            function showMessage(text) {
                const obj = document.getElementById('objectiveVal');
                obj.textContent = text;
                obj.style.color = '#88aaff';
                setTimeout(() => {
                    obj.textContent = 'LOCATE EXIT PAD';
                    obj.style.color = '#6f6';
                }, 2000);
            }

            // ---- FLOW CONTROL ----
            function startGame(loadSaveData = null) {
                document.getElementById('mainMenu').style.display = 'none';
                document.getElementById('hud').style.display = 'block';
                document.getElementById('pauseMenu').style.display = 'none';
                document.getElementById('shopMenu').style.display = 'none';
                document.getElementById('statsPanel').style.display = 'none';
                document.getElementById('settingsMenu').style.display = 'none';

                stats.gamesPlayed++;
                totalKillsThisRun = 0;

                if (loadSaveData) {
                    applySave(loadSaveData);
                    savedLevelLoaded = true;
                    buildLevel(level);
                    clock = new THREE.Clock();
                    gameActive = true;
                    gamePaused = false;
                    canvas.requestPointerLock();
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
                WEAPONS.forEach(w => { w.owned = false;
                    w.equipped = false; });
                WEAPONS[0].owned = true;
                WEAPONS[0].equipped = true;
                currentWeapon = WEAPONS[0];
                tools.forEach(t => t.owned = false);
                Object.keys(PLAYER_STATS).forEach(key => playerStatLevels[key] = 0);
                document.getElementById('scoreVal').textContent = score;
                document.getElementById('moneyVal').textContent = money;
                document.getElementById('objectiveVal').textContent = 'LOCATE EXIT PAD';
                document.getElementById('shieldVal').textContent = '0';
                document.getElementById('shieldDisplay').style.opacity = 0;
                document.getElementById('statPointsVal').textContent = statPoints;
                initMinimap();
                buildLevel(level);
                clock = new THREE.Clock();
                gameActive = true;
                gamePaused = false;
                canvas.requestPointerLock();
                updateStatsUI();
            }

            function onLevelClear() {
                if (!gameActive) return;
                gameActive = false;
                document.exitPointerLock();
                AudioSys.clear();

                if (!levelClearedForStat && Math.random() < 0.5) {
                    statPoints++;
                    document.getElementById('statPointsVal').textContent = statPoints;
                    showMessage('⭐ +1 Stat Point (Level Clear)!');
                    levelClearedForStat = true;
                }

                const bonus = isBossLevel ? 300 : 100;
                money += bonus;
                stats.totalMoney += bonus;
                score += Math.round((isBossLevel ? 500 : 200) * diffConfig.scoreMult);
                stats.totalScore += Math.round((isBossLevel ? 500 : 200) * diffConfig.scoreMult);
                if (level > stats.highestLevel) stats.highestLevel = level;
                document.getElementById('moneyVal').textContent = money;
                document.getElementById('clearScore').textContent = score;
                document.getElementById('clearTitle').textContent = isBossLevel ? '⚔ BOSS DEFEATED ⚔' :
                'SECTOR PURGED';
                document.getElementById('clearScreen').style.display = 'flex';
                updateStatsUI();
                saveGame();
            }

            function nextLevel() {
                document.getElementById('clearScreen').style.display = 'none';
                level += 1;
                document.getElementById('scoreVal').textContent = score;
                health = Math.min(getMaxHealth(), health + 10);
                renderHealthBar();
                buildLevel(level);
                gameActive = true;
                gamePaused = false;
                clock.getDelta();
                canvas.requestPointerLock();
            }

            function onGameOver() {
                if (!gameActive) return;
                gameActive = false;
                document.exitPointerLock();
                AudioSys.death();
                document.getElementById('goScore').textContent = score;
                document.getElementById('goLevel').textContent = level - 1;
                document.getElementById('gameOverScreen').style.display = 'flex';
                updateStatsUI();
                localStorage.removeItem('bunker9_save');
            }

            function restartGame() {
                document.getElementById('gameOverScreen').style.display = 'none';
                startGame();
            }

            function goToMenu() {
                document.getElementById('pauseMenu').style.display = 'none';
                document.getElementById('gameOverScreen').style.display = 'none';
                document.getElementById('clearScreen').style.display = 'none';
                document.getElementById('hud').style.display = 'none';
                document.getElementById('shopMenu').style.display = 'none';
                document.getElementById('statsPanel').style.display = 'none';
                document.getElementById('settingsMenu').style.display = 'none';
                document.getElementById('mainMenu').style.display = 'flex';
                gameActive = false;
                gamePaused = false;
                updateStatsUI();
            }

            // ---- DIFFICULTY ----
            document.querySelectorAll('#difficultyRow .menu-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    document.querySelectorAll('#difficultyRow .menu-btn').forEach(b => b.classList.remove(
                    'active-mode'));
                    btn.classList.add('active-mode');
                    currentDifficulty = btn.dataset.diff;
                    diffConfig = DIFFICULTIES[currentDifficulty];
                    updateStatsUI();
                });
            });

            // ---- UI BINDINGS ----
            document.getElementById('startGameBtn').addEventListener('click', () => {
                const saveData = loadSave();
                if (saveData) {
                    if (confirm('Continue from saved game?')) { startGame(saveData); return; }
                }
                startGame();
            });
            document.getElementById('continueBtn').addEventListener('click', () => {
                const saveData = loadSave();
                if (saveData) { startGame(saveData); } else { alert('No saved game found.'); }
            });
            document.getElementById('retryBtn').addEventListener('click', restartGame);
            document.getElementById('nextBtn').addEventListener('click', nextLevel);
            document.getElementById('resumeBtn').addEventListener('click', () => { if (gamePaused) togglePause(); });
            document.getElementById('saveBtn').addEventListener('click', () => { if (gameActive) saveGame(); });
            document.getElementById('quitToMenuBtn').addEventListener('click', goToMenu);

            // Shop tabs
            document.querySelectorAll('.shop-tab').forEach(tab => {
                tab.addEventListener('click', () => {
                    currentShopTab = tab.dataset.tab;
                    renderShop(currentShopTab);
                });
            });

            document.getElementById('shopMenuBtn').addEventListener('click', () => {
                currentShopTab = 'weapons';
                renderShop('weapons');
                document.getElementById('shopMenu').style.display = 'flex';
            });
            document.getElementById('shopFromPauseBtn').addEventListener('click', () => {
                currentShopTab = 'weapons';
                renderShop('weapons');
                document.getElementById('pauseMenu').style.display = 'none';
                document.getElementById('shopMenu').style.display = 'flex';
            });
            document.getElementById('shopClose').addEventListener('click', () => {
                document.getElementById('shopMenu').style.display = 'none';
                if (gameActive && gamePaused) { document.getElementById('pauseMenu').style.display = 'flex'; }
                document.getElementById('moneyVal').textContent = money;
            });

            document.getElementById('statsMenuBtn').addEventListener('click', () => {
                updateStatsUI();
                document.getElementById('statsPanel').style.display = 'flex';
            });
            document.getElementById('statsFromPauseBtn').addEventListener('click', () => {
                updateStatsUI();
                document.getElementById('pauseMenu').style.display = 'none';
                document.getElementById('statsPanel').style.display = 'flex';
            });
            document.getElementById('statsClose').addEventListener('click', () => {
                document.getElementById('statsPanel').style.display = 'none';
                if (gameActive && gamePaused) { document.getElementById('pauseMenu').style.display = 'flex'; }
            });

            document.getElementById('settingsMenuBtn').addEventListener('click', () => { document.getElementById(
                    'settingsMenu').style.display = 'flex'; });
            document.getElementById('settingsFromPauseBtn').addEventListener('click', () => { document
                    .getElementById('pauseMenu').style.display = 'none';
                document.getElementById('settingsMenu').style.display = 'flex'; });
            document.getElementById('settingsClose').addEventListener('click', () => {
                document.getElementById('settingsMenu').style.display = 'none';
                if (gameActive && gamePaused) { document.getElementById('pauseMenu').style.display = 'flex'; }
            });

            const hasSave = loadSave() !== null;
            document.getElementById('continueBtn').style.display = hasSave ? 'block' : 'none';

            initRenderer();
            animate();

        })();
