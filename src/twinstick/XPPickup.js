import GameObject from '../GameObject.js'

export default class XPPickup extends GameObject {
    constructor(game, x, y, options = {}) {
        super(game, x, y, 16, 16)
        this.color = '#21759b'
        this.XPValue = 1 // Varje pickup ger 1 XP
        
        // Physics för "flying" pickups
        this.velocityX = options.velocityX || 0
        this.velocityY = options.velocityY || 0
        this.gravity = options.gravity || 0.0008 // Gravitation
        this.groundY = y // Target Y position (marken)
        this.isFlying = options.isFlying || false
        this.bounce = 0.4 // Hur mycket den studsar
        
        // Visual effects
        this.scale = 1
        this.rotation = 0
        this.rotationSpeed = options.rotationSpeed || 0
    }

    update(deltaTime) {
        if (this.isFlying) {
            // Applicera velocity
            this.x += this.velocityX * deltaTime
            this.y += this.velocityY * deltaTime
            
            // Applicera gravitation
            this.velocityY += this.gravity * deltaTime
            
            // Rotation under flygning
            this.rotation += this.rotationSpeed * deltaTime
            
            // Kolla om vi landat
            if (this.y >= this.groundY) {
                this.y = this.groundY
                
                // Studsa om velocity är tillräckligt hög
                if (Math.abs(this.velocityY) > 0.1) {
                    this.velocityY = -this.velocityY * this.bounce
                    this.velocityX *= this.bounce
                } else {
                    // Sluta flyga
                    this.isFlying = false
                    this.velocityX = 0
                    this.velocityY = 0
                    this.rotation = 0
                    
                    // Lite "settle" animation
                    this.scale = 1.2
                }
            }
        } else if (this.scale > 1) {
            // Ease tillbaka till normal storlek
            this.scale -= deltaTime * 0.001
            if (this.scale < 1) this.scale = 1
        }
    }

    draw(ctx, camera) {
        const screenX = this.x - camera.x
        const screenY = this.y - camera.y

        ctx.save()
        
        // Applicera transformationer
        ctx.translate(screenX + this.width / 2, screenY + this.height / 2)
        ctx.rotate(this.rotation)
        ctx.scale(this.scale, this.scale)
        
        ctx.fillStyle = this.color
        ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height)
        
        ctx.strokeStyle = 'black'
        ctx.lineWidth = 2
        ctx.strokeRect(-this.width / 2, -this.height / 2, this.width, this.height)
        
        ctx.restore()
    }
}
