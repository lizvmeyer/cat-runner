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
    // Load assets with debug logging
    console.log('Loading assets...');
    
    this.load.image('background', 'assets/background.png');
    this.load.image('ground', 'assets/platform.png');
    this.load.image('treat', 'assets/treat.png');
    
    // Load separate cat images instead of spritesheet
    this.load.image('cat-idle', 'assets/cat-idle.png');
    this.load.image('cat-walk1', 'assets/cat-walk1.png');
    this.load.image('cat-walk2', 'assets/cat-walk2.png');
    this.load.image('cat-walk3', 'assets/cat-walk3.png');
    this.load.image('cat-jump', 'assets/cat-jump.png');
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
    
    // Create platforms - adjusted heights to be more reachable
    platforms.create(600, 400, 'ground').setScale(1, 0.5).refreshBody();
    platforms.create(50, 350, 'ground').setScale(1, 0.5).refreshBody(); // Lowered from 250
    platforms.create(750, 320, 'ground').setScale(1, 0.5).refreshBody(); // Lowered from 220
    
    // Create treats
    treats = this.physics.add.group({
        key: 'treat',
        repeat: 11,  // This creates 12 treats total
        setXY: { 
            x: 50,   // Start position
            y: 0,    // Start at top
            stepX: 70 // Space between treats
        }
    });
    
    // Make treats bounce a bit
    treats.children.iterate(function (child) {
        child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
        child.setScale(0.5); // Make treats smaller if needed
    });
    
    // Set up collisions
    this.physics.add.collider(player, platforms);
    this.physics.add.collider(treats, platforms);
    
    // Collect treats on overlap
    this.physics.add.overlap(player, treats, collectTreat, null, this);
    
    // Add score text
    scoreText = this.add.text(16, 16, 'Score: 0', { 
        fontSize: '32px', 
        fill: '#ff78a7',
        fontFamily: 'Arial' 
    });
    
    // Update debug text
    debugText.setText('Use Arrow Keys or WASD to move\nPress Up or W to jump');

    // Create cat animations using separate frames
    this.anims.create({
        key: 'idle',
        frames: [{ key: 'cat-idle' }],
        frameRate: 10
    });

    this.anims.create({
        key: 'walk',
        frames: [
            { key: 'cat-walk1' },
            { key: 'cat-walk2' },
            { key: 'cat-walk3' },
            { key: 'cat-walk2' } // Use walk2 again for a smoother loop
        ],
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'jump',
        frames: [{ key: 'cat-jump' }],
        frameRate: 1
    });

    // Create player with animations - start with idle frame
    player = this.physics.add.sprite(100, 100, 'cat-idle');
    player.setBounce(0.2);
    player.setCollideWorldBounds(true);
    player.play('idle');
}

function update() {
    if (!gameStarted || !player) return;

    // Get keyboard state
    const leftKey = cursors.left.isDown || this.input.keyboard.addKey('A').isDown;
    const rightKey = cursors.right.isDown || this.input.keyboard.addKey('D').isDown;
    const upKey = cursors.up.isDown || this.input.keyboard.addKey('W').isDown;

    // Update debug display
    debugText.setText(
        `Score: ${score}\n` +
        `X: ${Math.round(player.x)} Y: ${Math.round(player.y)}\n` +
        `On Ground: ${player.body.touching.down}`
    );

    // Movement
    const moveSpeed = 200;
    if (leftKey) {
        player.setVelocityX(-moveSpeed);
    } else if (rightKey) {
        player.setVelocityX(moveSpeed);
    } else {
        player.setVelocityX(0);
    }

    // Jumping - increased jump force
    const jumpForce = -550; // Increased from -400
    if (upKey && player.body.touching.down) {
        player.setVelocityY(jumpForce);
        console.log('Jumping');
    }
}

// Treat collection function
function collectTreat(player, treat) {
    treat.disableBody(true, true);
    
    score += 10;
    scoreText.setText('Score: ' + score);
    
    // Optional: Respawn treats when all are collected
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
