export default class Menu {
    constructor(game) {
        this.game = game
        this.visible = true
        
        // Subclasses must provide these
        this.title = this.getTitle()
        this.options = this.getOptions()
        
        // Hitta första valbara option (skippa null actions)
        this.selectedIndex = 0
        for (let i = 0; i < this.options.length; i++) {
            if (this.options[i].action !== null) {
                this.selectedIndex = i
                break
            }
        }
        
        // Visual styling
        this.backgroundColor = 'rgba(0, 0, 0, 0.7)'
        this.titleColor = '#FFFFFF'
        this.optionColor = '#CCCCCC'
        this.selectedColor = '#FFD700'
        this.keyColor = '#4CAF50'
    }
    
    // Abstract methods - subclasses must override
    getTitle() {
        throw new Error('Menu subclass must implement getTitle()')
    }
    
    getOptions() {
        throw new Error('Menu subclass must implement getOptions()')
    }
    
    update(deltaTime) {
         if (!this.game.inputHandler || !this.game.inputHandler.keys) {
            return
        }
        const keys = this.game.inputHandler.keys
        
        // Kolla Enter för vald option
        if (keys.has('Enter')) {
            const selectedOption = this.options[this.selectedIndex]
            if (selectedOption && selectedOption.action) {
                selectedOption.action()
                this.game.inputHandler.keys.clear()
            }
        }
        
        // Kolla om någon key-shortcut har tryckts
        this.options.forEach(option => {
            if (option.key && option.action && keys.has(option.key)) {
                option.action()
                this.game.inputHandler.keys.clear()
            }
        })
        
        // Pil upp/ner för att navigera
        if (keys.has('ArrowDown')) {
            // Hitta nästa valbara option (skippa null actions)
            let newIndex = this.selectedIndex
            do {
                newIndex = (newIndex + 1) % this.options.length
            } while (this.options[newIndex].action === null && newIndex !== this.selectedIndex)
            this.selectedIndex = newIndex
            this.game.inputHandler.keys.clear()
        }
        if (keys.has('ArrowUp')) {
            // Hitta föregående valbara option (skippa null actions)
            let newIndex = this.selectedIndex
            do {
                newIndex = (newIndex - 1 + this.options.length) % this.options.length
            } while (this.options[newIndex].action === null && newIndex !== this.selectedIndex)
            this.selectedIndex = newIndex
            this.game.inputHandler.keys.clear()
        }


    }
    
    draw(ctx) {
        if (!this.visible) return
        
        ctx.save()
        
        // Rita halvgenomskinlig bakgrund
        if (this.solidBackground) {
            ctx.fillStyle = '#709A72'
        } else {
            ctx.fillStyle = this.backgroundColor
        }
        ctx.fillRect(0, 0, this.game.width, this.game.height)

        // Rita title
        ctx.fillStyle = this.titleColor
        ctx.font = 'bold 48px Arial'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(this.title, this.game.width / 2, 80)
        
        // Rita options
        const startY = 160
        const lineHeight = 60
        
        this.options.forEach((option, index) => {
            const y = startY + index * lineHeight
            const isSelected = index === this.selectedIndex
            
            // Rita option text
            ctx.font = '32px Arial'
            ctx.fillStyle = isSelected ? this.selectedColor : this.optionColor
            
            // Lägg till ">" för vald option
            const prefix = isSelected ? '> ' : '  '
            let displayText = prefix + option.text
            
            // Lägg till key hint om det finns
            if (option.key) {
                ctx.fillText(displayText, this.game.width / 2 - 80, y)
                
                // Rita key hint i grön
                ctx.fillStyle = this.keyColor
                ctx.font = 'bold 24px Arial'
                ctx.fillText(`[${option.key}]`, this.game.width / 2 + 150, y)
            } else {
                ctx.fillText(displayText, this.game.width / 2, y)
            }
        })
        
        // Rita instruktioner längst ner
        ctx.fillStyle = 'black'
        ctx.font = '18px Arial'
        ctx.fillText('Use Arrow Keys to navigate, Enter to select', this.game.width / 2, this.game.height - 50)
        
        ctx.restore()
    }
}
