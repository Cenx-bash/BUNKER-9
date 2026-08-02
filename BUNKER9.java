// BUNKER9.java - Fixed Version
import javax.swing.*;
import java.awt.*;
import java.awt.event.*;
import java.awt.image.*;
import java.util.*;
import java.util.List;
import java.util.concurrent.*;

public class BUNKER9 extends JPanel implements KeyListener, MouseListener, MouseMotionListener, Runnable {
    // ============================================================
    // CONSTANTS & CONFIGURATION
    // ============================================================
    private static final int WIDTH = 1200;
    private static final int HEIGHT = 800;
    private static final int CELL_SIZE = 48;
    private static final int PLAYER_SIZE = 16;
    private static final int FPS = 60;
    private static final double PLAYER_SPEED = 3.5;
    private static final double GRAVITY = 0.8;
    private static final double JUMP_SPEED = -12;
    private static final int GRENADE_MAX_COOLDOWN = 30; // seconds
    
    // Colors
    private static final Color COLOR_WALL = new Color(60, 55, 50);
    private static final Color COLOR_FLOOR = new Color(30, 28, 25);
    private static final Color COLOR_PLAYER = new Color(240, 176, 96);
    private static final Color COLOR_EXIT = new Color(47, 191, 74);
    private static final Color COLOR_AMBIENT = new Color(20, 15, 10, 100);
    private static final Color COLOR_UI_GOLD = new Color(240, 176, 96);
    private static final Color COLOR_UI_RED = new Color(255, 68, 68);
    private static final Color COLOR_UI_GREEN = new Color(0, 255, 0);
    private static final Color COLOR_UI_BLUE = new Color(136, 170, 255);
    private static final Color COLOR_UI_ORANGE = new Color(255, 136, 68);
    private static final Color COLOR_UI_PURPLE = new Color(255, 68, 255);
    
    // ============================================================
    // GAME STATE
    // ============================================================
    private boolean gameRunning = false;
    private boolean gamePaused = false;
    private boolean gameOver = false;
    private boolean levelComplete = false;
    private boolean mouseLocked = false;
    private boolean flashlightOn = true;
    private boolean isCrouching = false;
    private boolean isGrounded = true;
    private boolean isMobile = false;
    
    // Player
    private double playerX, playerY, playerZ;
    private double playerYaw = 0;
    private double playerPitch = 0;
    private double velocityY = 0;
    private int health = 100;
    private int maxHealth = 100;
    private int sanity = 100;
    private int score = 0;
    private int level = 1;
    private int money = 0;
    private int statPoints = 0;
    private int kills = 0;
    private int headshots = 0;
    private int bossesDefeated = 0;
    private int grenadesThrown = 0;
    private int hordesSummoned = 0;
    private long playTime = 0;
    
    // Inventory
    private Weapon currentWeapon;
    private List<Weapon> weapons = new ArrayList<>();
    private List<Tool> tools = new ArrayList<>();
    private List<Perk> perks = new ArrayList<>();
    private int currentWeaponIndex = 0;
    private int currentAmmo = 0;
    private boolean isReloading = false;
    private double reloadTimer = 0;
    private boolean ammoReady = true;
    private double shootCooldown = 0;
    private double meleeCooldown = 0;
    
    // Grenade
    private double grenadeCooldown = 0;
    
    // Map
    private int cols, rows;
    private boolean[][] walls;
    private int exitX, exitY;
    private List<Enemy> enemies = new ArrayList<>();
    private List<Obstacle> obstacles = new ArrayList<>();
    private List<Particle> particles = new ArrayList<>();
    private List<DamageNumber> damageNumbers = new ArrayList<>();
    
    // Input
    private boolean[] keys = new boolean[256];
    private int mouseX, mouseY;
    
    // Rendering
    private BufferedImage offscreen;
    private Graphics2D g2d;
    private Random random = new Random();
    private Font mainFont = new Font("Monospaced", Font.BOLD, 14);
    private Font titleFont = new Font("Monospaced", Font.BOLD, 32);
    private Font smallFont = new Font("Monospaced", Font.PLAIN, 10);
    
    // ============================================================
    // WEAPON CLASS
    // ============================================================
    class Weapon {
        String id, name, desc, weaponType;
        int damage, price, maxAmmo;
        double fireRate, range, reloadTime, spread;
        boolean owned, equipped, isMelee, auto;
        int xp, level;
        boolean mastered;
        Color color;
        
        Weapon(String id, String name, String desc, String weaponType, int damage, int price, int maxAmmo,
               double fireRate, double range, double reloadTime, double spread, boolean isMelee, boolean auto) {
            this.id = id;
            this.name = name;
            this.desc = desc;
            this.weaponType = weaponType;
            this.damage = damage;
            this.price = price;
            this.maxAmmo = maxAmmo;
            this.fireRate = fireRate;
            this.range = range;
            this.reloadTime = reloadTime;
            this.spread = spread;
            this.isMelee = isMelee;
            this.auto = auto;
            this.owned = false;
            this.equipped = false;
            this.xp = 0;
            this.level = 1;
            this.mastered = false;
            this.color = COLOR_UI_GOLD;
        }
    }
    
    // ============================================================
    // ENEMY CLASS
    // ============================================================
    class Enemy {
        double x, y, z;
        double width, height;
        double speed;
        int maxHp, hp;
        int damage;
        double attackRange;
        double attackCooldown;
        double attackTimer;
        boolean isBoss;
        String type;
        Color color;
        Color glowColor;
        List<Point> path;
        double repathTimer;
        double scareTimer;
        double collisionRadius;
        boolean isDead = false;
        double bobOffset = Math.random() * 100;
        double rotation = 0;
        
        Enemy(String type, double x, double z, int hp, double speed, int damage, boolean isBoss, Color color, Color glow) {
            this.type = type;
            this.x = x;
            this.z = z;
            this.y = 0;
            this.width = isBoss ? 1.5 : 0.7;
            this.height = isBoss ? 3.0 : 1.8;
            this.hp = hp;
            this.maxHp = hp;
            this.speed = speed;
            this.damage = damage;
            this.isBoss = isBoss;
            this.color = color;
            this.glowColor = glow;
            this.attackRange = isBoss ? 2.0 : 1.3;
            this.attackCooldown = isBoss ? 1.2 : 1.0;
            this.attackTimer = 0;
            this.collisionRadius = isBoss ? 0.9 : 0.5;
            this.repathTimer = 0.2 + Math.random() * 0.3;
            this.path = new ArrayList<>();
        }
        
        void takeDamage(int dmg, boolean headshot) {
            hp -= dmg;
            if (hp < 0) hp = 0;
        }
        
        boolean isAlive() {
            return hp > 0 && !isDead;
        }
    }
    
    // ============================================================
    // OBSTACLE CLASS
    // ============================================================
    class Obstacle {
        double x, z;
        double width, height, depth;
        Color color;
        double collisionRadius;
        
        Obstacle(double x, double z, double w, double h, double d, Color color) {
            this.x = x;
            this.z = z;
            this.width = w;
            this.height = h;
            this.depth = d;
            this.color = color;
            this.collisionRadius = Math.max(w, d) * 0.5 + 0.1;
        }
    }
    
    // ============================================================
    // PARTICLE CLASS
    // ============================================================
    class Particle {
        double x, y, z;
        double vx, vy, vz;
        double life, maxLife;
        double size;
        Color color;
        boolean alive = true;
        
        Particle(double x, double y, double z, double vx, double vy, double vz, double life, double size, Color color) {
            this.x = x;
            this.y = y;
            this.z = z;
            this.vx = vx;
            this.vy = vy;
            this.vz = vz;
            this.life = life;
            this.maxLife = life;
            this.size = size;
            this.color = color;
        }
        
