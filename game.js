// Game configuration
const config = {
    type: Phaser.CANVAS,
    width: 800,
    height: 600,
    backgroundColor: '#ffd6e0',
    render: {
        pixelArt: true,
        antialias: false
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 800 },
            debug: true
        }
    },
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
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

// Initialize game with error handling
try {
    const game = new Phaser.Game(config);
    console.log('Game initialized successfully');
} catch (error) {
    console.error('Error initializing game:', error);
}

// Global variables
let player = null;
let platforms = null;
let treats = null;
let score = 0;
let highScore = 0;
let scoreText;
let highScoreText;
let cursors;
let debugText;
let gameStarted = false;
let isDead = false;
const DEATH_Y = 550; // Y position where cat dies

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

    // Create platforms group immediately
    platforms = this.physics.add.staticGroup();
    
    // Create treats group immediately
    treats = this.physics.add.group();

    // Create start text
    const startText = this.add.text(400, 300, 'Click to Start', {
        fontSize: '32px',
        fill: '#ff78a7',
        backgroundColor: '#ffffff80',
        padding: { x: 20, y: 10 }
    }).setOrigin(0.5);

    // Add click handler to start the game
    this.input.on('pointerdown', () => {
        if (!gameStarted) {
            console.log('Game started');
            startText.destroy();
            createGameElements.call(this);
            gameStarted = true;
        }
    });
}

function createGameElements() {
    console.log('Setting up game elements...');
    
    // Create ground and platforms
    const groundY = 550;
    platforms.create(400, groundY, 'ground').setScale(2, 0.5).refreshBody();
    platforms.create(600, 400, 'ground').setScale(1, 0.5).refreshBody();
    platforms.create(50, 350, 'ground').setScale(1, 0.5).refreshBody();
    platforms.create(750, 320, 'ground').setScale(1, 0.5).refreshBody();

    // Create treats
    for (let i = 0; i < 12; i++) {
        const treat = treats.create(50 + (i * 70), 0, 'treat');
        treat.setBounceY(0.5);
        treat.setCollideWorldBounds(true);
        treat.setScale(0.75);
    }

    // Create animations
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
            { key: 'cat-walk2' }
        ],
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'jump',
        frames: [{ key: 'cat-jump' }],
        frameRate: 1
    });

    // Create player
    player = this.physics.add.sprite(100, 100, 'cat-idle');
    player.setBounce(0.2);
    player.setCollideWorldBounds(true);
    player.play('idle');

    // Set up collisions
    if (player && platforms) {
        this.physics.add.collider(player, platforms);
    }
    if (treats && platforms) {
        this.physics.add.collider(treats, platforms);
    }
    if (player && treats) {
        this.physics.add.overlap(player, treats, collectTreat, null, this);
    }

    // Add score displays
    scoreText = this.add.text(16, 16, 'Score: 0', {
        fontSize: '24px',
        fill: '#ff78a7',
        backgroundColor: '#ffffff80',
        padding: { x: 10, y: 5 }
    });

    highScoreText = this.add.text(16, 50, `High Score: ${highScore}`, {
        fontSize: '24px',
        fill: '#ff78a7',
        backgroundColor: '#ffffff80',
        padding: { x: 10, y: 5 }
    });
}

function update() {
    if (!gameStarted || !player) return;
    if (isDead) return; // Don't process input if dead

    // Get keyboard state
    const leftKey = cursors.left.isDown || this.input.keyboard.addKey('A').isDown;
    const rightKey = cursors.right.isDown || this.input.keyboard.addKey('D').isDown;
    const upKey = cursors.up.isDown || this.input.keyboard.addKey('W').isDown;

    // Check for fall death
    if (player.y > DEATH_Y && !isDead) {
        killPlayer.call(this);
        return;
    }

    // Movement
    const moveSpeed = 200;
    if (leftKey) {
        player.setVelocityX(-moveSpeed);
        player.flipX = true;
        if (player.body.touching.down) {
            player.play('walk', true);
        }
    } else if (rightKey) {
        player.setVelocityX(moveSpeed);
        player.flipX = false;
        if (player.body.touching.down) {
            player.play('walk', true);
        }
    } else {
        player.setVelocityX(0);
        if (player.body.touching.down) {
            player.play('idle', true);
        }
    }

    // Jumping
    if (upKey && player.body.touching.down) {
        player.setVelocityY(-550);
        player.play('jump');
    }

    if (!player.body.touching.down) {
        player.play('jump', true);
    }

    // Update debug display
    debugText.setText(
        `Score: ${score}\n` +
        `X: ${Math.round(player.x)} Y: ${Math.round(player.y)}\n` +
        `On Ground: ${player.body.touching.down}`
    );
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

// Add this new function for handling player death
function killPlayer() {
    isDead = true;
    
    // Stop player movement
    player.setVelocity(0, 0);
    player.play('idle');

    // Create death animation (falling off screen)
    this.tweens.add({
        targets: player,
        y: player.y + 100,
        alpha: 0,
        duration: 1000,
        ease: 'Power1',
        onComplete: () => {
            // Show death message
            const deathText = this.add.text(400, 300, 'Oh no! Cat fell!', {
                fontSize: '32px',
                fill: '#ff78a7',
                backgroundColor: '#ffffff80',
                padding: { x: 20, y: 10 }
            }).setOrigin(0.5);

            // Wait a moment before resetting
            this.time.delayedCall(2000, () => {
                deathText.destroy();
                resetGame.call(this);
            });
        }
    });
}

// Update the reset game function
function resetGame() {
    // Update high score
    if (score > highScore) {
        highScore = score;
        highScoreText.setText(`High Score: ${highScore}`);
    }

    // Reset player
    player.setPosition(100, 100);
    player.setVelocity(0, 0);
    player.setAlpha(1); // Reset visibility
    player.play('idle');
    isDead = false;

    // Reset score
    score = 0;
    scoreText.setText('Score: 0');

    // Respawn treats
    treats.children.iterate(function (child) {
        child.enableBody(true, child.x, 0, true, true);
    });

    // Show reset message
    const resetText = this.add.text(400, 300, 'Try Again!', {
        fontSize: '32px',
        fill: '#ff78a7',
        backgroundColor: '#ffffff80',
        padding: { x: 20, y: 10 }
    }).setOrigin(0.5);

    // Remove the message after 2 seconds
    this.time.delayedCall(2000, () => {
        resetText.destroy();
    });
} 
