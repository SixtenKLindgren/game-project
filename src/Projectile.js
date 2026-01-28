import GameObject from './GameObject.js'

export default class Projectile extends GameObject {
    constructor(game, x, y, directionX, directionY = 0) {
        super(game, x, y, 12, 6)
        this.directionX = directionX // -1 för vänster, 1 för höger (eller normaliserad vektor)
        this.directionY = directionY // 0 för horisontell rörelse (eller normaliserad vektor)
        this.speed = 0.5 // pixels per millisekund
        this.startX = x // Spara startposition
        this.startY = y
        this.maxDistance = 800 // Max en skärm långt
        this.color = 'orange'
    }
    
    update(deltaTime) {
        // Flytta projektilen i 2D
        this.x += this.directionX * this.speed * deltaTime
        this.y += this.directionY * this.speed * deltaTime
        
        // Kolla om projektilen har flugit för långt (2D-distans)
        const dx = this.x - this.startX
        const dy = this.y - this.startY
        const distanceTraveled = Math.sqrt(dx * dx + dy * dy)
        if (distanceTraveled > this.maxDistance) {
            this.markedForDeletion = true
        }
    }
    
    draw(ctx, camera = null) {
        // Beräkna screen position
        const screenX = camera ? this.x - camera.x : this.x
        const screenY = camera ? this.y - camera.y : this.y
        
        // Rita projektilen som en avlång rektangel
        ctx.fillStyle = this.color
        ctx.fillRect(screenX, screenY, this.width, this.height)

        ctx.strokeStyle = 'black'
        ctx.lineWidth = 1
        ctx.strokeRect(screenX, screenY, this.width, this.height)
    }
}