        void update(double dt) {
            x += vx * dt;
            y += vy * dt;
            z += vz * dt;
            vy -= 2.0 * dt;
            life -= dt;
            if (life <= 0) alive = false;
        }
    }
    
    // ============================================================
    // DAMAGE NUMBER CLASS
    // ============================================================
    class DamageNumber {
        double x, y, z;
        String text;
        Color color;
        double life = 1.0;
        double vy = -2.0;
        boolean headshot, boss;
        
        DamageNumber(double x, double y, double z, String text, Color color, boolean headshot, boolean boss) {
            this.x = x;
            this.y = y;
            this.z = z;
            this.text = text;
            this.color = color;
            this.headshot = headshot;
            this.boss = boss;
        }
        
        void update(double dt) {
            y += vy * dt;
            life -= dt;
        }
        
        boolean isAlive() {
            return life > 0;
        }
    }
    
    // ============================================================
    // TOOL CLASS
    // ============================================================
    class Tool {
        String id, name, desc;
        int price;
        boolean owned;
        
        Tool(String id, String name, String desc, int price) {
            this.id = id;
            this.name = name;
            this.desc = desc;
            this.price = price;
            this.owned = false;
        }
    }
    
    // ============================================================
    // PERK CLASS
    // ============================================================
    class Perk {
        String id, name, desc, icon;
        int cost, tier;
        boolean unlocked = false;
        
        Perk(String id, String name, String desc, String icon, int cost, int tier) {
            this.id = id;
            this.name = name;
            this.desc = desc;
            this.icon = icon;
            this.cost = cost;
            this.tier = tier;
        }
    }
    
    // ============================================================
    // CONSTRUCTOR
    // ============================================================
    public BUNKER9() {
        setPreferredSize(new Dimension(WIDTH, HEIGHT));
        setBackground(Color.BLACK);
        setFocusable(true);
        addKeyListener(this);
        addMouseListener(this);
        addMouseMotionListener(this);
        
        // Initialize weapons
        initWeapons();
        initTools();
        initPerks();
        
        offscreen = new BufferedImage(WIDTH, HEIGHT, BufferedImage.TYPE_INT_ARGB);
        
        new Thread(this).start();
    }
    
    // ============================================================
    // INITIALIZATION
    // ============================================================
    private void initWeapons() {
        weapons.add(new Weapon("knife", "COMBAT KNIFE", "Standard melee weapon", "melee", 30, 0, 0, 0.35, 1.8, 0, 0, true, false));
        weapons.add(new Weapon("m9", "M9 PISTOL", "Standard sidearm", "pistol", 25, 200, 15, 0.28, 30, 1.2, 0.02, false, false));
        weapons.add(new Weapon("mp5", "MP5 SMG", "High rate of fire", "smg", 18, 400, 30, 0.08, 25, 1.5, 0.06, false, true));
        weapons.add(new Weapon("m870", "M870 SHOTGUN", "Devastating close range", "shotgun", 12, 550, 6, 0.45, 15, 2.0, 0.15, false, false));
        weapons.add(new Weapon("m4a1", "M4A1 CARBINE", "Versatile combat rifle", "rifle", 35, 700, 30, 0.14, 45, 1.8, 0.03, false, true));
        weapons.add(new Weapon("ak47", "AK-47", "Iconic assault rifle", "rifle", 40, 1000, 30, 0.12, 42, 1.6, 0.05, false, true));
        weapons.add(new Weapon("rpg7", "RPG-7", "Explosive devastation", "heavy", 200, 1300, 1, 1.5, 40, 3.0, 0.1, false, false));
        
        weapons.get(0).owned = true;
        weapons.get(0).equipped = true;
        currentWeapon = weapons.get(0);
        currentAmmo = 0;
    }
    
    private void initTools() {
        tools.add(new Tool("map_reveal", "MAP REVEAL", "Reveals minimap for 10s", 150));
        tools.add(new Tool("health_pack", "HEALTH PACK", "Restore 30 HP", 100));
        tools.add(new Tool("sanity_boost", "SANITY BOOST", "Restore 40 Sanity", 120));
        tools.add(new Tool("speed_boost", "SPEED BOOST", "+50% speed for 8s", 200));
        tools.add(new Tool("shield", "SHIELD", "Absorb 50 damage", 250));
        tools.add(new Tool("xp_boost", "XP BOOST", "Double weapon XP", 300));
    }
    
    private void initPerks() {
        perks.add(new Perk("quick_hands", "Quick Hands", "+30% reload speed", "⚡", 1, 1));
        perks.add(new Perk("steady_aim", "Steady Aim", "-50% weapon spread", "🎯", 1, 1));
        perks.add(new Perk("light_foot", "Light Foot", "+20% movement speed", "👟", 1, 1));
        perks.add(new Perk("berserker", "Berserker", "+30% damage when below 30% HP", "🔥", 2, 2));
        perks.add(new Perk("tank", "Tank", "+50% max health, +30% defense", "🛡️", 2, 2));
        perks.add(new Perk("scout", "Scout", "+40% speed, +20% dodge chance", "🏃", 2, 2));
    }
    
    private void startGame() {
        health = 100;
        maxHealth = 100;
        sanity = 100;
        score = 0;
        level = 1;
        money = 0;
        statPoints = 0;
        kills = 0;
        headshots = 0;
        bossesDefeated = 0;
        grenadesThrown = 0;
        hordesSummoned = 0;
        playTime = 0;
        gameOver = false;
        levelComplete = false;
        gameRunning = true;
        
        for (Weapon w : weapons) {
            w.owned = false;
            w.equipped = false;
            w.xp = 0;
            w.level = 1;
            w.mastered = false;
        }
        weapons.get(0).owned = true;
        weapons.get(0).equipped = true;
        currentWeapon = weapons.get(0);
        currentAmmo = 0;
        
        for (Tool t : tools) t.owned = false;
        for (Perk p : perks) p.unlocked = false;
        
        grenadeCooldown = 0;
        
        buildLevel(level);
        
        playerX = CELL_SIZE * 0.5 + PLAYER_SIZE / 2;
        playerZ = CELL_SIZE * 0.5 + PLAYER_SIZE / 2;
        playerY = 0;
        velocityY = 0;
        isGrounded = true;
        
        playerYaw = 0;
        playerPitch = 0;
    }
    
    // ============================================================
    // LEVEL BUILDING
    // ============================================================
    private void buildLevel(int levelNum) {
        int baseSize = 10;
        cols = baseSize + Math.min(levelNum, 8);
        rows = baseSize + Math.min(levelNum, 8);
        
        walls = new boolean[cols][rows];
        for (int i = 0; i < cols; i++) {
            for (int j = 0; j < rows; j++) {
                walls[i][j] = true;
            }
        }
        
        generateMaze(1, 1);
        
        exitX = cols - 2;
        exitY = rows - 2;
        walls[exitX][exitY] = false;
        
        enemies.clear();
        obstacles.clear();
        particles.clear();
        damageNumbers.clear();
        
        int enemyCount = 3 + levelNum * 2;
        boolean bossLevel = (levelNum % 5 == 0);
        int bossCount = bossLevel ? 1 : 0;
        
        for (int i = 0; i < enemyCount; i++) {
            spawnEnemy(bossLevel && i < bossCount);
        }
        
        int obstacleCount = 5 + levelNum * 2;
        for (int i = 0; i < obstacleCount; i++) {
            spawnObstacle();
        }
        
        playerX = CELL_SIZE * 0.5 + PLAYER_SIZE / 2;
        playerZ = CELL_SIZE * 0.5 + PLAYER_SIZE / 2;
    }
    
