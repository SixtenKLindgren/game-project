import InputHandler from './InputHandler.js'
import UserInterface from './UserInterface.js'
import Camera from './Camera.js'

/**
 * Abstract base class för alla speltyper
 * Innehåller ENDAST gemensam funktionalitet som alla spel behöver
 * Subklasser (t.ex. PlatformerGame, SpaceShooterGame) implementerar specifik logik
 */
export default class GameBase {
    constructor(canvas) {
        // Förhindra direkt instansiering av GameBase
        if (new.target === GameBase) {
            throw new Error('GameBase är en abstract class och kan inte instansieras direkt')
        }

        // Canvas dimensioner
        this.canvas = canvas
        this.width = canvas.width
        this.height = canvas.height
        
        // World size - kan överskridas av subklasser
        // Default: samma som canvas (ingen scrolling)
        this.worldWidth = this.width
        this.worldHeight = this.height

        // Gemensam game state
        this.gameState = 'MENU' // MENU, PLAYING, PAUSED, GAME_OVER, WIN
        this.score = 0
        this.currentMenu = null // Nuvarande meny som visas

        // Gemensamma system som alla spel behöver
        this.inputHandler = new InputHandler(this)
        this.ui = new UserInterface(this)
        
        // Camera - alla spel kan ha en kamera (även om den inte scrollar)
        this.camera = new Camera(0, 0, this.width, this.height)
        this.camera.setWorldBounds(this.worldWidth, this.worldHeight)

        // Gemensamma object arrays - kan användas av de flesta speltyper
        this.enemies = []
    }

    /**
     * Abstract method - måste implementeras av subklasser
     * Initierar spel-specifika objekt och state
     */
    init() {
        throw new Error('init() måste implementeras av subklass')
    }

    /**
     * Abstract method - måste implementeras av subklasser
     * Återställer spelet till initial state
     */
    restart() {
        throw new Error('restart() måste implementeras av subklass')
    }

    /**
     * Abstract method - måste implementeras av subklasser
     * Uppdaterar spelets logik varje frame
     */
    update(deltaTime) {
        throw new Error('update() måste implementeras av subklass')
    }

    /**
     * Abstract method - måste implementeras av subklasser
     * Ritar spelet på canvas
     */
    draw(ctx) {
        throw new Error('draw() måste implementeras av subklass')
    }
}
