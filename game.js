// Game configuration
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 800 },
            debug: true // Enable physics debugging
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    },
    input: {
        keyboard: true // Explicitly enable keyboard input
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
let debugText;

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
        fontFamily: 'Arial' 
    });
    
    // Debug text
    debugText = this.add.text(16, 50, 'Debug Info', { 
        fontSize: '18px', 
        fill: '#000' 
    });

    // Input controls
    cursors = this.input.keyboard.createCursorKeys();
    
    // Log that creation is complete
    console.log('Game creation complete');
    console.log('Cursors initialized:', cursors);
}

function update() {
    // Update debug text
    debugText.setText(
        `Player X: ${Math.round(player.x)} Y: ${Math.round(player.y)}\n` +
        `Velocity X: ${Math.round(player.body.velocity.x)} Y: ${Math.round(player.body.velocity.y)}\n` +
        `On Ground: ${player.body.touching.down}\n` +
        `Left Key: ${cursors.left.isDown}\n` +
        `Right Key: ${cursors.right.isDown}\n` +
        `Up Key: ${cursors.up.isDown}`
    );

    // Player movement with console logging
    if (cursors.left.isDown) {
        player.setVelocityX(-260);
        player.anims.play('left', true);
        console.log('Moving left');
    } else if (cursors.right.isDown) {
        player.setVelocityX(260);
        player.anims.play('right', true);
        console.log('Moving right');
    } else {
        player.setVelocityX(0);
        player.anims.play('turn');
    }
    
    // Jump when up arrow pressed and player is on ground
    if (cursors.up.isDown && player.body.touching.down) {
        player.setVelocityY(-500);
        console.log('Jumping');
    }
}

function collectTreat(player, treat) {
    treat.disableBody(true, true);
    
    score += 10;
    scoreText.setText('Score: ' + score);
    console.log('Treat collected! Score:', score);
    
    if (treats.countActive(true) === 0) {
        treats.children.iterate(function (child) {
            child.enableBody(true, child.x, 0, true, true);
        });
    }
}

// Add keyboard event listeners for debugging
document.addEventListener('keydown', function(event) {
    console.log('Key pressed:', event.key);
});