    private void generateMaze(int x, int y) {
        walls[x][y] = false;
        int[] dirs = {0, 1, 2, 3};
        shuffleArray(dirs);
        
        for (int dir : dirs) {
            int nx = x, ny = y;
            switch (dir) {
                case 0: ny = y - 2; break;
                case 1: nx = x + 2; break;
                case 2: ny = y + 2; break;
                case 3: nx = x - 2; break;
            }
            
            if (nx > 0 && nx < cols - 1 && ny > 0 && ny < rows - 1 && walls[nx][ny]) {
                walls[x + (nx - x) / 2][y + (ny - y) / 2] = false;
                generateMaze(nx, ny);
            }
        }
    }
    
    private void shuffleArray(int[] array) {
        for (int i = array.length - 1; i > 0; i--) {
            int j = random.nextInt(i + 1);
            int temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }
    }
    
    private void spawnEnemy(boolean isBoss) {
        int maxAttempts = 100;
        for (int attempt = 0; attempt < maxAttempts; attempt++) {
            int x = random.nextInt(cols - 2) + 1;
            int z = random.nextInt(rows - 2) + 1;
            
            if (walls[x][z]) continue;
            if (Math.abs(x - 1) + Math.abs(z - 1) < 3) continue;
            if (x == exitX && z == exitY) continue;
            
            double worldX = x * CELL_SIZE + CELL_SIZE / 2;
            double worldZ = z * CELL_SIZE + CELL_SIZE / 2;
            
            boolean tooClose = false;
            for (Enemy e : enemies) {
                if (Math.hypot(e.x - worldX, e.z - worldZ) < 3.0) {
                    tooClose = true;
                    break;
                }
            }
            if (tooClose) continue;
            
            String type = isBoss ? "boss" : getRandomEnemyType();
            int hp = isBoss ? (50 + level * 10) : (10 + level * 2 + random.nextInt(5));
            double speed = isBoss ? 1.0 : (0.8 + random.nextDouble() * 0.6);
            int damage = isBoss ? (15 + level * 2) : (5 + level + random.nextInt(3));
            
            Color color = isBoss ? new Color(180, 50, 50) : getRandomEnemyColor();
            Color glow = isBoss ? new Color(255, 50, 50) : getRandomGlowColor();
            
            Enemy enemy = new Enemy(type, worldX, worldZ, hp, speed, damage, isBoss, color, glow);
            enemies.add(enemy);
            
            if (isBoss) {
                bossesDefeated++;
                for (int i = 0; i < 20; i++) {
                    particles.add(new Particle(
                        worldX, 1.5, worldZ,
                        (random.nextDouble() - 0.5) * 3,
                        random.nextDouble() * 2,
                        (random.nextDouble() - 0.5) * 3,
                        1.0 + random.nextDouble(),
                        0.05 + random.nextDouble() * 0.1,
                        new Color(255, 50, 50, 150)
                    ));
                }
            }
            break;
        }
    }
    
    private String getRandomEnemyType() {
        String[] types = {"grunt", "fast", "tank", "brute", "spitter"};
        return types[random.nextInt(types.length)];
    }
    
    private Color getRandomEnemyColor() {
        Color[] colors = {
            new Color(68, 17, 17),
            new Color(17, 34, 68),
            new Color(51, 51, 17),
            new Color(68, 17, 17),
            new Color(17, 51, 17)
        };
        return colors[random.nextInt(colors.length)];
    }
    
    private Color getRandomGlowColor() {
        Color[] colors = {
            new Color(200, 50, 50),
            new Color(50, 150, 255),
            new Color(100, 180, 50),
            new Color(200, 70, 70),
            new Color(50, 255, 50)
        };
        return colors[random.nextInt(colors.length)];
    }
    
    private void spawnObstacle() {
        int maxAttempts = 50;
        for (int attempt = 0; attempt < maxAttempts; attempt++) {
            int x = random.nextInt(cols - 2) + 1;
            int z = random.nextInt(rows - 2) + 1;
            
            if (walls[x][z]) continue;
            if (Math.abs(x - 1) + Math.abs(z - 1) < 2) continue;
            if (x == exitX && z == exitY) continue;
            
            double worldX = x * CELL_SIZE + CELL_SIZE / 2;
            double worldZ = z * CELL_SIZE + CELL_SIZE / 2;
            
            boolean tooClose = false;
            for (Enemy e : enemies) {
                if (Math.hypot(e.x - worldX, e.z - worldZ) < 2.0) {
                    tooClose = true;
                    break;
                }
            }
            if (tooClose) continue;
            
            double size = 0.3 + random.nextDouble() * 0.3;
            obstacles.add(new Obstacle(
                worldX, worldZ,
                size * 1.2, size * 0.8, size * 1.2,
                new Color(60 + random.nextInt(40), 55 + random.nextInt(40), 50 + random.nextInt(40))
            ));
            break;
        }
    }
    
    // ============================================================
    // GAME UPDATE
    // ============================================================
    private void update(double dt) {
        if (!gameRunning || gamePaused || gameOver || levelComplete) return;
        
        playTime += (long)(dt * 1000);
        
        if (grenadeCooldown > 0) {
            grenadeCooldown -= dt;
            if (grenadeCooldown < 0) grenadeCooldown = 0;
        }
        
        updatePlayer(dt);
        updateEnemies(dt);
        updateParticles(dt);
        updateDamageNumbers(dt);
        updateReload(dt);
        
        if (shootCooldown > 0) {
            shootCooldown -= dt;
            if (shootCooldown <= 0) ammoReady = true;
        }
        if (meleeCooldown > 0) meleeCooldown -= dt;
        
        checkWinCondition();
        
        if (health <= 0 || sanity <= 0) {
            gameOver = true;
            gameRunning = false;
        }
    }
    
