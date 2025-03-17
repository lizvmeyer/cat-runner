// Game configuration
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 800 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

// Initialize game
const game = new Phaser.Game(config);

// Global variables
let player;
let platforms;
let treats;
let score = 0;
let scoreText;
let cursors;

function preload() {
    // Load assets
    this.load.image('background', 'assets/background.png');
    this.load.image('ground', 'assets/platform.png');
    this.load.image('treat', 'assets/treat.png');
    this.load.spritesheet('cat', 'assets/cat_sprite.png', { 
        frameWidth: 64, 
        frameHeight: 64 
    });
}

function create() {
    // Add background
    this.add.image(400, 300, 'background');
    
    // Create platforms group
    platforms = this.physics.add.staticGroup();
    
    // Create ground
    platforms.create(400, 580, 'ground').setScale(2).refreshBody();
    
    // Create some platforms
    platforms.create(600, 400, 'ground');
    platforms.create(50, 250, 'ground');
    platforms.create(750, 220, 'ground');
    
    // Create player
    player = this.physics.add.sprite(100, 450, 'cat');
    player.setBounce(0.2);
    player.setCollideWorldBounds(true);
    
    // Player animations
    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('cat', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
    });
    
    this.anims.create({
        key: 'turn',
        frames: [ { key: 'cat', frame: 4 } ],
        frameRate: 20
    });
    
    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('cat', { start: 5, end: 8 }),
        frameRate: 10,
        repeat: -1
    });
    
    // Create treats
    treats = this.physics.add.group({
        key: 'treat',
        repeat: 11,
        setXY: { x: 12, y: 0, stepX: 70 }
    });
    
    treats.children.iterate(function (child) {
        child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
    });
    
    // Set up collisions
    this.physics.add.collider(player, platforms);
    this.physics.add.collider(treats, platforms);
    
    // Collect treats on overlap
    this.physics.add.overlap(player, treats, collectTreat, null, this);
    
    // Score display
    scoreText = this.add.text(16, 16, 'Score: 0', { 
        fontSize: '32px', 
        fill: '#ff78a7',
        fontFamily: 'Arial Rounded MT Bold' 
    });
    
    // Input controls
    cursors = this.input.keyboard.createCursorKeys();
}

function update() {
    // Player movement
    if (cursors.left.isDown) {
        player.setVelocityX(-260);
        player.anims.play('left', true);
    } else if (cursors.right.isDown) {
        player.setVelocityX(260);
        player.anims.play('right', true);
    } else {
        player.setVelocityX(0);
        player.anims.play('turn');
    }
    
    // Jump when up arrow pressed and player is on ground
    if (cursors.up.isDown && player.body.touching.down) {
        player.setVelocityY(-500);
    }
}

function collectTreat(player, treat) {
    treat.disableBody(true, true);
    
    // Update score
    score += 10;
    scoreText.setText('Score: ' + score);
    
    // Play collect sound (if we had one)
    // this.sound.play('collect');
    
    // Check if all treats are collected
    if (treats.countActive(true) === 0) {
        // Respawn treats
        treats.children.iterate(function (child) {
            child.enableBody(true, child.x, 0, true, true);
        });
    }
}
