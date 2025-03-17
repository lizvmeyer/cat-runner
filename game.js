// Game configuration
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 800 },
            debug: true
        }
    },
    input: {
        keyboard: true,
        gamepad: false
    },
    scene: {
        init: init,
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
let debugText;
let gameStarted = false;

function init() {
    // Initialize input system
    console.log('Game initializing...');
}

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
    console.log('Creating game elements...');
    
    // Add background
    this.add.image(400, 300, 'background');
    
    // Initialize keyboard inputs multiple ways
    cursors = this.input.keyboard.createCursorKeys();
    
    // Add WASD keys
    this.input.keyboard.addKeys('W,S,A,D');
    
    // Add keyboard event listeners
    this.input.keyboard.on('keydown', function (event) {
        console.log('Key pressed:', event.code);
    });

    // Add debug text at the top
    debugText = this.add.text(16, 16, 'Click to start\nUse Arrow Keys or WASD to move', {
        fontSize: '20px',
        fill: '#000',
        backgroundColor: '#ffffff80',
        padding: { x: 10, y: 5 }
    });

    // Create a start button
    const startButton = this.add.text(400, 300, 'Click to Start', {
        fontSize: '32px',
        fill: '#fff',
        backgroundColor: '#000',
        padding: { x: 20, y: 10 }
    })
    .setOrigin(0.5)
    .setInteractive()
    .on('pointerdown', () => {
        console.log('Game started');
        startButton.destroy();
        createGameElements.call(this);
        gameStarted = true;
    });
}

function createGameElements() {
    console.log('Setting up game elements...');
    
    // Create platforms
    platforms = this.physics.add.staticGroup();
    
    // Create ground
    let groundY = 550;
    platforms.create(400, groundY, 'ground').setScale(2, 0.5).refreshBody();
    
    // Create platforms
    platforms.create(600, 400, 'ground').setScale(1, 0.5).refreshBody();
    platforms.create(50, 250, 'ground').setScale(1, 0.5).refreshBody();
    platforms.create(750, 220, 'ground').setScale(1, 0.5).refreshBody();
    
    // Create player
    player = this.physics.add.sprite(100, 300, 'cat');
    player.setBounce(0.2);
    player.setCollideWorldBounds(true);
    
    // Set up collisions
    this.physics.add.collider(player, platforms);
    
    // Update debug text
    debugText.setText('Use Arrow Keys or WASD to move\nPress Up or W to jump');
}

function update() {
    if (!gameStarted || !player) return;

    // Get keyboard state
    const leftKey = cursors.left.isDown || this.input.keyboard.addKey('A').isDown;
    const rightKey = cursors.right.isDown || this.input.keyboard.addKey('D').isDown;
    const upKey = cursors.up.isDown || this.input.keyboard.addKey('W').isDown;

    // Update debug display
    debugText.setText(
        `Left: ${leftKey} Right: ${rightKey} Up: ${upKey}\n` +
        `X: ${Math.round(player.x)} Y: ${Math.round(player.y)}\n` +
        `VelX: ${Math.round(player.body.velocity.x)} VelY: ${Math.round(player.body.velocity.y)}`
    );

    // Movement
    if (leftKey) {
        player.setVelocityX(-200);
        console.log('Moving left');
    } else if (rightKey) {
        player.setVelocityX(200);
        console.log('Moving right');
    } else {
        player.setVelocityX(0);
    }

    // Jumping
    if (upKey && player.body.touching.down) {
        player.setVelocityY(-400);
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