    private void updatePlayer(double dt) {
        if (!isGrounded) {
            velocityY += GRAVITY * dt * 60;
            playerY += velocityY * dt * 60;
            if (playerY <= 0) {
                playerY = 0;
                velocityY = 0;
                isGrounded = true;
            }
        }
        
        double speed = PLAYER_SPEED;
        if (keys[KeyEvent.VK_SHIFT]) speed *= 1.5;
        
        double mx = 0, mz = 0;
        if (keys[KeyEvent.VK_W]) { mx += Math.sin(playerYaw); mz += Math.cos(playerYaw); }
        if (keys[KeyEvent.VK_S]) { mx -= Math.sin(playerYaw); mz -= Math.cos(playerYaw); }
        if (keys[KeyEvent.VK_A]) { mx -= Math.cos(playerYaw); mz += Math.sin(playerYaw); }
        if (keys[KeyEvent.VK_D]) { mx += Math.cos(playerYaw); mz -= Math.sin(playerYaw); }
        
        if (mx != 0 || mz != 0) {
            double len = Math.hypot(mx, mz);
            mx /= len;
            mz /= len;
            playerX += mx * speed * dt * 60;
            playerZ += mz * speed * dt * 60;
        }
        
        // Collision with walls
        int cellX = (int)(playerX / CELL_SIZE);
        int cellZ = (int)(playerZ / CELL_SIZE);
        double radius = PLAYER_SIZE / 2.0;
        
        for (int i = -1; i <= 1; i++) {
            for (int j = -1; j <= 1; j++) {
                int cx = cellX + i;
                int cz = cellZ + j;
                if (cx >= 0 && cx < cols && cz >= 0 && cz < rows && walls[cx][cz]) {
                    double wallX = cx * CELL_SIZE + CELL_SIZE / 2;
                    double wallZ = cz * CELL_SIZE + CELL_SIZE / 2;
                    double dx = playerX - wallX;
                    double dz = playerZ - wallZ;
                    double dist = Math.hypot(dx, dz);
                    double minDist = CELL_SIZE / 2 + radius;
                    if (dist < minDist && dist > 0.01) {
                        double push = (minDist - dist) / dist;
                        playerX += dx * push * 0.5;
                        playerZ += dz * push * 0.5;
                    }
                }
            }
        }
        
        // Collision with obstacles
        for (Obstacle obs : obstacles) {
            double dx = playerX - obs.x;
            double dz = playerZ - obs.z;
            double dist = Math.hypot(dx, dz);
            double minDist = obs.collisionRadius + radius;
            if (dist < minDist && dist > 0.01) {
                double push = (minDist - dist) / dist;
                playerX += dx * push * 0.5;
                playerZ += dz * push * 0.5;
            }
        }
        
        // Collision with enemies
        for (Enemy enemy : enemies) {
            if (!enemy.isAlive()) continue;
            double dx = playerX - enemy.x;
            double dz = playerZ - enemy.z;
            double dist = Math.hypot(dx, dz);
            double minDist = enemy.collisionRadius + radius;
            if (dist < minDist && dist > 0.01) {
                double push = (minDist - dist) / dist;
                playerX += dx * push * 0.5;
                playerZ += dz * push * 0.5;
            }
        }
        
        playerX = Math.max(radius, Math.min(cols * CELL_SIZE - radius, playerX));
        playerZ = Math.max(radius, Math.min(rows * CELL_SIZE - radius, playerZ));
        
        // Sanity drain from enemies
        double closestDist = 999;
        for (Enemy e : enemies) {
            if (!e.isAlive()) continue;
            double d = Math.hypot(playerX - e.x, playerZ - e.z);
            if (d < closestDist) closestDist = d;
        }
        if (closestDist < 7) {
            double drainRate = 0.5 * (1 - closestDist / 7) * 0.5;
            sanity -= (int)(drainRate * dt * 60);
            if (sanity < 0) sanity = 0;
        } else if (flashlightOn) {
            sanity = Math.min(100, sanity + (int)(0.1 * dt * 60));
        }
    }
    
    private void updateEnemies(double dt) {
        for (Enemy enemy : enemies) {
            if (!enemy.isAlive()) continue;
            
            enemy.repathTimer -= dt;
            enemy.attackTimer -= dt;
            
            if (enemy.scareTimer > 0) {
                enemy.scareTimer -= dt;
                continue;
            }
            
            if (enemy.repathTimer <= 0) {
                enemy.repathTimer = 0.2 + random.nextDouble() * 0.3;
                enemy.path = findPath(enemy);
            }
            
            double distToPlayer = Math.hypot(playerX - enemy.x, playerZ - enemy.z);
            
            if (distToPlayer > enemy.attackRange) {
                if (!enemy.path.isEmpty()) {
                    Point target = enemy.path.get(0);
                    double targetX = target.x * CELL_SIZE + CELL_SIZE / 2;
                    double targetZ = target.y * CELL_SIZE + CELL_SIZE / 2;
                    
                    double dx = targetX - enemy.x;
                    double dz = targetZ - enemy.z;
                    double d = Math.hypot(dx, dz);
                    
                    if (d < 0.5) {
                        enemy.path.remove(0);
                    } else {
                        double speed = enemy.speed * (isCrouching ? 0.8 : 1.0);
                        enemy.x += (dx / d) * speed * dt * 60;
                        enemy.z += (dz / d) * speed * dt * 60;
                    }
                }
            }
            
            if (distToPlayer < enemy.attackRange && enemy.attackTimer <= 0) {
                int damage = enemy.damage;
                health -= damage;
                enemy.attackTimer = enemy.attackCooldown;
                
                damageNumbers.add(new DamageNumber(
                    playerX, 1.5, playerZ,
                    "-" + damage,
                    Color.RED,
                    false,
                    enemy.isBoss
                ));
                
                for (int i = 0; i < 10; i++) {
                    particles.add(new Particle(
                        playerX, 1.0, playerZ,
                        (random.nextDouble() - 0.5) * 2,
                        random.nextDouble() * 2,
                        (random.nextDouble() - 0.5) * 2,
                        0.5 + random.nextDouble(),
                        0.03 + random.nextDouble() * 0.05,
                        new Color(180, 20, 20, 150)
                    ));
                }
            }
            
            enemy.rotation += dt * 2;
            enemy.y = Math.sin(enemy.bobOffset + System.currentTimeMillis() * 0.003) * 0.06;
            
            for (Enemy other : enemies) {
                if (other == enemy || !other.isAlive()) continue;
                double dx = enemy.x - other.x;
                double dz = enemy.z - other.z;
                double dist = Math.hypot(dx, dz);
                double minDist = enemy.collisionRadius + other.collisionRadius;
                if (dist < minDist && dist > 0.01) {
                    double push = (minDist - dist) / dist * 0.5;
                    enemy.x += dx * push;
                    enemy.z += dz * push;
                }
            }
        }
    }
    
    private List<Point> findPath(Enemy enemy) {
        List<Point> path = new ArrayList<>();
        int startX = (int)(enemy.x / CELL_SIZE);
        int startZ = (int)(enemy.z / CELL_SIZE);
        int goalX = (int)(playerX / CELL_SIZE);
        int goalZ = (int)(playerZ / CELL_SIZE);
        
        boolean[][] visited = new boolean[cols][rows];
        Point[][] parent = new Point[cols][rows];
        Queue<Point> queue = new LinkedList<>();
        
        queue.add(new Point(startX, startZ));
        visited[startX][startZ] = true;
        
        int[] dx = {0, 1, 0, -1};
        int[] dz = {1, 0, -1, 0};
        
        while (!queue.isEmpty()) {
            Point current = queue.poll();
            if (current.x == goalX && current.y == goalZ) {
                Point p = current;
                while (!(p.x == startX && p.y == startZ)) {
                    path.add(0, p);
                    p = parent[p.x][p.y];
                }
                return path;
            }
            
            for (int i = 0; i < 4; i++) {
                int nx = current.x + dx[i];
                int ny = current.y + dz[i];
                if (nx >= 0 && nx < cols && ny >= 0 && ny < rows && !visited[nx][ny]) {
                    if (!walls[nx][ny]) {
                        visited[nx][ny] = true;
                        parent[nx][ny] = current;
                        queue.add(new Point(nx, ny));
                    }
                }
            }
        }
        
        return path;
    }
    
    private void updateParticles(double dt) {
        Iterator<Particle> iter = particles.iterator();
        while (iter.hasNext()) {
            Particle p = iter.next();
            p.update(dt);
            if (!p.alive) iter.remove();
        }
    }
    
    private void updateDamageNumbers(double dt) {
        Iterator<DamageNumber> iter = damageNumbers.iterator();
        while (iter.hasNext()) {
            DamageNumber dn = iter.next();
            dn.update(dt);
            if (!dn.isAlive()) iter.remove();
        }
    }
    
    private void updateReload(double dt) {
        if (!isReloading) return;
        reloadTimer -= dt;
        if (reloadTimer <= 0) {
            isReloading = false;
            currentAmmo = currentWeapon.maxAmmo;
            ammoReady = true;
        }
    }
    
    private void checkWinCondition() {
        int cellX = (int)(playerX / CELL_SIZE);
        int cellZ = (int)(playerZ / CELL_SIZE);
        if (cellX == exitX && cellZ == exitY) {
            boolean allDead = true;
            for (Enemy e : enemies) {
                if (e.isAlive()) { allDead = false; break; }
            }
            if (allDead && !levelComplete) {
                levelComplete = true;
                onLevelComplete();
            }
        }
    }
    
