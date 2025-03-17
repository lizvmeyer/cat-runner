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
let gameStarted = false;

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
    
    // Create ground - adjust position and size to match visible ground
    let groundY = 550; // Move ground up
    let ground = platforms.create(400, groundY, 'ground');
    ground.setScale(2, 0.5); // Adjust scale to match visible platform
    ground.refreshBody(); // Important: refresh physics body after scaling
    
    // Create platforms - adjust positions to match visible platforms
    platforms.create(600, 400, 'ground').setScale(1, 0.5).refreshBody();
    platforms.create(50, 250, 'ground').setScale(1, 0.5).refreshBody();
    platforms.create(750, 220, 'ground').setScale(1, 0.5).refreshBody();
    
    // Create player - spawn above ground
    player = this.physics.add.sprite(100, groundY - 100, 'cat');
    player.setBounce(0.2);
    player.setCollideWorldBounds(true);
    
    // Adjust player collision box if needed
    player.body.setSize(48, 48); // Make collision box slightly smaller than sprite
    player.body.setOffset(8, 8); // Center the collision box
    
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

    // Make sure physics collision is working
    this.physics.world.setBounds(0, 0, 800, 600);
    this.physics.world.gravity.y = 1000; // Increase gravity slightly
}

function update() {
    if (!gameStarted) return;

    // Update debug info
    debugText.setText(
        `Player X: ${player ? Math.round(player.x) : 'N/A'} Y: ${player ? Math.round(player.y) : 'N/A'}\n` +
        `Velocity X: ${player ? Math.round(player.body.velocity.x) : 'N/A'} Y: ${player ? Math.round(player.body.velocity.y) : 'N/A'}\n` +
        `On Ground: ${player ? player.body.touching.down : 'N/A'}\n` +
        `Left Key: ${cursors.left.isDown}\n` +
        `Right Key: ${cursors.right.isDown}\n` +
        `Up Key: ${cursors.up.isDown}`
    );

    // Player movement with better controls
    const moveSpeed = 200;
    const jumpForce = -400;

    // Horizontal movement
    if (cursors.left.isDown) {
        player.setVelocityX(-moveSpeed);
        player.anims.play('left', true);
    } else if (cursors.right.isDown) {
        player.setVelocityX(moveSpeed);
        player.anims.play('right', true);
    } else {
        // Add some deceleration
        player.setVelocityX(player.body.velocity.x * 0.8);
        if (Math.abs(player.body.velocity.x) < 10) {
            player.setVelocityX(0);
        }
        player.anims.play('turn');
    }
    
    // Jumping - make it more responsive
    if (cursors.up.isDown && player.body.touching.down) {
        player.setVelocityY(jumpForce);
        console.log('Jump executed!');
    }

    // Add a small vertical velocity check to prevent floating
    if (!player.body.touching.down && player.body.velocity.y < 15) {
        player.setVelocityY(player.body.velocity.y + 15);
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