    private void onLevelComplete() {
        int bonus = 100 + level * 50;
        score += bonus * 2;
        money += bonus;
        
        health = Math.min(maxHealth, health + 20);
        
        level++;
        
        buildLevel(level);
        levelComplete = false;
        
        playerX = CELL_SIZE * 0.5 + PLAYER_SIZE / 2;
        playerZ = CELL_SIZE * 0.5 + PLAYER_SIZE / 2;
    }
    
    // ============================================================
    // ATTACK SYSTEMS
    // ============================================================
    private void tryAttack() {
        if (gamePaused || !gameRunning || gameOver) return;
        
        if (currentWeapon.isMelee) {
            if (meleeCooldown > 0) return;
            meleeCooldown = currentWeapon.fireRate;
            
            double attackAngle = Math.PI / 3;
            double attackRange = currentWeapon.range;
            
            for (Enemy enemy : enemies) {
                if (!enemy.isAlive()) continue;
                
                double dx = enemy.x - playerX;
                double dz = enemy.z - playerZ;
                double dist = Math.hypot(dx, dz);
                if (dist > attackRange) continue;
                
                double angle = Math.atan2(dx, dz) - playerYaw;
                if (Math.abs(angle) > attackAngle / 2) continue;
                
                int damage = currentWeapon.damage;
                boolean headshot = random.nextDouble() < 0.2;
                if (headshot) damage *= 2;
                
                enemy.takeDamage(damage, headshot);
                
                damageNumbers.add(new DamageNumber(
                    enemy.x, enemy.height * 0.8, enemy.z,
                    "-" + damage,
                    headshot ? new Color(255, 136, 0) : Color.RED,
                    headshot,
                    enemy.isBoss
                ));
                
                for (int i = 0; i < 5; i++) {
                    particles.add(new Particle(
                        enemy.x, enemy.height * 0.5, enemy.z,
                        (random.nextDouble() - 0.5) * 1.5,
                        random.nextDouble() * 1.5,
                        (random.nextDouble() - 0.5) * 1.5,
                        0.3 + random.nextDouble(),
                        0.02 + random.nextDouble() * 0.04,
                        new Color(200, 50, 50, 150)
                    ));
                }
                
                if (!enemy.isAlive()) {
                    onEnemyKilled(enemy);
                }
            }
        } else {
            if (isReloading) return;
            if (currentAmmo <= 0) {
                startReload();
                return;
            }
            if (!ammoReady) return;
            
            ammoReady = false;
            shootCooldown = currentWeapon.fireRate;
            currentAmmo--;
            
            double spread = currentWeapon.spread;
            double angleX = (random.nextDouble() - 0.5) * spread;
            double angleY = (random.nextDouble() - 0.5) * spread;
            
            for (Enemy enemy : enemies) {
                if (!enemy.isAlive()) continue;
                
                double dx = enemy.x - playerX;
                double dz = enemy.z - playerZ;
                double dist = Math.hypot(dx, dz);
                if (dist > currentWeapon.range) continue;
                
                double aimX = Math.sin(playerYaw + angleX);
                double aimZ = Math.cos(playerYaw + angleX);
                double toEnemyX = dx / dist;
                double toEnemyZ = dz / dist;
                
                double dot = aimX * toEnemyX + aimZ * toEnemyZ;
                double enemyRadius = enemy.width / 2;
                if (dot > 0.7 && dist < currentWeapon.range + enemyRadius) {
                    int damage = currentWeapon.damage;
                    boolean headshot = random.nextDouble() < 0.15 && dist < 5;
                    if (headshot) damage *= 2;
                    
                    enemy.takeDamage(damage, headshot);
                    
                    damageNumbers.add(new DamageNumber(
                        enemy.x, enemy.height * 0.8, enemy.z,
                        "-" + damage,
                        headshot ? new Color(255, 136, 0) : Color.RED,
                        headshot,
                        enemy.isBoss
                    ));
                    
                    for (int i = 0; i < 8; i++) {
                        particles.add(new Particle(
                            enemy.x, enemy.height * 0.5, enemy.z,
                            (random.nextDouble() - 0.5) * 2,
                            random.nextDouble() * 2,
                            (random.nextDouble() - 0.5) * 2,
                            0.3 + random.nextDouble(),
                            0.02 + random.nextDouble() * 0.04,
                            new Color(200, 50, 50, 150)
                        ));
                    }
                    
                    if (!enemy.isAlive()) {
                        onEnemyKilled(enemy);
                    }
                    break;
                }
            }
            
            for (int i = 0; i < 5; i++) {
                particles.add(new Particle(
                    playerX + Math.sin(playerYaw) * 1.5,
                    0.8,
                    playerZ + Math.cos(playerYaw) * 1.5,
                    (random.nextDouble() - 0.5) * 0.5,
                    random.nextDouble() * 0.5,
                    (random.nextDouble() - 0.5) * 0.5,
                    0.1 + random.nextDouble() * 0.1,
                    0.03 + random.nextDouble() * 0.05,
                    new Color(255, 200, 100, 200)
                ));
            }
            
            if (currentAmmo <= 0) {
                startReload();
            }
        }
    }
    
    private void tryHeavyAttack() {
        if (gamePaused || !gameRunning || gameOver) return;
        if (!currentWeapon.isMelee) return;
        if (meleeCooldown > 0) return;
        
        meleeCooldown = currentWeapon.fireRate * 1.5;
        
        double attackAngle = Math.PI / 2;
        double attackRange = currentWeapon.range * 1.3;
        int damage = (int)(currentWeapon.damage * 1.5);
        
        for (Enemy enemy : enemies) {
            if (!enemy.isAlive()) continue;
            
            double dx = enemy.x - playerX;
            double dz = enemy.z - playerZ;
            double dist = Math.hypot(dx, dz);
            if (dist > attackRange) continue;
            
            double angle = Math.atan2(dx, dz) - playerYaw;
            if (Math.abs(angle) > attackAngle / 2) continue;
            
            boolean headshot = random.nextDouble() < 0.3;
            int finalDamage = headshot ? damage * 2 : damage;
            
            enemy.takeDamage(finalDamage, headshot);
            
            damageNumbers.add(new DamageNumber(
                enemy.x, enemy.height * 0.8, enemy.z,
                "-" + finalDamage,
                headshot ? new Color(255, 136, 0) : new Color(255, 0, 0),
                headshot,
                enemy.isBoss
            ));
            
            for (int i = 0; i < 10; i++) {
                particles.add(new Particle(
                    enemy.x, enemy.height * 0.5, enemy.z,
                    (random.nextDouble() - 0.5) * 2.5,
                    random.nextDouble() * 2,
                    (random.nextDouble() - 0.5) * 2.5,
                    0.3 + random.nextDouble(),
                    0.02 + random.nextDouble() * 0.04,
                    new Color(200, 50, 50, 150)
                ));
            }
            
            if (!enemy.isAlive()) {
                onEnemyKilled(enemy);
            }
        }
    }
    
    private void startReload() {
        if (isReloading || currentWeapon.isMelee) return;
        if (currentAmmo >= currentWeapon.maxAmmo) return;
        isReloading = true;
        reloadTimer = currentWeapon.reloadTime;
    }
    
    private void onEnemyKilled(Enemy enemy) {
        kills++;
        int moneyGain = enemy.isBoss ? 100 : 10 + random.nextInt(20);
        money += moneyGain;
        score += enemy.isBoss ? 200 : 20;
        
        if (!currentWeapon.isMelee) {
            currentWeapon.xp += enemy.isBoss ? 25 : 5;
            if (currentWeapon.xp >= currentWeapon.level * 50) {
                currentWeapon.xp = 0;
                currentWeapon.level++;
                if (currentWeapon.level >= 10) {
                    currentWeapon.mastered = true;
                }
            }
        }
        
        if (random.nextDouble() < 0.05) {
            tools.get(1).owned = true;
        }
        
        if (random.nextDouble() < 0.02) {
            statPoints++;
        }
    }
    
    // ============================================================
    // GRENADE SYSTEM
    // ============================================================
    private void throwGrenade() {
        if (gamePaused || !gameRunning || gameOver) return;
        if (grenadeCooldown > 0) {
            return;
        }
        
        grenadeCooldown = GRENADE_MAX_COOLDOWN;
        grenadesThrown++;
        
        for (int i = 0; i < 50; i++) {
            double angle = random.nextDouble() * Math.PI * 2;
            double speed = 2 + random.nextDouble() * 4;
            particles.add(new Particle(
                playerX + Math.sin(playerYaw) * 2, 0.5, playerZ + Math.cos(playerYaw) * 2,
                Math.cos(angle) * speed,
                random.nextDouble() * 3,
                Math.sin(angle) * speed,
                0.5 + random.nextDouble(),
                0.05 + random.nextDouble() * 0.1,
                new Color(255, random.nextInt(100), 0, 200)
            ));
        }
        
        double explosionRadius = 4;
        int enemiesHit = 0;
        
        for (Enemy enemy : enemies) {
            if (!enemy.isAlive()) continue;
            double dist = Math.hypot(playerX - enemy.x, playerZ - enemy.z);
            if (dist < explosionRadius) {
                int damage = (int)(150 * (1 - dist / explosionRadius));
                damage = Math.max(10, damage);
                enemy.takeDamage(damage, false);
                enemiesHit++;
                
                damageNumbers.add(new DamageNumber(
                    enemy.x, enemy.height * 0.8, enemy.z,
                    "-" + damage,
                    new Color(255, 136, 0),
                    false,
                    enemy.isBoss
                ));
                
                double dx = enemy.x - playerX;
                double dz = enemy.z - playerZ;
                double d = Math.hypot(dx, dz);
                if (d > 0.01) {
                    enemy.x += (dx / d) * 2;
                    enemy.z += (dz / d) * 2;
                }
                
                if (!enemy.isAlive()) {
                    onEnemyKilled(enemy);
                }
            }
        }
        
        if (random.nextDouble() < 0.5) {
            spawnHorde();
        }
    }
    
    private void spawnHorde() {
        hordesSummoned++;
        int hordeSize = 10 + random.nextInt(40);
        
        double spawnRadius = 6 + random.nextDouble() * 3;
        
        for (int i = 0; i < hordeSize; i++) {
            double angle = random.nextDouble() * Math.PI * 2;
            double radius = spawnRadius + (random.nextDouble() - 0.5) * 2;
            
            double x = playerX + Math.cos(angle) * radius;
            double z = playerZ + Math.sin(angle) * radius;
            
            int cellX = (int)(x / CELL_SIZE);
            int cellZ = (int)(z / CELL_SIZE);
            if (cellX < 1 || cellX >= cols - 1 || cellZ < 1 || cellZ >= rows - 1) continue;
            if (walls[cellX][cellZ]) continue;
            
            String type = getRandomEnemyType();
            int hp = 10 + level * 2 + random.nextInt(5);
            double speed = 0.8 + random.nextDouble() * 0.6;
            int damage = 5 + level + random.nextInt(3);
            
            Enemy enemy = new Enemy(type, x, z, hp, speed, damage, false, getRandomEnemyColor(), getRandomGlowColor());
            enemy.collisionRadius = 0.4;
            enemies.add(enemy);
        }
    }
    
    // ============================================================
    // RENDERING
    // ============================================================
    @Override
    protected void paintComponent(Graphics g) {
        super.paintComponent(g);
        
        Graphics2D g2 = (Graphics2D) g;
        g2.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
        
        g2.setColor(Color.BLACK);
        g2.fillRect(0, 0, WIDTH, HEIGHT);
        
        if (!gameRunning) {
            drawMainMenu(g2);
        } else {
            drawGame(g2);
        }
    }
    
    private void drawGame(Graphics2D g2) {
        double viewX = playerX - WIDTH / 2;
        double viewZ = playerZ - HEIGHT / 2;
        
        g2.setColor(COLOR_FLOOR);
        g2.fillRect(0, 0, WIDTH, HEIGHT);
        
        for (int i = 0; i < cols; i++) {
            for (int j = 0; j < rows; j++) {
                double screenX = i * CELL_SIZE - viewX;
                double screenZ = j * CELL_SIZE - viewZ;
                
                if (screenX < -CELL_SIZE || screenX > WIDTH + CELL_SIZE ||
                    screenZ < -CELL_SIZE || screenZ > HEIGHT + CELL_SIZE) continue;
                
                if (walls[i][j]) {
                    g2.setColor(COLOR_WALL);
                    g2.fillRect((int)screenX, (int)screenZ, CELL_SIZE, CELL_SIZE);
                    g2.setColor(COLOR_WALL.brighter());
                    g2.drawRect((int)screenX, (int)screenZ, CELL_SIZE, CELL_SIZE);
                }
            }
        }
        
        double exitScreenX = exitX * CELL_SIZE + CELL_SIZE / 2 - viewX;
        double exitScreenZ = exitY * CELL_SIZE + CELL_SIZE / 2 - viewZ;
        g2.setColor(COLOR_EXIT);
        g2.fillOval((int)(exitScreenX - 10), (int)(exitScreenZ - 10), 20, 20);
        g2.setColor(COLOR_EXIT.brighter());
        g2.drawOval((int)(exitScreenX - 10), (int)(exitScreenZ - 10), 20, 20);
        
        for (Obstacle obs : obstacles) {
            double screenX = obs.x - viewX;
            double screenZ = obs.z - viewZ;
            if (screenX < -20 || screenX > WIDTH + 20 || screenZ < -20 || screenZ > HEIGHT + 20) continue;
            
            g2.setColor(obs.color);
            g2.fillRect((int)(screenX - obs.width * CELL_SIZE / 2), (int)(screenZ - obs.depth * CELL_SIZE / 2),
                       (int)(obs.width * CELL_SIZE), (int)(obs.depth * CELL_SIZE));
            g2.setColor(obs.color.brighter());
            g2.drawRect((int)(screenX - obs.width * CELL_SIZE / 2), (int)(screenZ - obs.depth * CELL_SIZE / 2),
                       (int)(obs.width * CELL_SIZE), (int)(obs.depth * CELL_SIZE));
        }
        
        for (Enemy enemy : enemies) {
            if (!enemy.isAlive()) continue;
            double screenX = enemy.x - viewX;
            double screenZ = enemy.z - viewZ;
            if (screenX < -50 || screenX > WIDTH + 50 || screenZ < -50 || screenZ > HEIGHT + 50) continue;
            
            int size = (int)(enemy.width * CELL_SIZE / 2);
            g2.setColor(enemy.color);
            g2.fillOval((int)(screenX - size), (int)(screenZ - size), size * 2, size * 2);
            
            g2.setColor(new Color(enemy.glowColor.getRed(), enemy.glowColor.getGreen(), enemy.glowColor.getBlue(), 50));
            g2.fillOval((int)(screenX - size * 1.5), (int)(screenZ - size * 1.5), size * 3, size * 3);
            
            g2.setColor(Color.RED);
            g2.fillOval((int)(screenX - 3), (int)(screenZ - 2), 3, 3);
            g2.fillOval((int)(screenX + 1), (int)(screenZ - 2), 3, 3);
            
            if (enemy.hp < enemy.maxHp) {
                int barWidth = 20;
                int barHeight = 3;
                double hpPercent = (double)enemy.hp / enemy.maxHp;
                g2.setColor(Color.RED);
                g2.fillRect((int)(screenX - barWidth / 2), (int)(screenZ - size - 8), barWidth, barHeight);
                g2.setColor(Color.GREEN);
                g2.fillRect((int)(screenX - barWidth / 2), (int)(screenZ - size - 8), (int)(barWidth * hpPercent), barHeight);
            }
            
            if (enemy.isBoss) {
                g2.setColor(new Color(255, 50, 50, 100));
                g2.fillOval((int)(screenX - size * 2), (int)(screenZ - size * 2), size * 4, size * 4);
                g2.setColor(Color.WHITE);
                g2.setFont(smallFont);
                g2.drawString("BOSS", (int)(screenX - 12), (int)(screenZ - size - 12));
            }
        }
        
        for (Particle p : particles) {
            double screenX = p.x - viewX;
            double screenZ = p.z - viewZ;
            if (screenX < -10 || screenX > WIDTH + 10 || screenZ < -10 || screenZ > HEIGHT + 10) continue;
            
            double alpha = p.life / p.maxLife;
            Color color = new Color(p.color.getRed(), p.color.getGreen(), p.color.getBlue(), (int)(alpha * 255));
            g2.setColor(color);
            int size = (int)(p.size * 20 * alpha);
            g2.fillOval((int)(screenX - size / 2), (int)(screenZ - size / 2), size, size);
        }
        
        for (DamageNumber dn : damageNumbers) {
            double screenX = dn.x - viewX;
            double screenZ = dn.z - viewZ;
            if (screenX < -50 || screenX > WIDTH + 50 || screenZ < -50 || screenZ > HEIGHT + 50) continue;
            
            double alpha = dn.life;
            Color color = new Color(dn.color.getRed(), dn.color.getGreen(), dn.color.getBlue(), (int)(alpha * 255));
            g2.setColor(color);
            g2.setFont(mainFont);
            g2.drawString(dn.text, (int)(screenX - 10), (int)(screenZ + 10 - (1 - dn.life) * 50));
        }
        
        double playerScreenX = playerX - viewX;
        double playerScreenZ = playerZ - viewZ;
        g2.setColor(COLOR_PLAYER);
        g2.fillOval((int)(playerScreenX - PLAYER_SIZE / 2), (int)(playerScreenZ - PLAYER_SIZE / 2), PLAYER_SIZE, PLAYER_SIZE);
        g2.setColor(COLOR_PLAYER.brighter());
        g2.drawOval((int)(playerScreenX - PLAYER_SIZE / 2), (int)(playerScreenZ - PLAYER_SIZE / 2), PLAYER_SIZE, PLAYER_SIZE);
        
        double dirX = Math.sin(playerYaw) * 20;
        double dirZ = Math.cos(playerYaw) * 20;
        g2.setColor(Color.WHITE);
        g2.drawLine((int)playerScreenX, (int)playerScreenZ, (int)(playerScreenX + dirX), (int)(playerScreenZ + dirZ));
        
        int cx = WIDTH / 2;
        int cy = HEIGHT / 2;
        g2.setColor(new Color(240, 176, 96, 150));
        g2.drawLine(cx - 15, cy, cx - 5, cy);
        g2.drawLine(cx + 5, cy, cx + 15, cy);
        g2.drawLine(cx, cy - 15, cx, cy - 5);
        g2.drawLine(cx, cy + 5, cx, cy + 15);
        g2.setColor(new Color(255, 50, 50, 100));
        g2.fillOval(cx - 2, cy - 2, 4, 4);
        
        drawHUD(g2);
        
        if (flashlightOn) {
            int radius = 300;
            RadialGradientPaint radialGradient = new RadialGradientPaint(
                new Point(cx, cy),
                radius,
                new float[]{0.0f, 0.7f, 1.0f},
                new Color[]{new Color(0, 0, 0, 0), new Color(0, 0, 0, 150), new Color(0, 0, 0, 220)}
            );
            g2.setPaint(radialGradient);
            g2.fillRect(0, 0, WIDTH, HEIGHT);
        } else {
            g2.setColor(new Color(0, 0, 0, 200));
            g2.fillRect(0, 0, WIDTH, HEIGHT);
        }
        
        g2.setColor(new Color(0, 0, 0, 20));
        for (int i = 0; i < HEIGHT; i += 3) {
            g2.drawLine(0, i, WIDTH, i);
        }
        
        if (gamePaused) {
            g2.setColor(new Color(0, 0, 0, 150));
            g2.fillRect(0, 0, WIDTH, HEIGHT);
            g2.setColor(COLOR_UI_GOLD);
            g2.setFont(titleFont);
            g2.drawString("PAUSED", WIDTH / 2 - 80, HEIGHT / 2);
            g2.setFont(smallFont);
            g2.setColor(Color.WHITE);
            g2.drawString("Press P to resume", WIDTH / 2 - 60, HEIGHT / 2 + 30);
        }
        
        if (gameOver) {
            g2.setColor(new Color(0, 0, 0, 200));
            g2.fillRect(0, 0, WIDTH, HEIGHT);
            g2.setColor(Color.RED);
            g2.setFont(titleFont);
            g2.drawString("SYSTEM COLLAPSE", WIDTH / 2 - 140, HEIGHT / 2 - 40);
            g2.setColor(Color.WHITE);
            g2.setFont(mainFont);
            g2.drawString("SCORE: " + score, WIDTH / 2 - 50, HEIGHT / 2 + 10);
            g2.drawString("SECTORS CLEARED: " + (level - 1), WIDTH / 2 - 80, HEIGHT / 2 + 35);
            g2.setColor(COLOR_UI_GOLD);
            g2.drawString("Press ENTER to restart", WIDTH / 2 - 80, HEIGHT / 2 + 80);
        }
        
        if (levelComplete) {
            g2.setColor(new Color(0, 0, 0, 150));
            g2.fillRect(0, 0, WIDTH, HEIGHT);
            g2.setColor(COLOR_UI_GREEN);
            g2.setFont(titleFont);
            g2.drawString("SECTOR PURGED", WIDTH / 2 - 120, HEIGHT / 2 - 20);
            g2.setColor(Color.WHITE);
            g2.setFont(mainFont);
            g2.drawString("Press ENTER to continue", WIDTH / 2 - 80, HEIGHT / 2 + 30);
        }
    }
    
    private void drawHUD(Graphics2D g2) {
        int healthX = 20;
        int healthY = HEIGHT - 60;
        int healthWidth = 200;
        int healthHeight = 16;
        
        g2.setColor(new Color(30, 25, 20));
        g2.fillRect(healthX, healthY, healthWidth, healthHeight);
        g2.setColor(new Color(50, 40, 30));
        g2.drawRect(healthX, healthY, healthWidth, healthHeight);
        
        double healthPercent = (double)health / maxHealth;
        Color healthColor = healthPercent > 0.5 ? new Color(100, 255, 100) :
                           healthPercent > 0.25 ? new Color(255, 200, 50) : Color.RED;
        g2.setColor(healthColor);
        g2.fillRect(healthX + 2, healthY + 2, (int)((healthWidth - 4) * healthPercent), healthHeight - 4);
        
        g2.setColor(Color.WHITE);
        g2.setFont(smallFont);
        g2.drawString("HEALTH", healthX + 5, healthY + 12);
        
        int ammoX = 240;
        int ammoY = HEIGHT - 60;
        g2.setColor(Color.WHITE);
        g2.setFont(mainFont);
        if (currentWeapon.isMelee) {
            g2.drawString("MELEE", ammoX, ammoY + 12);
        } else {
            String ammoText = isReloading ? "RELOADING..." : currentAmmo + "/" + currentWeapon.maxAmmo;
            g2.drawString(ammoText, ammoX, ammoY + 12);
        }
        
        g2.setColor(COLOR_UI_GOLD);
        g2.setFont(smallFont);
        g2.drawString(currentWeapon.name, ammoX, ammoY - 10);
        
        g2.setColor(Color.WHITE);
        g2.setFont(smallFont);
        g2.drawString("SCORE: " + score, 20, 25);
        g2.drawString("LEVEL: " + level, 20, 45);
        g2.drawString("ENEMIES: " + enemies.stream().filter(Enemy::isAlive).count(), 20, 65);
        
        g2.setColor(COLOR_UI_GREEN);
        g2.drawString("💰 " + money, 150, 25);
        
        g2.setColor(COLOR_UI_BLUE);
        g2.drawString("SANITY: " + sanity + "%", 150, 45);
        
        g2.setColor(grenadeCooldown > 0 ? new Color(255, 100, 50) : COLOR_UI_GREEN);
        g2.drawString("💣 " + (grenadeCooldown > 0 ? (int)Math.ceil(grenadeCooldown) + "s" : "READY"), 150, 65);
        
        if (statPoints > 0) {
            g2.setColor(COLOR_UI_PURPLE);
            g2.drawString("⭐ " + statPoints, 250, 25);
        }
        
        g2.setColor(COLOR_UI_GOLD);
        g2.setFont(smallFont);
        String mapName = "BUNKER";
        g2.drawString("MAP: " + mapName, WIDTH - 150, 25);
        
        g2.drawString("OBJECTIVE: " + (enemies.stream().filter(Enemy::isAlive).count() > 0 ? 
                     "DEFEAT ENEMIES" : "REACH EXIT"), WIDTH - 150, 45);
        
        boolean hasBoss = enemies.stream().anyMatch(e -> e.isBoss && e.isAlive());
        if (hasBoss) {
            g2.setColor(COLOR_UI_RED);
            g2.setFont(mainFont);
            g2.drawString("⚔ BOSS ⚔", WIDTH / 2 - 40, 30);
        }
    }
    
    private void drawMainMenu(Graphics2D g2) {
        g2.setColor(new Color(10, 8, 6));
        g2.fillRect(0, 0, WIDTH, HEIGHT);
        
        g2.setColor(new Color(240, 176, 96, 30));
        for (int i = 0; i < 20; i++) {
            int x = random.nextInt(WIDTH);
            int y = random.nextInt(HEIGHT);
            g2.drawLine(x, y, x + 50, y + 50);
        }
        
        g2.setColor(COLOR_UI_GOLD);
        g2.setFont(new Font("Dialog", Font.BOLD, 64));
        g2.drawString("BUNKER-9", WIDTH / 2 - 180, HEIGHT / 2 - 100);
        
        g2.setColor(new Color(180, 140, 80));
        g2.setFont(new Font("Dialog", Font.PLAIN, 20));
        g2.drawString("D E L I R I U M   S W E E P", WIDTH / 2 - 140, HEIGHT / 2 - 60);
        
        g2.setColor(Color.WHITE);
        g2.setFont(mainFont);
        g2.drawString("Press ENTER to start", WIDTH / 2 - 80, HEIGHT / 2 + 20);
        g2.drawString("Press S for Shop", WIDTH / 2 - 70, HEIGHT / 2 + 50);
        g2.drawString("Press T for Stats", WIDTH / 2 - 70, HEIGHT / 2 + 80);
        g2.drawString("Press O for Settings", WIDTH / 2 - 75, HEIGHT / 2 + 110);
        
        g2.setColor(new Color(100, 80, 60));
        g2.setFont(smallFont);
        g2.drawString("v2.0 - Java Edition", WIDTH / 2 - 60, HEIGHT - 30);
    }
    
    // ============================================================
    // INPUT HANDLING
    // ============================================================
    @Override
    public void keyPressed(KeyEvent e) {
        int key = e.getKeyCode();
        keys[key] = true;
        
        if (key == KeyEvent.VK_ESCAPE || key == KeyEvent.VK_P) {
            if (gameRunning) {
                gamePaused = !gamePaused;
            }
        }
        
        if (key == KeyEvent.VK_R) {
            toggleFlashlight();
        }
        
        if (key == KeyEvent.VK_G) {
            throwGrenade();
        }
        
        if (key == KeyEvent.VK_SPACE) {
            if (isGrounded && !gamePaused) {
                velocityY = JUMP_SPEED;
                isGrounded = false;
            }
        }
        
        if (key == KeyEvent.VK_C) {
            isCrouching = !isCrouching;
        }
        
        if (key == KeyEvent.VK_ENTER) {
            if (gameOver) {
                startGame();
            } else if (levelComplete) {
                levelComplete = false;
                buildLevel(level);
                playerX = CELL_SIZE * 0.5 + PLAYER_SIZE / 2;
                playerZ = CELL_SIZE * 0.5 + PLAYER_SIZE / 2;
            } else if (!gameRunning) {
                startGame();
            }
        }
    }
    
    @Override
    public void keyReleased(KeyEvent e) {
        keys[e.getKeyCode()] = false;
    }
    
    @Override
    public void keyTyped(KeyEvent e) {}
    
    @Override
    public void mousePressed(MouseEvent e) {
        if (e.getButton() == MouseEvent.BUTTON1) {
            tryAttack();
        }
        if (e.getButton() == MouseEvent.BUTTON3) {
            tryHeavyAttack();
        }
    }
    
    @Override
    public void mouseReleased(MouseEvent e) {}
    
    @Override
    public void mouseClicked(MouseEvent e) {}
    
    @Override
    public void mouseEntered(MouseEvent e) {}
    
    @Override
    public void mouseExited(MouseEvent e) {}
    
    @Override
    public void mouseMoved(MouseEvent e) {
        mouseX = e.getX();
        mouseY = e.getY();
        
        if (gameRunning && !gamePaused) {
            double dx = mouseX - WIDTH / 2;
            double dy = mouseY - HEIGHT / 2;
            playerYaw += dx * 0.005;
            playerPitch += dy * 0.005;
            playerPitch = Math.max(-1.2, Math.min(1.2, playerPitch));
            
            if (hasFocus()) {
                try {
                    Robot robot = new Robot();
                    robot.mouseMove(getLocationOnScreen().x + WIDTH / 2, getLocationOnScreen().y + HEIGHT / 2);
                } catch (Exception ex) {}
            }
        }
    }
    
    @Override
    public void mouseDragged(MouseEvent e) {
        mouseMoved(e);
    }
    
    private void toggleFlashlight() {
        flashlightOn = !flashlightOn;
    }
    
    // ============================================================
    // GAME LOOP
    // ============================================================
    @Override
    public void run() {
        long lastUpdate = System.nanoTime();
        double dt = 0;
        
        while (true) {
            long currentTime = System.nanoTime();
            dt = (currentTime - lastUpdate) / 1_000_000_000.0;
            lastUpdate = currentTime;
            
            if (dt > 0.05) dt = 0.05;
            
            update(dt);
            repaint();
            
            try {
                Thread.sleep(1000 / FPS);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }
    }
    
    // ============================================================
    // MAIN METHOD
    // ============================================================
    public static void main(String[] args) {
        JFrame frame = new JFrame("BUNKER-9 :: DELIRIUM SWEEP");
        BUNKER9 game = new BUNKER9();
        
        frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        frame.setResizable(false);
        frame.add(game);
        frame.pack();
        frame.setLocationRelativeTo(null);
        frame.setVisible(true);
        
        game.startGame();
    }
}